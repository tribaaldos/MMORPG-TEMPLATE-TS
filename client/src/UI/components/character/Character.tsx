import React, { useCallback, useEffect, useState } from 'react';
import './Character.css';
import { Canvas, extend } from '@react-three/fiber';
import * as THREE from 'three/webgpu';
import { WebGPURenderer } from 'three/webgpu';
import { useDrop } from 'react-dnd';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { useInventoryStore, Item } from '../../../store/useInventoryStore';
import { emitPlayerEquipment, socket } from '../../../socket/SocketManager';
import { ItemKey, itemRegistry } from '../../../items/itemRegistry';
import { useTotalStats } from '../../../hooks/useTotalStats';
import CharacterPreview from '../../../character/noPhysicsCharacter/CharacterPreview';
import { OrbitControls } from '@react-three/drei'

interface DraggedItem { index: number; }

type IconProps = {
  size?: number | string;
  backgroundColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  iconColor?: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function UICharacter() {
  const [playerId, setPlayerId] = useState<string>('local-fallback');
  useEffect(() => {
    const apply = () => setPlayerId(socket?.id ?? 'local-fallback');
    if (socket?.connected && socket?.id) apply();
    socket?.on?.('connect', apply);
    socket?.on?.('disconnect', apply);
    return () => {
      socket?.off?.('connect', apply);
      socket?.off?.('disconnect', apply);
    };
  }, []);

  const hp = useCharacterStore(s => s.hp);
  const mana = useCharacterStore(s => s.mana);
  const exp = useCharacterStore(s => s.exp);
  const level = useCharacterStore(s => s.level);
  const statPoints = useCharacterStore(s => s.statPoints);
  const spendStatPoint = useCharacterStore(s => s.spendStatPoint);
  const baseStrength = useCharacterStore(s => s.strength);
  const baseAgility = useCharacterStore(s => s.agility);
  const baseInt = useCharacterStore(s => s.intelligence);
  const baseCrit = useCharacterStore(s => s.critRate);
  const getExpToLevel = useCharacterStore(s => s.getExpToLevel);

  const ensurePlayer = useInventoryStore(s => s.ensurePlayer);
  useEffect(() => { ensurePlayer(playerId); }, [ensurePlayer, playerId]);

  const equipment = useInventoryStore(s => s.equipmentByPlayer[playerId]);
  const totalStats = useTotalStats(playerId);
  const equipItem = useInventoryStore(s => s.equipItem);
  const unequipItem = useInventoryStore(s => s.unequipItem);

  const maxHp = totalStats.maxHp;
  const maxMana = totalStats.maxMana;
  const expToNext = getExpToLevel(level);

  const handleRightClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, slot: string) => {
      e.preventDefault();
      if (equipment && Object.prototype.hasOwnProperty.call(equipment, slot)) {
        unequipItem(playerId, slot as any);
        emitPlayerEquipment(slot as any, null);
      }
    },
    [unequipItem, equipment, playerId]
  );

  const leftSlots = ['helmet', 'neck', 'shoulders', 'back', 'chest', 'bracers'] as const;
  const rightSlots = ['gloves', 'waist', 'legs', 'boots', 'ring', 'trinket'] as const;
  const bottomSlots = ['weapon', 'shield'] as const;

  const renderEquipIcon = (item: Item) => {
    const ImgOrComp = item.image as any;
    if (typeof ImgOrComp === 'string') return <img src={ImgOrComp} alt={item.name} className="item-icon" />;
    const Icon: React.ComponentType<IconProps> = ImgOrComp;
    return <Icon className="item-icon" {...(item as any).imageProps} />;
  };

  const renderTooltipIcon = (item: Item) => {
    const ImgOrComp = item.image as any;
    if (typeof ImgOrComp === 'string') return <img src={ImgOrComp} alt={item.name} className="tooltip-icon" />;
    const Icon: React.ComponentType<IconProps> = ImgOrComp;
    return <Icon className="tooltip-icon" {...(item as any).imageProps} />;
  };

  const renderGrid = (slots: readonly string[], area: 'left' | 'right' | 'bottom', compact = false) => (
    <div className="equipment-grid" data-area={area} data-compact={compact ? 'true' : 'false'}>
      {slots.map((slot) => {
        const [, dropRef] = useDrop<DraggedItem, void, unknown>(
          () => ({ accept: 'ITEM', drop: (dragged) => equipItem(playerId, dragged.index, slot as any) }),
          [equipItem, playerId, slot]
        );
        const item = (equipment as any)?.[slot];
        return (
          <div
            key={slot}
            ref={dropRef as any}
            className="equipment-slot"
            onContextMenu={(e) => handleRightClick(e, slot)}
            title={item ? 'Right-click to unequip' : slot}
          >
            {item ? (
              <div className="item-wrapper">
                {renderEquipIcon(item)}
                <div className="tooltip tooltip--char">
                  {renderTooltipIcon(item)}
                  <h4 className={`tooltip-name ${item.rarity || 'common'}`}>{item.name}</h4>
                  {item.description && <p className="tooltip-desc">{item.description}</p>}
                  <ul className="tooltip-stats">
                    {item.attack && <li>⚔ Attack +{item.attack}</li>}
                    {item.defense && <li>🛡 Defense +{item.defense}</li>}
                    {item.bonuses?.strength && <li style={{ color: '#00e8aa' }}>💪 STR +{item.bonuses.strength}</li>}
                    {item.bonuses?.agility && <li style={{ color: '#00e8aa' }}>🏃 AGI +{item.bonuses.agility}</li>}
                    {item.bonuses?.intelligence && <li style={{ color: '#00e8aa' }}>🧠 INT +{item.bonuses.intelligence}</li>}
                    {item.bonuses?.critRate && <li style={{ color: '#00e8aa' }}>🎯 CR +{item.bonuses.critRate}%</li>}
                    {item.bonuses?.maxHp && <li style={{ color: '#00e8aa' }}>❤ HP +{item.bonuses.maxHp}</li>}
                    {item.bonuses?.maxMana && <li style={{ color: '#00e8aa' }}>✦ Mana +{item.bonuses.maxMana}</li>}
                  </ul>
                </div>
              </div>
            ) : (
              <span className="slot-label">{slot}</span>
            )}
          </div>
        );
      })}
    </div>
  );

  const attrs = [
    { key: 'strength' as const, label: 'STR', base: baseStrength, total: totalStats.strength, bonus: totalStats.bonuses.strength },
    { key: 'agility' as const, label: 'AGI', base: baseAgility, total: totalStats.agility, bonus: totalStats.bonuses.agility },
    { key: 'intelligence' as const, label: 'INT', base: baseInt, total: totalStats.intelligence, bonus: totalStats.bonuses.intelligence },
    { key: 'critRate' as const, label: 'CR%', base: baseCrit, total: totalStats.critRate, bonus: totalStats.bonuses.critRate },
  ];

  return (
    <div className="character">
      {/* Header */}
      <div className="char-header">
        <div className="char-divider" />
        <span className="char-title">Character</span>
        <div className="char-level-badge">
          <span className="char-level-num">{level}</span>
          <span className="char-level-lbl">LVL</span>
        </div>
        <div className="char-divider" />
      </div>

      {/* 3D canvas — personaje con equipo en tiempo real */}
      <Canvas
        className="character-3d"
        camera={{ position: [0, 0.2, 3.2], fov: 42 }}
        gl={async (props) => {
          extend(THREE as any)
          const renderer = new WebGPURenderer({
            canvas: props.canvas,
            antialias: true,
            alpha: true,
          })
          await renderer.init()
          return renderer
        }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[2, 4, 3]} intensity={14} color="#ffe8c0" />
        <pointLight position={[-2, 1, 2]} intensity={5} color="#a0b8ff" />
        <pointLight position={[0, 2, -3]} intensity={6} color="#ff6030" />
        <CharacterPreview playerId={playerId} />
        <color attach="background" args={['#6d0a0aa5']} />
        <OrbitControls maxPolarAngle={Math.PI / 2.3} minPolarAngle={Math.PI / 3} enablePan={false} />
      </Canvas>

      {renderGrid(leftSlots, 'left', true)}
      {renderGrid(rightSlots, 'right', true)}
      {renderGrid(bottomSlots, 'bottom', false)}

      {/* Stats */}
      <div className="character-stats">
        <div className="stat-bar stat-bar--hp">
          <div className="stat-bar__fill" style={{ width: `${Math.min(100, (hp / maxHp) * 100)}%` }} />
          <span className="stat-bar__label">❤ {hp} / {maxHp}</span>
        </div>
        <div className="stat-bar stat-bar--mana">
          <div className="stat-bar__fill" style={{ width: `${Math.min(100, (mana / maxMana) * 100)}%` }} />
          <span className="stat-bar__label">✦ {mana} / {maxMana}</span>
        </div>
        <div className="stat-bar stat-bar--exp">
          <div className="stat-bar__fill" style={{ width: `${Math.min(100, (exp / expToNext) * 100)}%` }} />
          <span className="stat-bar__label">◈ {exp} / {expToNext} XP</span>
        </div>

        {statPoints > 0 && (
          <div className="stat-points-banner">
            <span className="banner-rune">⍟</span>
            {statPoints} point{statPoints > 1 ? 's' : ''} to spend
            <span className="banner-rune">⍟</span>
          </div>
        )}

        <div className="attributes-table">
          {attrs.map(({ key, label, total, bonus }) => (
            <div key={key} className="attr-row">
              <span className="attr-label">{label}</span>
              <div className="attr-track">
                <div className="attr-track__fill" style={{ width: `${Math.min(100, (total / 100) * 100)}%` }} />
              </div>
              <span className="attr-value">{total}</span>
              {bonus > 0 && <span className="attr-bonus">+{bonus}</span>}
              {statPoints > 0 && (
                <button className="attr-plus" onClick={() => spendStatPoint(key)}>+</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
