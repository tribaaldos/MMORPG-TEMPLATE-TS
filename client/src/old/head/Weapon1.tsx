// components/items/FirstSwordModel.tsx
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { useSkinnedGLB } from "../useSkinnedClone";

type Props = {
  skeleton?: THREE.Skeleton;
  colorA?: THREE.ColorRepresentation;
  colorB?: THREE.ColorRepresentation;
};

export default function FirstSwordModel({
  skeleton,
  colorA = "gray",
  colorB = "red",
}: Props) {
  const { nodes, ready, error } = useSkinnedGLB("/items/weapons/FirstSword.glb", skeleton, {
    deps: [skeleton], // si cambia el skeleton, re-evaluamos
  });

  const meshA = useRef<THREE.SkinnedMesh | null>(null);
  const meshB = useRef<THREE.SkinnedMesh | null>(null);

  // Nodos del GLB (siempre con hooks/top-level)
  const mA = useMemo(
    () => (nodes ? (nodes as any).Cube001 as THREE.SkinnedMesh : null),
    [nodes]
  );
  const mB = useMemo(
    () => (nodes ? (nodes as any).Cube001_1 as THREE.SkinnedMesh : null),
    [nodes]
  );

  // Solo clonamos armature si NO nos pasan skeleton externo
  const armatureClone = useMemo(() => {
    if (skeleton || !nodes) return null;
    const arm = (nodes as any).Armature as THREE.Object3D | undefined;
    return arm ? SkeletonUtils.clone(arm) : null; // 👈 clone → identidad nueva por arma
  }, [skeleton, nodes]);

  // Rebind si llega skeleton externo (personaje)
  useEffect(() => {
    if (!skeleton) return;
    meshA.current?.bind(skeleton, meshA.current.bindMatrix);
    meshB.current?.bind(skeleton, meshB.current.bindMatrix);
  }, [skeleton]);

  // Si usamos armature del GLB (no hay skeleton externo), ocultamos meshes internos
  useEffect(() => {
    if (!armatureClone) return;
    armatureClone.traverse((o: any) => {
      if (o.isMesh || o.isSkinnedMesh) o.visible = false;
    });
  }, [armatureClone]);

  if (error || !ready || !mA || !mB) return null;

  return (
    <group dispose={null}>
      {/* Solo montamos huesos propios si NO hay skeleton externo */}
      {armatureClone && <primitive object={armatureClone} />}

      <skinnedMesh
        ref={meshA}
        geometry={mA.geometry}
        skeleton={skeleton ?? mA.skeleton}
        frustumCulled={false}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={colorA}
          transparent={false} opacity={1} depthWrite depthTest
          blending={THREE.NormalBlending} side={THREE.FrontSide}
        />
      </skinnedMesh>

      <skinnedMesh
        ref={meshB}
        geometry={mB.geometry}
        skeleton={skeleton ?? mB.skeleton}
        frustumCulled={false}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={colorB}
          transparent={false} opacity={1} depthWrite depthTest
          blending={THREE.NormalBlending} side={THREE.FrontSide}
        />
      </skinnedMesh>
    </group>
  );
}
