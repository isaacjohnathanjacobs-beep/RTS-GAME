const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001;

const players = {};

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    players[socket.id] = {
        id: socket.id,
        position: { x: 0, y: 0, z: 0 },
        rotation: 0,
        animation: 'Idle_3'
    };

    socket.emit('currentPlayers', players);

    socket.broadcast.emit('playerConnected', {
        id: socket.id,
        position: players[socket.id].position
    });

    socket.on('playerJoined', (data) => {
        console.log('Player joined:', socket.id);
        players[socket.id].position = data.position;
    });

    socket.on('playerUpdate', (data) => {
        if (players[socket.id]) {
            players[socket.id].position = data.position;
            players[socket.id].rotation = data.rotation;
            players[socket.id].animation = data.animation;

            socket.broadcast.emit('playerUpdate', {
                id: socket.id,
                position: data.position,
                rotation: data.rotation,
                animation: data.animation
            });
        }
    });

    socket.on('playerShot', (data) => {
        socket.broadcast.emit('playerShot', {
            id: socket.id,
            position: data.position,
            direction: data.direction
        });
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        delete players[socket.id];
        socket.broadcast.emit('playerDisconnected', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Multiplayer server running on port ${PORT}`);
});
