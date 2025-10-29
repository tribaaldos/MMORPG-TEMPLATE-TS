
// ...importa lo que uses

import { BasicSword, FireWeaponItem } from "./storage/WeaponsStorage";
import { BasicGreenShoulderItem, BasicShoulder } from "./storage/ShouldersStorage";
import { BasicPants } from "./storage/PantsStorage";
import { DragonBootsItem } from "./storage/BootsStorage";
import { IronGlovesItem } from "./storage/GlovesStorage";
import { ShredShieldItem } from "./storage/ShieldStorage";

export const itemRegistry = {
  BasicSword,
  BasicShoulder,
  BasicPants,
  FireWeaponItem,
  DragonBootsItem,
  IronGlovesItem,
  BasicGreenShoulderItem,
  ShredShieldItem,

  // añade aquí todos los equipables que realmente existan en tu build
};

// opcional: type helper
export type ItemKey = keyof typeof itemRegistry;
