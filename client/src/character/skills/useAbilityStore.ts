// stores/useAbilityStore.ts
import { create } from "zustand";
import * as THREE from "three";
import React from "react";
import { useTargetStore } from "../../store/useTargetStore";
import { useProjectilesStore } from "./useProjectileStore";
import { castIceSkill } from "./iceSkill/IceSkill";
import { useIceSkillStore } from "./iceSkill/useIceSkillStore";
import { socket } from "../../socket/SocketManager";
import { useCharacterStore } from "../../store/useCharacterStore";
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
        const sel = useTargetStore.getState().selectedTarget;
        if (!ctx.model || !sel?.position) return;

        // origen: desde la cabeza del player
        // const origin = ctx.model.getWorldPosition(new THREE.Vector3());
        // origin.y -= 0.25;

        const origin = sel.position
        origin.y += 5.5; // ajusta según la altura de tu modelo


        // dirección: recta hacia el dragón en este instante
        const dir = sel.position.clone().sub(origin).normalize();
        const id = `p_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const world = useCharacterStore.getState().world;

        // dir.y = 5;
        useProjectilesStore.getState().add({
            id,
            ownerId: socket.id,
            world,
            position: origin.clone(),
            direction: dir.clone(),
            speed: 20,
            ttl: 5.2,
            radius: 0.2,
            damage: 15,
            targetId: sel.id,
            mesh: new THREE.Mesh(),
        });

        // y lo envías al server para que lo vean los demás
        socket.emit('projectileSpawn', {
            id,
            ownerId: socket.id,
            world,
            position: origin.toArray(),
            direction: dir.toArray(),
            speed: 20,
            ttl: 5.2,
            radius: 0.2,
            damage: 15,
            targetId: sel.id,
        });

    },
    iceBall: () => {
        castIceSkill({ speed: 12, radius: 0.2, damage: 20, yOffset: -0.25 });
    },


};

interface AbilityStore {
    slots: Record<string, keyof typeof abilities | null>;
    setAbility: (key: string, ability: keyof typeof abilities | null) => void;
    triggerAbility: (key: string, ctx: AbilityContext) => void;
}

export const useAbilityStore = create<AbilityStore>((set, get) => ({
    slots: {
        Key1: "iceBall",
        Key2: "superJump",
        Key3: "fireBolt",
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
}));
