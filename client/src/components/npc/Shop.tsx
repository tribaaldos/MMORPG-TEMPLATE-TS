import { Html, useAnimations, useCursor, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
import { useShopStore } from '../../store/npcs/useShop'
import { BasicSword, FireWeaponItem } from '../../items/storage/WeaponsStorage'
import { BasicGreenShoulderItem, BasicShoulder } from '../../items/storage/ShouldersStorage'
import { BasicPants } from '../../items/storage/PantsStorage'
import { DragonBootsItem } from '../../items/storage/BootsStorage'
import { IronGlovesItem } from '../../items/storage/GlovesStorage'
import { ShredShieldItem } from '../../items/storage/ShieldStorage'
import { useDialogueStore, blacksmithDialogue } from '../../store/npcs/useDialogueStore'
import { useCharacterStore } from '../../store/useCharacterStore'
import * as THREE from 'three'
import { AnvilIcon, StandardCursor } from './EmojiCursor'

// Posición del NPC en el mundo (debe coincidir con donde se coloca en StartWorld)
const NPC_POSITION = new THREE.Vector3(0, 0, 0)
const INTERACT_RADIUS = 5

const allItemsForSale = [
  { id: 'sword1',     price: 80,  ...BasicSword },
  { id: 'sword2',     price: 220, ...FireWeaponItem },
  { id: 'shoulder1',  price: 60,  ...BasicShoulder },
  { id: 'shoulder2',  price: 150, ...BasicGreenShoulderItem },
  { id: 'pants1',     price: 70,  ...BasicPants },
  { id: 'boots1',     price: 180, ...DragonBootsItem },
  { id: 'gloves1',    price: 130, ...IronGlovesItem },
  { id: 'shield1',    price: 200, ...ShredShieldItem },
] as const

export default function KShop() {
  const openShop = useShopStore((s) => s.openShop)
  const openDialogue = useDialogueStore((s) => s.openDialogue)
  const [hovered, setHovered] = useState(false)
  const [inRange, setInRange] = useState(false)
  const playerPos = useCharacterStore((s) => s.position)

  // Escucha el evento custom para abrir la tienda desde el diálogo
  useEffect(() => {
    const handler = () => openShop('Kael — Herrero de Thornhaven', allItemsForSale as any)
    window.addEventListener('open-blacksmith-shop', handler)
    return () => window.removeEventListener('open-blacksmith-shop', handler)
  }, [openShop])

  // Comprueba proximidad cada frame
  useFrame(() => {
    const d = NPC_POSITION.distanceTo(
      new THREE.Vector3(playerPos[0], 0, playerPos[2])
    )
    setInRange(d < INTERACT_RADIUS)
  })

  useCursor(
    hovered,
    `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><text y='26' font-size='24'>👆</text></svg>") 8 2, pointer`,
    'auto'
  )

  function NpcShop({ ...props }) {
    const group = useRef<any>()
    const { nodes, materials, animations } = useGLTF('/npcShop.glb')
    useAnimations(animations, group)
    return (
      <group ref={group} {...props} dispose={null}>
        <group name="Root_Scene">
          <group name="RootNode">
            <group name="CharacterArmature" rotation={[-Math.PI / 2, 0, 0]} scale={100}>
              <primitive object={nodes.Root} />
            </group>
            <group name="Rogue" position={[0, 0, 0.166]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
              <skinnedMesh name="Rogue_1" geometry={(nodes.Rogue_1 as any).geometry} material={new THREE.MeshStandardMaterial({ color: 'orange' })} skeleton={(nodes.Rogue_1 as any).skeleton} />
              <skinnedMesh name="Rogue_2" geometry={(nodes.Rogue_2 as any).geometry} material={(materials as any).UnderShirt} skeleton={(nodes.Rogue_2 as any).skeleton} />
              <skinnedMesh name="Rogue_3" geometry={(nodes.Rogue_3 as any).geometry} material={(materials as any).Pants} skeleton={(nodes.Rogue_3 as any).skeleton} />
              <skinnedMesh name="Rogue_4" geometry={(nodes.Rogue_4 as any).geometry} material={(materials as any).Shirt} skeleton={(nodes.Rogue_4 as any).skeleton} />
              <skinnedMesh name="Rogue_5" geometry={(nodes.Rogue_5 as any).geometry} material={(materials as any).Detail} skeleton={(nodes.Rogue_5 as any).skeleton} />
              <skinnedMesh name="Rogue_6" geometry={(nodes.Rogue_6 as any).geometry} material={(materials as any).Boots} skeleton={(nodes.Rogue_6 as any).skeleton} />
            </group>
            <skinnedMesh name="Rogue001" geometry={(nodes.Rogue001 as any).geometry} material={(materials as any)['Material.006']} skeleton={(nodes.Rogue001 as any).skeleton} position={[0, 0, 0.166]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
          </group>
        </group>
      </group>
    )
  }

  useGLTF.preload('/npcShop.glb')

  return (
    <group onClick={(e) => e.stopPropagation()}>
      {/* Hint de proximidad flotante sobre el NPC */}
      {inRange && (
        <Html position={[0, 3.2, 0]} center distanceFactor={8}>
          <div style={{
            background: 'rgba(0,0,0,0.75)',
            border: '1px solid #4a4a8a',
            borderRadius: 20,
            padding: '4px 12px',
            color: '#fff',
            fontFamily: 'Segoe UI, sans-serif',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            animation: 'none',
          }}>
            💬 Hablar con Kael
          </div>
        </Html>
      )}

      {/* Hitbox invisible para interacción */}
      <mesh
        position={[0, 1.35, 0]}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false) }}
        onClick={(e) => {
          e.stopPropagation()
          e.nativeEvent.stopImmediatePropagation?.()
          openDialogue('Kael — Herrero de Thornhaven', blacksmithDialogue)
        }}
      >
        <boxGeometry args={[1, 2.2, 1]} />
        <meshStandardMaterial visible={false} />
      </mesh>

      <NpcShop />
    </group>
  )
}
