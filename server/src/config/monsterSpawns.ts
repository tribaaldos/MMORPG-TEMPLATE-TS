export interface SpawnConfig {
  id: string
  position: [number, number, number]
  quaternion: [number, number, number, number]
  maxHp: number
  respawnSeconds: number
  xpReward: number
}

export const dragonSpawns: SpawnConfig[] = [
  { id: 'dragon-1', position: [0,   0, 0],   quaternion: [0, 0, 0, 1], maxHp: 200, respawnSeconds: 15, xpReward: 150 },
  { id: 'dragon-2', position: [15,  0, 8],   quaternion: [0, 0, 0, 1], maxHp: 200, respawnSeconds: 15, xpReward: 150 },
  { id: 'dragon-3', position: [-12, 0, 15],  quaternion: [0, 0, 0, 1], maxHp: 200, respawnSeconds: 15, xpReward: 150 },
]
