import { useMemo } from "react"
import { useTargetStore } from "../../../store/useTargetStore"
import { useMonsterStore } from "../../../worlds/dungeons/monsters/useMonsterStore"
import './TargetPopUp.css'

export default function TargetPopup() {
  // Hooks: SIEMPRE al tope y sin condicionales
  const selected = useTargetStore((s) => s.selectedTarget)
  const monsters = useMonsterStore((s) => s.monsters)

  // Derivar el monstruo (puede ser undefined)
  const monster = selected ? monsters[selected.id] : undefined

  // Valores seguros para que los hooks puedan ejecutarse siempre
  const lvl   = monster?.level ?? 1
  const hp    = Math.max(0, monster?.hp ?? 0)
  const maxHp = Math.max(1, monster?.maxHp ?? 100)

  // Hook SIEMPRE llamado (aunque luego no renderices nada)
  const pct = useMemo(
    () => Math.min(100, Math.round((hp / maxHp) * 100)),
    [hp, maxHp]
  )

  // Ahora sí: cortar el render si no hay target/monster
  if (!selected || !monster) return null

  return (
    <div className="target-card">
      <div className="target-title">{lvl} {monster.name}</div>
      <div className="hp-bar">
        <div
          className="hp-bar-fill"
          style={{ width: `${pct}%` }}
          aria-label={`HP ${hp}/${maxHp}`}
        />
      </div>
      <div className="hp-text" aria-hidden>
        {hp} / {maxHp}
      </div>
    </div>
  )
}
