import React, { useRef, useEffect, useMemo, useState } from 'react'
import { useGLTF, useAnimations, Html } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import * as THREE from 'three'
import { socket } from '../../../socket/SocketManager'
import { useFrame } from '@react-three/fiber'
import { useEcctrlStore } from '../../../character/noPhysicsCharacter/extra/useEcctrlStore'
import MonsterPlate from '../../../character/MonsterPlate'
import { useTargetStore } from '../../../store/useTargetStore'
import { useMonsterStore, registerMonsterRef, unregisterMonsterRef } from './useMonsterStore'

interface DragonProps {
    id: string
    position?: [number, number, number]
    localPlayerPos?: THREE.Vector3
    nameId?: string
}

export function Dragon({ id, position = [0, 0, 0], localPlayerPos, nameId = 'Dragon' }: DragonProps) {
    const group = useRef<THREE.Group>(null)
    const { scene, animations, materials } = useGLTF('/dungeons/monsters/dragon.glb')
    // Clonar escena completa por instancia (necesario para skinned meshes)
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
    // Extraer nodes del clon por nombre
    const nodes = useMemo(() => {
        const map: Record<string, THREE.Object3D> = {}
        clone.traverse((obj) => { map[obj.name] = obj })
        return map
    }, [clone])
    const { actions } = useAnimations(animations, group)

    const [alive, setAlive] = useState(true)
    const [respawnTimer, setRespawnTimer] = useState<number | null>(null)
    const respawnIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const aliveRef = useRef(true)
    const needsTeleport = useRef(false)

    // === suelo ===
    const collidersMeshesArray = useEcctrlStore((s) => s.colliderMeshesArray)
    const groundCandidates = useMemo(
        () => collidersMeshesArray.filter((m) => m.visible && m.geometry?.boundsTree),
        [collidersMeshesArray]
    )
    const groundRay = useRef(new THREE.Raycaster())
    const footOffset = 0.05
    const downMax = 3

    // === animación ===
    const currentAction = useRef<string | null>(null)

    const playAnimation = (name: string, timeScale = 1) => {
        if (!actions || !name) return
        if (currentAction.current === name) {
            if (actions[name]) actions[name]!.timeScale = timeScale
            return
        }
        const nextAction = actions[name]
        if (!nextAction) return
        const prevAction = currentAction.current ? actions[currentAction.current] : undefined
        currentAction.current = name
        if (prevAction && prevAction !== nextAction) prevAction.crossFadeTo(nextAction, 0.3, true)
        nextAction.reset().play()
        nextAction.timeScale = timeScale
    }

    const targetPos = useRef(new THREE.Vector3(...position))
    const targetQuat = useRef(new THREE.Quaternion())
    const lastRenderPos = useRef(new THREE.Vector3(...position))
    const smoothedSpeed = useRef(0)

    const setSelectedTarget = useTargetStore((s) => s.setSelectedTarget)

    // === spawn en el store + registro del ref para Tab-targeting ===
    useEffect(() => {
        useMonsterStore.getState().spawn({
            id,
            kind: 'dragon',
            name: nameId,
            level: 1,
            hp: 200,
            maxHp: 200,
            position: new THREE.Vector3(...position),
            quaternion: new THREE.Quaternion(),
            animation: 'CharacterArmature|Flying_Idle',
            aggro: false,
        })
        if (group.current) registerMonsterRef(id, group.current)
        return () => unregisterMonsterRef(id)
    }, [id])

    // === socket listeners ===
    useEffect(() => {
        const triggerDeath = (respawnSecs = 15) => {
            if (!aliveRef.current) return
            aliveRef.current = false
            setAlive(false)
            const ts = useTargetStore.getState()
            if (ts.selectedTarget?.id === id) ts.setSelectedTarget(null)
            useMonsterStore.getState().update(id, { hp: 0, aggro: false })

            let remaining = respawnSecs
            setRespawnTimer(remaining)
            respawnIntervalRef.current = setInterval(() => {
                remaining -= 1
                setRespawnTimer(remaining)
                if (remaining <= 0) {
                    clearInterval(respawnIntervalRef.current!)
                    respawnIntervalRef.current = null
                }
            }, 1000)
        }

        const onInit = (data: Array<{
            id: string
            position: [number, number, number]
            quaternion: [number, number, number, number]
            hp: number
            maxHp: number
            alive: boolean
        }>) => {
            const mine = data.find((d) => d.id === id)
            if (!mine) return
            targetPos.current.fromArray(mine.position)
            targetQuat.current.fromArray(mine.quaternion)
            needsTeleport.current = true
            useMonsterStore.getState().update(id, { hp: mine.hp, maxHp: mine.maxHp })
            if (!mine.alive) triggerDeath(0) // ya muerto, countdown 0
        }

        const onTransform = (data: {
            id: string
            position: [number, number, number]
            quaternion: [number, number, number, number]
            hp: number
        }) => {
            if (data.id !== id || !aliveRef.current) return
            targetPos.current.fromArray(data.position)
            targetQuat.current.fromArray(data.quaternion)
            if (data.hp !== undefined) {
                useMonsterStore.getState().update(id, { hp: data.hp })
                if (data.hp <= 0) triggerDeath()
            }
        }

        const onDeath = (data: { id: string }) => {
            if (data.id !== id) return
            triggerDeath()
        }

        const onRespawn = (data: {
            id: string
            hp: number
            maxHp: number
            position: [number, number, number]
        }) => {
            if (data.id !== id) return
            aliveRef.current = true
            setAlive(true)
            setRespawnTimer(null)
            if (respawnIntervalRef.current) {
                clearInterval(respawnIntervalRef.current)
                respawnIntervalRef.current = null
            }
            targetPos.current.fromArray(data.position)
            needsTeleport.current = true
            useMonsterStore.getState().update(id, { hp: data.hp, maxHp: data.maxHp, aggro: false })
        }

        socket.on('dragonInit', onInit)
        socket.on('dragonTransform', onTransform)
        socket.on('dragonDeath', onDeath)
        socket.on('dragonRespawn', onRespawn)
        return () => {
            socket.off('dragonInit', onInit)
            socket.off('dragonTransform', onTransform)
            socket.off('dragonDeath', onDeath)
            socket.off('dragonRespawn', onRespawn)
            if (respawnIntervalRef.current) clearInterval(respawnIntervalRef.current)
        }
    }, [id])

    // === frame loop ===
    useFrame((_, delta) => {
        if (!group.current) return
        const monster = useMonsterStore.getState().monsters[id]
        if (!monster) return

        if (needsTeleport.current) {
            group.current.position.copy(targetPos.current)
            group.current.quaternion.copy(targetQuat.current)
            needsTeleport.current = false
        } else {
            group.current.position.lerp(targetPos.current, 5 * delta)
            group.current.quaternion.slerp(targetQuat.current, 5 * delta)
        }

        useMonsterStore.getState().update(id, {
            position: group.current.position.clone(),
            quaternion: group.current.quaternion.clone(),
        })

        // pegado al suelo
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
                group.current.position.y = THREE.MathUtils.lerp(
                    group.current.position.y,
                    hits[0].point.y + footOffset,
                    10 * delta
                )
            } else {
                group.current.position.y -= 9.8 * delta
            }
        }

        // velocidad
        const cur = group.current.position
        const last = lastRenderPos.current
        const instSpeed = Math.hypot(cur.x - last.x, cur.z - last.z) / Math.max(delta, 1e-3)
        smoothedSpeed.current = THREE.MathUtils.lerp(smoothedSpeed.current, instSpeed, 0.15)
        last.copy(cur)

        // animación
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

    // mantener target UI actualizado
    useFrame(() => {
        if (!group.current) return
        const state = useTargetStore.getState()
        if (state.selectedTarget?.id === id) {
            const hitPoint = group.current.position.clone()
            hitPoint.y += 1
            state.setSelectedTarget({ ...state.selectedTarget, position: hitPoint.clone() })
        }
    })

    return (
        <>
            {!alive && (
                <group position={position}>
                    <Html center style={{ pointerEvents: 'none' }}>
                        <div style={{
                            color: '#aaddff',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            textShadow: '0 0 8px #000',
                            whiteSpace: 'nowrap',
                        }}>
                            💀 {nameId} — Reaparece en {respawnTimer ?? 15}s
                        </div>
                    </Html>
                </group>
            )}
            <group
                ref={group}
                dispose={null}
                scale={5}
                position={position}
                visible={alive}
                onClick={(e) => {
                    e.stopPropagation()
                    const monster = useMonsterStore.getState().monsters[id]
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
                    <MonsterPlate
                        name={nameId}
                        level={1}
                        hp={useMonsterStore((s) => s.monsters[id]?.hp ?? 200)}
                        maxHp={useMonsterStore((s) => s.monsters[id]?.maxHp ?? 200)}
                        scale={0.5}
                        position={[0, 0.5, 0]}
                    />
                    <group name="RootNode">
                        <group name="CharacterArmature" rotation={[-Math.PI / 2, 0, Math.PI]} scale={10}>
                            <primitive object={(nodes as any).Root} />
                        </group>
                        <group name="Dragon" rotation={[-Math.PI / 2, 0, 0]} scale={1}>
                            <skinnedMesh name="Dragon_1" geometry={(nodes as any).Dragon_1.geometry} material={(materials as any).Dragon_Main}      skeleton={(nodes as any).Dragon_1.skeleton} />
                            <skinnedMesh name="Dragon_2" geometry={(nodes as any).Dragon_2.geometry} material={(materials as any).Dragon_Secondary}  skeleton={(nodes as any).Dragon_2.skeleton} />
                            <skinnedMesh name="Dragon_3" geometry={(nodes as any).Dragon_3.geometry} material={(materials as any).Dragon_Horn}       skeleton={(nodes as any).Dragon_3.skeleton} />
                            <skinnedMesh name="Dragon_4" geometry={(nodes as any).Dragon_4.geometry} material={(materials as any).Eye_White}         skeleton={(nodes as any).Dragon_4.skeleton} />
                            <skinnedMesh name="Dragon_5" geometry={(nodes as any).Dragon_5.geometry} material={(materials as any).Eye_Black}         skeleton={(nodes as any).Dragon_5.skeleton} />
                        </group>
                    </group>
                </group>
            </group>
        </>
    )
}

useGLTF.preload('/dungeons/monsters/dragon.glb')
