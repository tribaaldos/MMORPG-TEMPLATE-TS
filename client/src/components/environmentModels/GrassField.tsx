import * as THREE from 'three';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import {
    color as tslColor,
    mix,
    uniform,
    attribute,
    normalLocal,
    positionLocal,
    mul,
    pow,
    vec3,
    add,
    vec4,
    color,
    distance, time,
    sin,
    triNoise3D,

} from 'three/tsl';
import { useControls } from 'leva';
import { Perf } from 'r3f-perf';
import { useThree } from '@react-three/fiber';

export default function GrassField() {
    const meshRef = useRef<THREE.InstancedMesh>(null!);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const up = new THREE.Vector3(0, 1, 0);

    const { nodes } = useGLTF('/grassTest.glb') as any;
    const terrainGeometry = nodes?.terreno?.geometry;
    const [grassEdge, setGrassEdge] = useState(0)
    const [grassTriangle, setGrassTriangle] = useState(0)
    const [baseColor, setBaseColor] = useState('#2a5c1c');
    const [tipColor, setTipColor] = useState('#80cc66');

    const sampled = useMemo(() => {
        if (!terrainGeometry || !terrainGeometry.index) return [];

        const posAttr = terrainGeometry.attributes.position;
        const normAttr = terrainGeometry.attributes.normal;
        const indexAttr = terrainGeometry.index;

        const result: { position: THREE.Vector3; normal: THREE.Vector3 }[] = [];

        const vA = new THREE.Vector3();
        const vB = new THREE.Vector3();
        const vC = new THREE.Vector3();
        const nA = new THREE.Vector3();
        const nB = new THREE.Vector3();
        const nC = new THREE.Vector3();
        const tempPos = new THREE.Vector3();
        const tempNormal = new THREE.Vector3();

        for (let i = 0; i < posAttr.count; i++) {
            const position = new THREE.Vector3(
                posAttr.getX(i),
                posAttr.getY(i),
                posAttr.getZ(i)
            );
            const normal = new THREE.Vector3(
                normAttr.getX(i),
                normAttr.getY(i),
                normAttr.getZ(i)
            );
            position.add(normal.clone().multiplyScalar(0.05));
            result.push({ position, normal });
        }

        function randomBarycentric(): [number, number, number] {
            let u = Math.random();
            let v = Math.random();
            if (u + v > 1) {
                u = 1 - u;
                v = 1 - v;
            }
            const w = 1 - u - v;
            return [u, v, w];
        }

        for (let i = 0; i < indexAttr.count; i += 3) {
            const a = indexAttr.getX(i);
            const b = indexAttr.getX(i + 1);
            const c = indexAttr.getX(i + 2);

            vA.set(posAttr.getX(a), posAttr.getY(a), posAttr.getZ(a));
            vB.set(posAttr.getX(b), posAttr.getY(b), posAttr.getZ(b));
            vC.set(posAttr.getX(c), posAttr.getY(c), posAttr.getZ(c));

            nA.set(normAttr.getX(a), normAttr.getY(a), normAttr.getZ(a));
            nB.set(normAttr.getX(b), normAttr.getY(b), normAttr.getZ(b));
            nC.set(normAttr.getX(c), normAttr.getY(c), normAttr.getZ(c));

            for (let k = 1; k <= grassEdge; k++) {
                const t = k / (grassEdge + 1);
                const addPoint = (va: THREE.Vector3, vb: THREE.Vector3, na: THREE.Vector3, nb: THREE.Vector3) => {
                    tempPos.copy(va).lerp(vb, t);
                    tempNormal.copy(na).lerp(nb, t).normalize();
                    result.push({
                        position: tempPos.clone().add(tempNormal.clone().multiplyScalar(0.05)),
                        normal: tempNormal.clone()
                    });
                };
                addPoint(vA, vB, nA, nB);
                addPoint(vB, vC, nB, nC);
                addPoint(vC, vA, nC, nA);
            }

            for (let j = 0; j < grassTriangle; j++) {
                const [u, v, w] = randomBarycentric();
                tempPos.set(0, 0, 0)
                    .add(vA.clone().multiplyScalar(u))
                    .add(vB.clone().multiplyScalar(v))
                    .add(vC.clone().multiplyScalar(w));
                tempNormal.set(0, 0, 0)
                    .add(nA.clone().multiplyScalar(u))
                    .add(nB.clone().multiplyScalar(v))
                    .add(nC.clone().multiplyScalar(w))
                    .normalize();
                result.push({
                    position: tempPos.clone().add(tempNormal.clone().multiplyScalar(0.05)),
                    normal: tempNormal.clone()
                });
            }
        }

        return result;
    }, [terrainGeometry, grassEdge, grassTriangle]);


    const randomYRotations = useMemo(() => {
        // return sampled.map(() => Math.random() * Math.PI );
        return sampled.map(()=> Math.random())
    }, [sampled]);



    useControls('Grass Colors', {
        baseColor: { value: baseColor, onChange: (v) => setBaseColor(v) },
        tipColor: { value: tipColor, onChange: (v) => setTipColor(v) },
        grassEdge: { value: grassEdge, min: 0, max: 10, onChange: (v) => setGrassEdge(v) },
        grassTriangle: { value: grassTriangle, min: 0, max: 10, onChange: (v) => setGrassTriangle(v) },


    });
    const materialProps = useMemo(() => {
        const uvY = attribute('uv', 'vec2').y;

        // movimiento base en eje X
        
        // noise en posición local
        const noise = triNoise3D(mul(positionLocal, 1.0), 1.0, 1.0); // escala 5, frecuencia 1
        // const wave = sin(add(mul(time, 2.0), mul(uvY, Math.PI )));
        const wave = sin(add(mul(time, 2.0), uvY));

        // combinamos ambos: viento base + variación local
        const windX = mul(add(wave, mul(noise, 0.5)), mul(uvY, 0.04)); // 0.5 = intensidad ruido

        const globalWind = vec3(windX, 0.0, 0.0);

        const curveX = mul(pow(uvY, 2.0), 0.1);
        const positionNode = add(
            vec3(add(positionLocal.x, curveX), positionLocal.y, positionLocal.z),
            globalWind
        );

        // color 
        const colorBase = uniform(tslColor(baseColor));
        const colorTop = uniform(tslColor(tipColor));
        const distanceMixColor = pow(uvY, 2.0);
        const interpolatedColor = mix(colorBase, colorTop, distanceMixColor);
        return {
            colorNode: interpolatedColor,
            // colorNode: uniform(tslColor('#228822')), // verde uniforme
            normalNode: normalLocal,
            positionNode,
        };
    }, [baseColor, tipColor, grassEdge, grassTriangle]);

    const triangleGeometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry();

        const height = 0.3;
        const baseWidth = 0.1;
        const segments = 6;

        const positions: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];

        for (let i = 0; i <= segments; i++) {
            const y = (i / segments) * height;
            const widthFactor = 1 - i / segments; // más estrecho arriba
            const halfWidth = (baseWidth * widthFactor) / 2;

            // izquierda y derecha
            positions.push(-halfWidth, y, 0);
            positions.push(halfWidth, y, 0);

            uvs.push(0, i / segments);
            uvs.push(1, i / segments);

            if (i < segments) {
                const base = i * 2;
                indices.push(
                    base, base + 1, base + 2,
                    base + 1, base + 3, base + 2
                );
            }
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        return geometry;
    }, []);

    const maxDistance = 15;

    useEffect(() => {
        sampled.forEach(({ position, normal }, i) => {
            const alignQuat = new THREE.Quaternion().setFromUnitVectors(up, normal.clone().normalize());
            const yRot1 = new THREE.Quaternion().setFromAxisAngle(up, randomYRotations[i]);
            // const yRot2 = new THREE.Quaternion().setFromAxisAngle(up, randomYRotations[i] + Math.PI / 2);
            const yRot2 = new THREE.Quaternion().setFromAxisAngle(up, randomYRotations[i]);

            dummy.position.copy(position);
            dummy.scale.set(4, 2, 4);

            // primera brizna
            dummy.quaternion.copy(alignQuat).multiply(yRot1);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i * 2, dummy.matrix);

            // segunda brizna cruzada
            dummy.quaternion.copy(alignQuat).multiply(yRot2);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i * 2 +1  , dummy.matrix);
        });
        meshRef.current.count = sampled.length * 2; // importante
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [sampled, randomYRotations]);

    const materialKey = useMemo(() => Date.now(), [baseColor, tipColor, grassEdge, grassTriangle]);
    const { gl } = useThree();


    return (
        <>
            <group position={[0, 0.01, 0]} scale={1}>
                {terrainGeometry && (
                    <mesh geometry={terrainGeometry} receiveShadow >
                        <meshStandardMaterial color="darkgreen" />
                    </mesh>
                )}
                <instancedMesh
                    ref={meshRef}
                    args={[triangleGeometry, undefined, sampled.length * 2]}
                    frustumCulled={false}

                >
                    {/* @ts-ignore */}
                    <meshStandardNodeMaterial
                        key={materialKey}
                        {...materialProps}
                        side={THREE.DoubleSide}
                        wireframe={false}
                    />
                </instancedMesh>
            </group>
        </>
    );
}

useGLTF.preload('/grassTest.glb');