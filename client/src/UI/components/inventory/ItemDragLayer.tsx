import { useDragLayer } from 'react-dnd'
import { useInventoryStore } from '../../../store/useInventoryStore'
import { socket } from '../../../socket/SocketManager'

export default function ItemDragLayer() {
  const { isDragging, item, offset } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
    item: monitor.getItem(),
    offset: monitor.getClientOffset(),
  }))

  const playerId = socket.id ?? 'local-fallback'
  const inventory = useInventoryStore((s) => s.inventoryByPlayer[playerId])

  if (!isDragging || !offset || !item || !inventory) return null
  const dragged = inventory[item.index]
  if (!dragged) return null

  const img = dragged.image
  const icon = typeof img === 'string'
    ? <img src={img} alt={dragged.name} style={{ width: 36, height: 36, objectFit: 'contain', display: 'block' }} />
    : (() => { const C = img as any; return <C style={{ width: 36, height: 36, display: 'block' }} /> })()

  return (
    <div style={{
      position: 'fixed',
      pointerEvents: 'none',
      zIndex: 99999,
      left: offset.x - 18,
      top: offset.y - 18,
      width: 36,
      height: 36,
      filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.9))',
      opacity: 0.92,
    }}>
      {icon}
    </div>
  )
}
