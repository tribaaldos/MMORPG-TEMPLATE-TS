import './App.css'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three/webgpu'
import { extend } from '@react-three/fiber'
import MainUI from './UI/MainUI'
import { KeyboardControls, Loader, useGLTF } from '@react-three/drei'
import { folder, Leva, useControls } from 'leva'
import { useCharacterStore } from './store/useCharacterStore'
import { useState, useEffect, useRef, Suspense } from 'react'
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
import WorldShaderVisualizer from './worlds/WorldShaderVisualizer'
import { WebGPURenderer } from 'three/webgpu'
import WorldLoadingOverlay from './UI/WorldLoadingOverlay'
import { useSavePosition } from './hooks/useSavePosition'
import { useSaveGold } from './hooks/useSaveGold'
import { useSaveEquipment } from './hooks/useSaveEquipment'
import { useAuthStore } from './store/useAuthStore'
import { socket } from './socket/SocketManager'
export default function Experience() {
    useSavePosition()
    useSaveGold()

    const [socketId, setSocketId] = useState(() => socket.id ?? '')
    useEffect(() => {
        const onConnect = () => setSocketId(socket.id!)
        socket.on('connect', onConnect)
        return () => { socket.off('connect', onConnect) }
    }, [])
    useSaveEquipment(socketId)

    const setPlayerPosition = useCharacterStore((s) => s.setPosition)


    const worldControl = useControls({
        World: {
            options: { World1: 'world1', Dungeon: 'dungeon', DragonDungeon: 'dragonDungeon', ShaderVisualizer: 'Shadervisualizer' },
            value: 'world1',
            onChange: (value) => {
                setCurrentWorld(value)
                useCharacterStore.getState().setWorld(value);
                // setPlayerPosition([0, 1, 0]) // reset position on world change
            }
        },
    })
    const { startPos, startWorld } = useAuthStore.getState()
    const [currentWorld, setCurrentWorld] = useState<any>(startWorld || 'world1');
    const [playerTargetPos, setPlayerTargetPos] = useState<[number, number, number] | null>(startPos || null)
    const [loadingWorld, setLoadingWorld] = useState(false);
    const allowedWorlds = useRef(new Set(['world1', 'dungeon', 'dragonDungeon', 'Shadervisualizer']));

    // Función que se pasa al TeleportZone
    const handleTeleport = (worldId: any, targetPos?: [number, number, number]) => {
        if (!allowedWorlds.current.has(worldId)) return;
        setLoadingWorld(true);
        setTimeout(() => {
            setCurrentWorld(worldId);
            useCharacterStore.getState().setWorld(worldId);
            if (targetPos) {
                const [x, y, z] = targetPos;
                setPlayerTargetPos([x, Math.max(y, 2), z]);
            }
            setLoadingWorld(false);
        }, 100); // Small delay to trigger loader
    }

    // controls leva to change world 

    // Actualiza la posición del jugador cuando cambia de mundo
    useEffect(() => {
        if (!playerTargetPos) return;
        const t = window.setTimeout(() => {
            setPlayerPosition(playerTargetPos)
            setPlayerTargetPos(null)
        }, 100);
        return () => window.clearTimeout(t);
    }, [playerTargetPos, setPlayerPosition])


    const [frameloop, setFrameloop] = useState("never");
    const [webgpuReady, setWebgpuReady] = useState<boolean | null>(null);


    extend({
        MeshBasicNodeMaterial: THREE.MeshBasicNodeMaterial,
        MeshStandardNodeMaterial: THREE.MeshStandardNodeMaterial,
    });

    // type set emoji

    // const [emoji, setEmoji] = useState<any>("😀")
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


    useEffect(() => {
        let cancelled = false;
        const checkWebGPU = async () => {
            if (!navigator.gpu) {
                if (!cancelled) setWebgpuReady(false);
                return;
            }
            try {
                const adapter = await navigator.gpu.requestAdapter();
                if (!cancelled) setWebgpuReady(!!adapter);
            } catch (err) {
                if (!cancelled) setWebgpuReady(false);
            }
        };
        checkWebGPU();
        return () => { cancelled = true; };
    }, []);

    const isDebug : boolean = true;

    return (
        <>
            {/* <div style={{ position: 'absolute', left: 2000, top: 50, zIndex: 1000 }}>
            </div> */}
            {/* <StepAudio /> */}
            {/* <EnvironmentSound /> */}
            {/* <Inventory /> */}
            {/* <EmojiCursor emoji={emoji} /> */}
            <Leva collapsed hidden={isDebug ? false : true} />
            <MobileFullscreenGuard />
            <MainUI isDebug={isDebug} />
            <SocketManager />
            <WorldLoadingOverlay forceVisible={loadingWorld} />
            {webgpuReady === false && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    background: 'rgba(0,0,0,0.85)',
                    color: '#f0e3c2',
                    fontFamily: 'Cinzel, Georgia, serif',
                    textAlign: 'center',
                    padding: 24,
                }}>
                    <div>
                        <div style={{ fontSize: 20, marginBottom: 8 }}>WebGPU no disponible</div>
                        <div style={{ fontSize: 14, opacity: 0.85 }}>
                            Este juego requiere WebGPU. Activa WebGPU o usa un navegador compatible.
                        </div>
                    </div>
                </div>
            )}
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
                {webgpuReady && (
                    <Canvas
                        className="canvas"
                        shadows
                        camera={{ fov: 75, position: [0, 4, 5] }}
                        gl={async (props) => {
                            extend(THREE as any)
                            // @ts-ignore
                            const renderer = new WebGPURenderer({
                                ...props,
                                powerPreference: 'low-power',
                                antialias: true,
                                alpha: false,
                                stencil: false,
                            })
                            await renderer.init()
                            console.log('✅ Usando WebGPURenderer')
                            return renderer
                        }}
                        onPointerMissed={() => useTargetStore.getState().setSelectedTarget(null)}
                    >
                        {/* <PostProcessing /> */}
                        {/* <FireBallProjectile /> */}
                        {/* <IceProjectile /> */}
                        <ProjectilesLayer />
                        <FullBVH />
                        <RemoteCharactersBVH />
                        <PerfTracker />
                        <Suspense fallback={null}>
                            {currentWorld === 'world1' && (
                                <World1
                                    isDebug={isDebug}
                                    key="world1"
                                    onTeleport={handleTeleport}
                                // @ts-ignore

                                // setEmoji={setEmoji}
                                />

                            )}
                            {currentWorld === 'dungeon' && (
                                <IccDungeon
                                    key="dungeon"
                                    onTeleport={handleTeleport}
                                // @ts-ignore

                                // setEmoji={setEmoji}
                                />
                            )}

                            {currentWorld === 'ShaderVisualizer' && (
                                <WorldShaderVisualizer key='ShaderVisualizer' />
                            )}

                            {currentWorld === 'dragonDungeon' && (
                                <DragonDungeon
                                    key="dragonDungeon"
                                    onTeleport={handleTeleport}
                                // setEmoji={setEmoji}
                                />
                            )}
                        </Suspense>


                    </Canvas>
                )}

            </KeyboardControls>

        </>
    )
}

