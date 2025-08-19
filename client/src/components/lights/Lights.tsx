import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCharacterStore } from '../../store/useCharacterStore'

export default function FollowDirectionalLight() {
  const lightRef = useRef<THREE.DirectionalLight>(null!)
  const targetRef = useRef<THREE.Object3D>(new THREE.Object3D())

  const position = useCharacterStore((state) => state.position) // [x, y, z]

  useEffect(() => {
    if (lightRef.current) {
      lightRef.current.target = targetRef.current
    }
  }, [])

  useFrame(() => {
    if (lightRef.current && targetRef.current && position) {
      lightRef.current.position.set(position[0] + 10, position[1] + 20, position[2] + 10)
      targetRef.current.position.set(position[0], position[1], position[2])
    }
  })

  return (
    <>
      {/* <directionalLight
        ref={lightRef}
        castShadow
        intensity={0.2}
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-near={1}
        shadow-camera-far={100}
        shadow-bias={-0.0001}
      />
      <primitive object={targetRef.current} />
      <pointLight intensity={100} position={[0, 10, 0]} /> */}
      <ambientLight intensity={1.0} />
    </>
  )
}