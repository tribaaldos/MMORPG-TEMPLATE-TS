import { Physics, RigidBody } from '@react-three/rapier'
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
export default function World1({ onTeleport }: {
    // physicsSettings: any,
    // setEmoji: (emoji: string) => void,
    onTeleport: (worldId: string, targetPos?: [number, number, number]) => void
}) {
    const playerPosition = useCharacterStore((s) => s.position)
    const physicsSettings1 = useControls({
        'Starter-World1': folder({
            enabled: { value: true },
            debug: { value: false },
            gravity: { value: [0, -9.81, 0], step: 0.1 },
        }, {collapsed: true})
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
    function LordMarrowgar() {
        const { scene } = useGLTF('/dungeons/icc.glb');
        const { scene: scenePhysics } = useGLTF('/dungeons/iccPhysics.glb');
        return (
            <>
                <primitive object={scene} />

                <RigidBody type="fixed" colliders="trimesh" userData={{ floor: true }}>
                    <primitive object={scenePhysics} position={[0, -1, 0]} />
                </RigidBody>
            </>
        )
    }
    useEffect(() => {
        console.log("Mount world1")
        return () => console.log("Unmount world1")
    }, [])


    return (
        // minimized leva
        <>

            <ambientLight intensity={0.4} />
            <Floor />
            <Fountain />
            <GrassBlock position={[0, -1, 0]} />
            <ShaderVisualizer3D />
            <TeleportZone
                position={[10, 0, 0]}
                radius={2}
                targetWorld="world2"
                color="gray"
                target={[5, 5, 0]} // posición en world2
                onTeleport={onTeleport}
            />
            <TeleportZone
                position={[15, 0, 0]}
                radius={2}
                targetWorld="dungeon"
                color="blue"
                target={[0, 10, 0]} // posición en world2
                onTeleport={onTeleport}
            />
            <Model position={[3, 0, 5]} />
            {/* <KShop setEmoji={setEmoji} /> */}
            <KShop />
            <Sky />
            
            <fog attach="fog" args={['lightblue', 15, 200]} />
           
        </>
    )
}
