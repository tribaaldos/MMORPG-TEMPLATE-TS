import { RigidBody } from "@react-three/rapier";

export default function Pared() {
    return (
        <RigidBody userData={{ camBlocker: true }} >

            <mesh position={[10, 0, 0]} >
                <boxGeometry args={[10, 10, 10]} />
                <meshStandardMaterial color="orange" />
            </mesh>
        </RigidBody>
    )
}