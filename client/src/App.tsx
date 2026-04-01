import './App.css'
import { Route, Routes } from 'react-router-dom'
import ShaderVisualizer from './components/shaders/ShaderVisualizer'
import Experience from './Experience'
import AuthScreen from './UI/components/auth/AuthScreen'
import { useAuthStore } from './store/useAuthStore'
import { useCharacterStore } from './store/useCharacterStore'
import { useInventoryStore, EquipmentSlot } from './store/useInventoryStore'
import { itemRegistry, ItemKey } from './items/itemRegistry'
import { useEffect, useState } from 'react'
import { socket } from './socket/SocketManager'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5174'

export function applyLoadout(socketId: string, equipment: Record<string, ItemKey | null>, inventory: (ItemKey | null)[]) {
  const { ensurePlayer, setEquipmentSlot } = useInventoryStore.getState()
  ensurePlayer(socketId)
  for (const [slot, key] of Object.entries(equipment) as [EquipmentSlot, ItemKey | null][]) {
    setEquipmentSlot(socketId, slot, key)
  }
  const inv = inventory.map((key) => (key && itemRegistry[key]) ? itemRegistry[key] : null)
  while (inv.length < 20) inv.push(null)
  useInventoryStore.setState((s) => ({
    inventoryByPlayer: { ...s.inventoryByPlayer, [socketId]: inv }
  }))
}

function emitPlayerJoin(name: string, userId: string) {
  if (socket.connected) {
    socket.emit('playerJoin', { name, userId })
  } else {
    socket.once('connect', () => socket.emit('playerJoin', { name, userId }))
  }
}

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

        if (typeof user.gold === 'number') {
          useCharacterStore.getState().addGold(user.gold - useCharacterStore.getState().gold)
        }

        const equipment = (user.equipment ?? {}) as Record<string, ItemKey | null>
        const inventory = Array.isArray(user.inventory) ? user.inventory as (ItemKey | null)[] : []
        useAuthStore.getState().setSavedLoadout(equipment, inventory)

        // 1. Emitir playerJoin con userId ya disponible
        emitPlayerJoin(user.name, user.id)

        // 2. Aplicar loadout al socket.id
        const sid = socket.id
        if (sid) {
          applyLoadout(sid, equipment, inventory)
        } else {
          socket.once('connect', () => applyLoadout(socket.id!, equipment, inventory))
        }
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
