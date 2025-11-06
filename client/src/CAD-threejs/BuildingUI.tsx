import * as THREE from 'three'
import { useBuildingStore } from './useLineDrawing'
import './BuildingUI.css'

export default function BuildingUI() {
    const { points, setPoints, height, setHeight, isClosed, reset, isDrawing, setIsDrawing, colorLine, setColorLine, setColorExtrude } = useBuildingStore()

    const updatePoint = (index: number, axis: 'x' | 'z', value: number) => {
        const updated = points.map((p, i) =>
            i === index
                ? new THREE.Vector3(axis === 'x' ? value : p.x, p.y, axis === 'z' ? value : p.z)
                : p
        )
        setPoints(updated)
    }

    return (
        <div className="main-ui">
            <h3>Edición del edificio</h3>
            <button onClick={() => setColorLine('blue')}>Blue line</button>
            <button onClick={() => setColorLine('red')}>Red line</button>
            <button onClick={() => setColorLine('green')}>Green line</button>

            <button onClick={() => setColorExtrude('blue')}>Blue extrude</button>
            <button onClick={() => setColorExtrude('red')}>Red extrude</button>
            <button onClick={() => setColorExtrude('green')}>Green extrude</button>

            <button onClick={() => setIsDrawing(!isDrawing)}>
                {isDrawing ? '🛑 Exit drawing mode' : '✏️ Activate drawing'}
            </button>

            {isClosed && height === null && (
                <>
                    <h4>Height:</h4>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                            type="number"
                            id="altura"
                            placeholder="Introduce altura"
                            style={{
                                width: 100,
                                padding: '5px',
                                borderRadius: '4px',
                                border: '1px solid #aaa',
                            }}
                        />
                        <button
                            onClick={() => {
                                const input = document.getElementById('altura') as HTMLInputElement
                                const value = parseFloat(input.value)
                                if (!isNaN(value)) setHeight(value)
                            }}
                            style={{
                                padding: '6px 10px',
                                borderRadius: '5px',
                                border: 'none',
                                background: '#90ee90',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                            }}
                        >
                            Accept
                        </button>
                    </div>
                </>
            )}

            {isClosed && height && (
                <>
                    <h4>Points:</h4>
                    {points.map((p, i) => (
                        <div key={i} style={{ marginBottom: 12, border: '1px solid #ddd', padding: 8, borderRadius: 8 }}>
                            <strong>Point {i + 1}</strong>
                            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                {/* Eje X */}
                                <div>
                                    <div style={{ textAlign: 'center' }}>X</div>
                                    <button onClick={() => updatePoint(i, 'x', p.x - 0.1)}>◀</button>
                                    <span style={{ margin: '0 8px' }}>{p.x.toFixed(1)}</span>
                                    <button onClick={() => updatePoint(i, 'x', p.x + 0.1)}>▶</button>
                                </div>


                                {/* Eje Z */}
                                <div>
                                    <div style={{ textAlign: 'center' }}>Z</div>
                                    <button onClick={() => updatePoint(i, 'z', p.z - 0.1)}>◀</button>
                                    <span style={{ margin: '0 8px' }}>{p.z.toFixed(1)}</span>
                                    <button onClick={() => updatePoint(i, 'z', p.z + 0.1)}>▶</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </>

            )}

            <button style={{ marginTop: 10 }} onClick={reset}>🔄 Reset</button>
        </div>
    )
}
