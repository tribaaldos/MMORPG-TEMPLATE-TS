import React, { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
    vec3, float, positionLocal, time,
    normalize, mix, smoothstep, sin, abs, fract,
    triNoise3D, instanceIndex, pow,
} from 'three/tsl'

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────
const TRAIL_COUNT  = 42   // dense overlap → smooth tapered tube
const RING_COUNT   = 8    // energy rings pulsing from ball to tail
const RING_SPEED   = 0.9  // rings per second leaving the ball

// Scratch objects
const _d   = new THREE.Object3D()

// ─────────────────────────────────────────────────────────────────────────────
// Shader 1 — CHAOS BALL (vertex deformation + black/green noise color)
// ─────────────────────────────────────────────────────────────────────────────
function useBallShader() {
    return useMemo(() => {
        const t   = time
        const nrm = normalize(positionLocal)

        // 4-octave deformation — más noise, más dramático
        const n1 = triNoise3D(nrm.mul(2.0).add(t.mul(0.40)), float(0.42), t)
        const n2 = triNoise3D(nrm.mul(5.5).sub(t.mul(0.78)), float(0.26), t.mul(1.30))
        const n3 = triNoise3D(nrm.mul(12.0).add(t.mul(1.60)), float(0.16), t.mul(0.50))
        const n4 = triNoise3D(nrm.mul(24.0).sub(t.mul(2.20)), float(0.10), t.mul(0.80))
        const dispNoise = n1.mul(0.48).add(n2.mul(0.28)).add(n3.mul(0.16)).add(n4.mul(0.08))

        // Deformación más agresiva — más tentáculos y grietas
        const deformedPos = positionLocal.add(nrm.mul(dispNoise.mul(0.52).sub(0.14)))

        // Color noise independiente — 3 capas para más detalle
        const cn1    = triNoise3D(nrm.mul(3.8).add(t.mul(0.25)), float(0.35), t.mul(0.65))
        const cn2    = triNoise3D(nrm.mul(8.5).sub(t.mul(0.48)), float(0.22), t.mul(1.10))
        const cn3    = triNoise3D(nrm.mul(18.0).add(t.mul(0.90)), float(0.14), t.mul(0.40))
        const cNoise = cn1.mul(0.55).add(cn2.mul(0.30)).add(cn3.mul(0.15))

        // Paleta oscura: void negro → verde muy oscuro → verde oliva oscuro → amarillo-verde sucio
        const cVoid  = vec3(0.000, 0.000, 0.000)
        const cDeep  = vec3(0.005, 0.055, 0.008)   // casi negro verdoso
        const cMid   = vec3(0.020, 0.180, 0.025)   // verde oscuro
        const cOlive = vec3(0.095, 0.220, 0.010)   // verde-oliva oscuro
        const band1  = mix(cVoid,  cDeep,  smoothstep(float(0.00), float(0.30), cNoise))
        const band2  = mix(cMid,   cOlive, smoothstep(float(0.55), float(0.90), cNoise))
        const finalC = mix(band1, band2,   smoothstep(float(0.22), float(0.65), cNoise))

        // Emissive muy tenue — que apenas brille, más oscuro
        const pulse    = sin(t.mul(3.2)).mul(0.18).add(0.42)
        const emissive = vec3(float(0.04), float(0.38), float(0.06)).mul(pulse)

        return { positionNode: deformedPos, colorNode: finalC, emissiveNode: emissive }
    }, [])
}

