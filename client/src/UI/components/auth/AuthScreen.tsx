import { useState } from 'react'
import { useAuthStore } from '../../../store/useAuthStore'
import { useCharacterStore } from '../../../store/useCharacterStore'
import './AuthScreen.css'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5174'

export default function AuthScreen() {
    const [mode, setMode] = useState<'login' | 'register'>('login')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const setAuth = useAuthStore((s) => s.setAuth)
    const setCharName = useCharacterStore((s) => s.setName)
    const setWorld = useCharacterStore((s) => s.setWorld)
    const setPosition = useCharacterStore((s) => s.setPosition)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const body = mode === 'register'
                ? { email, password, name }
                : { email, password }

            const res = await fetch(`${SERVER_URL}/auth/${mode}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Error desconocido')
                return
            }

            const pos: [number, number, number] = [data.user.posX ?? 0, data.user.posY ?? 0, data.user.posZ ?? 0]
            const world = data.user.world ?? 'world1'

            setAuth(data.token, data.user.id, data.user.email, pos, world)
            setCharName(data.user.name)
            setWorld(world)
            setPosition(pos)
        } catch {
            setError('No se pudo conectar al servidor')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-screen">
            <div className="auth-box">
                <h1 className="auth-title">MMORPG</h1>
                <div className="auth-tabs">
                    <button
                        className={mode === 'login' ? 'active' : ''}
                        onClick={() => { setMode('login'); setError('') }}
                    >
                        Iniciar sesión
                    </button>
                    <button
                        className={mode === 'register' ? 'active' : ''}
                        onClick={() => { setMode('register'); setError('') }}
                    >
                        Registrarse
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {mode === 'register' && (
                        <input
                            type="text"
                            placeholder="Nombre de personaje"
                            value={name}
                            maxLength={16}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <p className="auth-error">{error}</p>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
                    </button>
                </form>
            </div>
        </div>
    )
}
