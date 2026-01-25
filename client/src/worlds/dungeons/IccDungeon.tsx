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
import { useEffect, useMemo } from "react"
import { Wolf } from "./monsters/Wolf"

import { Dragon } from "./monsters/Dragon"
import Dummy from "./monsters/DummyTest"
import { WolfLocal } from "./monsters/WolfLocal"
import { ProjectileIce } from "../../character/skills/iceSkill/ProjectileIce"
import { MeshStandardNodeMaterial } from "three/webgpu"
import { color, mix } from "three/tsl"
import FireWeapon from "../../items/weapons/FireWeapon"
export default function IccDungeon({ onTeleport }: {
    // physicsSettings: any,
    // setEmoji: (emoji: string) => void,
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
    function PlayGround(props: any) {
        const { scene } = useGLTF('/dungeons/Playground.glb');
        // const { scene, nodes, materials } = useGLTF('/dungeons/arena.glb');

        return (
            <primitive object={scene} scale={1} position={[0, 0, 0]} />
            // <group {...props} dispose={null} scale={50} position={[0, 5, 0]}>
            //     <mesh
            //         castShadow
            //         receiveShadow
            //         geometry={(nodes.material as THREE.Mesh).geometry}
            //         material={materials['Material.001']}
            //         rotation={[Math.PI / 2, 0, 0]}
            //     >
            //         {/* <meshStandardMaterial color="gray" /> */}
            //     </mesh>
            // </group>
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
            <pointLight position={[18, -1, -7]} intensity={100} color="red" scale={20} />
            <StaticCollider>
                <PlayGround />

            </StaticCollider>
            {/* <ProjectileIce /> */}
            <ambientLight intensity={1} />
            <fog attach="fog" args={['lightblue', 30, 250]} />
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
