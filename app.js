
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();
var mongoose = require("mongoose");
//mongoose.connect("mongodb://analyzer:analyzer@ds047447.mongolab.com:47447/analyzer");
var db = mongoose.connection;

// Config
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

// Esquema
var schema = mongoose.Schema({ 
	date: { type: Date, default: Date.now },
	username: String, 
	exception: String,
	stacktrace: String 
});

var CrashData = mongoose.model('CrashData', schema);

// WS
app.configure('development', function(){
  app.use(express.errorHandler());
});

// Save crash
app.get('/saveCrashLog', function(req, res){
	var username = req.param('username', null);
	var exception = req.param('exception', null);
	var stacktrace = req.param('stacktrace', null);
	
	res.send('Crash detected! '+ username);
	
	
	var crashLog = new CrashData({ 
		username: username, 
		exception: exception,
		stacktrace: stacktrace
		});
		
	crashLog.save(function (err) {
	  	if (err) {
			console.log('Error...');
		}
		else {
	  		console.log('Crash saved for user: '+username);
		}
	});
	
});

// List all crashes
app.get('/listCrashLog', function(req, res){
	var username = req.param('username', null);
	
	//TODO
	//res.send("[{'username':'pepe'}]");
	
	res.send(
		"['listado':[{'date':'dsadasdas', 'username':'asdasda','stacktrace':'asdasda','exception':'dasdasdas'},{'date':'dsadasdas', 'username':'asdasda', 'stacktrace':'asdasda', 'exception':'dasdasdas'}]]"
	);
});

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
