// GrassBlock.tsx — infinito, estable, "hoja por hoja", frondoso, batches (<=100k),
// con wave dual (viento natural), variación de color por instancia, y ZONAS SIN CÉSPED
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import {
  positionLocal,
  vec3, float, instanceIndex, fract, sin, uniform, vec4, color, cos, mix, smoothstep, max, time,
  abs,
} from 'three/tsl'
import * as THREE from 'three'
import { useCharacterStore } from '../../store/useCharacterStore'

/* =========================================================================
   ShaderMaterial (batches + viento dual + variación de color + máscaras)
   ========================================================================= */
type ShaderMatProps = {
  colorTop?: string
  colorBottom?: string
  areaSizeProp?: number
  speed?: number
  grid?: number
  perTile?: number
  tileOrigin?: [number, number]
  characterPos?: [number, number, number]
  revealRadius?: number
  revealWidth?: number
  ditherWidth?: number
  batchOffset?: number
  windAmp?: number
  windFreq?: number
  windAmp2?: number
  windFreq2?: number
  colorVariation?: number
  circle1?: [number, number, number]
  circle2?: [number, number, number]
  circle3?: [number, number, number]
  maskEdge?: number
  [k: string]: any
}

export const ShaderMaterial = ({
  colorTop = '#4a8a18',
  colorBottom = '#162c06',
  areaSizeProp = 6.0,
  speed = 1,
  grid = 5,
  perTile = 1000,
  tileOrigin = [0, 0],
  characterPos = [0, 0, 0],
  revealRadius = 12,
  revealWidth = 2,
  ditherWidth = 0.08,
  batchOffset = 0,
  windAmp = 0.15,
  windFreq = 0.6,
  windAmp2 = 0.06,
  windFreq2 = 1.8,
  colorVariation = 0.18,
  circle1 = [1e6, 1e6, 0],
  circle2 = [1e6, 1e6, 0],
  circle3 = [1e6, 1e6, 0],
  maskEdge = 0.5,
  ...props
}: ShaderMatProps) => {
  const uniforms = useRef({
    colorTop: uniform(color(colorTop)),
    colorBottom: uniform(color(colorBottom)),
    areaSize: uniform(areaSizeProp),
    speed: uniform(speed),
    grid: uniform(grid),
    perTile: uniform(perTile),
    tileOrigin: uniform(vec3(tileOrigin[0], 0, tileOrigin[1])),
    characterPos: uniform(vec3(characterPos[0], characterPos[1], characterPos[2])),
    revealRadius: uniform(revealRadius),
    revealWidth: uniform(revealWidth),
    ditherWidth: uniform(ditherWidth),
    batchOffset: uniform(batchOffset),
    windAmp: uniform(windAmp),
    windFreq: uniform(windFreq),
    windAmp2: uniform(windAmp2),
    windFreq2: uniform(windFreq2),
    colorVariation: uniform(colorVariation),
    circle1: uniform(vec3(circle1[0], circle1[1], circle1[2])),
    circle2: uniform(vec3(circle2[0], circle2[1], circle2[2])),
    circle3: uniform(vec3(circle3[0], circle3[1], circle3[2])),
    maskEdge: uniform(maskEdge),
  }).current

  // Static uniforms: only update when leva props actually change
  useEffect(() => { uniforms.colorTop.value.set(colorTop) }, [colorTop])
  useEffect(() => { uniforms.colorBottom.value.set(colorBottom) }, [colorBottom])
  useEffect(() => { uniforms.areaSize.value = areaSizeProp }, [areaSizeProp])
  useEffect(() => { uniforms.speed.value = speed }, [speed])
  useEffect(() => { uniforms.grid.value = grid }, [grid])
  useEffect(() => { uniforms.perTile.value = perTile }, [perTile])
  useEffect(() => { uniforms.revealRadius.value = revealRadius }, [revealRadius])
  useEffect(() => { uniforms.revealWidth.value = revealWidth }, [revealWidth])
  useEffect(() => { uniforms.ditherWidth.value = ditherWidth }, [ditherWidth])
  useEffect(() => { uniforms.batchOffset.value = batchOffset }, [batchOffset])
  useEffect(() => { uniforms.windAmp.value = windAmp }, [windAmp])
  useEffect(() => { uniforms.windFreq.value = windFreq }, [windFreq])
  useEffect(() => { uniforms.windAmp2.value = windAmp2 }, [windAmp2])
  useEffect(() => { uniforms.windFreq2.value = windFreq2 }, [windFreq2])
  useEffect(() => { uniforms.colorVariation.value = colorVariation }, [colorVariation])
  useEffect(() => { uniforms.maskEdge.value = maskEdge }, [maskEdge])
  useEffect(() => {
    const safe = (c: [number, number, number]) => c[2] > 0 ? c : ([1e6, 1e6, 0] as [number, number, number])
    const c1 = safe(circle1), c2 = safe(circle2), c3 = safe(circle3)
    ;(uniforms.circle1.value as any).set(c1[0], c1[1], c1[2])
    ;(uniforms.circle2.value as any).set(c2[0], c2[1], c2[2])
    ;(uniforms.circle3.value as any).set(c3[0], c3[1], c3[2])
  }, [circle1[0], circle1[1], circle1[2], circle2[0], circle2[1], circle2[2], circle3[0], circle3[1], circle3[2]])

  // Dynamic uniforms: position + tileOrigin change every frame
  useFrame(() => {
    ;(uniforms.characterPos.value as any).set(characterPos[0], characterPos[1], characterPos[2])
    ;(uniforms.tileOrigin.value as any).set(tileOrigin[0], 0, tileOrigin[1])
  })

  const nodes = useMemo(() => {
    const idx = instanceIndex.toFloat().add(float(uniforms.batchOffset))

    const areaSize = float(uniforms.areaSize)
    const gridF = float(uniforms.grid)
    const perTileF = float(uniforms.perTile)

    const tileIdx = idx.div(perTileF).floor()
    const tileZ = tileIdx.div(gridF).floor()
    const tileX = tileIdx.sub(tileZ.mul(gridF))
    const localIdx = idx.sub(tileIdx.mul(perTileF))

    const originX = float(uniforms.tileOrigin.x)
    const originZ = float(uniforms.tileOrigin.z)

    const tileWX = originX.add(tileX)
    const tileWZ = originZ.add(tileZ)

    const worldTileX = tileWX.add(0.5).mul(areaSize)
    const worldTileZ = tileWZ.add(0.5).mul(areaSize)

    const seedX = localIdx.mul(12.9898).add(tileWX.mul(0.1)).add(tileWZ.mul(0.311))
    const seedZ = localIdx.mul(78.233).add(tileWX.mul(0.913)).add(tileWZ.mul(0.671))

    const randX = fract(sin(seedX).mul(43758.5453))
    const randZ = fract(sin(seedZ).mul(43758.5453))

    const posX = randX.mul(areaSize).sub(areaSize.mul(0.5))
    const posZ = randZ.mul(areaSize).sub(areaSize.mul(0.5))

    const instancePos = vec3(worldTileX.add(posX), float(0), worldTileZ.add(posZ))

    // Reveal around character
    const charX = float(uniforms.characterPos.x)
    const charZ = float(uniforms.characterPos.z)
    const dx = instancePos.x.sub(charX)
    const dz = instancePos.z.sub(charZ)
    const dist2 = dx.mul(dx).add(dz.mul(dz))

    const R = float(uniforms.revealRadius)
    const W = float(uniforms.revealWidth)
    const rIn2 = R.sub(W).mul(R.sub(W))
    const rOut2 = R.add(W).mul(R.add(W))
    const tReveal = smoothstep(rOut2, rIn2, dist2)

    const seedD = localIdx.mul(1337.0).add(tileWX.mul(0.17)).add(tileWZ.mul(0.37))
    const j = fract(sin(seedD).mul(59341.913))
    const dWidth = float(uniforms.ditherWidth)
    let growth = smoothstep(j, j.add(dWidth), tReveal)

    // Circular masks
    const edge = float(uniforms.maskEdge)
    const circleInside = (cx: any, cz: any, r: any) => {
      const dxC = instancePos.x.sub(cx)
      const dzC = instancePos.z.sub(cz)
      const d2C = dxC.mul(dxC).add(dzC.mul(dzC))
      const rin2 = max(r.sub(edge), float(0.0)).mul(max(r.sub(edge), float(0.0)))
      const rout2 = r.add(edge).mul(r.add(edge))
      return smoothstep(rout2, rin2, d2C)
    }
    const rectInside = (cx: any, cz: any, halfW: any, halfH: any, e: any) => {
      const dxR = abs(instancePos.x.sub(cx))
      const dzR = abs(instancePos.z.sub(cz))
      return smoothstep(halfW.add(e), halfW.sub(e), dxR).mul(smoothstep(halfH.add(e), halfH.sub(e), dzR))
    }

    const c1 = circleInside(float(uniforms.circle1.x), float(uniforms.circle1.y), float(uniforms.circle1.z))
    const c2 = circleInside(float(uniforms.circle2.x), float(uniforms.circle2.y), float(uniforms.circle2.z))
    const c3 = circleInside(float(uniforms.circle3.x), float(uniforms.circle3.y), float(uniforms.circle3.z))
    const cuadrado = rectInside(float(0), float(-0.2), float(4.5), float(3.2), edge)
    const insideMax = max(max(cuadrado, c2), c3)
    const subGrass = growth.mul(float(1.0).sub(insideMax))

    // Random height per instance
    const seedH = localIdx.mul(91.7).add(tileWX.mul(0.3)).add(tileWZ.mul(0.77))
    const rndH = fract(sin(seedH).mul(43758.5453))
    const hFactor = mix(float(0.5), float(1.0), rndH)

    const scaledLocal = vec3(
      positionLocal.x.mul(subGrass),
      positionLocal.y.mul(growth).mul(hFactor),
      positionLocal.z
    )

    // ── Dual-frequency wind (more natural, organic movement) ──
    const t = time.mul(float(uniforms.speed))
    const k1 = float(uniforms.windFreq)
    const amp1 = float(uniforms.windAmp)
    const k2 = float(uniforms.windFreq2)
    const amp2 = float(uniforms.windAmp2)

    const dirSeed = fract(sin(localIdx.mul(912.77).add(tileWX.mul(0.5)).add(tileWZ.mul(0.25))).mul(12345.678))
    const theta = dirSeed.mul(2.0 * Math.PI)
    const dirX = cos(theta)
    const dirZ = sin(theta)

    // Primary wave
    const phase1 = instancePos.x.mul(k1).mul(dirX).add(instancePos.z.mul(k1).mul(dirZ)).add(t)
    const wave1 = sin(phase1).mul(amp1)

    // Secondary wave (different frequency + phase offset for turbulence)
    const phase2 = instancePos.x.mul(k2).mul(dirX).add(instancePos.z.mul(k2).mul(dirZ)).add(t.mul(float(1.3))).add(float(1.7))
    const wave2 = sin(phase2).mul(amp2)

    const totalWave = wave1.add(wave2)
    const tipFactor = scaledLocal.y
    const swayX = totalWave.mul(dirX).mul(tipFactor)
    const swayZ = totalWave.mul(dirZ).mul(tipFactor)

    const wavedLocal = vec3(
      scaledLocal.x.add(swayX),
      scaledLocal.y,
      scaledLocal.z.add(swayZ)
    )

    // Random Y rotation per instance
    const angleSeed = localIdx.mul(12.345).add(tileWX).add(tileWZ.mul(2.0))
    const angleY = fract(sin(angleSeed)).mul(2.0 * Math.PI)
    const c = cos(angleY)
    const s = sin(angleY)
    const rotated = vec3(
      wavedLocal.x.mul(c).sub(wavedLocal.z.mul(s)),
      wavedLocal.y,
      wavedLocal.x.mul(s).add(wavedLocal.z.mul(c))
    )

    // Color with per-instance variation (subtle brightness/hue shift)
    const height = wavedLocal.y
    const baseColor = mix(uniforms.colorBottom, uniforms.colorTop, height)

    const colorSeed = fract(sin(seedX.mul(2.718)).mul(98765.432))
    const varRange = float(uniforms.colorVariation)
    const brightVar = mix(float(1.0).sub(varRange), float(1.0).add(varRange.mul(float(0.5))), colorSeed)
    const finalColor = vec4(baseColor.mul(brightVar), 1.0)

    return {
      positionNode: rotated.add(instancePos),
      colorNode: finalColor,
    }
  }, [uniforms])

  return (
    // @ts-ignore
    <meshStandardNodeMaterial
      {...props}
      {...nodes}
      side={THREE.DoubleSide}
      transparent={false}
      depthWrite
      depthTest
    />
  )
}

