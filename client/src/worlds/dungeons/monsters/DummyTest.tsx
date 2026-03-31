import React, { useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import NameTag from '../../../character/NameTag'
import { useTargetStore } from '../../../store/useTargetStore'
import { useMonsterStore } from './useMonsterStore'
import { TransformControls } from '@react-three/drei'

type GLTFResult = {
    nodes: {
        [name: string]: THREE.Mesh & { geometry: THREE.BufferGeometry }
    }
    materials: { [name: string]: THREE.Material }
}

interface DummyProps {
    position?: [number, number, number]
    nameId?: string
    id?: string
    scale?: number
}

export default function TrainingDummy({
    position = [3, -4, 0],
    nameId = 'Dummy',
    id = 'dummy-1',
    scale = 0.3,
}: DummyProps) {
    const group = useRef<THREE.Group>(null)

    // Carga del modelo (ajusta la ruta si la tuya difiere)
    const { nodes, materials } = useGLTF('/dungeons/monsters/training_dummy.glb') as unknown as GLTFResult

    const setSelectedTarget = useTargetStore((s) => s.setSelectedTarget)

    // Spawn estático en el store (solo cliente)
    useEffect(() => {
        useMonsterStore.getState().spawn({
            id,
            kind: 'dummy',
            name: nameId,
            level: 1,
            hp: 100,
            maxHp: 100,
            position: new THREE.Vector3(...position),
            quaternion: new THREE.Quaternion(),
            animation: 'idle',
            aggro: false,
            // Opcional: world si usas mundos
            // world: useCharacterStore.getState().world ?? null,
        })
    }, [id, nameId, position])

    // Mantén en el store su transform (aunque no se mueva)
    useFrame(() => {
        if (!group.current) return
        useMonsterStore.getState().update(id, {
            position: group.current.position.clone(),
            quaternion: group.current.quaternion.clone(),
        })
    })

    // Actualiza el punto del "selectedTarget" para UI (marcador/linea, etc)
    useFrame(() => {
        if (!group.current) return
        const state = useTargetStore.getState()
        if (state.selectedTarget?.id === id) {
            const hitPoint = new THREE.Vector3();
            group.current.getWorldPosition(hitPoint);
            hitPoint.y += 1 // súbelo un poco para que el marcador quede sobre el dummy
            state.setSelectedTarget({
                ...state.selectedTarget,
                position: hitPoint,
            })
        }
    })

    return (
        <>
            <TransformControls object={group.current} mode="translate" />
            <group
                ref={group}
                dispose={null}
                scale={scale}
                position={position}
                onClick={(e) => {
                    e.stopPropagation()
                    const m = useMonsterStore.getState().monsters[id]
                    if (!m) return
                    setSelectedTarget({
                        id: m.id,
                        name: m.name,
                        level: m.level,
                        hp: m.hp,
                        maxHp: m.maxHp,
                        kind: 'monster',
                        position: m.position,
                    })
                }}
            >
                <NameTag text={nameId} scale={0.5} position={[0, 1.2, 0]} />

                {/* --- Geometría tal cual de tu glTF (sin animación ni movimiento) --- */}
                <group dispose={null}>
                    <group position={[-0.025, 0, 0]} scale={[-1, 1, 1]}>
                        <mesh castShadow receiveShadow geometry={(nodes as any).pPlane5_blinn2_0_1.geometry} material={(materials as any).blinn2} />
                        <mesh castShadow receiveShadow geometry={(nodes as any).pPlane3_blinn2_0_1.geometry} material={(materials as any).blinn2} />
                        <mesh castShadow receiveShadow geometry={(nodes as any).pPlane1_blinn2_0_1.geometry} material={(materials as any).blinn2} />
                        <mesh castShadow receiveShadow geometry={(nodes as any).pPlane6_blinn2_0_1.geometry} material={(materials as any).blinn2} />
                        <mesh castShadow receiveShadow geometry={(nodes as any).pPlane4_blinn2_0_1.geometry} material={(materials as any).blinn2} />
                        <mesh castShadow receiveShadow geometry={(nodes as any).pPlane7_blinn2_0_1.geometry} material={(materials as any).blinn2} />
                        <mesh castShadow receiveShadow geometry={(nodes as any).pPlane2_blinn2_0_1.geometry} material={(materials as any).blinn2} />
                    </group>

                    <group position={[9.759, 7.028, 0]} rotation={[0, 0, Math.PI / 2]} scale={[-1, 1, 1]}>
                        <mesh castShadow receiveShadow geometry={(nodes as any).pPlane5_blinn2_0_2.geometry} material={(materials as any).blinn2} position={[-0.108, 0.022, 0]} />
                        <mesh castShadow receiveShadow geometry={(nodes as any).pPlane3_blinn2_0_2.geometry} material={(materials as any).blinn2} position={[-0.108, 0.022, 0]} />
                        <mesh castShadow receiveShadow geometry={(nodes as any).pPlane1_blinn2_0_2.geometry} material={(materials as any).blinn2} position={[-0.108, 0.022, 0]} />
                        <mesh castShadow receiveShadow geometry={(nodes as any).pPlane6_blinn2_0_2.geometry} material={(materials as any).blinn2} position={[-0.108, 0.022, 0]} />
                        <mesh castShadow receiveShadow geometry={(nodes as any).pPlane4_blinn2_0_2.geometry} material={(materials as any).blinn2} position={[-0.108, 0.022, 0]} />
                        <mesh castShadow receiveShadow geometry={(nodes as any).pPlane7_blinn2_0_2.geometry} material={(materials as any).blinn2} position={[-0.108, 0.022, 0]} />
                        <mesh castShadow receiveShadow geometry={(nodes as any).pPlane2_blinn2_0_2.geometry} material={(materials as any).blinn2} position={[-0.108, 0.022, 0]} />
                    </group>

                    <mesh castShadow receiveShadow geometry={(nodes as any).pTorus6_blinn1_0.geometry} material={(materials as any).blinn1} />
                    <mesh castShadow receiveShadow geometry={(nodes as any).pPlane5_blinn2_0.geometry} material={(materials as any).blinn2} />
                    <mesh castShadow receiveShadow geometry={(nodes as any).pPlane3_blinn2_0.geometry} material={(materials as any).blinn2} />
                    <mesh castShadow receiveShadow geometry={(nodes as any).pPlane1_blinn2_0.geometry} material={(materials as any).blinn2} />
                    <mesh castShadow receiveShadow geometry={(nodes as any).pPlane6_blinn2_0.geometry} material={(materials as any).blinn2} />
                    <mesh castShadow receiveShadow geometry={(nodes as any).pPlane4_blinn2_0.geometry} material={(materials as any).blinn2} />
                    <mesh castShadow receiveShadow geometry={(nodes as any).pPlane7_blinn2_0.geometry} material={(materials as any).blinn2} />
                    <mesh castShadow receiveShadow geometry={(nodes as any).pPlane2_blinn2_0.geometry} material={(materials as any).blinn2} />
                    <mesh castShadow receiveShadow geometry={(nodes as any).pPlane8_blinn2_0.geometry} material={(materials as any).blinn2} position={[-2.678, -3.328, -1.054]} rotation={[0, -0.251, 0]} />
                    <mesh castShadow receiveShadow geometry={(nodes as any).pPlane9_blinn2_0.geometry} material={(materials as any).blinn2} position={[-4.19, -2.657, 4.382]} rotation={[-0.619, -0.206, -0.145]} />
                </group>
            </group>
        </>
    )
}

// Asegura que la ruta de preload coincide con la del useGLTF de arriba
useGLTF.preload('/dungeons/monsters/training_dummy.glb')
