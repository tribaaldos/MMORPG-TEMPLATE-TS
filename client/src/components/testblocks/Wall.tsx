import { RigidBody } from "@react-three/rapier"
import Test1 from "../Test1"
import Pared from "../Pared"

interface WallProps {
    position: [number, number, number]
    args: [number, number, number]
}

export default function WallNumberOne({ position, args} : WallProps) {
    return (
        <>
        <RigidBody type="fixed" userData={{ camBlocker: true, floor: true}}>
            <mesh position={position}>
                <boxGeometry args={args} />
                <meshStandardMaterial color="green" />
            </mesh>
        </RigidBody>
        </>
    )
}