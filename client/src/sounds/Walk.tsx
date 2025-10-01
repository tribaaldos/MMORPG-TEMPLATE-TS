import { forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import { useAudioStore } from "../store/useAudioStore";

export interface StepAudioHandle {
  play: () => void;
  stop: () => void;
}

const StepAudio = forwardRef<StepAudioHandle>((_, ref) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const setStepRef = useAudioStore((s) => s.setStepRef);

  useImperativeHandle(ref, () => ({
    play: () => {
      if (audioRef.current) {
        audioRef.current.loop = true;
        audioRef.current.volume = 0.15;
        audioRef.current.play().catch((err) => {
          console.warn("⚠️ No se pudo reproducir el audio:", err);
        });
      }
    },
    stop: () => {
      if (audioRef.current) {
        audioRef.current.volume=0.15;
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    },
  }));

  // Guardar el ref en Zustand
  useEffect(() => {
    setStepRef({ current: { play: () => audioRef.current?.play(), stop: () => audioRef.current?.pause() } });
    if (audioRef.current) {
      audioRef.current.volume = 0.15;
    }
  }, [setStepRef]);

  return (
    <audio
      ref={audioRef}
      src="/sounds/walk.mp3"
      preload="auto"
      style={{ display: "none" }}
    />
  );
});

export default StepAudio;
