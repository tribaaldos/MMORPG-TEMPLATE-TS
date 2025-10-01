import { Server } from "socket.io";

type V3 = [number, number, number];
type Q4 = [number, number, number, number];

type AnimState = "idle" | "walk" | "attack";

let spider = {
  id: "spider-1",
  position: [0, 0, 0] as V3,
  quaternion: [0, 0, 0, 1] as Q4,
  animation: "Spider_Idle",
  animSpeed: 1,
  basePosition: [0, 0, 0] as V3,
  baseQuaternion: [0, 0, 0, 1] as Q4,
  state: "idle" as AnimState,
};

const players: { [id: string]: { position: V3 } } = {};

// Umbrales con histéresis para evitar parones/rearranques
const ATTACK_IN = 2.0;   // entro a atacar si dist < 2.0
const ATTACK_OUT = 2.2;  // dejo de atacar si dist > 2.2
const BASE_ARRIVE_IN = 0.18; // considero "llegado a base" si dist < 0.18
const BASE_ARRIVE_OUT = 0.28; // vuelvo a caminar si dist > 0.28

export function registerSpiderHandlers(io: Server) {
  io.on("connection", (socket) => {
    socket.on("updatePosition", (data: { id: string; position: V3 }) => {
      players[data.id] = { position: data.position };
    });

    socket.on("disconnect", () => {
      delete players[socket.id];
    });
  });

  setInterval(() => {
    const playerEntries = Object.entries(players);

    // jugador más cercano
    let closest: [string, { position: V3 }] | null = null;
    let closestDist = Infinity;

    for (const [id, player] of playerEntries) {
      const dx = player.position[0] - spider.position[0];
      const dz = player.position[2] - spider.position[2];
      const dist = Math.hypot(dx, dz);
      if (dist < closestDist) {
        closestDist = dist;
        closest = [id, player];
      }
    }

    if (closest && closestDist < 8) {
      const player = closest[1];
      const dx = player.position[0] - spider.position[0];
      const dz = player.position[2] - spider.position[2];
      const dist = Math.hypot(dx, dz);

      // mirar al jugador
      const angle = Math.atan2(-dx, -dz);
      spider.quaternion = [0, Math.sin(angle / 2), 0, Math.cos(angle / 2)];

      // histéresis ataque/walk
      if (spider.state !== "attack" && dist < ATTACK_IN) {
        spider.state = "attack";
      } else if (spider.state === "attack" && dist > ATTACK_OUT) {
        spider.state = "walk";
      } else if (spider.state !== "attack" && dist >= ATTACK_IN) {
        spider.state = "walk";
      }

      if (spider.state === "attack") {
        spider.animation = "Spider_Attack_1";
        spider.animSpeed = 1; // la cadencia del ataque la decide el cliente con loop
      } else {
        // caminar hacia el jugador
        spider.position[0] += (dx / dist) * 0.1;
        spider.position[2] += (dz / dist) * 0.1;
        spider.animation = "Spider_Walk";
        spider.animSpeed = 1;
      }
    } else {
      // volver a base con histéresis para no oscilar en idle/walk
      const dx = spider.basePosition[0] - spider.position[0];
      const dz = spider.basePosition[2] - spider.position[2];
      const dist = Math.hypot(dx, dz);

      if (spider.state !== "idle" && dist < BASE_ARRIVE_IN) {
        spider.state = "idle";
      } else if (spider.state === "idle" && dist > BASE_ARRIVE_OUT) {
        spider.state = "walk";
      }

      if (spider.state === "walk") {
        const ndx = dist > 0 ? (dx / dist) : 0;
        const ndz = dist > 0 ? (dz / dist) : 0;
        spider.position[0] += ndx * 0.05;
        spider.position[2] += ndz * 0.05;
        spider.animation = "Spider_Walk";
        spider.animSpeed = 1;

        const angle = Math.atan2(-dx, -dz);
        spider.quaternion = [0, Math.sin(angle / 2), 0, Math.cos(angle / 2)];
      } else {
        spider.animation = "Spider_Idle";
        spider.animSpeed = 1;
        spider.quaternion = [...spider.baseQuaternion];
      }
    }

    io.emit("spiderUpdate", {
      id: spider.id,
      position: spider.position,
      quaternion: spider.quaternion,
      animation: spider.animation,
      animSpeed: spider.animSpeed,
    });
  }, 1000 / 20);
}
