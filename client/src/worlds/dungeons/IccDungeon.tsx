import { folder, useControls } from "leva"
import { useCharacterStore } from "../../store/useCharacterStore"
import { Gltf, useGLTF } from "@react-three/drei"
import * as THREE from 'three'
import { Physics, RigidBody } from "@react-three/rapier"
import Floor from '../../leva/Floor'
import GrassBlock from "../../components/environmentModels/GrassBlock"
import TeleportZone from "../../components/testblocks/Teleport"
import FullBVH from "../../character/noPhysicsCharacter/FullBVH"
import RemoteBVHCharacters from "../../character/noPhysicsCharacter/extra/remoteBVHCharacter"
import StaticCollider from "../../character/noPhysicsCharacter/extra/StaticCollider"
import { useEffect } from "react"
import { Wolf } from "./monsters/Wolf"

import { Dragon } from "./monsters/Dragon"
import Dummy from "./monsters/DummyTest"
import { WolfLocal } from "./monsters/WolfLocal"
import { ProjectileIce } from "../../character/skills/iceSkill/ProjectileIce"
export default function IccDungeon({ onTeleport, setEmoji }: {
    physicsSettings: any,
    onTeleport: (worldId: string, targetPos?: [number, number, number]) => void
}) {
    const playerPosition = useCharacterStore((s) => s.position)
    const physicsSettings1 = useControls({
        'Starter-World1': folder({
            enabled: { value: true },
            debug: { value: true },
            gravity: { value: [0, -9.81, 0], step: 0.1 },
        })
    })
    const Sky = (props: any) => {
        const { nodes, materials } = useGLTF('/sky-green.glb')
        const positionPersonaje = useCharacterStore((s) => s.position);

        return (
            <group {...props} dispose={null} position={positionPersonaje}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={(nodes.Skybox as THREE.Mesh).geometry}
                    material={materials.Skybox_mat}
                    material-fog={false}
                />
            </group>
        )
    }
    function PlayGround() {
        const { scene } = useGLTF('/dungeons/Playground.glb');

        return (
            <primitive object={scene} />
        )
    }
    useEffect(() => {
        console.log("Mount Dungeon")
        return () => console.log("Unmount Dungeon")
    }, [])

    return (
        <>

            {/* <Wolf position={[2, 0, 0]} /> */}
            {/* <WolfLocal /> */}
            {/* <Dragon position={[0, 0, 0]} nameId="Nibsy" /> */}
            <Dummy />

            <StaticCollider>
                <PlayGround />
            </StaticCollider>
            <ProjectileIce />
 
            <ambientLight intensity={0.7} />
            <fog attach="fog" args={['lightblue', 15, 75]} />
            <TeleportZone
                position={[10, 0, 0]}
                radius={2}
                targetWorld="world1"
                color="black"
                target={[100, 100, 0]} // posición en world2
                onTeleport={onTeleport}
            />

            <Sky />

        </>
    )
}
