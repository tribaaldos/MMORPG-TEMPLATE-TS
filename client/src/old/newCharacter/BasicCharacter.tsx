import { useEffect, useMemo, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SkinnedMesh, Bone } from "three";
import { useInventoryStore } from "../../store/useInventoryStore";
import NameTag from "../../character/NameTag";

type Props = {
  animation: string;
  name: string;
  timeScale: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
};

export default function BasicCharacter({
  animation,
  name,
  timeScale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: Props) {
  const avatarRef = useRef<THREE.Group>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const { scene, animations } = useGLTF("/BasicCharacter3.glb");
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { actions } = useAnimations(animations, avatarRef);
  const equipment = useInventoryStore((s) => s.equipment);

  // --- Huesos ---
  const headBoneRef = useRef<Bone | null>(null);
  const leftHandBoneRef = useRef<Bone | null>(null);
  const rightHandBoneRef = useRef<Bone | null>(null);
  const leftFootBoneRef = useRef<Bone | null>(null);
  const rightFootBoneRef = useRef<Bone | null>(null);
  const leftShoulderBoneRef = useRef<Bone | null>(null);
  const rightShoulderBoneRef = useRef<Bone | null>(null);
  const spineBoneRef = useRef<Bone | null>(null);
  const hipsBoneRef = useRef<Bone | null>(null);
  const leftUpLegBoneRef = useRef<Bone | null>(null);
  const leftLegBoneRef = useRef<Bone | null>(null);
  const rightUpLegBoneRef = useRef<Bone | null>(null);
  const rightLegBoneRef = useRef<Bone | null>(null);

  // --- Refs de equipo ---
  const weaponRef = useRef<THREE.Group>(null!);
  const helmetRef = useRef<THREE.Group>(null!);
  const glovesLeftRef = useRef<THREE.Group>(null!);
  const glovesRightRef = useRef<THREE.Group>(null!);
  const shouldersLeftRef = useRef<THREE.Group>(null!);
  const shouldersRightRef = useRef<THREE.Group>(null!);
  const chestRef = useRef<THREE.Group>(null!);
  const legsRef = useRef<THREE.Group>(null!);
  const shieldRef = useRef<THREE.Group>(null!);

  // --- Refs botas ---
  const bootsLeftRef = useRef<THREE.Group>(null!);
  const bootsRightRef = useRef<THREE.Group>(null!);

  // --- Points para piernas ---
  const leftPointsRef = useRef([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]);
  const rightPointsRef = useRef([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]);

  // --- Animación ---
  useEffect(() => {
    if (!actions[animation]) return;

    actions[animation].reset().fadeIn(0.25).play();

    // aplicar cámara lenta a todas las acciones
    Object.values(actions).forEach((action) => {
      action.setEffectiveTimeScale(timeScale);
    });

    return () => actions[animation]?.fadeOut(0.25);
  }, [animation, actions, timeScale]);

  // --- Buscar huesos ---
  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as SkinnedMesh).isSkinnedMesh) {
        const skinned = child as SkinnedMesh;
        headBoneRef.current = skinned.skeleton.bones.find((b) => b.name === "mixamorigHead") || null;
        leftHandBoneRef.current = skinned.skeleton.bones.find((b) => b.name === "mixamorigLeftHand") || null;
        rightHandBoneRef.current = skinned.skeleton.bones.find((b) => b.name === "mixamorigRightHand") || null;
        leftFootBoneRef.current = skinned.skeleton.bones.find((b) => b.name === "mixamorigLeftFoot") || null;
        rightFootBoneRef.current = skinned.skeleton.bones.find((b) => b.name === "mixamorigRightFoot") || null;
        leftShoulderBoneRef.current = skinned.skeleton.bones.find((b) => b.name === "mixamorigLeftShoulder") || null;
        rightShoulderBoneRef.current = skinned.skeleton.bones.find((b) => b.name === "mixamorigRightShoulder") || null;
        spineBoneRef.current = skinned.skeleton.bones.find((b) => b.name === "mixamorigSpine2") || null;
        hipsBoneRef.current = skinned.skeleton.bones.find((b) => b.name === "mixamorigHips") || null;
        leftUpLegBoneRef.current = skinned.skeleton.bones.find((b) => b.name === "mixamorigLeftUpLeg") || null;
        leftLegBoneRef.current = skinned.skeleton.bones.find((b) => b.name === "mixamorigLeftLeg") || null;
        rightUpLegBoneRef.current = skinned.skeleton.bones.find((b) => b.name === "mixamorigRightUpLeg") || null;
        rightLegBoneRef.current = skinned.skeleton.bones.find((b) => b.name === "mixamorigRightLeg") || null;
      }
    });
  }, [clonedScene]);

  // --- Frame update ---
  useFrame(() => {
    if (!groupRef.current) return;

    const attachToBone = (bone: Bone | null, ref: THREE.Group | null) => {
      if (!bone || !ref) return;
      const worldPos = new THREE.Vector3();
      const worldQuat = new THREE.Quaternion();
      bone.getWorldPosition(worldPos);
      bone.getWorldQuaternion(worldQuat);

      groupRef.current.worldToLocal(worldPos);
      ref.position.copy(worldPos);

      const parentQuatInv = groupRef.current.getWorldQuaternion(new THREE.Quaternion()).invert();
      ref.quaternion.copy(worldQuat).premultiply(parentQuatInv);
    };

    const getBonePos = (bone: Bone | null) => {
      if (!bone) return new THREE.Vector3();
      const pos = new THREE.Vector3();
      bone.localToWorld(pos.set(0, 0, 0));
      groupRef.current.worldToLocal(pos);
      return pos;
    };
    // LEGS 

    leftPointsRef.current = [
      getBonePos(leftUpLegBoneRef.current),
      getBonePos(leftLegBoneRef.current),
      getBonePos(leftFootBoneRef.current),
    ];

    rightPointsRef.current = [
      getBonePos(rightUpLegBoneRef.current),
      getBonePos(rightLegBoneRef.current),
      getBonePos(rightFootBoneRef.current),
    ];

    // WEAPONS 
    attachToBone(rightHandBoneRef.current, weaponRef.current);
    attachToBone(leftHandBoneRef.current, shieldRef.current);
    // HEAD 
    attachToBone(headBoneRef.current, helmetRef.current);
    // GLOVES 
    attachToBone(leftHandBoneRef.current, glovesLeftRef.current);

    attachToBone(rightHandBoneRef.current, glovesRightRef.current);
    attachToBone(leftShoulderBoneRef.current, shouldersLeftRef.current);
    attachToBone(rightShoulderBoneRef.current, shouldersRightRef.current);
    attachToBone(spineBoneRef.current, chestRef.current);
    attachToBone(hipsBoneRef.current, legsRef.current);
    attachToBone(leftFootBoneRef.current, bootsLeftRef.current);
    attachToBone(rightFootBoneRef.current, bootsRightRef.current);
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <pointLight position={[0, 2, 0]} intensity={10} castShadow />
      <NameTag text={name} />

      {/* Personaje animado */}
      <primitive object={clonedScene} ref={avatarRef} />

      {/* Equipamiento */}
      {equipment.weapon?.Model && <equipment.weapon.Model ref={weaponRef} />}
      {equipment.shield?.Model && <equipment.shield.Model ref={shieldRef} />}
      {equipment.helmet?.Model && <equipment.helmet.Model ref={helmetRef} />}

      {equipment.boots?.Model && (
        <>
          <equipment.boots.Model ref={bootsLeftRef} />
          <equipment.boots.Model ref={bootsRightRef} />
        </>
      )}

      {equipment.gloves?.Model && (
        <>
          <equipment.gloves.Model ref={glovesLeftRef} />
          <equipment.gloves.Model ref={glovesRightRef} />
        </>
      )}

      {equipment.shoulders?.Model && (
        <>
          <equipment.shoulders.Model ref={shouldersLeftRef} />
          <equipment.shoulders.Model ref={shouldersRightRef} />
        </>
      )}

      {equipment.chest?.Model && <equipment.chest.Model ref={chestRef} />}

      {equipment.legs?.Model && (
        <equipment.legs.Model
          ref={legsRef}
          leftPoints={leftPointsRef.current}
          rightPoints={rightPointsRef.current}
        />
      )}
    </group>
  );
}

useGLTF.preload("/BasicCharacter3.glb");
