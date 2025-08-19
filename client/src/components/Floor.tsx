import * as THREE from 'three';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useRef, useState, useEffect } from 'react';
import { useCharacterStore } from '../store/useCharacterStore';
const TILE_SIZE = 100;
const getTileKey = (x: number, z: number) => `${x},${z}`;

interface Tile {
  key: string;
  position: [number, number, number];
}

export default function InfiniteFloorTiles() {
  const [tiles, setTiles] = useState<Map<string, Tile>>(new Map());
  const currentTile = useRef({ x: 0, z: 0 });
  const characterPos = useCharacterStore((s) => s.position);

  // Inicialización
  useEffect(() => {
    updateTiles(currentTile.current);
  }, []);

  useFrame(() => {
    const x = Math.floor(characterPos[0] / TILE_SIZE);
    const z = Math.floor(characterPos[2] / TILE_SIZE);

    if (x !== currentTile.current.x || z !== currentTile.current.z) {
      currentTile.current = { x, z };
      updateTiles({ x, z });
    }
  });

  const updateTiles = (center: { x: number; z: number }) => {
    const updated = new Map(tiles); // copiar los existentes

    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const x = center.x + dx;
        const z = center.z + dz;
        const key = getTileKey(x, z);

        if (!updated.has(key)) {
          updated.set(key, {
            key,
            position: [x * TILE_SIZE, 0, z * TILE_SIZE],
          });
        }
      }
    }

    setTiles(updated);
  };

  return (
    <>
      {[...tiles.values()].map((tile) => (
        <RigidBody
          type="fixed"
          key={tile.key}
          colliders="trimesh"
          userData={{ camBlocker: false, floor: true }}
        >
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={tile.position}
            receiveShadow
          >
            <planeGeometry args={[TILE_SIZE, TILE_SIZE, 1, 1]} />
            <meshStandardMaterial color="green" side={THREE.DoubleSide} />
          </mesh>
        </RigidBody>
      ))}
    </>
  );
}