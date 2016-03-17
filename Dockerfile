FROM siomiz/node-opencv

RUN apt-get install -y vim amqp-tools telnet
RUN npm install amqp-ts opencv

RUN useradd -ms /bin/bash node
USER node
WORKDIR /home/node/projects/opencv/detector

ADD detector_opencv_faces.js detector_opencv_faces.js

ENV RABBITMQ_HOST=amqp://rabbitmq:5672
ENV RABBITMQ_EXCHANGE_IMAGES=images
ENV RABBITMQ_EXCHANGE_FACES=faces
ENV RABBITMQ_EXCHANGE_TYPE=fanout
ENV RABBITMQ_QUEUE=opencv.face_detector

CMD node detector_opencv_faces.js
