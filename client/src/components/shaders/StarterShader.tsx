import { useMemo, useState } from 'react';
import {
  vec3, uniform, positionLocal, time, abs,
  triNoise3D, color, mix,
} from 'three/tsl';
import * as THREE from 'three';
import { useLocation } from 'react-router-dom';
import WaterShaderLevaControls from '../../leva/WaterShaderLevaControls';

interface StarterShaderProps {
  scaleProp?: number;
  position?: [number, number, number];
  colorA?: string;
  colorB?: string;
  numero?: number;
  timed?: number;
  glows?: number;
  clampMin?: number;
  clampMax?: number;
  geometry?: any;
}

export default function StarterShader({
  scaleProp = 1.0,
  position = [0, 0, 0],
  colorA: colorAProp = '#00ffff',
  colorB: colorBProp = '#002244',
  numero: numeroProp = 0.5,
  timed: timedProp = 0.2,
  glows: glowsProp = 10,
  clampMin: clampMinProp = 0,
  clampMax: clampMaxProp = 1,
  geometry,
}: StarterShaderProps) {
  const location = useLocation();

  const [colorA, setColorA] = useState(colorAProp);
  const [colorB, setColorB] = useState(colorBProp);
  const [scale, setScale] = useState(scaleProp);
  const [numero, setNumero] = useState(numeroProp);
  const [glows, setGlows] = useState(glowsProp);
  const [timed, setTimed] = useState(timedProp);
  const [clampMin, setClampMin] = useState(clampMinProp);
  const [clampMax, setClampMax] = useState(clampMaxProp);

  const clampNumber = [clampMin, clampMax];

  const { nodes } = useMemo(() => {
    const pos = positionLocal;
    const animatedPos = pos.add(vec3(time.mul(timed), 0, time.mul(0.1)));
    const noise = triNoise3D(animatedPos, animatedPos, animatedPos);
    const glow = abs(noise.sub(numero).mul(2.0)).pow(glows).clamp(clampMin, clampMax);

    const uniforms = {
      colorA: uniform(color(colorA)),
      colorB: uniform(color(colorB)),
    };

    const finalColor = mix(uniforms.colorB, uniforms.colorA, glow);

    return {
      nodes: {
        colorNode: finalColor,
        emissiveNode: finalColor,
        uniforms: uniforms,
      },
    };
  }, [colorA, colorB, numero, timed, glows, clampMin, clampMax]);

  const materialKey = useMemo(() => Date.now(), [nodes]);

  return (
    <>
      {location.pathname === '/shader-visualizer' && (
        <WaterShaderLevaControls
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
          scaleProp={scaleProp}
        />
      )}

      <mesh scale={scale} position={position} rotation={[Math.PI / 2, 0, 0]}>
       { geometry ??  <sphereGeometry args={[2, 64, 64]} />}
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