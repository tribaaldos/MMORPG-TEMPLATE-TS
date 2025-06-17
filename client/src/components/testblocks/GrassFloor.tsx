import { useEffect, useRef } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export default function GrassFloor() {
  const ref = useRef<THREE.Mesh>(null);

  const [colorMap, aoMap, displacementMap, normalMap, roughnessMap] = useTexture([
    "/textures/grass/color.png",
    "/textures/grass/ao.png",
    "/textures/grass/displacement.png",
    "/textures/grass/normal.png",
    "/textures/grass/roughness.png",
  ]);

  useEffect(() => {
    // Repetir todas las texturas
    [colorMap, aoMap, displacementMap, normalMap, roughnessMap].forEach((map) => {
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.repeat.set(20, 20); // ajusta según el tamaño del plano
      map.needsUpdate = true;
    });

    // Añadir uv2 para AO map
    if (ref.current) {
      const geometry = ref.current.geometry;
      if (!geometry.attributes.uv2) {
        geometry.setAttribute("uv2", geometry.attributes.uv);
      }
    }
  }, [colorMap, aoMap, displacementMap, normalMap, roughnessMap]);

  return (
    <mesh ref={ref} position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 100, 256, 256]} />
      <meshStandardMaterial
        map={colorMap}
        aoMap={aoMap}
        displacementMap={displacementMap}
        displacementScale={0.2} // ajusta según tu textura
        normalMap={normalMap}
        roughnessMap={roughnessMap}
      />
    </mesh>
  );
}
