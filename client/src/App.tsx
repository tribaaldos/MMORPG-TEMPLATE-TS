
import './App.css'

import { Route, Routes } from 'react-router-dom'
import ShaderVisualizer from './components/shaders/ShaderVisualizer'
import Experience from './Experience'
import { useControls } from 'leva'
import NameEntryScreen from './UI/components/name-entry/NameEntry'
import { useCharacterStore } from './store/useCharacterStore'
import ExperienceTest from './ExperienceTest'
import CADScene from './CAD-threejs/Scene'
function App() {

  const name = useCharacterStore((s) => s.name)


  return (
    <>
      <Routes>
        <Route path="/shader-visualizer" element={<ShaderVisualizer />} />
        <Route path="/shader-visualizer/:id" element={<ShaderVisualizer />} />
        <Route path="/" element={<Experience />} />
        <Route path="/cad-threejs" element={<CADScene />} />
        {/* <Route path="/" element={name ? <Experience /> : <NameEntryScreen />} /> */}
        {/* <Route path="/" element={name ? <ExperienceTest /> : <NameEntryScreen />} /> */}
      </Routes>
    </>
  )
}

export default App
