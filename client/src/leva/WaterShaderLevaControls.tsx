import { useControls, button } from 'leva';
import { useEffect, useRef } from 'react';

interface Props {
  setColorA: (color: string) => void;
  setColorB: (color: string) => void;
  setScale: (value: number) => void;
  setNumero?: (value: number) => void;
  setTimed?: (value: number) => void;
  setGlows?: (value: number) => void;
  setClampMin?: (value: number) => void;
  setClampMax?: (value: number) => void;
  setClampedNumber?: (value: [number, number]) => void;
  scaleProp?: number;
}

export default function WaterShaderLevaControls({
  setColorA,
  setColorB,
  setScale,
  setNumero,
  setTimed,
  setGlows,
  setClampMin,
  setClampMax,
  setClampedNumber,
  scaleProp = 1.75,
}: Props) {
  const controls = useControls('Water Shader', {
    colorA: '#00ffff',
    colorB: '#002244',
    scale: { value: scaleProp, min: 0.1, max: 5.0, step: 0.1 },
    numero: { value: 0.5, min: 0, max: 1, step: 0.01 },
    timed: { value: 0.2, min: 0, max: 1, step: 0.01 },
    glows: { value: 10, min: 0, max: 30, step: 0.01 },
    clampMin: { value: 0, min: -0.3, max: 0.35, step: 0.01 },
    clampMax: { value: 1, min: 0, max: 1, step: 0.01 },
    Exportar: button(() => {
      const {
        colorA,
        colorB,
        scale,
        numero,
        timed,
        glows,
        clampMin,
        clampMax,
      } = latestValues.current;

      const jsx = `<WaterShader
  scaleProp={${scale}}
  numero={${numero}}
  timed={${timed}}
  glows={${glows}}
  clampMin={${clampMin}}
  clampMax={${clampMax}}
  colorA="${colorA}"
  colorB="${colorB}"
/>`;

      navigator.clipboard.writeText(jsx);
      alert('Copiado al portapapeles:\n\n' + jsx);
    }),
  });

  const latestValues = useRef(controls);

  useEffect(() => {
    latestValues.current = controls;

    setColorA(controls.colorA);
    setColorB(controls.colorB);
    setScale(controls.scale);
    setNumero?.(controls.numero);
    setTimed?.(controls.timed);
    setGlows?.(controls.glows);
    setClampMin?.(controls.clampMin);
    setClampMax?.(controls.clampMax);
    setClampedNumber?.([controls.clampMin, controls.clampMax]);
  }, Object.values(controls)); // Reacciona a cualquier cambio

  return null;
}