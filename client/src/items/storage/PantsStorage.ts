import { EquipmentModel } from "../../character/EquipmentType";
import SwordSVG from "../../components/svg/Sword";
import { Item } from "../../store/useInventoryStore";
import PantsModel from "../pants/PantsModel";


export const BasicPants: Item & { Model: EquipmentModel } = {
    name: 'Basic Pants',
    type: 'legs',
    image: SwordSVG,
    attack: 3,
    rarity: 'common',
    Model: PantsModel, // Assign the actual model component here
}   