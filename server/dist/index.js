"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const wolfManager_1 = require("./wolfManager");
const spiderManager_1 = require("./spiderManager");
const dragonManager_1 = require("./dragonManager");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});
// 🌐 Almacén temporal de nombres
const playerNames = {};
const equipmentByPlayer = {};
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
    // equipamiento 
    socket.emit('equipmentSnapshot', equipmentByPlayer);
    socket.on('playerEquipment', (msg) => {
        const { id, slot, itemKey } = msg || {};
        if (!id || !slot)
            return;
        // Actualiza snapshot del servidor
        if (!equipmentByPlayer[id])
            equipmentByPlayer[id] = {};
        equipmentByPlayer[id][slot] = itemKey ?? null;
        // Reemite a todos menos al emisor
        socket.broadcast.emit('remoteEquipment', { id, slot, itemKey });
    });
    socket.on('projectileSpawn', (payload) => {
        // envía a todos los OTROS del mismo mundo
        socket.emit('projectileSpawn', payload);
        // sin mundos: a todos menos al emisor
        socket.broadcast.emit('projectileSpawn', payload);
    });
    // 📡 Posición del jugador
    socket.on('updatePosition', (data) => {
        socket.broadcast.emit('remotePosition', data); // data: { id, position, rotation }
    });
    // 🔄 Animación del jugador
    socket.on('playerAnim', (data) => {
        socket.broadcast.emit('remoteAnim', data); // data: { id, animation }
    });
    // projectiles / monstruos 
    // ❌ Desconexión
    socket.on('disconnect', () => {
        console.log(`🔴 User disconnected: ${socket.id} (total: ${io.engine.clientsCount})`);
        // Avisar a los demás
        socket.broadcast.emit('userDisconnected', { id: socket.id });
        // Limpiar nombre
        delete playerNames[socket.id];
    });
});
(0, wolfManager_1.registerWolfHandlers)(io);
(0, spiderManager_1.registerSpiderHandlers)(io);
(0, dragonManager_1.registerDragonHandlers)(io);
