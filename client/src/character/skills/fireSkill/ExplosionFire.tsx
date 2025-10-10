
import React, { useMemo } from 'react'
import * as THREE from 'three'
import { positionLocal, color, uniform } from 'three/tsl'
type FireExplosionProps = {

}

/** Esfera con shader TSL simple para la “explosión” fija (sin animación) */
export const FireExplosion: React.FC<FireExplosionProps> = ({

}) => {
    const shaderNodes = useMemo(() => {

        return {
            positionNode: positionLocal,
            colorNode: uniform(color('red')),
            emissiveNode: uniform(color('red')),
        }
    }, [])

    const materialKey = useMemo(() => Date.now(), [shaderNodes])
    return (
        <mesh frustumCulled={false}>
            <sphereGeometry args={[1, 12, 12]} />
            {/* @ts-ignore NodeMaterial (TSL) */}
            <meshPhysicalNodeMaterial {...shaderNodes} key={materialKey} metalness={0} roughness={1} />
        </mesh>
    )
}