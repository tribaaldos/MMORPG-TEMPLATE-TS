"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerWolfHandlers = registerWolfHandlers;
// Estado inicial del lobo
let wolf = {
    id: "wolf-1",
    position: [10, 0, 0],
    quaternion: [0, 0, 0, 1],
    animation: "Take 001",
    basePosition: [10, 0, 0],
    baseQuaternion: [0, 0, 0, 1], // 👈 rotación inicial
    animSpeed: 1,
};
const players = {};
function registerWolfHandlers(io) {
    io.on("connection", (socket) => {
        socket.on("updatePosition", (data) => {
            players[data.id] = { position: data.position };
        });
        socket.on("disconnect", () => {
            delete players[socket.id];
        });
    });
    // bucle IA
    setInterval(() => {
        const playerEntries = Object.entries(players);
        // encontrar jugador más cercano
        let closest = null;
        let closestDist = Infinity;
        for (const [id, player] of playerEntries) {
            const dx = player.position[0] - wolf.position[0];
            const dz = player.position[2] - wolf.position[2];
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < closestDist) {
                closestDist = dist;
                closest = [id, player];
            }
        }
        if (closest && closestDist < 8) {
            // --- perseguir o atacar jugador ---
            const player = closest[1];
            const dx = player.position[0] - wolf.position[0];
            const dz = player.position[2] - wolf.position[2];
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < 2) {
                wolf.animation = "attack";
                wolf.animSpeed = 0.2;
            }
            else {
                wolf.position[0] += (dx / dist) * 0.1; // velocidad ajustada
                wolf.position[2] += (dz / dist) * 0.1;
                wolf.animation = "walking";
            }
            // rotación hacia el jugador
            const angle = Math.atan2(-dx, -dz);
            wolf.quaternion = [0, Math.sin(angle / 2), 0, Math.cos(angle / 2)];
        }
        else {
            // --- volver a la posición base ---
            const dx = wolf.basePosition[0] - wolf.position[0];
            const dz = wolf.basePosition[2] - wolf.position[2];
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist > 0.2) {
                wolf.position[0] += (dx / dist) * 0.05;
                wolf.position[2] += (dz / dist) * 0.05;
                wolf.animation = "walking";
                // rotación hacia la base
                const angle = Math.atan2(-dx, -dz);
                wolf.quaternion = [0, Math.sin(angle / 2), 0, Math.cos(angle / 2)];
            }
            else {
                // idle mirando a su rotación original
                wolf.animation = "Take 001";
                wolf.quaternion = [...wolf.baseQuaternion];
            }
        }
        io.emit("wolfUpdate", wolf);
    }, 1000 / 20);
}
