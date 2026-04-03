import * as THREE from 'three'

function normalizeModelScale(root) {
  root.scale.setScalar(1)
  root.position.set(0, 0, 0)

  const box = new THREE.Box3().setFromObject(root)
  const size = new THREE.Vector3()
  box.getSize(size)

  const maxDim = Math.max(size.x, size.y, size.z)
  if (!Number.isFinite(maxDim) || maxDim <= 0) return

  const targetMaxDim = 8
  const scaleFactor = THREE.MathUtils.clamp(targetMaxDim / maxDim, 0.0001, 10000)
  root.scale.setScalar(scaleFactor)
}

function alignModelToGround(root) {
  root.position.set(0, 0, 0)

  const box = new THREE.Box3().setFromObject(root)
  const center = new THREE.Vector3()
  box.getCenter(center)

  root.position.set(-center.x, -box.min.y, -center.z)

  const alignedBox = new THREE.Box3().setFromObject(root)
  const alignedSize = new THREE.Vector3()
  alignedBox.getSize(alignedSize)

  return alignedSize
}

export function normalizeAndFrameModel(root, camera, controls) {
  normalizeModelScale(root)
  const alignedSize = alignModelToGround(root)

  const maxDim = Math.max(alignedSize.x, alignedSize.y, alignedSize.z)
  const fov = THREE.MathUtils.degToRad(camera.fov)
  let distance = maxDim / (2 * Math.tan(fov / 2))
  distance *= 1.45

  camera.near = Math.max(distance / 1000, 0.01)
  camera.far = distance * 100
  camera.updateProjectionMatrix()

  camera.position.set(distance * 0.95, distance * 0.7, distance * 1.05)
  controls.target.set(0, alignedSize.y * 0.35, 0)
  controls.minDistance = distance * 0.15
  controls.maxDistance = distance * 8
  controls.update()
}
