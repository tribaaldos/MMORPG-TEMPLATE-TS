import React, { useCallback, useEffect, useState } from 'react';
import './Character.css';
import { Canvas } from '@react-three/fiber';
import { useDrop } from 'react-dnd';
import BasicCharacterModel from '../../../old/newCharacter/BasicCharacterModel';
import { PerspectiveCamera } from '@react-three/drei';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { useInventoryStore, Item } from '../../../store/useInventoryStore';
import { emitPlayerEquipment, socket } from '../../../socket/SocketManager';
import AnimatedCharacterModel from '../../../character/noPhysicsCharacter/CharacterModel';
import { ItemKey, itemRegistry } from '../../../items/itemRegistry';

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
  // ——— playerId SIEMPRE local (socket.id) ———
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

  // Stats
  const hp = useCharacterStore(s => s.hp);
  const mana = useCharacterStore(s => s.mana);
  const exp = useCharacterStore(s => s.exp);
  const level = useCharacterStore(s => s.level);
  const strength = useCharacterStore(s => s.strength);
  const agility = useCharacterStore(s => s.agility);
  const intelligence = useCharacterStore(s => s.intelligence);
  const critRate = useCharacterStore(s => s.critRate);

  // Store inventario/equipo (scoped por playerId)
  const ensurePlayer = useInventoryStore(s => s.ensurePlayer);
  useEffect(() => {
    ensurePlayer(playerId);
  }, [ensurePlayer, playerId]);

  const equipment = useInventoryStore(s => s.equipmentByPlayer[playerId]);
  const equipItem = useInventoryStore(s => s.equipItem);
  const unequipItem = useInventoryStore(s => s.unequipItem);

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

  // slots “de UI”; algunos no existen en el store (neck, back, bracers, waist) → se verán vacíos
  const leftSlots = ['helmet', 'neck', 'shoulders', 'back', 'chest', 'bracers'] as const;
  const rightSlots = ['gloves', 'waist', 'legs', 'boots', 'ring', 'trinket'] as const;
  const bottomSlots = ['weapon', 'shield'] as const;

  const maxHp = 100, maxMana = 100, expToNext = 1000;

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
          () => ({
            accept: 'ITEM',
            drop: (dragged) => equipItem(playerId, dragged.index, slot as any),
          }),
          [equipItem, playerId, slot]
        );

        const item = (equipment as any)?.[slot];

        return (
          <div
            key={slot}
            ref={dropRef as any}
            className="equipment-slot"
            onContextMenu={(e) => handleRightClick(e, slot)}
            title="Right-click to unequip"
          >
            {item ? (
              <div className="item-wrapper">
                {renderEquipIcon(item)}
                <div className="tooltip tooltip--char">
                  {renderTooltipIcon(item)}
                  <h4 className={`tooltip-name ${item.rarity || 'common'}`}>{item.name}</h4>
                  {item.description && <p className="tooltip-desc">{item.description}</p>}
                  <ul className="tooltip-stats">
                    {item.attack && <li>⚔️ Attack: {item.attack}</li>}
                    {item.defense && <li>🛡️ Defense: {item.defense}</li>}
                  </ul>
                </div>
              </div>
            ) : (
              <>
                <span className="slot-label">{slot}</span>
                <span className="empty">Empty</span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="character">
      <h2>🧍 Character</h2>

      <Canvas className="character-3d" camera={{ position: [0, 1, 2] }}>
        <PerspectiveCamera makeDefault position={[0, 0.8, 5]} zoom={2} />
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 5, 0]} intensity={10} />
        {/* El modelo local usará este playerId (socket.id) */}
        {/* <AnimatedCharacterModel animStatus="idle" pla yerId={playerId} /> */}
      </Canvas>

      {renderGrid(leftSlots, 'left', true)}
      {renderGrid(rightSlots, 'right', true)}
      {renderGrid(bottomSlots, 'bottom', false)}

      <div className="character-stats">
        <div className="stat-bar hp">
          <span style={{ width: `${(hp / maxHp) * 100}%` }} />
          {hp}/{maxHp}
        </div>
        <div className="stat-bar mana">
          <span style={{ width: `${(mana / maxMana) * 100}%` }} />
          {mana}/{maxMana}
        </div>
        <div className="stat-bar exp">
          <span style={{ width: `${(exp / expToNext) * 100}%` }} />
          {exp}/{expToNext}
        </div>
        <div className="attributes">
          <span>Lvl {level}</span>
          <span>STR {strength}</span>
          <span>AGI {agility}</span>
          <span>INT {intelligence}</span>
          <span>CR {critRate}%</span>
        </div>
      </div>
    </div>
  );
}
