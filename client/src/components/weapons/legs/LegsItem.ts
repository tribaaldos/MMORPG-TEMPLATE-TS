import { Item } from "../../../store/useInventoryStore";

import Heal from '../../../../public/skills/heal.svg';
import LegsModel from "./LegsModel";
import LegsRigged from "../../../character/newCharacter/LegsRigged";
import { EquipmentModel } from "../../../character/EquipmentType";
export const LegsItem: Item & { Model:  EquipmentModel } = {
  name: 'Legs 1 ',
  type: 'legs',
  image: Heal,
  attack: 5,
  rarity: 'common',
  Model: LegsRigged, // ✅ la función del componente
};