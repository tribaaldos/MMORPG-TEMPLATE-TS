import { useLootStore } from '../../../store/useLootStore'
import { useInventoryStore } from '../../../store/useInventoryStore'
import { socket } from '../../../socket/SocketManager'
import './LootPopup.css'

export default function LootPopup() {
  const { isOpen, items, taken, takeItem, closeLoot } = useLootStore()

  if (!isOpen) return null

  const playerId = socket.id ?? 'local-fallback'

  const handleTake = (index: number) => {
    useInventoryStore.getState().addItem(playerId, items[index])
    takeItem(index)
  }

  return (
    <div className="loot-overlay">
      <div className="loot-box">
        <div className="loot-header">
          <span>📦</span>
          <span className="loot-title">Cofre abierto</span>
        </div>
        <div className="loot-items">
          {items.map((item, i) => (
            <div key={i} className={`loot-row ${taken[i] ? 'loot-row--taken' : ''}`}>
              <div className="loot-row-left">
                <span className="loot-icon">🪖</span>
                <span className={`loot-name ${item.rarity ?? 'common'}`}>{item.name}</span>
              </div>
              <button
                className="loot-btn"
                disabled={taken[i]}
                onClick={() => handleTake(i)}
              >
                {taken[i] ? '✓ Recogido' : 'Recoger'}
              </button>
            </div>
          ))}
        </div>
        <button className="loot-close" onClick={closeLoot}>Cerrar</button>
      </div>
    </div>
  )
}
