// Running-cost figures in guides come from lib/borough-stats.ts through {cost:...} tokens (lib/guide-costs.ts),
// never typed by hand. A bad token must fail here rather than on the live page.
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { fillCosts, costText } = require('../lib/guide-costs.ts')
const { boroughStats } = require('../lib/borough-stats.ts')

const BLOG = path.join(__dirname, '..', 'content', 'blog')
const posts = fs.readdirSync(BLOG).filter((f) => f.endsWith('.mdx')).map((f) => ({ file: f, raw: fs.readFileSync(path.join(BLOG, f), 'utf8') }))

test('every cost token in every guide resolves', () => {
  for (const { file, raw } of posts) {
    const out = fillCosts(raw)
    assert.ok(!/\{cost:/.test(out), `${file}: unfilled cost token`)
  }
})

test('cost tokens read the generated data', () => {
  const d = boroughStats.runningCosts.bands.find((b) => b.id === 'D')
  const c = boroughStats.runningCosts.bands.find((b) => b.id === 'C')
  assert.equal(costText('D.median'), `£${d.median.toLocaleString('en-GB')}`)
  assert.equal(costText('D-C'), `£${(d.median - c.median).toLocaleString('en-GB')}`)
  assert.equal(costText('C.perM2'), `£${c.perM2.toFixed(2)}`)
  assert.match(costText('from'), /^\d{2}\/\d{2}\/\d{4}$/)
  assert.throws(() => costText('Z.median'), /Unknown running-cost band/)
  assert.throws(() => costText('D.nope'), /Unknown running-cost token/)
})

test('running costs rise band by band and every published group is large enough', () => {
  const rc = boroughStats.runningCosts
  for (const b of rc.bands) assert.ok(b.n >= rc.minN, `${b.id}: n ${b.n}`)
  const medians = rc.bands.map((b) => b.median)
  assert.deepEqual([...medians].sort((x, y) => x - y), medians, 'medians not rising from B to F and G')
})
