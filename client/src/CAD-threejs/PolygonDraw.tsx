// import { useState, useEffect, useMemo, useRef } from 'react'
// import * as THREE from 'three'
// import { Html } from '@react-three/drei'
// import { useControls, folder } from 'leva'
// import Draggable from 'react-draggable'

// function DrawingPlane({ onAddPoint, isClosed, isDrawing }: any) {
//     const handleClick = (event: any) => {
//         if (!isDrawing || isClosed) return
//         const point = event.point.clone()
//         onAddPoint(point)
//     }

//     return (
//         <mesh
//             onClick={handleClick}
//             rotation-x={-Math.PI / 2}
//             position={[0, 0, 0]}
//         >
//             <planeGeometry args={[100, 100]} />
//             <meshBasicMaterial visible={false} />
//         </mesh>
//     )
// }

// function PolygonLines({ points, isClosed }: any) {
//     if (points.length < 2) return null
//     const geometry = new THREE.BufferGeometry()
//     const positions = points.flatMap((p: THREE.Vector3) => [p.x, p.y, p.z])
//     geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
//     const LineType = isClosed ? 'lineLoop' : 'line'

//     return (
//         <LineType>
//             <primitive object={geometry} attach="geometry" />
//             <lineBasicMaterial color={isClosed ? 'lime' : 'orange'} linewidth={2} />
//         </LineType>
//     )
// }

// function ExtrudedBuilding({ points, height }: any) {

//     const shape = useMemo(() => {
//         if (points.length < 3) return null

//         const s = new THREE.Shape()
//         s.moveTo(points[0].x, points[0].z)
//         for (let i = 1; i < points.length; i++) s.lineTo(points[i].x, points[i].z)
//         s.closePath()
//         return s
//     }, [points])

//     const extrudeSettings = useMemo(
//         () => ({
//             steps: 1,
//             depth: -height, // hacia arriba
//             bevelEnabled: false,
//         }),
//         [height]
//     )

//     if (!shape) return null


//     return (
//         <mesh rotation-x={Math.PI / 2}>
//             <extrudeGeometry args={[shape, extrudeSettings]} />
//             <meshStandardMaterial color="#7ec8e3" side={THREE.FrontSide} />
//         </mesh>
//     )
// }
// export default function PolygonDrawer() {
//     const [isDrawing, setIsDrawing] = useState(false)
//     const [points, setPoints] = useState<THREE.Vector3[]>([])
//     const [isClosed, setIsClosed] = useState(false)
//     const [height, setHeight] = useState<number | null>(null)
//     const [inputValue, setInputValue] = useState('')
//     const CLOSE_DISTANCE = 0.5

//     const handleAddPoint = (point: THREE.Vector3) => {
//         if (!isDrawing || isClosed) return
//         if (points.length >= 3) {
//             const first = points[0]
//             const dist = point.distanceTo(first)
//             if (dist < CLOSE_DISTANCE) {
//                 setIsClosed(true)
//                 return
//             }
//         }
//         setPoints((prev) => [...prev, point])
//     }

//     useEffect(() => {
//         if (!isDrawing) {
//             setPoints([])
//             setIsClosed(false)
//             setHeight(null)
//             setInputValue('')
//         }
//     }, [isDrawing])

//     const handleConfirmHeight = () => {
//         const value = parseFloat(inputValue)
//         if (!isNaN(value)) setHeight(value)
//     }

//     // --- controles de leva para editar puntos una vez creado el edificio ---
//     // const levaControls: any = {}
//     // points.forEach((p, i) => {
//     //     levaControls[`Punto ${i + 1}`] = folder({
//     //         [`x${i}`]: { value: p.x, min: -20, max: 20, step: 0.1 },
//     //         [`z${i}`]: { value: p.z, min: -20, max: 20, step: 0.1 },
//     //     })
//     // })

//     // const updatedValues = useControls('Editar puntos', levaControls,

//     // )

//     // useEffect(() => {
//     //     if (Object.keys(updatedValues).length > 0 && isClosed) {
//     //         setPoints((prev) =>
//     //             prev.map((p, i) => {
//     //                 const newX = (updatedValues as any)[`x${i}`] ?? p.x
//     //                 const newZ = (updatedValues as any)[`z${i}`] ?? p.z
//     //                 return new THREE.Vector3(newX, p.y, newZ)
//     //             })
//     //         )
//     //     }
//     // }, [updatedValues])

//     function updatePoint(index: number, axis: 'x' | 'z', value: number) {
//         setPoints((prev) =>
//             prev.map((p, i) =>
//                 i === index ? new THREE.Vector3(axis === 'x' ? value : p.x, p.y, axis === 'z' ? value : p.z) : p
//             )
//         )
//     }

//     return (
//         <>

//             <DrawingPlane
//                 onAddPoint={handleAddPoint}
//                 isClosed={isClosed}
//                 isDrawing={isDrawing}
//             />

//             <PolygonLines points={points} isClosed={isClosed} />

//             {height && <ExtrudedBuilding points={points} height={height} />}

//             <Html >
//                 <div
//                     style={{
//                         position: 'absolute',
//                         top: '20px',
//                         left: '20px',
//                         background: 'rgba(255,255,255,0.85)',
//                         padding: '10px 15px',
//                         borderRadius: '8px',
//                     }}
//                 >
//                     <button
//                         onClick={() => setIsDrawing((prev) => !prev)}
//                         style={{
//                             padding: '8px 12px',
//                             background: isDrawing ? 'orange' : '#ccc',
//                             border: 'none',
//                             borderRadius: '6px',
//                             cursor: 'pointer',
//                             fontWeight: 'bold',
//                             marginRight: '10px',
//                         }}
//                     >
//                         {isDrawing ? '🛑 Salir del modo dibujo' : '✏️ Activar dibujo'}
//                     </button>

//                     {isClosed && height === null && (
//                         <>
//                             <input
//                                 type="number"
//                                 placeholder="Altura"
//                                 value={inputValue}
//                                 onChange={(e) => setInputValue(e.target.value)}
//                                 style={{
//                                     width: '70px',
//                                     marginRight: '8px',
//                                     padding: '5px',
//                                     borderRadius: '4px',
//                                     border: '1px solid #aaa',
//                                 }}
//                             />
//                             <button
//                                 onClick={handleConfirmHeight}
//                                 style={{
//                                     padding: '6px 10px',
//                                     borderRadius: '5px',
//                                     border: 'none',
//                                     background: '#90ee90',
//                                     cursor: 'pointer',
//                                 }}
//                             >
//                                 Aceptar
//                             </button>
//                         </>
//                     )}
//                 </div>

//                     <div
//                         style={{
//                             position: 'absolute',
//                             top: 20,
//                             right: 20,
//                             background: 'rgba(255,255,255,0.9)',
//                             padding: 10,
//                             borderRadius: 8,
//                         }}
//                     >
//                         {points.map((p, i) => (
//                             <div key={i}>
//                                 <label>Punto {i + 1}</label>
//                                 <input
//                                     type="number"
//                                     step="0.1"
//                                     value={p.x.toFixed(1)}
//                                     onChange={(e) => updatePoint(i, 'x', parseFloat(e.target.value))}
//                                 />
//                                 <input
//                                     type="number"
//                                     step="0.1"
//                                     value={p.z.toFixed(1)}
//                                     onChange={(e) => updatePoint(i, 'z', parseFloat(e.target.value))}
//                                 />
//                             </div>
//                         ))}
//                     </div>

//             </Html>
//         </>
//     )
// }
