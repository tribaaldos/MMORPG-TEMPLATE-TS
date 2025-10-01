// netVectors.ts
import * as THREE from 'three'

export type V3 = [number, number, number]

export const v3 = (x: number, y: number, z: number): V3 => [x, y, z]
export const toV3 = (vec: THREE.Vector3): V3 => [vec.x, vec.y, vec.z]
export const fromV3 = (arr: V3): THREE.Vector3 => new THREE.Vector3(arr[0], arr[1], arr[2])
