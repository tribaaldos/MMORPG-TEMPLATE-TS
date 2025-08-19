import React from 'react';
import './Character.css';
import { Canvas } from '@react-three/fiber';
import { useDrop } from 'react-dnd';
import { useInventoryStore, EquipmentSlot } from '../../../store/useInventoryStore';
import BasicCharacterModel from '../../../character/BasicCharacterModel';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { useCharacterStore } from '../../../store/useCharacterStore';

/** Forma del ítem arrastrado */
interface DraggedItem {
  index: number;
}

export default function UICharacter() {
  // Stats del jugador (lectura estática)
  const { hp, mana, exp, level, strength, agility, intelligence, critRate } =
    useCharacterStore.getState();

  // Inventario y equipamiento
  const equipment = useInventoryStore((state) => state.equipment);
  const equipItem = useInventoryStore((state) => state.equipItem);
  const unequipItem = useInventoryStore((state) => state.unequipItem);

  // Maneja clic derecho para desequipar
  const handleRightClick = (
    e: React.MouseEvent<HTMLDivElement>,
    slotType: EquipmentSlot
  ): void => {
    e.preventDefault();
    unequipItem(slotType);
  };

  const slots: EquipmentSlot[] = [
    'helmet',
    'chest',
    'legs',
    'boots',
    'gloves',
    'weapon',
    'shield',
  ];

  // Máximos para barras (ajusta según tu lógica)
  const maxHp = 100;
  const maxMana = 100;
  const expToNext = 1000;

  return (
    <div className="character">
      <h2>🧍 Character</h2>

      <Canvas
        className="character-3d"
        orthographic
        camera={{ position: [0, 1, 5], zoom: 50, near: 0.1, far: 100 }}
      >
        <OrthographicCamera makeDefault position={[0, 1, 5]} zoom={50} />
        <pointLight position={[10, 10, 10]} intensity={1000.5} />
        <OrbitControls
          enableRotate={true}
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
          target={[0, 1, 0]}
        />
        <BasicCharacterModel animation="idle" />
      </Canvas>

      <div className="equipment-grid">
        {slots.map((slotType) => {
          const [, dropRef] = useDrop<DraggedItem, void, unknown>(
            () => ({
              accept: 'ITEM',
              drop: (dragged) => equipItem(dragged.index, slotType),
            }),
            [equipItem, slotType]
          );

          return (
            <div
              key={slotType}
              // @ts-ignore
              ref={dropRef}
              className="equipment-slot"
              onContextMenu={(e) => handleRightClick(e, slotType)}
              title="Right-click to unequip"
            >
              <span className="slot-label">{slotType}</span>
              {equipment[slotType] ? (
                <img
                  src={equipment[slotType]!.image}
                  alt={equipment[slotType]!.name}
                />
              ) : (
                <span className="empty">Empty</span>
              )}
            </div>
          );
        })}
      </div>

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
