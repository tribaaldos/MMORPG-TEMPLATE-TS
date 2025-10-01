export default function WeaponModel() {
    return (
        <mesh position={[0.2, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]} scale={5}>
            <boxGeometry args={[1, 3, 0.1]} />
            <meshStandardMaterial color="blue" />
        </mesh>
    );
}