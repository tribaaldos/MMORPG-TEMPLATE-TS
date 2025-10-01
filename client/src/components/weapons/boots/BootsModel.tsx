import React from "react";
import * as THREE from "three";

interface BootsR3FProps {
  leftHeelRef?: React.Ref<THREE.Group>;
  leftToeRef?: React.Ref<THREE.Group>;
  rightHeelRef?: React.Ref<THREE.Group>;
  rightToeRef?: React.Ref<THREE.Group>;
  scale?: number;
  position?: [number, number, number];
}

const BootsModel: React.FC<BootsR3FProps> = ({
  leftHeelRef,
  leftToeRef,
  rightHeelRef,
  rightToeRef,
  scale = 1,
  ...props
}) => {
  const material = new THREE.MeshStandardMaterial({ color: "#555555" });

  return (
    <group {...props} scale={scale}>
      {/* Bota izquierda */}
      <group position={[0, 0, 0]}>
        {/* Resto de la bota */}
        {/* <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
          <boxGeometry args={[0.2, 0.4, 0.3]} />
          <meshStandardMaterial color="#555555" />
        </mesh> */}
        {/* Talón */}
        <group ref={leftHeelRef} position={[0, -0.1, -0.1]}>
          {/* <mesh castShadow receiveShadow>
            <boxGeometry args={[0.2, 0.1, 0.1]} />
            <meshStandardMaterial color="#333333" />
          </mesh> */}
        </group>
        {/* Puntera */}
        <group ref={leftToeRef} position={[0, -0.1, 0.15]}>
          {/* <mesh castShadow receiveShadow>
            <boxGeometry args={[0.2, 0.1, 0.1]} />
            <meshStandardMaterial color="#333333" />
          </mesh> */}
        </group>
      </group>

    
    </group>
  );
};

export default BootsModel;
