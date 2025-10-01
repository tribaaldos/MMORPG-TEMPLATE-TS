import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import { useAnimationStore } from "./extra/useAnimationStore";
import { useInventoryStore } from "../../store/useInventoryStore";
import { socket } from "../../socket/SocketManager";

type Props = {
  playerId?: string;        // opcional: si no lo pasas, coge socket.id
  animStatus?: string;
  paused?: boolean;
  slowMotion?: number;
  tintHex?: number;
}

export default function AnimatedCharacterModel({
  playerId,
  animStatus,
  paused = false,
  slowMotion = 1,
  tintHex,
}: Props) {
  const effectiveId = playerId ?? socket?.id ?? 'local-fallback';

  const { scene, animations } = useGLTF("/AnimationLibrary.glb");
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const group = useRef<THREE.Group>(null!);

  useEffect(() => {
    clone.traverse((o: any) => {
      if (!o.isMesh) return;
      o.castShadow = true;
      o.receiveShadow = true;
      o.material = o.material.clone();
      o.material.side = THREE.FrontSide;

      const isJoints =
        o.material?.name === "M_Joints" ||
        o.name?.includes("Mannequin_2") ||
        /joints/i.test(o.material?.name || "");

      o.material.color = new THREE.Color(isJoints ? 0x00ffff : 0xdedede);
      if (tintHex != null && isJoints) {
        o.material.color = new THREE.Color(tintHex);
      }
    });
  }, [clone, tintHex]);

  const { actions, mixer } = useAnimations(animations, group);

  useEffect(() => {
    mixer.timeScale = paused ? 0 : slowMotion;
  }, [mixer, paused, slowMotion]);

  const storeStatus = useAnimationStore((s) => s.animationStatus);
  const status = animStatus ?? storeStatus ?? "IDLE";

  const prevActionNameRef = useRef("Idle_Loop");
  const [canPlayNext, setCanPlayNext] = useState(true);

  const statusToActionMap = useMemo(
    () => ({
      IDLE: "Idle_Loop",
      WALK: "Walk_Loop",
      RUN: "Jog_Fwd_Loop",
      JUMP_START: "Jump_Start",
      JUMP_IDLE: "Jump_Loop",
      JUMP_FALL: "Jump_Loop",
      JUMP_LAND: "Jump_Land",
    }),
    []
  );

  useEffect(() => {
    if (!actions) return;
    const idle = actions["Idle_Loop"];
    if (idle && !idle.isRunning()) idle.play();
  }, [actions]);

  useEffect(() => {
    if (!actions) return;

    const nextName = (statusToActionMap as any)[status];
    if (!nextName) return;

    const next = actions[nextName];
    if (!next) return;

    const prevName = prevActionNameRef.current;
    const prev = actions[prevName];

    if (nextName !== prevName && canPlayNext) {
      if (
        nextName === statusToActionMap.JUMP_START ||
        nextName === statusToActionMap.JUMP_LAND
      ) {
        setCanPlayNext(false);
        (next as any).timeScale = 1.6;
        next.reset().setLoop(THREE.LoopOnce, 1).crossFadeFrom(prev || null, 0.1, true).play();
        (next as any).clampWhenFinished = true;
      } else {
        (next as any).timeScale = 1;
        next.reset().crossFadeFrom(prev || null, 0.2, true).play();
      }
      prevActionNameRef.current = nextName;
    }

    if (!canPlayNext && prevName === statusToActionMap.JUMP_START && status !== "JUMP_IDLE" && status !== "JUMP_START") {
      setCanPlayNext(true);
    }
    if (!canPlayNext && prevName === statusToActionMap.JUMP_LAND && status !== "IDLE" && status !== "JUMP_LAND") {
      setCanPlayNext(true);
    }
  }, [status, actions, canPlayNext, statusToActionMap]);

  const mainSkinned = useRef<THREE.SkinnedMesh | null>(null);
  useEffect(() => {
    clone.traverse((child: any) => {
      if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
        mainSkinned.current = child as THREE.SkinnedMesh;
      }
    });
  }, [clone]);

  // equipo por jugador (siempre local en tu caso)
  const ensurePlayer = useInventoryStore((s) => s.ensurePlayer);
  useEffect(() => {
    ensurePlayer(effectiveId);
  }, [ensurePlayer, effectiveId]);

  const equipment = useInventoryStore((s) => s.equipmentByPlayer[effectiveId]);

  return (
    <group ref={group} position={[0, -1.1, 0]}>
      <primitive object={clone} />

      {equipment?.weapon?.Model && (
        <equipment.weapon.Model skeleton={mainSkinned.current?.skeleton} />
      )}
      {equipment?.shoulders?.Model && (
        <equipment.shoulders.Model skeleton={mainSkinned.current?.skeleton} />
      )}
      {equipment?.legs?.Model && (
        <equipment.legs.Model skeleton={mainSkinned.current?.skeleton} />
      )}
    </group>
  );
}

useGLTF.preload("/AnimationLibrary.glb");
