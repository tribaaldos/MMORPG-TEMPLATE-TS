import { useEffect, useMemo } from 'react';
import {
  color, mix, positionLocal, time, uniform, vec3,
} from 'three/tsl';
import * as THREE from 'three';
import { useLocation } from 'react-router-dom';
import { useBasicShaderStore } from './useBasicShaderStore';
import BasicShaderLevaControls from './BasicShaderLevaControls';
export default function BasicShader() {
  const location = useLocation();

  const setIntensidad = useBasicShaderStore((s) => s.setIntensidad);
  const setVelocidad = useBasicShaderStore((s) => s.setVelocidad);
  const setColorPrincipal = useBasicShaderStore((s) => s.setColorPrincipal);

  // Inicialización (esto es lo ÚNICO que define valores)
  useEffect(() => {
    setIntensidad(0.6);
    setVelocidad(0);
    setColorPrincipal('#44ccff');
  }, []);   

  const intensidad = useBasicShaderStore((s) => s.intensidad);
  const velocidad = useBasicShaderStore((s) => s.velocidad);
  const colorPrincipal = useBasicShaderStore((s) => s.colorPrincipal);

  const { nodes } = useMemo(() => {
    const t = time.mul(velocidad);
    const movimiento = positionLocal.add(vec3(t, t, t));
    const glow = movimiento.length().mul(intensidad);

    const uniforms = {
      colorPrincipal: uniform(color(colorPrincipal)),
    };

    const finalColor = mix(uniforms.colorPrincipal, color('#000000'), glow);

    return {
      nodes: {
        colorNode: finalColor,
        emissiveNode: finalColor,
        uniforms,
      },
    };
  }, [intensidad, velocidad, colorPrincipal]);

  const materialKey = useMemo(() => Date.now(), [nodes]);

  return (
    <>
      {location.pathname === '/shader-visualizer/4' && 
      <BasicShaderLevaControls />}
      <mesh scale={1.5} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 3, 64, 64]} />
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