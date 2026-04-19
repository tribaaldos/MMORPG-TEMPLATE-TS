// stores/useAbilityStore.ts
import { create } from "zustand";
import * as THREE from "three";
import React from "react";
import { useProjectilesStore } from "./useProjectileStore";
import { socket } from "../../socket/SocketManager";
import { useCharacterStore } from "../../store/useCharacterStore";
import { useInventoryStore } from "../../store/useInventoryStore";

/** Calcula la inteligencia total (base + bonuses de equipo) sin hooks */
function getTotalIntelligence(): number {
    const base = useCharacterStore.getState().intelligence ?? 0
    const playerId = socket.id
    if (!playerId) return base
    const equipment = useInventoryStore.getState().equipmentByPlayer[playerId]
    if (!equipment) return base
    const bonus = Object.values(equipment).reduce((acc, item) => {
        return acc + (item?.bonuses?.intelligence ?? 0)
    }, 0)
    return base + bonus
}

/** daño de hielo: 10 base + 1.5 × inteligencia total */
function calcIceDamage(): number {
    return Math.floor(10 + getTotalIntelligence() * 1.5)
}
/** daño de bola del caos: 20 base + 2.0 × inteligencia total */
function calcDarkBallDamage(): number {
    return Math.floor(20 + getTotalIntelligence() * 2.0)
}
export type AbilityContext = {
    isOnGround: boolean;
    currentLinVel: React.MutableRefObject<THREE.Vector3>;
    jumpVel: number;
    movingDir: THREE.Vector3;
    model: THREE.Group | null;
    camera: THREE.Camera;
};

export type Ability = (ctx: AbilityContext) => void;

export const abilities: Record<string, Ability> = {
    superJump: (() => {
        let jumps = 0;            // 0: listo, 1: ya hiciste doble salto, 2: ya hiciste smash
        let wasGrounded = true;   // para detectar aterrizaje
        let lastGroundedAt = 0;   // coyote-time opcional

        return (ctx) => {
            // detectar transiciones suelo/aire para resetear y dar coyote-time

            // Primer uso: doble salto (permite en aire o en coyote)
            if (jumps === 0) {
                if (ctx.isOnGround) {
                    const vy = ctx.jumpVel * 5;
                    // si vas cayendo fuerte, forzamos subir
                    ctx.currentLinVel.current.y = Math.max(vy, ctx.currentLinVel.current.y < 0 ? vy : ctx.currentLinVel.current.y);
                    jumps = 1;
                } else {
                    const vy = ctx.jumpVel * 2.75;
                    // si vas cayendo fuerte, forzamos subir
                    ctx.currentLinVel.current.y = Math.max(vy, ctx.currentLinVel.current.y < 0 ? vy : ctx.currentLinVel.current.y);
                    jumps = 1;

                }
                return;
            }

            // Segundo uso: smash (solo tiene sentido en aire)
            if (jumps === 1) {
                ctx.currentLinVel.current.set(0, -ctx.jumpVel * 7, 0);
                jumps = 0;
                return;
            }
        };
    })(),

    dash: (ctx) => {
        if (ctx.model && ctx.isOnGround) {
            // Vector hacia delante según la rotación del personaje
            const forward = new THREE.Vector3(0, 0, 1);
            forward.applyQuaternion(ctx.model.quaternion).normalize();

            // Añadimos velocidad en esa dirección
            ctx.currentLinVel.current.addScaledVector(forward, 45); // fuerza del dash
            console.log("⚡ Dash hacia donde mira!");
        } else if (ctx.model) {
            const forward = new THREE.Vector3(0, 0, 1);
            forward.applyQuaternion(ctx.model.quaternion).normalize();

            // Añadimos velocidad en esa dirección
            ctx.currentLinVel.current.addScaledVector(forward, 15); // fuerza del dash
            console.log("⚡ Dash hacia donde mira!");
        }

    },
    fireBolt: (ctx) => {
        if (!ctx.model) return

        const origin = ctx.model.getWorldPosition(new THREE.Vector3())
        origin.y += 1.2 // chest height

        const dir = ctx.camera.getWorldDirection(new THREE.Vector3())
        const id  = `p_${Date.now()}_${Math.random().toString(36).slice(2)}`
        const world = useCharacterStore.getState().world

        const speed  = 18
        const ttl    = 5
        const radius = 0.3
        const damage = 15

        useProjectilesStore.getState().add({
            id, ownerId: socket.id, world,
            position: origin.clone(),
            direction: dir.clone(),
            speed, ttl, radius, damage,
            mesh: new THREE.Mesh(),
            kind: 'fire',
        })

        socket.emit('projectileSpawn', {
            id, ownerId: socket.id, world,
            position: origin.toArray(),
            direction: dir.toArray(),
            speed, ttl, radius, damage,
            kind: 'fire',
        })
    },

    iceBall: (ctx) => {
        if (!ctx.model) return

        const origin = ctx.model.getWorldPosition(new THREE.Vector3())
        origin.y += 1.2

        const dir = ctx.camera.getWorldDirection(new THREE.Vector3())
        const id  = `p_${Date.now()}_${Math.random().toString(36).slice(2)}`
        const world = useCharacterStore.getState().world

        const speed  = 16
        const ttl    = 5
        const radius = 0.3
        const damage = calcIceDamage()

        useProjectilesStore.getState().add({
            id, ownerId: socket.id, world,
            position: origin.clone(),
            direction: dir.clone(),
            speed, ttl, radius, damage,
            mesh: new THREE.Mesh(),
            kind: 'ice',
        })

        socket.emit('projectileSpawn', {
            id, ownerId: socket.id, world,
            position: origin.toArray(),
            direction: dir.toArray(),
            speed, ttl, radius, damage,
            kind: 'ice',
        })
    },

    darkBall: (ctx) => {
        if (!ctx.model) return

        const origin = ctx.model.getWorldPosition(new THREE.Vector3())
        origin.y += 1.2

        const dir = ctx.camera.getWorldDirection(new THREE.Vector3())
        const id  = `p_${Date.now()}_${Math.random().toString(36).slice(2)}`
        const world = useCharacterStore.getState().world

        const speed  = 14
        const ttl    = 6
        const radius = 0.5
        const damage = calcDarkBallDamage()

        useProjectilesStore.getState().add({
            id, ownerId: socket.id, world,
            position: origin.clone(),
            direction: dir.clone(),
            speed, ttl, radius, damage,
            mesh: new THREE.Mesh(),
            kind: 'darkBall',
        })

        socket.emit('projectileSpawn', {
            id, ownerId: socket.id, world,
            position: origin.toArray(),
            direction: dir.toArray(),
            speed, ttl, radius, damage,
            kind: 'darkBall',
        })
    },

    actionAbility: () => {
        const { setAbilityAnim } = useAbilityStore.getState();
        setAbilityAnim('ATTACK', 800); // dura 0.8 segundos
    }

};

