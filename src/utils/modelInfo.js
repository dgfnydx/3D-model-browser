import * as THREE from 'three'

export function createEmptyModelInfo() {
  return {
    name: '-',
    format: '-',
    size: '-',
    meshes: '-',
    materials: '-',
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
  let meshCount = 0
  let vertexCount = 0
  let triangleCount = 0
  const materialSet = new Set()

  root.traverse((child) => {
    if (!child.isMesh || !child.geometry) return

    meshCount += 1

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
        if (material) materialSet.add(material.uuid)
      })
    } else if (child.material) {
      materialSet.add(child.material.uuid)
    }
  })

  const bbox = new THREE.Box3().setFromObject(root)
  const size = new THREE.Vector3()
  bbox.getSize(size)

  return {
    meshCount,
    vertexCount,
    triangleCount,
    materialCount: materialSet.size,
    size
  }
}

export function buildModelInfo(file, ext, stats) {
  return {
    name: file.name,
    format: ext.toUpperCase(),
    size: formatBytes(file.size),
    meshes: stats.meshCount.toLocaleString('zh-CN'),
    materials: stats.materialCount.toLocaleString('zh-CN'),
    vertices: stats.vertexCount.toLocaleString('zh-CN'),
    triangles: stats.triangleCount.toLocaleString('zh-CN'),
    bounds: `${stats.size.x.toFixed(3)} x ${stats.size.y.toFixed(3)} x ${stats.size.z.toFixed(3)}`
  }
}
