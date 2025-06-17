import { create } from 'zustand';

interface MagmaShaderState {
  colorA: string;
  colorB: string;
  scale: number;
  numero: number;
  timed: number;
  glows: number;
  clampMin: number;
  clampMax: number;
  patternScale: number;

  setColorA: (v: string) => void;
  setColorB: (v: string) => void;
  setScale: (v: number) => void;
  setNumero: (v: number) => void;
  setTimed: (v: number) => void;
  setGlows: (v: number) => void;
  setClampMin: (v: number) => void;
  setClampMax: (v: number) => void;
  setPatternScale: (v: number) => void;
}

export const useMagmaShaderStore = create<MagmaShaderState>((set) => ({
  colorA: '#ff2200',
  colorB: '#110000',
  scale: 1.75,
  numero: 0.5,
  timed: 0.2,
  glows: 10,
  clampMin: 0,
  clampMax: 1,
  patternScale: 2,

  setColorA: (v) => set({ colorA: v }),
  setColorB: (v) => set({ colorB: v }),
  setScale: (v) => set({ scale: v }),
  setNumero: (v) => set({ numero: v }),
  setTimed: (v) => set({ timed: v }),
  setGlows: (v) => set({ glows: v }),
  setClampMin: (v) => set({ clampMin: v }),
  setClampMax: (v) => set({ clampMax: v }),
  setPatternScale: (v) => set({ patternScale: v }),
}));