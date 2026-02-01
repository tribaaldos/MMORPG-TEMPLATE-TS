import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { MMO_LOADING_IMAGE } from './MMOLoadingImage'


type Props = {
  forceVisible?: boolean
}

export default function WorldLoadingOverlay({ forceVisible }: Props) {
  const { active, progress } = useProgress()
  const [visible, setVisible] = useState(false)
  const startRef = useRef<number | null>(null)
  const hideTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (active || forceVisible) {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
      startRef.current = Date.now()
      setVisible(true)
      return
    }

    if (!startRef.current) {
      setVisible(false)
      return
    }

    const elapsed = Date.now() - startRef.current
    const remaining = Math.max(0, 2000 - elapsed)
    hideTimerRef.current = window.setTimeout(() => {
      setVisible(false)
      startRef.current = null
      hideTimerRef.current = null
    }, remaining)

    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current)
    }
  }, [active, forceVisible])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100dvh',
        minHeight: '100dvh',
        zIndex: 9998,
        pointerEvents: 'none',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at top, #2a1a08 0%, #0e0a05 100%)',
      }}
    >
      {/* Marco dorado WoW */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100dvh',
          minHeight: '100dvh',
          border: '24px solid #bfa25a',
          boxSizing: 'border-box',
          borderImage: 'linear-gradient(90deg, #e6c77a 0%, #bfa25a 100%) 1',
          borderRadius: 32,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      {/* Imagen de fondo */}
      <img
        src={MMO_LOADING_IMAGE}
        alt="MMO World Loading"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100dvh',
          minHeight: '100dvh',
          objectFit: 'cover',
          zIndex: 0,
          filter: 'brightness(0.7) blur(0.5px)',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
      {/* Barra de carga WoW */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 56,
          zIndex: 2,
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            height: 22,
            borderRadius: 12,
            overflow: 'hidden',
            border: '3px solid #2a1a08',
            background: 'rgba(30,30,60,0.85)',
            marginBottom: 8,
            width: 420,
            maxWidth: '80vw',
            boxShadow: '0 2px 12px 0 #000a',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Extremos decorativos */}
          <div style={{width: 18, height: 18, background: 'radial-gradient(circle, #e6c77a 60%, #2a1a08 100%)', borderRadius: '50%', marginLeft: 2, marginRight: 6, border: '2px solid #bfa25a', boxShadow: '0 0 8px #e6c77a88'}} />
          <div
            style={{
              width: `calc(${Math.max(5, Math.round(progress))}% - 48px)`,
              minWidth: 18,
              height: 14,
              background:
                'linear-gradient(90deg, #1e4a7a 0%, #3fa7ff 60%, #1e4a7a 100%)',
              borderRadius: 8,
              boxShadow: '0 0 8px 0 #3fa7ff',
              transition: 'width 120ms cubic-bezier(.4,1.6,.6,1)',
              marginRight: 6,
            }}
          />
          <div style={{width: 18, height: 18, background: 'radial-gradient(circle, #e6c77a 60%, #2a1a08 100%)', borderRadius: '50%', marginRight: 2, border: '2px solid #bfa25a', boxShadow: '0 0 8px #e6c77a88'}} />
        </div>
        <div style={{ fontSize: 18, opacity: 0.98, fontWeight: 700, color: '#ffe7b0', textShadow: '0 1px 8px #000', marginTop: 2 }}>{Math.round(progress)}%</div>
      </div>
    </div>
  )
}
