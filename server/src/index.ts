import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { registerWolfHandlers } from './wolfManager';
import { registerSpiderHandlers } from './spiderManager';
import { registerDragonHandlers } from './dragonManager';
import authRoutes from './authRoutes';
import { prisma } from './db';

const app = express();
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://mmorpg-template-ts.netlify.app',
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') { res.sendStatus(204); return; }
    next();
});
app.use(express.json());
app.use('/auth', authRoutes);
const server = http.createServer(app);
const io = new Server(server, {
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
    cors: {
        origin: ALLOWED_ORIGINS as string[],
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

const playerNames: { [id: string]: string } = {};
// socketId → userId (para buscar en DB)
const socketToUserId: Record<string, string> = {};

type EquipmentSlot =
    | 'helmet' | 'chest' | 'legs' | 'boots' | 'gloves'
    | 'weapon' | 'shield' | 'shoulders' | 'ring' | 'trinket';

type ItemKey = string | null;
type EquipmentMap = Partial<Record<EquipmentSlot, ItemKey>>;
// equipo en memoria (se sincroniza con DB al hacer playerJoin)
const equipmentByPlayer: Record<string, EquipmentMap> = {};

async function loadEquipmentFromDb(userId: string): Promise<EquipmentMap> {
    const items = await prisma.inventoryItem.findMany({ where: { userId } });
    const map: EquipmentMap = {};
    for (const item of items) {
        if (item.equipSlot) map[item.equipSlot as EquipmentSlot] = item.itemKey;
    }
    return map;
}

type ChatMessage = {
    id: string;
    name: string;
    message: string;
    t: number;
};

const chatHistory: ChatMessage[] = [];
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
    socket.on('playerJoin', async ({ name, userId }: { name: string; userId?: string }) => {
        if (typeof name === 'string') {
            playerNames[socket.id] = name;

            // Cargar equipo desde DB si tenemos userId
            if (userId) {
                socketToUserId[socket.id] = userId;
                try {
                    equipmentByPlayer[socket.id] = await loadEquipmentFromDb(userId);
                } catch { /* no crítico */ }
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

    socket.on('playerEquipment', async (msg: { id: string; slot: EquipmentSlot; itemKey: ItemKey }) => {
        const { id, slot, itemKey } = msg || {};
        if (!id || !slot) return;

        // Actualiza snapshot en memoria
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

        delete playerNames[socket.id];
        delete socketToUserId[socket.id];
        delete equipmentByPlayer[socket.id];
    });
});


registerWolfHandlers(io);
registerSpiderHandlers(io);
registerDragonHandlers(io);