// ─────────────────────────────────────────────────────────────────────────────
// Shader 2 — TRAIL  (color/emissive only — position handled by setMatrixAt)
// ─────────────────────────────────────────────────────────────────────────────
function useTrailShader() {
    return useMemo(() => {
        const t   = time
        const age = float(instanceIndex).div(float(TRAIL_COUNT - 1)) // 0=ball, 1=tip

        // ── Turbulencia de fuego oscuro ──────────────────────────────────────
        // Mueve cada esfera hacia arriba y lateralmente como llamas ascendentes

        // Base de posición en espacio de textura (unique per instance)
        const seed  = float(instanceIndex).mul(0.37)
        const samplePos = positionLocal.add(vec3(seed, t.mul(1.8).add(seed), seed.mul(0.7)))

        // Capa 1: llamas grandes y lentas (forma principal del fuego)
        const fire1 = triNoise3D(samplePos.mul(2.5), float(0.38), t.mul(0.9))
        // Capa 2: detalles medios (venas del fuego)
        const fire2 = triNoise3D(samplePos.mul(5.5).add(t.mul(0.5)), float(0.25), t.mul(1.4))
        // Capa 3: detalles finos (bordes irregulares)
        const fire3 = triNoise3D(samplePos.mul(11.0).sub(t.mul(0.3)), float(0.16), t.mul(0.6))
        const fireN = fire1.mul(0.55).add(fire2.mul(0.30)).add(fire3.mul(0.15))

        // Desplazamiento: empuja hacia arriba (Y) y lateralmente
        // Las llamas son asimétricas — más arriba que abajo
        const upLift  = fireN.mul(0.55).sub(0.10)                         // −0.10 … +0.45
        const lateral = fire2.mul(0.18).sub(0.09)                         // ±0.09

        // nrm del vértice para desplazamiento radial base
        const nrm     = normalize(positionLocal)

        const fireDisp = vec3(
            nrm.x.mul(fireN.mul(0.22)).add(lateral),   // X: radial + lateral
            nrm.y.mul(fireN.mul(0.18)).add(upLift),     // Y: radial + fuerte lift
            nrm.z.mul(fireN.mul(0.22)).add(lateral)     // Z: radial + lateral
        )
        // Atenuar desplazamiento en la punta (las esferas viejas apenas se mueven)
        const fireStrength = float(1.0).sub(pow(age, float(1.4)))
        const finalPos = positionLocal.add(fireDisp.mul(fireStrength))

        // ── Paleta de fuego oscuro ───────────────────────────────────────────
        // negro → verde muy oscuro → verde-oliva → amarillo-verde apagado
        // Usamos el mismo fireN para que el color siga la forma del fuego
        const cVoid  = vec3(0.000, 0.000, 0.000)
        const cEmber = vec3(0.018, 0.060, 0.004)   // brasa verde oscura
        const cFlame = vec3(0.065, 0.200, 0.008)   // llama verde media
        const cTip   = vec3(0.160, 0.320, 0.012)   // punta: verde-amarillo sucio

        // Gradiente radial por noise
        const fireColor = mix(
            mix(cVoid, cEmber, smoothstep(float(0.15), float(0.45), fireN)),
            mix(cFlame, cTip,  smoothstep(float(0.55), float(0.88), fireN)),
            smoothstep(float(0.30), float(0.70), fireN)
        )
        // Atenuar a negro en la cola
        const trailC = mix(fireColor, cVoid, pow(age, float(0.55)))

        // ── Emissive: brillo débil tipo brasa ─────────────────────────────────
        const ember  = sin(t.mul(4.5).add(float(instanceIndex).mul(0.8))).mul(0.15).add(0.35)
        const emBase = vec3(float(0.03), float(0.30), float(0.02)).mul(ember)
        const em     = mix(emBase, vec3(0.0, 0.0, 0.0), pow(age, float(0.40)))

        return { positionNode: finalPos, colorNode: trailC, emissiveNode: em }
    }, [])
}

