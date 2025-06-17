import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

export default function Test1() {
    const { scene } = useGLTF('/HouseOpen.glb');
    return (
            <RigidBody
                type="fixed"
                colliders="trimesh"
                userData={{ camBlocker: true,
                    //  floor: true 
                    }}
            >
                <primitive object={scene}position={[0, -4, 2]} scale={3} />
            </RigidBody>
    );
}