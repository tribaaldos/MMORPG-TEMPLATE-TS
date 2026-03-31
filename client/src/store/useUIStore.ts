import { create } from 'zustand'

interface UIState {
  isTextInputActive: boolean
  setTextInputActive: (active: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  isTextInputActive: false,
  setTextInputActive: (active) => set({ isTextInputActive: active }),
}))
