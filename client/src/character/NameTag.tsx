
import React, { useRef, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type NameTagProps = {
    text: string;
    position?: [number, number, number];
    scale?: number;
    variant?: 'name' | 'chat';
};
// --- NameTag ---
function NameTag({ text = "Hola", position = [0, 0, 0], scale = 1, variant = 'name' }: NameTagProps) {
    const { camera } = useThree();
    const meshRef = useRef<THREE.Mesh>(null!);

    const canvas = useMemo(() => {
        const c = document.createElement('canvas');
        const ctx = c.getContext('2d')!;
        const isChat = variant === 'chat';
        c.width = isChat ? 384 : 256;
        c.height = isChat ? 96 : 64;

        const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number) => {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + w, y, x + w, y + h, r);
            ctx.arcTo(x + w, y + h, x, y + h, r);
            ctx.arcTo(x, y + h, x, y, r);
            ctx.arcTo(x, y, x + w, y, r);
            ctx.closePath();
        };

        ctx.clearRect(0, 0, c.width, c.height);
        if (isChat) {
            ctx.fillStyle = 'rgba(10, 8, 6, 0.75)';
            drawRoundedRect(6, 6, c.width - 12, c.height - 12, 10);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 212, 130, 0.35)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.fillStyle = isChat ? '#f0e3c2' : 'white';
        ctx.font = isChat ? '36px serif' : '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const maxWidth = c.width - (isChat ? 24 : 16);
        const words = text.split(' ');
        const lines: string[] = [];
        let line = '';
        for (const word of words) {
            const testLine = line ? `${line} ${word}` : word;
            if (ctx.measureText(testLine).width > maxWidth && line) {
                lines.push(line);
                line = word;
            } else {
                line = testLine;
            }
        }
        if (line) lines.push(line);

        const maxLines = isChat ? 2 : 1;
        const renderLines = lines.slice(0, maxLines);
        const lineHeight = isChat ? 24 : 26;
        const startY = c.height / 2 - ((renderLines.length - 1) * lineHeight) / 2;

        renderLines.forEach((l, i) => {
            ctx.fillText(l, c.width / 2, startY + i * lineHeight);
        });
        return c;
    }, [text, variant]);

    const texture = useMemo(() => new THREE.CanvasTexture(canvas), [canvas]);

    useFrame(() => {
        if (meshRef.current) meshRef.current.lookAt(camera.position);
    });

    const planeHeight = variant === 'chat' ? 0.6 : 0.4;
    const planeWidth = (canvas.width / canvas.height) * planeHeight;

    return (
        <mesh position={position} ref={meshRef} scale={scale}>
            <planeGeometry args={[planeWidth, planeHeight]} />
            <meshBasicMaterial map={texture} transparent />
        </mesh>
    );
}

export default NameTag;