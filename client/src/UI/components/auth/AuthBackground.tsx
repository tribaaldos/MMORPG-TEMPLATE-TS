import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three/webgpu'
import { extend } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState } from 'react'
import { WebGPURenderer } from 'three/webgpu'
import SkyShader from '../../../components/shaders/sky/SkyShader'
import GrassBlock from '../../../components/environmentModels/GrassBlock'
import { TreeMainPlace } from '../../../components/environmentModels/trees/TreeMainPlace'

function RotatingCamera() {
    const { camera } = useThree()
    const angle = useRef(Math.PI * 0.25)

    useFrame((_, delta) => {
        angle.current += delta * 0.05
        const r = 18
        camera.position.set(
            Math.sin(angle.current) * r,
            3.5,
            Math.cos(angle.current) * r
        )
        camera.lookAt(0, 6, 0)
    })

    return null
}

function Scene() {
    return (
        <>
            <ambientLight intensity={1.8} color="#a8d4f5" />
            <directionalLight position={[10, 20, 10]} intensity={1.5} color="#fff5e0" />

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                <planeGeometry args={[500, 500]} />
                <meshStandardMaterial color="#0e3a0e" />
            </mesh>

            <GrassBlock position={[0, 0, 0]} isDebug={true} />
            <TreeMainPlace range={150} count={25} />
            <SkyShader />

            <fog attach="fog" args={['#87ceeb', 40, 200]} />
        </>
    )
}

export default function AuthBackground() {
    const [webgpuReady, setWebgpuReady] = useState<boolean | null>(null)

    useEffect(() => {
        let cancelled = false
        const check = async () => {
            if (!navigator.gpu) { if (!cancelled) setWebgpuReady(false); return }
            try {
                const adapter = await navigator.gpu.requestAdapter()
                if (!cancelled) setWebgpuReady(!!adapter)
            } catch {
                if (!cancelled) setWebgpuReady(false)
            }
        }
        check()
        return () => { cancelled = true }
    }, [])

    if (!webgpuReady) return null

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
            <Canvas
                camera={{ fov: 65, position: [16, 5, 0] }}
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
                    return renderer
                }}
                frameloop="always"
            >
                <Suspense fallback={null}>
                    <RotatingCamera />
                    <Scene />
                </Suspense>
            </Canvas>
        </div>
    )
}
