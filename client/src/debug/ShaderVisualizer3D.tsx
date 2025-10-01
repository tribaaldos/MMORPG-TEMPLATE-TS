import { useMemo, useState } from "react"
import { Canvas, useLoader } from "@react-three/fiber"
import { Gltf, Html, OrbitControls, Text3D, useGLTF } from "@react-three/drei"
import MagmaShader from "../components/shaders/MagmaShader"
import * as THREE from 'three/webgpu'
import { FontLoader, TextGeometry } from "three-stdlib"
import GreenPortalShader from "../components/shaders/greenPortal/GreenPortalShader"

const shaders = ["standard", "shader1", "shader2"] // lista de shaders

function DifferentShaders({ shader }: { shader: string }) {
    switch (shader) {
        case "shader1":
            return (
                <MagmaShader />
            )
        case "shader2":
            return (
                <mesh>
                    <sphereGeometry args={[0.75, 32, 32]} />
                    <meshStandardMaterial color="blue" />
                </mesh>
            )
        default:
            // objeto inicial
            return (
                <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="orange" />
                </mesh>
            )
    }
}

function ArrowButton({ direction = "up", onClick, position }: any) {
    let rotation: [number, number, number] = [0, 0, 0]
    let bodyRotation: [number, number, number] = [0, 0, 0] // rota el cilindro y cono

    switch (direction) {
        case "up":
            rotation = [0, 0, 0] // grupo sin rotar
            bodyRotation = [0, 0, 0] // cilindro apunta en Y
            break
        case "down":
            rotation = [0, 0, 0]
            bodyRotation = [Math.PI, 0, 0] // rota cilindro 180° para apuntar Y-
            break
        case "right":
            rotation = [0, 0, 0] // grupo sin rotar
            bodyRotation = [0, 0, -Math.PI / 2] // rota cilindro para apuntar X+
            break
        case "left":
            rotation = [0, 0, 0]
            bodyRotation = [0, 0, Math.PI / 2] // rota cilindro para apuntar X-
            break
        default:
            rotation = [0, 0, 0]
            bodyRotation = [0, 0, 0]
            break
    }

    return (
        <group position={position} rotation={rotation} onClick={onClick}>
            {/* cuerpo */}
            <mesh rotation={bodyRotation}>
                <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
                <meshStandardMaterial color="gray" />
            </mesh>

            {/* punta */}
            <mesh rotation={bodyRotation} position={[0, 0.6, 0]}>
                <coneGeometry args={[0.25, 0.4, 16]} />
                <meshStandardMaterial color="darkgray" />
            </mesh>
        </group>
    )
}



interface ShaderVisualizer3DProps {
    position?: [number, number, number]
}

export default function ShaderVisualizer3D({
    position = [ 0, 0 , 0]
}: ShaderVisualizer3DProps) {
    const [shaderIndex, setShaderIndex] = useState(0)

    const nextShader = () => {
        setShaderIndex((shaderIndex + 1) % shaders.length)
    }


    function Model(props: any) {
        const { nodes, materials } = useGLTF('/shader-base-visualizer.glb')
        return (
            <group {...props} dispose={null}>
                <mesh
                    // castShadow
                    // receiveShadow
                    geometry={(nodes.base as THREE.Mesh).geometry}
                    material={materials['Material.001']}
                    scale={[2.268, 0.271, 2.268]}
                />
                <mesh
                    // castShadow
                    // receiveShadow
                    geometry={(nodes.aro as THREE.Mesh).geometry}
                    material={materials['Material.002']}
                    scale={[2.268, 0.271, 2.268]}
                />
                <mesh
                    // castShadow
                    // receiveShadow
                    geometry={(nodes.todo as THREE.Mesh).geometry}
                    material={materials['Material.001']}
                    scale={[2.268, 0.271, 2.268]}
                />
            </group>
        )
    }

    useGLTF.preload('/shader-base-visualizer.glb')
    function TextMesh() {
        const font = useLoader(FontLoader, '/fonts/roboto.json')

        const geom = useMemo(() => {
            const geometry = new TextGeometry('¡Hola WebGPU!', {
                font,
                size: 0.8,
                height: 0.25,
                curveSegments: 0.0001,
                bevelEnabled: true,
                bevelThickness: 0,
                bevelSize: 0.02,
                bevelOffset: 0,
            })
            geometry.center()
            return geometry
        }, [font])

        return (
            <mesh geometry={geom} position={[5, 0, 0]}>
                <meshStandardMaterial metalness={0.2} roughness={0.4} />
            </mesh>
        )
    }

    return (

        <group position={position}>
            {/* <TextMesh /> */}
            <ArrowButton
                direction="left"
                position={[-2, -1, 0]}
                onClick={nextShader}
            />
            <ArrowButton
                direction="right"
                position={[2, -1, 0]}
                onClick={nextShader}
            />
            <GreenPortalShader 
                position={[0, -1.65, 0]}
                geometry={new THREE.CircleGeometry(1, 64)}
                scaleProp={2.1}
                numero={0.5}
                timed={0.1}
                glows={10}
                clampMin={0}
                clampMax={1}
                colorA="#cecece"
                colorB="#000000"
                patternScale={0.2}
            />
            <DifferentShaders shader={shaders[shaderIndex]} />
            <Model position={[0, -2, 0]} />
        </group>
    )
}