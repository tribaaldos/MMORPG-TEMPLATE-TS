import React, { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { LoopOnce, LoopRepeat } from "three";

type V3 = [number, number, number];
type AnimKey = "idle" | "walk" | "attack";

export default function SpiderLocal({
  position = [0, 0, 0] as V3,
  target = [4, 0, 4] as V3,
  attackRange = 2,
  // 👇 controla cada cuánto se lanza el ataque (cadencia)
  attackInterval = 1.8,          // segundos entre ataques
  // 👇 controla la velocidad del clip de ataque (sin cambiar la cadencia)
  attackPlaybackSpeed = 1.0,     // 1 = normal, 0.5 = más lento, 2 = más rápido
  // caminar
  walkCycle = 0.9,               // duración de un ciclo de caminar (seg) – opcional
  walkPlaybackSpeed = undefined, // si lo prefieres, puedes usar timeScale directo
  moveSpeed = 1.2,               // u/s caminando
  scale = 0.02,
}: {
  position?: V3;
  target?: V3;
  attackRange?: number;
  attackInterval?: number;
  attackPlaybackSpeed?: number;
  walkCycle?: number;
  walkPlaybackSpeed?: number;
  moveSpeed?: number;
  scale?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const { nodes, materials, animations } = useGLTF("/dungeons/monsters/cyborg_spider.glb");
  const { actions, mixer, names  } = useAnimations(animations, group);
    console.log(names);
  // NOMBRES DE TUS CLIPS (ajusta si difieren)
//   const clips = { idle: "Spider_Idle", walk: "Spider_Walk", attack: "Spider_Attack_2" };

    useEffect(() => {
        actions['Spider_Death']?.reset().fadeIn(0.5).play();
    })
  return (
    <group ref={group} position={position as any} scale={scale} rotation={[0, Math.PI / 2, Math.PI * 2]}>
      <group name="Scene">
        <group name="Sketchfab_model001" rotation={[-Math.PI / 2, 0, 0]}>
          <group name="root">
            <group name="GLTF_SceneRootNode" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Sketchfab_model_0" rotation={[-Math.PI / 2, 0, 0]}>
                <group name="f4c7dff2b8264fc5bf6d28e22753d2d4fbx_1" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Object_2_2">
                    <group name="RootNode_3">
                      <group name="Object_4_4">
                        <group name="GLTF_created_0">
                          {/* Ajusta estos nombres si tu GLB difiere */}
                          {/* @ts-ignore */}
                          <skinnedMesh
                            name="Object_64"
                            geometry={(nodes as any).Object_64.geometry}
                            material={(materials as any).Spider_M}
                            skeleton={(nodes as any).Object_64.skeleton}
                          />
                          {/* @ts-ignore */}
                          <primitive object={(nodes as any).GLTF_created_0_rootJoint} />
                        </group>
                        <group name="pPlane1_57">
                          <group name="pPlane1_Camera_lambert2_0_58" />
                        </group>
                      </group>
                    </group>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/dungeons/monsters/cyborg_spider.glb");
