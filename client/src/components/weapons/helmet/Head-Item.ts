
// Sword-Item.ts
import { Item } from '../../../store/useInventoryStore';

import Heal from '../../../../public/skills/heal.svg';
import HelmetModel from './HelmetModel';
import Cap from '../../../old/head/Cap';
import CapTwo from '../../../old/head/Cap2';
// NEW 

export const CapItem: Item & { Model: typeof Cap } = {
  name: 'Cap',
  type: 'helmet',
  image: Heal,
  attack: 5,
  rarity: 'common',
  Model: Cap, // ✅ la función del componente
};
export const CapItemTwo: Item & { Model: typeof Cap } = {
  name: 'Cap',
  type: 'helmet',
  image: Heal,
  attack: 5,
  rarity: 'common',
  Model: CapTwo, // ✅ la función del componente
};



// OLD

export const HeadItem: Item & { Model: typeof HelmetModel } = {
  name: 'Head 1 ',
  type: 'helmet',
  image: Heal,
  attack: 5,
  rarity: 'common',
  Model: HelmetModel, // ✅ la función del componente
};

export const HeadItem2: Item & { Model: typeof HelmetModel } = {
  name: 'Head 2 ',
  type: 'helmet',
  image: Heal,
  attack: 8,
  rarity: 'uncommon',
  Model: HelmetModel,
};
