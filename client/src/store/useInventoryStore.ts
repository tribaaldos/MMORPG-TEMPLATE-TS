// store/useInventoryStore.ts
import { create } from 'zustand'
import { BasicShoulder, ShoulderPincho2 } from '../items/storage/ShouldersStorage'
import { BasicSword, BasicSword2 } from '../items/storage/WeaponsStorage'
import React from 'react'

import { BasicPants } from '../items/storage/PantsStorage'
import { itemRegistry, ItemKey } from '../items/itemRegistry'

/** Los slots de equipo válidos */
export type EquipmentSlot =
  | 'helmet'
  | 'chest'
  | 'legs'
  | 'boots'
  | 'gloves'
  | 'weapon'
  | 'shield'
  | 'shoulders'
  | 'ring'
  | 'trinket'

/** Tipos de ítems consumibles */
export type ConsumableType = 'potion' | 'consumable'

/** Union de todos los tipos posibles de ítem */
export type ItemType = EquipmentSlot | ConsumableType

/** Estructura de un ítem */
export interface Item {
  type: ItemType
  name: string
  image: string | React.FC
  description?: string
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  attack?: number
  defense?: number
  Model?: React.FC // Componente 3D asociado (si tiene)
  // ...otros campos que necesites
}

export type Equipment = Record<EquipmentSlot, Item | null>
export type PlayerId = string

// ——— Defaults por jugador (mismos que tenías, encapsulados) ———
const makeDefaultInventory = (): Array<Item | null> => {
  const inv = Array<Item | null>(20).fill(null)
  inv[0] = BasicSword
  inv[1] = BasicSword2
  inv[2] = null
  inv[3] = ShoulderPincho2
  // if (i === 3) return HeadItem
  // if (i === 4) return HeadItem2
  return inv
}

const makeDefaultEquipment = (): Equipment => ({
  helmet: null,
  chest: null,
  shoulders: BasicShoulder,
  legs: BasicPants,
  boots: null,
  gloves: null,
  weapon: BasicSword, // ✅ inicializamos con la espada equipada
  shield: null,
  ring: null,
  trinket: null,
})

// ——— State tipado: ahora “namespaced” por playerId ———
export interface InventoryState {
  /** Inventarios por jugador */
  inventoryByPlayer: Record<PlayerId, Array<Item | null>>
  /** Equipos por jugador */
  equipmentByPlayer: Record<PlayerId, Equipment>

  /** Asegura que exista el estado del jugador (si no, crea defaults) */
  ensurePlayer: (id: PlayerId) => void

  /** Getters */
  getInventory: (id: PlayerId) => Array<Item | null>
  getEquipment: (id: PlayerId) => Equipment

  /** Acciones SCOPED por jugador */
  useItem: (id: PlayerId, index: number) => void
  moveItem: (id: PlayerId, fromIndex: number, toIndex: number) => void
  equipItem: (id: PlayerId, fromIndex: number, slotType: EquipmentSlot) => void
  unequipItem: (id: PlayerId, slotType: EquipmentSlot) => void
  addItem: (id: PlayerId, item: Item) => void
  removeItem: (id: PlayerId, index: number) => void
  // red 
  setEquipmentSlot: (id: PlayerId, slot: EquipmentSlot, itemKey: ItemKey | null) => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  inventoryByPlayer: {},
  equipmentByPlayer: {},

  ensurePlayer: (id) => {
    const s = get()
    if (!s.inventoryByPlayer[id] || !s.equipmentByPlayer[id]) {
      set({
        inventoryByPlayer: {
          ...s.inventoryByPlayer,
          [id]: s.inventoryByPlayer[id] ?? makeDefaultInventory(),
        },
        equipmentByPlayer: {
          ...s.equipmentByPlayer,
          [id]: s.equipmentByPlayer[id] ?? makeDefaultEquipment(),
        },
      })
    }
  },

  getInventory: (id) => {
    const s = get()
    return s.inventoryByPlayer[id] ?? makeDefaultInventory()
  },

  getEquipment: (id) => {
    const s = get()
    return s.equipmentByPlayer[id] ?? makeDefaultEquipment()
  },

  useItem: (id, index) =>
    set((state) => {
      const inv = state.inventoryByPlayer[id]
      if (!inv) return {}
      const item = inv[index]
      if (!item || (item.type !== 'potion' && item.type !== 'consumable')) return {}
      const newInv = [...inv]
      newInv[index] = null
      return { inventoryByPlayer: { ...state.inventoryByPlayer, [id]: newInv } }
    }),

  moveItem: (id, fromIndex, toIndex) =>
    set((state) => {
      const inv = state.inventoryByPlayer[id]
      if (!inv) return {}
      const newInv = [...inv]
      const tmp = newInv[toIndex]
      newInv[toIndex] = newInv[fromIndex]
      newInv[fromIndex] = tmp
      return { inventoryByPlayer: { ...state.inventoryByPlayer, [id]: newInv } }
    }),

  equipItem: (id, fromIndex, slotType) =>
    set((state) => {
      const inv = state.inventoryByPlayer[id]
      const eq = state.equipmentByPlayer[id]
      if (!inv || !eq) return {}
      const itemToEquip = inv[fromIndex]
      if (!itemToEquip || itemToEquip.type !== slotType) return {}

      const currentlyEquipped = eq[slotType]
      const newInv = [...inv]
      newInv[fromIndex] = currentlyEquipped || null

      return {
        inventoryByPlayer: { ...state.inventoryByPlayer, [id]: newInv },
        equipmentByPlayer: {
          ...state.equipmentByPlayer,
          [id]: { ...eq, [slotType]: itemToEquip },
        },
      }
    }),

  unequipItem: (id, slotType) =>
    set((state) => {
      const inv = state.inventoryByPlayer[id]
      const eq = state.equipmentByPlayer[id]
      if (!inv || !eq) return {}
      const item = eq[slotType]
      if (!item) return {}

      const newInv = [...inv]
      const emptyIndex = newInv.findIndex((slot) => slot === null)
      if (emptyIndex === -1) {
        console.warn('No hay espacio en el inventario para desequipar.')
        return {}
      }
      newInv[emptyIndex] = item

      return {
        inventoryByPlayer: { ...state.inventoryByPlayer, [id]: newInv },
        equipmentByPlayer: {
          ...state.equipmentByPlayer,
          [id]: { ...eq, [slotType]: null },
        },
      }
    }),

  addItem: (id, item) =>
    set((state) => {
      const inv = state.inventoryByPlayer[id]
      if (!inv) return {}
      const idx = inv.findIndex((s) => s === null)
      if (idx === -1) {
        alert('Inventory full!')
        return {}
      }
      const newInv = [...inv]
      newInv[idx] = item
      return { inventoryByPlayer: { ...state.inventoryByPlayer, [id]: newInv } }
    }),

  removeItem: (id, index) =>
    set((state) => {
      const inv = state.inventoryByPlayer[id]
      if (!inv) return {}
      const newInv = [...inv]
      newInv[index] = null
      return { inventoryByPlayer: { ...state.inventoryByPlayer, [id]: newInv } }
    }),
  setEquipmentSlot: (id, slot, itemKey) =>
    set((state) => {
      const eq = state.equipmentByPlayer[id] ?? makeDefaultEquipment()
      const next: Equipment = {
        ...eq,
        [slot]: itemKey ? itemRegistry[itemKey] : null
      }
      return {
        equipmentByPlayer: {
          ...state.equipmentByPlayer,
          [id]: next,
        }
      }
    }),
}))
