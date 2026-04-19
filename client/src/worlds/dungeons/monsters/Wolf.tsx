import React, { useRef, useEffect, useMemo } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { socket } from '../../../socket/SocketManager'
import { useFrame } from '@react-three/fiber'
import { useEcctrlStore } from '../../../character/noPhysicsCharacter/extra/useEcctrlStore'
import MonsterPlate from '../../../character/MonsterPlate'
import { useTargetStore } from '../../../store/useTargetStore'
import { useMonsterStore, registerMonsterRef, unregisterMonsterRef } from './useMonsterStore'

interface WolfProps {
    props?: any
    id?: string
    position?: [number, number, number]
}

export function Wolf({ props, id = 'wolf-1', position = [0, 0, 0] }: WolfProps) {
    const group = useRef<THREE.Group>(null)
    const { nodes, materials, animations } = useGLTF('/dungeons/monsters/wolf_guy.glb')
    const { actions } = useAnimations(animations, group)
    const collidersMeshesArray = useEcctrlStore((s) => s.colliderMeshesArray)
    const groundCandidates = useMemo(
        () => collidersMeshesArray.filter(m => m.visible && m.geometry?.boundsTree),
        [collidersMeshesArray]
    )
    const groundRay = useRef(new THREE.Raycaster())
    const footOffset = 0.05      // separa un pelín del suelo
    const downMax = 3
    // 3) en tu useFrame, justo después de hacer el lerp de X/Z y el slerp de rotación:



    // estado de animación
    const currentAction = useRef<any>(null)
    const playAnimation = (name: string) => {
        if (currentAction.current === name) return
        const nextAction = actions[name]
        if (!nextAction) return

        const prevAction = actions[currentAction.current]
        currentAction.current = name

        if (prevAction) {
            prevAction.crossFadeTo(nextAction, 0.3, true)
        }
        nextAction.reset().play()
    }

    // target recibido del servidor
    const targetPos = useRef(new THREE.Vector3(...position))
    const targetQuat = useRef(new THREE.Quaternion())

    // spawn en el monster store + registro del ref para Tab-targeting
    useEffect(() => {
        useMonsterStore.getState().spawn({
            id,
            kind: 'wolf',
            name: 'Wolf',
            level: 1,
            hp: 100,
            maxHp: 100,
            position: new THREE.Vector3(...position),
            quaternion: new THREE.Quaternion(),
            animation: 'idle',
            aggro: false,
        })
        if (group.current) registerMonsterRef(id, group.current)
        return () => unregisterMonsterRef(id)
    }, [id])

    // escuchar servidor
    useEffect(() => {
        socket.on('wolfUpdate', (data) => {
            if (!group.current) return

            targetPos.current.fromArray(data.position)
            targetQuat.current.fromArray(data.quaternion)
            playAnimation(data.animation)
        })

        return () => {
            socket.off('wolfUpdate')
        }
    }, [])

    // suavizado cada frame
    useFrame((_, delta) => {
        if (!group.current) return

        // suavizar posición
        group.current.position.lerp(targetPos.current, 5 * delta)

        // suavizar rotación
        group.current.quaternion.slerp(targetQuat.current, 5 * delta)

        // PEGAO AL SUELO 
        if (groundCandidates.length && group.current) {
            // desde un punto por encima del lobo, ray hacia abajo
            const fromAbove = new THREE.Vector3(
                group.current.position.x,
                group.current.position.y + downMax,
                group.current.position.z
            )
            groundRay.current.set(fromAbove, new THREE.Vector3(0, -1, 0))
            groundRay.current.far = downMax * 2

            const hits = groundRay.current.intersectObjects(groundCandidates, false)
            if (hits.length) {
                const yTarget = hits[0].point.y + footOffset
                // suaviza un poco para que no “salte”
                group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, yTarget, 10 * delta)
            } else {
                // si no hay suelo debajo, caída simple opcional
                group.current.position.y -= 9.8 * delta
            }
        }
    })

    const setSelectedTarget = useTargetStore((s) => s.setSelectedTarget);
    useFrame(() => {
        if (!group.current) return
        const state = useTargetStore.getState()
        if (state.selectedTarget?.id === 'wolf-1') {
            const hitPoint = group.current.position.clone()
            hitPoint.y += 2.2   // súbelo ~2.5 unidades (ajusta según tu modelo)

            state.setSelectedTarget({
                ...state.selectedTarget,
                position: hitPoint
            })
        }
    })

    return (
        <>

            <group ref={group} {...props} dispose={null} scale={1} position={position}
                onClick={(e) => {
                    e.stopPropagation()
                    setSelectedTarget({
                        id: 'wolf-1',
                        name: 'Wolf',
                        level: 1,
                        hp: 74,        // ← valor actual
                        maxHp: 100,    // ← valor máximo
                        kind: 'monster'
                    })
                }}
            >
                <MonsterPlate name="Wolf" level={1} hp={74} maxHp={100} position={[0, 2.2, 0]} />
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
