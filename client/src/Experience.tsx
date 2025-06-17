
import './App.css'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three/webgpu'
import { extend } from '@react-three/fiber'
import MainUI from './UI/MainUI'
import CharacterController from './character/CharacterController'
import { Gltf, KeyboardControls, OrbitControls, Sky } from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import { Leva, useControls } from 'leva'
import Floor from './components/Floor'
import { SocketManager } from './socket/SocketManager'
// import { TestShader, VFXBasicInstanced } from './VFXEngine/TestShader'
import { PostProcessing } from './VFXEngine/Effects'
import AllTestBlocks from './components/testblocks/AllTestBlocks'
import Lights from './components/lights/Lights'
import { useEffect, useRef, useState } from 'react'
import WaterShader from './components/shaders/greenPortal/GreenPortalShader'
import MagmaShader from './components/shaders/magma/MagmaShader'
import GrassField from './components/shaders/grass/Grass'
import DebugStatsPanel from './UI/debug/DebugStats'
import { useCharacterStore } from './store/Character'
export default function Experience() {

    const physicsSettings = useControls('Physics', {
        enabled: { value: true, label: 'Enable Physics' },
        debug: { value: false, label: 'Debug Mode' },
        gravity: {
            value: [0, -9.81, 0],
            label: 'Gravity',
            step: 0.1
        },
        timestep: { value: 1 / 60, min: 1 / 120, max: 1 / 30, step: 0.001, label: 'Timestep' },
    })

    const playerPosition = useCharacterStore((s) => s.position);

    return (
        <>

            <Leva collapsed />
            <SocketManager />
            <KeyboardControls
                map={[
                    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
                    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
                    { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
                    { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
                    { name: 'jump', keys: ['Space'] },
                ]}
            >
                <MainUI />
                <Canvas
                    className='canvas'
                    shadows
                    camera={{ fov: 75, position: [0, 4, 5] }}
                    gl={(props) => {
                        extend(THREE as any)
                        // @ts-ignore
                        const renderer = new THREE.WebGPURenderer(props)
                        return renderer.init().then(() => renderer)
                    }}>
                    {/* <Effects />  */}
                    <Physics
                        gravity={physicsSettings.gravity}
                        debug={physicsSettings.debug}
                        timeStep="vary"
                        updateLoop="follow"
                        paused={!physicsSettings.enabled}
                        interpolate={true}
                    >
                        {/* <RigidBody colliders="ball">
                        <MagmaShader />
                    </RigidBody> */}
                        <CharacterController />
                        <Floor />

                        <AllTestBlocks />
                    </Physics>
                    {/* <GrassField /> */}
                    <Lights />
                    <DebugStatsPanel />

                        <Gltf position={playerPosition} src="/sky-green.glb" />
                    {/* <PostProcessing /> */}
                    <OrbitControls />
                </Canvas>
            </KeyboardControls >
        </>
    )
}

