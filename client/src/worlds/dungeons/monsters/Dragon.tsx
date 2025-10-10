import React, { useRef, useEffect, useMemo } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { socket } from '../../../socket/SocketManager'
import { useFrame } from '@react-three/fiber'
import { useEcctrlStore } from '../../../character/noPhysicsCharacter/extra/useEcctrlStore'
import NameTag from '../../../character/NameTag'
import { useTargetStore } from '../../../store/useTargetStore'
import { useMonsterStore } from './useMonsterStore'
interface DragonProps {
    props?: any
    position?: [number, number, number]
    /** posición del jugador LOCAL para lógica de ataque client-side */
    localPlayerPos?: THREE.Vector3
    nameId?: string
}

export function Dragon({ props, position = [0, 0, 0], localPlayerPos, nameId = "Dragon2" }: DragonProps) {
    const group = useRef<THREE.Group>(null)
    const { nodes, materials, animations } = useGLTF('/dungeons/monsters/dragon.glb')
    const { actions } = useAnimations(animations, group)

    // === suelo / escaleras ===
    const collidersMeshesArray = useEcctrlStore((s) => s.colliderMeshesArray)
    const groundCandidates = useMemo(
        () => collidersMeshesArray.filter((m) => m.visible && m.geometry?.boundsTree),
        [collidersMeshesArray]
    )
    const groundRay = useRef(new THREE.Raycaster())
    const footOffset = 0.05
    const downMax = 3

    // === animación local ===
    const currentAction = useRef<string | null>(null)
    const timeScaleRef = useRef(1)

    const playAnimation = (name: string, timeScale = 1) => {
        if (!actions || !name) return
        if (currentAction.current === name) {
            if (actions[name]) actions[name]!.timeScale = timeScale
            timeScaleRef.current = timeScale
            return
        }

        const nextAction = actions[name]
        if (!nextAction) return

        const prevAction = currentAction.current ? actions[currentAction.current] : undefined
        currentAction.current = name

        if (prevAction && prevAction !== nextAction) {
            prevAction.crossFadeTo(nextAction, 0.3, true)
        }
        nextAction.reset().play()
        nextAction.timeScale = timeScale
        timeScaleRef.current = timeScale
    }

    // === target del servidor ===
    const targetPos = useRef(new THREE.Vector3(...position))
    const targetQuat = useRef(new THREE.Quaternion())

    // para estimar velocidad (suave)
    const lastRenderPos = useRef(new THREE.Vector3(...position))
    const smoothedSpeed = useRef(0) // m/s aprox en XZ

    const setSelectedTarget = useTargetStore((s) => s.setSelectedTarget)
    
    const monster = useMonsterStore((s) => s.monsters['dragon-1'])

    
    // === spawnear en el store ===
    useEffect(() => {
        useMonsterStore.getState().spawn({
            id: 'dragon-1',
            kind: 'dragon',
            name: 'Dragon',
            level: 1,
            hp: 200,
            maxHp: 200,
            position: new THREE.Vector3(...position),
            quaternion: new THREE.Quaternion(),
            animation: 'CharacterArmature|Flying_Idle',
            aggro: false,
        })
    }, [])

    // escuchar transformaciones del server
    useEffect(() => {
        const onTransform = (data: {
            id: string
            position: [number, number, number]
            quaternion: [number, number, number, number]
        }) => {
            targetPos.current.fromArray(data.position)
            targetQuat.current.fromArray(data.quaternion)
        }

        socket.on('dragonTransform', onTransform)
        return () => {
            socket.off('dragonTransform', onTransform)
        }
    }, [])

    // === lógica de frame ===
    useFrame((_, delta) => {
        if (!group.current) return

        const monster = useMonsterStore.getState().monsters['dragon-1']
        if (!monster) return
        // suavizar pos/rot
        group.current.position.lerp(targetPos.current, 5 * delta)
        group.current.quaternion.slerp(targetQuat.current, 5 * delta)

        // actualizar posición en el store
        useMonsterStore.getState().update('dragon-1', {
            position: group.current.position.clone(),
            quaternion: group.current.quaternion.clone(),
        })

        // === pegado al suelo ===
        if (groundCandidates.length) {
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
                group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, yTarget, 10 * delta)
            } else {
                group.current.position.y -= 9.8 * delta
            }
        }

        // === velocidad local ===
        const cur = group.current.position
        const last = lastRenderPos.current
        const dx = cur.x - last.x
        const dz = cur.z - last.z
        const instSpeed = Math.hypot(dx, dz) / Math.max(delta, 1e-3)
        smoothedSpeed.current = THREE.MathUtils.lerp(smoothedSpeed.current, instSpeed, 0.15)
        last.copy(cur)

        // === animación según agro ===
        let anim = 'CharacterArmature|Idle'
        let timeScale = 1

        if (monster.aggro && localPlayerPos) {
            const distToLocal = localPlayerPos.distanceTo(cur)
            if (distToLocal < 1) {
                anim = 'CharacterArmature|Punch'
            } else if (smoothedSpeed.current > 1.6) {
                anim = 'CharacterArmature|Fast_Flying'
            } else if (smoothedSpeed.current > 0.15) {
                anim = 'CharacterArmature|Flying_Idle'
                timeScale = THREE.MathUtils.clamp(smoothedSpeed.current / 1.0, 0.6, 1.3)
            }
        } else {
            if (smoothedSpeed.current > 1.6) {
                anim = 'CharacterArmature|Fast_Flying'
            } else if (smoothedSpeed.current > 0.15) {
                anim = 'CharacterArmature|Flying_Idle'
                timeScale = THREE.MathUtils.clamp(smoothedSpeed.current / 1.0, 0.6, 1.3)
            }
        }

        playAnimation(anim, timeScale)
    })

    // === click: setSelectedTarget para UI ===

    useFrame(() => {
        if (!group.current) return
        const state = useTargetStore.getState()
        if (state.selectedTarget?.id === 'dragon-1') {
            const hitPoint = group.current.position.clone()
            hitPoint.y += 3 // súbelo ~2.5 unidades (ajusta según tu modelo)
            state.setSelectedTarget({
                ...state.selectedTarget,
                position: hitPoint.clone()
            })
        }
    })

    return (
        <group
            ref={group}
            {...props}
            dispose={null}
            scale={5}
            position={position}
            onClick={(e) => {
                e.stopPropagation()
                const monster = useMonsterStore.getState().monsters['dragon-1']
                if (monster) {
                    setSelectedTarget({
                        id: monster.id,
                        name: monster.name,
                        level: monster.level,
                        hp: monster.hp,
                        maxHp: monster.maxHp,
                        kind: 'monster',
                        position: monster.position,
                    })
                }
            }}
        >
            <group name="Root_Scene">
                <NameTag text={nameId} scale={0.5} position={[0, 0.5, 0]} />
                <group name="RootNode">
                    <group
                        name="CharacterArmature"
                        rotation={[-Math.PI / 2, 0, Math.PI * 1]}
                        scale={10}
                    >
                        <primitive object={(nodes as any).Root} />
                    </group>
                    <group name="Dragon" rotation={[-Math.PI / 2, 0, 0]} scale={1}>
                        <skinnedMesh
                            name="Dragon_1"
                            geometry={(nodes as any).Dragon_1.geometry}
                            material={(materials as any).Dragon_Main}
                            skeleton={(nodes as any).Dragon_1.skeleton}
                        />
                        <skinnedMesh
                            name="Dragon_2"
                            geometry={(nodes as any).Dragon_2.geometry}
                            material={(materials as any).Dragon_Secondary}
                            skeleton={(nodes as any).Dragon_2.skeleton}
                        />
                        <skinnedMesh
                            name="Dragon_3"
                            geometry={(nodes as any).Dragon_3.geometry}
                            material={(materials as any).Dragon_Horn}
                            skeleton={(nodes as any).Dragon_3.skeleton}
                        />
                        <skinnedMesh
                            name="Dragon_4"
                            geometry={(nodes as any).Dragon_4.geometry}
                            material={(materials as any).Eye_White}
                            skeleton={(nodes as any).Dragon_4.skeleton}
                        />
                        <skinnedMesh
                            name="Dragon_5"
                            geometry={(nodes as any).Dragon_5.geometry}
                            material={(materials as any).Eye_Black}
                            skeleton={(nodes as any).Dragon_5.skeleton}
                        />
                    </group>
                </group>
            </group>
        </group>
    )
}

useGLTF.preload('/dungeons/monsters/dragon.glb')
