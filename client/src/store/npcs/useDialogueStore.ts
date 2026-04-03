import { create } from 'zustand'
import { useShopStore } from './useShop'

export interface DialogueChoice {
  label: string
  next: string | 'close' | 'shop'
}

export interface DialogueNode {
  text: string
  choices: DialogueChoice[]
}

export type DialogueTree = Record<string, DialogueNode>

// ————— Diálogo del herrero Kael —————
export const blacksmithDialogue: DialogueTree = {
  start: {
    text: '¡Saludos, aventurero! Soy Kael, el herrero de Thornhaven.\n\nLlevo décadas forjando el mejor equipo para los valientes que se adentran en estas tierras. Espadas, escudos, armaduras... si tiene nombre, seguramente lo he forjado yo.\n\n¿En qué puedo servirte?',
    choices: [
      { label: '⚔️  Cuéntame sobre los portales', next: 'portals' },
      { label: '🛒  Ver tus mercancías', next: 'shop' },
      { label: '👋  Hasta luego, Kael', next: 'close' },
    ],
  },
  portals: {
    text: 'En la plaza central hay tres portales que comunican Thornhaven con otros reinos:\n\n🔴  Portal ROJO → Cavernas del Dragón. El wyrm ancestral Kaeltharion guarda allí un tesoro colosal. Su fuego puede fundir hasta el acero más puro. No vayas sin equipo de primera.\n\n🔵  Portal AZUL → Ciudadela de Corona de Hielo. Un señor no-muerto comanda legiones de esqueletos y constructos de hielo. El frío te carcomera antes de que llegues al trono.\n\n🌀  Portal ARCANO → Una anomalía mágica al oeste de la plaza. Nadie sabe exactamente qué hay al otro lado. Los que regresan... cambian.',
    choices: [
      { label: '🛡️  ¿Qué equipo me recomiendas?', next: 'gear' },
      { label: '🛒  Ver tus mercancías', next: 'shop' },
      { label: '👋  Gracias, adiós', next: 'close' },
    ],
  },
  gear: {
    text: 'Buena pregunta. Escucha bien:\n\nPara las Cavernas del Dragón, las Dragon Boots de mi tienda son imprescindibles — forjadas con escamas de dragón menor, resisten el calor extremo. Combínalas con el FireWeapon para máximo daño en combate.\n\nPara la Ciudadela de Hielo, el Shred Shield es tu mejor aliado. Los no-muertos atacan en oleadas y necesitas absorber golpes. Los Iron Gloves también añaden una defensa sólida.\n\nPara el portal arcano... trae todo lo que tengas. Allí las reglas cambian.',
    choices: [
      { label: '🛒  Ver tus mercancías', next: 'shop' },
      { label: '👋  Gracias por el consejo', next: 'close' },
    ],
  },
}

// ————— Store —————
interface DialogueState {
  isOpen: boolean
  npcName: string
  tree: DialogueTree
  currentNodeId: string
  openDialogue: (npcName: string, tree: DialogueTree, startNode?: string) => void
  closeDialogue: () => void
  choose: (next: string) => void
}

export const useDialogueStore = create<DialogueState>((set, get) => ({
  isOpen: false,
  npcName: '',
  tree: {},
  currentNodeId: 'start',

  openDialogue: (npcName, tree, startNode = 'start') => {
    set({ isOpen: true, npcName, tree, currentNodeId: startNode })
  },

  closeDialogue: () => set({ isOpen: false }),

  choose: (next) => {
    if (next === 'close') {
      set({ isOpen: false })
      return
    }
    if (next === 'shop') {
      set({ isOpen: false })
      // Abre el shop después de cerrar el diálogo
      const { openShop } = useShopStore.getState()
      // Importar los items del shop sería circular, así que emitimos un evento custom
      window.dispatchEvent(new CustomEvent('open-blacksmith-shop'))
      return
    }
    const node = get().tree[next]
    if (node) set({ currentNodeId: next })
  },
}))
