import { useControls } from 'leva';
import { useEffect } from 'react';

interface CameraLevaControlsProps {
  setCamDistance: (distance: number) => void;
  setCamHeightOffset: (offset: number) => void;
}

export default function CameraLevaControls({ setCamDistance, setCamHeightOffset }: CameraLevaControlsProps) {
  const controls = useControls('Camera', {
    camHeightOffset: { value: 0.75, min: -2, max: 5, step: 0.1 },
    camDistance: { value: 5, min: 1, max: 100, step: 0.1 },
  });

  useEffect(() => {
    setCamHeightOffset(controls.camHeightOffset);
    setCamDistance(controls.camDistance);
  }, [controls, setCamHeightOffset, setCamDistance]);

  return null;
}