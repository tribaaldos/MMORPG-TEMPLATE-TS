// Sword-Item.ts
import { Item } from '../../../store/useInventoryStore';

import Heal from '../../../../public/skills/heal.svg';
import { ShieldModel } from './ShieldModel';

export const ShieldItem: Item & { Model: typeof ShieldModel } = {
  name: 'shield 1 ',
  type: 'shield',
  image: Heal,
  attack: 5,
  rarity: 'common',
  Model: ShieldModel, // ✅ la función del componente
};