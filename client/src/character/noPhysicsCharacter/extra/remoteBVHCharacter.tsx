// character/noPhysicsCharacter/extra/RemoteCharacters.tsx
import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useAtom } from "jotai";
import {
  remotePlayersAtom,
  remoteAnimationsAtom,
  remoteNamesAtom,
} from "../../../socket/SocketManager";
import { useCharacterStore } from "../../../store/useCharacterStore";
import AnimatedCharacterModel from "../CharacterModel";

type RefsMap = { [id: string]: THREE.Group };
type TargetsMap = {
  [id: string]: { pos: THREE.Vector3; quat: THREE.Quaternion };
};

export default function RemoteCharactersBVH() {
  const [remotePlayers] = useAtom(remotePlayersAtom);
  const [remoteAnimations] = useAtom(remoteAnimationsAtom);
  const [remoteNames] = useAtom(remoteNamesAtom);
  const currentWorld = useCharacterStore((s) => s.world);

  // refs de <group> y objetivos de suavizado
  const refs = useRef<RefsMap>({});
  const targets = useRef<TargetsMap>({});

  // Ganancia de suavizado (más alta = sigue más rápido). 12 ≈ 120–160ms de constante de tiempo.
  const SMOOTH_K = 18;

  useFrame((_, delta) => {
    // alpha dependiente de delta (suavizado exponencial, FPS-agnóstico)
    const alpha = 1 - Math.exp(-SMOOTH_K * Math.min(delta, 0.05));

    for (const [id, { position, rotation, world }] of Object.entries(remotePlayers)) {
      if (world !== currentWorld) continue;

      const g = refs.current[id];
      if (!g) continue;

      // crea/actualiza el target
      let t = targets.current[id];
      if (!t) {
        t = targets.current[id] = {
          pos: new THREE.Vector3(),
          quat: new THREE.Quaternion(),
        };
      }
      t.pos.set(position[0], position[1], position[2]);
      t.quat.set(rotation[0], rotation[1], rotation[2], rotation[3]);

      // primera vez: coloca directamente para evitar “pop” desde (0,0,0)
      if (g.userData.__init !== true) {
        g.position.copy(t.pos);
        g.quaternion.copy(t.quat);
        g.userData.__init = true;
        continue;
      }

      // suavizado simple
      g.position.lerp(t.pos, alpha);
      g.quaternion.slerp(t.quat, alpha);
    }
  });

  return (
    <>
      {Object.entries(remotePlayers).map(([id, data]) => {
        if (data.world !== currentWorld) return null;

        const anim = (remoteAnimations[id] ?? "IDLE").toString().toUpperCase();
        const name = remoteNames[id] ?? "Player";

        return (
          <group
            key={id}
            ref={(el) => {
              if (el) refs.current[id] = el;
              else {
                delete refs.current[id];
                delete targets.current[id];
              }
            }}
          >
            <AnimatedCharacterModel playerId={id} animStatus={anim} />
            {/* Si quieres un nombre flotante, añade un Html de drei aquí */}
          </group>
        );
      })}
    </>
  );
}
