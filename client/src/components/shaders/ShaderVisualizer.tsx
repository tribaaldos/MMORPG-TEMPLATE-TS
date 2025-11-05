import { Canvas, extend } from "@react-three/fiber";
import * as THREE from "three/webgpu";
import { useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { PostProcessing } from "../../VFXEngine/Effects";

import WaterShader from "./water/WaterShader";
import GreenPortalShader from "./greenPortal/GreenPortalShader";

import { useParams, useNavigate } from "react-router-dom";
import { Leva } from "leva";
import BasicShader from "./basicShader/BasicShader";
import MagmaShader from "./magma/MagmaShader";
import GrassField from "./grass/Grass";
import ShaderCard from "./ShaderCard";
import GrassOnSphere from "./grass/GrassOnSphere";

export default function ShaderVisualizer() {
    const canvasRef = useRef<any>(null);
    const navigate = useNavigate();
    const { id } = useParams();

    const selectedId = parseInt(id || "1");

    const renderShader = () => {
        const shaderKey = `shader-${selectedId}`;
        switch (selectedId) {
            case 1:
                return <WaterShader key={shaderKey} geometry="plane" scaleProp={10} patternScale={1.2} />;
            case 2:
                return <GreenPortalShader key={shaderKey} scaleProp={1} />;
            case 3:
                return <MagmaShader />;
            case 4:
                return <BasicShader />
            case 5:
                return <GrassOnSphere />
            default:
                return <WaterShader position={[0, 0, 0]} geometry="plane" scaleProp={10} patternScale={1.2} />;
        }
    };
    const levaKey = `leva-${selectedId}`;

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            {/* Sidebar */}
            <div
                style={{
                    width: "200px",
                    backgroundColor: "#1a1a1a",
                    padding: "1rem",
                    color: "white",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                }}
            >
                <h3>Shaders</h3>
                <ShaderCard id={1} title="Water" imageSrc="/shader-visualizer/water.png" />
                <ShaderCard id={2} title="Green Portal" imageSrc="/shader-visualizer/portal.png" />
                <ShaderCard id={3} title="Magma" imageSrc="/shader-visualizer/magma.png" />
                
                <ShaderCard id={5} title="Grass" imageSrc="/shader-visualizer/grass.png" />
            </div>

            {/* Main canvas */}
            <div style={{ flex: 1 }}>
                <Leva key={levaKey} collapsed />
                <Canvas
                    ref={canvasRef}
                    shadows
                    camera={{ fov: 75, position: [0, 4, 5] }}
                    gl={(props: any) => {
                        extend(THREE as any);
                        const renderer = new THREE.WebGPURenderer(props);
                        return renderer.init().then(() => renderer);
                    }}
                    onCreated={(state) => {
                        canvasRef.current = state;
                        const color = new THREE.Color("#101020");
                        state.gl.setClearColor(color);
                        state.scene.background = color;
                    }}
                >
                    <color attach="background" args={["#101020"]} />
                    <PostProcessing />
                    {renderShader()}
                    <OrbitControls />
                    <ambientLight intensity={1} />
                </Canvas>
            </div>
        </div>
    );
}