// keep this for nko
require('nko')('vof3t9Mg456ieUb0');

var express = require('express')
		, http = require('http')
		, url = require('url')
		, async = require('async')
		, request = require('request')
		, mongoose = require('mongoose')
		, _ = require('./public/lib/underscore')
		
var pkg = require('./package.json')
		, main = require('./routes/main')
		, api = require('./routes/api')

// environment variable bullshit
var isProduction = (process.env.NODE_ENV === 'production');
var port = (isProduction ? 80 : 8000);

// set up Mongoose
mongoose.connect('localhost', pkg.name);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.log('Connected to DB');
});

var app = express();
// configure Express
app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.engine('ejs', require('ejs-locals'));

	app.use(express.logger());
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.session({ secret: process.env.SECRET }));
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

// set up routes
app.get('/', main.index);

// api
app.post('/api/filter/friends', api.filterFriends);

// start listening
app.listen( port, function(err) {
	if (err) { console.error(err); process.exit(-1); }

	// if run as root, downgrade to the owner of this file
	if (process.getuid() === 0) {
		require('fs').stat(__filename, function(err, stats) {
		  if (err) { return console.error(err); }
		  process.setuid(stats.uid);
		});
	}

	console.log('Server running at http://0.0.0.0:' + port + '/');
});