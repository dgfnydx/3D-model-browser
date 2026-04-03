<script setup>
import AppHeader from './components/AppHeader.vue'
import ModelInfoPanel from './components/ModelInfoPanel.vue'
import ModelViewerStage from './components/ModelViewerStage.vue'
import { useModelViewer } from './composables/useModelViewer'

const {
  isDragOver,
  modelInfo,
  registerStageElements,
  setDragOver,
  handleFile,
  resetCamera,
  fitModel,
  showEmptyHint
} = useModelViewer()
</script>

<template>
  <div class="app-shell">
    <AppHeader
      title="3D 模型查看器"
      subtitle="导入后即可旋转、缩放、平移，并查看模型统计信息。"
      @file-selected="handleFile"
      @fit-model="fitModel"
      @reset-camera="resetCamera"
    />

    <main class="workspace">
      <ModelViewerStage
        :is-drag-over="isDragOver"
        :show-empty-hint="showEmptyHint"
        @file-drop="handleFile"
        @stage-ready="registerStageElements"
        @set-drag-over="setDragOver"
      />

      <ModelInfoPanel :model-info="modelInfo" />
    </main>
  </div>
</template>
