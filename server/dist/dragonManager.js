"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDragonHandlers = registerDragonHandlers;
const monsterSpawns_1 = require("./config/monsterSpawns");
// Crear instancias desde la config
const dragons = monsterSpawns_1.dragonSpawns.map((s) => ({
    id: s.id,
    position: [...s.position],
    quaternion: [...s.quaternion],
    basePosition: [...s.position],
    baseQuaternion: [...s.quaternion],
    hp: s.maxHp,
    maxHp: s.maxHp,
    respawnSeconds: s.respawnSeconds,
    xpReward: s.xpReward,
    alive: true,
    respawnTimer: null,
}));
const players = {};
function killDragon(dragon, io, killerSocketId) {
    if (!dragon.alive)
        return;
    dragon.alive = false;
    dragon.hp = 0;
    io.emit('dragonDeath', { id: dragon.id });
    // Recompensar XP solo al que mató
    if (killerSocketId) {
        io.to(killerSocketId).emit('xpGain', { amount: dragon.xpReward, source: dragon.id });
    }
    dragon.respawnTimer = setTimeout(() => {
        dragon.hp = dragon.maxHp;
        dragon.position = [...dragon.basePosition];
        dragon.quaternion = [...dragon.baseQuaternion];
        dragon.alive = true;
        dragon.respawnTimer = null;
        io.emit('dragonRespawn', {
            id: dragon.id,
            hp: dragon.hp,
            maxHp: dragon.maxHp,
            position: dragon.position,
        });
    }, dragon.respawnSeconds * 1000);
}
function registerDragonHandlers(io) {
    io.on('connection', (socket) => {
        // Enviar estado actual de todos los dragons al nuevo cliente
        socket.emit('dragonInit', dragons.map((d) => ({
            id: d.id,
            position: d.position,
            quaternion: d.quaternion,
            hp: d.hp,
            maxHp: d.maxHp,
            alive: d.alive,
        })));
        socket.on('updatePosition', (data) => {
            players[data.id] = { position: data.position };
        });
        socket.on('hitMonster', (data) => {
            const dragon = dragons.find((d) => d.id === data.id);
            if (!dragon || !dragon.alive)
                return;
            dragon.hp = Math.max(0, dragon.hp - data.damage);
            if (dragon.hp <= 0)
                killDragon(dragon, io, socket.id);
        });
        socket.on('disconnect', () => {
            delete players[socket.id];
        });
    });
    // Loop de movimiento — 20 Hz
    setInterval(() => {
        const playerEntries = Object.entries(players);
        for (const dragon of dragons) {
            if (!dragon.alive)
                continue;
            // Jugador más cercano en XZ
            let closest = null;
            let closestDist = Infinity;
            for (const [, player] of playerEntries) {
                const dx = player.position[0] - dragon.position[0];
                const dz = player.position[2] - dragon.position[2];
                const dist = Math.hypot(dx, dz);
                if (dist < closestDist) {
                    closestDist = dist;
                    closest = player;
                }
            }
            if (closest && closestDist < 8) {
                const dx = closest.position[0] - dragon.position[0];
                const dz = closest.position[2] - dragon.position[2];
                const dist = Math.hypot(dx, dz);
                if (dist >= 2) {
                    dragon.position[0] += (dx / dist) * 0.5;
                    dragon.position[2] += (dz / dist) * 0.5;
                }
                const angle = Math.atan2(-dx, -dz);
                dragon.quaternion = [0, Math.sin(angle / 2), 0, Math.cos(angle / 2)];
            }
            else {
                const dx = dragon.basePosition[0] - dragon.position[0];
                const dz = dragon.basePosition[2] - dragon.position[2];
                const dist = Math.hypot(dx, dz);
                if (dist > 0.2) {
                    dragon.position[0] += (dx / dist) * 0.9;
                    dragon.position[2] += (dz / dist) * 0.9;
                    const angle = Math.atan2(-dx, -dz);
                    dragon.quaternion = [0, Math.sin(angle / 2), 0, Math.cos(angle / 2)];
                }
                else {
                    dragon.quaternion = [...dragon.baseQuaternion];
                }
            }
            io.emit('dragonTransform', {
                id: dragon.id,
                position: dragon.position,
                quaternion: dragon.quaternion,
                hp: dragon.hp,
            });
        }
    }, 1000 / 20);
}
