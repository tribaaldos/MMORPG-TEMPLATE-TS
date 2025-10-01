import { useEffect, useMemo, useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { BonesList } from "../../character/bonesList";

export default function BonesDebugger() {
  const { scene } = useGLTF("/BasicCharacter3.glb");
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const [boneRefs, setBoneRefs] = useState<THREE.Bone[]>([]);
  const [hoveredBone, setHoveredBone] = useState<{ name: string; pos: THREE.Vector3 } | null>(null);

  useEffect(() => {
    let skinned: THREE.SkinnedMesh | null = null;

    clonedScene.traverse((child) => {
      if ((child as THREE.SkinnedMesh).isSkinnedMesh) skinned = child as THREE.SkinnedMesh;
    });

    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0x888888,
          transparent: true,
          opacity: 0.5,
        });
      }
    });

    if (!skinned) return;

    // const excluded = ["Thumb", "Index", "Middle", "Ring", "Pinky"];
    const excluded = ['none']
    const bones: THREE.Bone[] = [];

    BonesList.forEach((name) => {
      if (excluded.some((word) => name.includes(word))) return;
      const bone = skinned!.skeleton.bones.find((b) => b.name === name);
      if (bone) bones.push(bone);
    });

    setBoneRefs(bones);
  }, [clonedScene]);

  return (
    <group>
      <primitive object={clonedScene} visible={true} />

      {boneRefs.map((bone, i) => (
        <BonePoint
          key={i}
          bone={bone}
          onHover={(name, pos) => setHoveredBone({ name, pos })}
          onUnhover={() => setHoveredBone(null)}
        />
      ))}

      {hoveredBone && (
        <Html
          position={[hoveredBone.pos.x, hoveredBone.pos.y + 0.05, hoveredBone.pos.z]}
          center
          style={{
            background: "rgba(0,0,0,0.7)",
            padding: "2px 5px",
            borderRadius: "4px",
            color: "white",
            fontSize: "12px",
            pointerEvents: "none",
          }}
        >
          {hoveredBone.name}
        </Html>
      )}
    </group>
  );
}

function BonePoint({
  bone,
  onHover,
  onUnhover,
}: {
  bone: THREE.Bone;
  onHover: (name: string, pos: THREE.Vector3) => void;
  onUnhover: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (meshRef.current && bone) {
      const pos = new THREE.Vector3();
      bone.getWorldPosition(pos);
      meshRef.current.position.copy(pos);
    }
  });

  return (
    <mesh
      ref={meshRef}
      scale={0.03}
      onPointerOver={(e) => {
        e.stopPropagation();
        const pos = new THREE.Vector3();
        bone.getWorldPosition(pos);
        onHover(bone.name, pos);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onUnhover();
      }}
    >
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial emissive={"red"} color={"red"} />
    </mesh>
  );
}

useGLTF.preload("/BasicCharacter3.glb");
