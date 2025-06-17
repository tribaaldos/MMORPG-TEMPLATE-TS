import { create } from 'zustand'
import { ReactNode } from 'react'

/**
 * Define un alias para los identificadores de popup.
 * Puedes sustituir `string` por un union type si tienes tipos concretos, 
 * por ejemplo: `type PopupType = 'inventory' | 'skills' | 'settings'`.
 */
type PopupType = string

/**
 * Estado y acciones de la store de popups.
 */
interface PopupState {
  /** Mapa de popups visibles */
  popups: Record<PopupType, ReactNode>
  /** Muestra un popup de un tipo dado */
  showPopup: (type: PopupType, component: ReactNode) => void
  /** Oculta el popup de un tipo dado */
  hidePopup: (type: PopupType) => void
}

export const usePopup = create<PopupState>((set) => ({
  popups: {},

  showPopup: (type, component) =>
    set((state) => ({
      popups: {
        ...state.popups,
        [type]: component,
      },
    })),

  hidePopup: (type) =>
    set((state) => {
      const { [type]: _, ...rest } = state.popups
      return { popups: rest }
    }),
}))
