import { Item } from "../../store/useInventoryStore";
import DragonBootsModel from "../boots/DragonBoots";
import { EquipmentModel } from '../../character/EquipmentType';
import SwordSVG from '../../components/svg/Sword';

export const DragonBootsItem: Item & { Model: EquipmentModel } = {
    name: 'Dragon Boots',
    type: 'boots',
    image: SwordSVG,

    defense: 50,
    rarity: 'epic',
    Model: DragonBootsModel,
}

