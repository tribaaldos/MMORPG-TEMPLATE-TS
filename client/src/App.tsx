import './App.css'
import { Route, Routes } from 'react-router-dom'
import ShaderVisualizer from './components/shaders/ShaderVisualizer'
import Experience from './Experience'
import AuthScreen from './UI/components/auth/AuthScreen'
import { useAuthStore } from './store/useAuthStore'
import { useCharacterStore } from './store/useCharacterStore'
import { useEffect, useState } from 'react'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5174'

function App() {
  const token = useAuthStore((s) => s.token)
  const setAuth = useAuthStore((s) => s.setAuth)
  const setCharName = useCharacterStore((s) => s.setName)
  const setWorld = useCharacterStore((s) => s.setWorld)
  const setPosition = useCharacterStore((s) => s.setPosition)

  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!token) { setReady(true); return }

    fetch(`${SERVER_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((user) => {
        if (user.error) { useAuthStore.getState().logout(); setReady(true); return }
        const pos: [number, number, number] = [user.posX, user.posY, user.posZ]
        setAuth(token, user.id, user.email, pos, user.world)
        setCharName(user.name)
        setWorld(user.world)
        setPosition(pos)
      })
      .catch(() => useAuthStore.getState().logout())
      .finally(() => setReady(true))
  }, [])

  if (!ready) return <div style={{ width: '100vw', height: '100vh', background: '#0a0a0f' }} />

  return (
    <Routes>
      <Route path="/shader-visualizer" element={<ShaderVisualizer />} />
      <Route path="/shader-visualizer/:id" element={<ShaderVisualizer />} />
      <Route path="/" element={token ? <Experience /> : <AuthScreen />} />
    </Routes>
  )
}

export default App
