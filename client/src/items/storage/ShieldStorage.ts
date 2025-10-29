import { EquipmentModel } from "../../character/EquipmentType";
import SwordSVG from "../../components/svg/Sword";
import { Item } from "../../store/useInventoryStore";
import IronGloves from "../gloves/IronGloves";
import ShredShield from "../shields/ShredShield";
import ImagenShield from '../../../public/items/shields/ShieldShred/imageShieldShred.png'

export const ShredShieldItem: Item & { Model: EquipmentModel } = {
    name: 'Shred Shield',
    type: 'shield',
    image: ImagenShield,
    attack: 10,
    rarity: 'common',
    Model: ShredShield, // Assign the actual model component here
}   