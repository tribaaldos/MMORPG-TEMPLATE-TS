import React, { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three';

type Props = {
  skeleton?: THREE.Skeleton
  url?: string
}
export default function BVHWeapon({
  skeleton,
  url = "/testweapon.glb",
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
            name="polySurface13_lambert1_0"
            geometry={nodes.polySurface13_lambert1_0.geometry}
            material={materials.lambert1}
            skeleton={skeleton ?? nodes.polySurface13_lambert1_0.skeleton}
          >
          </skinnedMesh>
          {/* <primitive object={nodes.root} /> */}
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/testweapon.glb')
