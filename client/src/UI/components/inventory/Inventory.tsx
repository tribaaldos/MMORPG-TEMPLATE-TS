// components/Inventory.tsx
import React from 'react'
import './Inventory.css'
import { useDrag, useDrop, DragSourceMonitor, DropTargetMonitor } from 'react-dnd'
import { useInventoryStore, Item, EquipmentSlot } from '../../../store/useInventoryStore'

/** Props para cada casilla de inventario */
interface InventorySlotProps {
  item: Item | null
  index: number
  onDrop: (fromIndex: number, toIndex: number) => void
}

/** La forma del objeto que arrastramos */
interface DraggedItem {
  index: number
}

const InventorySlot: React.FC<InventorySlotProps> = ({ item, index, onDrop }) => {
  const equipItem = useInventoryStore((s) => s.equipItem)
  const useItem = useInventoryStore((s) => s.useItem)
  const equipment = useInventoryStore((s) => s.equipment)

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
    if (!item) return

    if (item.type in equipment) {
      equipItem(index, item.type as EquipmentSlot)
    } else if (item.type === 'potion' || item.type === 'consumable') {
      useItem(index)
    } else {
      console.log('No se puede usar este ítem.')
    }
  }

  return (
    <div ref={dropRef} className="inventory-slot" onContextMenu={handleRightClick}>
      {item ? (
        <img
          ref={dragRef as React.Ref<HTMLImageElement>}
          src={item.image}
          alt={item.name}
          style={{ opacity: isDragging ? 0.5 : 1, width: '100%' }}
        />
      ) : (
        <span className="slot-index">{index + 1}</span>
      )}
    </div>
  )
}

const Inventory: React.FC = () => {
  const inventory = useInventoryStore((s) => s.inventory)
  const moveItem = useInventoryStore((s) => s.moveItem)

  return (
    <div className="inventory">
      <h2>🎒 Inventory</h2>
      <div className="inventory-grid">
        {inventory.map((item, idx) => (
          <InventorySlot key={idx} item={item} index={idx} onDrop={moveItem} />
        ))}
      </div>
    </div>
  )
}

export default Inventory
