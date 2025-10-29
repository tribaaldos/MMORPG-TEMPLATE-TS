import { EquipmentModel } from '../../character/EquipmentType';
import { Item } from '../../store/useInventoryStore';
import Heal from '../../../public/skills/heal.svg';
import ShoulderSVG from '../../components/svg/ShoulderSVG';
import SwordSVG from '../../components/svg/Sword';
import BasicShoulders from '../shoulders/BasicShoulders';
import BasicGreenShoulder from '../shoulders/BasicGreenShoulders';



export const BasicShoulder: Item & { Model: EquipmentModel } = {
  name: 'Basic Shoulder',
  type: 'shoulders',
  image: ShoulderSVG,
  attack: 3,
  rarity: 'common',
  Model: BasicShoulders
}

export const BasicGreenShoulderItem: Item & { Model: EquipmentModel } = {
  name: 'Basic Green Shoulder',
  type: 'shoulders',
  image: ShoulderSVG,
  attack: 5,
  rarity: 'uncommon',
  Model: BasicGreenShoulder
}