import { useFrame, useThree } from "@react-three/fiber"
import { usePerfStore } from "../store/PerfState"
import * as THREE from "three"

let lastTime = performance.now()
let frames = 0

export function PerfTracker() {
  const set = usePerfStore((s) => s.set)
  const { gl } = useThree()

  useFrame(() => {
    frames++
    const now = performance.now()

    if (now - lastTime >= 1000) {
      const fps = (frames * 1000) / (now - lastTime)
      set({ fps })
      frames = 0
      lastTime = now
    }

    // Detecta si es WebGL o WebGPU
    if ((gl as any).info) {
      const info = (gl as THREE.WebGLRenderer).info
      set({
        callsPerFrame: info.render.calls,
        triangles: info.render.triangles,
        lines: info.render.lines,
        points: info.render.points,
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        programs: info.programs?.length ?? "N/A",
      })
    } else {
      // En WebGPU solo dejamos FPS
      set({
        callsPerFrame: 0,
        triangles: null,
        lines: null,
        points: null,
        geometries: null,
        textures: null,
        programs: "N/A",
      })
    }
  })

  return null
}
