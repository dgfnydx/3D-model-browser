<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'

const canvasRef = ref(null)
const viewerPanelRef = ref(null)
const fileInputRef = ref(null)
const isDragOver = ref(false)
const showEmptyHint = ref(true)

const modelInfo = reactive({
  name: '-',
  format: '-',
  size: '-',
  meshes: '-',
  materials: '-',
  vertices: '-',
  triangles: '-',
  bounds: '-'
})

const viewer = {
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  currentModelRoot: null,
  animationId: null
}

let resizeObserver = null

function resetInfo() {
  modelInfo.name = '-'
  modelInfo.format = '-'
  modelInfo.size = '-'
  modelInfo.meshes = '-'
  modelInfo.materials = '-'
  modelInfo.vertices = '-'
  modelInfo.triangles = '-'
  modelInfo.bounds = '-'
}

function formatBytes(bytes) {
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

function getExtension(filename = '') {
  const idx = filename.lastIndexOf('.')
  return idx === -1 ? '' : filename.slice(idx + 1).toLowerCase()
}

function removeCurrentModel() {
  if (!viewer.currentModelRoot) return

  viewer.scene.remove(viewer.currentModelRoot)
  viewer.currentModelRoot.traverse((child) => {
    if (child.geometry) child.geometry.dispose()

    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material.dispose?.())
      } else {
        child.material.dispose?.()
      }
    }
  })

  viewer.currentModelRoot = null
}

function collectModelStats(root) {
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

function normalizeModelScale(root) {
  root.scale.setScalar(1)
  root.position.set(0, 0, 0)

  const box = new THREE.Box3().setFromObject(root)
  const size = new THREE.Vector3()
  box.getSize(size)

  const maxDim = Math.max(size.x, size.y, size.z)

  if (!Number.isFinite(maxDim) || maxDim <= 0) return

  const targetMaxDim = 8
  const minScale = 0.0001
  const maxScale = 10000
  const scaleFactor = THREE.MathUtils.clamp(targetMaxDim / maxDim, minScale, maxScale)

  root.scale.setScalar(scaleFactor)
}

function frameModel(root) {
  root.position.set(0, 0, 0)

  const box = new THREE.Box3().setFromObject(root)
  const size = new THREE.Vector3()
  const center = new THREE.Vector3()
  box.getSize(size)
  box.getCenter(center)

  root.position.set(-center.x, -box.min.y, -center.z)

  const alignedBox = new THREE.Box3().setFromObject(root)
  const alignedSize = new THREE.Vector3()
  alignedBox.getSize(alignedSize)

  const maxDim = Math.max(alignedSize.x, alignedSize.y, alignedSize.z)
  const fov = THREE.MathUtils.degToRad(viewer.camera.fov)
  let distance = maxDim / (2 * Math.tan(fov / 2))
  distance *= 1.45

  viewer.camera.near = Math.max(distance / 1000, 0.01)
  viewer.camera.far = distance * 100
  viewer.camera.updateProjectionMatrix()

  viewer.camera.position.set(distance * 0.95, distance * 0.7, distance * 1.05)
  viewer.controls.target.set(0, alignedSize.y * 0.35, 0)
  viewer.controls.minDistance = distance * 0.15
  viewer.controls.maxDistance = distance * 8
  viewer.controls.update()
}

function withDefaultMaterial(root) {
  root.traverse((child) => {
    if (!child.isMesh || child.material) return

    child.material = new THREE.MeshStandardMaterial({
      color: 0xb6ddff,
      roughness: 0.55,
      metalness: 0.1
    })
  })
}

async function parseModel(file) {
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
    throw new Error(`暂不支持 ${ext || '该'} 格式`)
  }

  withDefaultMaterial(root)
  normalizeModelScale(root)

  removeCurrentModel()
  viewer.currentModelRoot = root
  viewer.scene.add(viewer.currentModelRoot)
  frameModel(viewer.currentModelRoot)

  const stats = collectModelStats(viewer.currentModelRoot)
  modelInfo.name = file.name
  modelInfo.format = ext.toUpperCase()
  modelInfo.size = formatBytes(file.size)
  modelInfo.meshes = stats.meshCount.toLocaleString('zh-CN')
  modelInfo.materials = stats.materialCount.toLocaleString('zh-CN')
  modelInfo.vertices = stats.vertexCount.toLocaleString('zh-CN')
  modelInfo.triangles = stats.triangleCount.toLocaleString('zh-CN')
  modelInfo.bounds = `${stats.size.x.toFixed(3)} x ${stats.size.y.toFixed(3)} x ${stats.size.z.toFixed(3)}`
  showEmptyHint.value = false
}

async function handleFile(file) {
  if (!file) return

  try {
    await parseModel(file)
  } catch (error) {
    console.error(error)
    window.alert(`模型加载失败：${error.message}`)
  }
}

function resizeRenderer() {
  if (!viewer.renderer || !viewer.camera || !viewerPanelRef.value) return

  const width = viewerPanelRef.value.clientWidth
  const height = viewerPanelRef.value.clientHeight

  if (width === 0 || height === 0) return

  viewer.renderer.setSize(width, height, false)
  viewer.camera.aspect = width / height
  viewer.camera.updateProjectionMatrix()
}

