<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['file-selected', 'fit-model', 'reset-camera', 'toggle-animation'])

const props = defineProps({
  hasAnimation: {
    type: Boolean,
    default: false
  },
  isAnimationPlaying: {
    type: Boolean,
    default: false
  },
  modelInfo: {
    type: Object,
    required: true
  }
})

const infoCollapsed = ref(false)
const helpCollapsed = ref(false)

const statItems = computed(() => [
  { key: 'name', label: t('info.name') },
  { key: 'format', label: t('info.format') },
  { key: 'size', label: t('info.size') },
  { key: 'meshes', label: t('info.meshes') },
  { key: 'materials', label: t('info.materials') },
  { key: 'vertices', label: t('info.vertices') },
  { key: 'triangles', label: t('info.triangles') },
  { key: 'bounds', label: t('info.bounds') }
])

function onFileChange(event) {
  const file = event.target.files?.[0]
  if (file) {
    emit('file-selected', file)
  }
  event.target.value = ''
}
</script>

<template>
  <aside class="info-panel">
    <section class="tool-panel">
      <h2>{{ t('tools.title') }}</h2>

      <div class="tool-actions">
        <label class="tool-btn tool-btn-primary">
          {{ t('actions.importModel') }}
          <input
            accept=".glb,.gltf,.obj,.fbx,.stl"
            class="hidden-input"
            type="file"
            @change="onFileChange"
          />
        </label>
        <button
          class="tool-btn"
          :disabled="!props.hasAnimation"
          type="button"
          @click="emit('toggle-animation')"
        >
          {{ props.isAnimationPlaying ? t('actions.pauseAnimation') : t('actions.playAnimation') }}
        </button>
        <button class="tool-btn" type="button" @click="emit('reset-camera')">{{ t('actions.resetCamera') }}</button>
        <button class="tool-btn" type="button" @click="emit('fit-model')">{{ t('actions.fitModel') }}</button>
      </div>
    </section>

    <section class="section-card">
      <button
        class="section-toggle"
        :title="infoCollapsed ? t('common.expand') : t('common.collapse')"
        type="button"
        @click="infoCollapsed = !infoCollapsed"
      >
        <span>{{ t('info.title') }}</span>
        <span class="toggle-icon" :class="{ collapsed: infoCollapsed }" aria-hidden="true">
          <svg viewBox="0 0 16 16" fill="none">
            <path
              d="M3.5 6 8 10.5 12.5 6"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.8"
            />
          </svg>
        </span>
      </button>

      <dl v-if="!infoCollapsed" class="stats">
        <div v-for="item in statItems" :key="item.key">
          <dt>{{ item.label }}</dt>
          <dd>{{ props.modelInfo[item.key] }}</dd>
        </div>
      </dl>
    </section>

    <section class="section-card">
      <button
        class="section-toggle"
        :title="helpCollapsed ? t('common.expand') : t('common.collapse')"
        type="button"
        @click="helpCollapsed = !helpCollapsed"
      >
        <span>{{ t('help.title') }}</span>
        <span class="toggle-icon" :class="{ collapsed: helpCollapsed }" aria-hidden="true">
          <svg viewBox="0 0 16 16" fill="none">
            <path
              d="M3.5 6 8 10.5 12.5 6"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.8"
            />
          </svg>
        </span>
      </button>

      <section v-if="!helpCollapsed" class="help">
        <ul>
          <li>{{ t('help.rotate') }}</li>
          <li>{{ t('help.zoom') }}</li>
          <li>{{ t('help.pan') }}</li>
        </ul>
      </section>
    </section>
  </aside>
</template>

<style scoped>
.info-panel {
  padding: 14px;
  overflow: auto;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: var(--panel);
  box-shadow: var(--shadow);
  backdrop-filter: blur(16px);
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tool-panel,
.section-card {
  padding: 12px;
  border-radius: 16px;
  background: var(--panel-strong);
}

.tool-panel h2 {
  margin: 0 0 10px;
}

.tool-actions {
  display: grid;
  gap: 8px;
}

.tool-btn {
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid var(--line-strong);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--text);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.tool-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(143, 201, 255, 0.52);
  background: rgba(255, 255, 255, 0.08);
}

.tool-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
  transform: none;
}

.tool-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  color: #052132;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  font-weight: 700;
}

.hidden-input {
  display: none;
}

.section-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  font-size: 15px;
  text-align: left;
}

.toggle-icon {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--muted);
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    color 0.18s ease;
}

.section-toggle:hover .toggle-icon {
  background: rgba(103, 213, 255, 0.12);
  color: var(--text);
}

.toggle-icon.collapsed {
  transform: rotate(-90deg);
}

.toggle-icon svg {
  width: 14px;
  height: 14px;
}

.stats {
  margin: 12px 0 0;
  display: grid;
  gap: 8px;
}

.stats div {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 12px;
  border: 1px solid rgba(143, 201, 255, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
}

.stats dt {
  color: var(--muted);
}

.stats dd {
  margin: 0;
  text-align: right;
  word-break: break-word;
}

.help {
  margin-top: 12px;
}

.help ul {
  margin: 0;
  padding-left: 18px;
  color: var(--muted);
  line-height: 1.8;
}

@media (max-width: 980px) {
  .info-panel {
    max-height: 32vh;
  }
}
</style>
