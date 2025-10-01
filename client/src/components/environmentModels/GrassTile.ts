import * as THREE from 'three'

/**
 * Crea una “blade” (tira) con dos caras (frente/dorso) y segmentos verticales.
 * Igual al esquema CreateGeometry_(segments): VERTICES = (segments+1)*2
 * y los índices del dorso usan offset +VERTICES.
 *
 * @param segments  nº de segmentos verticales (>=1)
 * @param width     ancho de la base (X)
 * @param height    alto total (Y)
 * @param thickness grosor entre frente/dorso (Z)
 * @param taper     si true, se afina hacia la punta
 */
export function createGrassBladeStripGeometry(
  segments = 4,
  width = 1,
  height = 1,
  thickness = 0.1,
  taper = true
): THREE.BufferGeometry {
  const VERTICES = (segments + 1) * 2
  const halfW = width * 0.5
  const halfT = thickness * 0.5

  // --- VERTICES (frente + dorso) ---
  // Frente en z=+halfT, dorso en z=-halfT.
  // Dos vértices por fila: izquierda (-w), derecha (+w).
  const total = VERTICES * 2 // frente + dorso
  const positions = new Float32Array(total * 3)
  const uvs       = new Float32Array(total * 2)

  // Construye frente
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const y = t * height
    const w = taper ? halfW * (1 - t) : halfW // afina hacia la punta si taper=true

    // índice base para frente
    const base = (i * 2) * 3
    // izquierda
    positions[base + 0] = -w
    positions[base + 1] =  y
    positions[base + 2] =  +halfT
    // derecha
    positions[base + 3] = +w
    positions[base + 4] =  y
    positions[base + 5] = +halfT

    const baseUV = (i * 2) * 2
    uvs[baseUV + 0] = 0.0; uvs[baseUV + 1] = t // izq
    uvs[baseUV + 2] = 1.0; uvs[baseUV + 3] = t // der
  }

  // Duplica para dorso con z negativa (mismo x,y)
  const frontCount = VERTICES
  for (let i = 0; i < frontCount; i++) {
    const srcP = i * 3
    const dstP = (frontCount + i) * 3
    positions[dstP + 0] = positions[srcP + 0]
    positions[dstP + 1] = positions[srcP + 1]
    positions[dstP + 2] = -halfT // invierte Z para dorso

    const srcUV = i * 2
    const dstUV = (frontCount + i) * 2
    uvs[dstUV + 0] = uvs[srcUV + 0]
    uvs[dstUV + 1] = uvs[srcUV + 1]
  }

  // --- ÍNDICES (frente y dorso) como en tu CreateGeometry_ ---
  const indices = new Uint32Array(segments * 12)
  for (let i = 0; i < segments; ++i) {
    const vi = i * 2
    // Frente (dos triángulos)
    indices[i*12 + 0] = vi + 0
    indices[i*12 + 1] = vi + 1
    indices[i*12 + 2] = vi + 2

    indices[i*12 + 3] = vi + 2
    indices[i*12 + 4] = vi + 1
    indices[i*12 + 5] = vi + 3

    // Dorso (mismo patrón con offset +VERTICES y winding invertido)
    const fi = VERTICES + vi
    indices[i*12 + 6]  = fi + 2
    indices[i*12 + 7]  = fi + 1
    indices[i*12 + 8]  = fi + 0

    indices[i*12 + 9]  = fi + 3
    indices[i*12 + 10] = fi + 1
    indices[i*12 + 11] = fi + 2
  }

  const geom = new THREE.BufferGeometry()
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geom.setAttribute('uv',       new THREE.BufferAttribute(uvs, 2))
  geom.setIndex(new THREE.BufferAttribute(indices, 1))
  geom.computeVertexNormals()
  // Base en y=0 (como tu blade típico). Si la quieres centrada, descomenta:
  // geom.center()
  return geom
}
