import { readFileSync, readdirSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { defineConfig } from 'vite'

const projectRoot = process.cwd()
const publicAssetsRoot = resolve(projectRoot, 'public/assets')

const includePattern = /\{\{>\s*([\w/-]+)\s*\}\}/g
const pagesEachPattern = /\{\{#each pages\}\}[\s\S]*?\{\{\/each\}\}/

function extractPageTitle(html) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return match?.[1]?.trim() ?? ''
}

/**
 * index.html의 {{#each pages}} 블록을 루트 HTML 파일 목록으로 치환합니다.
 */
function pagesListPlugin() {
  const root = process.cwd()

  const buildPageRows = () =>
    readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.html') && entry.name !== 'index.html')
      .map((entry) => {
        const filePath = resolve(root, entry.name)
        const html = readFileSync(filePath, 'utf8')

        return {
          name: entry.name,
          title: extractPageTitle(html) || entry.name.replace(/\.html$/, ''),
          note: '',
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
      .map(
        (page) => `          <tr>
            <td><a href="./${page.name}" target="_blank">${page.name}</a></td>
            <td>${page.title}</td>
            <td>${page.note}</td>
          </tr>`,
      )
      .join('\n')

  return {
    name: 'pages-list',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        if (!ctx.filename.endsWith('index.html')) return html
        return html.replace(pagesEachPattern, buildPageRows())
      },
    },
  }
}

/**
 * public 아래의 HTML 조각을 빌드 시점에 합칩니다.
 *
 * - {{> login-panel}}         → public/partials/login-panel.html
 * - {{> components/pagination}} → public/components/pagination.html
 * - {{> pages/media/filters}}   → public/pages/media/filters.html
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

/**
 * Vite 빌드가 CSS <link> 순서를 바꿔 cascade가 깨지는 문제를 막습니다.
 * 원본 HTML의 ./src/styles/*.scss 순서를 빌드 결과 CSS 링크에 그대로 반영합니다.
 */
function preserveStylesheetOrderPlugin() {
  /** @type {Map<string, string[]>} */
  const scssOrderByHtml = new Map()

  const scssToKey = (href) => {
    const file = href.split('/').pop() || ''
    return file.replace(/\.scss$/i, '')
  }

  return {
    name: 'preserve-stylesheet-order',
    buildStart() {
      scssOrderByHtml.clear()
      const root = process.cwd()
      readdirSync(root, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
        .forEach((entry) => {
          const filePath = resolve(root, entry.name)
          const html = readFileSync(filePath, 'utf8')
          const order = [
            ...html.matchAll(/<link\b[^>]*href=["']([^"']*src\/styles\/[^"']+\.scss)["'][^>]*>/gi),
          ].map((match) => scssToKey(match[1]))
          if (order.length) {
            scssOrderByHtml.set(filePath, order)
          }
        })
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const order = scssOrderByHtml.get(resolve(ctx.filename)) || []
        if (!order.length) return html

        const linkRe = /<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi
        const links = html.match(linkRe) || []
        if (links.length < 2) return html

        const rank = (linkTag) => {
          const href = linkTag.match(/href=["']([^"']+)["']/i)?.[1] || ''
          const file = href.split('/').pop() || ''
          const index = order.findIndex((key) => file === `${key}.css` || file.startsWith(`${key}-`))
          return index === -1 ? Number.MAX_SAFE_INTEGER : index
        }

        const sorted = [...links].sort((a, b) => rank(a) - rank(b))
        let i = 0
        return html.replace(linkRe, () => sorted[i++])
      },
    },
  }
}

export default defineConfig({
  // dist/index.html을 file://로 직접 열어도 에셋 경로가 유지됩니다.
  base: './',
  appType: 'mpa',
  resolve: {
    alias: {
      '@assets': publicAssetsRoot,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [resolve(projectRoot, 'src/styles')],
      },
    },
  },
  plugins: [pagesListPlugin(), partialsPlugin(), preserveStylesheetOrderPlugin()],
  build: {
    assetsDir: 'assets',
    assetsInlineLimit: 0,
    rollupOptions: {
      input: getHtmlEntries(),
    },
  },
})
