<script setup>
import { onMounted, ref } from 'vue'

const emit = defineEmits(['file-drop', 'set-drag-over', 'stage-ready'])

defineProps({
  isDragOver: {
    type: Boolean,
    required: true
  },
  showEmptyHint: {
    type: Boolean,
    required: true
  }
})

const viewerPanelEl = ref(null)
const canvasEl = ref(null)

function setDragOver(value) {
  emit('set-drag-over', value)
}

function onDrop(event) {
  setDragOver(false)
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    emit('file-drop', file)
  }
}

onMounted(() => {
  emit('stage-ready', {
    canvasEl: canvasEl.value,
    panelEl: viewerPanelEl.value
  })
})
</script>

<template>
  <section
    ref="viewerPanelEl"
    class="viewer-panel"
    :class="{ 'drag-over': isDragOver }"
    @dragenter.prevent.stop="setDragOver(true)"
    @dragover.prevent.stop="setDragOver(true)"
    @dragleave.prevent.stop="setDragOver(false)"
    @drop.prevent.stop="onDrop"
  >
    <canvas ref="canvasEl" class="viewer-canvas"></canvas>

    <div v-if="showEmptyHint" class="empty-hint">
      <p>把 3D 模型文件拖到这里，或点击“导入模型”</p>
      <p class="hint-meta">支持 glTF / GLB / OBJ / FBX / STL</p>
      <p class="hint-meta">左键旋转 · 滚轮缩放 · 右键平移</p>
    </div>
  </section>
</template>

<style scoped>
.viewer-panel {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: var(--panel);
  box-shadow: var(--shadow);
  backdrop-filter: blur(16px);
  min-height: 0;
}

.viewer-panel.drag-over {
  border-color: rgba(141, 255, 207, 0.6);
  box-shadow:
    var(--shadow),
    inset 0 0 0 2px rgba(141, 255, 207, 0.45);
}

.viewer-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.empty-hint {
  position: absolute;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
  width: min(84%, 440px);
  padding: 18px 20px;
  border: 1px dashed rgba(143, 201, 255, 0.3);
  border-radius: 16px;
  background: rgba(7, 17, 29, 0.76);
  text-align: center;
}

.empty-hint p {
  margin: 0;
}

.hint-meta {
  margin-top: 8px !important;
  color: var(--muted);
  font-size: 13px;
}
</style>
