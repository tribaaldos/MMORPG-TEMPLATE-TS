import * as THREE from 'three';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Fn, vec2, vec3, vec4, float,
  positionLocal, uv, sin, cos, atan, PI, PI2,
  time, mod, texture, uniform,
  oneMinus, min, length, mix, luminance,
} from 'three/tsl';
import { useTexture } from '@react-three/drei';


export default function TornadoShader() {
  const textureURL = '/textures/grass/perlin.png';
  const perlinTexture = useTexture(textureURL);
  perlinTexture.wrapS = THREE.RepeatWrapping;
  perlinTexture.wrapT = THREE.RepeatWrapping;

  const emissiveColor = useMemo(() => uniform(vec3(1.0, 0.5, 0.3)), []);
  const timeScale = useMemo(() => uniform(0.2), []);
  const parabolStrength = useMemo(() => uniform(1.0), []);
  const parabolOffset = useMemo(() => uniform(0.3), []);
  const parabolAmplitude = useMemo(() => uniform(0.2), []);

  // @ts-ignore
  const twistedCylinder = Fn(([position, parabolStrength, parabolOffset, parabolAmplitude, time]) => {
    const angle = atan(position.z, position.x).toVar();
    const elevation = position.y;
    const radius = parabolStrength.mul(position.y.sub(parabolOffset)).pow(2).add(parabolAmplitude).toVar();
    radius.addAssign(sin(elevation.sub(time).mul(20).add(angle.mul(2))).mul(0.05));
    return vec3(
      cos(angle).mul(radius),
      elevation,
      sin(angle).mul(radius)
    );
  });

  const outputNode = useMemo(() => Fn(() => {
    const scaledTime = time.mul(timeScale);

    const noise1Uv = uv().add(vec2(scaledTime, scaledTime.negate())).toVar();
    noise1Uv.mulAssign(vec2(2, 0.25));
    const noise1 = texture(perlinTexture, noise1Uv, 1).r.remap(0.45, 0.7);

    const noise2Uv = uv().add(vec2(scaledTime.mul(0.5), scaledTime.negate())).toVar();
    noise2Uv.mulAssign(vec2(5, 1));
    const noise2 = texture(perlinTexture, noise2Uv, 1).g.remap(0.45, 0.7);

    const outerFade = min(
      uv().y.smoothstep(0, 0.1),
      oneMinus(uv().y).smoothstep(0, 0.4)
    );

    const effect = noise1.mul(noise2).mul(outerFade);
    const emissiveColorLuminance = luminance(emissiveColor);

    return vec4(
      emissiveColor.mul(1.2).div(emissiveColorLuminance),
      effect.smoothstep(0, 0.1)
    );
  })(), []);

  const positionNode = useMemo(() => {
    return twistedCylinder(positionLocal, parabolStrength, parabolOffset, parabolAmplitude, time.mul(timeScale));
  }, []);

  return (
    <mesh scale={[1, 1, 1]} position={[0, 2, 0]}>
      <cylinderGeometry args={[1, 1, 1, 20, 20, true]} />
      {/* @ts-ignore */}
      <meshStandardNodeMaterial
        transparent
        side={THREE.DoubleSide}
        positionNode={positionNode}
        outputNode={outputNode}
      />
    </mesh>
  );
}