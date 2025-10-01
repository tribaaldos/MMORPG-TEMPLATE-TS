import { Physics, RigidBody } from "@react-three/rapier"
import { useCharacterStore } from "../../store/useCharacterStore"
import TeleportZone from "../../components/testblocks/Teleport"
import ShaderVisualizer3D from "../../debug/ShaderVisualizer3D"
import { GridShader } from "../../components/CustomGrid"
// import CharacterController from '../../character/newCharacter/CharacterController'
import { Gltf, Grid } from "@react-three/drei"
import { useControls } from "leva"
import Stairs from "../../components/environmentModels/physicsModels/Stairs"
import StaticCollider from "../../character/noPhysicsCharacter/extra/StaticCollider"

export default function PhysicsWorld({ onTeleport }: { 
    physicsSettings: any, 
    onTeleport: (worldId: string, targetPos?: [number, number, number]) => void 
}) {
    
    const playerPosition = useCharacterStore((s) => s.position)

    const physicsSettings = useControls('Physics-World2', {
        enabled: { value: true },
        debug: { value: false },
        gravity: { value: [0, -9.81, 0], step: 0.1 },
    })
    
    return (
        <>
         <Physics
            gravity={physicsSettings.gravity}
            debug={physicsSettings.debug}
            timeStep="vary"
            updateLoop="follow"
            paused={!physicsSettings.enabled}
            interpolate={true}
        >
        {/* <StaticCollider>
            <mesh rotation={[-Math.PI / 2, 0, 0]} >
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="lightblue" />
            </mesh>
        </StaticCollider> */}
        <ambientLight intensity={0.5} />
            {/* <CharacterController /> */}
            <Stairs />
            {/* <RemoteCharacters /> */}
            {/* Portal de vuelta a Mundo1 con posición de llegada */}
            <TeleportZone
                position={[-5, 0, -10]}
                radius={2}
                targetWorld="world1"
                target={[0, 1, 0]} // posición en world1
                onTeleport={onTeleport}
                />
            <RigidBody type="fixed" restitution={0.2} friction={1} userData={{ floor: true}}>
            <GridShader color1="#ffffff" scale={72} color2="#6f6f6f" />
            </RigidBody>
            {/* Suelo y elementos del mundo */}


            <Gltf position={playerPosition} src="/sky-green.glb" />
         </Physics>
                </>
    )
}
