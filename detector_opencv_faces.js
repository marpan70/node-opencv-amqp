var cv = require('opencv');
var amqp = require('amqp-ts');

// 192.168.99.100:32779
// https://github.com/peterbraden/node-opencv
// https://github.com/abreits/amqp-ts

var connection = new amqp.Connection(proces.env.RABBITMQ_HOST);
var exchange = connection.declareExchange(proces.env.RABBITMQ_EXCHANGE, proces.env.RABBITMQ_EXCHANGE_TYPE);
var queue = connection.declareQueue(proces.env.RABBITMQ_QUEUE);

queue.bind(exchange);
queue.activateConsumer((message) => {
    console.log("Message received: " + message.getContent().length);

    // read image from rmq
    cv.readImage("/node_modules/opencv/examples/files/mona.png", function(err, im){
      im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
        for (var i=0;i<faces.length; i++){
          var x = faces[i]
          im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
        }

        // write image to rmq
        im.save('./out.jpg');

        // exchange.send(message);

      });
    })

},{rawMessage: true, noAck: true})

// after half a second close the connection
setTimeout(function() {
  connection.close();
}, 1000);
