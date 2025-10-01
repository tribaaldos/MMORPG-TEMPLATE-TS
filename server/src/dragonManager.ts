// server/dragon.ts
import { Server } from "socket.io";

let dragon = {
  id: "dragon-1",
  position: [0, 0, 0] as [number, number, number],
  quaternion: [0, 0, 0, 1] as [number, number, number, number],
  basePosition: [0, 0, 0] as [number, number, number],
  baseQuaternion: [0, 0, 0, 1] as [number, number, number, number],
  hp : 200 as number,
};

const players: { [id: string]: { position: [number, number, number] } } = {};

export function registerDragonHandlers(io: Server) {
  io.on("connection", (socket) => {
    socket.on("updatePosition", (data) => {
      players[data.id] = { position: data.position };
    });
    

    socket.on("disconnect", () => {
      delete players[socket.id];
    });
  });

  setInterval(() => {
    const playerEntries = Object.entries(players);

    // jugador más cercano (2D XZ)
    let closest: [string, { position: [number, number, number] }] | null = null;
    let closestDist = Infinity;

    for (const [id, player] of playerEntries) {
      const dx = player.position[0] - dragon.position[0];
      const dz = player.position[2] - dragon.position[2];
      const dist = Math.hypot(dx, dz);
      if (dist < closestDist) {
        closestDist = dist;
        closest = [id, player];
      }
    }

    if (closest && closestDist < 8) {
      const player = closest[1];
      const dx = player.position[0] - dragon.position[0];
      const dz = player.position[2] - dragon.position[2];
      const dist = Math.hypot(dx, dz);

      if (dist >= 2) {
        // caminar hacia el jugador
        dragon.position[0] += (dx / dist) * 0.1;
        dragon.position[2] += (dz / dist) * 0.1;
      }
      // rotación hacia el jugador
      const angle = Math.atan2(-dx, -dz);
      dragon.quaternion = [0, Math.sin(angle / 2), 0, Math.cos(angle / 2)];
    // } else {
    //   // volver a base
    //   const dx = dragon.basePosition[0] - dragon.position[0];
    //   const dz = dragon.basePosition[2] - dragon.position[2];
    //   const dist = Math.hypot(dx, dz);

    //   if (dist > 0.2) {
    //     dragon.position[0] += (dx / dist) * 0.05;
    //     dragon.position[2] += (dz / dist) * 0.05;

    //     const angle = Math.atan2(-dx, -dz);
    //     dragon.quaternion = [0, Math.sin(angle / 2), 0, Math.cos(angle / 2)];
    //   } else {
    //     // parado mirando a su rotación original
    //     dragon.quaternion = [...dragon.baseQuaternion];
    //   }
    }

    // 👇 Solo transform
    io.emit("dragonTransform", {
      id: dragon.id,
      position: dragon.position,
      quaternion: dragon.quaternion,
      hp: dragon.hp,
    });
  }, 1000 / 20);
}
