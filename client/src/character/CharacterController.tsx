import { useEffect, useRef, useState } from 'react';
import { useKeyboardControls } from '@react-three/drei';
import { CapsuleCollider, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useOrbitCam } from '../hooks/useFollowCam';
import directionOffset from '../hooks/useDirectionOffset';
import { useCharacterStore } from '../store/Character';
import BasicCharacter from './BasicCharacter';
import { useLocation } from 'react-router-dom';
import CharacterLevaControls from '../leva/CharacterLevaControls';
import CameraLevaControls from '../leva/CameraLevaControls';

export default function MiniEcctrl() {
  const bodyRef = useRef<any>(null);
  const meshRef = useRef<THREE.Object3D>(null); // ✅ ref visual para cámara
  const [, getKeys] = useKeyboardControls();
  const { camera } = useThree();
  const [animation, setAnimation] = useState('idle');
  const [isJumping, setIsJumping] = useState(false);
  const [isInAir, _] = useState(false);
  const jumpDirection = useRef(new THREE.Vector3());

  // 🎛️ Leva Controls

  const location = useLocation();
  const [speed, setSpeed] = useState(10);
  const [jumpForce, setJumpForce] = useState(6);
  const [friction, setFriction] = useState(1);
  const [damping, setDamping] = useState(1);

  const [camDistance, setCamDistance] = useState(5);
  const [camHeightOffset, setCamHeightOffset] = useState(2);

  useOrbitCam(meshRef, camDistance, camHeightOffset); // ✅ seguimiento correcto

  const walkDir = new THREE.Vector3();
  const rotateAngle = new THREE.Vector3(0, 1, 0);
  const rotateQuat = new THREE.Quaternion();
  const [forceJumpAnim, setForceJumpAnim] = useState(false);

  useEffect(() => {
    useCharacterStore.getState().setRigidBodyRef(bodyRef);
  }, []);
  // uf
  useFrame((_state, delta) => {
    const body = bodyRef.current;
    if (!body) return;

    const pos = body.translation();
    useCharacterStore.getState().setPosition([pos.x, pos.y, pos.z]);

    const { forward, backward, leftward, rightward, jump } = getKeys();
    const hasInput = forward || backward || leftward || rightward;

    // Animación
    if (forceJumpAnim) {
      setAnimation('jump');
    } else if (isInAir) {
      setAnimation('dive');
    } else if (forward || hasInput) {
      setAnimation('run');
    } else {
      setAnimation('idle');
    }

    // Rotación
    const isOnGround = !isJumping && !isInAir;
    if (hasInput) {
      const offset = directionOffset(forward, backward, leftward, rightward);
      const angleToCam = Math.atan2(camera.position.x - pos.x, camera.position.z - pos.z);
      rotateQuat.setFromAxisAngle(rotateAngle, angleToCam + offset + Math.PI);

      body.setRotation(rotateQuat, true); // ✅ rotación física directa

      useCharacterStore.getState().setRotation([
        rotateQuat.x,
        rotateQuat.y,
        rotateQuat.z,
        rotateQuat.w,
      ]);

      if (isOnGround) {
        camera.getWorldDirection(walkDir);
        walkDir.y = 0;
        walkDir.normalize();
        walkDir.applyAxisAngle(rotateAngle, offset);
        walkDir.multiplyScalar(speed);
        body.setLinvel({
          x: walkDir.x,
          y: body.linvel().y,
          z: walkDir.z,
        }, true);
      }
    } else {
      const vel = body.linvel();
      if (isJumping || isInAir) {
        body.setLinvel({ x: jumpDirection.current.x, y: vel.y, z: jumpDirection.current.z }, true);
      } else {
        body.setLinvel({ x: 0, y: vel.y, z: 0 }, true);
      }
    }

    // Jump
    if (jump && !isJumping) {
      jumpDirection.current.copy(walkDir);
      jumpDirection.current.y = 0;
      jumpDirection.current.normalize();
      jumpDirection.current.multiplyScalar(speed);

      body.setLinvel({
        x: jumpDirection.current.x,
        y: jumpForce,
        z: jumpDirection.current.z
      }, true);

      setIsJumping(true);
      setForceJumpAnim(true);
      setTimeout(() => setForceJumpAnim(false), 600);
    }
  });

  const onCollide = ({ other }: any) => {
    if (other.rigidBodyObject?.userData.floor) {
      setIsJumping(false);
    }
  };

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
      position={[0, 1, 0]}
      friction={friction}
      linearDamping={damping}
      onCollisionEnter={onCollide}
    >
      <group ref={meshRef}>
        <CapsuleCollider args={[0.5, 0.7]} position={[0, 1, 0]} />
        <BasicCharacter animation={animation} />
      </group>
    </RigidBody>
  </>
)}