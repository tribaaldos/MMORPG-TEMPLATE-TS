import React, { useMemo } from "react"
import * as THREE from "three"
import { color, floor, mod, uniform, uv, step, float, positionLocal } from "three/tsl"
import "three/webgpu"

interface GridMaterialProps {
  color1?: string
  color2?: string
  borderColor?: string
  scale?: number
  borderWidth?: number
  emissiveIntensity?: number
}

export function GridMaterial({
  color1 = "#585858",
  color2 = "#000000",
  borderColor = "#c425c0",
  scale = 32,
  borderWidth = 0.01,
  emissiveIntensity = -0.3,
}: GridMaterialProps) {
  const shaderNodes = useMemo(() => {
    const uniforms = {
      color1: uniform(color(color1)),
      color2: uniform(color(color2)),
      scale: uniform(scale),
      borderWidth: uniform(borderWidth),
      borderColor: uniform(color(borderColor)),
      emissiveIntensity: uniform(emissiveIntensity),
    }

    const one = float(1.0)
    const invBorderWidth = one.sub(uniforms.borderWidth)
    const vUv = uv().mul(uniforms.scale)
    const sumFloor = floor(vUv.x).add(floor(vUv.y))
    const checker = mod(sumFloor, float(2.0)).floor()

    const uvFracX = vUv.x.sub(floor(vUv.x))
    const uvFracY = vUv.y.sub(floor(vUv.y))
    const edgeX = step(uvFracX, uniforms.borderWidth).add(step(invBorderWidth, uvFracX))
    const edgeY = step(uvFracY, uniforms.borderWidth).add(step(invBorderWidth, uvFracY))
    const edge = edgeX.add(edgeY)

    const baseColor = checker.greaterThan(0.0).select(uniforms.color2, uniforms.color1)
    const finalColor = edge.greaterThan(0.0).select(uniforms.borderColor, baseColor)

    const emissive = edge.greaterThan(0.0).select(
      uniforms.borderColor.mul(uniforms.emissiveIntensity),
      color(0, 0, 0)
    )

    return { position: positionLocal, colorNode: finalColor, emissiveNode: emissive }
  }, [color1, color2, borderColor, scale, borderWidth, emissiveIntensity])

  // cada vez que cambia el shaderNodes, se regenera el material
  const materialKey = useMemo(() => Date.now(), [shaderNodes])

  // @ts-ignore (NodeMaterial está en TSL)
  return <meshPhysicalNodeMaterial {...shaderNodes} key={materialKey} />
}
