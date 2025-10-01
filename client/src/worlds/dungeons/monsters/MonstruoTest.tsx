import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import React, { useRef } from "react";
import { useEcctrlStore } from "../../../character/noPhysicsCharacter/extra/useEcctrlStore";
import { useCharacterStore } from "../../../store/useCharacterStore";
function Monster({ speed = 15 }) {
  const ref = useRef<THREE.Group>(null);

  // posición del player desde tu store
  const playerPos = useCharacterStore((s) => s.position);

  // colliders del mundo (suelo, escaleras, etc.)
  const colliders = useEcctrlStore((s) => s.colliderMeshesArray);

  const raycaster = new THREE.Raycaster();
  const down = new THREE.Vector3(0, -1, 0);

  useFrame((state, delta) => {
    if (!ref.current) return;

    const pos = ref.current.position;
    const target = new THREE.Vector3(...playerPos);

    // dirección hacia el player (solo XZ)
    const dir = target.clone().sub(pos);
    dir.y = 0;
    const dist = dir.length();

    if (dist > 1.5) {
      dir.normalize();
      pos.addScaledVector(dir, speed * delta);
      ref.current.lookAt(target.x, pos.y, target.z);
    }

    // --- pegar al suelo con raycast ---
    raycaster.set(pos.clone().add(new THREE.Vector3(0, 5, 0)), down);
    const hits = raycaster.intersectObjects(colliders, true);
    if (hits.length > 0) {
      pos.y = hits[0].point.y;
    }
  });

  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </group>
  );
}

export default Monster;
