import React from 'react';


interface ShieldProps {
    color?: string;
}

const ShieldModel: React.FC<ShieldProps> = ({ color = '#888888', ...props }) => {
    return (
        <group {...props} dispose={null} scale={1}>
            {/* Cuerpo principal del escudo (forma ovalada) */}
            <mesh position={[0, 0.15, 0]}>
                <cylinderGeometry args={[0.18, 0.22, 0.04, 32]} />
                <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
            </mesh>
            {/* Borde del escudo */}
            <mesh position={[0, 0.15, 0]}>
                <torusGeometry args={[0.2, 0.015, 16, 100]} />
                <meshStandardMaterial color="#444" metalness={0.7} roughness={0.2} />
            </mesh>
            {/* Agarre del escudo */}
            <mesh position={[0, 0.15, -0.025]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.025, 0.025, 0.12, 16]} />
                <meshStandardMaterial color="#a0522d" metalness={0.3} roughness={0.7} />
            </mesh>
        </group>
    );
};

export { ShieldModel };