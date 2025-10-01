import React from "react";

interface GlovesModelProps {
  position?: [number, number, number];
}

const GlovesModel: React.FC<GlovesModelProps> = ({ ...props }) => {
  return (
    <group {...props} scale={0.2}>
      {/* Parte principal del guante */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 1.5, 12]} />
        <meshStandardMaterial color="#2c2c2c" />
      </mesh>
      {/* Dedos (simplificado como un bloque) */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.6, 0.5, 0.6]} />
        <meshStandardMaterial color="#1f1f1f" />
      </mesh>
      {/* Detalle de la muñeca */}
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.4, 12]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
    </group>
  );
}

export default GlovesModel;
