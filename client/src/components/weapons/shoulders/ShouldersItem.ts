import { Item } from '../../../store/useInventoryStore';
import Heal from '../../../../public/skills/heal.svg';
import ShoulderPadsModel from './ShouldersModel';
export const ShoulderPadsItem: Item & { Model: typeof ShoulderPadsModel } = {
  name: 'Shoulder Pads',
  type: 'shoulders',
  image: Heal,
  attack: 3,
  rarity: 'rare',
  Model: ShoulderPadsModel,
};