// ─────────────────────────────────────────────────────────────────────────────
// Shader 3 — ENERGY RINGS  (phase derived from instanceIndex + time)
// Both color and emissive track the CPU-side phase so visuals match motion.
// ─────────────────────────────────────────────────────────────────────────────
function useRingShader() {
    return useMemo(() => {
        // Mirror the CPU phase formula so shader colour matches ring position
        const phase  = fract(time.mul(float(RING_SPEED)).add(float(instanceIndex).div(float(RING_COUNT))))
        const youth  = float(1.0).sub(phase)                     // 1 at ball, 0 at tail
        const fade   = smoothstep(float(0.0), float(0.08), youth) // quick fade-in at birth

        // Scrolling energy stripe around the ring circumference
        const scroll  = fract(
            abs(positionLocal.x).add(abs(positionLocal.z)).mul(5.0)
                .add(time.mul(3.5))
                .sub(float(instanceIndex).mul(1.1))
        )
        const stripe  = smoothstep(float(0.0), float(0.3), scroll)
            .sub(smoothstep(float(0.3), float(0.6), scroll))

        // Paleta oscura: negro → verde muy oscuro → oliva apagado
        const cBright = vec3(float(0.12), float(0.28), float(0.02))   // verde-oliva sucio
        const cDark   = vec3(float(0.00), float(0.04), float(0.00))   // casi negro
        const ringC   = mix(cDark, cBright, stripe.mul(youth).mul(fade))

        // Emissive tenue — como brasas oscuras
        const em = mix(
            vec3(float(0.04), float(0.55), float(0.06)),
            vec3(float(0.00), float(0.02), float(0.00)),
            pow(phase, float(0.55))
        ).mul(stripe.mul(0.50).add(0.50)).mul(fade)

        return { colorNode: ringC, emissiveNode: em }
    }, [])
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component — forwardRef so ProjectilesLayer can move/orient the group
// ─────────────────────────────────────────────────────────────────────────────
type Props = { ballRadius?: number; trailLength?: number }

const ProjectileDarkBall = React.forwardRef<THREE.Group, Props>(function ProjectileDarkBall({
    ballRadius  = 0.38,
    trailLength = 5.5,
}, ref) {
    const trailRef = useRef<THREE.InstancedMesh>(null)
    const ringRef  = useRef<THREE.InstancedMesh>(null)

    const ballMat  = useBallShader()
    const trailMat = useTrailShader()
    const ringMat  = useRingShader()

    // ── Build static trail once (or when props change) ────────────────────────
    // Trail goes along local +Z. Spheres overlap heavily for a smooth tube.
    useEffect(() => {
        if (!trailRef.current) return
        for (let i = 0; i < TRAIL_COUNT; i++) {
            const t  = i / (TRAIL_COUNT - 1)          // 0…1
            const z  = t * trailLength
            // sqrt taper: wide at ball, points to a tip at the tail
            const s  = ballRadius * Math.pow(1 - t, 0.55) + 0.012
            _d.position.set(0, 0, z)
            _d.scale.setScalar(s)
            _d.rotation.set(0, 0, 0)
            _d.updateMatrix()
            trailRef.current.setMatrixAt(i, _d.matrix)
        }
        trailRef.current.instanceMatrix.needsUpdate = true
    }, [ballRadius, trailLength])

    // ── Animate rings along trail every frame ─────────────────────────────────
    useFrame(({ clock }) => {
        if (!ringRef.current) return
        const t = clock.getElapsedTime()
        for (let i = 0; i < RING_COUNT; i++) {
            const phase = ((t * RING_SPEED + i / RING_COUNT) % 1.0 + 1.0) % 1.0
            const z     = phase * trailLength
            // Ring radius mirrors trail taper
            const s     = (ballRadius * 1.15) * (1 - phase) + 0.04
            _d.position.set(0, 0, z)
            _d.rotation.set(0, 0, 0)
            _d.scale.setScalar(s)
            _d.updateMatrix()
            ringRef.current.setMatrixAt(i, _d.matrix)
        }
        ringRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <group ref={ref}>
            {/* ── Shader 1: Chaos Ball ───────────────────────── */}
            <mesh>
                <icosahedronGeometry args={[ballRadius, 6]} />
                {/* @ts-ignore */}
                <meshStandardNodeMaterial
                    {...ballMat}
                    roughness={0.15}
                    metalness={0.0}
                />
            </mesh>

            {/* ── Shader 2: Tapered trail tube ───────────────── */}
            <instancedMesh
                ref={trailRef}
                args={[undefined, undefined, TRAIL_COUNT]}
                frustumCulled={false}
            >
                <sphereGeometry args={[1, 8, 6]} />
                {/* @ts-ignore */}
                <meshStandardNodeMaterial
                    {...trailMat}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    roughness={0.4}
                />
            </instancedMesh>

            {/* ── Shader 3: Energy rings (ball → tail loop) ──── */}
            <instancedMesh
                ref={ringRef}
                args={[undefined, undefined, RING_COUNT]}
                frustumCulled={false}
            >
                <torusGeometry args={[1, 0.07, 6, 36]} />
                {/* @ts-ignore */}
                <meshStandardNodeMaterial
                    {...ringMat}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                    roughness={0.15}
                />
            </instancedMesh>
        </group>
    )
})

export default ProjectileDarkBall
