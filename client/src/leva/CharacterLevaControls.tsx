import { useControls } from 'leva';
import { useEffect } from 'react';

interface CharacterLevaControlsProps {
    setSpeed: (value: number) => void;
    setJumpForce: (value: number) => void;
    setFriction: (value: number) => void;
    setDamping: (value: number) => void;
}
export default function CharacterLevaControls({ setSpeed, setJumpForce, setFriction, setDamping }: CharacterLevaControlsProps) {
    const controls = useControls('Character Physics', {
        speed: { value: 10, min: 5, max: 100, step: 0.1 },
        jumpForce: { value: 6, min: 1, max: 20, step: 0.5 },
        friction: { value: 1, min: 0, max: 5, step: 0.1 },
        damping: { value: 1, min: 0, max: 10, step: 0.1 },
    });

    useEffect(() => {
        setSpeed(controls.speed);
        setJumpForce(controls.jumpForce);
        setFriction(controls.friction);
        setDamping(controls.damping);
    }, [controls, setSpeed, setJumpForce, setFriction, setDamping]);

    return null;
}