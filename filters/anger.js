var request = require('request');

var url = "https://sentimentalanger.p.mashape.com/anger/current/classify_text/";
var api_key = "";

exports.filter = function(person, callback){
    var all_text = [];
    person.posts.forEach(function(post){
	    all_text.push(post.message);
    });

    request({
        url: url,
        "method": "POST",
        "headers": {
            "X-Mashape-Authorization": api_key
        },
        form: {
            lang: 'en',
            text: all_text.join(" ").slice(0,299),
            detectlang: ""
    }}, function(err, res, body) {
        if(err) {
            callback(err, null);
        } else {
            var data = JSON.parse(body);
            var anger = data.anger_label;

            if (data.anger_value > -0.2) {
                callback(null, 'true'); // angry
            } else {
                callback(null, 'false'); // not angry
            }
        }
    });
};
