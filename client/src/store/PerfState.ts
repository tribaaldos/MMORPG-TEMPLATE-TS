import { create } from 'zustand'

type PerfState = {
  fps: number
  callsPerSec: number
  callsPerFrame: number
  triangles: number
  lines: number
  points: number
  geometries: number
  textures: number
  programs: number | 'N/A'
  set: (s: Partial<Omit<PerfState, 'set'>>) => void
}

export const usePerfStore = create<PerfState>((set) => ({
  fps: 0,
  callsPerSec: 0,
  callsPerFrame: 0,
  triangles: 0,
  lines: 0,
  points: 0,
  geometries: 0,
  textures: 0,
  programs: 'N/A',
  set: (s) => set(s),
}))
