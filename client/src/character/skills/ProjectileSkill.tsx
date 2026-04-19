// ProjectilesLayer.tsx (lógica + render por tipo)
import React, { useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { socket } from '../../socket/SocketManager'
import { useMonsterStore, getMonsterRefs } from '../../worlds/dungeons/monsters/useMonsterStore'
import { useCharacterStore } from '../../store/useCharacterStore'
import { useProjectilesStore } from './useProjectileStore'
import './ProjectileSkill.css'

// Tus componentes shader ya existentes (asegúrate de exportar con estos nombres)
import { ProjectileIce } from './iceSkill/ProjectileIce'
import { ProjectileIceExplosion } from './iceSkill/ExplosionIce'
import { FireProjectile } from './fireSkill/ProjectileFire'
import { FireExplosion } from './fireSkill/ExplosionFire'
import ProjectileDarkBall from './DarkBall/ProjectileDarkBall'
import { DarkBallExplosion } from './DarkBall/ExplosionDarkBall'

type Explosion = {
  id: string
  pos: THREE.Vector3
  age: number
  life: number
  world: string | null
  kind: 'fire' | 'ice' | 'darkBall'
}

type DamagePopup = {
  id: string
  pos: THREE.Vector3
  age: number
  life: number
  value: number
  world: string | null
  drift: number
}

export default function ProjectilesLayer({
  homingLerp = 0.12,
  targetRadius = 0.4,
  explosionLife = 0.9,
}: {
  homingLerp?: number
  targetRadius?: number
  explosionLife?: number
}) {
  const { list, remove } = useProjectilesStore()
  const world = useCharacterStore((s) => s.world)
  const [explosions, setExplosions] = useState<Explosion[]>([])
  const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([])

  // Solo proyectiles del mundo actual
  const visible = useMemo(
    () => list.filter((p) => (p.world ?? null) === (world ?? null)),
    [list, world]
  )

  const spawnExplosion = (pos: THREE.Vector3, kind: 'fire' | 'ice' | 'darkBall') => {
    const life = kind === 'darkBall' ? 1.4 : explosionLife
    setExplosions((prev) => [
      ...prev,
      {
        id: `exp_${performance.now()}_${Math.random().toString(36).slice(2)}`,
        pos: pos.clone(),
        age: 0,
        life,
        world: world ?? null,
        kind,
      },
    ])
  }

  const spawnDamage = (pos: THREE.Vector3, value: number) => {
    setDamagePopups((prev) => [
      ...prev,
      {
        id: `dmg_${performance.now()}_${Math.random().toString(36).slice(2)}`,
        pos: pos.clone(),
        age: 0,
        life: 0.9,
        value,
        world: world ?? null,
        drift: (Math.random() - 0.5) * 0.6,
      },
    ])
  }

  useFrame((_, delta) => {
    const { monsters, damage } = useMonsterStore.getState()
    const monsterRefs = getMonsterRefs()

    for (const p of [...visible]) {
      // TTL
      p.ttl -= delta
      if (p.ttl <= 0) {
        remove(p.id)
        continue
      }

      // Mover recto — sin homing
      p.position.addScaledVector(p.direction, p.speed * delta)
      if (p.mesh) {
        p.mesh.position.copy(p.position)
        if ((p as any).kind === 'darkBall') {
          p.mesh.lookAt(p.position.clone().sub(p.direction))
        }
      }

      // Colisión contra todos los monstruos vivos
      let hit = false
      for (const [mId, group] of Object.entries(monsterRefs)) {
        const m = monsters[mId]
        if (!m || m.hp <= 0) continue
        const mPos = group.position.clone()
        mPos.y += 1.0   // aproximar al centro del cuerpo
        if (p.position.distanceTo(mPos) <= p.radius + targetRadius) {
          damage(m.id, p.damage)
          spawnDamage(mPos, p.damage)
          try { socket.emit?.('hitMonster', { id: m.id, damage: p.damage }) } catch {}
          spawnExplosion(p.position, (p as any).kind ?? 'fire')
          remove(p.id)
          hit = true
          break
        }
      }
      if (hit) continue
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

    setDamagePopups((prev) => {
      const next = prev
        .map((fx) => {
          if ((fx.world ?? null) !== (world ?? null)) return fx
          const pos = fx.pos.clone()
          pos.y += delta * 0.8
          pos.x += fx.drift * delta
          return { ...fx, age: fx.age + delta, pos }
        })
        .filter((fx) => (fx.world ?? null) === (world ?? null) && fx.age < fx.life)

      return next
    })
  })

  return (
    <>
      {/* Proyectiles por tipo */}
      {visible.map((p) => {
        const kind = (p as any).kind as 'ice' | 'fire' | 'darkBall'

        if (kind === 'darkBall') {
          return (
            <ProjectileDarkBall
              key={p.id}
              ref={(m) => {
                if (m) {
                  p.mesh = m as any
                  m.position.copy(p.position)
                  m.lookAt(p.position.clone().sub(p.direction))
                }
              }}
            />
          )
        }

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
        const Exp = fx.kind === 'ice'
          ? ProjectileIceExplosion
          : fx.kind === 'darkBall'
          ? DarkBallExplosion
          : FireExplosion
        return (
          <group key={fx.id} position={fx.pos}>
            <Exp />
          </group>
        )
      })}

      {/* Números de daño */}
      {damagePopups.map((fx) => {
        const opacity = Math.max(0, 1 - fx.age / fx.life)
        return (
          <group key={fx.id} position={fx.pos}>
            <Html center className="damage-popup" style={{ opacity }}>
              {fx.value}
            </Html>
          </group>
        )
      })}
    </>
  )
}
