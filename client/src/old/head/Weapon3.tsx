// components/items/FirstSwordModel.tsx
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useSkinnedGLB } from "../useSkinnedClone";
import { MeshPhysicalNodeMaterial } from "three/webgpu";

type Props = {
    /** Si pasas un esqueleto externo (del personaje), lo re-enlazamos */
    skeleton?: THREE.Skeleton;
    /** Overrides simples de materiales (opcional) */
    colorA?: THREE.ColorRepresentation;
    colorB?: THREE.ColorRepresentation;
    emissiveA?: THREE.ColorRepresentation;
};

export default function ThirdSwordModel({
    skeleton,
    colorA = "gray",
    colorB = "blue",
    emissiveA = "red",
}: Props) {
    const path = "/items/weapons/FirstSword.glb";

    // Asumo que tu hook devuelve un diccionario de nodos (SkinnedMesh, bones, etc.)
    const { nodes, ready, error } = useSkinnedGLB(path, skeleton);

    // Refs para re-enlazar el esqueleto si te llega por props
    const meshA = useRef<THREE.SkinnedMesh | null>(null);
    const meshB = useRef<THREE.SkinnedMesh | null>(null);

    useEffect(() => {
        if (!skeleton) return;
        // Re-bind por si quieres usar el esqueleto del personaje
        if (meshA.current) {
            meshA.current.bind(skeleton, meshA.current.bindMatrix);
        }
        if (meshB.current) {
            meshB.current.bind(skeleton, meshB.current.bindMatrix);
        }
    }, [skeleton]);

    if (error || !ready || !nodes) return null;

    // Intenta coger los nodos esperados del GLB
    const n = nodes as any; // tipado laxo porque depende de tu hook/GLB
    const mA = n.Cube001 as THREE.SkinnedMesh | undefined;
    const mB = n.Cube001_1 as THREE.SkinnedMesh | undefined;

    if (!mA || !mB) {
        // Si no existen, no montamos nada para evitar crashes
        return null;
    }

    return (
        <group dispose={null}>
            <group name="Scene">
                <group name="Armature">
                    <group name="SwordRoot">
                        <skinnedMesh
                            ref={meshA}
                            name="Blade"
                            geometry={mA.geometry}
                            skeleton={skeleton ?? mA.skeleton}
                            frustumCulled={false}
                            castShadow
                            receiveShadow
                        >
                            {/* Material con skinning activado */}
                            <meshStandardMaterial color="gray" side={THREE.BackSide}/>
                        </skinnedMesh>

                        <skinnedMesh
                            ref={meshB}
                            name="Handle"
                            geometry={mB.geometry}
                            skeleton={skeleton ?? mB.skeleton}
                            frustumCulled={false}
                            castShadow
                            receiveShadow
                        >
                            <meshStandardMaterial color="green" side={THREE.BackSide}/>
                        </skinnedMesh>
                    </group>
                    {/* <primitive object={n.Armature} /> */}
                    {/* ⚠️ No metas <primitive object={nodes}/>; 'nodes' no es un Object3D.
              Si necesitas algún bone/armature concreto del GLB, inserta ese nodo:
              <primitive object={n.Armature} /> (solo si realmente es un Object3D) */}
                </group>
            </group>
        </group>
    );
}
