<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppHeader from './components/AppHeader.vue'
import ModelInfoPanel from './components/ModelInfoPanel.vue'
import ModelViewerStage from './components/ModelViewerStage.vue'
import { useModelViewer } from './composables/useModelViewer'
import { setLocale } from './i18n'

const { locale, t } = useI18n()

const title = computed(() => t('app.title'))
const subtitle = computed(() => t('app.subtitle'))

const {
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
} = useModelViewer()

function handleLocaleChange(nextLocale) {
  setLocale(nextLocale)
}
</script>

<template>
  <div class="app-shell">
    <AppHeader
      :current-locale="locale"
      :subtitle="subtitle"
      :title="title"
      @locale-change="handleLocaleChange"
    />

    <main class="workspace">
      <ModelViewerStage
        :is-drag-over="isDragOver"
        :show-empty-hint="showEmptyHint"
        @file-drop="handleFile"
        @stage-ready="registerStageElements"
        @set-drag-over="setDragOver"
      />

      <ModelInfoPanel
        :has-animation="hasAnimation"
        :is-animation-playing="isAnimationPlaying"
        :model-info="modelInfo"
        @file-selected="handleFile"
        @fit-model="fitModel"
        @reset-camera="resetCamera"
        @toggle-animation="toggleAnimation"
      />
    </main>
  </div>
</template>
