const express = require('express');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.origins(['https://listrom.me:443']);

io.on('connection', function (socket) {
    console.info("User connected");

    socket.on('chat message', function (message) {
        const timestamp = new Date().toLocaleTimeString();
        io.emit('chat message', timestamp + " - " + message);
    });
});

server.listen(8000);
