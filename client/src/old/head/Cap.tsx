// components/items/CapTwo.tsx
import React, { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

type Props = {
  skeleton?: THREE.Skeleton;
  url?: string;

  // Material override params (dos zonas del casco)
  color1?: THREE.ColorRepresentation;
  metalness1?: number;
  roughness1?: number;
  emissive1?: THREE.ColorRepresentation;

  color2?: THREE.ColorRepresentation;
  metalness2?: number;
  roughness2?: number;
  emissive2?: THREE.ColorRepresentation;

  // Si quieres poder activar sombras de forma opcional
  castShadows?: boolean;
  receiveShadows?: boolean;
};

// Cache global (por módulo) para NO recrear materiales por render ni por ítem igual
const matCache = new Map<string, THREE.MeshStandardMaterial>();
function getMatKey(c: any, m: number, r: number, e: any) {
  return `${new THREE.Color(c).getHexString()}|m:${m}|r:${r}|e:${new THREE.Color(e).getHexString()}`;
}
function getSharedStdMaterial(
  color: THREE.ColorRepresentation,
  metalness: number,
  roughness: number,
  emissive: THREE.ColorRepresentation
) {
  const key = getMatKey(color, metalness, roughness, emissive);
  let mat = matCache.get(key);
  if (!mat) {
    mat = new THREE.MeshStandardMaterial({
      color,
      metalness,
      roughness,
      emissive: new THREE.Color(emissive),
      side: THREE.FrontSide,
      transparent: false,
      depthWrite: true,
      depthTest: true,
    });
    // Importante para skinned meshes
    (mat as any).skinning = true;
    matCache.set(key, mat);
  }
  return mat;
}

export default function Cap({
  skeleton,
  url = "/items/head/cap.glb",
  color1 = "blue",  metalness1 = 0.2, roughness1 = 0.8, emissive1 = "#000",
  color2 = "red",   metalness2 = 0.6, roughness2 = 0.3, emissive2 = "#000",
  castShadows = false,
  receiveShadows = false,
}: Props) {
  const mesh1 = useRef<THREE.SkinnedMesh>(null);
  const mesh2 = useRef<THREE.SkinnedMesh>(null);

  // Carga GLB una vez
  const { nodes } = useGLTF(url) as unknown as {
    nodes: Record<string, any>;
  };

  // Materiales compartidos (no se recrean por render)
  const mat1 = useMemo(
    () => getSharedStdMaterial(color1, metalness1, roughness1, emissive1),
    [color1, metalness1, roughness1, emissive1]
  );
  const mat2 = useMemo(
    () => getSharedStdMaterial(color2, metalness2, roughness2, emissive2),
    [color2, metalness2, roughness2, emissive2]
  );

  // Re-bind al esqueleto externo si lo pasas
  useEffect(() => {
    if (!skeleton) return;
    mesh1.current?.bind(skeleton, mesh1.current.bindMatrix);
    mesh2.current?.bind(skeleton, mesh2.current.bindMatrix);
  }, [skeleton]);

  // Si los nombres de los nodos difieren, ajusta aquí
  const n = nodes as any;
  const part1 = n.baseball_cap_1 as THREE.SkinnedMesh | undefined;
  const part2 = n.baseball_cap_2 as THREE.SkinnedMesh | undefined;
  if (!part1 || !part2) return null;

  return (
    <group dispose={null}>
      <skinnedMesh
        ref={mesh1}
        name="baseball_cap_1"
        geometry={part1.geometry}
        skeleton={skeleton ?? part1.skeleton}
        // ✅ deja el culling activado por defecto (no pongas frustumCulled={false})
        castShadow={castShadows}
        receiveShadow={receiveShadows}
        material={mat1}   // 👈 material compartido, no JSX material inline
      />
      <skinnedMesh
        ref={mesh2}
        name="baseball_cap_2"
        geometry={part2.geometry}
        skeleton={skeleton ?? part2.skeleton}
        castShadow={castShadows}
        receiveShadow={receiveShadows}
        material={mat2}
      />
    </group>
  );
}

useGLTF.preload("/items/head/cap.glb");
