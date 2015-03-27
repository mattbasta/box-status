var EventEmitter = require('events').EventEmitter;


var counter = 0;

function WSContext(socket) {
    this.id = counter++;
    this.socket = socket;
    var emitter = this.emitter = new EventEmitter();

    this.on = emitter.on.bind(emitter);

    this.data = {};

    this.socket.on('close', function() {
        emitter.emit('close');
    });

    this.socket.on('message', function(message) {
        var data = JSON.parse(message);
        this.emitter.emit(data.type, data.body);
    }.bind(this));
}

WSContext.prototype.send = function(type, data) {
    try {
        this.socket.send(JSON.stringify({
            type: type,
            body: data,
        }));
    } catch(e) {
    }
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
        name: this.get('user-name'),
        userId: this.get('user-id')
    };
};


module.exports = WSContext;
