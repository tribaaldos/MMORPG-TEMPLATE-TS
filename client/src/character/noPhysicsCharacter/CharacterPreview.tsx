import * as THREE from 'three/webgpu'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import { useInventoryStore } from '../../store/useInventoryStore'

type Props = {
  playerId: string
}

/**
 * Lightweight character model for the Character panel preview canvas.
 * Identical to AnimatedCharacterModel but without NameTag / Html / Jotai atoms
 * so it works correctly inside an isolated secondary R3F Canvas.
 */
export default function CharacterPreview({ playerId }: Props) {
  const { scene, animations } = useGLTF('/AnimationLibrary.glb')
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const group = useRef<THREE.Group>(null!)

  useEffect(() => {
    clone.traverse((o: any) => {
      if (!o.isMesh) return
      o.castShadow = true
      o.material = o.material.clone()
      o.material.side = THREE.FrontSide
      const isJoints =
        o.material?.name === 'M_Joints' ||
        o.name?.includes('Mannequin_2') ||
        /joints/i.test(o.material?.name || '')
      o.material.color = new THREE.Color(isJoints ? 0x00ffff : 0xdedede)
    })
  }, [clone])

  const { actions, mixer } = useAnimations(animations, group)

  useEffect(() => {
    if (!actions) return
    const idle = actions['Idle_Loop']
    if (idle && !idle.isRunning()) idle.play()
  }, [actions])

  const [skeleton, setSkeleton] = useState<THREE.Skeleton | undefined>(undefined)
  useEffect(() => {
    clone.traverse((child: any) => {
      if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
        setSkeleton((child as THREE.SkinnedMesh).skeleton)
      }
    })
  }, [clone])

  const ensurePlayer = useInventoryStore((s) => s.ensurePlayer)
  useEffect(() => { ensurePlayer(playerId) }, [ensurePlayer, playerId])
  const equipment = useInventoryStore((s) => s.equipmentByPlayer[playerId])

  return (
    <group ref={group} position={[0, -1.1, 0]}>
      <primitive object={clone} />
      {equipment?.weapon?.Model && (
        <equipment.weapon.Model skeleton={skeleton} />
      )}
      {equipment?.shoulders?.Model && (
        <equipment.shoulders.Model skeleton={skeleton} />
      )}
      {equipment?.legs?.Model && (
        <equipment.legs.Model skeleton={skeleton} />
      )}
      {equipment?.boots?.Model && (
        <equipment.boots.Model skeleton={skeleton} />
      )}
      {equipment?.gloves?.Model && (
        <equipment.gloves.Model skeleton={skeleton} />
      )}
      {equipment?.shield?.Model && (
        <equipment.shield.Model skeleton={skeleton} />
      )}
    </group>
  )
}
