// How much of a rebuilt area page is its own text (plan PLAN-AREAS-GUIDES-2026-10-22 §4.1, gate 40%).
//
// Build every area page on the new template first, so the shared parts of the template are visible:
//   AREA_V2_ALL=1 NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA npx next build
//   node --require ./tests/register.cjs tests/area-uniqueness.cjs [.next/server/app/areas] [slug,slug,...]
//
// Method: the text inside <main>, minus the booking card, breadcrumb, scripts and SVG, split into sentences
// of 3+ words. Each sentence is normalised strictly: every borough and area name, the page's own place
// names, every postcode district and every number become placeholders, so a template sentence with new
// figures still counts as template. A sentence is template when its normalised form appears on 3 or more
// area pages (the 22/10 inventory's threshold); the stricter "only this page" share is reported too.
const fs = require('node:fs')
const path = require('node:path')
const { boroughMeta } = require('../lib/boroughs.ts')
const { areaLocal } = require('../lib/area-local.ts')

const dir = process.argv[2] || path.join(__dirname, '..', '.next', 'server', 'app', 'areas')
const targets = (process.argv[3] || 'stratford,newham,croydon').split(',')
const GATE = 40

const names = Object.values(boroughMeta).flatMap((b) => [b.name, b.name.replace('&', 'and')])
  .sort((a, b) => b.length - a.length)

function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }

function mainText(html) {
  let m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/)
  let t = m ? m[1] : html
  t = t.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<svg[\s\S]*?<\/svg>/g, ' ')
  t = t.replace(/<nav aria-label="Breadcrumb"[\s\S]*?<\/nav>/, ' ')
  // The booking card section: from id="contact" to the next section boundary.
  t = t.replace(/<section[^>]*id="contact"[\s\S]*?(?=<section|$)/, ' ')
  t = t.replace(/<\/(p|li|h[1-6]|td|th|summary|figcaption|caption|div|span|a|button|dt|dd)>/g, '\n')
  t = t.replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, ' ')
  t = t.replace(/&amp;/g, '&').replace(/&#x27;|&#39;|&rsquo;/g, '’').replace(/&quot;|&ldquo;|&rdquo;/g, '"').replace(/&nbsp;|&#160;/g, ' ').replace(/&[a-z]+;/g, ' ')
  return t
}

function sentences(text) {
  const out = []
  for (const block of text.split('\n')) {
    const b = block.replace(/\s+/g, ' ').trim()
    if (!b) continue
    for (const s of b.split(/(?<=[.!?])\s+(?=[A-Z£“"])/)) {
      if (s.split(' ').length >= 3) out.push(s.trim())
    }
  }
  return out
}

function normaliser(slug) {
  const places = Object.values(areaLocal[slug]?.districtNames ?? {}).flatMap((p) => p.split(/,| and /).map((x) => x.trim()).filter((x) => x.length > 2))
  const all = [...names, ...places].sort((a, b) => b.length - a.length)
  const re = new RegExp(all.map(esc).join('|'), 'g')
  return (s) => s
    .replace(re, '{P}')
    .replace(/\b[A-Z]{1,2}\d{1,2}[A-Z]?\b/g, '{PC}')
    .replace(/£?\d[\d,]*(\.\d+)?\s*(%|m²)?/g, '{N}')
    .replace(/\s+/g, ' ')
    .trim()
}

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.html'))
if (files.length < 30) {
  console.error(`Only ${files.length} area pages in ${dir}: build with AREA_V2_ALL=1 first.`)
  process.exit(2)
}
const pages = {}
for (const f of files) {
  const slug = f.replace(/\.html$/, '')
  const norm = normaliser(slug)
  const sents = sentences(mainText(fs.readFileSync(path.join(dir, f), 'utf8')))
  pages[slug] = sents.map((s) => ({ s, n: norm(s), w: s.split(' ').length }))
}
const count = new Map()
for (const list of Object.values(pages)) {
  for (const n of new Set(list.map((x) => x.n))) count.set(n, (count.get(n) || 0) + 1)
}

let failed = false
const report = {}
for (const slug of targets) {
  const list = pages[slug]
  if (!list) { console.error(`No built page for ${slug}`); failed = true; continue }
  const total = list.reduce((a, x) => a + x.w, 0)
  const unique3 = list.filter((x) => count.get(x.n) < 3).reduce((a, x) => a + x.w, 0)
  const only = list.filter((x) => count.get(x.n) === 1).reduce((a, x) => a + x.w, 0)
  const share = (100 * unique3) / total
  report[slug] = { sentenceWords: total, uniqueWords: unique3, pctUnique: +share.toFixed(1), pctOnlyThisPage: +((100 * only) / total).toFixed(1) }
  if (share < GATE) failed = true
}
console.log(JSON.stringify({ pagesCompared: files.length, gate: GATE, report }, null, 1))
// EXPLAIN=<slug> lists that page's template sentences, heaviest first, to show what to shorten or link instead.
if (process.env.EXPLAIN && pages[process.env.EXPLAIN]) {
  const weight = new Map()
  for (const x of pages[process.env.EXPLAIN]) if (count.get(x.n) >= 3) weight.set(x.n, (weight.get(x.n) || 0) + x.w)
  for (const [n, w] of [...weight].sort((a, b) => b[1] - a[1])) console.log(String(w).padStart(4), n.slice(0, 160))
}
process.exit(failed ? 1 : 0)
