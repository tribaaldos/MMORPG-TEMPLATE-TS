import { useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
import { RigidBody } from '@react-three/rapier'
import { useCharacterStore } from '../store/useCharacterStore'
import { GridShader } from '../components/CustomGrid'
import StaticCollider from '../character/noPhysicsCharacter/extra/StaticCollider'
const TILE_SIZE = 100
const getTileKey = (x: number, z: number) => `${x},${z}`

interface Tile {
  key: string
  position: [number, number, number]
}

export default function InfiniteGridTiles() {
  const [tiles, setTiles] = useState<Map<string, Tile>>(new Map())
  const currentTile = useRef({ x: 0, z: 0 })
  const characterPos = useCharacterStore((s) => s.position)

  // Inicialización
  useEffect(() => {
    updateTiles(currentTile.current)
  }, [])

  useFrame(() => {
    const x = Math.floor(characterPos[0] / TILE_SIZE)
    const z = Math.floor(characterPos[2] / TILE_SIZE)

    if (x !== currentTile.current.x || z !== currentTile.current.z) {
      currentTile.current = { x, z }
      updateTiles({ x, z })
    }
  })

  const updateTiles = (center: { x: number; z: number }) => {
    const updated = new Map(tiles)

    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const x = center.x + dx
        const z = center.z + dz
        const key = getTileKey(x, z)

        if (!updated.has(key)) {
          updated.set(key, {
            key,
            position: [x * TILE_SIZE, 0, z * TILE_SIZE],
          })
        }
      }
    }

    setTiles(updated)
  }

  return (
    <>
      {[...tiles.values()].map((tile) => (
        // <RigidBody
        //   type="fixed"
        //   key={tile.key}
        //   colliders="trimesh"
        //   userData={{ camBlocker: false, floor: true }}
        // >
        <StaticCollider key={tile.key}>

          <group position={tile.position}>
            {/* <GridShader />  */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
              <planeGeometry args={[1000, 1000]} />
              <meshStandardMaterial color="rgb(5, 46, 5)" />
            </mesh>
          </group>
        </StaticCollider>
        // </RigidBody>
      ))}
    </>
  )
}
