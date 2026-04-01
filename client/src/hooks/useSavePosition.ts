import { useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useCharacterStore } from '../store/useCharacterStore'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5174'
const SAVE_INTERVAL_MS = 30_000

function savePosition(token: string) {
    const { position, world } = useCharacterStore.getState()
    fetch(`${SERVER_URL}/auth/position`, {
        method: 'PUT',
        keepalive: true,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ posX: position[0], posY: position[1], posZ: position[2], world }),
    }).catch(() => { })
}

export function useSavePosition() {
    const token = useAuthStore((s) => s.token)

    useEffect(() => {
        if (!token) return

        const interval = setInterval(() => savePosition(token), SAVE_INTERVAL_MS)
        const handleUnload = () => savePosition(token)
        window.addEventListener('beforeunload', handleUnload)

        return () => {
            clearInterval(interval)
            window.removeEventListener('beforeunload', handleUnload)
        }
    }, [token])
}
