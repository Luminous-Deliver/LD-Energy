// Checks the built data page, /areas and every area page against lib/borough-stats.ts (plan §6, §5, §10).
//
//   NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA npx next build
//   node --require ./tests/register.cjs --test tests/ratings-pages.cjs
//
// Reads the prerendered HTML in .next/server/app, so it tests what ships rather than a re-render.
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { boroughStats } = require('../lib/borough-stats.ts')
const { boroughMeta } = require('../lib/boroughs.ts')
const { fmt, pct, rankLabel, bandEpcPrice, bandPhrase } = require('../lib/area-page.ts')
const { ratingsHeadline, DATA_PAGE_PATH } = require('../lib/borough-ratings.ts')

const dir = process.env.NEXT_APP_DIR || path.join(__dirname, '..', '.next', 'server', 'app')
const read = (p) => {
  const file = path.join(dir, p)
  if (!fs.existsSync(file)) throw new Error(`${file} missing: run next build first`)
  return fs.readFileSync(file, 'utf8')
}
const text = (html) => html.replace(/<!--.*?-->/g, '').replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
const numbers = (t) => (t.match(/\d[\d,]*(\.\d+)?/g) || []).map((n) => n.replace(/,/g, ''))

const page = read('epc-ratings-by-borough.html')
const L = boroughStats.london
const boroughs = Object.values(boroughStats.boroughs)

function panel(slug) {
  const m = page.match(new RegExp(`<article id="borough-${slug}"[\\s\\S]*?</article>`))
  assert.ok(m, `no panel for ${slug}`)
  return text(m[0])
}

test('the data page has 33 borough panels, all in the HTML', () => {
  const ids = [...page.matchAll(/<article id="borough-([a-z-]+)"/g)].map((m) => m[1])
  assert.equal(ids.length, 33)
  assert.deepEqual([...ids].sort(), Object.keys(boroughStats.boroughs).sort())
  assert.equal((page.match(/data-default=""/g) || []).length, 1, 'exactly one panel shows by default')
  const tiles = [...page.matchAll(/<a[^>]+href="#borough-([a-z-]+)"/g)].map((m) => m[1])
  assert.equal(new Set(tiles).size, 33, 'one tile per borough')
  assert.equal((page.match(/<option /g) || []).length, 33, 'one select option per borough')
})

test('the H1 states the computed finding', () => {
  const h1 = page.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)
  assert.ok(h1)
  assert.equal(text(h1[1]), ratingsHeadline())
})

test('every figure in every panel matches lib/borough-stats.ts', () => {
  let checked = 0
  for (const b of boroughs) {
    const t = panel(b.slug)
    const expected = [
      pct(b.ratings.pct.AtoC), fmt(b.ratings.n), pct(L.ratings.pct.AtoC),
      `${pct(b.privateRented.pctBelowC)} of ${fmt(b.privateRented.n)}`, fmt(b.privateRented.nFtoG),
      `${b.floorArea.median} m²`, `${bandPhrase(b.commonestBand.id)}, ${bandEpcPrice(b.commonestBand.id)}`,
      `${rankLabel(b.slug, (a) => a.ratings.pct.AtoC)} of 33`,
    ]
    for (const e of expected) assert.ok(t.includes(e), `${b.slug}: "${e}" not in panel`)
    // Every number in the panel is one of the figures above, a bar label, a band boundary or the rank.
    const allowed = new Set([
      ...expected.flatMap(numbers), '33', '2',
      ...Object.values(b.ratings.pct).map((v) => String(Math.round(v))),
    ])
    for (const n of numbers(t)) assert.ok(allowed.has(n), `${b.slug}: unexpected figure ${n} in "${t.slice(0, 200)}"`)
    checked++
  }
  assert.equal(checked, 33)
})

test('every row of the A to Z table matches lib/borough-stats.ts', () => {
  for (const b of boroughs) {
    const m = page.match(new RegExp(`<tr id="row-${b.slug}"[\\s\\S]*?</tr>`))
    assert.ok(m, `no row for ${b.slug}`)
    const cells = [...m[0].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => text(c[1]))
    assert.deepEqual(cells, [
      fmt(b.certificates), pct(b.ratings.pct.AtoC), pct(b.ratings.pct.D), pct(b.ratings.pct.E), pct(b.ratings.pct.FtoG),
      pct(b.privateRented.pctBelowC), String(b.floorArea.median),
    ], b.slug)
  }
})

test('the London totals and trend match', () => {
  const t = text(page)
  for (const e of [fmt(L.certificates), pct(L.ratings.pct.AtoC), pct(L.privateRented.pctBelowC)]) assert.ok(t.includes(e), e)
  for (const [y, m] of Object.entries(L.byYear)) assert.ok(t.includes(pct(m.pct.AtoC)) && t.includes(fmt(m.n)), y)
  assert.match(t, /Not endorsed by MHCLG/)
  assert.match(page, /open-government-licence\/version\/3/)
  assert.match(t, /City of London has 1,782 certificates/)
})

test('the data page carries Dataset and BreadcrumbList schema', () => {
  const blocks = [...page.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => [].concat(JSON.parse(m[1])))
  const types = blocks.map((b) => b['@type'])
  assert.ok(types.includes('Dataset') && types.includes('BreadcrumbList'), types.join(','))
  const ds = blocks.find((b) => b['@type'] === 'Dataset')
  assert.equal(ds.license, 'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/')
  assert.equal(ds.temporalCoverage, `${boroughStats.source.from}/${boroughStats.source.to}`)
})

test('every area page links the data page', () => {
  const slugs = Object.keys(boroughMeta)
  assert.equal(slugs.length, 34)
  for (const slug of slugs) {
    const html = read(path.join('areas', `${slug}.html`))
    const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/)[1]
    assert.match(main, new RegExp(`href="${DATA_PAGE_PATH}"`), `${slug} does not link the data page in its content`)
  }
})

test('/areas links the data page and all 34 area pages, with ItemList schema', () => {
  const html = read('areas.html')
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/)[1]
  assert.match(main, new RegExp(`href="${DATA_PAGE_PATH}"`))
  for (const slug of Object.keys(boroughMeta)) assert.match(main, new RegExp(`href="/areas/${slug}"`), slug)
  assert.match(html, /<h1[^>]*>EPC Certificates Across London<\/h1>/)
  assert.match(html, /<title>Areas We Cover \| EPC Assessor Across London/)
  const list = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => [].concat(JSON.parse(m[1]))).find((b) => b['@type'] === 'ItemList')
  assert.equal(list.itemListElement.length, 34)
  for (const b of boroughs) assert.ok(text(main).includes(pct(b.ratings.pct.AtoC)), b.slug)
})
