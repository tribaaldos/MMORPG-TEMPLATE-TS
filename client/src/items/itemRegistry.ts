
// ...importa lo que uses

import { BasicSword } from "./storage/WeaponsStorage";
import { BasicSword2 } from "./storage/WeaponsStorage";
import { BasicShoulder } from "./storage/ShouldersStorage";
import { BasicPants } from "./storage/PantsStorage";

export const itemRegistry = {
  BasicSword,
  BasicSword2,
  BasicShoulder,
  BasicPants,

  // añade aquí todos los equipables que realmente existan en tu build
};

// opcional: type helper
export type ItemKey = keyof typeof itemRegistry;
