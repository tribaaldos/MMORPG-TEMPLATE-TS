import { create } from 'zustand'
import * as THREE from 'three'

export interface TargetData {
    id: string
    name: string
    level?: number
    hp?: number
    maxHp?: number
    position?: THREE.Vector3
    kind?: 'monster' | 'npc' | 'player'
}

interface TargetState {
    selectedTarget: TargetData | null
    setSelectedTarget: (t: TargetData | null) => void
}

export const useTargetStore = create<TargetState>((set) => ({
    selectedTarget: null,
    setSelectedTarget: (t) => set({ selectedTarget: t }),
}))
