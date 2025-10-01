// iceSkill/IceSkill.tsx
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import { useCharacterStore } from '../../../store/useCharacterStore'
import { useTargetStore } from '../../../store/useTargetStore'
import { useIceSkillStore } from './useIceSkillStore'

type IceSkillOptions = {
  speed?: number   // m/s
  radius?: number
  damage?: number
  yOffset?: number // ajuste vertical del origen
}

/** Dispara una bola de hielo desde charPos hacia el target seleccionado y la guarda en el store. */
export function castIceSkill(opts: IceSkillOptions = {}) {
  const sel = useTargetStore.getState().selectedTarget
  const charPos = useCharacterStore.getState().model

  if (!sel?.position) return
  if (!charPos) return

  // Origen: SOLO desde charPos
  const origin = charPos.clone()
  origin.y += opts.yOffset ?? -0.25

  // Dirección hacia el target (snapshot)
  const end = sel.position.clone()
  const dir = end.clone().sub(origin).normalize()

  // TTL justo para llegar (sin colisiones/homing)
  const speed = opts.speed ?? 12
  const dist = origin.distanceTo(end)
  const ttl = dist / speed

  useIceSkillStore.getState().add({
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? (crypto as any).randomUUID()
        : `p_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    position: origin,   // THREE.Vector3
    direction: dir,     // THREE.Vector3 (normalizado)
    speed,
    ttl,
    radius: opts.radius ?? 0.2,
    damage: opts.damage ?? 20,
    targetId: sel.id,
  })
}

/** Renderer muy simple: mueve por speed/ttl y dibuja una esfera por proyectil (sin colisiones). */
export function IceSkillRenderer() {
  const list = useIceSkillStore(s => s.list)
  const remove = useIceSkillStore(s => s.remove)

  useFrame((_, dt) => {
    for (const p of [...list]) {
      p.ttl -= dt
      if (p.ttl <= 0) { remove(p.id); continue }
      p.position.addScaledVector(p.direction, p.speed * dt)
    }
  })

  if (!list.length) return null

  return (
    <Instances limit={256}>
      {/* Geometría base radio 1; cada instancia escala por p.radius */}
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial color="#55c1ff" emissive="#55c1ff" emissiveIntensity={1.5} />
      {list.map(p => (
        <Instance key={p.id} position={p.position} scale={[p.radius, p.radius, p.radius]} />
      ))}
    </Instances>
  )
}
