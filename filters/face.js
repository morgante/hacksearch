var cv = require("opencv"),
    im = require("easyimage"),
    gm = require("gm");
    //touch = require("touch");


test_path = "./test2.jpg";

function race(img_path,callback){
  var img_avg = gm(img_path).blur(50).threshold(70);
  img_avg.toBuffer(function(err, buffer){
    cv.readImage(buffer, function(err, src_img){
      var is_white = (src_img.get(50,50) == 0) ? 0 : 1;
      callback(is_white);
    })
  });
}

function face_filter(img_path,which_filter,callback){
  cv.readImage(img_path, function(err, src_img){
    src_img.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
      var j = 0, c = 0;

      function on_finish(){
        var sum = faces.reduce(function(a, b) {return a+b});
        var avg = sum / faces.length;
        var pass_filter = (avg >= .5);
        callback(pass_filter);
      };

      var counter = function(val){
        faces[c] = val;
	if (c == (faces.length-1)){on_finish()};
	c++};

      for (var i=0;i<faces.length; i++){
        var face = faces[i];
        var ratio = 100/face.height;
        dst_file = "./out"+j+".jpg";
	//touch(dst_file);
        im.rescrop({src: img_path,
		    dst: dst_file,
		    width: parseInt(src_img.width()*ratio),
		    height: parseInt(src_img.height()*ratio),
		    cropwidth: parseInt(face.width*ratio),
		    cropheight: parseInt(face.height*ratio),
		    gravity: "NorthWest",
		    x: parseInt(face.x*ratio), y: parseInt(face.y*ratio)});        
        j++;
	which_filter(dst_file,counter);
      }
    })
  })
};

function the_function(thing) {
    console.log("is white?");
    console.log(thing);
}

// for race ish
face_filter(test_path, race, the_function);