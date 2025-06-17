import React, { useMemo } from 'react';
import GrassOnSphere from './GrassOnSphere';
import { useCharacterStore } from '../../../store/Character';

export default function InfiniteGrassGrid() {
  const tileSize = 20; // ya está definido en tu tile
  const gridRadius = 2; // 5x5 (de -2 a 2)
  const playerPosition = useCharacterStore((state) => state.position); // asumiendo que tienes esto

  const visibleTiles = useMemo(() => {
    const tiles: [number, number][] = [];
    const centerX = Math.round(playerPosition[0] / tileSize);
    const centerZ = Math.round(playerPosition[2] / tileSize);

    for (let x = -gridRadius; x <= gridRadius; x++) {
      for (let z = -gridRadius; z <= gridRadius; z++) {
        tiles.push([(centerX + x) * tileSize, (centerZ + z) * tileSize]);
      }
    }
    return tiles;
  }, [playerPosition]);
  

  return (
    <>
      {visibleTiles.map(([x, z], index) => (
        <group key={index} position={[x, 0, z]}>
          <GrassOnSphere />
        </group>
      ))}
    </>
  );
}
