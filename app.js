
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');


//PARSE.COM  
var Parse = require('node-parse-api').Parse;
var APP_ID = "pmXQaDdUzrR9TU3q8apjnb2dJ85oWuIPFZ85bOe3";
var MASTER_KEY = "coac3nOJxB9I4DnXQn0CtmBP9ciNgcKXiNSI0aDc";
var parse = new Parse(APP_ID, MASTER_KEY);
  
var app = express();
var mongoose = require("mongoose");
mongoose.connect("mongodb://analyzer:analyzer@ds047447.mongolab.com:47447/analyzer");
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
			//mensaje push
		}
	});
});

app.get('/parse', function(req, res){
	
	parse.findMany('Todo', {order:5}, function (err, response) {
	  res.send(response);
	});

});

// List all crashes
app.get('/listCrashLog', function(req, res){
	var username = req.param('username', null);
	var datenow = new Date();
	CrashData.find().limit(100).execFind(function (arr,data) {
		res.send(data);
	});
});

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
