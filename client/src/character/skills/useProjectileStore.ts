import { create } from 'zustand'
import * as THREE from 'three'

export type ProjectileKind = 'ice' | 'fire' | 'lightning';
export interface Projectile {
  id: string
  position: THREE.Vector3
  direction: THREE.Vector3
  speed: number         // m/s
  ttl: number           // segundos
  radius: number        // radio de colisión
  damage: number
  targetId?: string  
  mesh: THREE.Mesh   // a quién chequeamos impacto
  ownerId?: string
  world?: string| null 
  // aiming
  aim?: THREE.Vector3
  aimOffsetY?: number
  kind?: ProjectileKind
}


interface ProjectilesState {
  list: Projectile[]
  add: (p: Projectile) => void
  remove: (id: string) => void
  clear: () => void
}

export const useProjectilesStore = create<ProjectilesState>((set) => ({
  list: [],
  add: (p) => set((s) => ({ list: [...s.list, p] })),
  remove: (id) => set((s) => ({ list: s.list.filter(x => x.id !== id) })),
  clear: () => set({ list: [] }),
}))
