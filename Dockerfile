FROM siomiz/node-opencv

RUN apt-get install -y vim
RUN npm install amqp-ts opencv
ADD file.js /file.js

CMD bash
