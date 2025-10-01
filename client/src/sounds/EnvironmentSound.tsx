import { useEffect, useRef } from "react";

export default function EnvironmentSound() {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const handleInteraction = () => {
            if (audioRef.current) {
                audioRef.current.muted = false; // quitar mute
                audioRef.current.volume = 0.1;
                audioRef.current.play();
            }
            document.removeEventListener("click", handleInteraction);
        };

        if (audioRef.current) {
            audioRef.current.loop = true;
            audioRef.current.muted = true; // arranca muteado
            audioRef.current.volume = 0.1;
            audioRef.current.play();
        }

        document.addEventListener("click", handleInteraction);

        return () => document.removeEventListener("click", handleInteraction);
    }, []);

    return <audio ref={audioRef} src="/sounds/mountainWind.wav" />;
}
