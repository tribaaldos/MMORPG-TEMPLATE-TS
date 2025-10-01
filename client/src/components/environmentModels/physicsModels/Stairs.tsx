import { RigidBody } from "@react-three/rapier";
import { GridMaterial } from "../../shaders/useMaterials/GridMaterial";
import { useGLTF } from "@react-three/drei";
import * as THREE from 'three';
export default function Stairs() {

    interface StairsProps {
        position?: [number, number, number];
    }

    function Stairs({ position = [0, 0, 0] }: StairsProps) {
        const { scene } = useGLTF('/environment/stairs.glb');
        return (
            // <mesh position={position} receiveShadow castShadow>
            //     <boxGeometry args={[3, 0.3, 0.6]} />
            //     <meshStandardMaterial color="red" />
            // </mesh>
            <primitive object={scene} position={position} />
        )
    }

    function Plane () {
        const { scene: piramid } = useGLTF('/environment/pyramid.glb');
        return ( 
            <primitive object={piramid} />
        )
    }
    return (
        <>  
        <RigidBody type="fixed" colliders="trimesh" userData={{ floor: true }}>
            <Plane />
        </RigidBody>
            🚈
            <RigidBody type="fixed" colliders="hull" userData={{ floor: true }}>
                {/* <Plane /> */}
                <Stairs />
                {/* <Stairs position={[0, 0, 0]} />
                <Stairs position={[0.0, 0.3, 0.6]} />
                <Stairs position={[0.0, 0.6, 1.2]} />
                <Stairs position={[0.0, 0.9, 1.8]} />
                <Stairs position={[0.0, 1.2, 2.4]} />
                <Stairs position={[0.0, 1.5, 3.0]} /> */}
            </RigidBody>
        </>
    )
}
