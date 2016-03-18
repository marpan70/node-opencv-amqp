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
The out/ folder will contain the detected faces.

In RabbitMQ the 'faces' exchange contains a json representation of:
 - the number of found images
 - where they are in the image and
 - the original image
```
{  
   "uuid":"00ed5761-c0c6-43de-97f9-b4e35405a527",
   "count":8,
   "faces":[{  
         "x":1115,
         "y":461,
         "width":49,
         "height":49
      },{  
         "x":871,
         "y":677,
         "width":144,
         "height":144
      },{  
         "x":692,
         "y":719,
         "width":138,
         "height":138
      },{  
         "x":698,
         "y":356,
         "width":139,
         "height":139
      },{  
         "x":1026,
         "y":673,
         "width":149,
         "height":149
      },{  
         "x":1376,
         "y":447,
         "width":146,
         "height":146
      },{  
         "x":619,
         "y":526,
         "width":140,
         "height":140
      },{  
         "x":1158,
         "y":551,
         "width":149,
         "height":149
      }
   ],
   "data":"/9j/4AAQSkZJRgABAQEASABIAAD/4R24RXhpZgAATU0AKgAAAAgAEgEA.."
]}
```

```
debug> var _ = require("underscore");
debug> _.functions(cv);
[ 'CascadeClassifier',
  'Contours',
  'ImageDataStream',
  'ImageStream',
  'Matrix',
  'NamedWindow',
  'ObjectDetectionStream',
  'Point',
  'TrackedObject',
  'VideoCapture',
  'VideoStream',
  'readImage' ]

  console.log("im: " + JSON.stringify(_.functions(im)));

  im:[  
     "absDiff",
     "adaptiveThreshold",
     "addWeighted",
     "adjustROI",
     "bilateralFilter",
     "bitwiseAnd",
     "bitwiseNot",
     "bitwiseXor",
     "brightness",
     "canny",
     "channels",
     "clone",
     "col",
     "convertGrayscale",
     "convertHSVscale",
     "convertTo",
     "copy",
     "copyTo",
     "copyWithMask",
     "countNonZero",
     "crop",
     "crop",
     "cvtColor",
     "detectObject",
     "dilate",
     "drawAllContours",
     "drawContour",
     "ellipse",
     "empty",
     "equalizeHist",
     "erode",
     "fillPoly",
     "findContours",
     "flip",
     "floodFill",
     "gaussianBlur",
     "get",
     "getData",
     "getPerspectiveTransform",
     "goodFeaturesToTrack",
     "height",
     "houghCircles",
     "houghLinesP",
     "inRange",
     "inspect",
     "line",
     "locateROI",
     "matchTemplate",
     "meanStdDev",
     "meanWithMask",
     "medianBlur",
     "merge",
     "minMaxLoc",
     "norm",
     "normalize",
     "pixel",
     "pixelCol",
     "pixelRow",
     "ptr",
     "pushBack",
     "put",
     "putText",
     "pyrDown",
     "pyrUp",
     "rectangle",
     "release",
     "reshape",
     "resize",
     "roi",
     "rotate",
     "row",
     "save",
     "saveAsync",
     "set",
     "setWithMask",
     "shift",
     "size",
     "sobel",
     "split",
     "templateMatches",
     "threshold",
     "toBuffer",
     "toBufferAsync",
     "warpAffine",
     "warpPerspective",
     "width"
  ]
```
```
debug> console.log(Object.getOwnPropertyNames(cv).filter(function (p) { return typeof cv[p] === 'function'; }));
[ 'readImage',
  'Point',
  'Matrix',
  'CascadeClassifier',
  'VideoCapture',
  'Contours',
  'TrackedObject',
  'NamedWindow',
  'ImageStream',
  'ImageDataStream',
  'ObjectDetectionStream',
  'VideoStream' ]
  ```

  ```
debug> console.log(new cv.ImageStream());
Stream { writable: true }
debug> console.log(new cv.ImageDataStream());
Stream { data: Buffers { buffers: [], length: 0 }, writable: true }
debug> console.log(Object.getOwnPropertyNames(new cv.ImageStream()));
[ 'writable' ]
debug> console.log(Object.getOwnPropertyNames(new cv.ImageDataStream()));
[ 'data', 'writable' ]
```

