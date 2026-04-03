export const DISPLAY_MODES = {
  solid: 'solid',
  wireframe: 'wireframe',
  xray: 'xray'
}

function forEachMaterial(material, callback) {
  if (Array.isArray(material)) {
    material.forEach((item) => {
      if (item) callback(item)
    })
    return
  }

  if (material) callback(material)
}

function ensureMaterialState(material) {
  if (!material.userData.__viewerDisplayState) {
    material.userData.__viewerDisplayState = {
      depthWrite: material.depthWrite,
      opacity: material.opacity,
      transparent: material.transparent,
      wireframe: material.wireframe
    }
  }

  return material.userData.__viewerDisplayState
}

function applyMaterialDisplayMode(material, mode) {
  const original = ensureMaterialState(material)

  material.wireframe = original.wireframe
  material.transparent = original.transparent
  material.opacity = original.opacity
  material.depthWrite = original.depthWrite

  if (mode === DISPLAY_MODES.wireframe) {
    material.wireframe = true
  } else if (mode === DISPLAY_MODES.xray) {
    material.transparent = true
    material.opacity = Math.min(original.opacity, 0.32)
    material.depthWrite = false
  }

  material.needsUpdate = true
}

export function applyDisplayMode(root, mode) {
  if (!root) return

  root.traverse((child) => {
    if (!child.isMesh || !child.material) return

    forEachMaterial(child.material, (material) => {
      applyMaterialDisplayMode(material, mode)
    })
  })
}
