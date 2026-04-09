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
const authRoutes_1 = __importDefault(require("./authRoutes"));
const db_1 = require("./db");
const app = (0, express_1.default)();
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') { res.sendStatus(204); return; }
    next();
});
app.use(express_1.default.json());
app.use('/auth', authRoutes_1.default);
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    path: '/socket.io/',
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
const playerNames = {};
const socketToUserId = {};
const equipmentByPlayer = {};
async function loadEquipmentFromDb(userId) {
    const items = await db_1.prisma.inventoryItem.findMany({ where: { userId } });
    const map = {};
    for (const item of items) {
        if (item.equipSlot)
            map[item.equipSlot] = item.itemKey;
    }
    return map;
}
const chatHistory = [];
const CHAT_LIMIT = 50;
const PORT = process.env.PORT || 5174;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
io.on('connection', (socket) => {
    console.log(`🟢 User connected: ${socket.id} (total: ${io.engine.clientsCount})`);
    // ✅ Enviar nombres de jugadores ya conectados
    socket.emit('existingPlayers', playerNames);
    // ✅ Enviar historial de chat
    socket.emit('chatHistory', chatHistory);
    // ✅ Cuando alguien se une con nombre y userId
    socket.on('playerJoin', async ({ name, userId }) => {
        if (typeof name === 'string') {
            playerNames[socket.id] = name;
            // Cargar equipo desde DB si tenemos userId
            if (userId) {
                socketToUserId[socket.id] = userId;
                try {
                    equipmentByPlayer[socket.id] = await loadEquipmentFromDb(userId);
                }
                catch { /* no crítico */ }
            }
            // Avisar al resto con el equipo incluido
            socket.broadcast.emit('playerJoined', {
                id: socket.id,
                name,
                equipment: equipmentByPlayer[socket.id] ?? {},
            });
        }
        socket.emit('existingPlayers', playerNames);
        // Mandar snapshot completo al nuevo jugador (con equipo de todos)
        socket.emit('equipmentSnapshot', equipmentByPlayer);
    });
    socket.on('playerEquipment', async (msg) => {
        const { id, slot, itemKey } = msg || {};
        if (!id || !slot)
            return;
        // Actualiza snapshot en memoria
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
    // 💬 Chat
    socket.on('chatMessage', (msg) => {
        if (!msg || typeof msg.message !== 'string')
            return;
        const safeMessage = msg.message.trim().slice(0, 280);
        if (!safeMessage)
            return;
        const safeName = typeof msg.name === 'string' ? msg.name.slice(0, 24) : 'Player';
        const payload = {
            id: msg.id || socket.id,
            name: safeName,
            message: safeMessage,
            t: typeof msg.t === 'number' ? msg.t : Date.now(),
        };
        chatHistory.push(payload);
        if (chatHistory.length > CHAT_LIMIT)
            chatHistory.shift();
        io.emit('chatMessage', payload);
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
        delete playerNames[socket.id];
        delete socketToUserId[socket.id];
        delete equipmentByPlayer[socket.id];
    });
});
(0, wolfManager_1.registerWolfHandlers)(io);
(0, spiderManager_1.registerSpiderHandlers)(io);
(0, dragonManager_1.registerDragonHandlers)(io);
