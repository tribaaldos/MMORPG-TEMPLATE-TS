import { useThree, useFrame } from '@react-three/fiber'
import React, { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

export function InfiniteTiles({
  tileSize = 6,      // lado de TU patch
  grid = 5,          // impar: 3,5,7...
  centered = true,   // true si tu patch está centrado en (0,0) y ocupa [-size/2,+size/2]
  children,
}: {
  tileSize?: number
  grid?: number
  centered?: boolean
  children: React.ReactNode
}) {
  const { camera } = useThree()
  const groupRef = useRef<THREE.Group>(null)

  const half = Math.floor((grid - 1) / 2)
  const [center, setCenter] = useState<{ ix: number; iz: number }>({ ix: 0, iz: 0 })
  const tmp = useRef(new THREE.Vector3()).current

  useFrame(() => {
    // 1) posición de cámara en mundo
    camera.getWorldPosition(tmp)
    // 2) pásala al espacio local del grid
    if (groupRef.current) {
      groupRef.current.worldToLocal(tmp)
    }
    // 3) índice de tile según anclaje
    const f = centered
      ? (v: number) => Math.round(v / tileSize)      // tiles centrados -> round
      : (v: number) => Math.floor(v / tileSize)      // tiles desde esquina -> floor

    const ix = f(tmp.x)
    const iz = f(tmp.z)

    if (ix !== center.ix || iz !== center.iz) {
      setCenter({ ix, iz })
    }
  })

  const tiles = useMemo(() => {
    const arr: JSX.Element[] = []
    for (let dz = -half; dz <= half; dz++) {
      for (let dx = -half; dx <= half; dx++) {
        const x = (center.ix + dx) * tileSize
        const z = (center.iz + dz) * tileSize
        arr.push(
          <group key={`${center.ix + dx},${center.iz + dz}`} position={[x, 0, z]}>
            {children}
          </group>
        )
      }
    }
    return arr
  }, [center, half, tileSize, children])

  return <group ref={groupRef}>{tiles}</group>
}
