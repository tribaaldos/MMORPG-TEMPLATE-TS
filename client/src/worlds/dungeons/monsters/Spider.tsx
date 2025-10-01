import React, { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three';
import { socket } from '../../../socket/SocketManager';
import { useFrame } from '@react-three/fiber';
import { LoopRepeat } from 'three';

interface SpiderProps {
  props?: any
  position?: [number, number, number]
}

export function Spider({ props, position = [0, 0, 0] }: SpiderProps) {
  const group = useRef<THREE.Group>(null)
  const { nodes, materials, animations } = useGLTF('/dungeons/monsters/cyborg_spider.glb')
  const { actions, mixer } = useAnimations(animations, group)

  const currentActionName = useRef<string | null>(null)

  // Fuerza loop por defecto en TODOS los clips (evita Walk -> parar)
  useEffect(() => {
    if (!actions) return
    Object.values(actions).forEach((act) => {
      if (!act) return
      act.setLoop(LoopRepeat, Infinity)        // 👈 aseguramos bucle
      act.clampWhenFinished = false
    })
  }, [actions])

  const playAnimation = (name: string, speed = 1) => {
    const next = actions[name]
    if (!next) return

    // Si es la misma animación, nos aseguramos de que sigue corriendo en loop
    if (currentActionName.current === name) {
      next.enabled = true
      next.setEffectiveWeight(1)
      next.setEffectiveTimeScale(speed)
      next.play() // idempotente, garantiza que no se quede parada
      return
    }

    const prev = currentActionName.current ? actions[currentActionName.current] : null
    currentActionName.current = name

    // crossfade corto para que no parezca microcorte
    if (prev && prev !== next) {
      prev.crossFadeTo(next.reset().play(), 0.15, true)
    } else {
      next.reset().play()
    }

    next.setEffectiveWeight(1)
    next.setEffectiveTimeScale(speed)
  }

  // targets del servidor
  const targetPos = useRef(new THREE.Vector3(...position))
  const targetQuat = useRef(new THREE.Quaternion()) // safeguard

  useEffect(() => {
    const handler = (data: {
      position: [number, number, number],
      quaternion: [number, number, number, number],
      animation: string,
      animSpeed?: number
    }) => {
      if (!group.current) return
      targetPos.current.fromArray(data.position)
      targetQuat.current.fromArray(data.quaternion)

      // nombre + velocidad
      playAnimation(data.animation, data.animSpeed ?? 1)
    }

    socket.on('spiderUpdate', handler)
    return () => socket.off('spiderUpdate', handler)
  }, [actions])

  // suavizado
  useFrame((_, delta) => {
    if (!group.current) return
    group.current.position.lerp(targetPos.current, 5 * delta)
    group.current.quaternion.slerp(targetQuat.current, 5 * delta)
  })

  return (
    <group ref={group} {...props} dispose={null} scale={0.02} position={position} rotation={[0, Math.PI/2, Math.PI*2]}>
      <group name="Scene">
        <group name="Sketchfab_model001" rotation={[-Math.PI / 2, 0, 0]}>
          <group name="root">
            <group name="GLTF_SceneRootNode" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Sketchfab_model_0" rotation={[-Math.PI / 2, 0, 0]}>
                <group name="f4c7dff2b8264fc5bf6d28e22753d2d4fbx_1" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Object_2_2">
                    <group name="RootNode_3">
                      <group name="Object_4_4">
                        <group name="GLTF_created_0">
                          <skinnedMesh
                            name="Object_64"
                            geometry={nodes.Object_64.geometry}
                            material={materials.Spider_M}
                            skeleton={nodes.Object_64.skeleton}
                          />
                          <group name="Object_7_7_correction">
                            <group name="Object_7_7" />
                          </group>
                          <primitive object={nodes.GLTF_created_0_rootJoint} />
                        </group>
                        <group name="pPlane1_57">
                          <group name="pPlane1_Camera_lambert2_0_58" />
                        </group>
                      </group>
                    </group>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/dungeons/monsters/cyborg_spider.glb')
