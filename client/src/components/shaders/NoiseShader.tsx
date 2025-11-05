import { useControls } from "leva";
import { useMemo } from "react";
import { positionLocal, vec4 } from "three/tsl";
import { MeshPhysicalNodeMaterial } from "three/webgpu";

type Props = {
    store?: any;
}
export default function NoiseShader({ store }: Props) {
    const controls = useControls('Noise Shader',

        {
            store
            ,
            colorA: { value: '#ff4500' },
            numeroTest: { value: 0, min: 0.1, max: 1}
        }
    )
    function NoiseEffect () {
        
    }
    const ShaderNodes = useMemo(() => {


        const colorNode = vec4(controls.numeroTest, 0, 0, 1);
        const positionNode = positionLocal
        positionLocal.y.mul(controls.numeroTest)
        return {
            colorNode,
            positionNode,
        };
    }, [controls.numeroTest])
    const materialKey = useMemo(() => Date.now(), [ShaderNodes])

    return (
        <mesh>
            <boxGeometry args={[1, 1, 1]} />
            {/* @ts-ignore */}
            <meshPhysicalNodeMaterial {...ShaderNodes} {...controls} key={materialKey}/>
        </mesh>
    )
}