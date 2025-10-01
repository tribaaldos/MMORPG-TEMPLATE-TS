import { useEffect, useMemo, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import NameTag from "../../character/NameTag";
import LegsRigged from "./newCharacter/LegsRigged";
import { useInventoryStore } from "../../store/useInventoryStore";

type Props = {
    animation: string;
    name: string;
    timeScale?: number;
    position?: [number, number, number];
    rotation?: [number, number, number];
    pantsPath?: string;
};

export default function TestCharacter({
    animation,
    name = "Test",
    timeScale = 1,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    pantsPath = "/LegsRigged.glb",
}: Props) {
    const groupRef = useRef<THREE.Group>(null!);
    const mainSkinned = useRef<THREE.SkinnedMesh | null>(null);

    const { scene, animations } = useGLTF("/characterFold.glb");
    const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);

    // --- Inicializar animaciones sobre el grupo completo ---
    const { actions } = useAnimations(animations, clonedScene);

    // --- Buscar SkinnedMesh principal para pantalones ---
    useEffect(() => {
        clonedScene.traverse((child) => {
            if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
                mainSkinned.current = child as THREE.SkinnedMesh;
            }
        });
    }, [clonedScene]);

    // --- Reproducir animación ---
    useEffect(() => {
        if (!actions[animation]) return;
        actions[animation].reset().fadeIn(0.25).play();
        Object.values(actions).forEach((action) => {
            action.setEffectiveTimeScale(timeScale);
        });
        return () => actions[animation]?.fadeOut(0.25);
    }, [animation, actions, timeScale]);

    useFrame(() => { });

    // EQUIPMENT
    const equipment = useInventoryStore((s) => s.equipment);



    return (
        <group ref={groupRef} position={position} rotation={rotation}>
            <pointLight position={[0, 2, 0]} intensity={5} castShadow />
            <NameTag text={name} />
            <primitive object={clonedScene} />
            {/* {mainSkinned.current && <LegsRigged skeleton={mainSkinned.current.skeleton} pantsPath={pantsPath} />} */}
            {equipment.legs?.Model && (
                <equipment.legs.Model skeleton={mainSkinned.current?.skeleton} />
            )}
            {equipment.helmet?.Model && (
                <equipment.helmet.Model skeleton={mainSkinned.current?.skeleton} />
            )}
            {equipment.shoulders?.Model && (
                <equipment.shoulders.Model skeleton={mainSkinned.current?.skeleton} />
            )}

        </group>
    );
}

useGLTF.preload("/characterFold.glb");
useGLTF.preload("/LegsRigged.glb");
