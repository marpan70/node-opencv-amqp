var cv = require('opencv');
var amqp = require('amqp-ts');
var fs = require('fs');

var Faces = function (count, faces, data) {
    this._count = count
    this._faces = faces;
    this._data = data
};


// https://github.com/peterbraden/node-opencv
// https://github.com/abreits/amqp-ts

var connection = new amqp.Connection(process.env.RABBITMQ_HOST);
var images = connection.declareExchange(process.env.RABBITMQ_EXCHANGE_IMAGES, process.env.RABBITMQ_EXCHANGE_TYPE);
var queue_images = connection.declareQueue(process.env.RABBITMQ_QUEUE);

var detected_faces = connection.declareExchange(process.env.RABBITMQ_EXCHANGE_FACES, process.env.RABBITMQ_EXCHANGE_TYPE);
var queue_faces = connection.declareQueue('opencv.person_detector');

queue_images.bind(images);
queue_images.activateConsumer((message) => {
  console.log("Message received: " + message.content.length);
  // fs.writeFile('/tmp/in.jpg', message.content, 'binary');

  // read image from rmq
  cv.readImage('/tmp/in.jpg', function(err, im){
    console.log("Message received detect faces..");

    im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
      console.log(faces);
      if(typeof faces != 'undefined' && faces) {
        var facesObject = new Faces(faces.length, faces, message.content.toString('base64'));
        detected_faces.send(new amqp.Message(facesObject));
      }
    });
  })

},{rawMessage: true, noAck: true})

queue_faces.bind(detected_faces);
queue_faces.activateConsumer((message) => {
  console.log("faces received: " + message.content.length);
  var facesObject = Object.create(Faces, message.getContent());
  console.log("faces received: " +  facesObject._count);
  if(typeof faces != 'undefined' && faces) {
    fs.writeFile('/tmp/in.jpg', message.content, 'binary');

    for (var i=0;i<faces.length; i++){
      var x = faces[i]
      im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
    }
    im.save('/tmp/out.jpg');
    fs.readFile('/tmp/out.jpg', function read(err, data) {
      var facesObject = new Faces(faces.length, faces, message.content.toString('base64'));
      detected_faces.send(new amqp.Message(facesObject));
    });
  }

},{rawMessage: true, noAck: true})


// after half a second close the connection
setTimeout(function() {
  connection.close();
}, 10000);
