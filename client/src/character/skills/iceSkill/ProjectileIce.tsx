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
    sub,
    emissive,
    range
} from 'three/tsl'
import { Trail } from '@react-three/drei'
import { useTargetStore } from '../../../store/useTargetStore'
import { useFrame } from '@react-three/fiber'
import { useCharacterStore } from '../../../store/useCharacterStore'
import { MeshPhysicalNodeMaterial } from 'three/webgpu'


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
            const coneAngle = float(0.15)
            const maxDist = float(2.0)
            const twoPI = float(6.283185307179586)

            // Vida / velocidad
            const speed = float(0.5)
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
            const finalPosition = add(positionLocal, conePos)

            // color 

            return {
                positionNode: finalPosition,
                colorNode: color('darkblue'),
                emissiveNode: mul(color('lightblue'), float(0.09)),
                u,
            }
        }, [
            // esto hace que vaya lento , pero hace que cambie al moverse el target
            // selectedTarget, origenShot
        ])
        useFrame(() => {
            if (selectedTarget) {
                // @ts-ignore3
                shaderNodes.u.uTargetPos.value.lerp(new THREE.Vector3(...selectedTarget), 0.95)
            }
        })

        const shaderNodes2 = useMemo(() => {
            3
            const finalColor = color(vec3(0.4, 0.75, 1.0)) // azul hielo
            return {
                positionNode: positionLocal.add(new THREE.Vector3(0, 0, 0)),
                colorNode: finalColor,
                emissiveNode: mul(finalColor, float(0.3)),
            }
        }, [])
        // cambia la key si quieres forzar recompila3ción cuando cambien nodos
        const materialKey = useMemo(() => Date.now(), [shaderNodes, shaderNodes2])

        return (
            <>
                <group position={[0, 0, 0]}>

                    <instancedMesh args={[undefined, undefined, count]} ref={ref} scale={0.2} frustumCulled={false}>
                        <sphereGeometry args={[1, 16, 16]} scale-y={0.001} />
                        {/* @ts-ignore NodeMaterial (TSL) */}
                        <meshPhysicalNodeMaterial {...shaderNodes2} key={materialKey} />
                    </instancedMesh>
                    <instancedMesh args={[undefined, undefined, count]} ref={ref} frustumCulled={false}>
                        <boxGeometry args={[0.05, 0.05, 0.05]} />
                        {/* <planeGeometry args={[0.2, 0.2, 1, 1]} /> */}
                        {/* @ts-ignore NodeMaterial (TSL) */}
                        <meshPhysicalNodeMaterial {...shaderNodes} key={materialKey} metalness={0} roughness={1} side={THREE.DoubleSide} />
                    </instancedMesh>
                    {/* <sprite count={count} ref={ref} > */}
                    {/* @ts-ignore NodeMaterial (TSL) */}
                    {/* <spriteNodeMaterial {...shaderNodes} key={materialKey} depthWrite={false} blending={THREE.AdditiveBlending} />
                    </sprite> */}
                </group>
            </>
        )
    }
)
ProjectileIce.displayName = 'ProjectileIce'