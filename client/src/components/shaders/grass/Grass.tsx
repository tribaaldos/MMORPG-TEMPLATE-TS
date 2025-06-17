import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  vec3, sin, time, positionLocal, normalLocal,
  uniform, mix, color, attribute,
  
} from 'three/tsl';
import { useCharacterStore } from '../../../store/Character';

export default function GrassField({ count = 10000 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const offsets = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 1] = 0;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, [count]);

  const rotations = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      arr[i] = Math.random() * Math.PI * 2;
    }
    return arr;
  }, [count]);

  const colors = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = 0.1 + Math.random() * 0.5;
      arr[i * 3 + 1] = 1 + Math.random() * 1;
      arr[i * 3 + 2] = 0.1 + Math.random() * 0.1;
    }
    return arr;
  }, [count]);

  useFrame(() => {
    const playerPos = useCharacterStore.getState().position;

    for (let i = 0; i < count; i++) {
      const x = offsets[i * 3 + 0];
      const y = offsets[i * 3 + 1];
      const z = offsets[i * 3 + 2];

      dummy.position.set(x, y, z);

      const dx = x - playerPos[0];
      const dz = z - playerPos[2];
      const dist = Math.sqrt(dx * dx + dz * dz);

      const threshold = 0.65;
      if (dist < threshold) {
        const factor = 1 - dist / threshold;
        const newHeight = 0.1 + 0.2 * factor;
        dummy.scale.set(1, newHeight / 0.3, 1);
      } else {
        dummy.scale.set(1, 5, 1);
      }

      dummy.rotation.set(0, rotations[i], 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  const materialProps = useMemo(() => {
    const timed = time.mul(0.1)
    const wind = sin(positionLocal.x.mul(5).add(time.mul(1.5)));
    const swayWind = wind.mul(0.3).mul(timed);
    const vColor = attribute('color', 'vec3');

    return {
      colorNode: mix(uniform(color('#228822')), vColor, 0.5),
      normalNode: normalLocal.add(vec3(swayWind, 0, 0)).normalize(),
    };
  }, []);

  return (
    <group position={[0, 0.2, 0]}>
      <ambientLight intensity={1} />
      {/* <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="black" />
      </mesh> */}

      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, count]}
        castShadow={false}
        receiveShadow={false}
      >
        <planeGeometry args={[0.05, 0.3, 1, 4]}>
          <instancedBufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </planeGeometry>
        {/* @ts-ignore */}
        <meshStandardNodeMaterial
          {...materialProps}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
    </group>
  );
}