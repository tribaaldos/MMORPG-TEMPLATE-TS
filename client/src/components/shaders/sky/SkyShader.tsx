import { useMemo, useEffect } from 'react';
import {
  vec3, vec2, float, color, uniform,
  positionLocal, time, normalize, dot, mix, smoothstep,
  pow, abs, sin, cos, clamp, max, fract, Fn,
  PI, triNoise3D, cross
} from 'three/tsl';
import * as THREE from 'three/webgpu';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { create } from 'zustand';

// ── Store for day/night time (0-24h) ────────
interface TimeStore {
  hour: number;
  setHour: (h: number) => void;
}
export const useTimeStore = create<TimeStore>((set) => ({
  hour: 14,
  setHour: (h) => set({ hour: h }),
}));


// CPU-side horizon color — mirrors GPU math at y=0 for dynamic fog sync
function smoothstepCPU(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}
export function getHorizonColor(hour: number): THREE.Color {
  const t = hour / 24
  const sunAngle = t * Math.PI * 2 - Math.PI
  const sunY = Math.sin(sunAngle)
  const dayFactor = smoothstepCPU(-0.2, 0.4, sunY)
  // horizon (h=0) base color
  const dayHorizon = new THREE.Color(0x87ceeb)
  const nightHorizon = new THREE.Color(0x0e0e2a)
  const base = new THREE.Color().lerpColors(nightHorizon, dayHorizon, dayFactor)
  // sunset/sunrise orange glow at horizon
  const nearHorizon = smoothstepCPU(-0.25, 0.05, sunY) * smoothstepCPU(0.5, 0.0, sunY)
  base.lerp(new THREE.Color(0xff5511), nearHorizon * 0.75)
  return base;
}
  // Uniform: 0-1 representing day cycle (0=midnight, 0.5=noon)
  const timeOfDay = uniform(0.5);

  const skyColor = Fn(() => {
    const dir = normalize(positionLocal);
    const y = dir.y;

    // ── TIME (driven by uniform from slider) ──
    const t = timeOfDay; // 0=midnight, 0.5=noon, 1=midnight
    const sunAngle = t.mul(PI.mul(2.0)).sub(PI);
    const sunY = sin(sunAngle);
    const sunX = cos(sunAngle);
    const dayFactor = smoothstep(-0.2, 0.4, sunY);
    const nightFactor = float(1.0).sub(dayFactor);

    // ── SKY GRADIENT ──────────────────────────
    const h = smoothstep(-0.05, 0.7, y);
    const daySky = mix(color(0x87ceeb), color(0x1a6fc4), h);
    const nightSky = mix(color(0x0e0e2a), color(0x020210), h);
    const sky = mix(nightSky, daySky, dayFactor).toVar();

    // ── SUNSET / SUNRISE ──────────────────────
    const horizonBand = smoothstep(0.5, 0.0, abs(y));
    const nearHorizon = smoothstep(-0.25, 0.05, sunY).mul(smoothstep(0.5, 0.0, sunY));
    const glowStr = horizonBand.mul(nearHorizon);
    sky.assign(mix(sky, color(0xff5511), glowStr.mul(0.75)));

    // ── SUN (only when above horizon) ──────────
    const sunDir = normalize(vec3(sunX, sunY, float(0.0)));
    const sd = clamp(dot(dir, sunDir), 0.0, 1.0);
    // Sun only visible when sunY > 0 (above horizon)
    const sunVis = smoothstep(0.0, 0.15, sunY);

    sky.assign(mix(sky, color(0xffdd77), pow(sd, 8.0).mul(0.15).mul(sunVis)));
    sky.assign(mix(sky, color(0xfffff5), pow(sd, 64.0).mul(0.8).mul(sunVis)));
    sky.assign(mix(sky, color(0xfffff5), smoothstep(0.990, 0.997, sd).mul(sunVis)));

    // ── MOON ──────────────────────────────────
    const moonDir = normalize(vec3(sunX.negate(), sunY.negate(), float(0.0)));
    const md = clamp(dot(dir, moonDir), 0.0, 1.0);
    const moonVis = smoothstep(-0.05, 0.1, sunY.negate());
    sky.assign(mix(sky, color(0xc8d8ff), pow(md, 48.0).mul(0.12).mul(moonVis)));
    sky.assign(mix(sky, color(0xc8d8ff), smoothstep(0.9985, 0.9995, md).mul(moonVis)));

    // ── STARS (static, round, tiny) ────────────
    const starMask = smoothstep(-0.05, 0.15, y).mul(nightFactor);

    // Layer 1: many dim stars
    const sUV1 = vec2(dir.x.mul(80.0).add(dir.z.mul(50.0)), dir.y.mul(80.0).add(dir.x.mul(30.0)));
    const sCell1 = vec2(sUV1.x.floor(), sUV1.y.floor());
    const sFrac1 = vec2(fract(sUV1.x), fract(sUV1.y));
    const sh1 = fract(sCell1.x.mul(127.1).add(sCell1.y.mul(311.7)).sin().mul(43758.5453));
    const sh1b = fract(sCell1.x.mul(269.5).add(sCell1.y.mul(183.3)).sin().mul(43758.5453));
    const d1 = sFrac1.sub(vec2(sh1.mul(0.6).add(0.2), sh1b.mul(0.6).add(0.2))).length();
    const s1 = smoothstep(0.025, 0.0, d1).mul(smoothstep(0.90, 0.93, sh1)).mul(0.4);

    // Layer 2: medium stars
    const sUV2 = vec2(dir.x.mul(45.0).add(dir.z.mul(30.0)), dir.y.mul(45.0).add(dir.z.mul(20.0)));
    const sCell2 = vec2(sUV2.x.floor(), sUV2.y.floor());
    const sFrac2 = vec2(fract(sUV2.x), fract(sUV2.y));
    const sh2 = fract(sCell2.x.mul(419.2).add(sCell2.y.mul(71.9)).sin().mul(43758.5453));
    const sh2b = fract(sCell2.x.mul(53.7).add(sCell2.y.mul(197.1)).sin().mul(43758.5453));
    const d2 = sFrac2.sub(vec2(sh2.mul(0.6).add(0.2), sh2b.mul(0.6).add(0.2))).length();
    const s2 = smoothstep(0.03, 0.0, d2).mul(smoothstep(0.94, 0.97, sh2)).mul(0.7);

    // Layer 3: few bright stars
    const sUV3 = vec2(dir.x.mul(22.0).add(dir.z.mul(15.0)), dir.y.mul(22.0).add(dir.x.mul(10.0)));
    const sCell3 = vec2(sUV3.x.floor(), sUV3.y.floor());
    const sFrac3 = vec2(fract(sUV3.x), fract(sUV3.y));
    const sh3 = fract(sCell3.x.mul(317.3).add(sCell3.y.mul(42.9)).sin().mul(43758.5453));
    const sh3b = fract(sCell3.x.mul(91.7).add(sCell3.y.mul(263.1)).sin().mul(43758.5453));
    const d3 = sFrac3.sub(vec2(sh3.mul(0.6).add(0.2), sh3b.mul(0.6).add(0.2))).length();
    const s3 = smoothstep(0.035, 0.0, d3).mul(smoothstep(0.96, 0.99, sh3));

    const totalStars = clamp(s1.add(s2).add(s3), 0.0, 1.0);
    const starCol = mix(color(0xccddff), color(0xffeedd), sh1);
    sky.assign(mix(sky, starCol, totalStars.mul(starMask)));

    // ── MILKY WAY (simplified band across the sky) ──
    // Galaxy orientation: more horizontal axis
    const gAxis = normalize(vec3(0.8, 0.3, 0.5));
    const gRef = vec3(0.0, 1.0, 0.0);
    const gProj = normalize(cross(gAxis, cross(gRef, gAxis)));

    // Local frame for noise sampling
    const gX = normalize(cross(gRef, gAxis));
    const gY = normalize(cross(gX, gRef));
    const gZ = normalize(cross(gY, gX));
    const gDir = vec3(dot(gX, dir), dot(gY, dir), dot(gZ, dir));

    // ─ Simple brightness band along galactic plane
    const bandWidth = smoothstep(0.5, 0.0, abs(dot(dir, gAxis)));

    // ─ Gentle center glow (warm)
    const coreGlow = pow(bandWidth, 2.0).mul(0.6);
    const coreNoise = triNoise3D(gDir.mul(3.0), float(0.15), float(50.0));
    const mwCore = max(float(0.35), coreGlow.sub(coreNoise.mul(0.2)));

    // ─ Outer glow layers (softer transition)
    const glowA = smoothstep(0.0, 0.6, dot(dir, gAxis.negate().add(gProj.mul(0.4))).add(0.3));
    const glowB = smoothstep(0.0, 0.6, dot(dir, gAxis.add(gProj.mul(0.4))).add(0.3));
    const mwGlowMask = glowA.mul(glowB).mul(0.4);

    // ─ Compose: greenish nebula coloring
    const mwCol = vec3(0.0, 0.0, 0.0).toVar();
    const mwLilacBand = pow(bandWidth, 5.0);
    mwCol.addAssign(vec3(0.75, 0.3, 1.0).mul(mwLilacBand.mul(0.5)));

    // Verdant center band (bright green)
    mwCol.addAssign(vec3(0.3, 1.0, 0.4).mul(mwCore.mul(0.25)));
    // Green-cyan glow halo
    mwCol.addAssign(vec3(0.2, 0.8, 0.7).mul(mwGlowMask.mul(0.15)));

    // Dense tiny stars concentrated in the galactic band
    const mwBandStr = smoothstep(0.45, 0.0, abs(dot(dir, gAxis)));
    // Layer A: dense faint stars
    const mwSUV1 = vec2(dir.x.mul(140.0).add(dir.z.mul(90.0)), dir.y.mul(100.0).add(dir.z.mul(50.0)));
    const mwSC1 = vec2(mwSUV1.x.floor(), mwSUV1.y.floor());
    const mwSF1 = vec2(fract(mwSUV1.x), fract(mwSUV1.y));
    const mwSH1 = fract(mwSC1.x.mul(137.3).add(mwSC1.y.mul(257.1)).sin().mul(43758.5453));
    const mwSH1b = fract(mwSC1.x.mul(331.7).add(mwSC1.y.mul(83.9)).sin().mul(43758.5453));
    const mwSD1 = mwSF1.sub(vec2(mwSH1.mul(0.6).add(0.2), mwSH1b.mul(0.6).add(0.2))).length();
    const mwS1 = smoothstep(0.014, 0.0, mwSD1).mul(smoothstep(0.75, 0.88, mwSH1)).mul(0.3);

    // Layer B: scattered brighter stars
    const mwSUV2 = vec2(dir.x.mul(70.0).add(dir.z.mul(50.0)), dir.y.mul(80.0).add(dir.x.mul(30.0)));
    const mwSC2 = vec2(mwSUV2.x.floor(), mwSUV2.y.floor());
    const mwSF2 = vec2(fract(mwSUV2.x), fract(mwSUV2.y));
    const mwSH2 = fract(mwSC2.x.mul(419.2).add(mwSC2.y.mul(71.9)).sin().mul(43758.5453));
    const mwSH2b = fract(mwSC2.x.mul(53.7).add(mwSC2.y.mul(197.1)).sin().mul(43758.5453));
    const mwSD2 = mwSF2.sub(vec2(mwSH2.mul(0.6).add(0.2), mwSH2b.mul(0.6).add(0.2))).length();
    const mwS2 = smoothstep(0.016, 0.0, mwSD2).mul(smoothstep(0.82, 0.92, mwSH2)).mul(0.45);

    // Stars blended into the band (warmer tones to contrast with green)
    mwCol.addAssign(vec3(1.0, 0.95, 0.85).mul(mwS1.add(mwS2)).mul(mwBandStr.mul(0.6)));

    sky.assign(sky.add(mwCol.mul(starMask)));

    // ── CLOUDS (triNoise3D) ───────────────────
    const cloudY = max(y.add(0.15), 0.01);
    const cU = dir.x.div(cloudY).mul(0.3);
    const cV = dir.z.div(cloudY).mul(0.3);
    const velocity = 0.0005;
    const cPos1 = vec3(cU.add(time.mul(velocity)), cV.add(time.mul(velocity)), float(0.0)).mul(3.0);
    const cn1 = triNoise3D(cPos1, float(0.15), time);

    const cPos2 = vec3(cU.mul(1.7).sub(time.mul(velocity)), cV.mul(1.7).add(time.mul(velocity)), float(0.5)).mul(2.5);
    const cn2 = triNoise3D(cPos2, float(0.1), time);

    const combined = cn1.mul(0.6).add(cn2.mul(0.4));
    const cloudShape = smoothstep(0.3, 0.6, combined).mul(smoothstep(0.0, 0.2, y));

    const cCol = mix(color(0x161630), color(0xfafafa), dayFactor).toVar();
    cCol.assign(mix(cCol, color(0xff8844), glowStr.mul(0.55)));

    const cloudAlpha = mix(float(0.08), float(0.9), dayFactor);
    sky.assign(mix(sky, cCol, cloudShape.mul(cloudAlpha)));

    return sky;
  });

  export default function SkyShader() {
    const positionPersonaje = useCharacterStore((s) => s.position);
    const hour = useTimeStore((s) => s.hour);

    // Sync store hour (0-24) → uniform (0-1)
    useEffect(() => {
      timeOfDay.value = hour / 24;
    }, [hour]);

    const colorNode = useMemo(() => skyColor(), []);

    return (
      <group position={positionPersonaje}>
        <mesh scale={[500, 500, 500]}>
          <sphereGeometry args={[1, 64, 32]} />
          {/* @ts-ignore */}
          <meshBasicNodeMaterial
            colorNode={colorNode}
            side={THREE.DoubleSide}
            fog={false}
            depthWrite={false}
          />
        </mesh>
      </group>
    );
  }
