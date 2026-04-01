import { useEffect, useRef } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useInventoryStore } from '../store/useInventoryStore'
import { itemRegistry, ItemKey } from '../items/itemRegistry'
import { Item } from '../store/useInventoryStore'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5174'
const DEBOUNCE_MS = 3000

// Reverse lookup by name (handles spread copies from shop/drops, not just registry references)
const nameToKey = new Map<string, ItemKey>()
for (const [key, item] of Object.entries(itemRegistry) as [ItemKey, Item][]) {
    nameToKey.set(item.name, key)
}

function itemToKey(item: Item | null): ItemKey | null {
    if (!item) return null
    return nameToKey.get(item.name) ?? null
}

export function useSaveEquipment(playerId: string) {
    const token = useAuthStore((s) => s.token)
    const equipment = useInventoryStore((s) => s.equipmentByPlayer[playerId])
    const inventory = useInventoryStore((s) => s.inventoryByPlayer[playerId])
    const prevRef = useRef<string>('')
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isFirstMount = useRef(true)

    useEffect(() => {
        if (!token || !equipment) return

        const equipmentKeys = Object.fromEntries(
            Object.entries(equipment).map(([slot, item]) => [slot, itemToKey(item)])
        )
        const inventoryKeys = (inventory ?? []).map((item) => itemToKey(item) ?? '')

        const serialized = JSON.stringify({ equipment: equipmentKeys, inventory: inventoryKeys })

        // On first mount, prime the ref with the loaded data so we don't save it back immediately
        if (isFirstMount.current) {
            isFirstMount.current = false
            prevRef.current = serialized
            return
        }

        if (serialized === prevRef.current) return
        prevRef.current = serialized

        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
            fetch(`${SERVER_URL}/auth/inventory`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: serialized,
            }).catch(() => {})
        }, DEBOUNCE_MS)

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [equipment, inventory, token])
}
