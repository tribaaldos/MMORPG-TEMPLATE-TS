// ProjectilesLayer.tsx
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { socket } from '../../socket/SocketManager'
import { useProjectilesStore } from './useProjectileStore'
import { useMonsterStore } from '../../worlds/dungeons/monsters/useMonsterStore'
import { useCharacterStore } from '../../store/useCharacterStore'

type Explosion = {
  id: string
  pos: THREE.Vector3
  age: number
  life: number
  radius: number
  world: string | null
}

export default function ProjectilesLayer() {
  const { list, remove } = useProjectilesStore()
  const world = useCharacterStore(s => s.world)

  // --- RECURSOS COMPARTIDOS (NO usar refs nullables en props) ---
  const projectileGeometry = useMemo(
    () => new THREE.SphereGeometry(0.18, 16, 16),
    []
  )
  const projectileMaterial = useMemo(() => {
    const m = new THREE.MeshStandardMaterial()
    // visibilidad “fácil” mientras pruebas
    m.color = new THREE.Color('#ff5533')
    m.emissive = new THREE.Color('#ff5533')
    m.emissiveIntensity = 2
    return m
  }, [])

  const explosionGeometry = useMemo(
    () => new THREE.SphereGeometry(1, 16, 16),
    []
  )

  const explosions = useRef<Explosion[]>([])

  // Solo proyectiles del mundo actual
  const visible = useMemo(
    () => list.filter(p => (p.world ?? null) === (world ?? null)),
    [list, world]
  )

  const spawnExplosion = (pos: THREE.Vector3, radius = 1.6, life = 0.35) => {
    explosions.current.push({
      id: `exp_${performance.now()}_${Math.random().toString(36).slice(2)}`,
      pos: pos.clone(),
      age: 0,
      life,
      radius,
      world: world ?? null,
    })
  }

  // DEBUG opcional
  // console.log('Proyectiles visibles:', visible.length, 'en world:', world)

  useFrame((_, delta) => {
    const { monsters, damage } = useMonsterStore.getState()

    // move / collide (solo visibles de este mundo)
    for (const p of [...visible]) {
      p.ttl -= delta
      if (p.ttl <= 0) { remove(p.id); continue }

      // homing opcional
      if (p.targetId) {
        const t = monsters[p.targetId]
        if (t?.position /* && t.world === world */) {
          const dir = t.position.clone().sub(p.position).normalize()
          p.direction.lerp(dir, 0.12)
        }
      }

      p.position.addScaledVector(p.direction, p.speed * delta)
      if (p.mesh) p.mesh.position.copy(p.position)

      // simple hit: solo target previsto
      const m = p.targetId ? monsters[p.targetId] : null
      if (m?.position /* && m.world === world */) {
        const targetRadius = 0.9
        if (p.position.distanceTo(m.position) <= p.radius + targetRadius) {
          damage(m.id, p.damage)
          try { socket.emit?.('hitMonster', { id: m.id, damage: p.damage }) } catch {}
          spawnExplosion(p.position)
          remove(p.id)
        }
      }
    }

    // update explosiones (solo del mundo actual)
    for (let i = explosions.current.length - 1; i >= 0; i--) {
      const fx = explosions.current[i]
      if ((fx.world ?? null) !== (world ?? null)) continue
      fx.age += delta
      if (fx.age >= fx.life) explosions.current.splice(i, 1)
    }
  })

  return (
    <>
      {/* projectiles */}
      {visible.map((p) => (
        <mesh
          key={p.id}
          geometry={projectileGeometry}
          material={projectileMaterial}
          ref={(m) => {
            if (m) {
              p.mesh = m
              m.position.copy(p.position)
              // Si quieres cambiar color por tipo, hazlo aquí cloneando material si hace falta
              // m.material = projectileMaterial.clone()
            }
          }}
        />
      ))}

      {/* simple explosion: one expanding/fading sphere (solo mundo actual) */}
      {explosions.current
        .filter(fx => (fx.world ?? null) === (world ?? null))
        .map((fx) => {
          const t = THREE.MathUtils.clamp(fx.age / fx.life, 0, 1)
          const scale = THREE.MathUtils.lerp(1, fx.radius, t)
          const opacity = 1 - t
          return (
            <mesh
              key={fx.id}
              geometry={explosionGeometry}
              position={fx.pos}
              scale={[scale, scale, scale]}
            >
              <meshBasicMaterial
                color={'#ff7a3a'}
                transparent
                opacity={opacity}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          )
        })}
    </>
  )
}
