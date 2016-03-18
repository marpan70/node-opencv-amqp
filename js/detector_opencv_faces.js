// Face detection example from opencv via nodejs and RabbitMQ

// TODO:
// opencv methods to read images via stream instead of files

var cv = require("opencv");
var amqp = require("amqp-ts");
var fs = require("fs");
var uuid = require("node-uuid");
var stream = require("stream");
var _ = require("underscore");

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
  console.log("image received: " + message.content.length);
  cv.readImage(message.content, function(err, im){
    im.detectObject(cv.FACE_CASCADE, {}, function(err, faces) {
      if(!_.isUndefined(faces) && faces.length>0) {
        detected_faces.send(
          new amqp.Message(
            new Faces(faces.length, faces, message.content.toString("base64"))));
      }
    });
  });
},{rawMessage: true, noAck: true})

// outline faces
queue_faces.activateConsumer((message) => {
  var faces = JSON.parse(message.content);
  cv.readImage(new Buffer(faces.data, "base64"), function(err, im) {
    console.log("detected "+faces.faces.length+" faces");

    for (var i=0; i<faces.faces.length; i++){
      var face = faces.faces[i];
      console.log(" - face["+(i+1)+"/"+faces.faces.length+"].("+face.x+","+face.y+")");
      im.ellipse(face.x + face.width/2, face.y + face.height/2, face.width/2+2, face.height/2+2);
    }
    outlined_faces.send(
      new amqp.Message(
        new Faces(faces.count, faces.faces, im_2.toBuffer().toString("base64"))));
  });

},{rawMessage: true, noAck: true})

// write outline faces
queue_outlined_faces.activateConsumer((message) => {
  var face = JSON.parse(message.content);
  fs.writeFileSync("out/"+face.uuid+".jpg",
    new Buffer(face.data, "base64"), "binary");
},{rawMessage: true, noAck: true})

// after 10 seconds close the connection
// setTimeout(function() {
//   connection.close();
// }, 10000);
