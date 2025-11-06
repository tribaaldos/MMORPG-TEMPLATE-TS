import { create } from 'zustand'
import * as THREE from 'three'

interface BuildingState {
    points: THREE.Vector3[]
    isDrawing: boolean
    isClosed: boolean
    height: number | null
    colorLine: string
    colorExtrude: string
    // acciones
    addPoint: (p: THREE.Vector3) => void
    setPoints: (pts: THREE.Vector3[]) => void
    reset: () => void
    setIsDrawing: (v: boolean) => void
    setHeight: (h: number) => void
    setIsClosed: (v: boolean) => void
    setColorLine: (c: string) => void
    setColorExtrude: (c: string) => void
}

export const useBuildingStore = create<BuildingState>((set, get) => ({
    points: [],
    isDrawing: false,
    isClosed: false,
    height: null,
    colorLine: 'red',
    colorExtrude: 'blue',

    addPoint: (p) => {
        const pts = get().points
        if (get().isClosed) return
        // cerrar polígono si está cerca del primero
        if (pts.length >= 3 && p.distanceTo(pts[0]) < 0.5) {
            set({ isClosed: true })
            return
        }
        set({ points: [...pts, p] })
    },
    setColorLine: (c) => set({ colorLine: c }),
    setColorExtrude: (c) => set({ colorExtrude: c }),
    setPoints: (pts) => set({ points: pts }),
    setIsDrawing: (v) => set({ isDrawing: v }),
    setHeight: (h) => set({ height: h }),
    setIsClosed: (v) => set({ isClosed: v }),
    reset: () => set({ points: [], isClosed: false, height: null, isDrawing: false }),
}))
