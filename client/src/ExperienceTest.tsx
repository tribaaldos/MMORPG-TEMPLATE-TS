import './App.css'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three/webgpu'
import { extend } from '@react-three/fiber'
import MainUI from './UI/MainUI'
import { Bvh, CameraControls, KeyboardControls, Loader, OrbitControls, OrthographicCamera, useGLTF, View } from '@react-three/drei'
import { button, folder, Leva, useControls } from 'leva'
import { useCharacterStore } from './store/useCharacterStore'
import Lights from './components/lights/Lights'
import DebugStatsPanel from './UI/debug/DebugStats'
import { PostProcessing } from './VFXEngine/Effects'
import { useState, useEffect, useRef } from 'react'

import World1 from './worlds/StartWorld'
import PhysicsWorld from './worlds/PhysicsWorld/PhysicsWorld'
import { SocketManager } from './socket/SocketManager'
import BasicCharacter from './old/newCharacter/BasicCharacter'
import TestSkeleton from './old/newCharacter/TestSkeleton'
import LegsRigged from './character/newCharacter/LegsRigged'
import NewCharacterUI from './character/newCharacter/CharacterUI'
import StepAudio from './sounds/Walk'
import EnvironmentSound from './sounds/EnvironmentSound'
import EmojiCursor from './components/npc/EmojiCursor'
import IccDungeon from './worlds/dungeons/IccDungeon'
import { Physics } from '@react-three/rapier'
import KinematicCollider from './character/noPhysicsCharacter/extra/KinematicCollider'
import BVHController, { BVHEcctrlApi } from './character/noPhysicsCharacter/BVHController'
import AnimatedCharacterModel from './character/noPhysicsCharacter/CharacterModel'
import { useEcctrlStore } from './character/noPhysicsCharacter/extra/useEcctrlStore'
import StaticCollider from './character/noPhysicsCharacter/extra/StaticCollider'
import RemoteBVHCharacters from './character/noPhysicsCharacter/extra/remoteBVHCharacter'
import NewCharacter from './character/newCharacter/Character'
import GrassBlock from './components/environmentModels/GrassBlock'
import { PerfTracker } from './debug/Performance'
import FullBVH from './character/noPhysicsCharacter/FullBVH'
import { useTargetStore } from './store/useTargetStore'
import ProjectilesLayer from '../../old-backup/oldprojectiles-backup/ProjectilesLayer'
import { IceSkillRenderer } from './character/skills/ProjectileSkill'
import DragonDungeon from './worlds/dungeons/DragonDungeon'
import Inventory from './UI/components/inventory/Inventory'
import RemoteCharactersBVH from './character/noPhysicsCharacter/extra/remoteBVHCharacter'

export default function ExperienceTest() {



    return (
        <>


            {/* <MainUI /> */}
            <Inventory />
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


                    <FullBVH />
                    <RemoteCharactersBVH />
                    <ambientLight intensity={2} />
                    <StaticCollider>
                        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} >

                            <planeGeometry args={[100, 100]} />
                            <meshStandardMaterial color="green" />
                        </mesh>
                    </StaticCollider>

                </Canvas>
                {/* <div className="canvas"> */}

                {/* </div> */}
            </KeyboardControls>

        </>
    )
}

