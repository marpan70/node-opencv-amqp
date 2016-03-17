var cv = require('opencv');
var amqp = require('amqp-ts');
var fs = require('fs');

// 192.168.99.100:32779
// https://github.com/peterbraden/node-opencv
// https://github.com/abreits/amqp-ts

var connection = new amqp.Connection(process.env.RABBITMQ_HOST);
var images = connection.declareExchange(process.env.RABBITMQ_EXCHANGE, process.env.RABBITMQ_EXCHANGE_TYPE);
var faces = connection.declareExchange('faces', process.env.RABBITMQ_EXCHANGE_TYPE);
var opencv = connection.declareQueue(process.env.RABBITMQ_QUEUE);

opencv.bind(images);
opencv.activateConsumer((message) => {
  console.log("Message received: " + message.content.length);
  fs.writeFile('/tmp/in.jpg', message.content, 'binary');

  // read image from rmq
  cv.readImage('/tmp/in.jpg', function(err, im){
    im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
      for (var i=0;i<faces.length; i++){
        var x = faces[i]
        im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
      }

      // write image to rmq
      im.save('/tmp/out.jpg');

      fs.readFile('/tmp/out.jpg', function read(err, data) {
        var message = new amqp.Message(data);
        faces.send(message);
      });

    });
  })

},{rawMessage: true, noAck: true})

// after half a second close the connection
setTimeout(function() {
  connection.close();
}, 1000);
