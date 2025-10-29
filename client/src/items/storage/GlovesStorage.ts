import { EquipmentModel } from "../../character/EquipmentType";
import SwordSVG from "../../components/svg/Sword";
import { Item } from "../../store/useInventoryStore";
import IronGloves from "../gloves/IronGloves";


export const IronGlovesItem: Item & { Model: EquipmentModel } = {
    name: 'Iron Gloves',
    type: 'gloves',
    image: SwordSVG,
    attack: 10,
    rarity: 'common',
    Model: IronGloves, // Assign the actual model component here
}   