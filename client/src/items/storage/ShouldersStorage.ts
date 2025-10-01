import { EquipmentModel } from '../../character/EquipmentType';
import { Item } from '../../store/useInventoryStore';
import Shoulder from '../../old/head/Shoulder';
import Heal from '../../../public/skills/heal.svg';
import ShoulderSVG from '../../components/svg/ShoulderSVG';
import ShouldersTwo from '../../old/head/Shoulder2';
import SwordSVG from '../../components/svg/Sword';
import BasicShoulders from '../shoulders/BasicShoulders';


export const ShoulderPincho: Item & { Model: EquipmentModel } = {
  name: 'Shoulder Pads',
  type: 'shoulders',
  image: ShoulderSVG,
  attack: 3,
  rarity: 'rare',
  Model: Shoulder,
};

export const ShoulderPincho2: Item & { Model: EquipmentModel } = {
  name: 'Shoulder 2',
  type: 'shoulders',
  image: ShoulderSVG,
  attack: 3,
  rarity: 'rare',
  Model: ShouldersTwo,
};

export const BasicShoulder: Item & { Model: EquipmentModel } = {
  name: 'Basic Shoulder',
  type: 'shoulders',
  image: SwordSVG,
  attack: 3,
  rarity: 'common',
  Model: BasicShoulders
}
