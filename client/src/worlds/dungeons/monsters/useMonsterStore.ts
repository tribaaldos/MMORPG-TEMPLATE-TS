// store/useMonsterStore.ts
import { create } from "zustand";
import * as THREE from "three";

export interface MonsterData {
    id: string;
    kind: string; // "wolf" | "dragon" | "skeleton"
    name: string;
    level: number;
    position: THREE.Vector3;
    quaternion: THREE.Quaternion;
    animation: string;
    hp: number;
    maxHp: number;
    aggro: boolean;
}

interface MonsterState {
    monsters: Record<string, MonsterData>;
    spawn: (monster: MonsterData) => void;
    update: (id: string, data: Partial<MonsterData>) => void;
    damage: (id: string, dmg: number) => void;
}

export const useMonsterStore = create<MonsterState>((set) => ({
    monsters: {},
    spawn: (monster) =>
        set((state) => ({
            monsters: {
                ...state.monsters,
                [monster.id]: monster,
            },
        })),
    update: (id, data) =>
        set((state) => {
            const m = state.monsters[id];
            if (!m) return state;
            return {
                monsters: {
                    ...state.monsters,
                    [id]: { ...m, ...data },
                },
            };
        }),
    damage: (id, dmg) =>
        set((state) => {
            const m = state.monsters[id];
            if (!m) return state;
            const newHp = Math.max(0, m.hp - dmg);
            return {
                monsters: {
                    ...state.monsters,
                    [id]: { ...m, hp: newHp, aggro: newHp < m.maxHp },
                },
            };
        }),
}));
