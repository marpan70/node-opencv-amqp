# node-opencv-amqp
![mona_lisa_detected_face](https://raw.githubusercontent.com/marpan70/node-opencv-amqp/master/images/mona_lisa_detected_face.jpg)
![multi_1](https://raw.githubusercontent.com/marpan70/node-opencv-amqp/master/images/71ee3113-6417-4bb7-9bd3-91ce073c75e5.jpg)
![multi_2](https://raw.githubusercontent.com/marpan70/node-opencv-amqp/master/images/5c773a2e-6331-4707-bb7a-e17fb0a2ea4f.jpg)

## TO TEST
Start the container in interactive mode
```
docker run -ti \
  --name node-opencv-amqp  \
  --add-host="rabbitmq:192.168.178.21" \
  -e "RABBITMQ_HOST=amqp://rabbitmq:5673" \
  --entrypoint bash \
  -v /Users/marcel/projects/node-opencv-amqp:/data martin72/node-opencv-amqp
```
Insert a few images in exchange 'images' in rabbitmq
```
cat /node_modules/opencv/examples/coffeescript/images/mona.png | amqp-publish -u $RABBITMQ_HOST -e images
wget -qO- http://weknowyourdreamz.com/images/people/people-05.jpg | amqp-publish -u amqp://192.168.178.21:5673 -e images
```
And do the face-detection in OpenCV via nodejs
```
node js/detector_opencv_faces.js
```
The out/ folder will contain the detected faces
