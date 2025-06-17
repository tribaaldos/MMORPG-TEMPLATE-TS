import { useEffect, useMemo } from 'react';
import {
    vec3, uniform, positionLocal, time, abs,
    triNoise3D, color, mix
} from 'three/tsl';
import * as THREE from 'three';
import { useLocation } from 'react-router-dom';
import { useMagmaShaderStore } from './useMagmaShaderStore';
import MagmaShaderLevaControls from './MagmaShaderLevaControls';
import { useControls } from 'leva';

const getRandomHexColor = () =>
    `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
function getRandomNumber(): number {
  return parseFloat(Math.random().toFixed(3)); // por ejemplo, 0.738
}    
export default function MagmaShader() {
    const location = useLocation();

    const {
        colorA, colorB, scale, numero, timed, glows, clampMin, clampMax, patternScale,
        setColorA, setColorB, setScale, setNumero, setTimed, setGlows, setClampMin, setClampMax, setPatternScale
    } = useMagmaShaderStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 't') {
                const randomColor = getRandomHexColor();
                const randomNumber = getRandomNumber();
                setColorA(randomColor);
                setPatternScale(randomNumber)
                setScale(randomNumber)
                console.log('Nuevo colorA:', randomColor);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // test 
    // Al inicio del componente
    const { testNumber } = useControls('Debug', {
        testNumber: { value: 0.5, min: 0, max: 1, step: 0.01 },
    });

    // ✅ Inicializa los valores cuando se monta el shader
    useEffect(() => {
        setColorA('#ff3300');
        setColorB('#000000');
        setScale(1.5);
        setNumero(0.45);
        setTimed(0.2);
        setGlows(12);
        setClampMin(0.0);
        setClampMax(1.0);
        setPatternScale(0.5);
    }, []);

    const { nodes } = useMemo(() => {
        const t = time.mul(timed);
        const pos = positionLocal.add(vec3(t, t, t));
        const scaledPos = pos.mul(patternScale);

        const noise = triNoise3D(
            scaledPos,
            triNoise3D(scaledPos.mul(0.3), scaledPos.mul(0.3), scaledPos.mul(0.3)),
            triNoise3D(scaledPos.mul(0.3), scaledPos.mul(0.3), scaledPos.mul(0.3))
        );
        const glow1 = abs(noise.sub(0.7)).pow(glows).clamp(clampMin, clampMax);
        const glow2 = abs(noise.add(testNumber)).pow(10).clamp(0, 1);
        const mixGlow = glow1.add(glow2);

        const uniforms = {
            colorA: uniform(color(colorA)),
            colorB: uniform(color(colorB)),
        };
        const finalColor = mix(uniforms.colorB, uniforms.colorA, mixGlow);

        return {
            nodes: {
                colorNode: finalColor,
                emissiveNode: finalColor,
                uniforms,
            },
        };
    }, [colorA, colorB, numero, timed, glows, clampMin, clampMax, patternScale, testNumber]);

    const materialKey = useMemo(() => Date.now(), [nodes]);

    return (
        <>
            {location.pathname === '/shader-visualizer/3' && <MagmaShaderLevaControls />}
            <mesh scale={scale} rotation={[Math.PI / 2, 0, 0]}>
                <sphereGeometry args={[2, 64, 64]} />
                {/* @ts-ignore */}
                <meshStandardNodeMaterial
                    key={materialKey}
                    {...nodes}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </>
    );
}