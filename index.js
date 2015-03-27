var fs = require('fs');

var express = require('express');
var WebSocketServer = require('ws').Server;

var appLogic = require('./appLogic');
var WSContext = require('./context');

var app = express();
var http = require('http').Server(app);
var wss = new WebSocketServer({server: app});

app.get('/', function(req, res){
    res.send(fs.readFileSync('src/landing.html').toString());
});



wss.on('connection', function connection(ws) {
    var ctx = new WSContext(ws);
    appLogic.bind(ctx);
    ctx.send('welcome', null);
});

var port = process.env.PORT || 3000;
http.listen(port, function(){
    console.log('listening on *:' + port);
});
