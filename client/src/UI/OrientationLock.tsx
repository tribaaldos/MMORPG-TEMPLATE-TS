// 📱 MobileFullscreenGuard.tsx
import { useEffect, useState } from "react"

/**
 * Este componente:
 * 1️⃣ Detecta si estás en móvil.
 * 2️⃣ Muestra un mensaje si el dispositivo está en vertical.
 * 3️⃣ Ofrece un botón para entrar a pantalla completa.
 * 4️⃣ Intenta bloquear la orientación en landscape (si el navegador lo permite).
 */

export default function MobileFullscreenGuard() {
  const [isLandscape, setIsLandscape] = useState(
    window.matchMedia("(orientation: landscape)").matches
  )
  const [isFullscreen, setIsFullscreen] = useState(
    !!document.fullscreenElement
  )

  // Detectar orientación
  useEffect(() => {
    const handleOrientation = () => {
      const landscape = window.matchMedia("(orientation: landscape)").matches
      setIsLandscape(landscape)
    }

    window.addEventListener("orientationchange", handleOrientation)
    window.addEventListener("resize", handleOrientation)

    return () => {
      window.removeEventListener("orientationchange", handleOrientation)
      window.removeEventListener("resize", handleOrientation)
    }
  }, [])

  // Detectar si está en fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Intentar bloquear orientación (solo Android/PWA)
  useEffect(() => {
    const tryLock = async () => {
      if (screen.orientation && screen.orientation.lock) {
        try {
          await screen.orientation.lock("landscape")
        } catch (e) {
          console.log("No se pudo bloquear orientación automáticamente:", e)
        }
      }
    }
    if (isLandscape) tryLock()
  }, [isLandscape])

  const enterFullscreen = () => {
    const elem = document.documentElement as any
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen()
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen()
    }
  }

  const isMobile = /Mobi|Android/i.test(navigator.userAgent)

  // 🧱 Overlay si está en vertical
  if (isMobile && !isLandscape) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          zIndex: 9999,
        }}
      >
        <div>
          🔄 Please rotate your device<br />
          <small>Landscape mode required</small>
        </div>
      </div>
    )
  }

  // ⛶ Botón de fullscreen si no está activado
  if (isMobile && isLandscape && !isFullscreen) {
    return (
      <button
        style={{
          position: "fixed",
          bottom: "16px",
          right: "16px",
          zIndex: 9999,
          background: "#222",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          padding: "10px 14px",
          fontSize: "16px",
        }}
        onClick={enterFullscreen}
      >
        ⛶ Fullscreen
      </button>
    )
  }

  return null
}
