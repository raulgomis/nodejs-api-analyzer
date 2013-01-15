var express = require('express');
var app = express();	
var sys = require("sys");
   

app.get('/', function(req, res){
	res.send('Testing Express & Node js');
});

app.get('/sayHello/:name', function(req, res){
	res.send('Hello '+ req.params.name);
});


app.listen(8090);

sys.puts("Server Running on 8090");   
	
	
	