import React, { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three';

type Props = {
    skeleton?: THREE.Skeleton
    url?: string
}
export default function ShredShield({
    skeleton,
    url = "/items/shields/ShieldShred/ShieldShred.glb",
}: Props) {
    const group = useRef<THREE.Group>(null)
    const { nodes, materials, } = useGLTF(url) as unknown as {
        nodes: Record<string, any>;
        materials: Record<string, THREE.Material>;

    };

    // refs a skinned mesh 
    const mesh = useRef<THREE.SkinnedMesh>(null);
    useEffect(() => {
        if (!skeleton) return;
        mesh.current?.bind(skeleton, mesh.current.bindMatrix);
    })

    return (
        <group ref={group} dispose={null}>
            <group name="Scene">
                <group name="Rig">
                    <skinnedMesh
                        name="Object014__ShredderShield_14default_0"
                        geometry={nodes.Object014__ShredderShield_14default_0.geometry}
                        material={materials.ShredderShield_14default}
                        skeleton={skeleton ?? nodes.Object014__ShredderShield_14default_0.skeleton}
                    />
                    <primitive object={nodes.root} />
                </group>
            </group>
        </group>
    )
}

useGLTF.preload('/items/shields/ShieldShred/ShieldShred.glb')
