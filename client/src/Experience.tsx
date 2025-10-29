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
import { SocketManager } from './socket/SocketManager'
import IccDungeon from './worlds/dungeons/IccDungeon'

import StaticCollider from './character/noPhysicsCharacter/extra/StaticCollider'
import { PerfTracker } from './debug/Performance'
import FullBVH from './character/noPhysicsCharacter/FullBVH'
import { useTargetStore } from './store/useTargetStore'
import DragonDungeon from './worlds/dungeons/DragonDungeon'
import RemoteCharactersBVH from './character/noPhysicsCharacter/extra/remoteBVHCharacter'
import ProjectilesLayer from './character/skills/ProjectileSkill'
import { PostProcessing } from './VFXEngine/Effects'
import MobileFullscreenGuard from './UI/OrientationLock'

export default function Experience() {


    const setPlayerPosition = useCharacterStore((s) => s.setPosition)


    const worldControl = useControls({
        World: {
            options: { World1: 'world1', Dungeon: 'dungeon', DragonDungeon: 'dragonDungeon' },
            value: 'dungeon',
            onChange: (value) => {
                setCurrentWorld(value)
                useCharacterStore.getState().setWorld(value);
                // setPlayerPosition([0, 1, 0]) // reset position on world change
            }
        },
    })
    const [currentWorld, setCurrentWorld] = useState<any>('dungeon');
    const [playerTargetPos, setPlayerTargetPos] = useState<[number, number, number] | null>(null)

    // Función que se pasa al TeleportZone
    const handleTeleport = (worldId: any, targetPos?: [number, number, number]) => {
        setCurrentWorld(worldId)
        useCharacterStore.getState().setWorld(worldId);
        if (targetPos) setPlayerTargetPos(targetPos)
    }

    // controls leva to change world 

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

    // type set emoji

    const [emoji, setEmoji] = useState<any>("😀")
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
            <MobileFullscreenGuard />
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
                    <PostProcessing />
                    {/* <FireBallProjectile /> */}
                    {/* <IceProjectile /> */}
                    <ProjectilesLayer />
                    <FullBVH />
                    <RemoteCharactersBVH />
                    <PerfTracker />
                    {currentWorld === 'world1' && (
                        <World1
                            key="world1"
                            onTeleport={handleTeleport}
                            // @ts-ignore

                            setEmoji={setEmoji}
                        />
                    )}
                    {currentWorld === 'dungeon' && (
                        <IccDungeon
                            key="dungeon"
                            onTeleport={handleTeleport}
                            // @ts-ignore

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

