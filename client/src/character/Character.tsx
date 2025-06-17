import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";

type CharacterProps = {
  animation: string;
} ;

export function Character({ animation, ...props }: CharacterProps) {
  const group = useRef<THREE.Group>(null!);

  const { nodes, materials, animations } = useGLTF("/character.glb") as any;

  const { actions } = useAnimations(animations, group);
  console.log("actions", actions);
  console.log("animation", animation);
  useEffect(() => {
    actions[animation]?.reset().fadeIn(0.24).play();
    return () => {
      actions?.[animation]?.fadeOut(0.24);
    };
  }, [animation, actions]);

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="fall_guys">
          <primitive object={nodes._rootJoint} />
          <skinnedMesh
            name="body"
            geometry={nodes.body.geometry}
            material={materials.Material}
            skeleton={nodes.body.skeleton}
            castShadow
            receiveShadow
          />
          <skinnedMesh
            name="eye"
            geometry={nodes.eye.geometry}
            material={materials.Material}
            skeleton={nodes.eye.skeleton}
            castShadow
            receiveShadow
          />
          <skinnedMesh
            name="hand-"
            geometry={nodes["hand-"].geometry}
            material={materials.Material}
            skeleton={nodes["hand-"].skeleton}
            castShadow
            receiveShadow
          />
          <skinnedMesh
            name="leg"
            geometry={nodes.leg.geometry}
            material={materials.Material}
            skeleton={nodes.leg.skeleton}
            castShadow
            receiveShadow
          />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/character.glb");
