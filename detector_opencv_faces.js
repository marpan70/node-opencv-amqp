// Face detection example from opencv via nodejs and RabbitMQ

// TODO:
// opencv methods to read images via stream instead of files

var cv = require('opencv');
var amqp = require('amqp-ts');
var fs = require('fs');
var uuid = require('node-uuid');

var Faces = function (count, faces, data) {
    this.uuid = uuid.v4();
    this.count = count
    this.faces = faces;
    this.data = data
};

// https://github.com/peterbraden/node-opencv
// https://github.com/abreits/amqp-ts

var connection = new amqp.Connection(process.env.RABBITMQ_HOST);

// exchange and queue for images
var images = connection.declareExchange(process.env.RABBITMQ_EXCHANGE_IMAGES, process.env.RABBITMQ_EXCHANGE_TYPE);
var queue_images = connection.declareQueue(process.env.RABBITMQ_QUEUE_IMAGES);
queue_images.bind(images);

// exchange and queue for detected faces
var detected_faces = connection.declareExchange(process.env.RABBITMQ_EXCHANGE_FACES, process.env.RABBITMQ_EXCHANGE_TYPE);
var queue_faces = connection.declareQueue(process.env.RABBITMQ_QUEUE_FACES);
queue_faces.bind(detected_faces);

// exchange and queue for outline of detected faces
var outlined_faces = connection.declareExchange(process.env.RABBITMQ_EXCHANGE_FACES_OUTLINED, process.env.RABBITMQ_EXCHANGE_TYPE);
var queue_outlined_faces = connection.declareQueue(process.env.RABBITMQ_QUEUE_FACES_OUTLINED);
queue_outlined_faces.bind(outlined_faces)

// detect faces
queue_images.activateConsumer((message) => {
  console.log("Message received: " + message.content.length);
  fs.writeFileSync('/tmp/in.jpg', message.content, 'binary');

  cv.readImage('/tmp/in.jpg', function(err, im){
    console.log("Message "+im+" received detect faces..");
    im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
      if(typeof faces != 'undefined' && faces) {
        detected_faces.send(
          new amqp.Message(
            new Faces(faces.length, faces, message.content.toString('base64'))));
      }
    });
  })

},{rawMessage: true, noAck: true})

// outline faces
queue_faces.activateConsumer((message) => {
  var facesObject = JSON.parse(message.content);
  fs.writeFileSync('/tmp/in_2.jpg',
    new Buffer(facesObject.data, 'base64'), 'binary');

  cv.readImage('/tmp/in_2.jpg', function(err, im_2){
    im_2.save('/tmp/x_2.jpg');

    for (var i=0;i<facesObject.faces; i++){
      var x = facesObject.faces[i]
      im_2.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
    }
    im_2.save('/tmp/out_2.jpg');
  });

  fs.readFile('/tmp/out_2.jpg', function read(err, data) {
    outlined_faces.send(
      new amqp.Message(
        new Faces(facesObject.count, facesObject.faces, data.toString('base64'));));
  });

},{rawMessage: true, noAck: true})

// write outline faces
queue_outlined_faces.activateConsumer((message) => {
  var facesObject = JSON.parse(message.content);
  fs.writeFileSync("out/"+facesObject.uuid+".jpg",
    new Buffer(facesObject.data, 'base64'), 'binary');
},{rawMessage: true, noAck: true})

// after half a second close the connection
setTimeout(function() {
  connection.close();
}, 10000);
