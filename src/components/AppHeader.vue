<script setup>
import { useI18n } from 'vue-i18n'

const emit = defineEmits(['locale-change'])
const { t } = useI18n()

const props = defineProps({
  currentLocale: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  }
})

const localeOptions = [
  { value: 'zh-CN', labelKey: 'language.zhCN' },
  { value: 'en-US', labelKey: 'language.enUS' }
]

</script>

<template>
  <header class="topbar">
    <div class="brand">
      <h1>{{ title }}</h1>
      <p class="subtitle">{{ subtitle }}</p>
    </div>

    <div class="locale-wrap">
      <div class="locale-switch">
        <button
          v-for="item in localeOptions"
          :key="item.value"
          class="locale-btn"
          :class="{ active: currentLocale === item.value }"
          type="button"
          @click="emit('locale-change', item.value)"
        >
          {{ t(item.labelKey) }}
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 14px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(17, 31, 50, 0.92), rgba(9, 18, 32, 0.9));
  box-shadow: var(--shadow);
  backdrop-filter: blur(18px);
  flex: 0 0 auto;
}

.brand h1 {
  margin: 0;
  font-size: clamp(20px, 2.4vw, 28px);
  line-height: 1.08;
}

.subtitle {
  margin: 4px 0 0;
  max-width: 720px;
  color: var(--muted);
  font-size: 12px;
}

.locale-wrap {
  display: flex;
  justify-content: flex-end;
  flex: 0 0 auto;
}

.locale-switch {
  display: inline-flex;
  padding: 3px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
}

.locale-btn {
  min-height: 32px;
  padding: 0 12px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
}

.locale-btn.active {
  background: rgba(103, 213, 255, 0.18);
  color: var(--text);
}

@media (max-width: 980px) {
  .topbar {
    flex-direction: column;
    align-items: flex-start;
    padding: 10px 12px;
  }

  .locale-wrap {
    justify-content: flex-start;
  }
}
</style>
