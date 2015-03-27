
var fileSubscribers = {}; // fileId => ctx[]
var fileViewers = {}; // fileId => ctx[]


function broadcastToSubscribersOfFile(fileId, type, body, except) {
    if (!fileId) return;
    if (!(fileId in fileSubscribers)) return;

    fileSubscribers[fileId].forEach(function(ctx) {
        if (ctx === except) return;
        ctx.send(type, body);
    });
}
function broadcastToViewersOfFile(fileId, type, body, except) {
    if (!fileId) return;
    if (!(fileId in fileViewers)) return;

    fileViewers[fileId].forEach(function(ctx) {
        if (ctx === except) return;
        ctx.send(type, body);
    });
}

function subscribeToRoom(fileId, ctx) {
    fileSubscribers[fileId] = fileSubscribers[fileId] || [];
    fileSubscribers[fileId].push(ctx);

    if (!(fileId in fileViewers)) return;
    fileViewers[fileId].forEach(function(viewer) {
        if (viewer === ctx) return;
        ctx.send('viewing', {
            fileId: fileId,
            user: viewer.me(),
        });
    });
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
    }, ctx);
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
    }, ctx);
}



module.exports.bind = function bind(ctx) {

    ctx.on('user-data', function(data) {
        ctx.set('profile-pic', data.profilePic);
        ctx.set('user-name', data.publicName);
        ctx.set('user-id', data.userId);
    });

    ctx.on('new-file-list', function(data) {
        var existingFileList = ctx.get('file-list');
        if (existingFileList) {
            existingFileList.forEach(function(fileId) {
                unsubscribeFromRoom(fileId, ctx);
            });
        }

        ctx.set('file-list', data);
        data.forEach(function(fileId) {
            subscribeToRoom(fileId, ctx);
            if (!fileViewers[fileId]) return;
            ctx.send('file-users', {
                fileId: fileId,
                users: fileViewers[fileId].map(function(viewer) {
                    return viewer.me();
                }),
            });
        });
    });

    ctx.on('viewing', function(newFileId) {
        leaveRoom(ctx.get('viewing'), ctx);
        ctx.set('viewing', newFileId);
        joinRoom(newFileId, ctx);
    });

    ctx.on('leaving', function() {
        leaveRoom(ctx.get('viewing'), ctx);
    });

    ctx.on('open-note', function(data) {
        broadcastToViewersOfFile(data.fileId, 'open-note', data.noteId, ctx);
    });

    ctx.on('close', function() {
        leaveRoom(ctx.get('viewing'), ctx);

        var existingFileList = ctx.get('file-list');
        if (!existingFileList) return;
        existingFileList.forEach(function(fileId) {
            unsubscribeFromRoom(fileId, ctx);
        });
    });

};
