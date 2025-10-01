import { useGLTF } from "@react-three/drei";
import { useCharacterStore } from "../../store/useCharacterStore";
import * as THREE from 'three';
import KinematicCollider from "../../character/noPhysicsCharacter/extra/KinematicCollider";
import RemoteBVHCharacters from "../../character/noPhysicsCharacter/extra/remoteBVHCharacter";
import { Dragon } from "./monsters/Dragon";
import TeleportZone from "../../components/testblocks/Teleport";
import ProjectilesLayer from "../../character/skills/ProjectilesLayer";
import BVHWeapon from "../../items/weapons/WeaponBVH";

export default function DragonDungeon(onTeleport,) {
    const Sky = (props: any) => {
        const { nodes, materials } = useGLTF('/sky-green.glb')
        const positionPersonaje = useCharacterStore((s) => s.position);

        return (
            <group {...props} dispose={null} position={positionPersonaje}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={(nodes.Skybox as THREE.Mesh).geometry}
                    material={materials.Skybox_mat}
                    material-fog={false}
                />
            </group>
        )
    }
    const { scene } = useGLTF('/dungeons/dragonDungeon.glb');
    return (
        <>
            <Sky />
            <Dragon position={[5, 10, 10]} />
            {/* <BVHWeapon /> */}
            <KinematicCollider>
                {/* <RemoteBVHCharacters /> */}
                <TeleportZone
                    position={[10, 0, 0]}
                    radius={2}
                    targetWorld="world1"
                    color="black"
                    target={[100, 100, 0]} // posición en world2
                    onTeleport={onTeleport}
                />
                <ambientLight intensity={2} />
                <group scale={2}>
                    <primitive object={scene} />
                </group>
            </KinematicCollider>
        </>
    )
}