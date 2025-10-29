import { useEffect } from "react"
import { useThree } from "@react-three/fiber"
import {
  EffectComposer,
  RenderPass,
  EffectPass,
} from "postprocessing"

import { SSGIEffect } from "realism-effects"
export default function SSGI() {
  const { gl, scene, camera, size } = useThree()

  useEffect(() => {
    const composer = new EffectComposer(gl)
    composer.setSize(size.width, size.height)

    // Render base
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    // SSGI effect
    const ssgi = new SSGIEffect(scene, camera, {
      distance: 10,          // distancia de muestreo
      thickness: 5,          // evita fugas de luz
      steps: 16,             // más pasos = más detalle
      refineSteps: 3,
      denoiseIterations: 2,
      denoiseKernel: 2,
      resolutionScale: 0.5,  // baja resolución = mejor rendimiento
      intensity: 1.0,        // fuerza de la iluminación
    })

    const ssgiPass = new EffectPass(camera, ssgi)
    composer.addPass(ssgiPass)

    // reemplaza el render loop por el composer
    const oldRender = gl.render
    gl.setAnimationLoop(() => {
      composer.render()
    })

    return () => {
      gl.setAnimationLoop(null)
      gl.render = oldRender
      composer.dispose()
    }
  }, [gl, scene, camera, size])

  return null
}
