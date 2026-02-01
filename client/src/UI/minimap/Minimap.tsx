import { useMemo } from 'react'
import { useCharacterStore } from '../../store/useCharacterStore'
import './Minimap.css'

type Props = {
	size?: number
	scale?: number
}

const clampAngle = (angle: number) => {
	if (angle > Math.PI) return angle - Math.PI * 2
	if (angle < -Math.PI) return angle + Math.PI * 2
	return angle
}

const quatToYaw = (x: number, y: number, z: number, w: number) => {
	const siny = 2 * (w * y + x * z)
	const cosy = 1 - 2 * (y * y + z * z)
	return clampAngle(Math.atan2(siny, cosy))
}

export default function Minimap({ size = 180, scale = 3 }: Props) {
	const position = useCharacterStore((s) => s.position)
	const rotation = useCharacterStore((s) => s.rotation)

	const yaw = useMemo(() => quatToYaw(rotation[0], rotation[1], rotation[2], rotation[3]), [rotation])
	const arrowRotation = -yaw + Math.PI

	const gridSize = 24
	const offsetX = ((-position[0] * scale) % gridSize) || 0
	const offsetY = ((-position[2] * scale) % gridSize) || 0

	return (
		<div className="minimap" style={{ width: size, height: size }}>
			<div
				className="minimap-surface"
				style={{
					backgroundPosition: `${offsetX}px ${offsetY}px`,
				}}
			/>
			<div className="minimap-center">
				<div className="minimap-player" style={{ transform: `translate(-50%, -50%) rotate(${arrowRotation}rad)` }} />
			</div>
			<div className="minimap-compass">N</div>
		</div>
	)
}
