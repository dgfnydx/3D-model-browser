# 3D 模型查看器

一个基于 `Vue 3 + Vite + Three.js` 的 3D 模型查看器，采用单文件组件和 `<script setup>` 语法实现。

## 已实现功能

- 支持格式：`glTF(.gltf/.glb)`、`OBJ`、`FBX`、`STL`
- 导入方式：点击导入 + 拖拽导入
- 交互查看：
  - 鼠标左键旋转
  - 滚轮缩放
  - 右键平移
- 视图工具：重置视角、模型居中
- 模型信息面板：
  - 名称、格式、文件大小
  - 网格数量、材质数量
  - 顶点数量、三角面数量
  - 包围盒尺寸（宽 × 高 × 深）

## 技术栈

- `Vue 3`
- `Vite`
- `Three.js`

## 运行方式

先安装依赖，再启动开发服务器。

```bash
cd /Users/dgf/Documents/code/test/model-browser
npm install
npm run dev
```

## SEO 与收录

- 项目已内置基础 SEO 能力：
  - `title`、`description`、`keywords`
  - `canonical`
  - `Open Graph` / `Twitter Card`
  - `SoftwareApplication` 结构化数据
  - 构建时自动生成 `robots.txt` 和 `sitemap.xml`
- 部署前请根据正式域名配置 `.env`：

```bash
cp .env.example .env
```

- 重点配置项：
  - `VITE_SITE_URL`：线上正式地址，比如 `https://your-domain.com`
  - `VITE_SITE_NAME`：站点名称
  - `VITE_SEO_TITLE`：SEO 标题
  - `VITE_SEO_DESCRIPTION`：SEO 描述
  - `VITE_SEO_KEYWORDS`：SEO 关键词
- 上线后建议尽快完成这两步：
  - 在 Google Search Console / Bing Webmaster Tools 提交 `sitemap.xml`
  - 确保正式站点允许搜索引擎抓取，并对首页做外链或站内入口曝光

## 文件结构

- `index.html`：Vite 入口 HTML
- `src/main.js`：Vue 应用入口
- `src/App.vue`：页面装配层，只负责组合组件
- `src/components/`：界面组件，如头部、查看区域、信息面板
- `src/composables/useModelViewer.js`：Three.js 查看器能力层
- `src/utils/`：模型加载、统计、变换等可复用工具
- `src/style.css`：全局布局与主题变量
- `vite.config.js`：Vite 配置

## 架构说明

- `components` 只负责展示和交互分发，不承载 Three.js 业务细节
- `composables` 负责场景初始化、渲染循环、模型导入和相机控制
- `utils` 负责纯函数逻辑，便于复用与单独测试

## 说明

- `gltf` 若依赖外部贴图或二进制文件，需要与对应资源保持相对路径关系后再加载。
- 单文件模型建议优先使用 `glb`，兼容性更好。
