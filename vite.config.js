import { readFileSync, readdirSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { defineConfig } from 'vite'

const includePattern = /\{\{>\s*([\w/-]+)\s*\}\}/g

/**
 * public 아래의 HTML 조각을 빌드 시점에 합칩니다.
 *
 * - {{> login-panel}}         → public/partials/login-panel.html
 * - {{> components/contact}}  → public/components/contact.html
 * - {{> layouts/app-shell}}   → public/layouts/app-shell.html
 *
 * 조각 안에서 다른 조각을 다시 include할 수 있도록 재귀 처리합니다.
 */
function partialsPlugin() {
  const publicRoot = resolve(process.cwd(), 'public')

  const renderIncludes = (html, depth = 0) => {
    if (depth > 10) {
      throw new Error('HTML include 깊이가 10단계를 초과했습니다. 순환 include를 확인해 주세요.')
    }

    let hasInclude = false
    const rendered = html.replace(includePattern, (_, name) => {
      hasInclude = true

      // 경로를 생략하면 기존 방식대로 partials 폴더를 사용합니다.
      const relativePath = name.includes('/') ? `${name}.html` : `partials/${name}.html`
      const file = resolve(publicRoot, relativePath)

      // public 폴더 밖의 파일을 include하지 못하게 제한합니다.
      if (!file.startsWith(publicRoot)) {
        throw new Error(`허용되지 않은 include 경로입니다: ${name}`)
      }

      return readFileSync(file, 'utf8')
    })

    return hasInclude ? renderIncludes(rendered, depth + 1) : rendered
  }

  return {
    name: 'public-partials',
    transformIndexHtml(html, context) {
      // 중첩 페이지(pages/foo.html)에서도 public 에셋을 올바르게 찾습니다.
      const pageDirectory = dirname(context.filename)
      const relativeRoot = relative(pageDirectory, process.cwd()).replaceAll('\\', '/') || '.'
      const assetBase = `${relativeRoot}/`

      return renderIncludes(html).replaceAll('{{base}}', assetBase)
    },
  }
}

/**
 * 프로젝트 루트의 HTML을 자동으로 빌드 엔트리에 추가합니다.
 * 새 페이지를 만들 때 vite.config.js를 매번 수정할 필요가 없습니다.
 */
function getHtmlEntries() {
  const root = process.cwd()
  const entries = {}

  readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => entry.name)
    .forEach((file) => {
      const entryName = file.replace(/\.html$/, '')
      entries[entryName] = resolve(root, file)
    })

  return entries
}

export default defineConfig({
  // dist/index.html을 file://로 직접 열어도 에셋 경로가 유지됩니다.
  base: './',
  appType: 'mpa',
  plugins: [partialsPlugin()],
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      input: getHtmlEntries(),
    },
  },
})
