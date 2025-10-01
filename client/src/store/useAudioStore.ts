import { create } from "zustand";
import { StepAudioHandle } from "../sounds/Walk";

interface AudioState {
  stepRef: React.RefObject<StepAudioHandle> | null;
  setStepRef: (ref: React.RefObject<StepAudioHandle>) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  stepRef: null,
  setStepRef: (ref) => set({ stepRef: ref }),
}));
