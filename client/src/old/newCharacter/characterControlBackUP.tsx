import { useEffect, useRef, useState } from 'react';
import { useKeyboardControls } from '@react-three/drei';
import { CapsuleCollider, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useOrbitCam } from '../../hooks/useFollowCam';
import directionOffset from '../../hooks/useDirectionOffset';
import { useLocation } from 'react-router-dom';
import CharacterLevaControls from '../../leva/CharacterLevaControls';
import CameraLevaControls from '../../leva/CameraLevaControls';
import { socket } from '../../socket/SocketManager';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useAudioStore } from '../../store/useAudioStore';
import NewCharacter from './Character';

export default function MiniEcctrl() {
  const [isWalking, setIsWalking] = useState(false);

  const bodyRef = useRef<any>(null);
  const meshRef = useRef<THREE.Object3D>(null);
  const [, getKeys] = useKeyboardControls();
  const { camera } = useThree();
  const [animation, setAnimation] = useState('idle');
  const [isJumping, setIsJumping] = useState(false);
  const [isInAir] = useState(false);

  const location = useLocation();
  const [speed, setSpeed] = useState(4);
  const [jumpForce, setJumpForce] = useState(6);
  const [friction, setFriction] = useState(1);
  const [damping, setDamping] = useState(2);

  const [camDistance, setCamDistance] = useState(5);
  const [camHeightOffset, setCamHeightOffset] = useState(2);
  useOrbitCam(meshRef, camDistance, camHeightOffset);

  const walkDir = new THREE.Vector3();
  const rotateAngle = new THREE.Vector3(0, 1, 0);
  const [forceJumpAnim, setForceJumpAnim] = useState(false);

  const jumpDirection = useRef(new THREE.Vector3());
  const stepRef = useAudioStore((s) => s.stepRef);

  useEffect(() => {
    useCharacterStore.getState().setRigidBodyRef(bodyRef);
  }, []);

  useFrame((_state, delta) => {
    const body = bodyRef.current;
    if (!body) return;

    const pos = body.translation();
    useCharacterStore.getState().setPosition([pos.x, pos.y, pos.z]);

    const { forward, backward, leftward, rightward, jump, sprint } = getKeys();
    const hasInput = forward || backward || leftward || rightward;

    // 🔊 pasos
    if (hasInput && !isWalking) {
      setIsWalking(true);
      stepRef?.current?.play();
    } else if (!hasInput && isWalking) {
      setIsWalking(false);
      stepRef?.current?.stop();
    }
    // 🎬 animaciones
    if (forceJumpAnim) {
      
      setAnimation('jumpTest');
    } else if (isInAir) {
      setAnimation('idle');
    } else if (hasInput && sprint) {
      setAnimation('running');
      setSpeed(20);
    } else if (isWalking && !sprint) {
      setAnimation('running');
      setSpeed(10);
    } else {
      setAnimation('idle');
    }

    // ⚙️ Rotación + movimiento
    const isOnGround = !isJumping && !isInAir;
    if (hasInput) {
      const offset = directionOffset(forward, backward, leftward, rightward);
      const angleToCam = Math.atan2(
        camera.position.x - pos.x,
        camera.position.z - pos.z
      );

      // 👉 rotación objetivo
      const targetQuat = new THREE.Quaternion();
      targetQuat.setFromAxisAngle(rotateAngle, angleToCam + offset + Math.PI);

      // 👉 rotación actual
      const currentQuat = body.rotation();
      const smoothQuat = new THREE.Quaternion().copy(currentQuat);

      // 👉 giro suave (ajusta 0.2 para más/menos rapidez)
      smoothQuat.slerp(targetQuat, 0.1);

      body.setRotation(smoothQuat, true);

      useCharacterStore.getState().setRotation([
        smoothQuat.x,
        smoothQuat.y,
        smoothQuat.z,
        smoothQuat.w,
      ]);

      if (isOnGround) {
        camera.getWorldDirection(walkDir);
        walkDir.y = 0;
        walkDir.normalize();
        walkDir.applyAxisAngle(rotateAngle, offset);
        walkDir.multiplyScalar(speed);
        body.setLinvel(
          { x: walkDir.x, y: body.linvel().y, z: walkDir.z },
          true
        );
      }
    } else {
      const vel = body.linvel();
      if (isJumping || isInAir) {
        body.setLinvel(
          { x: jumpDirection.current.x, y: vel.y, z: jumpDirection.current.z },
          true
        );
      } else {
        body.setLinvel({ x: 0, y: vel.y, z: 0 }, true);
      }
    }

    // 🚀 salto
    if (jump && !isJumping) {
      jumpDirection.current.copy(walkDir);
      jumpDirection.current.y = 0;
      jumpDirection.current.normalize();
      jumpDirection.current.multiplyScalar(speed);

      body.setLinvel(
        {
          x: jumpDirection.current.x,
          y: jumpForce,
          z: jumpDirection.current.z,
        },
        true
      );

      setIsJumping(true);
      setForceJumpAnim(true);
      setTimeout(() => setForceJumpAnim(false), 600);
    }

    // 🔌 socket update
    const rot = body.rotation();
    const world = useCharacterStore.getState().world;
    socket.emit('updatePosition', {
      id: socket.id,
      position: [pos.x, pos.y + 1, pos.z],
      rotation: [rot.x, rot.y, rot.z, rot.w],
      world,
    });

    useCharacterStore.getState().setPosition([pos.x, pos.y + 1, pos.z]);
  });

  const onCollide = ({ other }: any) => {
    if (other.rigidBodyObject?.userData.floor) {
      setIsJumping(false);
    }
  };

  useEffect(() => {
    socket.emit('playerAnim', { id: socket.id, animation });
  }, [animation]);

  return (
    <>
      {location.pathname === '/' && (
        <>
          <CharacterLevaControls
            setSpeed={setSpeed}
            setJumpForce={setJumpForce}
            setFriction={setFriction}
            setDamping={setDamping}
          />
          <CameraLevaControls
            setCamDistance={setCamDistance}
            setCamHeightOffset={setCamHeightOffset}
          />
        </>
      )}

      <RigidBody
        name="player"
        lockRotations
        ref={bodyRef}
        colliders={false}
        friction={friction}
        linearDamping={damping}
        onCollisionEnter={onCollide}
      >
        <group ref={meshRef} position={[0, 1, 0]}>
          <CapsuleCollider args={[0.6, 0.25]} position={[0, 0.9, 0]} />
          <NewCharacter animation={animation} name={'bro'} />
        </group>
      </RigidBody>
    </>
  );
}
