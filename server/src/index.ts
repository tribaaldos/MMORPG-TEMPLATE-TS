import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});

// 🌐 Almacén temporal de nombres
const playerNames: { [id: string]: string } = {};

io.listen(5174);

io.on('connection', (socket) => {
    console.log(`🟢 User connected: ${socket.id} (total: ${io.engine.clientsCount})`);

    // ✅ Enviar nombres de jugadores ya conectados
    socket.emit('existingPlayers', playerNames);

    // ✅ Cuando alguien se une con nombre
    socket.on('playerJoin', ({ name }) => {
        if (typeof name === 'string') {
            playerNames[socket.id] = name;
            console.log(`👤 ${socket.id} se llama ${name}`);

            // Avisar al resto
            socket.broadcast.emit('playerJoined', {
                id: socket.id,
                name,
            });
        }
        socket.emit("existingPlayers", playerNames);

    });

    // 📡 Posición del jugador
    socket.on('updatePosition', (data) => {
        socket.broadcast.emit('remotePosition', data); // data: { id, position, rotation }
    });

    // 🔄 Animación del jugador
    socket.on('playerAnim', (data) => {
        socket.broadcast.emit('remoteAnim', data); // data: { id, animation }
    });

    // ❌ Desconexión
    socket.on('disconnect', () => {
        console.log(`🔴 User disconnected: ${socket.id} (total: ${io.engine.clientsCount})`);

        // Avisar a los demás
        socket.broadcast.emit('userDisconnected', { id: socket.id });

        // Limpiar nombre
        delete playerNames[socket.id];
    });
});
