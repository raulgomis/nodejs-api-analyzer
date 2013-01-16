
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var uuid = require('node-uuid');

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
	applicationId: String, 
	exception: String,
	stacktrace: String 
});

var CrashData = mongoose.model('CrashData', schema);

var schemaApp = mongoose.Schema({ 
	applicationId: String,
	name: String,
	date: { type: Date, default: Date.now }
});
var Application = mongoose.model('Application', schemaApp);


// WS
app.configure('development', function(){
  app.use(express.errorHandler());
});

// Save crash
app.get('/saveCrashLog', function(req, res){
	var applicationId = req.param('applicationId', null);
	var exception = req.param('exception', null);
	var stacktrace = req.param('stacktrace', null);
	
	

	var crashLog = new CrashData({ 
		applicationId: applicationId, 
		exception: exception,
		stacktrace: stacktrace
		});
		
	crashLog.save(function (err) {
		if (err) {
			console.log('Error...');
		}
		else {
			console.log('Crash saved for applicationId: '+applicationId);
			//mensaje push
			
			 var channel = "";
			 var alert = exception;
			 var sound = "cheering.caf";
			 var badge = "Increment";
			 var title = "You have an error!"
			 
			 //var result = sendPushNotification(channel, alert, sound, badge, title);
			 
			//console.log('Notification sent: '+result);
		}
	});
	
	res.send('Crash detected! '+ applicationId);
});

app.get('/parse', function(req, res){
		
	parse.findMany('Todo', {order:5}, function (err, response) {
	  res.send(response);
	});

});

// List all crashes
app.get('/listCrashLog/:applicationId', function(req, res){
	var applicationId = req.param('applicationId', null);
	var datenow = new Date();
	CrashData.find({applicationId:applicationId}).limit(100).execFind(function (arr,data) {
		res.send(data);
	});
});

// List all apps
app.get('/listApplications/:username', function(req, res){
	var username = req.param('username', null);
	var datenow = new Date();
	Application.find().limit(100).execFind(function (arr,data) {
		res.send(data);
	});
});

app.get('/createApplication', function(req, res){

	var name = req.param('name', null);
	
	var applicationId = uuid.v1();

	var newApp = new Application({ 
		applicationId: applicationId, 
		name: name
		});
		
	newApp.save(function (err) {
		if (err) {
			console.log('Error...');
		}
		else {
			res.send('New app created '+name+'. ApplicationId: '+ applicationId);
		}
	});
	
});

function buildPushNotification(channel, alert, sound, badge, title) {
	var json = '{"channels": ["'+channel+'"],"data": {"alert": "'+alert+'","badge": "'+badge+'","sound": "'+sound+'","title":  "'+title+'"}}'
	return json
}

function sendPushNotification(channel, alert, sound, badge, title) {

	var ret = false;
	
	 var json = buildPushNotification(channel, alert, sound, badge, title);
	 
	parse.sendPushNotification(json,function (err, response) {
	  if(response.result == true){
		ret = true;
	  }
	});
	
	return ret;
}

app.get('/', routes.index);
app.get('/users', user.list);


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

/*
app.get('/sendpush',function(req,res){

	 var channel = "";
	 var alert = "Hey!! you!!!";
	 var sound = "cheering.caf";
	 var badge = "Increment";
	 var title = "Mets Score!"
	 
	 var json = buildPushNotification(channel, alert, sound, badge, title);
	 
	parse.sendPushNotification(json,function (err, response) {
	  res.send(response);
	});

});
*/












