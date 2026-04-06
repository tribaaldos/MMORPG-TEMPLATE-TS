// store/useCharacterStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Coins, toBronze } from '../UI/components/npcs/Currency';
// ES UN VECTOR 3 
type Position = [number, number, number];
type Rotation = [number, number, number, number];

interface CharacterState {
  // identidad y mundo
  name: string | null;
  setName: (name: string) => void;
  world: string | null;
  setWorld: (world: string) => void;

  // estado “runtime” (NO persistente)
  position: Position;
  rotation: Rotation;
  setPosition: (pos: Position) => void;
  setRotation: (rot: Rotation) => void;
  updateX: (x: number) => void;
  updateY: (y: number) => void;
  updateZ: (z: number) => void;

  rigidBodyRef: React.RefObject<any> | null;
  setRigidBodyRef: (ref: React.RefObject<any> | null) => void;

  // stats (sí persistentes)
  exp: number;
  level: number;
  maxHp: number;
  hp: number;
  mana: number;
  maxMana: number;
  critRate: number;
  strength: number;
  agility: number;
  intelligence: number;

  statPoints: number;

  getExpToLevel: (level: number) => number;
  checkLevelUp: () => void;
  gainExp: (amount: number) => void;
  spendStatPoint: (stat: 'strength' | 'agility' | 'intelligence' | 'critRate') => void;
  loadStats: (data: { level: number; exp: number; statPoints?: number; strength?: number; agility?: number; intelligence?: number; critRate?: number }) => void;

  // economía (sí persistente)
  gold: number;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  addCoins: (c: Coins) => void;
  spendCoins: (c: Coins) => boolean;
}

// ⚠️ OJO: solo persistimos lo estable (perfil, mundo, stats, oro).
export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      // identidad y mundo
      name: null,
      setName: (name) => set({ name }),
      world: 'world1',
      setWorld: (world) => set({ world }),

      // runtime: NO persistir (se actualiza por frame)
      position: [0, 1, 0],
      rotation: [0, 0, 0, 1],

      setPosition: (pos) =>
        set((s) => {
          const p = s.position;
          // Evita set si no hay cambio (previene renders inútiles cuando estás parado)
          if (p[0] === pos[0] && p[1] === pos[1] && p[2] === pos[2]) return {};
          return { position: pos };
        }),

      setRotation: (rot) =>
        set((s) => {
          const r = s.rotation;
          if (r[0] === rot[0] && r[1] === rot[1] && r[2] === rot[2] && r[3] === rot[3]) return {};
          return { rotation: rot };
        }),

      updateX: (x) =>
        set((state) => ({ position: [x, state.position[1], state.position[2]] })),
      updateY: (y) =>
        set((state) => ({ position: [state.position[0], y, state.position[2]] })),
      updateZ: (z) =>
        set((state) => ({ position: [state.position[0], state.position[1], z] })),

      rigidBodyRef: null,
      setRigidBodyRef: (ref) => set({ rigidBodyRef: ref }),

      // stats
      statPoints: 0,
      exp: 0,
      level: 1,
      maxHp: 100,
      hp: 100,
      mana: 100,
      maxMana: 100,
      critRate: 15,
      strength: 10,
      agility: 10,
      intelligence: 10,

      getExpToLevel: (level) => level * 100,

      checkLevelUp: () => {
        const { exp, level, getExpToLevel } = get();
        const expNeeded = getExpToLevel(level);
        if (exp >= expNeeded) {
          set((s) => ({
            level: s.level + 1,
            exp: s.exp - expNeeded,
            statPoints: s.statPoints + 3,
            maxHp: s.maxHp + 10,
            hp: Math.min(s.hp + 10, s.maxHp + 10),
            mana: Math.min(s.mana + 10, s.maxMana + 10),
            maxMana: s.maxMana + 10,
          }));
          get().checkLevelUp();
        }
      },

      gainExp: (amount) => {
        set((s) => ({ exp: s.exp + Math.max(0, amount) }));
        get().checkLevelUp();
      },

      spendStatPoint: (stat) => {
        const { statPoints } = get();
        if (statPoints <= 0) return;
        set((s) => ({ statPoints: s.statPoints - 1, [stat]: s[stat] + 1 }));
      },

      loadStats: ({ level, exp, statPoints, strength, agility, intelligence, critRate }) => {
        set({
          level,
          exp,
          ...(typeof statPoints === 'number' && { statPoints }),
          ...(typeof strength === 'number' && { strength }),
          ...(typeof agility === 'number' && { agility }),
          ...(typeof intelligence === 'number' && { intelligence }),
          ...(typeof critRate === 'number' && { critRate }),
        });
      },

      // economía
      gold: 9999999,
      addGold: (amt) => set((s) => ({ gold: s.gold + Math.max(0, amt) })),
      spendGold: (amt) => {
        const g = get().gold;
        if (amt <= 0) return true;
        if (g < amt) return false;
        set({ gold: g - amt });
        return true;
      },
      addCoins: (c) => set((s) => ({ gold: s.gold + toBronze(c) })),
      spendCoins: (c) => {
        const cost = toBronze(c);
        return get().spendGold(cost);
      },
    }),
    {
      name: 'character-storage',
      storage: createJSONStorage(() => sessionStorage),
      // Solo persistimos lo “estable”
      partialize: (state) => ({
        world: state.world,
        level: state.level,
        exp: state.exp,
        statPoints: state.statPoints,
        gold: state.gold,
        maxHp: state.maxHp,
        hp: state.hp,
        mana: state.mana,
        maxMana: state.maxMana,
        critRate: state.critRate,
        strength: state.strength,
        agility: state.agility,
        intelligence: state.intelligence,
        // ⛔️ NO position/rotation/rigidBodyRef aquí
      }),
    }
  )
);
