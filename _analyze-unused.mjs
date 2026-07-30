import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join, relative, extname, basename } from 'node:path'

const root = process.cwd()
const assetExt = new Set(['.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp4', '.woff', '.woff2', '.ttf', '.eot'])
const codeExt = new Set(['.html', '.js', '.scss', '.css', '.json', '.md'])

function walk(dir, filter) {
  const out = []
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === '.git') continue
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) out.push(...walk(p, filter))
    else if (!filter || filter(p, name)) out.push(p)
  }
  return out
}

const assets = [
  ...walk(join(root, 'public/assets'), (p) => assetExt.has(extname(p).toLowerCase())),
  ...walk(join(root, 'src/assets'), (p) => assetExt.has(extname(p).toLowerCase())),
]

const codeFiles = walk(root, (p) => codeExt.has(extname(p).toLowerCase()) && !basename(p).startsWith('_analyze'))
const corpus = codeFiles
  .map((f) => {
    try {
      return readFileSync(f, 'utf8')
    } catch {
      return ''
    }
  })
  .join('\n')

const unused = []
const used = []
for (const a of assets) {
  const rel = relative(root, a).replaceAll('\\', '/')
  const base = basename(a)
  const patterns = [base, rel.replace(/^public\//, ''), rel.replace(/^src\//, '')]
  const hit = patterns.some((pat) => corpus.includes(pat))
  if (hit) used.push(rel)
  else unused.push(rel)
}

console.log('ASSETS total:', assets.length)
console.log('USED:', used.length)
console.log('UNUSED:')
unused.forEach((u) => console.log(' ', u))

// Partials: check {{> name}} references
const publicHtml = walk(join(root, 'public'), (p) => extname(p) === '.html')
const unusedPartials = []
for (const f of publicHtml) {
  const rel = relative(join(root, 'public'), f).replaceAll('\\', '/').replace(/\.html$/, '')
  const candidates = [rel]
  if (rel.startsWith('partials/')) candidates.push(rel.slice('partials/'.length))
  const hit = candidates.some((c) => {
    const needle = `{{> ${c}}}`
    const needleSpaced = `{{> ${c} }}`
    return corpus.includes(needle) || corpus.includes(needleSpaced) || corpus.includes(`{{> ${c}`)
  })
  if (!hit) unusedPartials.push(relative(root, f).replaceAll('\\', '/'))
}
console.log('\nPOTENTIALLY UNUSED HTML PARTIALS:')
unusedPartials.forEach((u) => console.log(' ', u))

// Check SCSS variables in asset-urls that are never used
const assetUrlsPath = join(root, 'src/styles/settings/_asset-urls.scss')
const assetUrls = readFileSync(assetUrlsPath, 'utf8')
const varNames = [...assetUrls.matchAll(/\$([a-z0-9-]+):/g)].map((m) => m[1])
const scssCorpus = walk(join(root, 'src/styles'), (p) => extname(p) === '.scss' && !p.endsWith('_asset-urls.scss'))
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n')
const unusedVars = varNames.filter((v) => !scssCorpus.includes(`asset.$${v}`) && !scssCorpus.includes(`$${v}`))
console.log('\nUNUSED ASSET-URL VARS:')
unusedVars.forEach((v) => console.log(' ', v))

// Duplicate basenames across src/assets and public/assets
const byBase = new Map()
for (const a of assets) {
  const b = basename(a)
  const list = byBase.get(b) || []
  list.push(relative(root, a).replaceAll('\\', '/'))
  byBase.set(b, list)
}
console.log('\nDUPLICATE BASENAMES:')
for (const [b, list] of byBase) {
  if (list.length > 1) console.log(' ', b, '->', list.join(' | '))
}

// Check login-bg.mp4 and other media
const media = walk(join(root, 'public'), (p) => ['.mp4', '.webm'].includes(extname(p).toLowerCase()))
console.log('\nMEDIA FILES:')
media.forEach((m) => {
  const rel = relative(root, m).replaceAll('\\', '/')
  const base = basename(m)
  console.log(' ', rel, corpus.includes(base) ? 'USED' : 'UNUSED')
})
