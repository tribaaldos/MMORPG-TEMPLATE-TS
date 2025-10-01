import { create } from 'zustand'
import type { Item } from '../useInventoryStore'
import { swordsForSale } from '../../components/npc/Shop'

export type ShopItem = Item & {
  id: string
  price: number
}

type State = {
  isOpen: boolean
  vendorName?: string
  items: ShopItem[]
  openShop: (vendorName: string, items: ShopItem[]) => void
  closeShop: () => void
}

export const useShopStore = create<State>((set) => ({
  isOpen: false,
  vendorName: undefined,
  items: [],
  openShop: (vendorName, items) => set({ isOpen: true, vendorName, items }),
  closeShop: () => set({ isOpen: false, vendorName: undefined, items: [] }),
}))
