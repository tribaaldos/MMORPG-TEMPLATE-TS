// GrassBlock.tsx — infinito, estable, “hoja por hoja”, frondoso, batches (<=100k),
// con wave (viento) y ZONAS SIN CÉSPED (3 círculos editables + borde suave)
import React, { useMemo } from 'react'
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
   ShaderMaterial (batches + viento + máscaras circulares)
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
  // Zonas sin césped: círculos (cx, cz, r). Si r <= 0, no afecta.
  circle1?: [number, number, number]
  circle2?: [number, number, number]
  circle3?: [number, number, number]
  maskEdge?: number // borde suave de las máscaras
  [k: string]: any
}

export const ShaderMaterial = ({
  colorTop = 'green',
  colorBottom = 'darkgreen',
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
  windAmp = 0.06,
  windFreq = 0.6,
  circle1 = [1e6, 1e6, 0],
  circle2 = [1e6, 1e6, 0],
  circle3 = [1e6, 1e6, 0],
  maskEdge = 0.5,
  ...props
}: ShaderMatProps) => {
  const uniforms = React.useRef({
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

    // Máscaras circulares (cx, cz, r)
    circle1: uniform(vec3(circle1[0], circle1[1], circle1[2])),
    circle2: uniform(vec3(circle2[0], circle2[1], circle2[2])),
    circle3: uniform(vec3(circle3[0], circle3[1], circle3[2])),
    maskEdge: uniform(maskEdge),
  }).current

  useFrame(() => {
    uniforms.colorTop.value.set(colorTop)
    uniforms.colorBottom.value.set(colorBottom)
    uniforms.areaSize.value = areaSizeProp
    uniforms.speed.value = speed
    uniforms.grid.value = grid
    uniforms.perTile.value = perTile
    uniforms.tileOrigin.value.set(tileOrigin[0], 0, tileOrigin[1])
    uniforms.characterPos.value.set(characterPos[0], characterPos[1], characterPos[2])
    uniforms.revealRadius.value = revealRadius
    uniforms.revealWidth.value = revealWidth
    uniforms.ditherWidth.value = ditherWidth
    uniforms.batchOffset.value = batchOffset
    uniforms.windAmp.value = windAmp
    uniforms.windFreq.value = windFreq

    // Si r<=0, mueve el círculo lejos para que no afecte
    const safe = (c: [number, number, number]) =>
      c[2] > 0 ? c : [1e6, 1e6, 0]
    const c1 = safe(circle1), c2 = safe(circle2), c3 = safe(circle3)
    uniforms.circle1.value.set(c1[0], c1[1], c1[2])
    uniforms.circle2.value.set(c2[0], c2[1], c2[2])
    uniforms.circle3.value.set(c3[0], c3[1], c3[2])
    uniforms.maskEdge.value = maskEdge
  })

  const nodes = React.useMemo(() => {
    // índice GLOBAL = offset del batch + instanceIndex local
    const idx = instanceIndex.toFloat().add(float(uniforms.batchOffset))

    const areaSize = float(uniforms.areaSize)
    const gridF = float(uniforms.grid)
    const perTileF = float(uniforms.perTile)

    // Índices: global -> tile + local
    const tileIdx = idx.div(perTileF).floor()
    const tileZ = tileIdx.div(gridF).floor()
    const tileX = tileIdx.sub(tileZ.mul(gridF)) // tileIdx % grid
    const localIdx = idx.sub(tileIdx.mul(perTileF))

    // Origen entero del grid
    const originX = float(uniforms.tileOrigin.x)
    const originZ = float(uniforms.tileOrigin.z)

    // Tile en coordenadas del mundo (¡clave para estabilidad!)
    const tileWX = originX.add(tileX)
    const tileWZ = originZ.add(tileZ)

    // Centro del tile en mundo
    const worldTileX = tileWX.add(0.5).mul(areaSize)
    const worldTileZ = tileWZ.add(0.5).mul(areaSize)

    // Aleatorio estable por (tile mundial, localIdx)
    const seedX = localIdx.mul(12.9898).add(tileWX.mul(0.1)).add(tileWZ.mul(0.311))
    const seedZ = localIdx.mul(78.233).add(tileWX.mul(0.913)).add(tileWZ.mul(0.671))

    const randX = fract(sin(seedX).mul(43758.5453))
    const randZ = fract(sin(seedZ).mul(43758.5453))

    // Posición aleatoria dentro del tile [-area/2, area/2]
    const posX = randX.mul(areaSize).sub(areaSize.mul(0.5))
    const posZ = randZ.mul(areaSize).sub(areaSize.mul(0.5))

    // Posición de la instancia en el mundo
    const instancePos = vec3(worldTileX.add(posX), float(0), worldTileZ.add(posZ))

    // Aparición hoja-por-hoja
    const charX = float(uniforms.characterPos.x)
    const charZ = float(uniforms.characterPos.z)

    const dx = instancePos.x.sub(charX)
    const dz = instancePos.z.sub(charZ)
    const dist2 = dx.mul(dx).add(dz.mul(dz))

    const R = float(uniforms.revealRadius)
    const W = float(uniforms.revealWidth)
    const rIn = R.sub(W)
    const rOut = R.add(W)
    const rIn2 = rIn.mul(rIn)
    const rOut2 = rOut.mul(rOut)

    const tReveal = smoothstep(rOut2, rIn2, dist2)

    // Dither per-instance (semilla mundial)
    const seedD = localIdx.mul(1337.0).add(tileWX.mul(0.17)).add(tileWZ.mul(0.37))
    const j = fract(sin(seedD).mul(59341.913))
    const dWidth = float(uniforms.ditherWidth)

    // Crecimiento base
    let growth = smoothstep(j, j.add(dWidth), tReveal)

    // ==============================
    // MÁSCARAS: círculos sin césped
    // inside = 1 dentro del círculo (con borde suave), 0 fuera
    // growth *= (1 - insideMax)
    // ==============================
    const edge = float(uniforms.maskEdge)

    // circle helper: devuelve inside factor
    const circleInside = (cx: any, cz: any, r: any) => {
      const dxC = instancePos.x.sub(cx)
      const dzC = instancePos.z.sub(cz)
      const d2C = dxC.mul(dxC).add(dzC.mul(dzC))
      const rin = max(r.sub(edge), float(0.0))
      const rout = r.add(edge)
      const rin2 = rin.mul(rin)
      const rout2 = rout.mul(rout)
      return smoothstep(rout2, rin2, d2C) // 1 dentro, 0 fuera
    }
    const rectInside = (cx: any, cz: any, halfW: any, halfH: any, edge: any) => {
      const dx = abs(instancePos.x.sub(cx))
      const dz = abs(instancePos.z.sub(cz))

      const insideX = smoothstep(halfW.add(edge), halfW.sub(edge), dx)
      const insideZ = smoothstep(halfH.add(edge), halfH.sub(edge), dz)

      return insideX.mul(insideZ) // 1 dentro, 0 fuera
    }



    const c1 = circleInside(float(uniforms.circle1.x), float(uniforms.circle1.y), float(uniforms.circle1.z))
    const c2 = circleInside(float(uniforms.circle2.x), float(uniforms.circle2.y), float(uniforms.circle2.z))
    const c3 = circleInside(float(uniforms.circle3.x), float(uniforms.circle3.y), float(uniforms.circle3.z))
    const cuadrado = rectInside(float(0), float(-0.2), float(4.5), float(3.2), edge) // ejemplo de cuadrado centrado 50×50
    const insideMax = max(max(cuadrado, c2), c3)
    const subGrass = growth.mul(float(1.0).sub(insideMax))

    // Escalado local (nacer desde el suelo)
    // ===== Random height per instance =====
    const seedH = localIdx.mul(91.7).add(tileWX.mul(0.3)).add(tileWZ.mul(0.77))
    const rndH = fract(sin(seedH).mul(43758.5453))

    // altura ∈ [0.5 .. 1.0] del valor base (n/2 → n)
    const hFactor = mix(float(0.5), float(1.0), rndH)

    // aplicar al escalado en Y
    const scaledLocal = vec3(
      positionLocal.x.mul(subGrass),
      positionLocal.y.mul(growth).mul(hFactor),
      positionLocal.z
    )


    // -------------------------
    // 🌊 WAVE (viento/mecido)
    // -------------------------
    const t = time.mul(float(uniforms.speed))
    const k = float(uniforms.windFreq)
    const amp = float(uniforms.windAmp)

    // Dirección de viento pseudo-aleatoria por instancia (evita sincronía)
    const dirSeed = fract(sin(localIdx.mul(912.77).add(tileWX.mul(0.5)).add(tileWZ.mul(0.25))).mul(12345.678))
    const theta = dirSeed.mul(2.0 * Math.PI)
    const dirX = cos(theta)
    const dirZ = sin(theta)

    // Fase espacial + temporal
    const phase = instancePos.x.mul(k).mul(dirX).add(instancePos.z.mul(k).mul(dirZ)).add(t)
    const wave = sin(phase).mul(amp)

    // La punta se mueve más que la base (proporcional a la altura ya escalada)
    const tipFactor = scaledLocal.y
    const swayX = wave.mul(dirX).mul(tipFactor)
    const swayZ = wave.mul(dirZ).mul(tipFactor)

    const wavedLocal = vec3(
      scaledLocal.x.add(swayX),
      scaledLocal.y,
      scaledLocal.z.add(swayZ)
    )

    // Rotación Y aleatoria
    const angleSeed = localIdx.mul(12.345).add(tileWX).add(tileWZ.mul(2.0))
    const angleY = fract(sin(angleSeed)).mul(2.0 * Math.PI)
    const c = cos(angleY)
    const s = sin(angleY)
    const rotated = vec3(
      wavedLocal.x.mul(c).sub(wavedLocal.z.mul(s)),
      wavedLocal.y,
      wavedLocal.x.mul(s).add(wavedLocal.z.mul(c))
    )

    // Color (gradiente vertical)
    const height = wavedLocal.y
    const finalColor = vec4(mix(uniforms.colorBottom, uniforms.colorTop, height), 1.0)

    return {
      positionNode: rotated.add(instancePos),
      colorNode: finalColor,
    }
  }, [uniforms])

  // const key = useMemo(() => new Date.now(), [])
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
   Geometría de “tuft” (N planos cruzados) para que cada instancia sea más frondosa
   ========================================================================= */
function makeTuftGeometry({
  planes = 3,         // 1=hoja simple, 3=tuft clásico
  height = 0.3,      // altura base de la tira
  baseWidth = 0.1,   // ancho base de la tira
  segments = 6,
}: { planes?: number; height?: number; baseWidth?: number; segments?: number }) {
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  let vertOffset = 0

  for (let p = 0; p < planes; p++) {
    const angle = (p / planes) * Math.PI // cruzados (0°, 60°, 120° para planes=3)
    const ca = Math.cos(angle)
    const sa = Math.sin(angle)

    for (let i = 0; i <= segments; i++) {

      const y = (i / segments) * height
      const widthFactor = 1 - i / segments
      const halfWidth = (baseWidth * widthFactor) / 2

      // dos vértices por “anillo” (tira)
      // punto izquierdo (-x)
      const xL = -halfWidth
      const zL = 0
      // rotar alrededor de Y
      const rxL = xL * ca - zL * sa
      const rzL = xL * sa + zL * ca

      // punto derecho (+x)
      const xR = +halfWidth
      const zR = 0
      const rxR = xR * ca - zR * sa
      const rzR = xR * sa + zR * ca

      positions.push(rxL, y, rzL)
      positions.push(rxR, y, rzR)
      uvs.push(0, i / segments)
      uvs.push(1, i / segments)

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
   GrassBlock: auto-ajuste a tamaño objetivo + batches + tuft + wave + máscaras
   ========================================================================= */
interface GrassBlockProps {
  position?: [number, number, number]
}

export default function GrassBlock({
  position = [0, 0, 0],
}: GrassBlockProps) {
  const ui = useControls('Instanced Grass', {
    // ——— Cobertura y densidad ———
    fitToSide: { value: false },               // si true, cubre exactamente fitSide
    fitSide: { value: 100, min: 10, max: 1000, step: 1 }, // lado objetivo (100→100×100)
    grid: { value: 5, min: 1, max: 51, step: 2 },      // impar recomendado (5,7,9…)
    areaSizeProp: { value: 31.2, min: 1, max: 200, step: 0.1 },  // lado de tile si fitToSide=false
    totalCount: { value: 500_000, min: 10_000, max: 2_000_000, step: 1000 },

    // ——— Aparición “hoja por hoja” ———
    revealRadius: { value: 61.5, min: 0, max: 200, step: 0.1 },
    revealWidth: { value: 2, min: 0.01, max: 20, step: 0.01 },
    ditherWidth: { value: 0.08, min: 0.01, max: 0.5, step: 0.005 },

    // ——— Colores y viento ———
    colorTop: { value: '#c6ff7c65' },
    colorBottom: { value: 'darkgreen' },
    speed: { value: 1.2, min: 0, max: 10, step: 0.05 }, // factor de tiempo del viento
    windAmp: { value: 0.25, min: 0, max: 0.2, step: 0.005 },
    windFreq: { value: 0.6, min: 0.05, max: 3, step: 0.05 },

    // ——— Tuft frondoso ———
    tuftPlanes: { value: 1, min: 1, max: 5, step: 1 },
    bladeH: { value: 0.7, min: 0.1, max: 5.0, step: 0.01 },
    bladeW: { value: 0.1, min: 0.02, max: 0.5, step: 0.01 },
    segments: { value: 6, min: 2, max: 12, step: 1 },

    // ——— Zonas sin césped (poner radio>0 para activar) ———
    maskEdge: { value: 0.5, min: 0, max: 5, step: 0.01 },
    c1x: { value: 10, min: -200, max: 200, step: 0.1 },
    c1z: { value: 0, min: -200, max: 200, step: 0.1 },
    c1r: { value: 1, min: 0, max: 200, step: 0.1 }, // 0 = desactivado
    c2x: { value: -15, min: -200, max: 200, step: 0.1 },
    c2z: { value: 8, min: -200, max: 200, step: 0.1 },
    c2r: { value: 0, min: 0, max: 200, step: 0.1 },
    c3x: { value: 0.2, min: -200, max: 200, step: 0.1 },
    c3z: { value: 20, min: -200, max: 200, step: 0.1 },
    c3r: { value: 3.5, min: 0, max: 200, step: 0.1 },
  },
  { collapsed: true } ,    // 👈 esto hace que empiece cerrado
)


  // Geometría de “tuft” (planes cruzados)
  const bladeGeometry = React.useMemo(
    () =>
      makeTuftGeometry({
        planes: ui.tuftPlanes,
        height: ui.bladeH,
        baseWidth: ui.bladeW,
        segments: ui.segments,
      }),
    [ui.tuftPlanes, ui.bladeH, ui.bladeW, ui.segments]
  )

  // Cobertura: lado visible = grid * areaSize
  const areaSizeEffective = ui.fitToSide ? ui.fitSide / ui.grid : ui.areaSizeProp

  // Distribución por tiles
  const tilesTotal = ui.grid * ui.grid
  // Repartimos totalCount en tiles: perTile entero
  const perTile = Math.max(1, Math.floor(ui.totalCount / tilesTotal))
  const totalInstances = perTile * tilesTotal // puede ser >100k

  // Posición del personaje
  const characterPosition = useCharacterStore(state => state.position)

  // tileOrigin: esquina inferior-izquierda del grid alrededor del personaje
  const half = Math.floor(ui.grid / 2)
  const tileX0 = Math.floor(characterPosition[0] / areaSizeEffective) - half
  const tileZ0 = Math.floor(characterPosition[2] / areaSizeEffective) - half

  // —— Batching: dividir en trozos de <=100k ——
  const MAX_BATCH = 100_000
  const batches = Math.ceil(totalInstances / MAX_BATCH)

  // Círculos para pasar al shader
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
              // zonas sin césped
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
