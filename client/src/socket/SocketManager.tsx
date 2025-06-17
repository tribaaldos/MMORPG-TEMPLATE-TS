import React, { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { atom, useAtom } from 'jotai';
// @ts-ignore (jotai is not in the package.json file, but it is installed and working

// Define the initial state type if needed, e.g., an array of characters
type Character = {
    id: number;
    name: string;
    // additional fields as necessary
};

export const socket: Socket = io("http://localhost:5174");

export const usersAtom = atom([]);
export const SocketManager: React.FC = () => {

    const [_users, setUsers] = useAtom(usersAtom);

    useEffect(() => {
        function onConnect() {
            console.log("Connected to the server");
        }

        function onDisconnect() {
            console.log("Disconnected from the server");
        }

        function onHello() {
            console.log("Hello from the server");
        }


        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("hello", onHello);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("hello", onHello);
        };
    }, []); // Include setCharacters in the dependency array if it's dynamically changing

    return null; // Correctly returns null as it renders nothing
};