// ProjectilesLayer.tsx (lógica + render por tipo)
import React, { useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { socket } from '../../socket/SocketManager'
import { useMonsterStore } from '../../worlds/dungeons/monsters/useMonsterStore'
import { useCharacterStore } from '../../store/useCharacterStore'
import { useProjectilesStore } from './useProjectileStore'

// Tus componentes shader ya existentes (asegúrate de exportar con estos nombres)
import { ProjectileIce } from './iceSkill/ProjectileIce'
import { ProjectileIceExplosion } from './iceSkill/ExplosionIce'
import { FireProjectile } from './fireSkill/ProjectileFire'
import { FireExplosion } from './fireSkill/ExplosionFire'
type Explosion = {
  id: string
  pos: THREE.Vector3
  age: number
  life: number
  world: string | null
  kind: 'fire' | 'ice'
}

export default function ProjectilesLayer({
  homingLerp = 0.12,
  targetRadius = 0.4,
  explosionLife = 1.0,
}: {
  homingLerp?: number
  targetRadius?: number
  explosionLife?: number
}) {
  const { list, remove } = useProjectilesStore()
  const world = useCharacterStore((s) => s.world)
  const [explosions, setExplosions] = useState<Explosion[]>([])

  // Solo proyectiles del mundo actual
  const visible = useMemo(
    () => list.filter((p) => (p.world ?? null) === (world ?? null)),
    [list, world]
  )

  const spawnExplosion = (pos: THREE.Vector3, kind: 'fire' | 'ice') => {
    setExplosions((prev) => [
      ...prev,
      {
        id: `exp_${performance.now()}_${Math.random().toString(36).slice(2)}`,
        pos: pos.clone(),
        age: 0,
        life: explosionLife,
        world: world ?? null,
        kind,
      },
    ])
  }

  useFrame((_, delta) => {
    const { monsters, damage } = useMonsterStore.getState()

    for (const p of [...visible]) {
      // TTL
      p.ttl -= delta
      if (p.ttl <= 0) {
        remove(p.id)
        continue
      }

      // Hitpoint / homing
      let hitPos: THREE.Vector3 | null = null
      if (p.targetId) {
        const t = monsters[p.targetId]
        if (t?.position) {
          hitPos = t.position.clone()
          if ((p as any).aimOffsetY != null) hitPos.y += (p as any).aimOffsetY
        }
      } else if ((p as any).aim) {
        hitPos = (p as any).aim as THREE.Vector3
      }

      if (hitPos) {
        const dir = hitPos.clone().sub(p.position).normalize()
        p.direction.lerp(dir, homingLerp)
      }

      // mover
      p.position.addScaledVector(p.direction, p.speed * delta)
      if (p.mesh) p.mesh.position.copy(p.position)

      // colisión
      if (hitPos && p.position.distanceTo(hitPos) <= p.radius + targetRadius) {
        const m = p.targetId ? monsters[p.targetId] : null
        if (m) {
          damage(m.id, p.damage)
          try {
            socket.emit?.('hitMonster', { id: m.id, damage: p.damage })
          } catch { }
        }
        spawnExplosion(p.position, (p as any).kind ?? 'fire') // default por si faltara
        remove(p.id)
      }
    }

    // vida de explosiones
    setExplosions((prev) => {
      const next = prev
        .map((fx) => {
          if ((fx.world ?? null) !== (world ?? null)) return fx
          return { ...fx, age: fx.age + delta }
        })
        .filter((fx) => (fx.world ?? null) === (world ?? null) && fx.age < fx.life)

      // ¡IMPORTANTE! devolvemos siempre 'next' para que React re-renderice
      return next
    })
  })

  return (
    <>
      {/* Proyectiles por tipo */}
      {visible.map((p) => {
        const kind = (p as any).kind as 'ice' | 'fire'
        const Comp = kind === 'ice' ? ProjectileIce : FireProjectile
        return (
          <Comp
            key={p.id}
            ref={(m) => {
              if (m) {
                p.mesh = m
                m.position.copy(p.position)
              }
            }}
          />
        )
      })}

      {/* Explosiones por tipo */}
      {explosions.map((fx) => {
        const Exp = fx.kind === 'ice' ? ProjectileIceExplosion : FireExplosion
        return (
          <group key={fx.id} position={fx.pos}>
            <Exp />
          </group>
        )
      })}
    </>
  )
}
