// Sword-Item.ts
import SwordSVG from '../../components/svg/Sword';
import BVHWeapon from '../weapons/WeaponBVH';
import WeaponPhoto from '../../../public/items/weapons/weapon.png'
import SwordImageSVG from '../../components/svg/Sword';
import FireWeapon from '../weapons/FireWeapon';
import FireWeaponImg from '../../../public/items/weapons/fireWeapon.png'

export const BasicSword = {
  name: 'Iron Sword',
  type: 'weapon',
  image: SwordImageSVG,
  imageProps: {
    size: 52,
    backgroundColor: 'blue',
    iconColor: '#FFD700',
  },
  attack: 500,
  rarity: 'legendary',
  bonuses: { strength: 8, critRate: 5 },
  Model: BVHWeapon,
} as const;



export const FireWeaponItem = {
  name: 'Volcanic Axe',
  type: 'weapon',
  image: FireWeaponImg,                       // 👈 component
  imageProps: {                          // 👈 props ajustadas aquí
    size: 48,
    backgroundColor: 'blue',
    iconColor: '#FFD700',
  },
  attack: 5,
  rarity: 'legendary',
  Model: FireWeapon,
} as const;
