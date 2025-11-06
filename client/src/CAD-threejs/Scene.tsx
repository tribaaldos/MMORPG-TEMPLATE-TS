
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import './App.css'
import NewPolygonDrawer from './NewPolygonDraw'
import BuildingUI from './BuildingUI'
import BackGround from './BackGround'

export default function CADScene() {
  // color leva controls

  return (
    <>
      <BuildingUI />
      <Canvas camera={{ position: [0, 10, 10], fov: 45 }}>
        <ambientLight intensity={0.2}/>
        <pointLight position={[0, 5, 0]} intensity={5}/>
        <OrbitControls />
        <BackGround />
        {/* <gridHelper args={[100, 100]} /> */}
        {/* <PolygonDrawer/> */}
    <Environment preset="night" backgroundIntensity={0.2} background/>
        <NewPolygonDrawer />

      </Canvas>
    </>
  )
}
