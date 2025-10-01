
import React, { useRef, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type NameTagProps = {
    text: string;
    position?: [number, number, number];
    scale?: number;
};
// --- NameTag ---
function NameTag({ text = "Hola", position = [0, 0, 0], scale = 1 }: NameTagProps) {
    const { camera } = useThree();
    const meshRef = useRef<THREE.Mesh>(null!);

    const canvas = useMemo(() => {
        const c = document.createElement('canvas');
        const ctx = c.getContext('2d')!;
        c.width = 256;
        c.height = 64;
        ctx.fillStyle = 'transparent';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.fillStyle = 'white';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(text, c.width / 2, 40);
        return c;
    }, [text]);

    const texture = useMemo(() => new THREE.CanvasTexture(canvas), [canvas]);

    useFrame(() => {
        if (meshRef.current) meshRef.current.lookAt(camera.position);
    });

    return (
        <mesh position={position} ref={meshRef} scale={scale}>
            <planeGeometry args={[1.5, 0.4]} />
            <meshBasicMaterial map={texture} transparent />
        </mesh>
    );
}

export default NameTag;