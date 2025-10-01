import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Bvh, CameraControls } from "@react-three/drei";
import BVHController, { BVHEcctrlApi } from "./BVHController";
import { useEcctrlStore } from "./extra/useEcctrlStore";
import { button, folder, useControls } from "leva";
import AnimatedCharacterModel from "./CharacterModel";
import { useCharacterStore } from "../../store/useCharacterStore";
import { socket } from "../../socket/SocketManager";

export default function FullBVH() {
  const camControlRef = useRef<CameraControls | null>(null);
  const ecctrlRef = useRef<BVHEcctrlApi | null>(null);
  const colliderMeshesArray = useEcctrlStore((state) => state.colliderMeshesArray);
  const position = useCharacterStore((state) => state.position); // [x, y, z]

  // ——— playerId SIEMPRE local (socket.id) con fallback y escucha de eventos ———
  const [playerId, setPlayerId] = useState<string>(socket?.id ?? "local-fallback");
  useEffect(() => {
    const apply = () => setPlayerId(socket?.id ?? "local-fallback");
    if (socket?.connected && socket?.id) apply();
    socket?.on?.("connect", apply);
    socket?.on?.("disconnect", apply);
    return () => {
      socket?.off?.("connect", apply);
      socket?.off?.("disconnect", apply);
    };
  }, []);

  // debug
  const EcctrlDebugSettings = useControls("Ecctrl Debug", {
    CameraLock: button(() => {
      camControlRef.current?.lockPointer();
    }),
    FirstPerson: button(() => {
      camControlRef.current?.dolly(camControlRef.current!.distance - 0.02, true);
    }),
    ResetPlayer: button(() => {
      ecctrlRef.current?.group?.position.set(0, 0, 0);
      ecctrlRef.current?.resetLinVel();
    }),
    EcctrlDebug: false,
    Physics: folder(
      {
        paused: false,
        delay: { value: 3, min: 0, max: 20, step: 0.1 },
        gravity: { value: 9.81, min: 0, max: 50, step: 0.1 },
        fallGravityFactor: { value: 4, min: 1, max: 10, step: 0.1 },
        maxFallSpeed: { value: 50, min: 1, max: 200, step: 1 },
        mass: { value: 1, min: 0.1, max: 10, step: 0.1 },
        sleepTimeout: { value: 10, min: 0, max: 100, step: 0.1 },
        slowMotionFactor: { value: 1, min: 0, max: 1, step: 0.01 },
      },
      { collapsed: true }
    ),
    Movement: folder(
      {
        turnSpeed: { value: 29, min: 0, max: 100, step: 1 },
        maxWalkSpeed: { value: 3.4, min: 0, max: 10, step: 0.1 }, // 3
        maxRunSpeed: { value: 10, min: 0, max: 20, step: 0.1 }, // 5
        acceleration: { value: 45, min: 0, max: 100, step: 1 },
        deceleration: { value: 150, min: 0, max: 100, step: 1 }, // 15
        counterAccFactor: { value: 0.5, min: 0, max: 5, step: 0.1 },
        airDragFactor: { value: 0.3, min: 0, max: 1, step: 0.05 },
        jumpVel: { value: 6, min: 0, max: 20, step: 0.1 }, // 5
      },
      { collapsed: true }
    ),
    Floating: folder(
      {
        floatCheckType: { value: "BOTH" as FloatCheckType, options: ["RAYCAST", "SHAPECAST", "BOTH"] as FloatCheckType[] },
        maxSlope: { value: 1, min: 0, max: Math.PI / 2, step: 0.01 },
        floatHeight: { value: 0.4, min: 0, max: 1, step: 0.01 }, // 0.25
        floatPullBackHeight: { value: 0.25, min: 0, max: 1, step: 0.01 },
        floatSensorRadius: { value: 0.12, min: 0, max: 1, step: 0.01 },
        floatSpringK: { value: 900, min: 0, max: 3000, step: 10 },
        floatDampingC: { value: 30, min: 0, max: 1000, step: 1 },
      },
      { collapsed: true }
    ),
    Collision: folder(
      {
        collisionCheckIteration: { value: 3, min: 1, max: 10, step: 1 },
        collisionPushBackVelocity: { value: 3, min: 0, max: 50, step: 0.1 },
        collisionPushBackDamping: { value: 0.1, min: 0, max: 1, step: 0.05 },
        collisionPushBackThreshold: { value: 0.001, min: 0, max: 1, step: 0.01 },
      },
      { collapsed: true }
    ),
  });

  const EcctrlMapDebugSettings = useControls("Map Debug", {
    MapDebug: false,
    ActiveKinematicCollider: true,
    Map: folder(
      {
        visible: true,
        excludeFloatHit: false,
        excludeCollisionCheck: false,
        friction: { value: 0.8, min: 0, max: 1, step: 0.01 },
        restitution: { value: 0.05, min: 0, max: 1, step: 0.01 },
      },
      { collapsed: true }
    ),
  });

  useFrame((state, delta) => {
    if (camControlRef.current && ecctrlRef.current) {
      // For camera control to follow character
      if (ecctrlRef.current.group)
        camControlRef.current.moveTo(
          ecctrlRef.current.group.position.x,
          ecctrlRef.current.group.position.y + 0.3,
          ecctrlRef.current.group.position.z,
          true
        );
      // Hide character model if camera is too close
      if (ecctrlRef.current.model)
        ecctrlRef.current.model.visible = camControlRef.current.distance > 0.7;
    }
  });

  return (
    <>
      <CameraControls ref={camControlRef} smoothTime={0.1} colliderMeshes={colliderMeshesArray} makeDefault />
      <Bvh>
        <BVHController
          position={position}
          ref={ecctrlRef}
          debug={EcctrlDebugSettings.EcctrlDebug}
          {...EcctrlDebugSettings}
          key={EcctrlDebugSettings.floatCheckType} // Force remount on change
          colliderCapsuleArgs={[0.3, 0.8, 4, 8]}
        >
          {/* <NewCharacter /> */}
          <AnimatedCharacterModel
            slowMotion={EcctrlDebugSettings.slowMotionFactor}
            paused={EcctrlDebugSettings.paused}
            playerId={playerId} // 👈 SIEMPRE el id local del socket (con fallback)
          />
        </BVHController>
      </Bvh>
    </>
  );
}
