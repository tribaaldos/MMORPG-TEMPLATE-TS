import { create } from 'zustand';

interface BasicShaderState {
  intensidad: number;
  setIntensidad: (value: number) => void;

  velocidad: number;
  setVelocidad: (value: number) => void;

  colorPrincipal: string;
  setColorPrincipal: (value: string) => void;
}

export const useBasicShaderStore = create<BasicShaderState>((set) => ({
  intensidad: 0.5, // será cambiado desde el shader
  setIntensidad: (value) => set({ intensidad: value }),

  velocidad: 0.5,
  setVelocidad: (value) => set({ velocidad: value }),

  colorPrincipal: '#ffffff',
  setColorPrincipal: (value) => set({ colorPrincipal: value }),
}));