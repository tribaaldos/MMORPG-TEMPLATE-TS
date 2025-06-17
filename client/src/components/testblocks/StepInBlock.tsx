import { useMemo, useRef, useState } from 'react';
import {
  vec3,
  vec4,
  float,
  output,
  Fn,
  uv,
  vec2,
  remap,
  length,
  abs,
  sin,
  timerGlobal,
  cos,
  fract,
} from 'three/tsl';
import * as THREE from 'three';
import { useControls } from 'leva';
import { RigidBody } from '@react-three/rapier';
import '../../types/three-tsl.d.ts'
import { MeshStandardNodeMaterial } from 'three/webgpu';
import { extend } from '@react-three/fiber';

// Esto registra el nodo como JSX válido
extend({ MeshStandardNodeMaterial });
import { ComponentProps } from 'react';

export default function StepInBlock(props: ComponentProps<'mesh'>) {
  const { zColor, bColor, cColor, dColor } = useControls({
    zColor: { value: '#0080ff' },
    bColor: { value: '#ffff80' },
    cColor: { value: '#ff80ff' },
    dColor: { value: '#438aad' }
  });

  const [isPlayerInBlock, setIsPlayerInBlock] = useState(false);
  const blockRef = useRef(null);

  const zVec = useMemo(() => vec3(...new THREE.Color(zColor).toArray()), [zColor]);
  const bVec = useMemo(() => vec3(...new THREE.Color(bColor).toArray()), [bColor]);
  const cVec = useMemo(() => vec3(...new THREE.Color(cColor).toArray()), [cColor]);
  const dVec = useMemo(() => vec3(...new THREE.Color(dColor).toArray()), [dColor]);

  const palette = useMemo(() =>
    Fn(([t]: [any]) =>
      zVec.add(
        bVec.mul(
          cos(float(6.28318).mul(cVec.mul(t).add(dVec)))
        )
      )
    ), [zVec, bVec, cVec, dVec]
  );

  const shaderNode = useMemo(() => {
    const shaderFn = Fn(() => {
      const time = timerGlobal();
      let vUv : any = uv();
      vUv = vec2(
        remap(vUv.x, float(0), float(1), float(-1), float(1)),
        remap(vUv.y, float(0), float(1), float(-1), float(1))
      );

      let uv0 = vec2(vUv);
      let finalColor = vec3(float(0.0));

      for (let i = 0.0; i < 1.0; i++) {
        vUv = fract(vUv.mul(float(2.0))).sub(float(0.5));
        let a : any  = length(vUv).sub(0.5);
        let col = palette(length(uv0).add(time).div(1.0));
        a = sin(a.mul(8.0).add(time)).div(8.0);
        a = abs(a);
        a = float(0.02).div(a);

        if (!isPlayerInBlock) {
          col = vec3(0.1, 0.1, 0.1); // gris oscuro cuando no está el player
        }

        finalColor = col.mul(a);
      }

      return output.assign(vec4(finalColor, float(1)));
    });

    return shaderFn();
  }, [palette, isPlayerInBlock]);

  const materialKey = useMemo(() => Date.now(), [shaderNode]);

  const handleCollisionEnter = (event : any) => {
    if (event.other.rigidBodyObject?.name === "player") {
      setIsPlayerInBlock(true);
      console.log("🟢 Player ENTRÓ");
    }
  };

  const handleCollisionExit = (event : any) => {
    if (event.other.rigidBodyObject?.name === "player") {
      setIsPlayerInBlock(false);
      console.log("🔴 Player SALIÓ");
    }
  };

  return (
    <RigidBody
        userData={{ floor: true }}
      name="stepBlock"
      type="fixed"
      colliders="cuboid"
      ref={blockRef}
      onCollisionEnter={handleCollisionEnter}
      onCollisionExit={handleCollisionExit}
    >
      <mesh {...props} position={[2, 0.01, -10]}rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        {/* @ts-ignore */}
        <meshStandardNodeMaterial
          key={materialKey}
          outputNode={shaderNode}
          side={THREE.DoubleSide}
        />
      </mesh>
    </RigidBody>
  );
}
