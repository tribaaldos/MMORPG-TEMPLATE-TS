// components/items/CapTwo.tsx
import React, { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

type Props = {
  /** Esqueleto del personaje; si lo pasas no montamos el armature del GLB */
  skeleton?: THREE.Skeleton;
  /** Ruta del GLB */
  url?: string;

  /** Material para la parte 1 (por ej. visera) */
  color1?: THREE.ColorRepresentation;
  metalness1?: number; // 0..1
  roughness1?: number; // 0..1
  emissive1?: THREE.ColorRepresentation;

  /** Material para la parte 2 (por ej. cuerpo del gorro) */
  color2?: THREE.ColorRepresentation;
  metalness2?: number; // 0..1
  roughness2?: number; // 0..1
  emissive2?: THREE.ColorRepresentation;
};

export default function CapTwo({
  skeleton,
  url = "/items/head/cap.glb",
  color1 = "#222", metalness1 = 0.2, roughness1 = 0.8, emissive1 = "#000",
  color2 = "red",  metalness2 = 0.6, roughness2 = 0.3, emissive2 = "#000",
}: Props) {
  const group = useRef<THREE.Group>(null);
  const mesh1 = useRef<THREE.SkinnedMesh>(null);
  const mesh2 = useRef<THREE.SkinnedMesh>(null);

  // Cargamos nodos/materiales/animaciones del GLB
  const { nodes, materials, animations } = useGLTF(url) as unknown as {
    nodes: Record<string, any>;
    materials: Record<string, THREE.Material>;
    animations: THREE.AnimationClip[];
  };

  // (Opcional) si tu GLB trae animaciones
  useAnimations(animations, group);

  // Re-bind al esqueleto externo si lo pasas
  useEffect(() => {
    if (!skeleton) return;
    mesh1.current?.bind(skeleton, mesh1.current.bindMatrix);
    mesh2.current?.bind(skeleton, mesh2.current.bindMatrix);
  }, [skeleton]);

  // Si hay skeleton externo no montamos el armature del GLB
  const includeArmature = !skeleton;

  return (
    <group ref={group} dispose={null}>
      <group name="Scene">
        <group name="Armature">
          <group name="baseball_cap">
            {/* Parte 1 */}
            <skinnedMesh
              ref={mesh1}
              name="baseball_cap_1"
              geometry={nodes.baseball_cap_1.geometry}
              skeleton={skeleton ?? nodes.baseball_cap_1.skeleton}
              frustumCulled={false}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                attach="material"
                // skinning
                color={color1}
                metalness={metalness1}
                roughness={roughness1}
                emissive={emissive1}
                transparent={false}
                opacity={1}
                depthWrite
                depthTest
                blending={THREE.NormalBlending}
                side={THREE.FrontSide}
              />
            </skinnedMesh>

            {/* Parte 2 */}
            <skinnedMesh
              ref={mesh2}
              name="baseball_cap_2"
              geometry={nodes.baseball_cap_2.geometry}
              skeleton={skeleton ?? nodes.baseball_cap_2.skeleton}
              frustumCulled={false}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                attach="material"
                skinning
                color={color2}
                metalness={metalness2}
                roughness={roughness2}
                emissive={emissive2}
                transparent={false}
                opacity={1}
                depthWrite
                depthTest
                blending={THREE.NormalBlending}
                side={THREE.FrontSide}
              />
            </skinnedMesh>
          </group>

          {/* Solo montamos los bones del GLB si NO hay skeleton externo */}
          {/* {includeArmature && <primitive object={nodes.mixamorigHips} />} */}
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/items/head/cap.glb");
