import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

type Props = {
  skeleton?: THREE.Skeleton;
  pantsPath?: string;
};

export default function LegsRigged({ skeleton, pantsPath = "/LegsRigged.glb" }: Props) {
  const { nodes } = useGLTF(pantsPath);

  // nodes.pants debe existir en tu GLTF
  if (!nodes.pants || !skeleton) return null;

  return (
    <skinnedMesh
      geometry={nodes.pants.geometry}
      material={nodes.pants.material}
      skeleton={skeleton} // bind directo al skeleton principal
      frustumCulled={false}
    />
  );
}

useGLTF.preload("/LegsRigged.glb");
