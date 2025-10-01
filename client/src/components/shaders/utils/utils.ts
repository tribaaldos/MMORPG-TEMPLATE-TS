import type { Vector2 } from "three";
import { vec2, vec4, floor, fract, mod, mul, sub, add, abs, dot, mix, sin, } from "three/tsl";

// Función permute idéntica al GLSL
const permute = (x: any) =>
  mod(mul(add(mul(x, 34.0), 1.0), x), 289.0);

// Función fade igual que en GLSL
export const fade = (t: any) =>
  mul(
    mul(mul(t, t), t),
    add(mul(t, add(mul(t, 6.0),
      sub(0.0, 15.0))), 10.0)
  );

// Función cnoise adaptada para TSL, sin mutaciones in-place
export const cnoise = (P: any) => {
  // Obtener posición entera y fraccionaria (expandida a vec4)
  const Pi = add(floor(P.xyxy), vec4(0.0, 0.0, 1.0, 1.0));
  const Pf = sub(fract(P.xyxy), vec4(0.0, 0.0, 1.0, 1.0));
  const PiMod = mod(Pi, 289.0);

  const ix = vec4(PiMod.x, PiMod.z, PiMod.x, PiMod.z);
  const iy = vec4(PiMod.y, PiMod.y, PiMod.w, PiMod.w);
  const fx = vec4(Pf.x, Pf.z, Pf.x, Pf.z);
  const fy = vec4(Pf.y, Pf.y, Pf.w, Pf.w);

  // Permutaciones
  const i = permute(add(permute(ix), iy));

  // Gradientes
  let gx = sub(mul(2.0, fract(mul(i, 0.0243902439))), 1.0);
  const gy = sub(abs(gx), 0.5);
  const tx = floor(add(gx, 0.5));
  gx = sub(gx, tx);

  // Crear vectores gradientes
  const g00 = vec2(gx.x, gy.x);
  const g10 = vec2(gx.y, gy.y);
  const g01 = vec2(gx.z, gy.z);
  const g11 = vec2(gx.w, gy.w);

  // Normalización (factor de corrección)
  const norm = sub(
    1.79284291400159,
    mul(
      0.85373472095314,
      vec4(
        dot(g00, g00),
        dot(g01, g01),
        dot(g10, g10),
        dot(g11, g11)
      )
    )
  );

  // Aplicar normalización multiplicando, sin mutar vectores originales
  const g00n = mul(g00, norm.x);
  const g01n = mul(g01, norm.y);
  const g10n = mul(g10, norm.z);
  const g11n = mul(g11, norm.w);

  // Producto punto entre gradientes y desplazamientos fraccionales
  const n00 = dot(g00n, vec2(fx.x, fy.x));
  const n10 = dot(g10n, vec2(fx.y, fy.y));
  const n01 = dot(g01n, vec2(fx.z, fy.z));
  const n11 = dot(g11n, vec2(fx.w, fy.w));

  // Interpolación fade para suavizar transición
  const fade_xy = fade(vec2(Pf.x, Pf.y));
  const n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  const n_xy = mix(n_x.x, n_x.y, fade_xy.y);

  // Escalar resultado final igual que GLSL
  return mul(2.3, n_xy);
};

const randomTSL = (st: any) =>
  fract(
    sin(
      dot(st, vec2(12.9898, 78.233))
    ).mul(437586.543123)
  )
