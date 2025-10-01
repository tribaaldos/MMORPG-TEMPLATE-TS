import { folder, useControls } from "leva"
import { useCharacterStore } from "../../store/useCharacterStore"
import { Gltf, useGLTF } from "@react-three/drei"
import * as THREE from 'three'
import { Physics, RigidBody } from "@react-three/rapier"
import CharacterController from '../../character/newCharacter/CharacterController'
import Floor from '../../leva/Floor'
import GrassBlock from "../../components/environmentModels/GrassBlock"
import TeleportZone from "../../components/testblocks/Teleport"
import FullBVH from "../../character/noPhysicsCharacter/FullBVH"
import RemoteBVHCharacters from "../../character/noPhysicsCharacter/extra/remoteBVHCharacter"
import StaticCollider from "../../character/noPhysicsCharacter/extra/StaticCollider"
import { PerfTracker } from "../../debug/Performance"
import { useEffect } from "react"
import { Wolf } from "./monsters/Wolf"
import Monster from "./monsters/MonstruoTest"
import { Spider } from "./monsters/Spider"
import SpiderLocal from "./monsters/SpiderLocal"
import { WolfLocal } from "./monsters/WolfLocal"
import { Dragon } from "./monsters/Dragon"
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


    // const PlayGround = () => {
    //     const { scene } = useGLTF('/dungeons/Playground.glb');
    //     const EcctrlMapDebugSettings = useControls("Map Debug", {
    //         MapDebug: false,
    //         ActiveKinematicCollider: true,
    //         Map: folder({
    //             visible: true,
    //             excludeFloatHit: false,
    //             excludeCollisionCheck: false,
    //             friction: { value: 0.8, min: 0, max: 1, step: 0.01 },
    //             restitution: { value: 0.05, min: 0, max: 1, step: 0.01 },
    //         }, { collapsed: true }),
    //     });
    //     return (
    //         <StaticCollider
    //             debug={EcctrlMapDebugSettings.MapDebug} {...EcctrlMapDebugSettings}
    //         >

    //             <primitive object={scene} />
    //         </StaticCollider>
    //     )
    // }
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
        // minimized leva
        <>
            {/* <Physics
                gravity={physicsSettings1.gravity}
                debug={physicsSettings1.debug}
            timeStep="vary"
            updateLoop="follow"
            interpolate={true}
            > */}
            {/* <RemoteCharacters /> */}
            {/* <CharacterController /> */}
            {/* <LordMarrowgar /> */}
            {/* <FullBVH />
            <RemoteBVHCharacters /> */}
            <Wolf position={[2, 0, 0]} />
            <Dragon position={[0, 0, 0]} nameId="Nibsy" />
            {/* <Dragon position={[3, 0, 0]} nameId="Dragon 2 " /> */}
            {/* <Spider position={[0, 0, 0]} /> */}
            {/* <SpiderLocal
                position={[0, 0, 0]}
                target={[0, 0, 7]}
                attackRange={2}
                attackInterval={3}               // segundos entre ataques
            /> */}
            {/* <WolfLocal /> */}

            <StaticCollider>
                <PlayGround />
            </StaticCollider>
            {/* <StaticCollider>
                <mesh rotation={[-Math.PI / 2, 0, 0]} >
                    <planeGeometry args={[100, 100]} />
                    <meshStandardMaterial color="lightblue" />
                </mesh>
            </StaticCollider> */}
            {/* <GrassBlock position={[0, 0, 0]} /> */}
            {/* <mesh position={[0, 0.9, 0]}>
                <boxGeometry args={[1, 1.8, 1]} />
                <meshStandardMaterial color="orange" />
            </mesh> */}
            <ambientLight intensity={0.7} />
            <fog attach="fog" args={['lightblue', 15, 75]} />
            {/* <FireBoltRenderer /> */}
            {/* <TestController /> */}
            {/* <Floor /> */}
            {/* <GrassBlock position={[0, 0, 0]} /> */}
            <TeleportZone
                position={[10, 0, 0]}
                radius={2}
                targetWorld="world1"
                color="black"
                target={[100, 100, 0]} // posición en world2
                onTeleport={onTeleport}
            />
            {/*
            <TeleportZone
                position={[15, 0, 0]}
                radius={2}
                color="blue"
                targetWorld="dungeon"
                target={[10, 200, 0]} // posición en world2
                onTeleport={onTeleport}
            /> */}
            {/* <BonesDebugger /> */}
            <Sky />
            {/* <fog attach="fog" args={['lightblue', 15, 75]} /> */}
            {/* <CharacterUI animation="jumpTest" name="porke aki si" position={[3, 0, 0]} /> */}
            {/* </Physics> */}
        </>
    )
}
