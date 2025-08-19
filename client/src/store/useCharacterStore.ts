// ✅ useCharacterStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Position = [number, number, number];
type Rotation = [number, number, number, number]; // Quaternion: x, y, z, w

interface CharacterState {
    name: string | null
    setName: (name: string) => void;
    // position and rotation
    position: Position;
    rotation: Rotation;

    setPosition: (pos: Position) => void;
    setRotation: (rot: Rotation) => void;

    updateX: (x: number) => void;
    updateY: (y: number) => void;
    updateZ: (z: number) => void;

    // rigidbody ref
    rigidBodyRef: React.RefObject<any> | null;
    setRigidBodyRef: (ref: React.RefObject<any> | null) => void;

    // stats
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

    getExpToLevel: (level: number) => number;
    checkLevelUp: () => void;
    gainExp: (amount: number) => void;
}

// Solo persistimos el name
export const useCharacterStore = create<CharacterState>()(
    persist(
        (set, get) => ({
            name: null,
            setName: (name) => set({ name }),

            position: [0, 1, 0],
            rotation: [0, 0, 0, 1],
            setPosition: (pos) => set({ position: pos }),
            setRotation: (rot) => set({ rotation: rot }),

            updateX: (x) =>
                set((state) => ({
                    position: [x, state.position[1], state.position[2]],
                })),
            updateY: (y) =>
                set((state) => ({
                    position: [state.position[0], y, state.position[2]],
                })),
            updateZ: (z) =>
                set((state) => ({
                    position: [state.position[0], state.position[1], z],
                })),

            rigidBodyRef: null,
            setRigidBodyRef: (ref) => set({ rigidBodyRef: ref }),

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
                    set({
                        level: level + 1,
                        exp: exp - expNeeded,
                        maxHp: get().maxHp + 10,
                        hp: get().hp + 10,
                        mana: get().mana + 10,
                        maxMana: get().maxMana + 10,
                    });
                    console.log(`Level up! New level: ${level + 1}`);
                    get().checkLevelUp();
                }
            },

            gainExp: (amount) => {
                const newExp = get().exp + amount;
                set({ exp: newExp });
                console.log(`Gained ${amount} exp! Total: ${newExp}`);
                get().checkLevelUp();
            },
        }),
        {
            name: 'character-storage', // clave de localStorage
            partialize: (state) => ({
                name: state.name,
                position: state.position,
            }),
        }
    )
);
