import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import * as THREE from 'three'
import { useI18n } from 'vue-i18n'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { createAnimationController } from '../utils/modelAnimation'
import { applyDisplayMode, DISPLAY_MODES } from '../utils/modelDisplay'
import { normalizeAndFrameModel } from '../utils/modelTransform'
import { applyDefaultMaterials, loadModelRoot } from '../utils/modelLoader'
import { buildModelInfo, collectModelStats, createEmptyModelInfo } from '../utils/modelInfo'

export function useModelViewer() {
  const { t } = useI18n()
  const isDragOver = ref(false)
  const showEmptyHint = ref(true)
  const hasAnimation = ref(false)
  const isAnimationPlaying = ref(false)
  const animationClips = ref([])
  const activeAnimationIndex = ref(-1)
  const animationCurrentTime = ref(0)
  const animationDuration = ref(0)
  const displayMode = ref(DISPLAY_MODES.solid)
  const modelInfo = reactive(createEmptyModelInfo())
  const animationController = createAnimationController()
  const clock = new THREE.Clock()

  const viewer = {
    axesCamera: null,
    axesScene: null,
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    currentModelRoot: null,
    animationId: null,
    canvasEl: null,
    panelEl: null,
    initialViewState: null,
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

  function syncDisplayMode() {
    if (!viewer.currentModelRoot) return
    applyDisplayMode(viewer.currentModelRoot, displayMode.value)
  }

  function saveCurrentViewState() {
    if (!viewer.camera || !viewer.controls) return

    viewer.initialViewState = {
      far: viewer.camera.far,
      maxDistance: viewer.controls.maxDistance,
      minDistance: viewer.controls.minDistance,
      near: viewer.camera.near,
      position: viewer.camera.position.clone(),
      target: viewer.controls.target.clone()
    }
  }

  function applyViewState(viewState) {
    if (!viewState || !viewer.camera || !viewer.controls) return

    viewer.camera.near = viewState.near
    viewer.camera.far = viewState.far
    viewer.camera.position.copy(viewState.position)
    viewer.camera.updateProjectionMatrix()

    viewer.controls.target.copy(viewState.target)
    viewer.controls.minDistance = viewState.minDistance
    viewer.controls.maxDistance = viewState.maxDistance
    viewer.controls.update()
  }

  function removeCurrentModel() {
    animationController.clear()
    hasAnimation.value = false
    isAnimationPlaying.value = false
    animationClips.value = []
    activeAnimationIndex.value = -1
    animationCurrentTime.value = 0
    animationDuration.value = 0
    viewer.initialViewState = null

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
    viewer.renderer.setViewport(0, 0, width, height)
    viewer.renderer.setScissorTest(false)
  }

  function createAxesGizmo() {
    const gizmoGroup = new THREE.Group()

    const center = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0xe9f4ff,
        emissive: 0x17324f,
        metalness: 0.15,
        roughness: 0.25
      })
    )
    gizmoGroup.add(center)

    const plate = new THREE.Mesh(
      new THREE.CircleGeometry(1.2, 48),
      new THREE.MeshBasicMaterial({
        color: 0x08131f,
        opacity: 0.72,
        transparent: true
      })
    )
    plate.position.z = -0.02
    gizmoGroup.add(plate)

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.82, 0.92, 48),
      new THREE.MeshBasicMaterial({
        color: 0x17324a,
        opacity: 0.9,
        transparent: true
      })
    )
    ring.position.z = -0.015
    gizmoGroup.add(ring)

    const axisConfigs = [
      { color: 0xff6b6b, direction: new THREE.Vector3(1, 0, 0) },
      { color: 0x59d98e, direction: new THREE.Vector3(0, 1, 0) },
      { color: 0x58b8ff, direction: new THREE.Vector3(0, 0, 1) }
    ]

    axisConfigs.forEach(({ color, direction }) => {
      const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.16,
        metalness: 0.2,
        roughness: 0.35
      })

      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.58, 16), material)
      shaft.position.copy(direction.clone().multiplyScalar(0.34))

      if (direction.x !== 0) {
        shaft.rotation.z = Math.PI / 2
      } else if (direction.z !== 0) {
        shaft.rotation.x = Math.PI / 2
      }

      const head = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.2, 20), material)
      head.position.copy(direction.clone().multiplyScalar(0.72))

      if (direction.x > 0) {
        head.rotation.z = -Math.PI / 2
      } else if (direction.z > 0) {
        head.rotation.x = Math.PI / 2
      }

      const tip = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: color,
          emissiveIntensity: 0.35,
          metalness: 0.1,
          roughness: 0.2
        })
      )
      tip.position.copy(direction.clone().multiplyScalar(0.86))

      gizmoGroup.add(shaft, head, tip)
    })

    return gizmoGroup
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

    viewer.axesScene = new THREE.Scene()
    viewer.axesCamera = new THREE.PerspectiveCamera(42, 1, 0.1, 10)
    viewer.axesScene.add(createAxesGizmo())

    const gizmoAmbient = new THREE.AmbientLight(0xffffff, 1.45)
    const gizmoKey = new THREE.DirectionalLight(0xffffff, 1.8)
    gizmoKey.position.set(2, 2, 3)
    const gizmoFill = new THREE.DirectionalLight(0x7fc7ff, 0.8)
    gizmoFill.position.set(-2, 1, 2)
    viewer.axesScene.add(gizmoAmbient, gizmoKey, gizmoFill)

    resizeRenderer()
  }

  function renderAxesGizmo() {
    if (!viewer.renderer || !viewer.camera || !viewer.axesCamera || !viewer.axesScene || !viewer.panelEl) return

    const rect = viewer.panelEl.getBoundingClientRect()
    const size = Math.max(84, Math.min(112, Math.floor(Math.min(rect.width, rect.height) * 0.18)))
    const margin = 14

    const direction = new THREE.Vector3()
    viewer.camera.getWorldDirection(direction)

    viewer.axesCamera.position.copy(direction.clone().multiplyScalar(-2.7))
    viewer.axesCamera.up.copy(viewer.camera.up)
    viewer.axesCamera.lookAt(0, 0, 0)
    viewer.axesCamera.updateProjectionMatrix()

    viewer.renderer.clearDepth()
    viewer.renderer.setScissorTest(true)
    viewer.renderer.setViewport(margin, margin, size, size)
    viewer.renderer.setScissor(margin, margin, size, size)
    viewer.renderer.render(viewer.axesScene, viewer.axesCamera)
    viewer.renderer.setScissorTest(false)
    viewer.renderer.setViewport(0, 0, rect.width, rect.height)
  }

  function animate() {
    if (!viewer.controls || !viewer.renderer || !viewer.scene || !viewer.camera) return

    animationController.update(clock.getDelta())
    animationCurrentTime.value = animationController.getCurrentTime()
    animationDuration.value = animationController.getDuration()
    viewer.controls.update()
    viewer.renderer.render(viewer.scene, viewer.camera)
    renderAxesGizmo()
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
      syncDisplayMode()

      normalizeAndFrameModel(viewer.currentModelRoot, viewer.camera, viewer.controls)
      saveCurrentViewState()

      animationClips.value = animations.map((clip, index) => ({
        index,
        name: clip.name?.trim() || `${t('animation.clip')} ${index + 1}`
      }))
      hasAnimation.value = animationController.load(viewer.currentModelRoot, animations)
      activeAnimationIndex.value = hasAnimation.value ? animationController.getActiveIndex() : -1
      isAnimationPlaying.value = false
      animationCurrentTime.value = animationController.getCurrentTime()
      animationDuration.value = animationController.getDuration()
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
    if (viewer.initialViewState) {
      applyViewState(viewer.initialViewState)
      return
    }

    viewer.camera.position.set(2.6, 1.9, 3.4)
    viewer.controls.target.set(0, 0.8, 0)
    viewer.controls.minDistance = 0.2
    viewer.controls.maxDistance = 200
    viewer.controls.update()
  }

  function fitModel() {
    if (viewer.currentModelRoot) {
      normalizeAndFrameModel(viewer.currentModelRoot, viewer.camera, viewer.controls)
      saveCurrentViewState()
    }
  }

  function setAnimationPlaying(checked) {
    if (!hasAnimation.value) return

    const changed = animationController.setPlaying(checked)
    if (changed) {
      isAnimationPlaying.value = checked
      clock.getDelta()
    }
  }

  function selectAnimationClip(index) {
    if (!hasAnimation.value) return

    const changed = animationController.setActiveClip(index)
    if (!changed) return

    activeAnimationIndex.value = index
    animationCurrentTime.value = animationController.getCurrentTime()
    animationDuration.value = animationController.getDuration()
    if (isAnimationPlaying.value) {
      clock.getDelta()
    }
  }

  function seekAnimation(time) {
    if (!hasAnimation.value) return

    const changed = animationController.setTime(time)
    if (!changed) return

    animationCurrentTime.value = animationController.getCurrentTime()
    animationDuration.value = animationController.getDuration()
  }

  function setDragOver(value) {
    isDragOver.value = value
  }

  function setDisplayMode(mode) {
    if (!Object.values(DISPLAY_MODES).includes(mode)) return

    displayMode.value = mode
    syncDisplayMode()
  }

  function cleanup() {
    if (viewer.animationId) window.cancelAnimationFrame(viewer.animationId)
    resizeObserver?.disconnect()
    resizeObserver = null
    viewer.controls?.dispose()
    removeCurrentModel()
    viewer.renderer?.dispose()
    viewer.axesCamera = null
    viewer.axesScene = null
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
    animationClips,
    activeAnimationIndex,
    animationCurrentTime,
    animationDuration,
    displayMode,
    modelInfo,
    registerStageElements,
    setDragOver,
    handleFile,
    resetCamera,
    fitModel,
    setAnimationPlaying,
    selectAnimationClip,
    seekAnimation,
    setDisplayMode,
    showEmptyHint
  }
}
