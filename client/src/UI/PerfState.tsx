// components/PerfWidget.tsx
import { usePerfStore } from "../store/PerfState"
export default function PerfWidget() {
  const {
    fps, callsPerSec, callsPerFrame,
    triangles, lines, points, geometries, textures, programs
  } = usePerfStore()

  const ok = callsPerSec < 12000
  const statusColor = ok ? '#26d07c' : '#ff4d4f'

  return (
    <div style={panel}>
      <div style={headerRow}>
        <span>Perf</span>
        <span style={{ ...statusDot, background: statusColor, boxShadow: `0 0 ${ok ? 8 : 14}px ${statusColor}` }} />
      </div>
      <div style={row}><span style={label}>FPS</span><span>{fps}</span></div>
      <div style={row}><span style={label}>Draw Calls/s</span><span style={{ color: statusColor }}>{callsPerSec}</span></div>
      <div style={row}><span style={label}>Calls/frame</span><span style={{ color: statusColor }}>{callsPerFrame}</span></div>
      <div style={divider} />
      <div style={row}><span style={label}>Triangles</span><span>{triangles}</span></div>
      <div style={row}><span style={label}>Lines</span><span>{lines}</span></div>
      <div style={row}><span style={label}>Points</span><span>{points}</span></div>
      <div style={divider} />
      <div style={row}><span style={label}>Geometries</span><span>{geometries}</span></div>
      <div style={row}><span style={label}>Textures</span><span>{textures}</span></div>
      <div style={row}><span style={label}>Programs</span><span>{programs}</span></div>
    </div>
  )
}

const panel: React.CSSProperties = {
  position: 'fixed', top: 500, right: 10, zIndex: 9999,
  background: 'rgba(0,0,0,0.68)', color: '#fff', padding: '10px 12px',
  borderRadius: 8, fontFamily: 'ui-monospace, Menlo, monospace',
  fontSize: 12, lineHeight: 1.35, pointerEvents: 'none', minWidth: 220,
  boxShadow: '0 4px 18px rgba(0,0,0,0.35)',
}
const row: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 6 }
const headerRow: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, fontWeight: 600, letterSpacing: 0.3 }
const label: React.CSSProperties = { opacity: 0.75 }
const divider: React.CSSProperties = { height: 2, background: 'rgba(255,255,255,0.15)', margin: '6px 0 8px' }
const statusDot: React.CSSProperties = { width: 12, height: 12, borderRadius: '50%', display: 'inline-block' }
