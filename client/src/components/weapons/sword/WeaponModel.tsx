// WeaponModel.tsx
import { useGLTF } from "@react-three/drei";
import * as React from "react";
import * as THREE from "three";

interface WeaponModelProps {
  ref?: React.Ref<THREE.Group>; // ✅ aceptar ref
}

const WeaponModel = React.forwardRef<THREE.Group, WeaponModelProps>((props, ref) => {
  const { scene } = useGLTF('/items/weapons/sword.glb');

  return (
    <group
      ref={ref}
      position={[0.1, -0.7, 0]}  
      rotation={[Math.PI * 1.2, Math.PI / 2, 0]}
      scale={0.75}
      {...props}
    >
      {/* Blade */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.1, 1, 0.05]} />
        <meshStandardMaterial color="silver" emissive="blue" />
      </mesh>
      {/* Handle */}
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5]} />
        <meshStandardMaterial color="brown" />
      </mesh>
      {/* Guard */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.25, 0.05, 0.05]} />
        <meshStandardMaterial color="gold" />
      </mesh>
    </group>
  );
});

export default WeaponModel;
useGLTF.preload('/weapons/sword.glb');
