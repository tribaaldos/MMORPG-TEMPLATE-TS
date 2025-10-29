import React, { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three';

type Props = {
    skeleton?: THREE.Skeleton
    url?: string
}
export default function IronGloves({
    skeleton,
    url = "/items/gloves/Gloves.glb",
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
                        name="Body__0"
                        geometry={nodes.Body__0.geometry}
                        material={materials['Scene_-_Root']}
                        skeleton={skeleton ?? nodes.Body__0.skeleton}
                    />
                    <skinnedMesh
                        name="Body__0001"
                        geometry={nodes.Body__0001.geometry}
                        material={materials['Scene_-_Root']}
                        skeleton={skeleton ?? nodes.Body__0001.skeleton}
                    />
                    <primitive object={nodes.root} />
                </group>
            </group>
        </group>
    )
}

useGLTF.preload('/items/gloves/Gloves.glb')
