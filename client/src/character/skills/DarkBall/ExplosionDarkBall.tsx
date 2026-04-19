import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import 'three/webgpu'
import {
    positionLocal, vec3, float, fract, instanceIndex,
    sin, cos, pow, max, sqrt, uniform, mix, clamp,
    normalize, length, smoothstep, time,
} from 'three/tsl'
import { useFrame } from '@react-three/fiber'

const SHARD_COUNT = 48
const RING_COUNT  = 1   // single shockwave ring mesh

// ─── Shards: dark void fragments flying outward ───────────────────────────────
function DarkShards() {
    const uLocalTime = useMemo(() => uniform(float(0)), [])
    const startRef   = useRef<number | null>(null)

    useFrame(({ clock }) => {
        if (startRef.current === null) startRef.current = clock.elapsedTime
        uLocalTime.value = clock.elapsedTime - startRef.current
    })

    const shader = useMemo(() => {
        const iid = float(instanceIndex)
        const lt  = uLocalTime

        // Per-instance RNG
        const rnd = (seed: number) =>
            fract(sin(iid.add(float(seed)).mul(float(12.9898))).mul(float(43758.5453)))

        const TWO_PI   = float(6.28318530)
        const phi      = rnd(1).mul(TWO_PI)
        const cosT     = rnd(2).mul(float(2.0)).sub(float(1.0))
        const sinT     = sqrt(max(float(0.001), float(1.0).sub(cosT.mul(cosT))))
        const dirX     = sinT.mul(cos(phi))
        const dirY     = cosT.add(float(0.3))          // slight upward bias
        const dirZ     = sinT.mul(sin(phi))

        const speed    = rnd(3).mul(float(4.5)).add(float(1.2))   // 1.2 → 5.7
        const tDecay   = pow(lt, float(0.60))

        // fly out + gravity
        const px = dirX.mul(speed).mul(tDecay)
        const py = dirY.mul(speed).mul(tDecay).sub(float(5.5).mul(lt.mul(lt)))
        const pz = dirZ.mul(speed).mul(tDecay)

        // spin on own axis
        const rotSpeed = rnd(4).mul(float(24.0)).sub(float(12.0))
        const angle    = lt.mul(rotSpeed)
        const ca = cos(angle)
        const sa = sin(angle)
        const lx = positionLocal.x
        const ly = positionLocal.y
        const lz = positionLocal.z
        const rx = lx.mul(ca).add(lz.mul(sa))
        const rz = lz.mul(ca).sub(lx.mul(sa))

        const finalPos = vec3(rx.add(px), ly.add(py), rz.add(pz))

        // Color: white flash → dark green → black void
        const cFlash  = vec3(float(0.80), float(1.00), float(0.60))   // yellow-green flash
        const cGreen  = vec3(float(0.04), float(0.22), float(0.01))   // dark green
        const cVoid   = vec3(float(0.00), float(0.00), float(0.00))   // black

        const t1 = clamp(lt.mul(float(4.0)), float(0), float(1))
        const t2 = clamp(lt.sub(float(0.15)).mul(float(3.0)), float(0), float(1))
        const col = mix(mix(cFlash, cGreen, t1), cVoid, t2)

        // emissive decays quickly
        const glow    = max(float(0), float(1.0).sub(lt.mul(float(3.5))))
        const emissive = vec3(float(0.05), float(0.55), float(0.02)).mul(glow.mul(float(1.8)))

        const opacity = max(float(0), float(1.0).sub(pow(lt, float(1.2))))

        return { positionNode: finalPos, colorNode: col, emissiveNode: emissive, opacityNode: opacity }
    }, [uLocalTime])

    return (
        <instancedMesh args={[undefined, undefined, SHARD_COUNT]} frustumCulled={false}>
            <boxGeometry args={[0.14, 0.06, 0.08]} />
            {/* @ts-ignore */}
            <meshStandardNodeMaterial
                {...shader}
                key={useMemo(() => Date.now(), [])}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
                roughness={0.3}
            />
        </instancedMesh>
    )
}

// ─── Shockwave ring expanding outward ────────────────────────────────────────
function ShockwaveRing() {
    const uLocalTime = useMemo(() => uniform(float(0)), [])
    const startRef   = useRef<number | null>(null)
    const meshRef    = useRef<THREE.Mesh>(null)

    useFrame(({ clock }) => {
        if (startRef.current === null) startRef.current = clock.elapsedTime
        const lt = clock.elapsedTime - startRef.current
        uLocalTime.value = lt
        if (meshRef.current) {
            // scale the ring outward over time
            const s = 1 + lt * 7.0
            meshRef.current.scale.set(s, s, s)
        }
    })

    const shader = useMemo(() => {
        const lt = uLocalTime
        const opacity = max(float(0), float(1.0).sub(pow(lt.mul(float(1.8)), float(1.0))))
        const cRing   = vec3(float(0.06), float(0.55), float(0.04))
        const emissive = cRing.mul(opacity.mul(float(2.0)))
        return { colorNode: cRing, emissiveNode: emissive, opacityNode: opacity }
    }, [uLocalTime])

    return (
        <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]} frustumCulled={false}>
            <torusGeometry args={[0.6, 0.06, 6, 48]} />
            {/* @ts-ignore */}
            <meshStandardNodeMaterial
                {...shader}
                key={useMemo(() => Date.now(), [])}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
                roughness={0.2}
            />
        </mesh>
    )
}

// ─── Void burst: central dark sphere that pops then collapses ─────────────────
function VoidBurst() {
    const uLocalTime = useMemo(() => uniform(float(0)), [])
    const startRef   = useRef<number | null>(null)
    const meshRef    = useRef<THREE.Mesh>(null)

    useFrame(({ clock }) => {
        if (startRef.current === null) startRef.current = clock.elapsedTime
        const lt = clock.elapsedTime - startRef.current
        uLocalTime.value = lt
        if (meshRef.current) {
            // expand fast then collapse
            const s = Math.max(0, lt < 0.12 ? lt / 0.12 * 1.8 : 1.8 - (lt - 0.12) * 3.5)
            meshRef.current.scale.setScalar(s)
        }
    })

    const shader = useMemo(() => {
        const lt      = uLocalTime
        const opacity = max(float(0), float(1.0).sub(lt.mul(float(3.5))))
        const pulse   = sin(lt.mul(float(18.0))).mul(float(0.3)).add(float(0.7))
        const cCore   = vec3(float(0.10), float(0.80), float(0.05))
        const emissive = cCore.mul(pulse).mul(opacity.mul(float(3.0)))
        return { colorNode: vec3(float(0), float(0), float(0)), emissiveNode: emissive, opacityNode: opacity }
    }, [uLocalTime])

    return (
        <mesh ref={meshRef} frustumCulled={false}>
            <icosahedronGeometry args={[0.45, 2]} />
            {/* @ts-ignore */}
            <meshStandardNodeMaterial
                {...shader}
                key={useMemo(() => Date.now(), [])}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                roughness={0.1}
            />
        </mesh>
    )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export const DarkBallExplosion: React.FC = () => (
    <>
        <VoidBurst />
        <ShockwaveRing />
        <DarkShards />
    </>
)
