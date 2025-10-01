// hooks/useSkinnedGLB.ts
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { SkeletonUtils, GLTFLoader } from "three-stdlib";

function cloneAndPrepareSkinned(scene: THREE.Object3D) {
  const cloned = SkeletonUtils.clone(scene) as THREE.Object3D;
  const skinnedMeshes: THREE.SkinnedMesh[] = [];

  cloned.traverse((child) => {
    const maybeMesh = child as THREE.SkinnedMesh & { isSkinnedMesh?: boolean };
    if (maybeMesh && (maybeMesh as any).isSkinnedMesh) {
      const mesh = maybeMesh as THREE.SkinnedMesh;
      mesh.frustumCulled = false;

      // clona materiales y activa skinning
      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map((mat) => {
          const m = (mat as THREE.Material).clone() as THREE.MeshStandardMaterial;
          (m as any).skinning = true;
          return m;
        });
      } else if (mesh.material) {
        const m = (mesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
        (m as any).skinning = true;
        mesh.material = m;
      }

      mesh.visible = true;
      skinnedMeshes.push(mesh);
    }
  });

  return { cloned, skinnedMeshes };
}

function bindSkeletonToMeshes(
  skeleton: THREE.Skeleton,
  clonedRoot: THREE.Object3D,
  meshes: THREE.SkinnedMesh[]
) {
  meshes.forEach((mesh) => {
    mesh.bind(skeleton, clonedRoot.matrixWorld);
  });
  clonedRoot.updateMatrixWorld(true);
}

function disposeObject3D(root: THREE.Object3D | null) {
  if (!root) return;
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(material)) material.forEach((m) => m?.dispose());
    else material?.dispose();
  });
}

// 🔹 construye mapas de nodes/materials estilo gltfjsx
function buildMaps(root: THREE.Object3D | null) {
  const nodes: Record<string, any> = {};
  const materials: Record<string, THREE.Material> = {};
  if (!root) return { nodes, materials };
  root.traverse((obj: any) => {
    if (obj?.name) nodes[obj.name] = obj;
    const mat = obj.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach((m) => m?.name && (materials[m.name] = m));
    else if (mat?.name) materials[mat.name] = mat;
  });
  return { nodes, materials };
}

export type UseSkinnedGLBOptions = {
  autoBind?: boolean;
  disposeOnUnmount?: boolean;
  deps?: any[];
};

export function useSkinnedGLB(
  path: string | null | undefined,
  skeleton?: THREE.Skeleton,
  opts: UseSkinnedGLBOptions = {}
) {
  const { autoBind = true, disposeOnUnmount = true, deps = [] } = opts;

  const [scene, setScene] = useState<THREE.Object3D | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // carga manual con GLTFLoader
  useEffect(() => {
    setError(null);
    setScene(null);
    if (typeof path !== "string" || path.length === 0) return;

    let cancelled = false;
    const loader = new GLTFLoader();
    loader.load(
      path,
      (gltf) => {
        if (!cancelled) setScene(gltf.scene || null);
      },
      undefined,
      (err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      }
    );
    return () => {
      cancelled = true;
    };
  }, [path]);

  // clonado
  const prevClonedRef = useRef<THREE.Object3D | null>(null);
  const { cloned, skinnedMeshes } = useMemo(() => {
    if (!scene) return { cloned: null, skinnedMeshes: [] as THREE.SkinnedMesh[] };
    return cloneAndPrepareSkinned(scene);
  }, [scene, ...deps]);

  // bind
  useEffect(() => {
    if (!autoBind || !skeleton || !cloned || skinnedMeshes.length === 0) return;
    bindSkeletonToMeshes(skeleton, cloned, skinnedMeshes);
  }, [autoBind, skeleton, cloned, skinnedMeshes]);

  // dispose
  useEffect(() => {
    const prev = prevClonedRef.current;
    if (prev && prev !== cloned) disposeObject3D(prev);
    prevClonedRef.current = cloned;
    return () => {
      if (disposeOnUnmount) disposeObject3D(prevClonedRef.current);
      prevClonedRef.current = null;
    };
  }, [cloned, disposeOnUnmount]);

  // nodes + materials para estilo gltfjsx
  const { nodes, materials } = useMemo(() => buildMaps(cloned), [cloned]);

  return {
    cloned,
    skinnedMeshes,
    nodes,       // 👈 acceso declarativo
    materials,   // 👈 acceso declarativo
    ready: !!cloned,
    error,
  } as const;
}
