import { useMemo } from 'react'
import { useGLTF, Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'



export function Rocks2({ count = 50 }) {
    const { nodes, materials } = useGLTF('/environment/rocks.glb')

    // Genera posiciones aleatorias una sola vez
    const positions = useMemo<[number, number, number][]>(() => {
        const arr: [number, number, number][] = []
        for (let i = 0; i < count; i++) {
            const x = THREE.MathUtils.randFloatSpread(100)  // entre -50 y 50
            const z = THREE.MathUtils.randFloatSpread(100)
            const y = 0  // todos al nivel del suelo
            arr.push([x, y, z])
        }
        return arr
    }, [count])

    // create random color 
    


    return (
        <Instances
            limit={count}
            geometry={(nodes.Rock_1__Rock_1__0 as THREE.Mesh).geometry}
            material={materials.Rock_1}
            castShadow
            receiveShadow
        >
            {positions.map((pos, i) => (
                <Instance
                    key={i}
                    position={pos}
                    rotation={[-Math.PI / 2, 0, -1.854]}
                    scale={[0.484, 0.484, 0.838]}
                />
            ))}
        </Instances>
    )
}

useGLTF.preload('/environment/rocks.glb')
