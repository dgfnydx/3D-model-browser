import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

function normalizeSiteUrl(siteUrl) {
  return (siteUrl || 'https://example.com').replace(/\/+$/, '')
}

function seoArtifactsPlugin() {
  let resolvedConfig

  return {
    name: 'seo-artifacts',
    configResolved(config) {
      resolvedConfig = config
    },
    generateBundle() {
      const siteUrl = normalizeSiteUrl(resolvedConfig.env.VITE_SITE_URL)
      const lastmod = new Date().toISOString()

      const robots = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`

      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: robots
      })

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: sitemap
      })
    }
  }
}

export default defineConfig({
  plugins: [vue(), seoArtifactsPlugin()]
})
