// FirstSwordModel.tsx
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useSkinnedGLB } from "../useSkinnedClone";

type Props = {
  skeleton?: THREE.Skeleton;
  colorA?: THREE.ColorRepresentation;
  colorB?: THREE.ColorRepresentation;
};

export default function SecondSwordModel({ skeleton, colorA="gray", colorB="red" }: Props) {
  const { nodes, ready, error } = useSkinnedGLB("/items/weapons/FirstSword.glb", skeleton);
  const meshA = useRef<THREE.SkinnedMesh|null>(null);
  const meshB = useRef<THREE.SkinnedMesh|null>(null);

  const mA = useMemo(()=> nodes ? (nodes as any).Cube001 as THREE.SkinnedMesh : null, [nodes]);
  const mB = useMemo(()=> nodes ? (nodes as any).Cube001_1 as THREE.SkinnedMesh : null, [nodes]);

  useEffect(() => {
    if (!skeleton) return;
    meshA.current?.bind(skeleton, meshA.current.bindMatrix);
    meshB.current?.bind(skeleton, meshB.current.bindMatrix);
  }, [skeleton]);

  if (error || !ready || !mA || !mB) return null;

  return (
    <>
    <group dispose={null}>
      <skinnedMesh ref={meshA} geometry={mA.geometry} skeleton={skeleton ?? mA.skeleton} frustumCulled={false}>
        <meshStandardMaterial color={colorA} transparent={false} opacity={1} depthWrite depthTest side={THREE.BackSide}/>
      </skinnedMesh>
      <skinnedMesh ref={meshB} geometry={mB.geometry} skeleton={skeleton ?? mB.skeleton} frustumCulled={false}>
        <meshStandardMaterial color={colorB} transparent={false} opacity={1} depthWrite depthTest side={THREE.BackSide}/>
      </skinnedMesh>
    </group>
    {/* <primitive object={nodes.Armature} /> */}
    </>
  );
}