/* =========================================================================
   Geometría de "tuft" (N planos cruzados)
   ========================================================================= */
function makeTuftGeometry({
  planes = 3,
  height = 0.3,
  baseWidth = 0.1,
  segments = 4,
}: { planes?: number; height?: number; baseWidth?: number; segments?: number }) {
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  let vertOffset = 0

  for (let p = 0; p < planes; p++) {
    const angle = (p / planes) * Math.PI
    const ca = Math.cos(angle)
    const sa = Math.sin(angle)

    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const y = t * height
      // Taper: wider at base, pointed at tip
      const widthFactor = Math.pow(1 - t, 0.7)
      const halfWidth = (baseWidth * widthFactor) / 2
      // Gentle forward curve (blades bow slightly forward)
      const curve = t * t * 0.08

      const xL = -halfWidth
      const xR = +halfWidth
      const zOffset = curve

      positions.push(xL * ca - zOffset * sa, y, xL * sa + zOffset * ca)
      positions.push(xR * ca - zOffset * sa, y, xR * sa + zOffset * ca)
      uvs.push(0, t)
      uvs.push(1, t)

      if (i < segments) {
        const base = vertOffset + i * 2
        indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2)
      }
    }

    vertOffset += (segments + 1) * 2
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
  geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

/* =========================================================================
   GrassBlock: auto-ajuste a tamaño objetivo + batches + tuft + wave dual + máscaras
   ========================================================================= */
