import React from 'react';

interface HelmetProps {
  color?: string;
}

const HelmetModel: React.FC<HelmetProps> = ({ color = '#777777', ...props }) => {
  return (
    <group {...props} dispose={null} scale={0.8}>
      {/* Casco principal (calota redondeada) */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.6, 0.1, 0.6]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
      </mesh>

    </group>
  );
};

export default HelmetModel;
