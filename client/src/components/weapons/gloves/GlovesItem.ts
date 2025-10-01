import { Item } from '../../../store/useInventoryStore';
import Heal from '../../../../public/skills/heal.svg'; // Puedes usar otra imagen
import GlovesModel from './GlovesModel';

export const GlovesItem: Item & { Model: typeof GlovesModel } = {
  name: 'Gloves 1',
  type: 'gloves',
  image: Heal,
  attack: 2,
  rarity: 'rare',
  Model: GlovesModel,
};
