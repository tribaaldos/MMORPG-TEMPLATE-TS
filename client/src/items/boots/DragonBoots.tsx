import React, { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three';

type Props = {
    skeleton?: THREE.Skeleton
    url?: string
}
export default function DragonBootsModel({
    skeleton,
    url = "/items/boots/dragonBoots.glb",
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
                        name="Mesh_0001"
                        geometry={nodes.Mesh_0001.geometry}
                        material={materials.Material_0}
                        skeleton={skeleton ?? nodes.Mesh_0001.skeleton}
                    />
                    <skinnedMesh
                        name="Mesh_0002"
                        geometry={nodes.Mesh_0002.geometry}
                        material={materials.Material_0}
                        skeleton={skeleton ?? nodes.Mesh_0002.skeleton}
                    />
                    
                    <skinnedMesh
                        name="Mesh_0003"
                        geometry={nodes.Mesh_0003.geometry}
                        material={materials.Material_0}
                        skeleton={skeleton ?? nodes.Mesh_0003.skeleton}
                    />
                    <skinnedMesh
                        name="Mesh_0004"
                        geometry={nodes.Mesh_0004.geometry}
                        material={materials.Material_0}
                        skeleton={skeleton ?? nodes.Mesh_0004.skeleton}
                    />
                    <primitive object={nodes.root} />
                    {/* <primitive object={nodes.root} /> */}
                </group>
            </group>
        </group>
    )
}

useGLTF.preload('/items/boots/dragonBoots.glb')
