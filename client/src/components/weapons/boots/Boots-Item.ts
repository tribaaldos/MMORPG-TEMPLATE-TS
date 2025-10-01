// Sword-Item.ts
import { Item } from '../../../store/useInventoryStore';

import Heal from '../../../../public/skills/heal.svg';
import BootsModel from './BootsModel';

export const BootsItem: Item & { Model: typeof BootsModel } = {
  name: 'Boots 1 ',
  type: 'boots',
  image: Heal,
  attack: 5,
  rarity: 'legendary',
  Model: BootsModel, // ✅ la función del componente
};