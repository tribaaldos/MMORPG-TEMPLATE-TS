// wolfStore.ts
import { create } from "zustand";

type WolfState = {
  position: [number, number, number];
  quaternion: [number, number, number, number];
  animation: string;
  setWolf: (data: {
    position: [number, number, number];
    quaternion: [number, number, number, number];
    animation: string;
  }) => void;
};

export const useWolfStore = create<WolfState>((set) => ({
  position: [0, 0, 0],
  quaternion: [0, 0, 0, 1],
  animation: "Take 001",
  setWolf: (data) => set(data),
}));