function initThree() {
  viewer.scene = new THREE.Scene()
  viewer.scene.background = new THREE.Color(0x09111f)
  viewer.scene.fog = new THREE.Fog(0x09111f, 8, 45)

  viewer.camera = new THREE.PerspectiveCamera(60, 1, 0.01, 2000)
  viewer.camera.position.set(2.6, 1.9, 3.4)

  viewer.renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  })
  viewer.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  viewer.renderer.outputColorSpace = THREE.SRGBColorSpace
  viewer.renderer.toneMapping = THREE.ACESFilmicToneMapping
  viewer.renderer.toneMappingExposure = 1.05

  viewer.controls = new OrbitControls(viewer.camera, canvasRef.value)
  viewer.controls.enableDamping = true
  viewer.controls.dampingFactor = 0.08
  viewer.controls.target.set(0, 0.8, 0)
  viewer.controls.minDistance = 0.2
  viewer.controls.maxDistance = 200
  viewer.controls.update()

  const hemi = new THREE.HemisphereLight(0xc5e8ff, 0x1a1a20, 1)
  viewer.scene.add(hemi)

  const dir = new THREE.DirectionalLight(0xffffff, 1.3)
  dir.position.set(5, 8, 3)
  viewer.scene.add(dir)

  const backLight = new THREE.DirectionalLight(0x7ec8ff, 0.5)
  backLight.position.set(-4, 2, -5)
  viewer.scene.add(backLight)

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(20, 100),
    new THREE.MeshStandardMaterial({
      color: 0x08101c,
      roughness: 0.95,
      metalness: 0.02
    })
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.001
  viewer.scene.add(ground)

  const majorGrid = new THREE.GridHelper(20, 20, 0x76d6ff, 0x2b5e86)
  majorGrid.position.y = 0.002
  majorGrid.material.opacity = 0.6
  majorGrid.material.transparent = true
  viewer.scene.add(majorGrid)

  const minorGrid = new THREE.GridHelper(20, 80, 0x214767, 0x214767)
  minorGrid.position.y = 0.001
  minorGrid.material.opacity = 0.24
  minorGrid.material.transparent = true
  viewer.scene.add(minorGrid)

  resizeRenderer()
}

function animate() {
  viewer.controls.update()
  viewer.renderer.render(viewer.scene, viewer.camera)
  viewer.animationId = window.requestAnimationFrame(animate)
}

function openFileDialog() {
  fileInputRef.value?.click()
}

function onFileChange(event) {
  const file = event.target.files?.[0]
  handleFile(file)
  event.target.value = ''
}

function onDrop(event) {
  isDragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  handleFile(file)
}

function resetCamera() {
  viewer.camera.position.set(2.6, 1.9, 3.4)
  viewer.controls.target.set(0, 0.8, 0)
  viewer.controls.minDistance = 0.2
  viewer.controls.maxDistance = 200
  viewer.controls.update()
}

function fitModel() {
  if (viewer.currentModelRoot) frameModel(viewer.currentModelRoot)
}

function cleanup() {
  if (viewer.animationId) window.cancelAnimationFrame(viewer.animationId)
  resizeObserver?.disconnect()
  resizeObserver = null
  viewer.controls?.dispose()
  removeCurrentModel()
  viewer.renderer?.dispose()
}

onMounted(() => {
  resetInfo()
  initThree()
  animate()

  resizeObserver = new ResizeObserver(() => {
    window.requestAnimationFrame(resizeRenderer)
  })

  if (viewerPanelRef.value) {
    resizeObserver.observe(viewerPanelRef.value)
  }
})

onBeforeUnmount(() => {
  cleanup()
})
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="brand">
        <h1>3D 模型查看器</h1>
        <p class="subtitle">导入后即可旋转、缩放、平移，并查看模型统计信息。</p>
      </div>

      <div class="actions">
        <button class="btn primary" @click="openFileDialog">导入模型</button>
        <input
          ref="fileInputRef"
          type="file"
          accept=".glb,.gltf,.obj,.fbx,.stl"
          hidden
          @change="onFileChange"
        />
        <button class="btn" @click="resetCamera">重置视角</button>
        <button class="btn" @click="fitModel">模型居中</button>
      </div>
    </header>

    <main class="workspace">
      <section
        ref="viewerPanelRef"
        class="viewer-panel"
        :class="{ 'drag-over': isDragOver }"
        @dragenter.prevent.stop="isDragOver = true"
        @dragover.prevent.stop="isDragOver = true"
        @dragleave.prevent.stop="isDragOver = false"
        @drop.prevent.stop="onDrop"
      >
        <canvas ref="canvasRef" class="viewer-canvas"></canvas>

        <div v-if="showEmptyHint" class="empty-hint">
          <p>把 3D 模型文件拖到这里，或点击“导入模型”</p>
          <p class="hint-meta">支持 glTF / GLB / OBJ / FBX / STL</p>
          <p class="hint-meta">左键旋转 · 滚轮缩放 · 右键平移</p>
        </div>
      </section>

      <aside class="info-panel">
        <h2>模型信息</h2>

        <dl class="stats">
          <div><dt>名称</dt><dd>{{ modelInfo.name }}</dd></div>
          <div><dt>格式</dt><dd>{{ modelInfo.format }}</dd></div>
          <div><dt>文件大小</dt><dd>{{ modelInfo.size }}</dd></div>
          <div><dt>网格数量</dt><dd>{{ modelInfo.meshes }}</dd></div>
          <div><dt>材质数量</dt><dd>{{ modelInfo.materials }}</dd></div>
          <div><dt>顶点数量</dt><dd>{{ modelInfo.vertices }}</dd></div>
          <div><dt>三角面数量</dt><dd>{{ modelInfo.triangles }}</dd></div>
          <div><dt>包围盒尺寸</dt><dd>{{ modelInfo.bounds }}</dd></div>
        </dl>

        <section class="help">
          <h3>操作说明</h3>
          <ul>
            <li>左键拖动：旋转模型</li>
            <li>滚轮：缩放模型</li>
            <li>右键拖动：平移视角</li>
          </ul>
        </section>
      </aside>
    </main>
  </div>
</template>
