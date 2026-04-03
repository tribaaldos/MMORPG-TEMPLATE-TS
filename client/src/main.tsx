import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { PopupProvider } from 'react-hook-popup'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import ItemDragLayer from './UI/components/inventory/ItemDragLayer'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DndProvider backend={HTML5Backend}>
        <ItemDragLayer />
        <PopupProvider>
          <App />
        </PopupProvider>
      </DndProvider>
    </BrowserRouter>
  </StrictMode>,
)
