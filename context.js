var EventEmitter = require('events').EventEmitter;


var counter = 0;

function WSContext(socket) {
	this.id = counter++;
    this.socket = socket;
    var emitter = this.emitter = new EventEmitter();

    this.on = emitter.on.bind(emitter);
    this.off = emitter.off.bind(emitter);
    this.once = emitter.once.bind(emitter);

    this.data = {};
}

WSContext.prototype.send = function(type, data) {
    this.socket.send(JSON.stringify({
        type: type,
        body: data,
    }));
};

WSContext.prototype.bindConnection = function(connection) {
    connection.on('message', function(message) {
        var data = JSON.parse(message);
        this.emitter.emit(data.type, data.body);
    }.bind(this));
};

WSContext.prototype.set = function(key, value) {
    this.data[key] = value;
};

WSContext.prototype.clear = function(key) {
    delete this.data[key];
};

WSContext.prototype.get = function(key, default_) {
    return this.data[key] || default_ || null;
};


WSContext.prototype.me = function() {
    return {
    	id: this.id,
    	chatHead: this.get('profile-pic'),
    };
};


module.exports = WSContext;
