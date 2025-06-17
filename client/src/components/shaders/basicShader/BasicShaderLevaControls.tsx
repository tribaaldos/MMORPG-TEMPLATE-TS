import { useControls } from 'leva';
import { useEffect } from 'react';
import { useBasicShaderStore } from './useBasicShaderStore';

export default function BasicShaderLevaControls() {
  const {
    intensidad, setIntensidad,
    velocidad, setVelocidad,
    colorPrincipal, setColorPrincipal
  } = useBasicShaderStore();

  const controls = useControls('Basic Shader', {
    intensidad: { value: intensidad, min: 0, max: 1, step: 0.01 },
    velocidad: { value: velocidad, min: 0, max: 2, step: 0.01 },
    colorPrincipal: { value: colorPrincipal },
  });

  useEffect(() => {
    setIntensidad(controls.intensidad);
    setVelocidad(controls.velocidad);
    setColorPrincipal(controls.colorPrincipal);
  }, [controls]);

  return null;
}