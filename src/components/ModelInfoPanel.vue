<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['file-selected', 'fit-model', 'reset-camera', 'select-animation-clip', 'set-animation-playing'])

const props = defineProps({
  activeAnimationIndex: {
    type: Number,
    default: -1
  },
  animationClips: {
    type: Array,
    default: () => []
  },
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

const animationCollapsed = ref(false)
const infoCollapsed = ref(false)
const helpCollapsed = ref(false)

const statItems = computed(() => [
  { key: 'name', label: t('info.name') },
  { key: 'format', label: t('info.format') },
  { key: 'size', label: t('info.size') },
  { key: 'skinnedMeshes', label: t('info.skinnedMeshes') },
  { key: 'bones', label: t('info.bones') },
  { key: 'meshes', label: t('info.meshes') },
  { key: 'materials', label: t('info.materials') },
  { key: 'materialTypes', label: t('info.materialTypes') },
  { key: 'textures', label: t('info.textures') },
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
      <h2>{{ t('actionsPanel.title') }}</h2>

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
        <button class="tool-btn" type="button" @click="emit('reset-camera')">{{ t('actions.resetCamera') }}</button>
        <button class="tool-btn" type="button" @click="emit('fit-model')">{{ t('actions.fitModel') }}</button>
      </div>
    </section>

    <section class="section-card">
      <button
        class="section-toggle"
        :title="animationCollapsed ? t('common.expand') : t('common.collapse')"
        type="button"
        @click="animationCollapsed = !animationCollapsed"
      >
        <span>{{ t('animation.title') }}</span>
        <span class="toggle-icon" :class="{ collapsed: animationCollapsed }" aria-hidden="true">
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

      <div v-if="!animationCollapsed" class="animation-panel">
        <label class="play-checkbox" :class="{ disabled: !props.hasAnimation }">
          <input
            :checked="props.isAnimationPlaying"
            :disabled="!props.hasAnimation || props.activeAnimationIndex === -1"
            type="checkbox"
            @change="emit('set-animation-playing', $event.target.checked)"
          />
          <span>{{ t('animation.playSelected') }}</span>
        </label>

        <div v-if="props.animationClips.length" class="clip-list" role="radiogroup">
          <label v-for="clip in props.animationClips" :key="clip.index" class="clip-item">
            <input
              :checked="props.activeAnimationIndex === clip.index"
              name="animation-clip"
              type="radio"
              @change="emit('select-animation-clip', clip.index)"
            />
            <span>{{ clip.name }}</span>
          </label>
        </div>

        <p v-else class="empty-text">{{ t('animation.noAnimations') }}</p>
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
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(18, 30, 47, 0.96), rgba(10, 18, 32, 0.92)),
    var(--panel);
  box-shadow: var(--shadow);
  backdrop-filter: blur(16px);
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tool-panel,
.section-card {
  padding: 14px;
  border: 1px solid rgba(143, 201, 255, 0.08);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(26, 40, 60, 0.9), rgba(15, 27, 44, 0.96)),
    var(--panel-strong);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 10px 24px rgba(0, 0, 0, 0.14);
}

.tool-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.tool-btn {
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid var(--line-strong);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
  color: var(--text);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
}

.tool-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(143, 201, 255, 0.52);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.16);
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
  grid-column: 1 / -1;
}

.hidden-input {
  display: none;
}

.animation-panel {
  margin-top: 12px;
  display: grid;
  gap: 10px;
}

.play-checkbox,
.clip-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text);
}

.play-checkbox.disabled {
  opacity: 0.5;
}

.play-checkbox {
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid rgba(143, 201, 255, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
}

.play-checkbox input,
.clip-item input {
  accent-color: var(--accent);
}

.clip-list {
  display: grid;
  gap: 8px;
}

.clip-item {
  padding: 10px 12px;
  border: 1px solid rgba(143, 201, 255, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease;
}

.clip-item:has(input:checked) {
  border-color: rgba(103, 213, 255, 0.5);
  background: linear-gradient(180deg, rgba(103, 213, 255, 0.12), rgba(103, 213, 255, 0.06));
  transform: translateY(-1px);
}

.empty-text {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
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
  font-weight: 600;
  text-align: left;
}

.tool-panel h2,
.section-toggle > span:first-child {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.01em;
  line-height: 1.2;
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
  display: grid;
  grid-template-columns: minmax(0, 92px) minmax(0, 1fr);
  gap: 14px;
  padding: 10px 12px;
  border: 1px solid rgba(143, 201, 255, 0.08);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02));
}

.stats dt {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.5;
}

.stats dd {
  margin: 0;
  text-align: right;
  word-break: break-word;
  font-size: 13px;
  line-height: 1.5;
}

.help {
  margin-top: 12px;
  padding: 2px 2px 0;
}

.help ul {
  margin: 0;
  padding-left: 18px;
  color: var(--muted);
  line-height: 1.8;
}

@media (max-width: 980px) {
  .tool-actions {
    grid-template-columns: 1fr;
  }

  .tool-btn-primary {
    grid-column: auto;
  }
}

@media (max-width: 980px) {
  .info-panel {
    max-height: 32vh;
  }
}
</style>
