
import { useState } from 'react';
import { useCharacterStore } from '../../../store/useCharacterStore';
import BotonPantallaCompleta from '../PantallaCompleta';

export default function ShowStats() {

      const [showStats, setShowStats] = useState(false);
          const position = useCharacterStore((s) => s.position);
          const rotation = useCharacterStore((s) => s.rotation);
          
        
    return (
        <div className="header">
            <button onClick={() => setShowStats(!showStats)} className="toggle-button">
                {showStats ? 'Ocultar Stats ▲' : 'Mostrar Stats ▼'}
            </button>
            {showStats && (
                <div className="stats-panel">
                    <h1>WebGPU App</h1>
                    <p><strong>Position:</strong> X: {position[0].toFixed(2)} | Y: {position[1].toFixed(2)} | Z: {position[2].toFixed(2)}</p>
                    <p><strong>Rotation:</strong> {rotation.map((v) => v.toFixed(2)).join(' | ')}</p>
                </div>
            )}
        </div>
    )
}