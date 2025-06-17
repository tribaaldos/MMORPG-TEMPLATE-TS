import { useMemo } from 'react'
import { useGLTF, Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'

export function Tree1({ count = 50 }) {
  const { nodes, materials } = useGLTF('/environment/treee.glb')

  // Genera posiciones aleatorias una sola vez
  const positions = useMemo<[number, number, number][]>(() => {
    const arr: [number, number, number][] = [] = []
    for (let i = 0; i < count; i++) {
      const x = THREE.MathUtils.randFloatSpread(100)  // entre -50 y 50
      const z = THREE.MathUtils.randFloatSpread(100)
      const y = -0.2  // todos al nivel del suelo
      arr.push([x, y, z])
    }
    return arr
  }, [count])

  return (
    <Instances
      limit={count}
      geometry={(nodes._6_tree__6_tree_0 as THREE.Mesh).geometry}
      material={materials['6_tree']}
      castShadow
      receiveShadow
    >
      {positions.map((pos, i) => (
        <Instance
          key={i}
          position={pos}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={0.135}
        />
      ))}
    </Instances>
  )
}

useGLTF.preload('/environment/treee.glb')
