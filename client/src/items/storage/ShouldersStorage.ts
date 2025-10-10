import { EquipmentModel } from '../../character/EquipmentType';
import { Item } from '../../store/useInventoryStore';
import Heal from '../../../public/skills/heal.svg';
import ShoulderSVG from '../../components/svg/ShoulderSVG';
import SwordSVG from '../../components/svg/Sword';
import BasicShoulders from '../shoulders/BasicShoulders';



export const BasicShoulder: Item & { Model: EquipmentModel } = {
  name: 'Basic Shoulder',
  type: 'shoulders',
  image: SwordSVG,
  attack: 3,
  rarity: 'common',
  Model: BasicShoulders
}
