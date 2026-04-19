import { useState } from 'react'
import { useCharacterStore } from '../../../store/useCharacterStore'
import './WorldMapPanel.css'

interface WorldEntry {
    id: string
    label: string
    sublabel: string
    icon: string
    spawnPos: [number, number, number]
    color: string
}

const WORLDS: WorldEntry[] = [
    {
        id: 'world1',
        label: 'Mundo Principal',
        sublabel: 'Starter Zone',
        icon: '🌿',
        spawnPos: [0, 2, 0],
        color: '#3a7d44',
    },
    {
        id: 'dungeon',
        label: 'ICC Dungeon',
        sublabel: 'Nivel 1-10',
        icon: '💀',
        spawnPos: [0, 2, 0],
        color: '#7d3a3a',
    },
    {
        id: 'dragonDungeon',
        label: 'Dragon Dungeon',
        sublabel: 'Nivel 15+',
        icon: '🐉',
        spawnPos: [0, 2, 0],
        color: '#7d5a1a',
    },
    {
        id: 'skillMuseum',
        label: 'Museo de Skills',
        sublabel: 'Sala arcana',
        icon: '⚡',
        spawnPos: [0, 2, 0],
        color: '#5a1a7d',
    },
    {
        id: 'ShaderVisualizer',
        label: 'Shader Lab',
        sublabel: 'Laboratorio',
        icon: '✨',
        spawnPos: [0, 2, 0],
        color: '#1a5a7d',
    },
]

export default function WorldMapPanel() {
    const [collapsed, setCollapsed] = useState(false)
    const currentWorld = useCharacterStore((s) => s.world)

    const teleport = (world: WorldEntry) => {
        window.dispatchEvent(new CustomEvent('teleport-to-world', {
            detail: { worldId: world.id, pos: world.spawnPos },
        }))
    }

    return (
        <div className={`wmp-container ${collapsed ? 'wmp-collapsed' : ''}`}>
            <button
                className="wmp-toggle"
                onClick={() => setCollapsed((v) => !v)}
                title={collapsed ? 'Abrir mapa de mundos' : 'Cerrar'}
            >
                {collapsed ? '🗺️' : '✕'}
            </button>

            {!collapsed && (
                <div className="wmp-panel">
                    <div className="wmp-header">
                        <span className="wmp-title">MUNDOS</span>
                    </div>
                    <div className="wmp-list">
                        {WORLDS.map((w) => {
                            const active = currentWorld === w.id
                            return (
                                <button
                                    key={w.id}
                                    className={`wmp-btn ${active ? 'wmp-active' : ''}`}
                                    style={{ '--wmp-color': w.color } as React.CSSProperties}
                                    onClick={() => teleport(w)}
                                    disabled={active}
                                    title={`Ir a ${w.label}`}
                                >
                                    <span className="wmp-icon">{w.icon}</span>
                                    <div className="wmp-text">
                                        <span className="wmp-name">{w.label}</span>
                                        <span className="wmp-sub">{w.sublabel}</span>
                                    </div>
                                    {active && <span className="wmp-here">◀</span>}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
