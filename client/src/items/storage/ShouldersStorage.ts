import { EquipmentModel } from '../../character/EquipmentType';
import { Item } from '../../store/useInventoryStore';
import Heal from '../../../public/skills/heal.svg';
import ShoulderSVG from '../../components/svg/ShoulderSVG';
import SwordSVG from '../../components/svg/Sword';
import BasicShoulders from '../shoulders/BasicShoulders';
import BasicGreenShoulder from '../shoulders/BasicGreenShoulders';
import GreenShoulderMin from '../../../public/greenshoulder.png'


export const BasicShoulder: Item & { Model: EquipmentModel } = {
  name: 'Basic Shoulder',
  type: 'shoulders',
  image: ShoulderSVG,
  attack: 3,
  rarity: 'common',
  bonuses: { agility: 3 },
  Model: BasicShoulders
}

export const BasicGreenShoulderItem: Item & { Model: EquipmentModel } = {
  name: 'Basic Green Shoulder',
  type: 'shoulders',
  image: GreenShoulderMin,
  attack: 5,
  rarity: 'uncommon',
  bonuses: { agility: 5, maxHp: 20, intelligence: 50 },
  Model: BasicGreenShoulder
}