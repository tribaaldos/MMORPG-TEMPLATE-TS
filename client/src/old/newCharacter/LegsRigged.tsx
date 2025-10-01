import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";

type Props = {
  skeleton?: THREE.Skeleton | undefined;   // Skeleton principal del personaje
  pantsPath?: string;           // Ruta del GLB de pantalones
};

export default function LegsRigged({
  skeleton,
  pantsPath = "/LegsRigged.glb",
}: Props) {
  const { scene } = useGLTF(pantsPath);
  const clonedRef = useRef<THREE.Object3D | null>(null);
  const pantsRef = useRef<THREE.SkinnedMesh | null>(null);

  // Clonar la escena solo una vez
  const cloned = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  useEffect(() => {
    if (!scene) return;

    clonedRef.current = cloned;

    // Buscar el SkinnedMesh de los pantalones
    cloned.traverse((child) => {
      if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
        pantsRef.current = child as THREE.SkinnedMesh;
        pantsRef.current.frustumCulled = false;
        console.log("SkinnedMesh encontrado:", pantsRef.current.name);

        // Material
        if (Array.isArray(pantsRef.current.material)) {
          pantsRef.current.material = pantsRef.current.material.map((mat) => {
            const clonedMat = mat.clone();
            (clonedMat as THREE.MeshStandardMaterial).skinning = true;
            return clonedMat;
          });
        } else {
          const mat = pantsRef.current.material.clone();
          (mat as THREE.MeshStandardMaterial).skinning = true;
          pantsRef.current.material = mat;
        }

        pantsRef.current.visible = true;
      }
    });

    // Hacer bind al skeleton principal del personaje
    if (skeleton && pantsRef.current) {
      // bind usando matrixWorld para evitar deformación
      pantsRef.current.bind(skeleton, cloned.matrixWorld);
      cloned.updateMatrixWorld(true);
      console.log("Bind completado con skeleton principal.");
    }
  }, [scene, skeleton, cloned]);

  function Material () {
    return (
      <meshStandardMaterial
        color={'red'}
        metalness={10}
        roughness={0.1}
        skinning={true}
      />
    );
  }

  return clonedRef.current ? <primitive object={clonedRef.current} material={<Material />} /> : null;
}

useGLTF.preload("/LegsRigged.glb");
