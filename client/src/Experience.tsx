import './App.css'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three/webgpu'
import { extend } from '@react-three/fiber'
import MainUI from './UI/MainUI'
import { KeyboardControls, Loader, useGLTF } from '@react-three/drei'
import { folder, Leva, useControls } from 'leva'
import { useCharacterStore } from './store/useCharacterStore'
import { useState, useEffect, useRef } from 'react'
import World1 from './worlds/StartWorld'
import PhysicsWorld from './worlds/PhysicsWorld/PhysicsWorld'
import { SocketManager } from './socket/SocketManager'
import IccDungeon from './worlds/dungeons/IccDungeon'

import StaticCollider from './character/noPhysicsCharacter/extra/StaticCollider'
import RemoteBVHCharacters from './character/noPhysicsCharacter/extra/remoteBVHCharacter'
import GrassBlock from './components/environmentModels/GrassBlock'
import { PerfTracker } from './debug/Performance'
import FullBVH from './character/noPhysicsCharacter/FullBVH'
import { useTargetStore } from './store/useTargetStore'
import ProjectilesLayer from './character/skills/ProjectilesLayer'
import { IceSkillRenderer } from './character/skills/iceSkill/IceSkill'
import DragonDungeon from './worlds/dungeons/DragonDungeon'
import Inventory from './UI/components/inventory/Inventory'
import RemoteCharactersBVH from './character/noPhysicsCharacter/extra/remoteBVHCharacter'

export default function Experience() {


    const setPlayerPosition = useCharacterStore((s) => s.setPosition)

    const [currentWorld, setCurrentWorld] = useState<'world1' | 'world2' | 'dungeon' | 'dragonDungeon'>('dragonDungeon')
    const [playerTargetPos, setPlayerTargetPos] = useState<[number, number, number] | null>(null)

    // Función que se pasa al TeleportZone
    const handleTeleport = (worldId: 'world1' | 'world2' | 'dungeon' | 'dragonDungeon', targetPos?: [number, number, number]) => {
        setCurrentWorld(worldId)
        useCharacterStore.getState().setWorld(worldId);
        if (targetPos) setPlayerTargetPos(targetPos)
    }

    // Actualiza la posición del jugador cuando cambia de mundo
    useEffect(() => {
        if (playerTargetPos) {
            setPlayerPosition(playerTargetPos)
            setPlayerTargetPos(null)
        }
    }, [playerTargetPos, setPlayerPosition])


    const [frameloop, setFrameloop] = useState("never");

    extend({
        MeshBasicNodeMaterial: THREE.MeshBasicNodeMaterial,
        MeshStandardNodeMaterial: THREE.MeshStandardNodeMaterial,
    });

    const [emoji, setEmoji] = useState("😀")
    const PlayGround = () => {
        const { scene } = useGLTF('/dungeons/Playground.glb');
        const EcctrlMapDebugSettings = useControls("Map Debug", {
            MapDebug: false,
            ActiveKinematicCollider: true,
            Map: folder({
                visible: true,
                excludeFloatHit: false,
                excludeCollisionCheck: false,
                friction: { value: 0.8, min: 0, max: 1, step: 0.01 },
                restitution: { value: 0.05, min: 0, max: 1, step: 0.01 },
            }, { collapsed: true }),
        });
        return (
            <StaticCollider
                debug={EcctrlMapDebugSettings.MapDebug} {...EcctrlMapDebugSettings}
            >

                <primitive object={scene} />
            </StaticCollider>
        )
    }

  
    return (
        <>
            {/* <div style={{ position: 'absolute', left: 2000, top: 50, zIndex: 1000 }}>
            </div> */}
            {/* <StepAudio /> */}
            {/* <EnvironmentSound /> */}
            {/* <Inventory /> */}
            {/* <EmojiCursor emoji={emoji} /> */}
            <Leva collapsed />
            
            <MainUI />
            <SocketManager />
            <KeyboardControls
                map={[
                    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
                    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
                    { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
                    { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
                    { name: 'jump', keys: ['Space'] },
                    { name: 'run', keys: ['Shift'] },
                    { name: 'Key1', keys: ['1'] },
                    { name: 'Key2', keys: ['2'] },
                    { name: 'Key3', keys: ['3'] },
                    { name: 'Key4', keys: ['4'] },
                ]}

            >
                {/* <Loader /> */}
                <Canvas
                    // style={{ cursor: 'none' }}
                    className='canvas'
                    shadows
                    // high performance
                    camera={{ fov: 75, position: [0, 4, 5] }}
                    // frameloop='demand'
                    gl={(props) => {
                        extend(THREE as any)
                        // @ts-ignore                        
                        const renderer = new THREE.WebGPURenderer({
                            ...props,
                            powerPreference: "high-performance",
                            antialias: true,
                            alpha: false,
                            stencil: false,
                        })
                        return renderer.init().then(() => renderer)
                    }}
                    onPointerMissed={() => useTargetStore.getState().setSelectedTarget(null)}
                >

                    <ProjectilesLayer />
                    <IceSkillRenderer />
                    <FullBVH />
                    <RemoteCharactersBVH />
                    {/* <PerfTracker /> */}
                    {currentWorld === 'world1' && (
                        <World1
                            key="world1"
                            onTeleport={handleTeleport}
                            setEmoji={setEmoji}
                        />
                    )}
                    {currentWorld === 'dungeon' && (
                        <IccDungeon
                            key="dungeon"
                            onTeleport={handleTeleport}
                            setEmoji={setEmoji}
                        />
                    )}

                    {currentWorld === 'dragonDungeon' && (
                        <DragonDungeon
                            key="dragonDungeon"
                            onTeleport={handleTeleport}
                            setEmoji={setEmoji}
                        />
                    )}
   

                </Canvas>
  
            </KeyboardControls>

        </>
    )
}

