// 100 bronces = 1 plata, 100 platas = 1 oro  => 1 oro = 10_000 bronces
export const BRONZE_PER_SILVER = 100
export const SILVER_PER_GOLD = 100
export const BRONZE_PER_GOLD = BRONZE_PER_SILVER * SILVER_PER_GOLD // 10_000

export type Coins = { gold?: number; silver?: number; bronze?: number }

/** Convierte total en bronce a piezas G/S/B */
export function formatCurrency(totalBronze: number) {
  const gold   = Math.floor(totalBronze / BRONZE_PER_GOLD)
  const silver = Math.floor((totalBronze % BRONZE_PER_GOLD) / BRONZE_PER_SILVER)
  const bronze = totalBronze % BRONZE_PER_SILVER
  return { gold, silver, bronze }
}

/** Crea bronce total desde componentes */
export function toBronze({ gold = 0, silver = 0, bronze = 0 }: Coins) {
  return gold * BRONZE_PER_GOLD + silver * BRONZE_PER_SILVER + bronze
}

/** String bonito para UI */
export function currencyToString(totalBronze: number) {
  const { gold, silver, bronze } = formatCurrency(totalBronze)
  const parts: string[] = []
  if (gold) parts.push(`${gold}🟡`)
  if (silver) parts.push(`${silver}⚪`)
  if (bronze || parts.length === 0) parts.push(`${bronze}🟤`)
  return parts.join(' ')
}

export function currencyToStringFull(amount: number) {
  const gold = Math.floor(amount / 10000)
  const silver = Math.floor((amount % 10000) / 100)
  const bronze = amount % 100

  return `${gold}🟡 ${silver}⚪ ${bronze}🟤`
}
