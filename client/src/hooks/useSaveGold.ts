import { useEffect, useRef } from 'react'
import { useCharacterStore } from '../store/useCharacterStore'
import { useAuthStore } from '../store/useAuthStore'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5174'
const DEBOUNCE_MS = 3000

export function useSaveGold() {
    const gold = useCharacterStore((s) => s.gold)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isFirstMount = useRef(true)

    useEffect(() => {
        // Skip saving on the very first render (initial load from DB)
        if (isFirstMount.current) {
            isFirstMount.current = false
            return
        }

        const token = useAuthStore.getState().token
        if (!token) return

        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
            fetch(`${SERVER_URL}/auth/gold`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ gold }),
            }).catch(() => {})
        }, DEBOUNCE_MS)

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [gold])
}
