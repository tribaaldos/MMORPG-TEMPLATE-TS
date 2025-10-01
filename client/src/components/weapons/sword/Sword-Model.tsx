import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export default function SwordTest(props: any) {
  const { nodes } = useGLTF('/items/weapons/sword1.glb')
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow

        geometry={(nodes.Cube001 as THREE.Mesh).geometry}
        material={(nodes.Cube001O as THREE.Mesh).material}
        position={[0, 0, 0]}
        scale={[0.702, 1.709, 0.702]}
      />
    </group>
  )
}

useGLTF.preload('/sword1.glb')
