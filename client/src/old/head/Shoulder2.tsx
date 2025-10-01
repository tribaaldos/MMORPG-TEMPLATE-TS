// components/items/ShouldersTwo.tsx
import React, { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

type Props = {
    /** Esqueleto del personaje; si lo pasas NO montamos el armature del GLB */
    skeleton?: THREE.Skeleton;
    /** Ruta del GLB */
    url?: string;

    /** Material primario (metal/plástico) para ambos hombros */
    color1?: THREE.ColorRepresentation;
    metalness1?: number; // 0..1
    roughness1?: number; // 0..1
    emissive1?: THREE.ColorRepresentation;

    /** Material secundario (tela/cuero) para ambos hombros */
    color2?: THREE.ColorRepresentation;
    metalness2?: number; // 0..1
    roughness2?: number; // 0..1
    emissive2?: THREE.ColorRepresentation;
};

export default function ShouldersTwo({
    skeleton,
    url = "/items/shoulders/shoulders.glb",
    color1 = "yellow", metalness1 = 0.5, roughness1 = 0.35, emissive1 = "#000",
    color2 = "blue", metalness2 = 0.2, roughness2 = 0.75, emissive2 = "#000",
}: Props) {
    const group = useRef<THREE.Group>(null);

    // refs a cada skinned mesh
    const lPrim = useRef<THREE.SkinnedMesh>(null); // Cone005
    const lSec = useRef<THREE.SkinnedMesh>(null); // Cone005_1
    const rPrim = useRef<THREE.SkinnedMesh>(null); // Cone006
    const rSec = useRef<THREE.SkinnedMesh>(null); // Cone006_1

    // nodos del GLB
    const { nodes, materials, } = useGLTF(url) as unknown as {
        nodes: Record<string, any>;
        materials: Record<string, THREE.Material>;

    };

    // rebind al esqueleto externo si llega
    useEffect(() => {
        if (!skeleton) return;
        lPrim.current?.bind(skeleton, lPrim.current.bindMatrix);
        lSec.current?.bind(skeleton, lSec.current.bindMatrix);
        rPrim.current?.bind(skeleton, rPrim.current.bindMatrix);
        rSec.current?.bind(skeleton, rSec.current.bindMatrix);
    }, [skeleton]);

    return (
        <group ref={group} dispose={null}>
            <group name="Scene">
                <group name="Armature">
                    {/* Hombro izquierdo */}
                    <group name="Cone">
                        <skinnedMesh
                            ref={lPrim}
                            name="Cone005"
                            geometry={nodes.Cone005.geometry}
                            skeleton={skeleton ?? nodes.Cone005.skeleton}
                            frustumCulled={false}
                            castShadow
                            receiveShadow
                        >
                            <meshStandardMaterial
                                attach="material"
                                skinning
                                color={color1}
                                metalness={metalness1}
                                roughness={roughness1}
                                emissive={emissive1}
                                transparent={false}
                                opacity={1}
                                depthWrite
                                depthTest
                                blending={THREE.NormalBlending}
                                side={THREE.DoubleSide}
                            />
                        </skinnedMesh>

                        <skinnedMesh
                            ref={lSec}
                            name="Cone005_1"
                            geometry={nodes.Cone005_1.geometry}
                            skeleton={skeleton ?? nodes.Cone005_1.skeleton}
                            frustumCulled={false}
                            castShadow
                            receiveShadow
                        >
                            <meshStandardMaterial
                                attach="material"
                                skinning
                                color={color2}
                                metalness={metalness2}
                                roughness={roughness2}
                                emissive={emissive2}
                                transparent={false}
                                opacity={1}
                                depthWrite
                                depthTest
                                blending={THREE.NormalBlending}
                                side={THREE.FrontSide}
                            />
                        </skinnedMesh>
                    </group>

                    {/* Hombro derecho */}
                    <group name="Cone001">
                        <skinnedMesh
                            ref={rPrim}
                            name="Cone006"
                            geometry={nodes.Cone006.geometry}
                            skeleton={skeleton ?? nodes.Cone006.skeleton}
                            frustumCulled={false}
                            castShadow
                            receiveShadow
                        >
                            <meshStandardMaterial
                                attach="material"
                                skinning
                                color={color1}
                                metalness={metalness1}
                                roughness={roughness1}
                                emissive={emissive1}
                                transparent={false}
                                opacity={1}
                                depthWrite
                                depthTest
                                blending={THREE.NormalBlending}
                                side={THREE.BackSide}
                            />
                        </skinnedMesh>

                        <skinnedMesh
                            ref={rSec}
                            name="Cone006_1"
                            geometry={nodes.Cone006_1.geometry}
                            skeleton={skeleton ?? nodes.Cone006_1.skeleton}
                            frustumCulled={false}
                            castShadow
                            receiveShadow
                        >
                            <meshStandardMaterial
                                attach="material"
                                skinning
                                color={color2}
                                metalness={metalness2}
                                roughness={roughness2}
                                emissive={emissive2}
                                transparent={false}
                                opacity={1}
                                depthWrite
                                depthTest
                                blending={THREE.NormalBlending}
                                side={THREE.DoubleSide}
                            />
                        </skinnedMesh>
                    </group>

                    {/* Si usas skeleton externo, no montamos armature del GLB */}
                    {/* {!skeleton && <primitive object={nodes.mixamorigHips} />} */}
                </group>
            </group>
        </group>
    );
}

useGLTF.preload("/items/shoulders/shoulders.glb");