```
debug> var cv = require("opencv");
debug> console.dir(cv)
{ version: '3.1',
  readImage: [Function: readImage],
  Point: [Function: Point],
  Matrix:
   { [Function: Matrix]
     Zeros: [Function: Zeros],
     Ones: [Function: Ones],
     Eye: [Function: Eye],
     getRotationMatrix2D: [Function: getRotationMatrix2D] },
  CascadeClassifier: [Function: CascadeClassifier],
  VideoCapture: [Function: VideoCapture],
  Contours: [Function: Contours],
  TrackedObject: [Function: TrackedObject],
  NamedWindow: [Function: NamedWindow],
  Constants:
   { CV_8U: 0,
     CV_8S: 1,
     CV_16U: 2,
     CV_16S: 3,
     CV_32S: 4,
     CV_32F: 5,
     CV_64F: 6,
     CV_USRTYPE1: 7,
     CV_8UC1: 0,
     CV_8UC2: 8,
     CV_8UC3: 16,
     CV_8UC4: 24,
     CV_8SC1: 1,
     CV_8SC2: 9,
     CV_8SC3: 17,
     CV_8SC4: 25,
     CV_16UC1: 2,
     CV_16UC2: 10,
     CV_16UC3: 18,
     CV_16UC4: 26,
     CV_16SC1: 3,
     CV_16SC2: 11,
     CV_16SC3: 19,
     CV_16SC4: 27,
     CV_32SC1: 4,
     CV_32SC2: 12,
     CV_32SC3: 20,
     CV_32SC4: 28,
     CV_32FC1: 5,
     CV_32FC2: 13,
     CV_32FC3: 21,
     CV_32FC4: 29,
     CV_64FC1: 6,
     CV_64FC2: 14,
     CV_64FC3: 22,
     CV_64FC4: 30,
     CV_PI: 3.141592653589793,
     CV_FILLED: -1,
     BORDER_DEFAULT: 4,
     BORDER_REPLICATE: 1,
     BORDER_REFLECT: 2,
     BORDER_REFLECT_101: 4,
     BORDER_WRAP: 3,
     BORDER_CONSTANT: 0,
     INTER_NEAREST: 0,
     INTER_LINEAR: 1,
     INTER_AREA: 3,
     INTER_CUBIC: 2,
     INTER_LANCZOS4: 4,
     NORM_MINMAX: 32,
     NORM_INF: 1,
     NORM_L1: 2,
     NORM_L2: 4,
     NORM_L2SQR: 5,
     NORM_HAMMING: 6,
     NORM_HAMMING2: 7,
     NORM_RELATIVE: 8,
     NORM_TYPE_MASK: 7 },
  calib3d:
   { findChessboardCorners: [Function: findChessboardCorners],
     drawChessboardCorners: [Function: drawChessboardCorners],
     calibrateCamera: [Function: calibrateCamera],
     solvePnP: [Function: solvePnP],
     getOptimalNewCameraMatrix: [Function: getOptimalNewCameraMatrix],
     stereoCalibrate: [Function: stereoCalibrate],
     stereoRectify: [Function: stereoRectify],
     computeCorrespondEpilines: [Function: computeCorrespondEpilines],
     reprojectImageTo3d: [Function: reprojectImageTo3d] },
  imgproc:
   { undistort: [Function: undistort],
     initUndistortRectifyMap: [Function: initUndistortRectifyMap],
     remap: [Function: remap],
     getStructuringElement: [Function: getStructuringElement] },
  ImageStream:
   { [Function]
     super_:
      { [Function: Stream]
        super_: [Object],
        Readable: [Object],
        Writable: [Object],
        Duplex: [Object],
        Transform: [Object],
        PassThrough: [Object],
        Stream: [Circular] } },
  ImageDataStream:
   { [Function]
     super_:
      { [Function: Stream]
        super_: [Object],
        Readable: [Object],
        Writable: [Object],
        Duplex: [Object],
        Transform: [Object],
        PassThrough: [Object],
        Stream: [Circular] } },
  ObjectDetectionStream:
   { [Function]
     super_:
      { [Function: Stream]
        super_: [Object],
        Readable: [Object],
        Writable: [Object],
        Duplex: [Object],
        Transform: [Object],
        PassThrough: [Object],
        Stream: [Circular] } },
  VideoStream:
   { [Function]
     super_:
      { [Function: Stream]
        super_: [Object],
        Readable: [Object],
        Writable: [Object],
        Duplex: [Object],
        Transform: [Object],
        PassThrough: [Object],
        Stream: [Circular] } },
  FACE_CASCADE: '/node_modules/opencv/data/haarcascade_frontalface_alt.xml',
  EYE_CASCADE: '/node_modules/opencv/data/haarcascade_eye.xml',
  EYEGLASSES_CASCADE: '/node_modules/opencv/data/haarcascade_eye_tree_eyeglasses.xml',
  FULLBODY_CASCADE: '/node_modules/opencv/data/haarcascade_fullbody.xml',
  CAR_SIDE_CASCADE: '/node_modules/opencv/data/hogcascade_cars_sideview.xml' }
```
