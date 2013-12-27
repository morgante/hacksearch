// scene api
var url = "http://rekognition.com/func/api"
var api_key = "";
var api_secret = "";

var request = require('request');

exports.filter = function(photo, callback){
    thURL = url + "?api_key=" + api_key + "&api_secret=" + api_secret + "&jobs=scene&urls=" + photo;

    request(thURL, function(err, res, body) {
    	var data = JSON.parse(body);
    	var scene = data.scene_understanding[0];
	    if (scene.score > .3){
			callback(null, scene.label)
	    }
	    else {
			callback("unconfident");
	    };
    });
};
