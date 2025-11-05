import { useControls, useStoreContext } from 'leva';
import { useMemo, } from 'react'
import * as THREE from 'three'

import {
    Fn, vec3, float,
    output, positionLocal, vec4,
    time,
    abs,
    triNoise3D,
} from 'three/tsl'
type Props = {
    store?: any
}

export default function MagmaShader({ store }: Props) {
    const controls = useControls('Magma Shader',

        {
            store
            ,
            colorA: { value: '#ff4500' },
            numero: { value: 1, min: 0.1, max: 100}
        }
    )
    function PracticeNodeMaterial() {

        // vertex shader

        const pos = positionLocal;
        // const uvPos = uv();
        // const speed = time.mul(1.0);


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
            const glow = abs(noise.sub(0.5).mul(2.0)).pow(controls.numero).clamp(0.0, 50.0).mul(1);
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
        <mesh scale={0.25} position={[0, 0, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            frustumCulled={false} castShadow receiveShadow>
            <sphereGeometry args={[2, 64, 64]} />

            <PracticeNodeMaterial key={materialKey} />
        </mesh>
    )
}
