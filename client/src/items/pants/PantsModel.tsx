
import React, { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three';

type Props = {
    skeleton?: THREE.Skeleton
    url?: string
}
export default function PantsModel({
    skeleton,
    url = "/items/pants/testPants.glb",
}: Props) {
    const group = useRef<THREE.Group>(null!)
    const { nodes, materials, } = useGLTF(url) as unknown as {
        nodes: Record<string, any>;
        materials: Record<string, THREE.Material>;

    };

    const meshRef = useRef<THREE.SkinnedMesh>(null);
    const meshRef2 = useRef<THREE.SkinnedMesh>(null);
    useEffect(() => {
        if (!skeleton) return;
        meshRef.current?.bind(skeleton, meshRef.current.bindMatrix);
        meshRef2.current?.bind(skeleton, meshRef2.current.bindMatrix);
    }, [skeleton]);

    return (
        <group ref={group} dispose={null}>
            <group name="Scene">
                <group name="Rig">
                    <group name="Object_9001">
                        <skinnedMesh
                            frustumCulled={false}
                            name="Object_2003"
                            ref={meshRef}
                            geometry={nodes.Object_2003.geometry}
                            material={materials.humanmale_hd_47}
                            skeleton={nodes.Object_2003.skeleton}
                        />
                        <skinnedMesh
                            frustumCulled={false}
                            name="Object_2003_1"
                            ref={meshRef2}
                            geometry={nodes.Object_2003_1.geometry}
                            material={materials.humanmale_hd_62}
                            skeleton={nodes.Object_2003_1.skeleton}
                        />
                    </group>
                    {/* <primitive object={nodes.root} /> */}
                </group>
            </group>
        </group>
    )
}

useGLTF.preload('/items/pants/testPants.glb')