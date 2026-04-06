import React, { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import 'three/webgpu'
import {
    color, positionLocal, vec3, float, time, fract,
    mul, sin, add, sqrt, cos, tan, instanceIndex, uniform,
    normalize, abs, sub, emissive, pow, max
} from 'three/tsl'
import { Trail } from '@react-three/drei'
import { useTargetStore } from '../../../store/useTargetStore'
import { useFrame } from '@react-three/fiber'
import { useCharacterStore } from '../../../store/useCharacterStore'
import { MeshPhysicalNodeMaterial } from 'three/webgpu'

type ProjectileIceProps = {}

export const ProjectileIce = React.forwardRef<THREE.InstancedMesh, ProjectileIceProps>(
    ({ }, ref) => {
        const count = 50
        const selectedTarget = useTargetStore((s) => s.selectedTarget?.position)
        const origenShot = useCharacterStore((s) => s.position)

        const shaderNodes = useMemo(() => {
            const u = {
                uTargetPos: uniform(vec3(selectedTarget)),
                uOrigen: uniform(vec3(origenShot[0], origenShot[1], origenShot[2]))
            }
            const iid = float(instanceIndex)
            const t = time

            // PRNG simple
            const rnd = (seed: number) => {
                return fract(
                    mul(
                        sin(mul(add(iid, float(seed)), float(12.9898))),
                        float(43758.5453123)
                    )
                )
            }

            // Movimiento del proyectil
            const emitterPos = u.uOrigen
            const dir = normalize(sub(emitterPos, u.uTargetPos))
            const coneAngle = float(0.15)
            const maxDist = float(2.0)
            const twoPI = float(6.283185307179586)
            const speed = float(0.5)
            const seed = rnd(float(0.123))
            const lifeT = fract(add(mul(t, speed), seed))
            const dist = mul(lifeT, maxDist)
            const radiusAt = mul(tan(coneAngle), dist)

            const theta = mul(rnd(float(20.0)), twoPI)
            const radU = sqrt(rnd(float(21.0)))
            const rLocal = mul(radU, radiusAt)

            const up = vec3(float(0), float(1), float(0))
            const right = vec3(float(1), float(0), float(0))
            const axisDotUp = abs(dir.y)
            const helper = axisDotUp.greaterThanEqual(float(0.99)).select(right, up)

            const t1 = normalize(helper.cross(dir))
            const t2 = normalize(dir.cross(t1))

            const radial = add(mul(t1, mul(cos(theta), rLocal)), mul(t2, mul(sin(theta), rLocal)))
            const conePos = add(mul(dir, dist), radial)

            // Distorsión simple con onda sinusoidal
            const distortionWave = mul(float(0.06), sin(mul(t, float(8.0))))
            const distortedPos = add(conePos, mul(distortionWave, positionLocal.normalize()))

            const finalPosition = add(positionLocal, distortedPos)

            // Color con gradiente azul hielo - pulsante
            const baseColor = vec3(float(0.3), float(0.7), float(1.0))
            const pulse = add(float(0.7), mul(float(0.3), sin(mul(t, float(4.0)))))
            const pulseColor = mul(baseColor, pulse)

            // Emissive con respiración
            const glowIntensity = add(float(0.15), mul(float(0.3), sin(mul(t, float(6.0)))))
            const emissiveColor = mul(baseColor, glowIntensity)

            return {
                positionNode: finalPosition,
                colorNode: pulseColor,
                emissiveNode: emissiveColor,
                u,
            }
        }, [])

        useFrame(() => {
            if (selectedTarget) {
                // @ts-ignore
                shaderNodes.u.uTargetPos.value.lerp(new THREE.Vector3(...selectedTarget), 0.95)
            }
        })

        // Esfera con efecto de respiración
        const shaderNodes2 = useMemo(() => {
            const t = time
            const baseColor = vec3(float(0.4), float(0.75), float(1.0))

            // Emissive con efecto de respiración
            const breathing = add(float(0.25), mul(float(0.35), sin(mul(t, float(3.5)))))
            const emissiveStrength = mul(baseColor, breathing)

            return {
                positionNode: positionLocal,
                colorNode: baseColor,
                emissiveNode: emissiveStrength,
            }
        }, [])

        const materialKey = useMemo(() => Date.now(), [shaderNodes, shaderNodes2])

        return (
            <group position={[0, 0, 0]}>
                <instancedMesh args={[undefined, undefined, count]} ref={ref} scale={0.2} frustumCulled={false}>
                    <sphereGeometry args={[1, 16, 16]} scale-y={0.001} />
                    <meshPhysicalNodeMaterial {...shaderNodes2} key={materialKey} />
                </instancedMesh>
                <instancedMesh args={[undefined, undefined, count]} ref={ref} frustumCulled={false}>
                    <boxGeometry args={[0.05, 0.05, 0.05]} />
                    <meshPhysicalNodeMaterial
                        {...shaderNodes}
                        key={materialKey}
                        metalness={0}
                        roughness={0.3}
                        side={THREE.DoubleSide}
                    />
                </instancedMesh>
            </group>
        )
    }
)
ProjectileIce.displayName = 'ProjectileIce'