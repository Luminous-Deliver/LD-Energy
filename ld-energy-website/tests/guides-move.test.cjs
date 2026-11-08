// /blog moved to /guides on 04/11/2026 with four merges and the category pages folded into the hub (plan
// PLAN-AREAS-GUIDES-2026-10-22 §12). These checks keep it that way: every old URL is one permanent hop to a page
// that exists, nothing links to /blog again, and every guide's search title and description fit.
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { getAllPosts, postMeta, TITLE_MAX, DESCRIPTION_MAX } = require('../lib/blog.ts')
const { guideGroups } = require('../lib/guides.ts')

const ROOT = path.join(__dirname, '..')
const slugs = new Set(fs.readdirSync(path.join(ROOT, 'content', 'blog')).filter((f) => f.endsWith('.mdx')).map((f) => f.slice(0, -4)))
const groupIds = new Set(guideGroups.map((g) => g.id))
// public/guides holds the guide illustrations (assessor-room-720.webp ...), which share the /guides/ prefix
const assets = new Set(fs.readdirSync(path.join(ROOT, 'public', 'guides')).map((f) => f.replace(/\.[a-z0-9]+$/, '')))

/** Where a /guides destination lands: a post, the hub, or a hub group anchor. */
function landsOnPage(dest) {
  if (dest === '/guides') return true
  const anchor = dest.match(/^\/guides#(.+)$/)
  if (anchor) return groupIds.has(anchor[1])
  const post = dest.match(/^\/guides\/([a-z0-9-]+)$/)
  return Boolean(post && slugs.has(post[1]))
}

test('every old /blog URL is one permanent redirect to a page that exists', async () => {
  const rules = (await require('../next.config.js').redirects()).filter((r) => r.source.startsWith('/blog') || r.source.startsWith('/guides'))
  const sources = new Set(rules.map((r) => r.source))
  for (const r of rules) {
    assert.equal(r.permanent, true, `${r.source} is permanent`)
    if (r.destination.includes(':slug')) continue
    assert.ok(!sources.has(r.destination.split('#')[0]), `${r.source} -> ${r.destination} chains through another redirect`)
    assert.ok(landsOnPage(r.destination), `${r.source} -> ${r.destination} lands on a real page`)
  }
  // Next uses the first rule that matches, so the catch-all must come after every specific /blog rule.
  const catchAll = rules.findIndex((r) => r.source === '/blog/:slug')
  assert.ok(catchAll >= 0, 'the /blog/:slug pattern exists')
  rules.forEach((r, i) => { if (r.source.startsWith('/blog/') && i !== catchAll) assert.ok(i < catchAll, `${r.source} comes before /blog/:slug`) })
  // the retired posts are gone from content, and each has its rule
  for (const old of ['what-happens-during-epc-assessment', 'mees-regulations-2026', 'mees-timeline-2026-2030', 'epc-improvements-by-budget']) {
    assert.ok(!slugs.has(old), `${old}.mdx was removed`)
    assert.ok(sources.has(`/blog/${old}`), `/blog/${old} has its own rule`)
  }
  for (const cat of ['epc-basics', 'for-landlords', 'for-sellers', 'improvements', 'regulations']) assert.ok(sources.has(`/blog/category/${cat}`), `category ${cat} redirects`)
})

/** Every source file a visitor's link can come from. */
function sourceFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) return sourceFiles(p)
    return /\.(tsx?|mdx|txt)$/.test(e.name) ? [p] : []
  })
}
const files = ['app', 'components', 'lib', 'content'].flatMap((d) => sourceFiles(path.join(ROOT, d)))

test('nothing links to a /blog URL any more', () => {
  const hits = []
  for (const f of files) {
    fs.readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
      // /blog as a URL, not a path such as content/blog or @/components/blog; comments may describe the move
      if (/^\s*(\*|\/\/|\/\*)/.test(line)) return
      if (/(?<![A-Za-z0-9_@.\-])\/blog(?![A-Za-z0-9_-])/.test(line.replace(/\/\/.*$/, ''))) hits.push(`${path.relative(ROOT, f)}:${i + 1}`)
    })
  }
  assert.deepEqual(hits, [])
})

test('every /guides link and related post points at a guide that exists', async () => {
  const broken = []
  for (const f of files) {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/\/guides\/([a-z0-9-]+)(?![a-z0-9-])/g)) {
      // image folders under public/guides are assets, not guides
      if (!slugs.has(m[1]) && !assets.has(m[1]) && !assets.has(`${m[1]}-720`)) broken.push(`${path.relative(ROOT, f)}: /guides/${m[1]}`)
    }
  }
  for (const p of await getAllPosts()) for (const r of p.relatedPosts) if (!slugs.has(r)) broken.push(`${p.slug} relatedPosts: ${r}`)
  for (const g of guideGroups) for (const x of g.guides) if (!slugs.has(x.slug)) broken.push(`hub group ${g.id}: ${x.slug}`)
  assert.deepEqual(broken, [])
})

test(`every guide's search title fits ${TITLE_MAX} characters and its description ${DESCRIPTION_MAX}`, async () => {
  const long = []
  for (const p of await getAllPosts()) {
    const m = postMeta(p)
    if (m.full.length > TITLE_MAX) long.push(`${p.slug} title ${m.full.length}`)
    if (m.description.length > DESCRIPTION_MAX) long.push(`${p.slug} description ${m.description.length}`)
  }
  assert.deepEqual(long, [])
})
