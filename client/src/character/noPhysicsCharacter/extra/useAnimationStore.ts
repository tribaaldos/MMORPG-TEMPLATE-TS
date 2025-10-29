import { create } from "zustand";
import type { CharacterAnimationStatus } from "..";

export interface AnimationStoreState {
  animationStatus: CharacterAnimationStatus;
  setAnimationStatus: (status: CharacterAnimationStatus) => void;

  // 🔥 NUEVO: animación temporal (para habilidades)
  tempAnimation: CharacterAnimationStatus | null;
  setTempAnimation: (status: CharacterAnimationStatus, duration?: number) => void;
  clearTempAnimation: () => void;
}

export const useAnimationStore = create<AnimationStoreState>((set) => ({
  animationStatus: "IDLE",
  setAnimationStatus: (status) => set({ animationStatus: status }),

  // 🔥 NUEVO: control de animaciones temporales (habilidades)
  tempAnimation: null,
  setTempAnimation: (status, duration = 600) => {
    set({ tempAnimation: status });
    setTimeout(() => set({ tempAnimation: null }), duration);
  },
  clearTempAnimation: () => set({ tempAnimation: null }),
}));
