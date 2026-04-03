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
  modelInfo,
  registerStageElements,
  setDragOver,
  handleFile,
  resetCamera,
  fitModel,
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
      @file-selected="handleFile"
      @fit-model="fitModel"
      @locale-change="handleLocaleChange"
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
