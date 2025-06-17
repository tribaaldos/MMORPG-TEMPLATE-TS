
import { useEffect, useRef } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import * as THREE from 'three';


type CharacterProps = {
    animation: string;
}

export default function BasicCharacterModel({ animation, ...props }: CharacterProps) {
    const group = useRef<THREE.Group>(null!);

    const { nodes, materials, animations } = useGLTF('/BasicCharacter2.glb')
    const { actions } = useAnimations(animations, group)
    console.log("actions", actions);
    console.log("animation", animation);
    useEffect(() => {
        actions[animation]?.reset().fadeIn(0.24).play();
        return () => {
            actions?.[animation]?.fadeOut(0.24);
        };
    }, [animation, actions]);
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
        </group>

    )
}

useGLTF.preload('/BasicCharacter2.glb')