// The data page and /areas read their figures from lib/borough-stats.ts through lib/borough-ratings.ts.
// These checks recompute the headline finding straight from the stats file and check the region and tile
// tables cover every borough exactly once. The rendered pages are checked by tests/ratings-pages.cjs.
const test = require('node:test')
const assert = require('node:assert/strict')
const { boroughStats } = require('../lib/borough-stats.ts')
const { ratingsFinding, ratingsHeadline, rankedByAtoC, tilePosition, tileLabel, placesFor, extremes, londonBoroughs } = require('../lib/borough-ratings.ts')
const { regions, townCentres } = require('../lib/london-regions.ts')

const slugs = Object.keys(boroughStats.boroughs).sort()

test('the headline finding is the highest and lowest A to C share in the stats file', () => {
  const values = Object.values(boroughStats.boroughs).map((b) => b.ratings.pct.AtoC)
  const { top, bottom } = ratingsFinding()
  assert.equal(top.ratings.pct.AtoC, Math.max(...values))
  assert.equal(bottom.ratings.pct.AtoC, Math.min(...values))
  assert.equal(values.filter((v) => v === Math.max(...values)).length, 1, 'tie for highest: reword the headline')
  assert.equal(values.filter((v) => v === Math.min(...values)).length, 1, 'tie for lowest: reword the headline')
  assert.ok(ratingsHeadline().startsWith(top.name) && ratingsHeadline().includes(bottom.name))
  assert.equal(rankedByAtoC.length, 33)
})

test('the five sub-regions hold each of the 33 boroughs exactly once', () => {
  const listed = regions.flatMap((r) => r.boroughs)
  assert.equal(listed.length, 33)
  assert.deepEqual([...listed].sort(), slugs)
  assert.deepEqual(Object.keys(townCentres).sort(), slugs)
})

test('the tile map has 33 squares, one per borough, none overlapping', () => {
  assert.deepEqual(Object.keys(tilePosition).sort(), slugs)
  assert.deepEqual(Object.keys(tileLabel).sort(), slugs)
  const cells = Object.values(tilePosition).map(([c, r]) => `${c},${r}`)
  assert.equal(new Set(cells).size, 33)
  for (const [c, r] of Object.values(tilePosition)) assert.ok(c >= 1 && c <= 8 && r >= 1 && r <= 7)
  assert.equal(new Set(Object.values(tileLabel)).size, 33)
})

test('every borough row on /areas names its places', () => {
  for (const slug of slugs) {
    const places = placesFor(slug)
    assert.ok(places.length >= 3, `${slug}: ${places.join(', ')}`)
    assert.equal(new Set(places.map((p) => p.toLowerCase())).size, places.length, `${slug}: repeated place`)
    for (const p of places) assert.doesNotMatch(p, /\.|cover|including/i, `${slug}: ${p}`)
  }
})

test('the "what differs" extremes leave out the City and come from the data', () => {
  assert.equal(londonBoroughs.length, 32)
  const e = extremes((b) => b.pctLettings, londonBoroughs)
  const v = londonBoroughs.map((b) => b.pctLettings)
  assert.equal(e.high.pctLettings, Math.max(...v))
  assert.equal(e.low.pctLettings, Math.min(...v))
})
