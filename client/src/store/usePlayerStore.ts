// store/usePlayerStore.ts
import { create } from 'zustand'
import { RapierRigidBody } from '@react-three/rapier'
import { MutableRefObject } from 'react'

/** 3D vector */
type Vec3 = [number, number, number]

export interface PlayerState {
  hp: number
  maxHp: number
  mana: number
  maxMana: number
  critRate: number
  strength: number
  agility: number
  intelligence: number
  position: Vec3
  lastDamageDone: number | null
  rigidBody: RapierRigidBody | null
  dashDirection: Vec3
  cameraTargetRef: MutableRefObject<any> | null
  cameraPositionRef: MutableRefObject<any> | null

  exp: number
  level: number
  getExpToLevel: (level: number) => number
  checkLevelUp: () => void

  setDashDirection: (dir: Vec3) => void
  takeDamage: (amount: number) => void
  heal: (amount: number) => void
  setPosition: (pos: Vec3) => void
  gainExp: (amount: number) => void
  setLastDamageDone: (value: number | null) => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  // Base stats
  hp: 100,
  maxHp: 100,
  mana: 100,
  maxMana: 100,
  critRate: 15,
  strength: 10,
  agility: 10,
  intelligence: 10,

  // Physics & positioning
  position: [0, 0.5, 0],
  rigidBody: null,
  dashDirection: [0, 0, -1],
  cameraTargetRef: null,
  cameraPositionRef: null,

  // Damage tracking
  lastDamageDone: null,

  // EXP & leveling
  exp: 0,
  level: 1,
  getExpToLevel: (level) => level * 100,
  checkLevelUp: () => {
    const { exp, level, getExpToLevel } = get()
    const needed = getExpToLevel(level)
    if (exp >= needed) {
      set({
        level: level + 1,
        exp: exp - needed,
        maxHp: get().maxHp + 10,
        hp: Math.min(get().hp + 10, get().maxHp + 10),
        maxMana: get().maxMana + 10,
        mana: Math.min(get().mana + 10, get().maxMana + 10),
      })
      console.log(`Level up! New level: ${level + 1}`)
      get().checkLevelUp()
    }
  },

  // Actions
  setDashDirection: (dir) => set({ dashDirection: dir }),
  takeDamage: (amount) => {
    const newHp = Math.max(get().hp - amount, 0)
    set({ hp: newHp, lastDamageDone: amount })
  },
  heal: (amount) => {
    const healed = Math.min(get().hp + amount, get().maxHp)
    set({ hp: healed })
  },
  setPosition: (pos) => set({ position: pos }),
  gainExp: (amount) => {
    const newExp = get().exp + amount
    set({ exp: newExp })
    console.log(`Gained ${amount} exp! Total: ${newExp}`)
    get().checkLevelUp()
  },
  setLastDamageDone: (value) => set({ lastDamageDone: value }),
}))
