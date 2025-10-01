// Sword-Item.ts
import { Item } from '../../../store/useInventoryStore';
import WeaponModel from './WeaponModel';
import WeaponModel2 from './WeaponModel2';
import Sword from '../../../../public/skills/sword.svg';

export const swordItem: Item & { Model: typeof WeaponModel } = {
  name: 'Iron Sword',
  type: 'weapon',
  image: Sword,
  attack: 5,
  rarity: 'common',
  Model: WeaponModel, // ✅ la función del componente
};

export const swordItem2: Item & { Model: typeof WeaponModel2 } = {
  name: 'Steel Sword',
  type: 'weapon',
  image: '/images/steel_sword.png',
  attack: 8,
  rarity: 'uncommon',
  Model: WeaponModel2,
};
