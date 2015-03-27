var fs = require('fs');

var WebSocketServer = require('ws').Server;

var appLogic = require('./appLogic');
var WSContext = require('./context');

var app = require('express')();
var http = require('http').createServer(app);
var wss = new WebSocketServer({server: http});



wss.on('connection', function connection(ws) {
    var ctx = new WSContext(ws);
    appLogic.bind(ctx);
    ctx.send('welcome', null);
});

var port = process.env.PORT || 3000;
http.listen(port);
console.log('listening on *:' + port);
