// components/PopupUI.tsx
import { usePopup } from "../store/usePopUpStore"
import './PopUI.css'
// components/PopupUI.tsx

export default function PopupUI() {
  const { popups, hidePopup } = usePopup()

  return (
    <>
      {Object.entries(popups).map(([type, Component]) => (
        <div
          key={type}
          style={{
             position: "absolute",

            background: "#222",
            color: "white",
            padding: "16px",
            borderRadius: "8px",
            zIndex: 10,
            minWidth: 240,
          }}
        >
          {/* @ts-ignore */}
          <Component />
          <button onClick={() => hidePopup(type)}>Cerrar</button>

        </div>
      ))}
    </>
  )
}
