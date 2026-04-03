import * as THREE from 'three'

export function createEmptyModelInfo() {
  return {
    name: '-',
    format: '-',
    size: '-',
    skinnedMeshes: '-',
    bones: '-',
    meshes: '-',
    materials: '-',
    materialTypes: '-',
    textures: '-',
    vertices: '-',
    triangles: '-',
    bounds: '-'
  }
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '-'
  if (bytes < 1024) return `${bytes} B`

  const units = ['KB', 'MB', 'GB']
  let size = bytes / 1024
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}

export function collectModelStats(root) {
  let boneCount = 0
  let meshCount = 0
  let skinnedMeshCount = 0
  let textureCount = 0
  let vertexCount = 0
  let triangleCount = 0
  const boneSet = new Set()
  const materialSet = new Set()
  const materialTypeSet = new Set()
  const textureSet = new Set()

  root.traverse((child) => {
    if (child.isBone) {
      boneSet.add(child.uuid)
    }

    if (!child.isMesh || !child.geometry) return

    meshCount += 1
    if (child.isSkinnedMesh) {
      skinnedMeshCount += 1
    }

    const geometry = child.geometry
    const position = geometry.attributes?.position

    if (position) vertexCount += position.count

    if (geometry.index) {
      triangleCount += Math.floor(geometry.index.count / 3)
    } else if (position) {
      triangleCount += Math.floor(position.count / 3)
    }

    if (Array.isArray(child.material)) {
      child.material.forEach((material) => {
        if (!material) return

        materialSet.add(material.uuid)
        materialTypeSet.add(material.type)

        for (const value of Object.values(material)) {
          if (value?.isTexture) {
            textureSet.add(value.uuid)
          }
        }
      })
    } else if (child.material) {
      materialSet.add(child.material.uuid)
      materialTypeSet.add(child.material.type)

      for (const value of Object.values(child.material)) {
        if (value?.isTexture) {
          textureSet.add(value.uuid)
        }
      }
    }
  })

  boneCount = boneSet.size
  textureCount = textureSet.size

  const bbox = new THREE.Box3().setFromObject(root)
  const size = new THREE.Vector3()
  bbox.getSize(size)

  return {
    boneCount,
    meshCount,
    skinnedMeshCount,
    textureCount,
    vertexCount,
    triangleCount,
    materialCount: materialSet.size,
    materialTypes: [...materialTypeSet],
    size
  }
}

export function buildModelInfo(file, ext, stats) {
  return {
    name: file.name,
    format: ext.toUpperCase(),
    size: formatBytes(file.size),
    skinnedMeshes: stats.skinnedMeshCount.toLocaleString('zh-CN'),
    bones: stats.boneCount.toLocaleString('zh-CN'),
    meshes: stats.meshCount.toLocaleString('zh-CN'),
    materials: stats.materialCount.toLocaleString('zh-CN'),
    materialTypes: stats.materialTypes.length ? stats.materialTypes.join(', ') : '-',
    textures: stats.textureCount.toLocaleString('zh-CN'),
    vertices: stats.vertexCount.toLocaleString('zh-CN'),
    triangles: stats.triangleCount.toLocaleString('zh-CN'),
    bounds: `${stats.size.x.toFixed(3)} x ${stats.size.y.toFixed(3)} x ${stats.size.z.toFixed(3)}`
  }
}
