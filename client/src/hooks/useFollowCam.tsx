import { useThree, useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function useOrbitCam(
    targetRef: React.RefObject<THREE.Object3D>,
    initialDistance = 6,
    initialHeight = 300,
    sensitivity = 0.01
) {
    const { camera, gl, scene } = useThree()

    const rotation = useRef({ x: 0.3, y: 0 })
    const distance = useRef(initialDistance)
    const heightOffset = useRef(initialHeight) // <-- NUEVO

    const desiredCamPos = new THREE.Vector3()
    const targetPos = new THREE.Vector3()
    // const targetDistance = useRef(initialDistance)
    // const currentDistance = useRef(initialDistance)

    const raycaster = new THREE.Raycaster()
    const direction = new THREE.Vector3()

    useEffect(() => {
        let isDragging = false
        let last = { x: 0, y: 0 }

        const onMouseDown = (e: MouseEvent) => {
            isDragging = true
            last.x = e.clientX
            last.y = e.clientY
        }

        const onMouseUp = () => (isDragging = false)

        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging) return
            const dx = e.clientX - last.x
            const dy = e.clientY - last.y

            rotation.current.y -= dx * sensitivity
            rotation.current.x += dy * sensitivity

            const limit = Math.PI / 2 - 0.1
            rotation.current.x = Math.max(-limit, Math.min(limit, rotation.current.x))

            last.x = e.clientX
            last.y = e.clientY
        }

        const onWheel = (e: WheelEvent) => {
            e.preventDefault()
            distance.current += e.deltaY * 0.01
            distance.current = Math.max(2, Math.min(15, distance.current))
        }

        gl.domElement.addEventListener('mousedown', onMouseDown)
        gl.domElement.addEventListener('mouseup', onMouseUp)
        gl.domElement.addEventListener('mousemove', onMouseMove)
        gl.domElement.addEventListener('wheel', onWheel, { passive: false })

        return () => {
            gl.domElement.removeEventListener('mousedown', onMouseDown)
            gl.domElement.removeEventListener('mouseup', onMouseUp)
            gl.domElement.removeEventListener('mousemove', onMouseMove)
            gl.domElement.removeEventListener('wheel', onWheel)
        }
    }, [gl.domElement])

    useFrame(() => {
        if (!targetRef.current) return

        targetRef.current.getWorldPosition(targetPos)
        targetPos.y += initialHeight // altura de la cámara

        const { x, y } = rotation.current
        const r = distance.current

        // 🎯 posición deseada de la cámara
        desiredCamPos.set(
            targetPos.x + r * Math.sin(y) * Math.cos(x),
            targetPos.y + r * Math.sin(x),
            targetPos.z + r * Math.cos(y) * Math.cos(x)
        )

        // 🚧 LÓGICA DE COLISIÓN DE CÁMARA
        direction.subVectors(desiredCamPos, targetPos).normalize()
        raycaster.set(targetPos, direction)

        const blockers = scene.children.filter(o => o.userData.camBlocker)
        const hits = raycaster.intersectObjects(blockers, true)

        const finalCamPos = desiredCamPos.clone()

        if (hits.length > 0.5) {
            finalCamPos.copy(hits[0].point)
            // finalCamPos.y += -1.5;
            finalCamPos.addScaledVector(direction, -0.25) // separa un poco para evitar clipping
        }

        // 📸 coloca cámara
        camera.position.lerp(finalCamPos, 1) // sin lerp = instantáneo
        camera.lookAt(targetPos)
    })
    useEffect(() => {
        distance.current = initialDistance
        heightOffset.current = initialHeight
    }, [initialDistance, initialHeight])

}
