// Sword-Item.ts
import SwordSVG from '../../components/svg/Sword';
import BVHWeapon from '../weapons/WeaponBVH';


export const BasicSword = {
  name: 'Iron Sword',
  type: 'weapon',
  image: SwordSVG,                       // 👈 componente
  imageProps: {                          // 👈 props ajustadas aquí
    size: 48,
    backgroundColor: 'red',
    iconColor: '#FFD700',
  },
  attack: 500,
  rarity: 'legendary',
  // Model: SecondSwordModel,
  Model: BVHWeapon,
} as const;


export const BasicSword2 = {
  name: 'Iron Sword',
  type: 'weapon',
  image: SwordSVG,                       // 👈 componente
  imageProps: {                          // 👈 props ajustadas aquí
    size: 48,
    backgroundColor: 'blue',
    iconColor: '#FFD700',
  },
  attack: 5,
  rarity: 'legendary',
  Model: BVHWeapon,
} as const;
