var cv = require('opencv');
var amqp = require('amqp-ts');
var fs = require('fs');

var Faces = function (count, faces, data) {
    this.count = count
    this.faces = faces;
    this.data = data
};


// https://github.com/peterbraden/node-opencv
// https://github.com/abreits/amqp-ts

var connection = new amqp.Connection(process.env.RABBITMQ_HOST);

var images = connection.declareExchange(process.env.RABBITMQ_EXCHANGE_IMAGES, process.env.RABBITMQ_EXCHANGE_TYPE);
var queue_images = connection.declareQueue(process.env.RABBITMQ_QUEUE_IMAGES);
queue_images.bind(images);

var detected_faces = connection.declareExchange(process.env.RABBITMQ_EXCHANGE_FACES, process.env.RABBITMQ_EXCHANGE_TYPE);
var queue_faces = connection.declareQueue(process.env.RABBITMQ_QUEUE_FACES);
queue_faces.bind(detected_faces);

var outlined_faces = connection.declareExchange(process.env.RABBITMQ_EXCHANGE_FACES_OUTLINED, process.env.RABBITMQ_EXCHANGE_TYPE);
var queue_outlined_faces = connection.declareQueue(process.env.RABBITMQ_QUEUE_FACES_OUTLINED);
queue_outlined_faces.bind(outlined_faces)

// detect faces
queue_images.activateConsumer((message) => {
  console.log("Message received: " + message.content.length);
  // fs.unlinkSync('/tmp/in.jpg');
  fs.writeFileSync('/tmp/in.jpg', message.content, 'binary');

  cv.readImage('/tmp/in.jpg', function(err, im){
    console.log("Message "+im+" received detect faces..");
    im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
      if(typeof faces != 'undefined' && faces) {
        var facesObject = new Faces(faces.length, faces, message.content.toString('base64'));
        detected_faces.send(new amqp.Message(facesObject));
      }
    });
  })

},{rawMessage: true, noAck: true})

// outline faces
queue_faces.activateConsumer((message) => {
  var facesObject = JSON.parse(message.content);
  if(typeof facesObject != 'undefined' && facesObject) {
    console.log(facesObject.count);
    // fs.unlinkSync('/tmp/in_2.jpg');
    fs.writeFileSync('/tmp/in_2.jpg', new Buffer(facesObject.data, 'base64'), 'binary');

    cv.readImage('/tmp/in_2.jpg', function(err, im_2){
      im_2.save('/tmp/x_2.jpg');

      for (var i=0;i<facesObject.faces; i++){
        var x = facesObject.faces[i]
        im_2.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
      }
      im_2.save('/tmp/out_2.jpg');
    });
    fs.readFile('/tmp/out_2.jpg', function read(err, data) {
      var outlined = new Faces(facesObject.count, facesObject.faces, data.toString('base64'));
      outlined_faces.send(new amqp.Message(outlined));
    });

  }

},{rawMessage: true, noAck: true})


// after half a second close the connection
setTimeout(function() {
  connection.close();
}, 10000);
