import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import * as THREE from 'three'
import { useI18n } from 'vue-i18n'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { createAnimationController } from '../utils/modelAnimation'
import { normalizeAndFrameModel } from '../utils/modelTransform'
import { applyDefaultMaterials, loadModelRoot } from '../utils/modelLoader'
import { buildModelInfo, collectModelStats, createEmptyModelInfo } from '../utils/modelInfo'

export function useModelViewer() {
  const { t } = useI18n()
  const isDragOver = ref(false)
  const showEmptyHint = ref(true)
  const hasAnimation = ref(false)
  const isAnimationPlaying = ref(false)
  const modelInfo = reactive(createEmptyModelInfo())
  const animationController = createAnimationController()
  const clock = new THREE.Clock()

  const viewer = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    currentModelRoot: null,
    animationId: null,
    canvasEl: null,
    panelEl: null,
    isReady: false
  }

  let resizeObserver = null

  function registerStageElements({ canvasEl, panelEl }) {
    viewer.canvasEl = canvasEl
    viewer.panelEl = panelEl

    if (!viewer.isReady) {
      setupScene()
      animate()
      observePanel()
      viewer.isReady = true
      return
    }

    resizeRenderer()
  }

  function resetInfo() {
    Object.assign(modelInfo, createEmptyModelInfo())
  }

  function removeCurrentModel() {
    animationController.clear()
    hasAnimation.value = false
    isAnimationPlaying.value = false

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

  function resizeRenderer() {
    if (!viewer.renderer || !viewer.camera || !viewer.panelEl) return

    const width = viewer.panelEl.clientWidth
    const height = viewer.panelEl.clientHeight

    if (width === 0 || height === 0) return

    viewer.renderer.setSize(width, height, false)
    viewer.camera.aspect = width / height
    viewer.camera.updateProjectionMatrix()
  }

  function setupScene() {
    if (!viewer.canvasEl) return

    viewer.scene = new THREE.Scene()
    viewer.scene.background = new THREE.Color(0x09111f)
    viewer.scene.fog = new THREE.Fog(0x09111f, 8, 45)

    viewer.camera = new THREE.PerspectiveCamera(60, 1, 0.01, 2000)
    viewer.camera.position.set(2.6, 1.9, 3.4)

    viewer.renderer = new THREE.WebGLRenderer({
      canvas: viewer.canvasEl,
      antialias: true
    })
    viewer.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    viewer.renderer.outputColorSpace = THREE.SRGBColorSpace
    viewer.renderer.toneMapping = THREE.ACESFilmicToneMapping
    viewer.renderer.toneMappingExposure = 1.05

    viewer.controls = new OrbitControls(viewer.camera, viewer.canvasEl)
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
    if (!viewer.controls || !viewer.renderer || !viewer.scene || !viewer.camera) return

    animationController.update(clock.getDelta())
    viewer.controls.update()
    viewer.renderer.render(viewer.scene, viewer.camera)
    viewer.animationId = window.requestAnimationFrame(animate)
  }

  async function handleFile(file) {
    if (!file) return

    try {
      const { animations, ext, root } = await loadModelRoot(file)
      if (!viewer.scene || !viewer.camera || !viewer.controls) {
        throw new Error(t('errors.viewerNotReady'))
      }

      applyDefaultMaterials(root)

      removeCurrentModel()
      viewer.currentModelRoot = root
      viewer.scene.add(viewer.currentModelRoot)

      normalizeAndFrameModel(viewer.currentModelRoot, viewer.camera, viewer.controls)

      hasAnimation.value = animationController.load(viewer.currentModelRoot, animations)
      isAnimationPlaying.value = hasAnimation.value ? animationController.play() : false
      clock.getDelta()

      const stats = collectModelStats(viewer.currentModelRoot)
      Object.assign(modelInfo, buildModelInfo(file, ext, stats))
      showEmptyHint.value = false
    } catch (error) {
      console.error(error)
      const message = error.message === 'unsupported_format'
        ? t('errors.unsupportedFormat', { format: file?.name?.split('.').pop()?.toUpperCase() || '-' })
        : error.message

      window.alert(t('errors.loadFailed', { message }))
    }
  }

  function resetCamera() {
    viewer.camera.position.set(2.6, 1.9, 3.4)
    viewer.controls.target.set(0, 0.8, 0)
    viewer.controls.minDistance = 0.2
    viewer.controls.maxDistance = 200
    viewer.controls.update()
  }

  function fitModel() {
    if (viewer.currentModelRoot) {
      normalizeAndFrameModel(viewer.currentModelRoot, viewer.camera, viewer.controls)
    }
  }

  function toggleAnimation() {
    if (!hasAnimation.value) return

    const nextPlaying = !isAnimationPlaying.value
    const changed = animationController.setPlaying(nextPlaying)
    if (changed) {
      isAnimationPlaying.value = nextPlaying
      clock.getDelta()
    }
  }

  function setDragOver(value) {
    isDragOver.value = value
  }

  function cleanup() {
    if (viewer.animationId) window.cancelAnimationFrame(viewer.animationId)
    resizeObserver?.disconnect()
    resizeObserver = null
    viewer.controls?.dispose()
    removeCurrentModel()
    viewer.renderer?.dispose()
    viewer.isReady = false
  }

  function observePanel() {
    resizeObserver?.disconnect()

    resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(resizeRenderer)
    })

    if (viewer.panelEl) {
      resizeObserver.observe(viewer.panelEl)
    }
  }

  onMounted(() => {
    resetInfo()
  })

  onBeforeUnmount(() => {
    cleanup()
  })

  return {
    isDragOver,
    hasAnimation,
    isAnimationPlaying,
    modelInfo,
    registerStageElements,
    setDragOver,
    handleFile,
    resetCamera,
    fitModel,
    toggleAnimation,
    showEmptyHint
  }
}
