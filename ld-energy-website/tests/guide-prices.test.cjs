// Guides never type an L&D price (plan PLAN-AREAS-GUIDES-2026-10-22 §8.2). Prices come from lib/site.ts through
// <Price item="..." /> in body text or {price:key} tokens in frontmatter and component props (lib/guide-prices.ts).
// Third-party figures (penalties, cost caps, installer cost ranges) are allowed, but each one is listed below per
// guide, so a new typed figure has to be looked at before it ships.
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { pricing, site, maxBundleSaving, bundleSaving, SAME_DAY_LODGEMENT_SURCHARGE, NEXT_DAY_VISIT_SURCHARGE, priceFrom } = require('../lib/site.ts')
const { guidePrices, fillPrices, priceTokens, isGuidePriceKey } = require('../lib/guide-prices.ts')

const BLOG = path.join(__dirname, '..', 'content', 'blog')
const posts = fs.readdirSync(BLOG).filter((f) => f.endsWith('.mdx')).map((f) => ({ file: f, raw: fs.readFileSync(path.join(BLOG, f), 'utf8') }))

/** Every figure L&D charges or promises, so any of them typed into a guide is caught whatever the context. */
const ldValues = new Set([
  ...pricing.flatMap((b) => [b.epc, b.floorPlan, b.bundle, b.preAssessment, bundleSaving(b)]),
  site.addOns.improvementPlan, site.addOns.lodgeLater, SAME_DAY_LODGEMENT_SURCHARGE, NEXT_DAY_VISIT_SURCHARGE, maxBundleSaving,
])

/** Third-party figures each guide may type. Update when a guide's sourced figures change. */
const ALLOWED = {
  'cavity-wall-insulation-epc.mdx': ['£500'], // budget comparison (group 3)
  'cheapest-ways-improve-epc.mdx': ['£500', '£5,000', '£20,000', '£15', '£30', '£5', '£10', '£25', '£20', '£9,000'], // title, installer and DIY cost ranges
  'epc-c-by-2030.mdx': ['£10,000', '£3,500', '£5,400', '£30,000', '£5,000'], // 2030 cost cap, current cap, impact assessment average, proposed and current maximum fine (GOV.UK, checked 29/10)
  'epc-for-landlords-2026.mdx': ['£5,000', '£30,000', '£2,000', '£4,000', '£3,500', '£10,000'], // MEES penalties and cap (re-checked after the 28/10 Budget: unchanged)
  'epc-for-selling-house.mdx': ['£200'], // SI 2012/3118 reg 38 penalty
  'epc-improvements-by-budget.mdx': ['£500', '£2,000', '£5,000'], // budget tiers in the frozen title
  'epc-vs-floor-plan-vs-survey.mdx': ['£5,000', '£400', '£1,000'], // MEES penalty cap; survey range (group 5 to source)
  'how-long-does-epc-last.mdx': ['£200', '£5,000'], // SI 2012/3118 reg 38 penalty; MEES total fine limit
  'how-to-improve-epc-rating.mdx': ['£7,500'], // Boiler Upgrade Scheme grant (group 3 to re-check)
  'loft-insulation-epc-rating.mdx': ['£500', '£200', '£300', '£450', '£150', '£250', '£400', '£600', '£350', '£700', '£900'], // installer cost table (group 3)
  'mees-regulations-2026.mdx': ['£2,000', '£4,000', '£1,000', '£3,500', '£5,000', '£30,000', '£10,000'], // MEES penalties, caps
  'mees-timeline-2026-2030.mdx': ['£10,000', '£3,500', '£2,000', '£4,000', '£1,000', '£5,000', '£30,000'], // MEES penalties, caps
}

const MONEY = /£\d{1,3}(?:,\d{3})+|£\d+/g

function figures(raw) {
  return [...raw.matchAll(MONEY)].map((m) => ({
    text: m[0],
    value: Number(m[0].slice(1).replace(/,/g, '')),
    // A figure inside a range ("£15–£30") is a third-party cost, never an L&D price.
    inRange: /[–-]\s*$/.test(raw.slice(Math.max(0, m.index - 2), m.index)) || /^\s*[–-]/.test(raw.slice(m.index + m[0].length, m.index + m[0].length + 2)),
  }))
}

test('no guide types an L&D price', () => {
  const hits = []
  for (const { file, raw } of posts) {
    for (const f of figures(raw)) if (ldValues.has(f.value) && !f.inRange) hits.push(`${file}: ${f.text}`)
  }
  assert.deepEqual(hits, [], `typed L&D prices; use <Price item="..." /> or {price:key}:\n${hits.join('\n')}`)
})

test('every other typed figure is a listed third-party figure, and the list has nothing stale', () => {
  const unlisted = []
  const stale = []
  for (const { file, raw } of posts) {
    const found = new Set(figures(raw).map((f) => f.text))
    const allowed = new Set(ALLOWED[file] ?? [])
    for (const t of found) if (!allowed.has(t)) unlisted.push(`${file}: ${t}`)
    for (const t of allowed) if (!found.has(t)) stale.push(`${file}: ${t}`)
  }
  assert.deepEqual(unlisted, [], `unlisted figures; if third-party and sourced, add to ALLOWED:\n${unlisted.join('\n')}`)
  assert.deepEqual(stale, [], `ALLOWED lists figures no longer in the guide:\n${stale.join('\n')}`)
})

test('every price token and <Price> item names a real price', () => {
  for (const { file, raw } of posts) {
    for (const key of priceTokens(raw)) assert.ok(isGuidePriceKey(key), `${file}: unknown token {price:${key}}`)
    for (const m of raw.matchAll(/<Price\s+item="([^"]*)"/g)) assert.ok(isGuidePriceKey(m[1]), `${file}: unknown <Price item="${m[1]}">`)
    assert.doesNotThrow(() => fillPrices(raw), file)
  }
})

test('filled prices match lib/site.ts', () => {
  assert.equal(guidePrices.epcFrom, priceFrom.epc)
  assert.equal(fillPrices('from {price:epcFrom}'), `from £${Math.min(...pricing.map((b) => b.epc))}`)
  assert.equal(fillPrices('{price:sameDayLodgement}'), `£${SAME_DAY_LODGEMENT_SURCHARGE}`)
  assert.equal(fillPrices('{price:nextDayVisit}'), `£${NEXT_DAY_VISIT_SURCHARGE}`)
  assert.equal(fillPrices('{price:improvementPlan}'), `£${site.addOns.improvementPlan}`)
  assert.equal(fillPrices('{price:maxBundleSaving}'), `£${maxBundleSaving}`)
  assert.throws(() => fillPrices('{price:nope}'), /Unknown guide price token/)
})

test('no phone link in any guide body', () => {
  for (const { file, raw } of posts) assert.doesNotMatch(raw, /tel:|07492|\+44\s?7492/, file)
})
