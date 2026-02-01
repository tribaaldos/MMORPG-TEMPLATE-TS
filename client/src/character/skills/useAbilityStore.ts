// stores/useAbilityStore.ts
import { create } from "zustand";
import * as THREE from "three";
import React from "react";
import { useTargetStore } from "../../store/useTargetStore";
import { useProjectilesStore } from "./useProjectileStore";
import { socket } from "../../socket/SocketManager";
import { useAnimationStore } from "../noPhysicsCharacter/extra/useAnimationStore";
import { useCharacterStore } from "../../store/useCharacterStore";
import { useMonsterStore } from "../../worlds/dungeons/monsters/useMonsterStore";
export type AbilityContext = {
    isOnGround: boolean;
    currentLinVel: React.MutableRefObject<THREE.Vector3>;
    jumpVel: number;
    movingDir: THREE.Vector3;
    model: THREE.Group | null;
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
        const sel = useTargetStore.getState().selectedTarget
        if (!ctx.model || !sel?.position) return

        // origen (cabeza jugador, ajusta si quieres)
        const origin = ctx.model.getWorldPosition(new THREE.Vector3())

        // hitPoint MUY importante: lo sincronizamos por red
        const aim = sel.position.clone() // ya viene elevado desde tu dummy/selector

        const dir = aim.clone().sub(origin).normalize()
        const id = `p_${Date.now()}_${Math.random().toString(36).slice(2)}`
        const world = useCharacterStore.getState().world
        const m = useMonsterStore.getState().monsters[sel.id]

        const baseY = m?.position?.y ?? sel.position.y

        const aimOffsetY = Math.max(0.3, sel.position.y - baseY) // ej. 0.3 mínimo

        // UNIFICA parámetros cliente/servidor
        const speed = 10
        const ttl = 6
        const radius = 0.08
        const damage = 15

        // Cliente local
        useProjectilesStore.getState().add({
            id,
            ownerId: socket.id,
            world,
            position: origin.clone(),
            direction: dir.clone(),
            speed,
            ttl,
            radius,
            damage,
            targetId: sel.id,
            mesh: new THREE.Mesh(),
            aim: aim.clone(),
            aimOffsetY,          // << offset local
            kind: 'fire',
        })

        // Aviso al servidor (para reemitir a los demás)
        socket.emit('projectileSpawn', {
            id,
            ownerId: socket.id,
            world,
            position: origin.toArray(),
            direction: dir.toArray(),
            speed,
            ttl,
            radius,
            damage,
            targetId: sel.id,
            aim: aim.toArray(),      // << viaja por red
            aimOffsetY,         // << viaja por red
            kind: 'fire',
        })
    },
    iceBall: (ctx) => {
        const sel = useTargetStore.getState().selectedTarget
        if (!ctx.model || !sel?.position) return

        // origen (cabeza jugador, ajusta si quieres)
        const origin = ctx.model.getWorldPosition(new THREE.Vector3())

        // hitPoint MUY importante: lo sincronizamos por red
        const aim = sel.position.clone() // ya viene elevado desde tu dummy/selector

        const dir = aim.clone().sub(origin).normalize()
        const id = `p_${Date.now()}_${Math.random().toString(36).slice(2)}`
        const world = useCharacterStore.getState().world
        const m = useMonsterStore.getState().monsters[sel.id]

        const baseY = m?.position?.y ?? sel.position.y

        const aimOffsetY = Math.max(0.3, sel.position.y - baseY) // ej. 0.3 mínimo

        // UNIFICA parámetros cliente/servidor
        const speed = 10
        const ttl = 1000
        const radius = 0.08
        const damage = 15

        // Cliente local
        useProjectilesStore.getState().add({
            id,
            ownerId: socket.id,
            world,
            position: origin.clone(),
            direction: dir.clone(),
            speed,
            ttl,
            radius,
            damage,
            targetId: sel.id,
            mesh: new THREE.Mesh(),
            aim: aim.clone(),
            aimOffsetY,          // << offset local
            kind: 'ice',
        })

        // Aviso al servidor (para reemitir a los demás)
        socket.emit('projectileSpawn', {
            id,
            ownerId: socket.id,
            world,
            position: origin.toArray(),
            direction: dir.toArray(),
            speed,
            ttl,
            radius,
            damage,
            targetId: sel.id,
            aim: aim.toArray(),      // << viaja por red
            aimOffsetY,         // << viaja por red
            kind: 'ice',
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
};

export const abilityList: AbilityId[] = [
    'actionAbility',
    'superJump',
    'dash',
    'iceBall',
    'fireBolt',
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
        Key4: "fireBolt",
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
