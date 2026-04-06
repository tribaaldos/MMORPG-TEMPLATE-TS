import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import 'three/webgpu'
import {
    positionLocal, vec3, float, fract, instanceIndex,
    mul, sin, cos, add, sub, pow, max, sqrt, uniform, mix, clamp
} from 'three/tsl'
import { useFrame } from '@react-three/fiber'

type ProjectileIceExplosionProps = {}

export const ProjectileIceExplosion: React.FC<ProjectileIceExplosionProps> = () => {
    const count = 32

    // Tiempo local desde el spawn (no el global)
    const uLocalTime = useMemo(() => uniform(float(0)), [])
    const startRef = useRef<number | null>(null)

    useFrame(({ clock }) => {
        if (startRef.current === null) startRef.current = clock.elapsedTime
        uLocalTime.value = clock.elapsedTime - startRef.current
    })

    const shaderNodes = useMemo(() => {
        const iid = float(instanceIndex)
        const lt = uLocalTime

        // PRNG por fragmento
        const rnd = (seed: number) => fract(
            mul(
                sin(mul(add(iid, float(seed)), float(12.9898))),
                float(43758.5453)
            )
        )

        const TWO_PI = float(6.28318530)

        // Dirección esférica aleatoria por fragmento
        const phi = mul(rnd(1), TWO_PI)
        const cosTheta = sub(mul(rnd(2), float(2.0)), float(1.0))
        const sinTheta = sqrt(max(float(0.001), sub(float(1.0), mul(cosTheta, cosTheta))))
        const dirX = mul(sinTheta, cos(phi))
        const dirY = add(cosTheta, float(0.5)) // bias hacia arriba
        const dirZ = mul(sinTheta, sin(phi))

        // Velocidad inicial aleatoria
        const speed = add(mul(rnd(3), float(1.8)), float(0.6)) // 0.6 → 2.4

        // Tiempo con desaceleración
        const tDecay = pow(lt, float(0.65))

        // Posición: vuela hacia afuera + gravedad
        const offsetX = mul(dirX, mul(speed, tDecay))
        const offsetY = sub(
            mul(dirY, mul(speed, tDecay)),
            mul(float(3.0), mul(lt, lt)) // gravedad
        )
        const offsetZ = mul(dirZ, mul(speed, tDecay))

        // Rotación del fragmento sobre su propio eje
        const rotSpeed = sub(mul(rnd(4), float(20.0)), float(10.0)) // -10 → +10 rad/s
        const angle = mul(lt, rotSpeed)
        const ca = cos(angle)
        const sa = sin(angle)

        // Rotar vértice local sobre Y
        const lx = positionLocal.x
        const ly = positionLocal.y
        const lz = positionLocal.z
        const rotX = add(mul(lx, ca), mul(lz, sa))
        const rotZ = sub(mul(lz, ca), mul(lx, sa))

        // Posición final
        const finalPos = vec3(
            add(rotX, offsetX),
            add(ly, offsetY),
            add(rotZ, offsetZ)
        )

        // Color: destello blanco al impacto → azul hielo
        const iceBlue = vec3(float(0.45), float(0.85), float(1.0))
        const white = vec3(float(1.0), float(1.0), float(1.0))
        const colorBlend = clamp(mul(lt, float(5.0)), float(0), float(1))
        const shardColor = mix(white, iceBlue, colorBlend)

        // Emissive que decae
        const glowDecay = max(float(0), sub(float(1.0), mul(lt, float(2.5))))
        const emissiveColor = mul(shardColor, mul(glowDecay, float(0.6)))

        // Opacidad que se desvanece al final
        const opacity = max(float(0), sub(float(1.0), pow(lt, float(1.5))))

        return {
            positionNode: finalPos,
            colorNode: shardColor,
            emissiveNode: emissiveColor,
            opacityNode: opacity,
        }
    }, [uLocalTime])

    const materialKey = useMemo(() => Date.now(), [])

    return (
        <instancedMesh args={[undefined, undefined, count]} frustumCulled={false}>
            {/* Geometría de fragmento de hielo: plana, irregular */}
            <boxGeometry args={[0.18, 0.04, 0.10]} />
            {/* @ts-ignore NodeMaterial (TSL) */}
            <meshPhysicalNodeMaterial
                {...shaderNodes}
                key={materialKey}
                metalness={0.15}
                roughness={0.05}
                transparent={true}
                side={THREE.DoubleSide}
            />
        </instancedMesh>
    )
}
