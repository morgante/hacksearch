var request = require('request'),
	async = require('async'),
	fbg = require('fbgraph');

var Sample = require('../models/sample'),
	pkg = require('../package.json');

var filters = {
	// race: require('../filters/race').filter,
	popularity: require('../filters/popularity').filter,
	random: require('../filters/random').filter,
	scene: require('../filters/scene').filter,
	angry: require('../filters/anger').filter,
	hotness: require('../filters/hotness').filter
};

// this is for testing ONLY
fbg.setAccessToken('');

function doFilters(id, requirements, callback) {
	var data = {
		id: id
	};

	var needs = {
		image: false,
		posts: false
	};

	if (requirements.race) {
		needs.image = true;
	}

	if (requirements.popularity || requirements.angry) {
		needs.posts = true;
	}

	// check through filters
	async.waterfall([
		// random
		function(cb) {
			if (requirements.random) {
				filters.random(function(err, rand) {
					if (rand > requirements.random) {
						cb(null);
					} else {
						cb('rand');
					}
				});
			} else {
				cb(null); //continue
			}
		},
		// get basic profile info
		function(cb) {
			var fields = ["name"];

			// just always get this
			fields.push("picture");

			if (needs.posts) {
				fields.push("statuses"); // statuses.limit(10).fields(likes.limit(500))
			}

			fbg.get("/" + data.id, {"fields": fields.join(",")}, function(err, res) {
				if(err) {
					cb("basics");
				} else {
					data.profile = res;
					data.photo_url = data.profile.picture.data.url;
					if (needs.posts) {
						if (res.statuses) {
							data.posts = res.statuses.data;
							cb(null);
						} else {
							cb("posts");
						}
					} else {
						cb(null);
					}
				}
			});
		},
		// HOT, or NOT
		function(cb) {
			if(requirements.hotness) {
				fbg.get("/" + data.id + "/photos?fields=likes.limit(500)&limit=10", function(err, res) {
					data.photos = res.data;
					filters.hotness(data, function(err, rating) {
						console.log('hottt', rating, requirements.hotness, data.profile);
						if (err || rating < requirements.hotness.$gt) {
							cb("hotness");
						} else {
							cb(null);
						}
					});
				});
			} else {
				cb(null);
			}
		},
		// get image binary, if necessary
		function(cb) {
			if (needs.image) {
				if (data.profile.picture.data.is_silhouette) {
					// fail already
					cb('silhouette');
				} else {
					request(data.profile.picture.data.url, function (error, response, body) {
						if (error) {
							cb('image');
						} else {
							data.picture = body;
							cb(null);
						}
					});
				}
			} else {
				cb(null);
			}
		},
		// are they angry?
		function(cb) {
			// console.log(requirements);
			if (requirements.angry != undefined) {
				filters.angry(data, function(err, anger) {
					console.log('angry', anger);
					if(err || (anger != requirements.angry)) {
						cb("anger");
					} else {
						cb(null);
					}
				});
			} else {
				cb(null);
			}
		},
		// do the racial bullshit
		function(cb) {
			if (requirements.race) {
				filters.race(data.picture, function(err, race) {
					if (err) {
						cb('race');
					} else {
						if (race == requirements.race) {
							cb(null);
						} else {
							cb('race');
						}
					}
				});
			} else {
				cb(null);
			}
		},
		// do popularity analysis
		function(cb) {
			if (requirements.popularity) {
				filters.popularity(data, function(err, popularity) {
					if ((requirements.popularity.$gt && (popularity <= requirements.popularity.$gt)) ||
						requirements.popularity.$lt && (popularity >= requirements.popularity.$lt)) {
						// console.log('sdds', popularity);
						cb('popularity');
					} else {
						console.log('show', data.profile.name, requirements.popularity, popularity);
						cb(null);
					}
				});
			} else {
				cb(null);
			}
		},
		// do scene analysis
		function(cb) {
			if (requirements.scene) {
				// console.log(data);
				filters.scene(data.photo_url, function(err, scene) {
					if (err) {
						cb('scene');
					} else if(scene != requirements.scene) {
						cb('scene');
					} else {
						cb(null);
					}
				});
			} else {
				cb(null);
			}
		},
	], function (err) {
		if (err) {
			callback(null, false);
		} else {
			callback(null, true);
		}
	});
}

exports.filterFriends = function(req, res) {
	var friends = req.body.people;
	var requirements = req.body.filters;

	var data = {
		me: {}
	};

	// requirements = {
		// "hotness": {"$gt": 10}
	// }

	if (requirements == undefined) {
		res.send({"people": friends});
	} else {
		// this async handles preprocessing, if neceessary
		async.parallel([
			function(cb) {
				if (!requirements.popularity) {
					cb(null);
				} else if (requirements.popularity.$gt == "me" || requirements.popularity.$lt == "me") {
					if (data.me.posts == null) {
						fbg.get("/me?fields=statuses.limit(10).fields(likes.limit(500))", function(err, res) {
							if(err || !res.statuses) {
								cb(err);
							} else {
								data.me.posts = res.statuses.data;
								filters.popularity(data.me, function(err, pop) {
									if (requirements.popularity.$gt == "me") {
										requirements.popularity.$gt = pop;
									}
									if (requirements.popularity.$lt == "me") {
										requirements.popularity.$lt = pop;
									}
								});
								cb(null);
							}
						});
					}
				} else {
					cb(null);
				}
			}
		], function(err) {
			if(err) {
				console.log('errror!', err);
				res.send({"people": []});
			} else {
				async.filter(friends, function(id, cb) {
					doFilters(id, requirements, function(err, okay) {
						cb(okay);
					});
				}, function(friends) {
					res.send({
						"people": friends
					});
				});
			}
		});
	}
};

// exports.filterFriends();

exports.index = function( req, res ) {
	
	Sample.create({ "first": "Bob", "last": "Sam"}, function( err, smpl ) {
		console.log( smpl.getName() );
	});
	
	res.render("index", {
		project: pkg.name
	});
};