import * as THREE from 'three';
import { useMemo } from 'react';

interface GridProps {
  size?: number;
  divisions?: number;
  color?: THREE.ColorRepresentation;
  position?: [number, number, number];
}

export default function CustomGrid({
  size = 100,
  divisions = 100,
  color = '#444',
  position = [0, 0.01, 0],
}: GridProps) {
  const lines = useMemo(() => {
    const vertices = [];

    const halfSize = size / 2;
    const step = size / divisions;

    for (let i = -halfSize; i <= halfSize; i += step) {
      // Líneas en Z
      vertices.push(-halfSize, 0, i, halfSize, 0, i);
      // Líneas en X
      vertices.push(i, 0, -halfSize, i, 0, halfSize);
    }

    return new THREE.BufferGeometry().setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    );
  }, [size, divisions]);

  return (
    <lineSegments
    
      geometry={lines}
      position={position}
    >
      <lineBasicMaterial color={color} toneMapped={false} />
    </lineSegments>
  );
}
