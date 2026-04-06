import { useGLTF } from "@react-three/drei";
import { useCharacterStore } from "../../store/useCharacterStore";
import * as THREE from 'three';
import KinematicCollider from "../../character/noPhysicsCharacter/extra/KinematicCollider";
import RemoteBVHCharacters from "../../character/noPhysicsCharacter/extra/remoteBVHCharacter";
import { Dragon } from "./monsters/Dragon";
import TeleportZone from "../../components/testblocks/Teleport";
import BVHWeapon from "../../items/weapons/WeaponBVH";
import SSGI from "../../VFXEngine/SSGI";
import StaticCollider from "../../character/noPhysicsCharacter/extra/StaticCollider";
import { vec3 } from "three/tsl";

export default function DragonDungeon({ onTeleport }: 
    {
            onTeleport: (worldId: string, targetPos?: [number, number, number]) => void

    }
) {
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
                <Dragon id="dragon-1" position={[0,   0, 0]}  nameId="Dragon" />
            <Dragon id="dragon-2" position={[15,  0, 8]}  nameId="Dragon" />
            <Dragon id="dragon-3" position={[-12, 0, 15]} nameId="Dragon" />
            {/* <BVHWeapon /> */}
                        <TeleportZone
                                position={[10, 0, 0]}
                                radius={2}
                                targetWorld="world1"
                                color={vec3(1.0, 0.2, 0.5)}
                                // Cambia la posición de destino para evitar caer sobre otro portal
                                target={[20, 2, 0]}
                                onTeleport={(worldId, targetPos) => {
                                    console.log('Teleport desde DragonDungeon:', worldId, targetPos);
                                    onTeleport(worldId, targetPos);
                                }}
                        />
            <ambientLight intensity={2} />

            <StaticCollider>
                {/* <RemoteBVHCharacters /> */}

                <group scale={2}>
                    <primitive object={scene} />
                </group>
            </StaticCollider>
            {/* <SSGI /> */}
        </>
    )
}