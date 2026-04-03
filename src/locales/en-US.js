export default {
  app: {
    title: '3D Model Viewer',
    subtitle: 'Import a model to rotate, zoom, pan, and inspect key statistics.'
  },
  common: {
    collapse: 'Collapse',
    expand: 'Expand'
  },
  actions: {
    importModel: 'Import Model',
    resetCamera: 'Reset View',
    fitModel: 'Fit Model'
  },
  animation: {
    clip: 'Clip',
    noAnimations: 'This model does not contain animation clips',
    playSelected: 'Play selected clip',
    title: 'Animation'
  },
  language: {
    zhCN: '中文',
    enUS: 'EN'
  },
  actionsPanel: {
    title: 'Actions'
  },
  viewer: {
    emptyTitle: 'Drop a 3D model here, or click "Import Model".',
    supportedFormats: 'Supports glTF / GLB / OBJ / FBX / STL',
    interactions: 'Left drag to rotate · Wheel to zoom · Right drag to pan'
  },
  info: {
    title: 'Model Info',
    name: 'Name',
    format: 'Format',
    size: 'File Size',
    skinnedMeshes: 'Skinned Meshes',
    bones: 'Bones',
    meshes: 'Meshes',
    materials: 'Materials',
    materialTypes: 'Material Types',
    textures: 'Textures',
    vertices: 'Vertices',
    triangles: 'Triangles',
    bounds: 'Bounding Box'
  },
  help: {
    title: 'Controls',
    rotate: 'Left drag: rotate model',
    zoom: 'Mouse wheel: zoom',
    pan: 'Right drag: pan view'
  },
  errors: {
    loadFailed: 'Failed to load model: {message}',
    viewerNotReady: 'Viewer is not ready yet',
    unsupportedFormat: '{format} format is not supported yet'
  }
}
