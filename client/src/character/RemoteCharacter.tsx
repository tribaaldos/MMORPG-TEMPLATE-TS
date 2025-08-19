import { useAtom } from 'jotai';
import { remotePlayersAtom, remoteAnimationsAtom, remoteNamesAtom } from '../socket/SocketManager';
import BasicCharacter from './BasicCharacter';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

export default function RemoteCharacters() {
    const [remotePlayers] = useAtom(remotePlayersAtom);
    const [remoteAnimations] = useAtom(remoteAnimationsAtom);
    const [remoteNames] = useAtom(remoteNamesAtom);

    const refs = useRef<{ [id: string]: THREE.Group }>({});

    useFrame(() => {
        Object.entries(remotePlayers).forEach(([id, { position, rotation }]) => {
            const group = refs.current[id];
            if (group) {
                group.position.set(...position);
                group.quaternion.set(...rotation);
            }
        });
    });

    return (
        <>
            {Object.entries(remotePlayers).map(([id, _data]) => (
                <group
                    key={id}
                    ref={(el) => {
                        if (el) refs.current[id] = el;
                    }}
                >
                    <BasicCharacter animation={remoteAnimations[id] || 'idle'}
                        name={remoteNames[id] || 'Player'}
                    />
                </group>
            ))}
        </>
    );
}
