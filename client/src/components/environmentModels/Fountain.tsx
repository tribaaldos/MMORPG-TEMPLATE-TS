
import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three';
import WaterShader from '../shaders/greenPortal/GreenPortalShader';


export default function Fountain(props: any) {
    const { nodes, materials } = useGLTF('/environment/fountain.glb');
    return (
        <group position={[0, 0, 20]} {...props} dispose={null} rotation={nodes.Circle.rotation}>
            <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
                {/* <pointLight position={[0, 5, 0]} intensity={40} /> */}
                <WaterShader geometry={(nodes.water as THREE.Mesh).geometry}
                    scaleProp={1}
                    numero={0.56}
                    timed={0.17}
                    glows={10}
                    clampMin={0.11}
                    clampMax={0.42000000000000004}
                    colorA="#00ffff"
                    colorB="#002244"
                    patternScale={0.12999999999999994}

                />
            </group>
            <mesh position={(nodes.Circle as THREE.Mesh).position} castShadow receiveShadow geometry={(nodes.Circle as THREE.Mesh).geometry} material={materials.Rock} />
            <mesh castShadow receiveShadow geometry={(nodes.water as THREE.Mesh).geometry} material={materials.water} />
        </group>
    );
}

useGLTF.preload('/environment/fountain.glb')
