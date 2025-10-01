import React, { useRef, useEffect } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { socket } from '../../../socket/SocketManager'
import { useFrame } from '@react-three/fiber'

interface WolfProps {
    props?: any
    position?: [number, number, number]
}

export function WolfLocal({ props, position = [0, 0, 0] }: WolfProps) {
    const group = useRef<THREE.Group>(null)
    const { nodes, materials, animations } = useGLTF('/dungeons/monsters/wolf_guy.glb')
    const { actions , names} = useAnimations(animations, group)
    console.log(names, animations, actions);

    // estado de animación
    useEffect(() => {
        actions['Take 001']?.reset().fadeIn(0.3).play();
    })

    return (
        <>
 
            <group ref={group} {...props} dispose={null} scale={1} position={position}>
                <group name="Sketchfab_Scene">
                    <group
                        name="Sketchfab_model"
                        rotation={[-Math.PI / 2, 0, 0]}
                        position={[0, 3.5, 0]}
                    >
                        <group
                            name="79434cb1527946d49260ab3c4d9cf97dfbx"
                            rotation={[Math.PI / 2, 0, 0]}
                        >
                            <group name="Object_2">
                                <group name="RootNode">
                                    <group name="Object_4">
                                        <primitive object={nodes._rootJoint} />
                                        <skinnedMesh
                                            name="Object_7"
                                            geometry={(nodes.Object_7 as THREE.SkinnedMesh).geometry}
                                            material={materials.objetos}
                                            skeleton={(nodes.Object_7 as THREE.SkinnedMesh).skeleton}
                                        />
                                        <skinnedMesh
                                            name="Object_9"
                                            geometry={(nodes.Object_9 as THREE.SkinnedMesh).geometry}
                                            material={materials['03_-_Default']}
                                            skeleton={(nodes.Object_9 as THREE.SkinnedMesh).skeleton}
                                        />
                                    </group>
                                </group>
                            </group>
                        </group>
                    </group>
                </group>
            </group>
        </>
    )
}

useGLTF.preload('/dungeons/monsters/wolf_guy.glb')
