// store/useInventoryStore.ts
import { create } from 'zustand'
import swordItem from '../components/weapons/sword/Sword-Item'
/** Los slots de equipo válidos */
export type EquipmentSlot =
  | 'helmet'
  | 'chest'
  | 'legs'
  | 'boots'
  | 'gloves'
  | 'weapon'
  | 'shield'

/** Tipos de ítems consumibles */
export type ConsumableType = 'potion' | 'consumable'

/** Union de todos los tipos posibles de ítem */
export type ItemType = EquipmentSlot | ConsumableType

/** Estructura de un ítem */
export interface Item {
  type: ItemType
  name: string
  image: string
  // ...otros campos que necesites
}

export interface InventoryState {
  /** 20 ranuras de inventario, algunas inicializadas con una espada */
  inventory: Array<Item | null>
  /** Ítems equipados por slot */
  equipment: Record<EquipmentSlot, Item | null>

  /** Usa un ítem consumible en la ranura dada */
  useItem: (index: number) => void
  /** Mueve un ítem dentro del inventario */
  moveItem: (fromIndex: number, toIndex: number) => void
  /** Equipar un ítem desde el inventario a un slot */
  equipItem: (fromIndex: number, slotType: EquipmentSlot) => void
  /** Desequipar un ítem a la primera ranura vacía */
  unequipItem: (slotType: EquipmentSlot) => void
}

export const useInventoryStore = create<InventoryState>((set) => ({
  inventory: Array(20)
    .fill(null)
    .map((_, i) =>
      i === 0 || i === 1 || i === 2 ? (swordItem as Item) : null
    ),

  equipment: {
    helmet: null,
    chest: null,
    legs: null,
    boots: null,
    gloves: null,
    weapon: null,
    shield: null,
  },

  useItem: (index) =>
    set((state) => {
      const item = state.inventory[index]
      if (!item || (item.type !== 'potion' && item.type !== 'consumable')) {
        return {}
      }

      console.log(`Using item: ${item.name}`)

      const newInventory = [...state.inventory]
      newInventory[index] = null

      return { inventory: newInventory }
    }),

  moveItem: (fromIndex, toIndex) =>
    set((state) => {
      const newInventory = [...state.inventory]
      const tmp = newInventory[toIndex]
      newInventory[toIndex] = newInventory[fromIndex]
      newInventory[fromIndex] = tmp
      return { inventory: newInventory }
    }),

  equipItem: (fromIndex, slotType) =>
    set((state) => {
      const itemToEquip = state.inventory[fromIndex]
      if (!itemToEquip || itemToEquip.type !== slotType) {
        return {}
      }

      const currentlyEquipped = state.equipment[slotType]
      const newInventory = [...state.inventory]
      newInventory[fromIndex] = currentlyEquipped || null

      return {
        inventory: newInventory,
        equipment: {
          ...state.equipment,
          [slotType]: itemToEquip,
        },
      }
    }),

  unequipItem: (slotType) =>
    set((state) => {
      const item = state.equipment[slotType]
      if (!item) {
        return {}
      }

      const newInventory = [...state.inventory]
      const emptyIndex = newInventory.findIndex((slot) => slot === null)
      if (emptyIndex === -1) {
        console.warn('No hay espacio en el inventario para desequipar.')
        return {}
      }

      newInventory[emptyIndex] = item
      return {
        inventory: newInventory,
        equipment: {
          ...state.equipment,
          [slotType]: null,
        },
      }
    }),
}))
