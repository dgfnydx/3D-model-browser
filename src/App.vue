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
  setDisplayMode,
  setAnimationPlaying,
  selectAnimationClip,
  seekAnimation,
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
        :active-animation-index="activeAnimationIndex"
        :animation-clips="animationClips"
        :animation-current-time="animationCurrentTime"
        :animation-duration="animationDuration"
        :display-mode="displayMode"
        :has-animation="hasAnimation"
        :is-animation-playing="isAnimationPlaying"
        :model-info="modelInfo"
        @file-selected="handleFile"
        @fit-model="fitModel"
        @reset-camera="resetCamera"
        @set-display-mode="setDisplayMode"
        @select-animation-clip="selectAnimationClip"
        @seek-animation="seekAnimation"
        @set-animation-playing="setAnimationPlaying"
      />
    </main>
  </div>
</template>
