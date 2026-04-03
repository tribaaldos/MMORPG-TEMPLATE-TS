import React, { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three';

type Props = {
    skeleton?: THREE.Skeleton
    url?: string
}
export default function FireWeapon({
    skeleton,
    url = "/items/weapons/volcanic_axe.glb",
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
                        frustumCulled={false}
                        ref={mesh}
                        name="lavaAxe"
                        geometry={nodes.lavaAxe.geometry}
                        material={materials.M_LavaAxe}
                        skeleton={skeleton ?? nodes.lavaAxe.skeleton}
                    >
                    </skinnedMesh>
                    {/* <primitive object={nodes.root} /> */}
                </group>
            </group>
        </group>
    )
}

useGLTF.preload('/items/weapons/volcanic_axe.glb')
