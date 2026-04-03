<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelInfo: {
    type: Object,
    required: true
  }
})

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
</script>

<template>
  <aside class="info-panel">
    <h2>{{ t('info.title') }}</h2>

    <dl class="stats">
      <div v-for="item in statItems" :key="item.key">
        <dt>{{ item.label }}</dt>
        <dd>{{ props.modelInfo[item.key] }}</dd>
      </div>
    </dl>

    <section class="help">
      <h3>{{ t('help.title') }}</h3>
      <ul>
        <li>{{ t('help.rotate') }}</li>
        <li>{{ t('help.zoom') }}</li>
        <li>{{ t('help.pan') }}</li>
      </ul>
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
}

.info-panel h2,
.help h3 {
  margin: 0 0 10px;
}

.stats {
  margin: 0;
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
  margin-top: 14px;
  padding: 12px;
  border-radius: 16px;
  background: var(--panel-strong);
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
