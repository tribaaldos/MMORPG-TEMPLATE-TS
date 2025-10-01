import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";

type Props = {
  skeleton?: THREE.Skeleton | undefined;   // Skeleton principal del personaje
  path?: string;                           // Ruta del GLB de los hombros
};

export default function Shoulder({
  skeleton,
  path = "/items/shoulders/shoulders.glb",
}: Props) {
  const { scene } = useGLTF(path);
  const clonedRef = useRef<THREE.Object3D | null>(null);
  const skinnedMeshes = useRef<THREE.SkinnedMesh[]>([]);

  // Clonar la escena solo una vez
  const cloned = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  useEffect(() => {
    if (!scene) return;

    clonedRef.current = cloned;
    skinnedMeshes.current = [];

    // Buscar TODOS los SkinnedMesh
    cloned.traverse((child) => {
      if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
        const mesh = child as THREE.SkinnedMesh;
        mesh.frustumCulled = false;

        // ✅ Clonar materiales
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((mat) => {
            const clonedMat = mat.clone() as THREE.MeshStandardMaterial;
            clonedMat.skinning = true;
            return clonedMat;
          });
        } else {
          const mat = mesh.material.clone() as THREE.MeshStandardMaterial;
          mat.skinning = true;
          mesh.material = mat;
        }

        mesh.visible = true;
        skinnedMeshes.current.push(mesh);
        // console.log("SkinnedMesh encontrado:", mesh.name);
      }
    });

    // Hacer bind al skeleton principal en TODOS
    if (skeleton && skinnedMeshes.current.length > 0) {
      skinnedMeshes.current.forEach((mesh) => {
        mesh.bind(skeleton, cloned.matrixWorld);
      });
      cloned.updateMatrixWorld(true);
      // console.log("✅ Bind completado con skeleton principal en", skinnedMeshes.current.length, "meshes");
    }
  }, [scene, skeleton, cloned]);

  return clonedRef.current ? <primitive object={clonedRef.current} /> : null;
}

useGLTF.preload("/items/shoulders/shoulders.glb");
