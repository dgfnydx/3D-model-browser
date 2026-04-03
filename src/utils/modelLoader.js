import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'

export function getExtension(filename = '') {
  const idx = filename.lastIndexOf('.')
  return idx === -1 ? '' : filename.slice(idx + 1).toLowerCase()
}

export function applyDefaultMaterials(root) {
  root.traverse((child) => {
    if (!child.isMesh || child.material) return

    child.material = new THREE.MeshStandardMaterial({
      color: 0xb6ddff,
      roughness: 0.55,
      metalness: 0.1
    })
  })
}

export async function loadModelRoot(file) {
  const ext = getExtension(file.name)
  const arrayBuffer = await file.arrayBuffer()
  let root = null

  if (ext === 'glb' || ext === 'gltf') {
    const loader = new GLTFLoader()
    const gltf = await loader.parseAsync(arrayBuffer, '')
    root = gltf.scene
  } else if (ext === 'obj') {
    const loader = new OBJLoader()
    const text = new TextDecoder().decode(arrayBuffer)
    root = loader.parse(text)
  } else if (ext === 'fbx') {
    const loader = new FBXLoader()
    root = loader.parse(arrayBuffer, '')
  } else if (ext === 'stl') {
    const loader = new STLLoader()
    const geometry = loader.parse(arrayBuffer)
    const material = new THREE.MeshStandardMaterial({
      color: 0xaad8ff,
      metalness: 0.08,
      roughness: 0.5
    })
    root = new THREE.Group()
    root.add(new THREE.Mesh(geometry, material))
  } else {
    throw new Error('unsupported_format')
  }

  return { ext, root }
}
