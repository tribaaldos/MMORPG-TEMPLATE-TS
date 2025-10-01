import React from "react";

interface ShoulderPadsModelProps {
  position?: [number, number, number];
}

const ShoulderPadsModel: React.FC<ShoulderPadsModelProps> = ({ ...props }) => {
  return (
    <group {...props} scale={0.2}>
      {/* Hombro izquierdo */}
      <mesh position={[-0.6, 0, 0]}>
        <boxGeometry args={[0.8, 0.3, 1.2]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      {/* Hombro derecho */}
      <mesh position={[0.6, 0, 0]}>
        <boxGeometry args={[0.8, 0.3, 1.2]} />
        <meshStandardMaterial color="#444" />
      </mesh>
    </group>
  );
}

export default ShoulderPadsModel;
