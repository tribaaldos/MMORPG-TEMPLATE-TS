import { useRef, useState } from "react"
import { useGLTF, useAnimations } from "@react-three/drei"
import * as THREE from "three"
import { DissolveMaterial } from "../shaders/DissolveMaterial"
import { useLootStore } from "../../store/useLootStore"
import { BasicShoulder, BasicGreenShoulderItem } from "../../items/storage/ShouldersStorage"

interface ModelProps {
    position?: [number, number, number]
}

const CHEST_LOOT = [BasicShoulder, BasicGreenShoulderItem]

export function Model({ position = [0, 0, 0] }: ModelProps) {
    const group = useRef<THREE.Group>(null)
    const { nodes, materials, animations } = useGLTF("/environment/cofre.glb")
    const { actions } = useAnimations(animations, group)
    const dissolveColor = 'rgb(97, 50, 4)'
    const [startDissolve, setStartDissolve] = useState(false)
    const [removed, setRemoved] = useState(false)
    const [opened, setOpened] = useState(false)

    const openLoot = useLootStore((s) => s.openLoot)

    const handleClick = () => {
        if (opened) return
        setOpened(true)
        const action = actions["abrir"]
        if (action) {
            action.reset()
            action.setLoop(THREE.LoopOnce, 1)
            action.clampWhenFinished = true
            action.play()
            action.getMixer().addEventListener("finished", () => {
                openLoot(CHEST_LOOT)
            })
        }
    }

    // El cofre se disuelve cuando el popup se cierra (lootStore vacío)
    useLootStore.subscribe((s) => {
        if (opened && !s.isOpen && s.items.length === 0) {
            setStartDissolve(true)
            setTimeout(() => setRemoved(true), 2000)
        }
    })

    if (removed) return null

    return (
        <group ref={group} dispose={null} position={position} scale={3} onClick={handleClick}>
            <group name="Scene">
                <group name="base" scale={0.055}>
                    <mesh geometry={(nodes["Treasure_trunk_Cube026-Mesh"] as THREE.Mesh).geometry}>
                        <DissolveMaterial {...materials["795548"]} visible={!startDissolve} speed={0.5} size={3} dissolveColor={dissolveColor} />
                    </mesh>
                    <mesh geometry={(nodes["Treasure_trunk_Cube026-Mesh_1"] as THREE.Mesh).geometry}>
                        <DissolveMaterial {...materials["455A64"]} visible={!startDissolve} speed={0.5} size={3} dissolveColor={dissolveColor} />
                    </mesh>
                </group>
                <group name="tapa" position={[0.001, 0.271, -0.198]} scale={0.055}>
                    <mesh geometry={(nodes["Treasure_trunk_Cube026-Mesh001"] as THREE.Mesh).geometry}>
                        <DissolveMaterial {...materials["795548"]} visible={!startDissolve} speed={0.5} size={3} dissolveColor={dissolveColor} />
                    </mesh>
                    <mesh geometry={(nodes["Treasure_trunk_Cube026-Mesh001_1"] as THREE.Mesh).geometry}>
                        <DissolveMaterial {...materials["455A64"]} visible={!startDissolve} speed={0.5} size={3} dissolveColor={dissolveColor} />
                    </mesh>
                </group>
            </group>
        </group>
    )
}

useGLTF.preload("/environment/cofre.glb")
