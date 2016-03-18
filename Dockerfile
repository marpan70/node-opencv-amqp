FROM siomiz/node-opencv

RUN apt-get install -y vim amqp-tools telnet
RUN npm install amqp-ts opencv npm node-uuid

RUN useradd -ms /bin/bash node
USER node
WORKDIR /home/node/projects/opencv/detector

ADD js js

# RabbitMQ settings
ENV RABBITMQ_HOST=amqp://rabbitmq:5672
ENV RABBITMQ_EXCHANGE_TYPE=fanout

# Exchange and queue to insert faces
ENV RABBITMQ_EXCHANGE_IMAGES=images
ENV RABBITMQ_QUEUE_IMAGES=opencv.images

# Exchange and queue for detected faces
ENV RABBITMQ_EXCHANGE_FACES=faces
ENV RABBITMQ_QUEUE_FACES=opencv.faces

# Exchange and queue for outline of detected faces
ENV RABBITMQ_EXCHANGE_FACES_OUTLINED=faces.outlined
ENV RABBITMQ_QUEUE_FACES_OUTLINED=opencv.faces.outlined

CMD node js/detector_opencv_faces.js
