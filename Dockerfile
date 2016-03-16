FROM siomiz/node-opencv

RUN apt-get install -y vim
RUN npm install amqp-ts opencv

WORKDIR /projects/opencv/detector

ADD detector_opencv_faces.js detector_opencv_faces.js

ENV RABBITMQ_HOST=amqp://rabbitmq:5672
ENV RABBITMQ_EXCHANGE=images
ENV RABBITMQ_EXCHANGE_TYPE=fanout
ENV RABBITMQ_QUEUE=faces

CMD node detector_opencv_faces.js