interface GrassBlockProps {
  position?: [number, number, number],
  isDebug?: boolean,
}

export default function GrassBlock({
  position = [0, 0, 0],
  isDebug,
}: GrassBlockProps) {
  const ui = useControls('Instanced Grass', {
    // ——— Cobertura y densidad ———
    fitToSide: { value: false },
    fitSide: { value: 100, min: 10, max: 1000, step: 1 },
    grid: { value: 5, min: 1, max: 51, step: 2 },
    areaSizeProp: { value: 31.2, min: 1, max: 200, step: 0.1 },
    totalCount: { value: isDebug ? 50_000 : 300_000, min: 10_000, max: 2_000_000, step: 1000 },

    // ——— Aparición "hoja por hoja" ———
    revealRadius: { value: 61.5, min: 0, max: 200, step: 0.1 },
    revealWidth: { value: 2, min: 0.01, max: 20, step: 0.01 },
    ditherWidth: { value: 0.08, min: 0.01, max: 0.5, step: 0.005 },

    // ——— Colores ———
    colorTop: { value: '#4a8a18' },
    colorBottom: { value: '#162c06' },

    // ——— Viento (dual) ———
    speed: { value: 1.0, min: 0, max: 10, step: 0.05 },
    windAmp: { value: 0.15, min: 0, max: 0.5, step: 0.005 },
    windFreq: { value: 0.6, min: 0.05, max: 3, step: 0.05 },
    windAmp2: { value: 0.06, min: 0, max: 0.3, step: 0.005 },
    windFreq2: { value: 1.8, min: 0.05, max: 6, step: 0.05 },

    // ——— Color variation ———
    colorVariation: { value: 0.18, min: 0, max: 0.5, step: 0.01 },

    // ——— Tuft frondoso ———
    tuftPlanes: { value: 2, min: 1, max: 5, step: 1 },
    bladeH: { value: 0.65, min: 0.1, max: 5.0, step: 0.01 },
    bladeW: { value: 0.12, min: 0.02, max: 0.5, step: 0.01 },
    segments: { value: 4, min: 2, max: 12, step: 1 },

    // ——— Zonas sin césped ———
    maskEdge: { value: 0.5, min: 0, max: 5, step: 0.01 },
    c1x: { value: 10, min: -200, max: 200, step: 0.1 },
    c1z: { value: 0, min: -200, max: 200, step: 0.1 },
    c1r: { value: 1, min: 0, max: 200, step: 0.1 },
    c2x: { value: -15, min: -200, max: 200, step: 0.1 },
    c2z: { value: 8, min: -200, max: 200, step: 0.1 },
    c2r: { value: 0, min: 0, max: 200, step: 0.1 },
    c3x: { value: 0.2, min: -200, max: 200, step: 0.1 },
    c3z: { value: 20, min: -200, max: 200, step: 0.1 },
    c3r: { value: 3.5, min: 0, max: 200, step: 0.1 },
  },
  { collapsed: true },
  )

  const bladeGeometry = useMemo(
    () =>
      makeTuftGeometry({
        planes: ui.tuftPlanes,
        height: ui.bladeH,
        baseWidth: ui.bladeW,
        segments: ui.segments,
      }),
    [ui.tuftPlanes, ui.bladeH, ui.bladeW, ui.segments]
  )

  const areaSizeEffective = ui.fitToSide ? ui.fitSide / ui.grid : ui.areaSizeProp
  const tilesTotal = ui.grid * ui.grid
  const perTile = Math.max(1, Math.floor(ui.totalCount / tilesTotal))
  const totalInstances = perTile * tilesTotal

  const characterPosition = useCharacterStore(state => state.position)

  const half = Math.floor(ui.grid / 2)
  const tileX0 = Math.floor(characterPosition[0] / areaSizeEffective) - half
  const tileZ0 = Math.floor(characterPosition[2] / areaSizeEffective) - half

  const MAX_BATCH = 100_000
  const batches = Math.ceil(totalInstances / MAX_BATCH)

  const circle1: [number, number, number] = [ui.c1x, ui.c1z, ui.c1r]
  const circle2: [number, number, number] = [ui.c2x, ui.c2z, ui.c2r]
  const circle3: [number, number, number] = [ui.c3x, ui.c3z, ui.c3r]

  return (
    <group position={position}>
      {Array.from({ length: batches }).map((_, bi) => {
        const batchOffset = bi * MAX_BATCH
        const count = Math.min(MAX_BATCH, totalInstances - batchOffset)

        return (
          <instancedMesh
            key={bi}
            geometry={bladeGeometry}
            // @ts-ignore
            args={[undefined as any, undefined as any, count]}
            frustumCulled={false}
          >
            <ShaderMaterial
              colorTop={ui.colorTop}
              colorBottom={ui.colorBottom}
              areaSizeProp={areaSizeEffective}
              speed={ui.speed}
              grid={ui.grid}
              perTile={perTile}
              tileOrigin={[tileX0, tileZ0]}
              characterPos={[characterPosition[0], characterPosition[1] ?? 0, characterPosition[2]]}
              revealRadius={ui.revealRadius}
              revealWidth={ui.revealWidth}
              ditherWidth={ui.ditherWidth}
              batchOffset={batchOffset}
              windAmp={ui.windAmp}
              windFreq={ui.windFreq}
              windAmp2={ui.windAmp2}
              windFreq2={ui.windFreq2}
              colorVariation={ui.colorVariation}
              circle1={circle1}
              circle2={circle2}
              circle3={circle3}
              maskEdge={ui.maskEdge}
            />
          </instancedMesh>
        )
      })}
    </group>
  )
}
