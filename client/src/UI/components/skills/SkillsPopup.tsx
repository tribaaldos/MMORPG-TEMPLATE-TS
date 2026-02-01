import './SkillsPopup.css'
import { useMemo, useState, useCallback } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { useAbilityStore, abilityList, abilityMeta, AbilityId } from '../../../character/skills/useAbilityStore'

const SLOT_KEYS = ['Key1', 'Key2', 'Key3', 'Key4'] as const
const ITEM_TYPE = 'ABILITY'

type DragItem = { abilityId: AbilityId; fromKey?: string }

export default function SkillsPopup() {
  const slots = useAbilityStore((s) => s.slots)
  const setAbility = useAbilityStore((s) => s.setAbility)
  const setSkillsOpen = useAbilityStore((s) => s.setSkillsOpen)
  const [selected, setSelected] = useState<AbilityId | null>(null)

  const abilities = useMemo(() => abilityList, [])

  return (
    <div className="skills-popup">
      <div className="skills-popup-header">
        <div className="skills-popup-title">
          <h3>Habilidades</h3>
          <button className="skills-popup-close" onClick={() => setSkillsOpen(false)}>×</button>
        </div>
        <p>Selecciona una habilidad y asígnala a un slot.</p>
      </div>

      <div className="skills-popup-grid">
        {abilities.map((id) => {
          const meta = abilityMeta[id]
          const [{ isDragging }, dragRef] = useDrag(() => ({
            type: ITEM_TYPE,
            item: { abilityId: id } as DragItem,
            collect: (monitor) => ({ isDragging: monitor.isDragging() }),
          }), [id])

          return (
            <button
              key={id}
              ref={dragRef}
              className={`skills-popup-card ${selected === id ? 'active' : ''}`}
              onClick={() => setSelected(id)}
              title={meta.description ?? meta.name}
              style={{ opacity: isDragging ? 0.5 : 1 }}
            >
              {meta.icon && <img src={meta.icon} alt={meta.name} />}
              <span>{meta.name}</span>
            </button>
          )
        })}
      </div>

      <div className="skills-popup-slots">
        {SLOT_KEYS.map((key) => {
          const id = slots[key]
          const meta = id ? abilityMeta[id] : null

          const [{ isOver }, dropRef] = useDrop(() => ({
            accept: ITEM_TYPE,
            drop: (item: DragItem) => {
              if (!item?.abilityId) return
              const fromKey = item.fromKey
              if (fromKey && fromKey !== key) {
                const targetId = slots[key]
                setAbility(key, item.abilityId)
                setAbility(fromKey, targetId ?? null)
                return
              }
              setAbility(key, item.abilityId)
            },
            collect: (monitor) => ({ isOver: monitor.isOver() }),
          }), [key, setAbility, slots])

          const [{ isDragging }, dragRef] = useDrag(() => ({
            type: ITEM_TYPE,
            item: id ? ({ abilityId: id, fromKey: key } as DragItem) : undefined,
            canDrag: !!id,
            collect: (monitor) => ({ isDragging: monitor.isDragging() }),
          }), [id, key])

          const setRefs = useCallback((node: HTMLButtonElement | null) => {
            dragRef(dropRef(node))
          }, [dragRef, dropRef])

          return (
            <button
              key={key}
              ref={setRefs}
              className="skills-popup-slot"
              onClick={() => setAbility(key, selected)}
              style={{ outline: isOver ? '2px solid #ffdf9c' : 'none', opacity: isDragging ? 0.6 : 1 }}
            >
              <div className="slot-key">{key.replace('Key', '')}</div>
              {meta?.icon ? <img src={meta.icon} alt={meta.name} /> : <span className="slot-empty">Vacío</span>}
              <div className="slot-name">{meta?.name ?? 'Sin asignar'}</div>
            </button>
          )
        })}
      </div>

      <div className="skills-popup-footer">
        <button className="skills-clear" onClick={() => setSelected(null)}>Limpiar selección</button>
      </div>
    </div>
  )
}
