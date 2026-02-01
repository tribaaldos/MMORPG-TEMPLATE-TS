import './SkillsBar.css'
import { useCallback } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { useAbilityStore, abilityMeta, AbilityId } from '../../character/skills/useAbilityStore'

const SLOT_KEYS = ['Key1', 'Key2', 'Key3', 'Key4'] as const
const ITEM_TYPE = 'ABILITY'

type DragItem = { abilityId: AbilityId; fromKey?: string }

export default function SkillsBar() {
    const slots = useAbilityStore((s) => s.slots)
    const setAbility = useAbilityStore((s) => s.setAbility)

    return (
        <div className="skills-bar">
            {SLOT_KEYS.map((key) => {
                const abilityId = slots[key]
                const meta = abilityId ? abilityMeta[abilityId] : null

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
                    item: abilityId ? ({ abilityId, fromKey: key } as DragItem) : undefined,
                    canDrag: !!abilityId,
                    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
                }), [abilityId, key])

                const setRefs = useCallback((node: HTMLDivElement | null) => {
                    dragRef(dropRef(node))
                }, [dragRef, dropRef])

                return (
                    <div
                        className="skill-slot"
                        key={key}
                        ref={setRefs}
                        title={meta?.name ?? 'Vacío'}
                        style={{ outline: isOver ? '2px solid #ffdf9c' : 'none', opacity: isDragging ? 0.6 : 1 }}
                    >
                        {meta?.icon ? (
                            <img src={meta.icon} alt={meta.name} />
                        ) : (
                            <span className="skill-empty">+</span>
                        )}
                        <span className="skill-key">{key.replace('Key', '')}</span>
                    </div>
                )
            })}
        </div>
    )
}