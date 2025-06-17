import { useControls, button } from 'leva';
import { useEffect, useRef } from 'react';
import { useMagmaShaderStore } from './useMagmaShaderStore';

export default function MagmaShaderLevaControls() {
  const {
    colorA, colorB, scale, numero, timed,
    glows, clampMin, clampMax, patternScale,
    setColorA, setColorB, setScale, setNumero, setTimed,
    setGlows, setClampMin, setClampMax, setPatternScale
  } = useMagmaShaderStore();
  

  const controls = useControls('Magma Shader', {
    colorA: colorA,
    colorB: colorB,
    scale: { value: scale, min: 0.1, max: 5, step: 0.01 },
    numero: { value: numero, min: 0, max: 1, step: 0.01 },
    timed: { value: timed, min: 0, max: 1, step: 0.01 },
    glows: { value: glows, min: 0, max: 30, step: 0.01 },
    clampMin: { value: clampMin, min: 0, max: 1, step: 0.01 },
    clampMax: { value: clampMax, min: 0, max: 1, step: 0.01 },
    patternScale: { value: patternScale, min: 0, max: 10, step: 0.01 },
    Exportar: button(() => {
      const jsx = `<MagmaShader
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
    })
  });

  const latest = useRef(controls);

  useEffect(() => {
    latest.current = controls;
    setColorA(controls.colorA);
    setColorB(controls.colorB);
    setScale(controls.scale);
    setNumero(controls.numero);
    setTimed(controls.timed);
    setGlows(controls.glows);
    setClampMin(controls.clampMin);
    setClampMax(controls.clampMax);
    setPatternScale(controls.patternScale);
  }, [controls]);

  return null;
}