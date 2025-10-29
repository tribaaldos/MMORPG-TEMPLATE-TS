import { useAnimations, useCursor, useGLTF } from '@react-three/drei'
import { useRef, useState } from 'react'
import { useShopStore } from '../../store/npcs/useShop'
import { BasicSword } from '../../items/storage/WeaponsStorage'
import { SkeletonUtils } from 'three-stdlib'
import * as THREE from 'three'
import SwordSVG from '../svg/Sword'
import { AnvilIcon, StandardCursor } from './EmojiCursor'
export default function KShop({
  setEmoji,
}) {
  const openShop = useShopStore((s) => s.openShop)
  const [hovered, setHovered] = useState(false)
  useCursor(
    hovered,
    `url("data:image/svg+xml;utf8,
    <svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'>
      <text y='48' font-size='48'>😲</text>
    </svg>") 32 32, auto`,
    `url("data:image/svg+xml;utf8,
    <svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'>
      <text y='48' font-size='48'>😀</text>
    </svg>") 32 32, auto`
  );


  const swordsForSale = [
    { id: 'sword1', price: 100, ...BasicSword },
  ] as const



  function NpcShop({ ...props }) {
    const group = useRef()
    const { nodes, materials, animations } = useGLTF('/npcShop.glb')
    const { actions } = useAnimations(animations, group)
    return (
      <group ref={group} {...props} dispose={null}>
        <group name="Root_Scene">
          <group name="RootNode">
            <group name="CharacterArmature" rotation={[-Math.PI / 2, 0, 0]} scale={100}>
              <primitive object={nodes.Root} />
            </group>
            <group name="Rogue" position={[0, 0, 0.166]} rotation={[-Math.PI / 2, 0, 0]} scale={100}
            >
              <skinnedMesh
                // onPointerOver={(e) => (e.stopPropagation(), setHovered(true))}
                // onPointerOut={(e) => (e.stopPropagation(), setHovered(false))}
                // onClick={(e) => {
                // e.stopPropagation()
                // openShop('Blacksmith', swordsForSale as any)
                // }}
                name="Rogue_1"
                geometry={nodes.Rogue_1.geometry}
                // material={materials.Skin}
                material={new THREE.MeshStandardMaterial({ color: 'orange' })}
                skeleton={nodes.Rogue_1.skeleton}
              />
              <skinnedMesh
                name="Rogue_2"
                geometry={nodes.Rogue_2.geometry}
                material={materials.UnderShirt}
                skeleton={nodes.Rogue_2.skeleton}
              />
              <skinnedMesh
                name="Rogue_3"
                geometry={nodes.Rogue_3.geometry}
                material={materials.Pants}
                skeleton={nodes.Rogue_3.skeleton}
              />
              <skinnedMesh
                name="Rogue_4"
                geometry={nodes.Rogue_4.geometry}
                material={materials.Shirt}
                skeleton={nodes.Rogue_4.skeleton}
              />
              <skinnedMesh
                name="Rogue_5"
                geometry={nodes.Rogue_5.geometry}
                material={materials.Detail}
                skeleton={nodes.Rogue_5.skeleton}
              />
              <skinnedMesh
                name="Rogue_6"
                geometry={nodes.Rogue_6.geometry}
                material={materials.Boots}
                skeleton={nodes.Rogue_6.skeleton}
              />
            </group>
            <skinnedMesh
              name="Rogue001"
              geometry={nodes.Rogue001.geometry}
              material={materials['Material.006']}
              skeleton={nodes.Rogue001.skeleton}
              position={[0, 0, 0.166]}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={100}
            />
          </group>
        </group>
      </group>
    )
  }

  useGLTF.preload('/npcShop.glb')


  // function Blacksmith() {
  //   const { scene } = useGLTF('Forge.glb')

  //   return (
  //     <group
  //       position={[0, 1.6, 0]}
  //     >
  //       <primitive scale={2} object={scene} />
  //     </group>
  //   )
  // }

  return (
    <group>
      {/* Cubo de prueba */}
      <mesh
      position={[0, 1.35, 0]}
        onPointerOver={() => {
          setHovered(true);
          setEmoji(AnvilIcon); // emoji mientras pasas por encima
        }} onPointerOut={(e) => {
          setHovered(false)
          setEmoji(StandardCursor); // emoji al hacer clic
        }}
        onClick={(e) => {
          openShop('Blacksmith', swordsForSale as any)
        }}
      >
        <boxGeometry args={[1, 2.2, 1]} />
        <meshStandardMaterial color={hovered ? 'gold' : 'orange'} opacity={0}  visible={false} />
      </mesh>

      {/* <Blacksmith /> */}
      <NpcShop />
    </group >
  )
}
