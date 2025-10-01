import { useEffect, useMemo, useRef, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import NameTag from "../NameTag";
import { useInventoryStore } from "../../store/useInventoryStore";

type Props = {
  animation: string;
  name: string;
  timeScale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
};

export default function NewCharacterUI({
  animation,
  name = "Test",
  timeScale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: Props) {
  const groupRef = useRef<THREE.Group>(null!);
  const [skeleton, setSkeleton] = useState<THREE.Skeleton | null>(null);

  const { scene, animations } = useGLTF("/probandoCharacter.glb");

  // 🔥 cada instancia clona el scene → cada Canvas tiene su esqueleto propio
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  // Animaciones sobre el clon
  const { actions } = useAnimations(animations, clonedScene);

  // Encontrar el SkinnedMesh y clonar el skeleton
  useEffect(() => {
    let found: THREE.SkinnedMesh | null = null;
    clonedScene.traverse((child) => {
      if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
        found = child as THREE.SkinnedMesh;
      }
    });
    if (found?.skeleton) {
      // 👇 crear copia independiente del skeleton
      const clonedBones = found.skeleton.bones.map((b) => b.clone());
      const clonedSkeleton = new THREE.Skeleton(clonedBones);
      setSkeleton(clonedSkeleton);
    }
  }, [clonedScene]);

  // reproducir animación
  useEffect(() => {
    if (!actions[animation]) return;
    actions[animation].reset().fadeIn(0.25).play();
    Object.values(actions).forEach((action) => {
      action.setEffectiveTimeScale(timeScale);
    });
    return () => actions[animation]?.fadeOut(0.25);
  }, [animation, actions, timeScale]);

  useFrame(() => {});

  // EQUIPMENT desde store
  const equipment = useInventoryStore((s) => s.equipment);

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <pointLight position={[0, 2, 0]} intensity={5} castShadow />
      <NameTag text={name} />
      <primitive object={clonedScene} />
      {skeleton && equipment.legs?.Model && (
        <equipment.legs.Model skeleton={skeleton} />
      )}
      {skeleton && equipment.helmet?.Model && (
        <equipment.helmet.Model skeleton={skeleton} />
      )}
      {skeleton && equipment.shoulders?.Model && (
        <equipment.shoulders.Model skeleton={skeleton} />
      )}
    </group>
  );
}

useGLTF.preload("/probandoCharacter.glb");
