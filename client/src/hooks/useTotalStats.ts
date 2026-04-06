import { useCharacterStore } from '../store/useCharacterStore'
import { useInventoryStore, ItemBonuses } from '../store/useInventoryStore'
import { useShallow } from 'zustand/react/shallow'

export interface TotalStats {
  strength: number
  agility: number
  intelligence: number
  critRate: number
  maxHp: number
  maxMana: number
  bonuses: Required<ItemBonuses>
}

const ZERO_BONUSES: Required<ItemBonuses> = {
  strength: 0,
  agility: 0,
  intelligence: 0,
  critRate: 0,
  maxHp: 0,
  maxMana: 0,
}

export function useTotalStats(playerId: string): TotalStats {
  const base = useCharacterStore(useShallow((s) => ({
    strength: s.strength,
    agility: s.agility,
    intelligence: s.intelligence,
    critRate: s.critRate,
    maxHp: s.maxHp,
    maxMana: s.maxMana,
  })))
  const equipment = useInventoryStore(useShallow((s) => s.equipmentByPlayer[playerId]))

  const bonuses: Required<ItemBonuses> = { ...ZERO_BONUSES }

  if (equipment) {
    for (const item of Object.values(equipment)) {
      if (!item?.bonuses) continue
      for (const key of Object.keys(bonuses) as (keyof ItemBonuses)[]) {
        const val = item.bonuses[key]
        if (typeof val === 'number') bonuses[key] += val
      }
    }
  }

  return {
    strength:     base.strength     + bonuses.strength,
    agility:      base.agility      + bonuses.agility,
    intelligence: base.intelligence + bonuses.intelligence,
    critRate:     base.critRate     + bonuses.critRate,
    maxHp:        base.maxHp        + bonuses.maxHp,
    maxMana:      base.maxMana      + bonuses.maxMana,
    bonuses,
  }
}
