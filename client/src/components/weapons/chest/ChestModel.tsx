import React from 'react';

interface ChestProps {
    color?: string;
}

const ChestModel: React.FC<ChestProps> = ({ color = '#777777', ...props }) => {
    return (
        <group {...props} dispose={null} scale={0.8}>
            {/* Main chest plate */}
            <mesh>
                <boxGeometry args={[0.5, 0.5, 0.5 ]} />
                <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
            </mesh>
        </group>
    );
};

export default ChestModel;
