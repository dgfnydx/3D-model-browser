<script setup>
const emit = defineEmits(['file-selected', 'fit-model', 'reset-camera'])

defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  }
})

function onFileChange(event) {
  const file = event.target.files?.[0]
  if (file) {
    emit('file-selected', file)
  }
  event.target.value = ''
}
</script>

<template>
  <header class="topbar">
    <div class="brand">
      <h1>{{ title }}</h1>
      <p class="subtitle">{{ subtitle }}</p>
    </div>

    <div class="actions">
      <label class="btn primary">
        导入模型
        <input
          accept=".glb,.gltf,.obj,.fbx,.stl"
          class="hidden-input"
          type="file"
          @change="onFileChange"
        />
      </label>
      <button class="btn" type="button" @click="emit('reset-camera')">重置视角</button>
      <button class="btn" type="button" @click="emit('fit-model')">模型居中</button>
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

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  flex: 0 0 auto;
}

.btn {
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--text);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.btn:hover {
  transform: translateY(-1px);
  border-color: rgba(143, 201, 255, 0.52);
  background: rgba(255, 255, 255, 0.08);
}

.btn.primary {
  display: inline-flex;
  align-items: center;
  border: none;
  color: #052132;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  font-weight: 700;
}

.hidden-input {
  display: none;
}

@media (max-width: 980px) {
  .topbar {
    flex-direction: column;
    align-items: flex-start;
    padding: 10px 12px;
  }

  .actions {
    justify-content: flex-start;
  }
}
</style>
