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
  setPatternScale?: (value: number) => void;

  scaleProp?: number;
  colorAProp?: string;
  colorBProp?: string;
  numeroProp?: number;
  timedProp?: number;
  glowsProp?: number;
  clampMinProp?: number;
  clampMaxProp?: number;
  patternScaleProp?: number;
}

export default function GreenPortalLevaControls({
  setColorA,
  setColorB,
  setScale,
  setNumero,
  setTimed,
  setGlows,
  setClampMin,
  setClampMax,
  setClampedNumber,
  setPatternScale,
  scaleProp = 1.75,
  colorAProp = '#0af83a',
  colorBProp = '#000000',
  numeroProp = 0.5,
  timedProp = 0.2,
  glowsProp = 10,
  clampMinProp = 0,
  clampMaxProp = 1,
  patternScaleProp = 2,
}: Props) {
  const controls = useControls('GreenPortalShader', {
    colorA: { value: colorAProp },
    colorB: { value: colorBProp },
    scale: { value: scaleProp, min: 0.1, max: 5.0, step: 0.1 },
    numero: { value: numeroProp, min: 0, max: 1, step: 0.01 },
    timed: { value: timedProp, min: 0, max: 1, step: 0.01 },
    glows: { value: glowsProp, min: 0, max: 30, step: 0.01 },
    clampMin: { value: clampMinProp, min: 0, max: 1, step: 0.01 },
    clampMax: { value: clampMaxProp, min: 0, max: 1, step: 0.01 },
    patternScale: { value: patternScaleProp, min: 0, max: 10, step: 0.01 },
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
        patternScale,
      } = latestValues.current;

      const jsx = `<GreenPortalShader
  scaleProp={${scale}}
  numero={${numero}}
  timed={${timed}}
  glows={${glows}}
  clampMin={${clampMin}}
  clampMax={${clampMax}}
  colorA="${colorA}"
  colorB="${colorB}"
  patternScale={${patternScale}}
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
    setPatternScale?.(controls.patternScale);
  }, [controls]);

  return null;
}