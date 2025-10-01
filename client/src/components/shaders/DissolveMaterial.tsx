import { useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { lerp } from "three/src/math/MathUtils.js"
import {
  color,
  mix,
  mx_noise_float,
  negate,
  positionWorld,
  remap,
  step,
  texture,
  uniform,
} from "three/tsl"
import * as THREE from "three"
import { useControls } from "leva"

interface DissolveMaterialProps {
  visible?: boolean
  size?: number
  thickness?: number
  dissolveColor?: string
  intensity?: number
  colorA?: string
  map?: THREE.Texture
  color?: THREE.Color | string
  roughness?: number
  metalness?: number
  speed?: number
}

export const DissolveMaterial = ({
  visible = true,
  size = 12,
  thickness = 0.1,
  dissolveColor = "orange",
  intensity = 2,
  colorA = "red",
  map,
  color: baseColorProp,
  roughness,
  metalness,
  speed = 1,
  ...props
}: DissolveMaterialProps) => {
  const { nodes, uniforms } = useMemo(() => {
    const uniforms = {
      progress: uniform(0),
      size: uniform(size),
      thickness: uniform(thickness),
      borderColor: uniform(color(dissolveColor)),
      intensity: uniform(intensity),
      colorA: uniform(color(colorA)),
    }

    // base color (map > color > fallback)
    let baseColorNode
    if (map) {
      baseColorNode = texture(map)
    } else if (baseColorProp) {
      baseColorNode = color(
        baseColorProp instanceof THREE.Color
          ? `#${baseColorProp.getHexString()}`
          : baseColorProp
      )
    } else {
      baseColorNode = uniforms.colorA
    }

    const noise = mx_noise_float(positionWorld.mul(uniforms.size))
    const dissolve = remap(noise, -1, 1, 0, 1)

    const smoothProgress = uniforms.progress.remap(
      0,
      1,
      negate(uniforms.thickness),
      1
    )

    const alpha = step(dissolve, smoothProgress)
    const border = step(dissolve, smoothProgress.add(uniforms.thickness)).sub(
      alpha
    )
    const borderColor = uniforms.borderColor.mul(uniforms.intensity)

    const finalColor = mix(baseColorNode, borderColor, border)

    return {
      uniforms,
      nodes: {
        colorNode: finalColor,
        opacityNode: alpha.add(border),
        emissiveNode: borderColor.mul(border),
      },
    }
  }, [map, baseColorProp])

  useFrame((_, delta) => {
    uniforms.progress.value = lerp(
      uniforms.progress.value,
      visible ? 1 : 0,
      delta * speed
    )
    uniforms.size.value = size
    uniforms.thickness.value = thickness
    uniforms.intensity.value = intensity
    uniforms.borderColor.value.set(dissolveColor)
    uniforms.colorA.value.set(colorA)
  })

  return (
    // @ts-ignore
    <meshStandardNodeMaterial
      {...props}
      {...nodes}
      roughness={roughness}
      metalness={metalness}
      transparent
      toneMapped={false}
    />
  )
}


export default function Treasure() {

  const dissolveMaterialProps = useControls("Dissolve Effect", {
    visible: { value: true },
    size: { value: 12, min: 0, max: 20 },
    thickness: { value: 0.1, min: 0, max: 1 },
    dissolveColor: { value: "orange" },
    intensity: { value: 2, min: 0, max: 10 },
    colorA: { value: 'blue' },
    speed: { value: 1, min: 0, max: 5 , step: 0.1},
  });
  return (
    <mesh>
      <boxGeometry />
      <DissolveMaterial {...dissolveMaterialProps} />
    </mesh>
  )
}