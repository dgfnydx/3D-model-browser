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
    pauseAnimation: 'Pause Animation',
    playAnimation: 'Play Animation',
    resetCamera: 'Reset View',
    fitModel: 'Fit Model'
  },
  language: {
    zhCN: '中文',
    enUS: 'EN'
  },
  tools: {
    title: 'Tools'
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
    meshes: 'Meshes',
    materials: 'Materials',
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
