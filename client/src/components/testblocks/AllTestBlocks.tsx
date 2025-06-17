import Fountain from "../environmentModels/Fountain";
import MagmaShader from "../shaders/MagmaShader";
import StarterShader from "../shaders/StarterShader";
import GrassOnSphere from "../shaders/grass/GrassOnSphere";
import InfiniteGrassGrid from "../shaders/grass/InfiniteGrass";
import WaterShader from "../shaders/greenPortal/GreenPortalShader";
import { Rocks } from "./Rocks";
import StepInBlock from "./StepInBlock";
import TeleportZone from "./Teleport";
import { Tree1 } from "./Tree";
import { Tree2 } from "./Tree2";

export default function AllTestBlocks() {
    return (
        <>
            {/* <WallNumberOne position={[0,2, 0]} args={[5, 5, 2]}/>
        <WallNumberOne position={[0,0, 0]} args={[10, 0.2, 10]}/>
        <WallNumberOne position={[2,0.5, 0]} args={[10, 0.2, 10]}/>
        <WallNumberOne position={[4,1, 0]} args={[10, 0.2, 10]}/>
        <WallNumberOne position={[6,1.5, 0]} args={[10, 0.2, 10]}/> */}
            {/* <Tree1 />
            <Rocks />
            <Tree2 /> */}
            {/* <GrassFloor /> */}
            {/* <TornadoShader /> */}
            {/* <StepInBlock position={[10, 2, 0]} /> */}
            <TeleportZone target={[0, 25, 0]} />
            <Fountain />
            {/* <MagmaShader /> */}
            {/* <WaterShader scaleProp={.25} position={[0, 2, 0]} /> */}
            {/* <StarterShader
                scaleProp={0.5}
                position={[4, 2, 0]}
                numero={0.63}
                timed={0.38}
                glows={4.46}
                clampMin={0.07}
                clampMax={0.43999999999999995}
                colorA="#ef7171"
                colorB="#4e1111"
            />
            <StarterShader
                scaleProp={0.5}
                position={[0, 2, 0]}
                numero={0.5}
                timed={0.2}
                glows={10}
                clampMin={0}
                clampMax={1}
                colorA="#00ff19"
                colorB="#131c24"
            /> */}
        {/* <GrassOnSphere /> */}
        <InfiniteGrassGrid />
            {/* <WaterShader
                position={[0, 0.5, 4]}
                geometry={<planeGeometry args={[100, 100, 1]} />}
                scaleProp={1}
                numero={0.5}
                timed={0.1}
                glows={3.9399999999999995}
                clampMin={0.01}
                clampMax={0.76}
                colorA="#8be9ff"
                colorB="#002244"
            /> */}
        </>
    )
}