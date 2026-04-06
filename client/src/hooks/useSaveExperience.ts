import { useEffect, useRef } from 'react'
import { useCharacterStore } from '../store/useCharacterStore'
import { useAuthStore } from '../store/useAuthStore'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5174'
const DEBOUNCE_MS = 2000

export function useSaveExperience() {
    const level = useCharacterStore((s) => s.level)
    const exp = useCharacterStore((s) => s.exp)
    const statPoints = useCharacterStore((s) => s.statPoints)
    const strength = useCharacterStore((s) => s.strength)
    const agility = useCharacterStore((s) => s.agility)
    const intelligence = useCharacterStore((s) => s.intelligence)
    const critRate = useCharacterStore((s) => s.critRate)

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isFirstMount = useRef(true)

    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false
            return
        }

        const token = useAuthStore.getState().token
        if (!token) return

        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
            fetch(`${SERVER_URL}/auth/experience`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ level, exp, statPoints, strength, agility, intelligence, critRate }),
            }).catch(() => {})
        }, DEBOUNCE_MS)

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [level, exp, statPoints, strength, agility, intelligence, critRate])
}
