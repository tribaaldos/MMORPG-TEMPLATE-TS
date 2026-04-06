import { Server } from 'socket.io'
import { dragonSpawns } from './config/monsterSpawns'

interface DragonInstance {
  id: string
  position: [number, number, number]
  quaternion: [number, number, number, number]
  basePosition: [number, number, number]
  baseQuaternion: [number, number, number, number]
  hp: number
  maxHp: number
  respawnSeconds: number
  xpReward: number
  alive: boolean
  respawnTimer: ReturnType<typeof setTimeout> | null
}

// Crear instancias desde la config
const dragons: DragonInstance[] = dragonSpawns.map((s) => ({
  id: s.id,
  position: [...s.position] as [number, number, number],
  quaternion: [...s.quaternion] as [number, number, number, number],
  basePosition: [...s.position] as [number, number, number],
  baseQuaternion: [...s.quaternion] as [number, number, number, number],
  hp: s.maxHp,
  maxHp: s.maxHp,
  respawnSeconds: s.respawnSeconds,
  xpReward: s.xpReward,
  alive: true,
  respawnTimer: null,
}))

const players: Record<string, { position: [number, number, number] }> = {}

function killDragon(dragon: DragonInstance, io: Server, killerSocketId?: string) {
  if (!dragon.alive) return
  dragon.alive = false
  dragon.hp = 0
  io.emit('dragonDeath', { id: dragon.id })

  // Recompensar XP solo al que mató
  if (killerSocketId) {
    io.to(killerSocketId).emit('xpGain', { amount: dragon.xpReward, source: dragon.id })
  }

  dragon.respawnTimer = setTimeout(() => {
    dragon.hp = dragon.maxHp
    dragon.position = [...dragon.basePosition]
    dragon.quaternion = [...dragon.baseQuaternion]
    dragon.alive = true
    dragon.respawnTimer = null
    io.emit('dragonRespawn', {
      id: dragon.id,
      hp: dragon.hp,
      maxHp: dragon.maxHp,
      position: dragon.position,
    })
  }, dragon.respawnSeconds * 1000)
}

export function registerDragonHandlers(io: Server) {
  io.on('connection', (socket) => {
    // Enviar estado actual de todos los dragons al nuevo cliente
    socket.emit('dragonInit', dragons.map((d) => ({
      id: d.id,
      position: d.position,
      quaternion: d.quaternion,
      hp: d.hp,
      maxHp: d.maxHp,
      alive: d.alive,
    })))

    socket.on('updatePosition', (data) => {
      players[data.id] = { position: data.position }
    })

    socket.on('hitMonster', (data: { id: string; damage: number }) => {
      const dragon = dragons.find((d) => d.id === data.id)
      if (!dragon || !dragon.alive) return

      dragon.hp = Math.max(0, dragon.hp - data.damage)
      if (dragon.hp <= 0) killDragon(dragon, io, socket.id)
    })

    socket.on('disconnect', () => {
      delete players[socket.id]
    })
  })

  // Loop de movimiento — 20 Hz
  setInterval(() => {
    const playerEntries = Object.entries(players)

    for (const dragon of dragons) {
      if (!dragon.alive) continue

      // Jugador más cercano en XZ
      let closest: { position: [number, number, number] } | null = null
      let closestDist = Infinity

      for (const [, player] of playerEntries) {
        const dx = player.position[0] - dragon.position[0]
        const dz = player.position[2] - dragon.position[2]
        const dist = Math.hypot(dx, dz)
        if (dist < closestDist) {
          closestDist = dist
          closest = player
        }
      }

      if (closest && closestDist < 8) {
        const dx = closest.position[0] - dragon.position[0]
        const dz = closest.position[2] - dragon.position[2]
        const dist = Math.hypot(dx, dz)
        if (dist >= 2) {
          dragon.position[0] += (dx / dist) * 0.5
          dragon.position[2] += (dz / dist) * 0.5
        }
        const angle = Math.atan2(-dx, -dz)
        dragon.quaternion = [0, Math.sin(angle / 2), 0, Math.cos(angle / 2)]
      } else {
        const dx = dragon.basePosition[0] - dragon.position[0]
        const dz = dragon.basePosition[2] - dragon.position[2]
        const dist = Math.hypot(dx, dz)
        if (dist > 0.2) {
          dragon.position[0] += (dx / dist) * 0.9
          dragon.position[2] += (dz / dist) * 0.9
          const angle = Math.atan2(-dx, -dz)
          dragon.quaternion = [0, Math.sin(angle / 2), 0, Math.cos(angle / 2)]
        } else {
          dragon.quaternion = [...dragon.baseQuaternion]
        }
      }

      io.emit('dragonTransform', {
        id: dragon.id,
        position: dragon.position,
        quaternion: dragon.quaternion,
        hp: dragon.hp,
      })
    }
  }, 1000 / 20)
}
