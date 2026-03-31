import { useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useCharacterStore } from '../store/useCharacterStore'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5174'
const SAVE_INTERVAL_MS = 30_000

function savePosition(token: string) {
    const { position, world } = useCharacterStore.getState()
    const body = JSON.stringify({ posX: position[0], posY: position[1], posZ: position[2], world })
    // sendBeacon para cuando se cierra la pestaña
    navigator.sendBeacon(
        `${SERVER_URL}/auth/position-beacon?token=${encodeURIComponent(token)}`,
        new Blob([body], { type: 'application/json' })
    )
    // fetch normal para los intervalos
    fetch(`${SERVER_URL}/auth/position`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body,
    }).catch(() => { })
}

export function useSavePosition() {
    const token = useAuthStore((s) => s.token)

    useEffect(() => {
        if (!token) return

        // Guarda cada 30 segundos
        const interval = setInterval(() => savePosition(token), SAVE_INTERVAL_MS)

        // Guarda al cerrar/recargar la pestaña
        const handleUnload = () => savePosition(token)
        window.addEventListener('beforeunload', handleUnload)

        return () => {
            clearInterval(interval)
            window.removeEventListener('beforeunload', handleUnload)
        }
    }, [token])
}
