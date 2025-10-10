// ProjectilesLayer.tsx — Lógica minimal + shaders encapsulados (Ice + Explosion)
import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'

// TSL básico
import 'three/webgpu'
import { color, uniform, positionLocal } from 'three/tsl'


type ProjectileFireProps = {

}

export const FireProjectile = React.forwardRef<THREE.Mesh, ProjectileFireProps>(
  ({  }, ref) => {
    const shaderNodes = useMemo(() => {
      return {
        positionNode: positionLocal,
        colorNode: uniform(color('red')),
        // emissiveNode: uniform(color('red')),
      }
    }, [])

    // cambia la key si quieres forzar recompilación cuando cambien nodos
    const materialKey = useMemo(() => Date.now(), [shaderNodes])

    return (
      <mesh ref={ref}  frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        {/* @ts-ignore NodeMaterial (TSL) */}
        <meshPhysicalNodeMaterial {...shaderNodes} key={materialKey} metalness={0} roughness={1} />
      </mesh>
    )
  }
)
FireProjectile.displayName = 'ProjectileFire'