export type AbilityId = keyof typeof abilities

export const abilityMeta: Record<AbilityId, { name: string; icon?: string; description?: string }> = {
    actionAbility: {
        name: 'Ataque',
        icon: '/skills/sword.svg',
        description: 'Ataque básico',
    },
    superJump: {
        name: 'Super Salto',
        icon: '/skills/dash.svg',
        description: 'Doble salto y smash',
    },
    iceBall: {
        name: 'Bola de Hielo',
        icon: '/skills/heal.svg',
        description: 'Proyectil de hielo',
    },
    fireBolt: {
        name: 'Bola de Fuego',
        icon: '/skills/sword.svg',
        description: 'Proyectil de fuego',
    },
    dash: {
        name: 'Dash',
        icon: '/skills/dash.svg',
        description: 'Desplazamiento rápido',
    },
    darkBall: {
        name: 'Bola del Caos',
        icon: '/skills/sword.svg',
        description: 'Proyectil oscuro de caos',
    },
};

export const abilityList: AbilityId[] = [
    'actionAbility',
    'superJump',
    'dash',
    'iceBall',
    'fireBolt',
    'darkBall',
];

interface AbilityStore {
    slots: Record<string, AbilityId | null>;
    setAbility: (key: string, ability: AbilityId | null) => void;
    triggerAbility: (key: string, ctx: AbilityContext) => void;

    isSkillsOpen: boolean;
    setSkillsOpen: (open: boolean) => void;
    toggleSkillsOpen: () => void;

    // new 
    currentAbilityAnim: string | null;
    setAbilityAnim: (anim: string, duration?: number) => void;
}

export const useAbilityStore = create<AbilityStore>((set, get) => ({
    slots: {
        Key1: "actionAbility",
        Key2: "superJump",
        Key3: "iceBall",
        Key4: "darkBall",
    },
    setAbility: (key, ability) =>
        set((state) => ({
            slots: { ...state.slots, [key]: ability },
        })),
    triggerAbility: (key, ctx) => {
        const { slots } = get();
        const abilityName = slots[key];
        if (!abilityName) return;
        const ability = abilities[abilityName];
        if (ability) ability(ctx);
    },

    isSkillsOpen: false,
    setSkillsOpen: (open) => set({ isSkillsOpen: open }),
    toggleSkillsOpen: () => set((s) => ({ isSkillsOpen: !s.isSkillsOpen })),

    // new 
    currentAbilityAnim: null as string | null,
    setAbilityAnim: (anim, duration = 600) => {
        set({ currentAbilityAnim: anim });
        // limpiar después del tiempo indicado
        setTimeout(() => set({ currentAbilityAnim: null }), duration);
    },
}));
