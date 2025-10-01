// LegsModelOptimized.tsx
import React, { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface LegsModelProps {
  leftPoints: THREE.Vector3[];   // [upLeg, leg, foot]
  rightPoints: THREE.Vector3[];  // [upLeg, leg, foot]
  color?: string;
  tubularSegments?: number;
  radius?: number;
}

const LegsModel: React.FC<LegsModelProps> = ({
  leftPoints,
  rightPoints,
  color = "#555555",
  tubularSegments = 20,
  radius = 0.15,
}) => {
  const leftMeshRef = useRef<THREE.Mesh>(null!);
  const rightMeshRef = useRef<THREE.Mesh>(null!);

  // Crear geometría inicial solo una vez
  const leftTubeGeom = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(leftPoints);
    return new THREE.TubeGeometry(curve, tubularSegments, radius, 8, false);
  }, [leftPoints, tubularSegments, radius]);

  const rightTubeGeom = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(rightPoints);
    return new THREE.TubeGeometry(curve, tubularSegments, radius, 8, false);
  }, [rightPoints, tubularSegments, radius]);

  // Reutilizar los buffers y actualizar posición de vértices
  useFrame(() => {
    const updateTube = (points: THREE.Vector3[], geom: THREE.TubeGeometry) => {
      if (!geom || points.length < 3) return;

      const curve = new THREE.CatmullRomCurve3(points);
      const tempGeom = new THREE.TubeGeometry(curve, tubularSegments, radius, 8, false);

      // Copiar atributos de posición al buffer existente
      geom.attributes.position.array.set(tempGeom.attributes.position.array as Float32Array);
      geom.attributes.position.needsUpdate = true;
      geom.computeVertexNormals();
      tempGeom.dispose();
    };

    if (leftMeshRef.current) updateTube(leftPoints, leftMeshRef.current.geometry as THREE.TubeGeometry);
    if (rightMeshRef.current) updateTube(rightPoints, rightMeshRef.current.geometry as THREE.TubeGeometry);
  });

  return (
    <>
      <mesh ref={leftMeshRef} geometry={leftTubeGeom}>
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh ref={rightMeshRef} geometry={rightTubeGeom}>
        <meshStandardMaterial color={color} />
      </mesh>
    </>
  );
};

export default LegsModel;
