import { create } from 'zustand'
import type { Item } from './useInventoryStore'

interface LootState {
  isOpen: boolean
  items: Item[]
  taken: boolean[]
  openLoot: (items: Item[]) => void
  takeItem: (index: number) => void
  closeLoot: () => void
}

export const useLootStore = create<LootState>((set, get) => ({
  isOpen: false,
  items: [],
  taken: [],

  openLoot: (items) =>
    set({ isOpen: true, items, taken: items.map(() => false) }),

  takeItem: (index) => {
    const taken = [...get().taken]
    taken[index] = true
    set({ taken })
  },

  closeLoot: () => set({ isOpen: false, items: [], taken: [] }),
}))
