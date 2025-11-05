import { Plane } from "@react-three/drei";
import StaticCollider from "../character/noPhysicsCharacter/extra/StaticCollider";
import ShaderVisualizer3D from "../debug/ShaderVisualizer3D";

export default function WorldShaderVisualizer() {

    return (
        <>
            <StaticCollider >
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[100, 100]} />
                    <meshStandardMaterial color='blue' />
                </mesh>
            </StaticCollider>
            <ShaderVisualizer3D position={[0, 2., 0]}/>
            <ambientLight intensity={1} />
      
        </>
    )
}