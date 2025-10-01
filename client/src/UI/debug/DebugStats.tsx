// components/PerfSampler.tsx
import { addAfterEffect, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { usePerfStore } from '../../store/PerfState'

declare global { interface Window { __perfSamplerActive?: boolean } }

export default function PerfSampler() {
  const { gl } = useThree()
  const set = usePerfStore((s) => s.set)

  // Evita doble suscripción (StrictMode / 2 samplers)
  useEffect(() => {
    if (window.__perfSamplerActive) {
      console.warn('[PerfSampler] ya hay un sampler activo; monta solo uno por <Canvas>.')
    }
    window.__perfSamplerActive = true
    return () => { window.__perfSamplerActive = false }
  }, [])

  // Ventana de 1s
  const secStart = useRef(performance.now())
  const lastNow = useRef(performance.now())
  const frames = useRef(0)
  const accFrameCalls = useRef(0) // sumatorio de frameCalls del último segundo

  // Fallback si tu three no tiene frameCalls:
  const prevCumulativeCalls = useRef(0)

  useEffect(() => { gl.info.autoReset = true }, [gl])

  useEffect(() => {
    const unsub = addAfterEffect(() => {
      const now = performance.now()
      const dt = now - lastNow.current
      lastNow.current = now
      if (dt <= 0 || dt > 1000) return

      const info = gl.info

      // ✅ draw calls del frame recién renderizado
      let callsThisFrame =
        (info.render as any).frameCalls ??  // three moderno
        Math.max(0, info.render.calls - prevCumulativeCalls.current) // fallback por diferencia
      prevCumulativeCalls.current = info.render.calls

      frames.current += 1
      accFrameCalls.current += callsThisFrame

      const elapsed = now - secStart.current
      if (elapsed >= 1000) {
        // Promedios en ventana real de 1s
        const fps = Math.round((frames.current * 1000) / elapsed)
        const callsPerSec = Math.round((accFrameCalls.current * 1000) / elapsed)
        const callsAvgPerFrame = Math.round(accFrameCalls.current / Math.max(1, frames.current))

        // Triángulos/lines/points: mejor como promedio por frame (estables)
        const triangles = Math.round(info.render.triangles / Math.max(1, 1)) // ya es del frame
        const lines = Math.round(info.render.lines / Math.max(1, 1))
        const points = Math.round(info.render.points / Math.max(1, 1))

        // @ts-ignore
        const programs = Array.isArray(info.programs) ? info.programs.length : 'N/A'
        const geometries = info.memory.geometries
        const textures = info.memory.textures

        set({
          fps,
          callsPerSec,              // ← draw calls / segundo (ventana 1s)
          callsPerFrame: callsAvgPerFrame, // ← draw calls promedio por frame (ventana 1s)
          triangles,
          lines,
          points,
          geometries,
          textures,
          programs,
        })

        // reset ventana
        secStart.current = now
        frames.current = 0
        accFrameCalls.current = 0
      }
    })
    return () => unsub()
  }, [gl, set])

  return null
}
