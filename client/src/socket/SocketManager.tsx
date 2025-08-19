import React, { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { atom, useAtom } from "jotai";

// Conexión socket
export const socket: Socket = io("http://localhost:5174");

// Atoms globales
export const usersAtom = atom<string[]>([]);
export const remotePlayersAtom = atom<{
  [id: string]: {
    position: [number, number, number];
    rotation: [number, number, number, number];
  };
}>({});
export const remoteAnimationsAtom = atom<{ [id: string]: string }>({});
export const remoteNamesAtom = atom<{ [id: string]: string }>({});

export const SocketManager: React.FC = () => {
  const [_users, setUsers] = useAtom(usersAtom);
  const [_, setRemotePlayers] = useAtom(remotePlayersAtom);
  const [__, setRemoteAnimations] = useAtom(remoteAnimationsAtom);
  const [___, setRemoteNames] = useAtom(remoteNamesAtom);

  useEffect(() => {
    const onConnect = () => {
      console.log("🟢 Connected to the server");
    };

    const onDisconnect = () => {
      console.log("🔴 Disconnected from the server");
      setRemotePlayers({});
      setRemoteAnimations({});
      setRemoteNames({});
    };

    const onHello = () => {
      console.log("👋 Hello from the server");
    };

    const onRemotePosition = (data: {
      id: string;
      position: [number, number, number];
      rotation: [number, number, number, number];
    }) => {
      if (!data.id || data.id === socket.id) return;

      setRemotePlayers((prev) => ({
        ...prev,
        [data.id]: {
          position: data.position,
          rotation: data.rotation,
        },
      }));
    };

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
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("hello", onHello);
    socket.on("remotePosition", onRemotePosition);
    socket.on("remoteAnim", onRemoteAnim);
    socket.on("playerJoined", onPlayerJoined);
    socket.on("existingPlayers", onExistingPlayers);
    socket.on("userDisconnected", onUserDisconnected);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("hello", onHello);
      socket.off("remotePosition", onRemotePosition);
      socket.off("remoteAnim", onRemoteAnim);
      socket.off("playerJoined", onPlayerJoined);
      socket.off("existingPlayers", onExistingPlayers);
      socket.off("userDisconnected", onUserDisconnected);
    };
  }, []);

  return null;
};
    