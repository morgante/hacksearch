// this filter analyzes an image and determines its race
try {
var cv = require("opencv"),
    im = require("easyimage"),
    gm = require("gm");
}
catch (err) {
    console.log("opencv not defined");
};

// takes an image url as first argument
function get_race(face, callback){
  var img_avg = gm(face).blur(50).threshold(70);
  img_avg.toBuffer(function(err, buffer){
    cv.readImage(buffer, function(err, src_img){
      var is_white = (src_img.get(50,50) == 0) ? 0 : 1;
      callback(is_white);
    })
  });
}

// take an image buffer as first argument
exports.filter = function(photo, callback){
  var err = null;
  cv.readImage(photo, function(err, src_img){
    src_img.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
      var j = 0, c = 0;
      function on_finish(){
        var sum = faces.reduce(function(a, b) {return a+b});
        var avg = sum / faces.length;
	var race = (avg >= .5) ? "black" : "white";
        callback(err, race);
      };

      var counter = function(val){
        faces[c] = val;
	if (c == (faces.length-1)){on_finish()};
	c++};

      for (var i=0;i<faces.length; i++){
        var face = faces[i];
        var ratio = 100/face.height;
        dst_file = "./out"+j+".jpg";
        im.rescrop({src: photo,
		    dst: dst_file,
		    width: parseInt(src_img.width()*ratio),
		    height: parseInt(src_img.height()*ratio),
		    cropwidth: parseInt(face.width*ratio),
		    cropheight: parseInt(face.height*ratio),
		    gravity: "NorthWest",
		    x: parseInt(face.x*ratio), y: parseInt(face.y*ratio)});        
        j++;
	get_race(dst_file,counter);
      }
    })
  })
};
