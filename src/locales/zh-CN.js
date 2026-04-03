export default {
  app: {
    title: '3D 模型查看器',
    subtitle: '导入后即可旋转、缩放、平移，并查看模型统计信息。'
  },
  actions: {
    importModel: '导入模型',
    resetCamera: '重置视角',
    fitModel: '模型居中'
  },
  language: {
    zhCN: '中文',
    enUS: 'EN'
  },
  viewer: {
    emptyTitle: '把 3D 模型文件拖到这里，或点击“导入模型”',
    supportedFormats: '支持 glTF / GLB / OBJ / FBX / STL',
    interactions: '左键旋转 · 滚轮缩放 · 右键平移'
  },
  info: {
    title: '模型信息',
    name: '名称',
    format: '格式',
    size: '文件大小',
    meshes: '网格数量',
    materials: '材质数量',
    vertices: '顶点数量',
    triangles: '三角面数量',
    bounds: '包围盒尺寸'
  },
  help: {
    title: '操作说明',
    rotate: '左键拖动：旋转模型',
    zoom: '滚轮：缩放模型',
    pan: '右键拖动：平移视角'
  },
  errors: {
    loadFailed: '模型加载失败：{message}',
    viewerNotReady: '查看器尚未初始化完成',
    unsupportedFormat: '暂不支持 {format} 格式'
  }
}
