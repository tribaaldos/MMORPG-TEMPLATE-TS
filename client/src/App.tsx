
import './App.css'

import { Route, Routes } from 'react-router-dom'
import ShaderVisualizer from './components/shaders/ShaderVisualizer'
import Experience from './Experience'
import { useControls } from 'leva'
function App() {


  return (
    <>
      <Routes>
        <Route path="/shader-visualizer" element={<ShaderVisualizer />} />
        <Route path="/shader-visualizer/:id" element={<ShaderVisualizer />} />
        <Route path="/" element={ <Experience /> } />
      </Routes>
    </>
  )
}

export default App
