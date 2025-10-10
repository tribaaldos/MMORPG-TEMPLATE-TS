// ProjectilesLayer.tsx — Lógica minimal + shaders encapsulados (Ice + Explosion)
import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'

// TSL básico
import 'three/webgpu'
import { color, uniform, positionLocal } from 'three/tsl'
import { Trail } from '@react-three/drei'


type ProjectileIceProps = {

}

type ProjectileIceExplosionProps = {

}

/** Esfera con shader TSL simple para la “explosión” fija (sin animación) */
export const ProjectileIceExplosion: React.FC<ProjectileIceExplosionProps> = ({

}) => {
  const shaderNodes = useMemo(() => {
    
    return {
      positionNode: positionLocal,
      colorNode: uniform(color('blue')),
      // emissiveNode: uniform(color('blue')),
    }
  }, [])

  const materialKey = useMemo(() => Date.now(), [shaderNodes])
  return (
    <>
    <group>
        <Trail />
    <mesh  frustumCulled={false}>
      <sphereGeometry args={[1, 12, 12]} />
      {/* @ts-ignore NodeMaterial (TSL) */}
      <meshPhysicalNodeMaterial {...shaderNodes} key={materialKey} metalness={0} roughness={1} />
    </mesh>
    </group>
    </>
  )
}
