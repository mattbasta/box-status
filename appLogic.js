
var fileSubscribers = {}; // fileId => ctx[]
var fileViewers = {}; // fileId => ctx[]


function broadcastToSubscribersOfFile(fileId, type, body) {
	if (!(fileId in fileSubscribers)) return;

	fileSubscribers.forEach(function(ctx) {
		ctx.send(type, body);
	});
}

function subscribeToRoom(fileId, ctx) {
	fileSubscribers[fileId] = fileSubscribers[fileId] || [];
	fileSubscribers[fileId].push(ctx);
}

function unsubscribeFromRoom(fileId, ctx) {
	if (!(fileId in fileSubscribers)) return;

	var room = fileSubscribers[fileId];
	for (var i = 0; i < room.length; i++) {
		if (room[i] !== ctx) continue;
		room.splice(i, 1);
		break;
	}
}

function joinRoom(fileId, ctx) {
	if (!fileId) return;
	fileViewers[fileId] = fileViewers[fileId] || [];
	fileViewers[fileId].push(ctx);

	broadcastToSubscribersOfFile(fileId, 'viewing', {
		fileId: fileId,
		user: ctx.me(),
	});
}

function leaveRoom(fileId, ctx) {
	if (!fileId) return;
	if (!(fileId in fileViewers)) return;

	var room = fileViewers[fileId];
	for (var i = 0; i < room.length; i++) {
		if (room[i] !== ctx) continue;
		room.splice(i, 1);
		break;
	}

	broadcastToSubscribersOfFile(fileId, 'leaving', {
		fileId: fileId,
		user: ctx.me(),
	});
}



module.exports.bind = function bind(ctx) {

	ctx.on('new-file-list', function(data) {
		var existingFileList = ctx.get('file-list');
		if (existingFileList) {
			existingFileList.forEach(function(fileId) {
				unsubscribeFromRoom(fileId, this);
			}, this);
		}

		ctx.set('file-list', data);
		data.forEach(function(fileId) {
			subscribeToRoom(fileId, this);
			if (!fileViewers[fileId]) return;
			ctx.send('file-users', {
				fileId: fileId,
				users: fileViewers[fileId].map(function(viewer) {
					return viewer.me();
				}),
			});
		}, this);
	});

	ctx.on('viewing', function(newFileId) {
		leaveRoom(ctx.get('viewing'), this);
		ctx.set('viewing', newFileId);
		joinRoom(newFileId, this);
	});

	ctx.on('leaving', function() {
		leaveRoom(ctx.get('viewing'), this);
	});

};
