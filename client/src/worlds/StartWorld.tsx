import { Physics, RigidBody, vec3 } from '@react-three/rapier'
import { useCharacterStore } from '../store/useCharacterStore'
import TeleportZone from '../components/testblocks/Teleport'
import { GridShader } from '../components/CustomGrid'
import ShaderVisualizer3D from '../debug/ShaderVisualizer3D'
import { Gltf, OrbitControls, useGLTF } from '@react-three/drei'
import Floor from '../leva/Floor'
import { folder, Leva, useControls } from 'leva'

import Shop from '../components/npc/Shop'
import GrassBlock from '../components/environmentModels/GrassBlock'
import GrassField from '../components/environmentModels/GrassField'
import { InfiniteTiles } from '../components/environmentModels/InfiniteTiles'
import * as THREE from 'three'
import { Model } from '../components/environmentModels/Cofre'
import Fountain from '../components/environmentModels/Fountain'
import KShop from '../components/npc/Shop'
import FullBVH from '../character/noPhysicsCharacter/FullBVH'
import RemoteBVHCharacters from '../character/noPhysicsCharacter/extra/remoteBVHCharacter'
import { useEffect } from 'react'
import { TreeMainPlace } from '../components/environmentModels/trees/TreeMainPlace'
import WaterShader from '../components/shaders/water/WaterShader'
export default function World1({ onTeleport, isDebug }: {
    // physicsSettings: any,
    // setEmoji: (emoji: string) => void,
    onTeleport: (worldId: string, targetPos?: [number, number, number]) => void
    isDebug?: boolean
}) {
    const playerPosition = useCharacterStore((s) => s.position)
    const physicsSettings1 = useControls({
        'Starter-World1': folder({
            enabled: { value: true },
            debug: { value: false },
            gravity: { value: [0, -9.81, 0], step: 0.1 },
        }, { collapsed: true })
    },
        { collapsed: true });
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
    // function LordMarrowgar() {
    //     const { scene } = useGLTF('/dungeons/icc.glb');
    //     const { scene: scenePhysics } = useGLTF('/dungeons/iccPhysics.glb');
    //     return (
    //         <>
    //             <primitive object={scene} />

    //             <RigidBody type="fixed" colliders="trimesh" userData={{ floor: true }}>
    //                 <primitive object={scenePhysics} position={[0, -1, 0]} />
    //             </RigidBody>
    //         </>
    //     )
    // }
    useEffect(() => {
        console.log("Mount world1")
        return () => console.log("Unmount world1")
    }, [])
    function MainPlace () {
        const { scene } = useGLTF('/environment/Mainplacewater.glb');

        return ( 
            <>
            <WaterShader geometry="circle" position={[0, 0.1, 0]} scaleProp={3.5} />
            <primitive object={scene} />
            </>
        )
    }

    return (
        // minimized leva
        <>

            <ambientLight intensity={5} />
            <Floor />
            <Fountain />
            {!isDebug && (
                <GrassBlock position={[0, 0, 0]} />


            )}
            <MainPlace />
            <TreeMainPlace range={250} count={isDebug ? 3 : 30} />
            {/* <ShaderVisualizer3D position={[0, 5, 0]} /> */}
            <TeleportZone
                rotation={[0, 0, 0]}
                position={[0, 0, -5]}
                radius={2}
                scale={3}
                targetWorld="dragonDungeon"
                colorNode="red"             
                target={[5, 2, 0]}
                onTeleport={onTeleport}
                label={"Dragon Dungeon"}
                labelOffset={[0, 2.2, 0]}
            />
            <TeleportZone
                rotation={[0, -1.3, 0]}
                position={[6, 0, 0]}
                radius={2}
                scale={3}
                targetWorld="dungeon"
                colorNode="blue"
                target={[0, 2, 0]}
                onTeleport={onTeleport}
                label={"ICC Dungeon"}
                labelOffset={[0, 2.2, 0]}
            />
            <TeleportZone
                position={[-6, 0, 0]}
                rotation={[0, 1.3, 0]}
                radius={2}
                scale={3}
                targetWorld="ShaderVisualizer"
                colorNode="blue"
                target={[0, 2, 0]}
                onTeleport={onTeleport}
                label={"Shader Visualizer"}
                labelOffset={[0, 2.2, 0]}
            />

            <Model position={[3, 0, 5]} />
            {/* <KShop setEmoji={setEmoji} /> */}
            <KShop />
            <Sky />

            <fog attach="fog" args={['lightblue', 15, 200]} />

        </>
    )
}
