import {  useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useBuildingStore } from './useLineDrawing'
import { LineGeometry, LineMaterial } from 'three/examples/jsm/Addons.js'
import { Line2 } from 'three/examples/jsm/lines/webgpu/Line2.js'

function DrawingPlane() {
  const { addPoint, isClosed, isDrawing } = useBuildingStore()
  const [hoverPoint, setHoverPoint] = useState<THREE.Vector3 | null>(null)

  const handleClick = (event: any) => {
    if (!isDrawing || isClosed) return
    addPoint(event.point.clone())
  }

  const handleMove = (event: any) => {
    if (!isDrawing || isClosed) return
    setHoverPoint(event.point.clone())
  }

  return (
    <>
      <mesh
        onClick={handleClick}
        onPointerMove={handleMove}
        rotation-x={-Math.PI / 2}
        position={[0, 0.05   , 0]}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <PreviewLine hoverPoint={hoverPoint} />
    </>
  )
}



 // 
function PreviewLine({ hoverPoint }: { hoverPoint: THREE.Vector3 | null }) {
  const { points, isClosed, isDrawing, colorLine } = useBuildingStore()
  const lineRef = useRef<Line2>(null!)



  if (!isDrawing || isClosed || points.length === 0 || !hoverPoint) return null

  const positions = [
    points[points.length - 1].x, points[points.length - 1].y, points[points.length - 1].z,
    hoverPoint.x, hoverPoint.y, hoverPoint.z
  ]

  const geometry = new LineGeometry()
  geometry.setPositions(positions)

  const material = new LineMaterial({
    color: colorLine ,
    linewidth: 0.005,
  })

  // @ts-ignore
  return <primitive object={new Line2(geometry, material)} ref={lineRef} />
}


export function PolygonLines() {
  const { points, isClosed } = useBuildingStore()
  const lineRef = useRef<Line2>(null!)

  if (points.length < 2) return null

  const positions = points.flatMap(p => [p.x, p.y, p.z])
  if (isClosed) positions.push(points[0].x, points[0].y, points[0].z)

  const geometry = new LineGeometry()
  geometry.setPositions(positions)

  const material = new LineMaterial({
    color: isClosed ? 0x00ff00 : 0xffa500,
    linewidth: 0.01
  })

  // @ts-ignore
  return <primitive object={new Line2(geometry, material)} ref={lineRef} />
}

function ExtrudedBuilding() {
  const { points, height } = useBuildingStore()
  const shape = useMemo(() => {
    if (points.length < 3) return null
    const s = new THREE.Shape()
    s.moveTo(points[0].x, points[0].z)
    for (let i = 1; i < points.length; i++) s.lineTo(points[i].x, points[i].z)
    s.closePath()
    return s
  }, [points])

  if (!shape || !height) return null

  const extrudeSettings = { steps: 1, depth: -height, bevelEnabled: false }
    // const { colorExtrude } = useBuildingStore()
  return (
    <mesh rotation-x={Math.PI / 2}>
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial color='red' side={THREE.DoubleSide} />
    </mesh>
  )
}

export default function NewPolygonDrawer() {
  return (
    <>
      <DrawingPlane />
      <PolygonLines />
      <ExtrudedBuilding />
    </>
  )
}
