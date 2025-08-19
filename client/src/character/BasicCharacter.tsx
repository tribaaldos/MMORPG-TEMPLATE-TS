import { useEffect, useMemo, useRef } from 'react';
import { useGLTF, useAnimations, Html, Billboard, Text } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';
import fuente from '../../public/fonts/roboto.ttf';
import { socket } from '../socket/SocketManager';
import { useFrame, useThree } from '@react-three/fiber';
type Props = {
    animation: string;
    name: any;
};

export default function BasicCharacter({ animation, name }: Props) {
    const avatarRef = useRef<THREE.Group>(null!);
    // ✅ Load and clone the full animated scene
    const { scene, animations } = useGLTF('/BasicCharacter.glb');
    const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);

    const { actions } = useAnimations(animations, avatarRef);

    useEffect(() => {
        if (!actions[animation]) return;
        actions[animation].reset().fadeIn(0.25).play();
        return () => {
            actions[animation]?.fadeOut(0.25);
        };
    }, [animation, actions]);
    function NameTag({ text }: { text: string }) {
        const { camera } = useThree();
        const meshRef = useRef<THREE.Mesh>(null!);

        const canvas = useMemo(() => {
            const c = document.createElement("canvas");
            const ctx = c.getContext("2d")!;
            c.width = 256;
            c.height = 64;
            ctx.fillStyle = "transparent";
            ctx.fillRect(0, 0, c.width, c.height);
            ctx.fillStyle = "white";
            ctx.font = "24px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(text, c.width / 2, 40);
            return c;
        }, [text]);

        const texture = useMemo(() => new THREE.CanvasTexture(canvas), [canvas]);

        // 👁️ Billboard
        useFrame(() => {
            if (meshRef.current) {
                meshRef.current.lookAt(camera.position);
            }
        });

        return (
            <mesh position={[0, 2.2, 0]} ref={meshRef}>
                <planeGeometry args={[1.5, 0.4]} />
                <meshBasicMaterial map={texture} transparent />
            </mesh>
        );
    }
    return (
        <group>

            <NameTag text={name} />
            <primitive object={clonedScene} ref={avatarRef} />
        </group>
    );
}

useGLTF.preload('/BasicCharacter.glb');
