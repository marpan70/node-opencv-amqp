var cv = require('opencv');
var fs = require('fs');

var Faces = function (faces, data) {
    this._faces = faces;
    this._data = data
};

  cv.readImage('/tmp/in.jpg', function(err, im){
    console.log("Message received detect faces..:");

    im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
      console.log(faces);
      if(typeof faces != 'undefined' && faces) {
        var faces = new Faces(faces);

        for (var i=0;i<faces.length; i++){
          var x = faces[i]
          im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
        }
        im.save('/tmp/out.jpg');
      }
    });
  })

