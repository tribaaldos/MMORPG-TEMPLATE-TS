import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import StaticCollider from '../character/noPhysicsCharacter/extra/StaticCollider'
import ProjectileDarkBall from '../character/skills/DarkBall/ProjectileDarkBall'

// ── Pedestal slot data ────────────────────────────────────────────────────────
const PEDESTAL_COUNT = 8
const PEDESTAL_RADIUS = 9

const PEDESTAL_COLORS = [
    '#ff4400', // Fire
    '#00aaff', // Ice
    '#ffdd00', // Lightning
    '#aa00ff', // Dark
    '#00ff88', // Nature
    '#ff0066', // Blood
    '#ffffff', // Holy
    '#ff8800', // Inferno
]

// ── Floating Orb ─────────────────────────────────────────────────────────────
function FloatingOrb({ color, index }: { color: string; index: number }) {
    const ref = useRef<THREE.Mesh>(null)
    const offset = useMemo(() => index * ((Math.PI * 2) / PEDESTAL_COUNT), [index])

    useFrame(({ clock }) => {
        if (!ref.current) return
        const t = clock.getElapsedTime()
        ref.current.position.y = 0.55 + Math.sin(t * 1.4 + offset) * 0.12
        ref.current.rotation.y = t * 0.8 + offset
    })

    return (
        <mesh ref={ref} position={[0, 0.55, 0]}>
            <icosahedronGeometry args={[0.28, 2]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={1.8}
                roughness={0.1}
                metalness={0.3}
            />
        </mesh>
    )
}

// ── Single Pedestal ───────────────────────────────────────────────────────────
function Pedestal({ position, color, index }: {
    position: [number, number, number]
    color: string
    index: number
}) {
    return (
        <group position={position}>
            {/* Base */}
            <mesh position={[0, 0.6, 0]}>
                <boxGeometry args={[0.9, 1.2, 0.9]} />
                <meshStandardMaterial color="#1a1a2e" roughness={0.8} metalness={0.2} />
            </mesh>
            {/* Cap */}
            <mesh position={[0, 1.25, 0]}>
                <boxGeometry args={[1.05, 0.12, 1.05]} />
                <meshStandardMaterial color="#252540" roughness={0.6} metalness={0.4} />
            </mesh>
            {/* Ring glow */}
            <mesh position={[0, 1.32, 0]}>
                <torusGeometry args={[0.42, 0.03, 8, 24]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} />
            </mesh>
            {/* Orb */}
            <FloatingOrb color={color} index={index} />
            {/* Point light above pedestal */}
            <pointLight position={[0, 2.2, 0]} color={color} intensity={8} distance={5} decay={2} />
        </group>
    )
}

// ── Pillar ────────────────────────────────────────────────────────────────────
function Pillar({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh position={[0, 3, 0]}>
                <cylinderGeometry args={[0.22, 0.28, 6, 8]} />
                <meshStandardMaterial color="#111122" roughness={0.9} metalness={0.1} />
            </mesh>
            {/* Capital */}
            <mesh position={[0, 6.1, 0]}>
                <boxGeometry args={[0.55, 0.22, 0.55]} />
                <meshStandardMaterial color="#1a1a35" roughness={0.7} metalness={0.3} />
            </mesh>
            {/* Base */}
            <mesh position={[0, 0.1, 0]}>
                <boxGeometry args={[0.5, 0.2, 0.5]} />
                <meshStandardMaterial color="#1a1a35" roughness={0.7} metalness={0.3} />
            </mesh>
        </group>
    )
}

// ── Central Altar ─────────────────────────────────────────────────────────────
function CentralAltar() {
    const orbRef = useRef<THREE.Mesh>(null)

    useFrame(({ clock }) => {
        if (!orbRef.current) return
        const t = clock.getElapsedTime()
        orbRef.current.position.y = 3.8 + Math.sin(t * 1.1) * 0.18
        orbRef.current.rotation.y = t * 0.5
    })

    return (
        <group position={[0, 0, 0]}>
            {/* Step 3 (bottom) */}
            <mesh position={[0, 0.15, 0]}>
                <cylinderGeometry args={[2.5, 2.8, 0.3, 16]} />
                <meshStandardMaterial color="#111122" roughness={0.8} metalness={0.2} />
            </mesh>
            {/* Step 2 */}
            <mesh position={[0, 0.55, 0]}>
                <cylinderGeometry args={[1.8, 2.0, 0.5, 16]} />
                <meshStandardMaterial color="#151530" roughness={0.75} metalness={0.25} />
            </mesh>
            {/* Step 1 (top) */}
            <mesh position={[0, 1.05, 0]}>
                <cylinderGeometry args={[1.1, 1.4, 0.6, 16]} />
                <meshStandardMaterial color="#1a1a40" roughness={0.6} metalness={0.3} />
            </mesh>
            {/* Top disc */}
            <mesh position={[0, 1.38, 0]}>
                <cylinderGeometry args={[1.0, 1.0, 0.08, 32]} />
                <meshStandardMaterial color="#252560" roughness={0.4} metalness={0.6} emissive="#3030aa" emissiveIntensity={0.4} />
            </mesh>
            {/* Altar glow ring */}
            <mesh position={[0, 1.46, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.9, 0.04, 8, 48]} />
                <meshStandardMaterial color="#8888ff" emissive="#8888ff" emissiveIntensity={3} />
            </mesh>
            {/* Central orb */}
            <mesh ref={orbRef} position={[0, 3.8, 0]}>
                <icosahedronGeometry args={[0.5, 3]} />
                <meshStandardMaterial
                    color="#aaaaff"
                    emissive="#6666ff"
                    emissiveIntensity={2}
                    roughness={0.05}
                    metalness={0.5}
                    transparent
                    opacity={0.85}
                />
            </mesh>
            {/* Central light */}
            <pointLight position={[0, 2, 0]} color="#8866ff" intensity={20} distance={12} decay={2} />
        </group>
    )
}

// ── Decorative rune arcs ──────────────────────────────────────────────────────
function RuneArc({ radius, color }: { radius: number; color: string }) {
    const ref = useRef<THREE.Mesh>(null)
    useFrame(({ clock }) => {
        if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * 0.15
    })
    return (
        <mesh ref={ref} position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius, 0.025, 6, 64]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} transparent opacity={0.7} />
        </mesh>
    )
}

