import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { EquipmentSlot } from './useInventoryStore'
import { ItemKey } from '../items/itemRegistry'

export type SavedEquipment = Partial<Record<EquipmentSlot, ItemKey | null>>

interface AuthState {
    token: string | null
    userId: string | null
    email: string | null
    startPos: [number, number, number]
    startWorld: string
    // equipo e inventario cargados desde DB, se aplican al socket.id al conectar
    savedEquipment: SavedEquipment
    savedInventory: (ItemKey | null)[]
    setAuth: (token: string, userId: string, email: string, pos: [number, number, number], world: string) => void
    setSavedLoadout: (equipment: SavedEquipment, inventory: (ItemKey | null)[]) => void
    setStartPos: (pos: [number, number, number], world: string) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            userId: null,
            email: null,
            startPos: [0, 1, 0],
            startWorld: 'world1',
            savedEquipment: {},
            savedInventory: [],
            setAuth: (token, userId, email, startPos, startWorld) =>
                set({ token, userId, email, startPos, startWorld }),
            setSavedLoadout: (savedEquipment, savedInventory) =>
                set({ savedEquipment, savedInventory }),
            setStartPos: (pos, world) =>
                set({ startPos: pos, startWorld: world }),
            logout: () =>
                set({ token: null, userId: null, email: null, startPos: [0, 1, 0], startWorld: 'world1', savedEquipment: {}, savedInventory: [] }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
)
