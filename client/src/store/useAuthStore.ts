import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
    token: string | null
    userId: string | null
    email: string | null
    // posición guardada en servidor — se usa al entrar al juego
    startPos: [number, number, number]
    startWorld: string
    setAuth: (token: string, userId: string, email: string, pos: [number, number, number], world: string) => void
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
            setAuth: (token, userId, email, startPos, startWorld) =>
                set({ token, userId, email, startPos, startWorld }),
            logout: () =>
                set({ token: null, userId: null, email: null, startPos: [0, 1, 0], startWorld: 'world1' }),
        }),
        { name: 'auth-storage' }
    )
)
