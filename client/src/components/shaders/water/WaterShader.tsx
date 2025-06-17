import { useEffect, useMemo, useState } from 'react';
import {
  vec3, uniform, positionLocal, time, abs,
  triNoise3D, color, mix
} from 'three/tsl';
import * as THREE from 'three';
import { useLocation } from 'react-router-dom';
import WaterShaderLevaControls from './WaterShaderLevaControls';


interface WaterShaderControls {
  scaleProp?: number;
  position?: [number, number, number];
  colorA?: string;
  colorB?: string;
  numero?: number;
  timed?: number;
  glows?: number;
  clampMin?: number;
  clampMax?: number;
  geometry?: THREE.BufferGeometry | string;
  patternScale?: number;
}

export default function WaterShader({
  scaleProp = 1.0,
  position = [0, 0, 0],
  colorA: colorAProp = '#0acdf7',
  colorB: colorBProp = '#000000',
  numero: numeroProp = 0.5,
  timed: timedProp = 0.1,
  glows: glowsProp = 10,
  clampMin: clampMinProp = 0,
  clampMax: clampMaxProp = 1,
  geometry = "sphere",
  patternScale: patternScaleProp = 0.2
}: WaterShaderControls) {
  const location = useLocation();

  const [colorA, setColorA] = useState(colorAProp);
  const [colorB, setColorB] = useState(colorBProp);
  const [scale, setScale] = useState(scaleProp);
  const [numero, setNumero] = useState(numeroProp);
  const [glows, setGlows] = useState(glowsProp);
  const [timed, setTimed] = useState(timedProp);
  const [clampMin, setClampMin] = useState(clampMinProp);
  const [clampMax, setClampMax] = useState(clampMaxProp);
  const [patternScale, setPatternScale] = useState(patternScaleProp);

  const { nodes } = useMemo(() => {
    const t = time.mul(timed);
    const pos = positionLocal.add(vec3(t, t, t));
    const scaledPos = pos.mul(patternScale);
    const noise = triNoise3D(
      scaledPos,
      triNoise3D(scaledPos.mul(0.3), scaledPos.mul(0.3), scaledPos.mul(0.3)),
      triNoise3D(scaledPos.mul(0.3), scaledPos.mul(0.3), scaledPos.mul(0.3))
    );
    const numero2 = -0.4;
    const glow1 = abs(noise.sub(numero)).pow(glows).clamp(clampMin, clampMax);
    const glow2 = abs(noise.sub(numero2)).pow(10.3).clamp(0, 1);
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
        uniforms: uniforms,
      },
    };
  }, [colorA, colorB, numero, timed, glows, clampMin, clampMax, patternScale]);

  const materialKey = useMemo(() => Date.now(), [nodes]);
  const controlsKey = `leva-controls-${location.pathname}`;

  return (
    <>
      {location.pathname === '/shader-visualizer/1' && (
        <WaterShaderLevaControls
          key={controlsKey}
          setColorA={setColorA}
          setColorB={setColorB}
          setScale={setScale}
          setNumero={setNumero}
          setTimed={setTimed}
          setGlows={setGlows}
          setClampMin={setClampMin}
          setClampMax={setClampMax}
          setClampedNumber={(val) => {
            setClampMin(val[0]);
            setClampMax(val[1]);
          }}
          setPatternScale={setPatternScale}
          scaleProp={scale}
          colorAProp={colorA}
          colorBProp={colorB}
          numeroProp={numero}
          timedProp={timed}
          glowsProp={glows}
          clampMinProp={clampMin}
          clampMaxProp={clampMax}
          patternScaleProp={patternScale}
        />
      )}

      <mesh scale={scale} position={position} rotation={[Math.PI / 2, 0, 0]}>
        {
          geometry instanceof THREE.BufferGeometry ? (
            <primitive object={geometry} attach="geometry" />
          ) : geometry === "plane" ? (
            <planeGeometry args={[4, 4, 128, 128]} />
          ) : geometry === "sphere" ? (
            <sphereGeometry args={[2, 64, 64]} />
          ) : (
            <boxGeometry args={[2, 2, 2]} />
          )
        }
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