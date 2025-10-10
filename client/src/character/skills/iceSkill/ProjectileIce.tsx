// ProjectilesLayer.tsx — Lógica minimal + shaders encapsulados (Ice + Explosion)
import React, { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

// TSL básico
import 'three/webgpu'
import {
    color, positionLocal, vec3, float, time, fract,
    mul, sin, add, sqrt, cos, tan, instanceIndex, uniform,
    normalize,
    abs,
    sub
} from 'three/tsl'
import { Trail } from '@react-three/drei'
import { useTargetStore } from '../../../store/useTargetStore'
import { useFrame } from '@react-three/fiber'
import { useCharacterStore } from '../../../store/useCharacterStore'


type ProjectileIceProps = {

}

/** Cubo con shader TSL ultra simple (positionLocal + color/emissive planos) */
export const ProjectileIce = React.forwardRef<THREE.InstancedMesh, ProjectileIceProps>(
    ({ }, ref) => {

        const count = 50
        const selectedTarget = useTargetStore((s) => s.selectedTarget?.position)
        const origenShot = useCharacterStore((s) => s.position)
        const shaderNodes = useMemo(() => {
            const u = {
                uTargetPos: uniform(vec3(selectedTarget)),
                // uOrigen: uniform(vec3(origenShot))
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

            // Emisor (origen) y dirección hacia el target
            const emitterPos = u.uOrigen // origen del disparo
            const dir = normalize(sub(emitterPos, u.uTargetPos))    // vector dirección al target

            // Parámetros del cono y movimiento
            const coneAngle = float(0.35)
            const maxDist = float(2.0)
            const twoPI = float(6.283185307179586)

            // Vida / velocidad
            const speed = add(mul(rnd(10.0), float(1.0)), float(1.0))
            const seed = rnd(0.123)
            const lifeT = fract(add(mul(t, speed), seed))
            const dist = mul(lifeT, maxDist)
            const radiusAt = mul(tan(coneAngle), dist)

            // Coordenadas aleatorias dentro del cono
            const theta = mul(rnd(20.0), twoPI)
            const radU = sqrt(rnd(21.0))
            const rLocal = mul(radU, radiusAt)

            // Base ortonormal para el cono orientado a `dir`
            const up = vec3(float(0), float(1), float(0))
            const right = vec3(float(1), float(0), float(0))
            const axisDotUp = abs(dir.y)
            const helper = axisDotUp.greaterThanEqual(float(0.99)).select(right, up)

            const t1 = normalize(helper.cross(dir))
            const t2 = normalize(dir.cross(t1))

            // Offset radial y posición final del proyectil
            const radial = add(mul(t1, mul(cos(theta), rLocal)), mul(t2, mul(sin(theta), rLocal)))
            const conePos = add(mul(dir, dist), radial)
            const finalPosition = add(positionLocal,  conePos)


            return {
                positionNode: finalPosition,
                colorNode: color('red'),
                u,
            }
        }, [])

        // cambia la key si quieres forzar recompilación cuando cambien nodos
        const materialKey = useMemo(() => Date.now(), [shaderNodes])
 
        return (
            <>
                <group position={[0, 0, 0]}>

                    <mesh ref={ref}>
                        <boxGeometry args={[0.5, 0.5, 0.5]} />
                        <meshStandardMaterial color="blue" />
                    </mesh>
                    <instancedMesh args={[undefined, undefined, count]} ref={ref} frustumCulled={false}>
                        <boxGeometry args={[0.1, 0.1, 0.1]} />
                        {/* <planeGeometry args={[0.2, 0.2, 1, 1]} /> */}
                        {/* @ts-ignore NodeMaterial (TSL) */}
                        <meshPhysicalNodeMaterial {...shaderNodes} key={materialKey} metalness={0} roughness={1} side={THREE.DoubleSide} />
                    </instancedMesh>
                </group>
            </>
        )
    }
)
ProjectileIce.displayName = 'ProjectileIce'