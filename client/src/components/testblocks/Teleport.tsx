import React, { useMemo, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame, Vector3 } from '@react-three/fiber'
import * as THREE from 'three'
import { useCharacterStore } from '../../store/useCharacterStore'
import NameTag from '../../character/NameTag'
import { abs, color, float, length, mix, positionLocal, sin, time, triNoise3D, uniform, uv, vec2, vec3 } from 'three/tsl'
import { TransformControls } from '@react-three/drei'
interface TeleportZoneProps {
    position?: [number, number, number]
    target?: [number, number, number]
    targetWorld?: string
    radius?: number
    autoRotate?: boolean
    onTeleport?: (worldId: string, targetPos?: [number, number, number]) => void
    colorNode?: string
    label?: string
    labelOffset?: [number, number, number]
    labelScale?: number
    rotation?: [number, number, number]
    scale?: number

}
function CircleShader({
    colorNode = 'red'
}) {/*  */
    const { nodes, key } = useMemo(() => {
        const t = time.mul(0.1)
        const flowPos = positionLocal.add(vec3(t.mul(0.5), t.mul(0.35), t.mul(-0.45)))
        const scaledPos = flowPos.mul(1.0)

        const noiseA = triNoise3D(
            scaledPos,
            triNoise3D(scaledPos.mul(0.35), scaledPos.mul(0.35), scaledPos.mul(0.35)),
            triNoise3D(scaledPos.mul(0.6), scaledPos.mul(0.6), scaledPos.mul(0.6))
        )

        const centeredUv = uv().sub(vec2(0.5, 0.5)).mul(1.0)
        const radial = length(centeredUv)

        const edgeRing = float(1).sub(abs(radial.sub(0.62).add(noiseA.mul(0.045))).mul(5.0).clamp(0, 1))
        const innerGlow = float(1).sub(radial.mul(1.95).clamp(0, 1))
        const vignette = float(1).sub(radial.mul(1.1).clamp(0, 1))
        const swirl = sin(radial.mul(16).sub(t.mul(3.6)).add(noiseA.mul(2.2))).mul(0.5).add(0.5)

        const portalMask = edgeRing
            .mul(0.2)
            .add(innerGlow.mul(0.32))
            .add(swirl.mul(0.2).mul(vignette))
            .clamp(0, 1)

        const baseColor = uniform(color(colorNode as any))
        const deepColor = uniform(color('#000000'))
        const accentColor = uniform(color('#ffffff'))
        const bodyColor = mix(deepColor, baseColor, portalMask)
        const finalColor = mix(bodyColor, accentColor, edgeRing.mul(0.5).add(swirl.mul(0.12)).clamp(0, 1))

        return {
            key: Date.now(),
            nodes: {
                colorNode: finalColor,
                emissiveNode: finalColor.mul(1.2).add(accentColor.mul(edgeRing.mul(0.45))),
            },
        }
    }, [colorNode])

    return (
        <mesh position={[0, 1, 0]}>
            <circleGeometry args={[1, 64]} />
            {/* @ts-ignore */}
            <meshStandardNodeMaterial key={key} side={THREE.DoubleSide} {...nodes} />
        </mesh>
    )
}

export default function TeleportZone({
    position = [0, 1, 0],
    rotation = [0, 0, 0],
    target = [0, 100, 0],
    targetWorld,
    radius = 2,
    autoRotate = true,
    colorNode,
    onTeleport = () => { },
    label,
    labelOffset = [0, 2.6, 0],
    labelScale = 0.7,
    scale
}: TeleportZoneProps) {
    const { nodes, animations } = useGLTF('/environment/portal.glb')

    const targetVec = target ? new THREE.Vector3(...target) : null
    const group = useRef<THREE.Group>(null)
    const detectionCenter = new THREE.Vector3(...position)
    const hasTeleported = useRef(false)
    const { actions } = useAnimations(animations, group)

    useFrame(() => {
        const playerPos = useCharacterStore.getState().position
        if (!playerPos) return

        const distance = new THREE.Vector3(...playerPos).distanceTo(detectionCenter)

        if (distance < radius && !hasTeleported.current) {
            hasTeleported.current = true
            if (targetWorld) {
                onTeleport?.(targetWorld, target)
            }
        }
        if (distance >= radius) hasTeleported.current = false
    })



    const displayLabel = label ?? targetWorld

    return (
        <>
        {/* <TransformControls object={group.current}  /> */}

            <group ref={group} position={position} rotation={rotation} dispose={null} scale={scale} >
                {displayLabel && (
                    <NameTag
                        text={displayLabel}
                        position={labelOffset}
                        scale={labelScale}
                    />
                )}
                <group name="Sketchfab_Scene">
                    <CircleShader colorNode={colorNode} />
                    {/* <pointLight castShadow receiveShadow position={[1, 3, 0]} intensity={10} color="red" /> */}
                    <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
                        <group name="root">
                            <group name="GLTF_SceneRootNode" rotation={[Math.PI / 2, 0, 0]}>
                                <group name="Podest_0">
                                    <mesh
                                        castShadow receiveShadow
                                        geometry={(nodes.Object_4 as THREE.Mesh).geometry}
                                    >
                                        <meshStandardMaterial color="black" />
                                    </mesh>
                                </group>
                                <group name="Armature_3" position={[0, 1.538, 0]}>
                                    <group name="Bone_2" position={[0, -0.5, 0]}>
                                        <group name="Port_1" position={[0, -1.073, 0]}>
                                            <mesh
                                                castShadow receiveShadow
                                                geometry={(nodes.Object_8 as THREE.Mesh).geometry}
                                            >
                                                <meshStandardMaterial color="black" />
                                            </mesh>
                                        </group>
                                    </group>
                                </group>
                            </group>
                        </group>
                    </group>
                </group>
            </group >
        </>

    )
}

useGLTF.preload('/environment/portal.glb')
