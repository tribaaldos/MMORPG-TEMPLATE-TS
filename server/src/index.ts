import express from 'express';
import http from 'http';
import { register } from 'module';
import { Server } from 'socket.io';
import { registerWolfHandlers } from './wolfManager';
import { registerSpiderHandlers } from './spiderManager';
import { registerDragonHandlers } from './dragonManager';

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
// equipamiento 
type EquipmentSlot =
    | 'helmet' | 'chest' | 'legs' | 'boots' | 'gloves'
    | 'weapon' | 'shield' | 'shoulders' | 'ring' | 'trinket';

type ItemKey = string | null;
const equipmentByPlayer: Record<string, Partial<Record<EquipmentSlot, ItemKey>>> = {};

type ChatMessage = {
    id: string;
    name: string;
    message: string;
    t: number;
};

const chatHistory: ChatMessage[] = [];
const CHAT_LIMIT = 50;


io.listen(5174);

io.on('connection', (socket) => {
    console.log(`🟢 User connected: ${socket.id} (total: ${io.engine.clientsCount})`);

    // ✅ Enviar nombres de jugadores ya conectados
    socket.emit('existingPlayers', playerNames);

    // ✅ Enviar historial de chat
    socket.emit('chatHistory', chatHistory);



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

    socket.on('playerEquipment', (msg: { id: string; slot: EquipmentSlot; itemKey: ItemKey }) => {
        const { id, slot, itemKey } = msg || {};
        if (!id || !slot) return;

        // Actualiza snapshot del servidor
        if (!equipmentByPlayer[id]) equipmentByPlayer[id] = {};
        equipmentByPlayer[id][slot] = itemKey ?? null;

        // Reemite a todos menos al emisor
        socket.broadcast.emit('remoteEquipment', { id, slot, itemKey });
    });

    socket.on('projectileSpawn', (payload) => {
        // envía a todos los OTROS del mismo mundo
        socket.emit('projectileSpawn', payload);
        // sin mundos: a todos menos al emisor
        socket.broadcast.emit('projectileSpawn', payload);
    }
    );

    // 💬 Chat
    socket.on('chatMessage', (msg: ChatMessage) => {
        if (!msg || typeof msg.message !== 'string') return;
        const safeMessage = msg.message.trim().slice(0, 280);
        if (!safeMessage) return;

        const safeName = typeof msg.name === 'string' ? msg.name.slice(0, 24) : 'Player';

        const payload: ChatMessage = {
            id: msg.id || socket.id,
            name: safeName,
            message: safeMessage,
            t: typeof msg.t === 'number' ? msg.t : Date.now(),
        };

        chatHistory.push(payload);
        if (chatHistory.length > CHAT_LIMIT) chatHistory.shift();

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


registerWolfHandlers(io);
registerSpiderHandlers(io);
registerDragonHandlers(io);