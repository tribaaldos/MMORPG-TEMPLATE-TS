// components/Inventory.tsx
import React, { useEffect } from 'react'
import './Inventory.css'
import { useDrag, useDrop, DragSourceMonitor, DropTargetMonitor } from 'react-dnd'
import { useInventoryStore, Item, EquipmentSlot } from '../../../store/useInventoryStore'
import { useCharacterStore } from '../../../store/useCharacterStore'
import { currencyToStringFull } from '../npcs/Currency'
import { itemRegistry, ItemKey } from '../../../items/itemRegistry'
import { emitPlayerEquipment } from '../../../socket/SocketManager'  // 👈 helper centralizado
import { socket } from '../../../socket/SocketManager' // sólo para obtener playerId local

/** (Opcional) props para tus SVGs */
type IconProps = {
  size?: number | string
  backgroundColor?: string
  strokeColor?: string
  strokeWidth?: number
  iconColor?: string
}

/** Props de celda de inventario */
interface InventorySlotProps {
  item: Item | null
  index: number
  onDrop: (fromIndex: number, toIndex: number) => void
  onRightClick: (index: number) => void
}

/** Objeto que arrastramos */
interface DraggedItem {
  index: number
}

/** Slots de equipo válidos */
const EQUIPMENT_SLOTS = new Set<EquipmentSlot>([
  'helmet', 'chest', 'legs', 'boots', 'gloves',
  'weapon', 'shield', 'shoulders', 'ring', 'trinket'
])

/** Render del icono (string URL o componente React) */
function renderIcon(item: Item, className: string, size: number) {
  const ImgOrComp = item.image as any

  if (typeof ImgOrComp === 'string') {
    return <img src={ImgOrComp} alt={item.name} className={className} />
  }
  const Icon: React.ComponentType<IconProps> = ImgOrComp
  const props = { ...(item as any).imageProps, className } as IconProps
  return <Icon {...props} />
}

const InventorySlot: React.FC<InventorySlotProps> = ({ item, index, onDrop, onRightClick }) => {
  const [{ isDragging }, dragRef] = useDrag<DraggedItem, void, { isDragging: boolean }>(
    () => ({
      type: 'ITEM',
      item: { index },
      collect: (monitor: DragSourceMonitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [index]
  )

  const [, dropRef] = useDrop<DraggedItem, void, unknown>(
    () => ({
      accept: 'ITEM',
      drop: (dragged: DraggedItem, _monitor: DropTargetMonitor) => {
        onDrop(dragged.index, index)
      },
    }),
    [onDrop, index]
  )

  const handleRightClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    onRightClick(index)
  }

  return (
    // @ts-ignore
    <div ref={dropRef} className="inventory-slot" onContextMenu={handleRightClick}>
      {item ? (
        <div
          ref={dragRef as unknown as React.Ref<HTMLDivElement>}
          className="item-wrapper"
          style={{ opacity: isDragging ? 0.5 : 1 }}
        >
          {renderIcon(item, 'item-icon', 32)}

          <div className="tooltip">
            {renderIcon(item, 'tooltip-icon', 48)}
            <h4 className={`tooltip-name ${item.rarity || 'common'}`}>{item.name}</h4>
            {item.description && <p className="tooltip-desc">{item.description}</p>}
            <ul className="tooltip-stats">
              {item.attack && <li>⚔️ Attack: {item.attack}</li>}
              {item.defense && <li>🛡️ Defense: {item.defense}</li>}
            </ul>
          </div>
        </div>
      ) : (
        <span className="slot-index">{index + 1}</span>
      )}
    </div>
  )
}

const Inventory: React.FC = () => {
  // playerId SIEMPRE local (socket.id) con fallback
  const playerId = socket?.id ?? 'local-fallback'

  // Asegura que exista el estado del jugador
  const ensurePlayer = useInventoryStore(s => s.ensurePlayer)
  useEffect(() => { ensurePlayer(playerId) }, [ensurePlayer, playerId])

  // Inventario y acciones
  const inventory = useInventoryStore(s => s.inventoryByPlayer[playerId] ?? [])
  const moveItem  = useInventoryStore(s => s.moveItem)
  const equipItem = useInventoryStore(s => s.equipItem)
  const useItem   = useInventoryStore(s => s.useItem)

  // Stats/Currency
  const gold = useCharacterStore(s => s.gold)

  // mover entre slots
  const handleDrop = (fromIndex: number, toIndex: number) => {
    moveItem(playerId, fromIndex, toIndex)
  }

  // equip / usar con click derecho
  const handleRightClick = (index: number) => {
    const item = inventory[index]
    if (!item) return

    if (EQUIPMENT_SLOTS.has(item.type as EquipmentSlot)) {
      const slot = item.type as EquipmentSlot

      // 1) local
      equipItem(playerId, index, slot)

      // 2) obtener clave compacta (por nombre para soportar spread copies del shop)
      const key = (Object.keys(itemRegistry) as ItemKey[])
        .find(k => itemRegistry[k].name === item.name) ?? null

      // 3) emitir usando el helper centralizado
      emitPlayerEquipment(slot, key)
      return
    }

    if (item.type === 'potion' || item.type === 'consumable') {
      useItem(playerId, index)
      return
    }
    console.log('No se puede usar este ítem.')
  }

  // ... JSX igual


  return (
    <div className="inventory">
      <h2>🎒 Inventory</h2>
      <div className="inventory-grid">
        {inventory.map((item, idx) => (
          <InventorySlot
            key={idx}
            item={item}
            index={idx}
            onDrop={handleDrop}
            onRightClick={handleRightClick}
          />
        ))}
      </div>
      <p>{currencyToStringFull(gold)}</p>
    </div>
  )
}

export default Inventory