// ── Main world component ──────────────────────────────────────────────────────
export default function SkillMuseum() {
    const pedestals = useMemo(() =>
        Array.from({ length: PEDESTAL_COUNT }, (_, i) => {
            const angle = (i / PEDESTAL_COUNT) * Math.PI * 2
            return {
                position: [
                    Math.sin(angle) * PEDESTAL_RADIUS,
                    0,
                    Math.cos(angle) * PEDESTAL_RADIUS,
                ] as [number, number, number],
                color: PEDESTAL_COLORS[i],
                index: i,
            }
        }), [])

    const pillars = useMemo(() =>
        Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * Math.PI * 2
            return {
                position: [
                    Math.sin(angle) * 16,
                    0,
                    Math.cos(angle) * 16,
                ] as [number, number, number],
            }
        }), [])

    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.25} color="#110033" />
            <directionalLight position={[0, 20, 0]} intensity={0.4} color="#4444aa" />

            {/* Background & fog */}
            <color attach="background" args={['#05000f']} />
            <fog attach="fog" args={['#080018', 25, 80]} />
            <ProjectileDarkBall />
            {/* ── Floor (collision + visual) ── */}
            <StaticCollider>
                {/* Main arena floor */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                    <circleGeometry args={[20, 64]} />
                    <meshStandardMaterial color="#0d0d20" roughness={0.9} metalness={0.1} />
                </mesh>
                {/* Outer ring */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                    <ringGeometry args={[14, 20, 64]} />
                    <meshStandardMaterial color="#0a0a1a" roughness={1} />
                </mesh>
                {/* Middle ring */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                    <ringGeometry args={[5, 14, 64]} />
                    <meshStandardMaterial color="#0f0f25" roughness={0.85} />
                </mesh>
            </StaticCollider>

            {/* Decorative floor runes */}
            <RuneArc radius={4.5} color="#5555cc" />
            <RuneArc radius={11} color="#334488" />
            <RuneArc radius={14.5} color="#222244" />

            {/* Central altar */}
            <CentralAltar />

            {/* Skill pedestals */}
            {pedestals.map((p) => (
                <Pedestal key={p.index} position={p.position} color={p.color} index={p.index} />
            ))}

            {/* Perimeter pillars */}
            {pillars.map((p, i) => (
                <Pillar key={i} position={p.position} />
            ))}

            {/* Outer wall glow strip */}
            <mesh position={[0, 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[19.5, 0.06, 8, 128]} />
                <meshStandardMaterial color="#3333aa" emissive="#3333aa" emissiveIntensity={2} />
            </mesh>
        </>
    )
}
