import { useEffect, useRef } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useInventoryStore } from '../../store/useInventoryStore'
import { swordItem } from '../../components/weapons/sword/Sword-Item'

type CharacterProps = {
    animation: string
}

export default function BasicCharacterModel({ animation, ...props }: CharacterProps) {
    const group = useRef<THREE.Group>(null!)
    const rightHandRef = useRef<THREE.Group>(null!)

    const { nodes, materials, animations } = useGLTF('/BasicCharacter2.glb')
    const { actions } = useAnimations(animations, group)

    // Animación
    useEffect(() => {
        actions[animation]?.reset().fadeIn(0.24).play()
        return () => {
            actions?.[animation]?.fadeOut(0.24)
        }
    }, [animation, actions])

    // Arma equipada desde inventario
    const weaponItem = useInventoryStore(state => state.equipment.weapon)
    const WeaponModel = weaponItem?.Model

    return (
        <group ref={group} {...props} dispose={null}>
            <group name="Scene">
                <group name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
                    <skinnedMesh
                        name="Alpha_Joints"
                        geometry={(nodes.Alpha_Joints as THREE.SkinnedMesh).geometry}
                        material={materials.Alpha_Joints_MAT}
                        skeleton={(nodes.Alpha_Joints as THREE.SkinnedMesh).skeleton}
                    />
                    <skinnedMesh
                        name="Alpha_Surface"
                        geometry={(nodes.Alpha_Surface as THREE.SkinnedMesh).geometry}
                        material={materials.Alpha_Body_MAT}
                        skeleton={(nodes.Alpha_Surface as THREE.SkinnedMesh).skeleton}
                    />
                    <primitive object={nodes.mixamorigHips} />
                </group>
            </group>

            {/* Arma en la mano derecha */}
            <group ref={rightHandRef} position={[0.1, 1.5, 0]}>
                {WeaponModel ? <WeaponModel /> : null}
            </group>
        </group>
    )
}

useGLTF.preload('/BasicCharacter2.glb')
