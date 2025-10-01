// wolfStore.ts
import { create } from "zustand";

type SpiderState = {
  position: [number, number, number];
  quaternion: [number, number, number, number];
  animation: string;
  setSpider: (data: {
    position: [number, number, number];
    quaternion: [number, number, number, number];
    animation: string;
  }) => void;
};

export const useSpiderStore = create<SpiderState>((set) => ({
  position: [0, 0, 0],
  quaternion: [0, 0, 0, 1],
  animation: "Spider_Idle",
  setSpider: (data) => set(data),
}));
