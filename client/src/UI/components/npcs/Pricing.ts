import type { Item } from "../../../store/useInventoryStore"
import { Coins, toBronze } from "./Currency"

// Fallback price if item.price is missing → derive from stats/rarity
const rarityBase: Record<NonNullable<Item['rarity']>, number> = {
    common: 20,
    uncommon: 40,
    rare: 100,
    epic: 250,
    legendary: 600,
}
// Pricing.ts
export function getBuyPrice(item: Item & { price?: number | Coins }) {
    const raw = (item as any).price
    const base = typeof raw === 'object' ? toBronze(raw) : (typeof raw === 'number' ? raw : 0)
    const rarityBase = { common: 20, uncommon: 40, rare: 100, epic: 250, legendary: 600 }
    const baseFromRarity = rarityBase[item.rarity || 'common'] || 20
    const atk = Number(item.attack || 0)
    const def = Number(item.defense || 0)
    const finalBase = base || baseFromRarity
    return Math.max(5, Math.round(finalBase + atk * 10 + def * 8))
}
export function getSellPrice(item: Item & { price?: number }, sellRate = 0.5) {
    return Math.max(1, Math.floor(getBuyPrice(item) * sellRate))
}
