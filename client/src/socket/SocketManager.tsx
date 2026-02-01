import React, { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { atom, useAtom } from "jotai";
import { useWolfStore } from "../worlds/dungeons/monsters/wolfStore";
import { useSpiderStore } from "../worlds/dungeons/monsters/spiderStore";
import { useProjectilesStore } from "../character/skills/useProjectileStore";
import * as THREE from "three";
import { EquipmentSlot, useInventoryStore } from "../store/useInventoryStore";
import { ItemKey } from "../items/itemRegistry";
// Conexión socket

// local
export const socket: Socket = io("http://localhost:5174");

// production

// export const socket: Socket = io(import.meta.env.VITE_SOCKET_URL);

// Atoms globales para jugadores
export const usersAtom = atom<string[]>([]);
export const remotePlayersAtom = atom<{
  [id: string]: {
    position: [number, number, number];
    rotation: [number, number, number, number];
    world: string;
    t?: number;
  };
}>({});
export const remoteAnimationsAtom = atom<{ [id: string]: string }>({});
export const remoteNamesAtom = atom<{ [id: string]: string }>({});
export const chatByIdAtom = atom<{
  [id: string]: {
    message: string;
    name: string;
    t: number;
  };
}>({});


export const SocketManager: React.FC = () => {
  const [_users, setUsers] = useAtom(usersAtom);
  const [_, setRemotePlayers] = useAtom(remotePlayersAtom);
  const [__, setRemoteAnimations] = useAtom(remoteAnimationsAtom);
  const [___, setRemoteNames] = useAtom(remoteNamesAtom);
  const [____, setChatById] = useAtom(chatByIdAtom);

  const setWolf = useWolfStore((s) => s.setWolf);
  const setSpider = useSpiderStore((s) => s.setSpider);

  // proyectiles 
  useEffect(() => {
    const onConnect = () => {
      console.log("🟢 Connected to the server");
    };

    const onDisconnect = () => {
      console.log("🔴 Disconnected from the server");
      setRemotePlayers({});
      setRemoteAnimations({});
      setRemoteNames({});
      setWolf({
        position: [0, 0, 0],
        quaternion: [0, 0, 0, 1],
        animation: "Take 001",
      });
      setSpider({
        position: [0, 0, 0],
        quaternion: [0, 0, 0, 1],
        animation: "Spider_Idle",
      });
    };

    const onHello = () => {
      console.log("👋 Hello from the server");
    };

    const onRemotePosition = (data: {
      id: string;
      position: [number, number, number];
      rotation: [number, number, number, number];
      world: string;
      t?: number;
    }) => {
      if (!data.id || data.id === socket.id) return;
      setRemotePlayers((prev) => ({
        ...prev,
        [data.id]: {
          position: data.position,
          rotation: data.rotation,
          world: data.world,
          t: data.t ?? performance.now(),
        },
      }));
    };
    const onProjectileSpawn = (p: {
      id: string;
      ownerId: string;
      world: string | null;
      position: [number, number, number];
      direction: [number, number, number];
      speed: number;
      ttl: number;
      radius?: number;
      damage?: number;
      targetId?: string;
      aim?: [number, number, number];
      aimOffsetY?: number;
      kind: 'fire' | 'ice' | 'lightning';
    }) => {
      // manejar el spawn del proyectil
      if (p.ownerId === socket.id) return;
      const kind = p.kind === 'ice' ? 'ice' : 'fire'; // 👈 default seguro
      useProjectilesStore.getState().add({
        id: p.id,
        position: new THREE.Vector3(...p.position),
        direction: new THREE.Vector3(...p.direction),
        speed: p.speed,
        ttl: p.ttl,
        radius: p.radius || 0.2,
        damage: p.damage || 10,
        targetId: p.targetId,
        mesh: new THREE.Mesh(), // placeholder, se asigna en ProjectilesLayer
        ownerId: p.ownerId,
        world: p.world,
        aim: p.aim ? new THREE.Vector3(...p.aim) : undefined,
        aimOffsetY: p.aimOffsetY,
        kind,
      });
    }

    const onRemoteAnim = (data: { id: string; animation: string }) => {
      if (!data.id || data.id === socket.id) return;
      setRemoteAnimations((prev) => ({
        ...prev,
        [data.id]: data.animation,
      }));
    };

    const onPlayerJoined = (data: { id: string; name: string }) => {
      if (!data.id || data.id === socket.id) return;
      setRemoteNames((prev) => ({
        ...prev,
        [data.id]: data.name,
      }));
    };

    const onExistingPlayers = (players: { [id: string]: string }) => {
      setRemoteNames(players);
    };

    const onUserDisconnected = (data: { id: string }) => {
      setRemotePlayers((prev) => {
        const updated = { ...prev };
        delete updated[data.id];
        return updated;
      });
      setRemoteAnimations((prev) => {
        const updated = { ...prev };
        delete updated[data.id];
        return updated;
      });
      setRemoteNames((prev) => {
        const updated = { ...prev };
        delete updated[data.id];
        return updated;
      });
      setChatById((prev) => {
        const updated = { ...prev };
        delete updated[data.id];
        return updated;
      });
    };

    const onWolfUpdate = (data: {
      position: [number, number, number];
      quaternion: [number, number, number, number];
      animation: string;
    }) => {
      setWolf(data);
    };
    const onSpiderUpdate = (data: {
      position: [number, number, number];
      quaternion: [number, number, number, number];
      animation: string;
    }) => {
      setSpider(data);
    };

    const onRemoteEquip = (msg: { id: string; slot: EquipmentSlot; itemKey: ItemKey | null }) => {
      const { ensurePlayer, setEquipmentSlot } = useInventoryStore.getState();
      ensurePlayer(msg.id);
      setEquipmentSlot(msg.id, msg.slot, msg.itemKey);
    };

    // (opcional) snapshot completo al conectar
    const onEquipmentSnapshot = (snapshot: {
      [playerId: string]: Partial<Record<EquipmentSlot, ItemKey | null>>;
    }) => {
      const { ensurePlayer, setEquipmentSlot } = useInventoryStore.getState();
      for (const [pid, slots] of Object.entries(snapshot)) {
        ensurePlayer(pid);
        for (const [slot, key] of Object.entries(slots) as [EquipmentSlot, ItemKey | null][]) {
          setEquipmentSlot(pid, slot, key);
        }
      }
    };

    const onChatMessage = (msg: { id: string; name: string; message: string; t: number }) => {
      if (!msg || !msg.id || !msg.message) return;
      setChatById((prev) => ({
        ...prev,
        [msg.id]: {
          name: msg.name,
          message: msg.message,
          t: msg.t ?? Date.now(),
        },
      }));
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("hello", onHello);
    socket.on("remotePosition", onRemotePosition);
    socket.on("remoteAnim", onRemoteAnim);
    socket.on("playerJoined", onPlayerJoined);
    socket.on("existingPlayers", onExistingPlayers);
    socket.on("userDisconnected", onUserDisconnected);
    socket.on("wolfUpdate", onWolfUpdate);
    socket.on("spiderUpdate", onSpiderUpdate);
    socket.on("projectileSpawn", onProjectileSpawn);
    socket.on("remoteEquipment", onRemoteEquip);
    socket.on("equipmentSnapshot", onEquipmentSnapshot);
    socket.on("chatMessage", onChatMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("hello", onHello);
      socket.off("remotePosition", onRemotePosition);
      socket.off("remoteAnim", onRemoteAnim);
      socket.off("playerJoined", onPlayerJoined);
      socket.off("existingPlayers", onExistingPlayers);
      socket.off("userDisconnected", onUserDisconnected);
      socket.off("wolfUpdate", onWolfUpdate);
      socket.off("spiderUpdate", onSpiderUpdate)
      socket.off("projectileSpawn", onProjectileSpawn)
      socket.off("remoteEquipment", onRemoteEquip);
      socket.off("equipmentSnapshot", onEquipmentSnapshot);
      socket.off("chatMessage", onChatMessage);
    };
  }, [setWolf]);

  return null;
};


export function emitPlayerEquipment(slot: EquipmentSlot, itemKey: ItemKey | null) {
  const id = socket.id ?? "local-fallback";
  socket.emit("playerEquipment", { id, slot, itemKey });
}