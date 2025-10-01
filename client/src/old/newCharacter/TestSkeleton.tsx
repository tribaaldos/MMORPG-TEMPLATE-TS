import { useEffect, useMemo, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

type Props = {
  animation: string;
  name: string;
};

export default function TestSkeleton({ animation }: Props) {
  const avatarRef = useRef<THREE.Group>(null!);
  const { scene, animations } = useGLTF("/BasicCharacter4.glb");
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { actions } = useAnimations(animations, avatarRef);

  const groupRef = useRef<THREE.Group>(null!);

  const rightHandBoneRef = useRef<THREE.Bone | null>(null);
  const headBoneRef = useRef<THREE.Bone | null>(null);

  const handMeshRef = useRef<THREE.Mesh>(null!);
  const headMeshRef = useRef<THREE.Mesh>(null!);

  const tempPos = useMemo(() => new THREE.Vector3(), []);
  const tempQuat = useMemo(() => new THREE.Quaternion(), []);
  const parentPos = useMemo(() => new THREE.Vector3(), []);
  const parentQuat = useMemo(() => new THREE.Quaternion(), []);

  // --- Animación ---
  useEffect(() => {
    if (!actions[animation]) return;
    actions[animation].reset().fadeIn(0.25).play();
    return () => {
      actions[animation]?.fadeOut(0.25);
    };
  }, [animation, actions]);

  // --- Buscar huesos ---
  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
        const skinned = child as THREE.SkinnedMesh;
        const handBone = skinned.skeleton.bones.find((b) => b.name === "mixamorigRightHand");
        const headBone = skinned.skeleton.bones.find((b) => b.name === "mixamorigHead");
        if (handBone) rightHandBoneRef.current = handBone;
        if (headBone) headBoneRef.current = headBone;
      }
    });
  }, [clonedScene]);

  // --- Crear meshes que seguirán los huesos ---
  useEffect(() => {
    handMeshRef.current = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.2),
      new THREE.MeshStandardMaterial({ color: "red" })
    );
    headMeshRef.current = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshStandardMaterial({ color: "blue" })
    );

    clonedScene.add(handMeshRef.current);
    clonedScene.add(headMeshRef.current);
  }, [clonedScene]);

  // --- Actualizar posición cada frame ---
  useFrame(() => {
    if (!groupRef.current) return;

    // Movimiento del grupo padre
    groupRef.current.position.x += 0.01;

    // Mano
    if (rightHandBoneRef.current && handMeshRef.current) {
      rightHandBoneRef.current.getWorldPosition(tempPos);
      rightHandBoneRef.current.getWorldQuaternion(tempQuat);

      groupRef.current.getWorldPosition(parentPos);
      groupRef.current.getWorldQuaternion(parentQuat);

      handMeshRef.current.position.copy(tempPos).sub(parentPos).applyQuaternion(parentQuat.clone().invert());
      handMeshRef.current.quaternion.copy(tempQuat).premultiply(parentQuat.clone().invert());
    }

    // Cabeza
    if (headBoneRef.current && headMeshRef.current) {
      headBoneRef.current.getWorldPosition(tempPos);
      headBoneRef.current.getWorldQuaternion(tempQuat);

      groupRef.current.getWorldPosition(parentPos);
      groupRef.current.getWorldQuaternion(parentQuat);

      headMeshRef.current.position.copy(tempPos).sub(parentPos).applyQuaternion(parentQuat.clone().invert());
      headMeshRef.current.quaternion.copy(tempQuat).premultiply(parentQuat.clone().invert());
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} ref={avatarRef} />
      {/* R3F dibuja los meshes */}
      {handMeshRef.current && <primitive object={handMeshRef.current} />}
      {headMeshRef.current && <primitive object={headMeshRef.current} />}
    </group>
  );
}

useGLTF.preload("/BasicCharacter4.glb");
