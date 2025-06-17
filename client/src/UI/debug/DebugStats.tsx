import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect, useState } from 'react';

export default function DebugStatsPanel() {
  const { gl } = useThree();
  const meshRef = useRef<THREE.Mesh>(null!);
  const canvas = useRef(document.createElement('canvas'));
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const texture = useRef(new THREE.CanvasTexture(canvas.current));
  const [fps, setFps] = useState(0);
  const lastTime = useRef(performance.now());
  const frames = useRef(0);

  useEffect(() => {
    canvas.current.width = 512;
    canvas.current.height = 256;
    context.current = canvas.current.getContext('2d');
    texture.current.minFilter = THREE.LinearFilter;
    texture.current.magFilter = THREE.LinearFilter;
    texture.current.needsUpdate = true;
  }, []);

  useFrame(() => {
    const now = performance.now();
    frames.current++;
    if (now - lastTime.current >= 1000) {
      setFps(frames.current);
      frames.current = 0;
      lastTime.current = now;
    }

    const info = gl.info;
    const ctx = context.current;
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.current.width, canvas.current.height);

    ctx.fillStyle = 'lime';
    ctx.font = '20px monospace';
    ctx.textBaseline = 'top';

    const lines = [
      `FPS: ${fps}`,
      `Triangles: ${info.render.triangles}`,
      `Draw Calls: ${info.render.calls}`,
      `Geometries: ${info.memory.geometries}`,
      `Textures: ${info.memory.textures}`,
      `Programs: ${info.programs?.length ?? 'N/A'}`,
    ];

    lines.forEach((line, i) => {
      ctx.fillText(line, 10, 10 + i * 28);
    });

    texture.current.needsUpdate = true;
    gl.info.autoReset = true;
  });

  return (
    <mesh ref={meshRef} position={[-2, 2, 0]}>
      <planeGeometry args={[2.5, 1.25]} />
      <meshBasicMaterial map={texture.current} transparent side={THREE.DoubleSide}/>
    </mesh>
  );
}