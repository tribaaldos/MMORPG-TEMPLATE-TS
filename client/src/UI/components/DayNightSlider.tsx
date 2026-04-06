import { useTimeStore } from '../../components/shaders/sky/SkyShader';

export default function DayNightSlider() {
  const hour = useTimeStore((s) => s.hour);
  const setHour = useTimeStore((s) => s.setHour);

  const displayHour = Math.floor(hour);
  const displayMin = Math.floor((hour % 1) * 60).toString().padStart(2, '0');

  const isNight = hour < 6 || hour > 20;
  const icon = isNight ? '🌙' : hour < 8 || hour > 18 ? '🌅' : '☀️';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: 'var(--ui-panel-bg)',
      border: 'var(--ui-border)',
      borderRadius: 'var(--ui-radius)',
      padding: '6px 14px',
      backdropFilter: 'blur(8px)',
      minWidth: 200,
    }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <input
        type="range"
        min={0}
        max={24}
        step={0.1}
        value={hour}
        onChange={(e) => setHour(parseFloat(e.target.value))}
        style={{
          flex: 1,
          accentColor: 'var(--ui-accent)',
          cursor: 'pointer',
          height: 4,
        }}
      />
      <span style={{
        fontFamily: 'monospace',
        fontSize: 13,
        color: 'var(--ui-accent)',
        minWidth: 42,
        textAlign: 'right',
      }}>
        {displayHour}:{displayMin}
      </span>
    </div>
  );
}
