// iceSkill/useIceSkillStore.ts
import { create } from 'zustand'
import * as THREE from 'three'

export interface Projectile {
  id: string
  position: THREE.Vector3
  direction: THREE.Vector3
  speed: number         // m/s
  ttl: number           // s
  radius: number        // radio
  damage: number
  targetId?: string
}

interface ProjectilesState {
  list: Projectile[]
  add: (p: Projectile) => void
  remove: (id: string) => void
  clear: () => void
}

export const useIceSkillStore = create<ProjectilesState>((set) => ({
  list: [],
  add: (p) => set((s) => ({ list: [...s.list, p] })),
  remove: (id) => set((s) => ({ list: s.list.filter(x => x.id !== id) })),
  clear: () => set({ list: [] }),
}))
