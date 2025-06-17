import React, { useMemo, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCharacterStore } from '../../store/Character'
import { useControls } from 'leva'

export default function TeleportZone({
    position = [0, 1, 0],
    target = [0, 1, 0],
    radius = 0,
    autoRotate = true
}) {
    const group = useRef<THREE.Group>(null)
    const { nodes, materials, animations } = useGLTF('/environment/portal.glb')
    const { actions } = useAnimations(animations, group)

    const targetVec = new THREE.Vector3(...target)
    const detectionCenter = new THREE.Vector3(...position)

    useFrame(() => {
        const playerPos = useCharacterStore.getState().position
        const body = useCharacterStore.getState().rigidBodyRef?.current
        if (!body) return

        const distance = new THREE.Vector3(...playerPos).distanceTo(detectionCenter)

        if (distance < radius) {
            body.setTranslation(targetVec, true)
        }

        // Animación opcional del portal (gira sobre sí mismo)
        // if (autoRotate && group.current) {
        //   group.current.rotation.y += 0.01
        // }
    })
    const material = new THREE.MeshStandardMaterial()

    return (
        <>
            {/* <group ref={group} position={position} dispose={null}>
                <group name="Sketchfab_Scene">
                    <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
                        <group name="root">
                            <group name="GLTF_SceneRootNode" rotation={[Math.PI / 2, 0, 0]}>
                                <group name="Podest_0">
                                    <mesh
                                        name="Object_4"
                                        castShadow
                                        receiveShadow
                                        geometry={nodes.Object_4.geometry}
                                        //   material={materials.Podest_BAKED}
                                        material={material}
                                    />
                                </group>
                                <group>
                                </group>
                                <group name="Armature_3" position={[0, 1.538, 0]}>
                                    <group name="Bone_2" position={[0, -0.5, 0]}>
                                        <group name="Port_1" position={[0, -1.073, 0]}>
                                            <mesh
                                                name="Object_8"
                                                castShadow
                                                receiveShadow
                                                geometry={nodes.Object_8.geometry}
                                                //   material={materials.Port_BAKED}
                                                material={material}
                                            />
                                        </group>
                                    </group>
                                </group>
                            </group>
                        </group>
                    </group>
                </group>
            </group> */}
            {/* <TeleportShader /> */}
        </>

    )
}

useGLTF.preload('/environment/portal.glb')

import {
    Fn, cameraProjectionMatrix, color, vec3, float, fract, modelViewMatrix,
    output, positionLocal, remap, timerGlobal, uniform, uv, vec2, vec4,
    mix, mul, time,
    smoothstep,
    oscSine,
    sin, length,
    add, abs, max, cos,
    varying, mod, step, floor,
    rotateUV,
    triNoise3D,
    
    hash,
} from 'three/tsl'

function TeleportShader() {
    function PracticeNodeMaterial() {

        // vertex shader

        const pos = positionLocal;
        const uvPos = uv();
        const speed = time.mul(1.0);


        const displacedPos = vec3(pos.x.mul(1.0), pos.y, pos.z);

        // fragment shader
        const colorNode = Fn(() => {


            const animatedPos = pos.add(vec3(time.mul(0.1), 0, time.mul(0.1)));
            const noise = triNoise3D(
                // animatedPos, 
                animatedPos, 
                animatedPos, 
                
                animatedPos,
            );
            const glow = abs(noise.sub(0.5).mul(2.0)).pow(3).clamp(0.0, 50.0).mul(1);
            const lava = vec3(1.0, 0.3, 0.0);
            const roca = vec3(1, 0., 0.01);
            const color = lava.mul(glow).add(roca.mul(float(1.0).sub(glow)))
            return output.assign(vec4(color, float(1.0)));
        })();

        return (
            // @ts-ignore
            <meshStandardNodeMaterial
                positionNode={displacedPos}
                colorNode={colorNode}
                emissiveNode={colorNode}
                side={THREE.DoubleSide}
                wireframe={false}
            />
        );
    }
    const materialKey = useMemo(() => Date.now(), [PracticeNodeMaterial])

    return (
        <mesh scale={1} position={[2, 2, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            frustumCulled={false} castShadow receiveShadow>
            <sphereGeometry args={[2, 64, 64]} />

            <PracticeNodeMaterial key={materialKey} />
        </mesh>
    )
}




