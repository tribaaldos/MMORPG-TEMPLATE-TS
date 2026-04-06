import { useRef, useMemo, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MonsterPlateProps {
  name: string;
  level?: number;
  hp: number;
  maxHp: number;
  position?: [number, number, number];
  scale?: number;
}

const WIDTH = 256;
const HEIGHT = 48;

function drawPlate(canvas: HTMLCanvasElement, name: string, level: number | undefined, hp: number, maxHp: number) {
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Background plate
  ctx.fillStyle = 'rgba(8, 6, 4, 0.7)';
  roundRect(ctx, 2, 2, WIDTH - 4, HEIGHT - 4, 8);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 212, 130, 0.3)';
  ctx.lineWidth = 1;
  roundRect(ctx, 2, 2, WIDTH - 4, HEIGHT - 4, 8);
  ctx.stroke();

  // Name + level text
  const label = level != null ? `${name}  Lv.${level}` : name;
  ctx.fillStyle = '#f0e3c2';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, WIDTH / 2, 16);

  // HP bar background
  const barX = 16;
  const barY = 30;
  const barW = WIDTH - 32;
  const barH = 10;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  roundRect(ctx, barX, barY, barW, barH, 4);
  ctx.fill();

  // HP bar fill
  const ratio = Math.max(0, Math.min(1, hp / maxHp));
  const fillW = barW * ratio;

  if (fillW > 0) {
    const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    grad.addColorStop(0, '#22c55e');
    grad.addColorStop(0.5, '#eab308');
    grad.addColorStop(1, '#ef4444');
    ctx.fillStyle = grad;
    roundRect(ctx, barX, barY, fillW, barH, 4);
    ctx.fill();
  }

  // HP text
  ctx.fillStyle = '#ffffff';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${Math.ceil(hp)} / ${maxHp}`, WIDTH / 2, barY + barH / 2 + 1);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export default function MonsterPlate({ name, level, hp, maxHp, position = [0, 0, 0], scale = 1 }: MonsterPlateProps) {
  const { camera } = useThree();
  const meshRef = useRef<THREE.Mesh>(null!);

  const canvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = WIDTH;
    c.height = HEIGHT;
    drawPlate(c, name, level, hp, maxHp);
    return c;
  }, []);

  const texture = useMemo(() => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }, [canvas]);

  // Redraw when hp changes
  useEffect(() => {
    drawPlate(canvas, name, level, hp, maxHp);
    texture.needsUpdate = true;
  }, [hp, maxHp, name, level, canvas, texture]);

  useFrame(() => {
    if (meshRef.current) meshRef.current.lookAt(camera.position);
  });

  const planeHeight = 0.3;
  const planeWidth = (WIDTH / HEIGHT) * planeHeight;

  return (
    <mesh position={position} ref={meshRef} scale={scale}>
      <planeGeometry args={[planeWidth, planeHeight]} />
      <meshBasicMaterial map={texture} transparent depthTest={false} />
    </mesh>
  );
}
