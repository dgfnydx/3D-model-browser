<script setup>
const props = defineProps({
  modelInfo: {
    type: Object,
    required: true
  }
})

const statItems = [
  { key: 'name', label: '名称' },
  { key: 'format', label: '格式' },
  { key: 'size', label: '文件大小' },
  { key: 'meshes', label: '网格数量' },
  { key: 'materials', label: '材质数量' },
  { key: 'vertices', label: '顶点数量' },
  { key: 'triangles', label: '三角面数量' },
  { key: 'bounds', label: '包围盒尺寸' }
]
</script>

<template>
  <aside class="info-panel">
    <h2>模型信息</h2>

    <dl class="stats">
      <div v-for="item in statItems" :key="item.key">
        <dt>{{ item.label }}</dt>
        <dd>{{ props.modelInfo[item.key] }}</dd>
      </div>
    </dl>

    <section class="help">
      <h3>操作说明</h3>
      <ul>
        <li>左键拖动：旋转模型</li>
        <li>滚轮：缩放模型</li>
        <li>右键拖动：平移视角</li>
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
