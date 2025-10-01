import React, { useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCharacterStore } from '../../store/useCharacterStore'

interface TeleportZoneProps {
    position?: [number, number, number]
    target?: [number, number, number]
    targetWorld?: string
    radius?: number
    autoRotate?: boolean
    onTeleport?: (worldId: string, targetPos?: [number, number, number]) => void
    color?: string
}
function CircleShader({
    color = 'blue',
}){
    return (
        <mesh position={[0, 1, 0]}>
            <circleGeometry args={[1, 64]} />
            <meshStandardMaterial color={color} side={THREE.DoubleSide} />
        </mesh>
    )
}

export default function TeleportZone({
    position = [0, 1, 0],
    target = [0, 100, 0],
    targetWorld,
    radius = 2,
    autoRotate = true,
    color = 'blue',
    onTeleport = () => { },
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



    return (
        <group ref={group} position={position} dispose={null} >
            <group name="Sketchfab_Scene">
                <CircleShader color={color} />
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
    )
}

useGLTF.preload('/environment/portal.glb')
