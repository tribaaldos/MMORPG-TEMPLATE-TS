import React, { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { color, floor, mod, uniform, uv, step, float, positionLocal } from 'three/tsl'
import 'three/webgpu'
import { useControls } from 'leva'

interface GridShaderProps {
  color1?: string
  color2?: string
  borderColor?: string
  scale?: number
  borderWidth?: number
  emissiveIntensity?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  scaleMesh?: number
}

export function GridShader(props: GridShaderProps) {
  const levaControls = useControls({

    uColor1: { value: '#585858', label: 'Color 1' },
    uColor2: { value: '#000000', label: 'Color 2' },
    borderColor: { value: '#c425c0', label: 'Border Color' },
    scale: { value: 64 - 32, min: 8, max: 80, step: 8 },
    borderWidth: { value: 0.01, min: 0.01, max: 0.5, step: 0.01 },
    emissiveIntensity: { value: -0.3, min: -1, max: 5, step: 0.1 },
  })

  // Usa props si existen, sino valores de leva
  const cfg = {
    color1: props.color1 || levaControls.uColor1,
    color2: props.color2 || levaControls.uColor2,
    borderColor: props.borderColor || levaControls.borderColor,
    scale: props.scale || levaControls.scale,
    borderWidth: props.borderWidth || levaControls.borderWidth,
    emissiveIntensity: props.emissiveIntensity || levaControls.emissiveIntensity,
  }

  const { shaderNodes } = useMemo(() => {
    const uniforms = {
      color1: uniform(color(cfg.color1)),
      color2: uniform(color(cfg.color2)),
      scale: uniform(cfg.scale),
      borderWidth: uniform(cfg.borderWidth),
      borderColor: uniform(color(cfg.borderColor)),
      emissiveIntensity: uniform(cfg.emissiveIntensity),
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

    const emissive = edge.greaterThan(0.0)
      .select(uniforms.borderColor.mul(uniforms.emissiveIntensity), color(0, 0, 0))

    return {
      shaderNodes: {
        position: positionLocal,
        colorNode: finalColor,
        emissiveNode: emissive,
      },
    }
  }, [cfg.color1, cfg.color2, cfg.scale, cfg.borderWidth, cfg.borderColor, cfg.emissiveIntensity])

  const materialKey = useMemo(() => Date.now(), [shaderNodes])

  return (
    <group
      {...props}
      dispose={null}
      scale={props.scaleMesh ?? 0.2}
      position={props.position ?? [0, 0, 0]}
      rotation={props.rotation ?? [-Math.PI / 2, 0, 0]}
    >
      <mesh frustumCulled={false} >
        <planeGeometry args={[1000, 1000, 100, 100]} />
        {/* @ts-ignore */}
        <meshPhysicalNodeMaterial {...shaderNodes} key={materialKey}  />
      </mesh>
    </group>
  )
}

useGLTF.preload('/testingshader.glb')
