import { Item } from "../../../store/useInventoryStore";

import Heal from '../../../../public/skills/heal.svg';
import ChestModel from "./ChestModel";

export const ChestItem: Item & { Model: typeof ChestModel } = {
  name: 'Chest 1',
  type: 'chest',
  image: Heal,
  attack: 5,
  rarity: 'common',
  Model: ChestModel,
};