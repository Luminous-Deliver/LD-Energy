// /epc-ratings-by-borough, redesigned 24/10/2026: the behaviour of the data page (tests/ratings-pages.cjs checks every
// figure against lib/borough-stats.ts in the built HTML). Here: the three London numbers and their source drawer, the
// map and the select choosing a panel, the A to Z table opening and sorting, ending B's price list against lib/site.ts,
// the promise under it, the section ids, the schema, no em dashes, no sideways scroll.
// (parity: projects/ld-energy-redesign-2026-10/research/epc-ratings-by-borough-parity-2026-10-24.md)
//
//   node --require ./tests/register.cjs tests/epc-ratings-by-borough-page.cjs
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const { pricing } = require('../lib/site.ts')
const { fmt, pct, london, statsSource } = require('../lib/area-page.ts')
const { ratingsHeadline, ratingsFinding, rankedByAtoC, boroughsAtoZ } = require('../lib/borough-ratings.ts')
const base = process.env.BOOKING_TEST_URL || 'http://localhost:3100'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')

const norm = (s) => s.replace(/\s+/g, ' ').trim()
const { top, bottom } = ratingsFinding()
const visiblePanels = (p) => p.locator('article.bx-panel').evaluateAll((as) => as.filter((a) => getComputedStyle(a).display !== 'none').map((a) => a.id))

;(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  let checks = 0
  const ok = (value, message) => { assert.ok(value, message); checks++ }
  const eq = (actual, expected, message) => { assert.deepEqual(actual, expected, message); checks++ }
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await page.addInitScript(() => { if (window.top === window) localStorage.setItem('cookie-consent', 'declined') })
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e)))
    await page.goto(`${base}/epc-ratings-by-borough`, { waitUntil: 'networkidle' })
    eq(await page.locator('h1').innerText(), ratingsHeadline(), 'H1 states the computed finding')
    eq(await page.title(), `EPC Ratings by London Borough, ${statsSource.from.slice(0, 4)}–${statsSource.to.slice(0, 4)} | L&D Energy`, 'title unchanged (frozen until 14/12)')
    for (const id of ['map', 'trend', 'table', 'about-figures', 'prices']) eq(await page.locator('#' + id).count(), 1, `#${id} exists`)
    const lead = norm(await page.locator('.in-hd__answer').innerText())
    ok(lead.includes(`${pct(top.ratings.pct.AtoC)}`) && lead.includes(bottom.name) && lead.includes(fmt(london.certificates)), 'lead: totals and the top and bottom boroughs')

    // About these figures C: three London numbers, any chip opens the method drawer, Esc closes it
    const stats = await page.locator('.in-stats b').allInnerTexts()
    eq(stats, [fmt(london.certificates), pct(london.ratings.pct.AtoC), pct(london.privateRented.pctBelowC)], 'three London numbers')
    await page.locator('.in-schip').nth(1).click()
    const drawer = page.locator('dialog.in-drawer[open]')
    await drawer.waitFor()
    const dtext = norm(await drawer.innerText())
    ok(dtext.includes('How we got these numbers') && dtext.includes('Not endorsed by MHCLG') && dtext.includes(statsSource.caveats[0]), 'drawer: source, licence, caveats')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
    eq(await page.locator('dialog.in-drawer[open]').count(), 0, 'Esc closes the drawer')

    // The map: one panel shows (the top borough); the select and the tiles change it
    eq(await visiblePanels(page), [`borough-${top.slug}`], 'top borough shown first')
    await page.selectOption('#borough-select', bottom.slug)
    eq(await visiblePanels(page), [`borough-${bottom.slug}`], 'the select shows the chosen borough')
    ok(page.url().endsWith(`#borough-${bottom.slug}`), 'the choice is in the URL')
    const pick = rankedByAtoC[10]
    await page.locator(`.bx-tiles a[href="#borough-${pick.slug}"]`).click()
    eq(await visiblePanels(page), [`borough-${pick.slug}`], 'a tile shows its borough')
    eq(await page.locator(`.bx-tiles a[aria-current="true"]`).getAttribute('href'), `#borough-${pick.slug}`, 'the chosen tile is marked')
    eq(await page.locator('#borough-select').inputValue(), pick.slug, 'the select follows the tile')
    eq(await page.locator(`#borough-${pick.slug} a[href="/areas/${pick.slug}"]`).count(), 1, 'panel links its area page')
    ok(await page.locator('#map a[href="/areas"]').count() === 1, 'every London area link kept')

    // The A to Z table: collapsed, opens, sorts
    const table = page.locator('#table details')
    ok(!(await table.evaluate((d) => d.open)), 'table collapsed by default')
    await table.locator('summary').click()
    ok(await page.locator('#table tbody tr').first().isVisible(), 'table opens')
    eq(await page.locator('#table tbody tr').count(), 33, '33 rows')
    eq(await page.locator('#table tbody tr').first().getAttribute('id'), `row-${boroughsAtoZ[0].slug}`, 'A to Z first')
    await page.locator('#table thead button', { hasText: 'A to C' }).click()
    eq(await page.locator('#table tbody tr').first().getAttribute('id'), `row-${top.slug}`, 'sorting A to C puts the top borough first')
    eq(await page.locator('#table thead th[aria-sort="descending"]').count(), 1, 'aria-sort on the sorted column')

    // Ending B: every size and its guide price, each opening the quote with that size; the promise under it
    const rows = page.locator('#prices .in-prow')
    eq(await rows.count(), pricing.length + 1, 'six sizes and Not sure')
    for (const [i, b] of pricing.entries()) {
      ok(norm(await rows.nth(i).innerText()).includes(`£${b.epc}`), `${b.areaLabel}: £${b.epc}`)
      eq(await rows.nth(i).getAttribute('href'), `/quote?service=epc&area=${b.id}&source=other&cta=bottom`, `${b.areaLabel}: quote link`)
    }
    ok(await page.evaluate(() => document.querySelector('#prices').nextElementSibling?.classList.contains('op')), 'our promise under the price list')

    // About these figures, in the page: method, caveats, City note, source and licence
    const about = norm(await page.locator('#about-figures').innerText())
    ok(about.includes('City of London has 1,782 certificates') && about.includes('Not endorsed by MHCLG') && about.includes('divided by all certificates with a rating'), 'about these figures, in full')
    ok(await page.locator('#about-figures a[href*="open-government-licence/version/3"]').count() >= 1, 'OGL link')

    const types = await page.evaluate(() => [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => [JSON.parse(s.textContent)].flat()).map((b) => b['@type']))
    ok(types.includes('Dataset') && types.includes('BreadcrumbList'), `schema ${types}`)
    ok(!(await page.locator('main').innerText()).includes('—'), 'no em dashes in the copy')
    eq(errors, [], 'no page errors')
    ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, 'no sideways scroll at 1440 (table open)')
    await page.close()
    console.log('ok 1440px')

    // Phone: a tile tap brings its panel into view; the open table scrolls inside itself, never the page
    const phone = await browser.newPage({ viewport: { width: 360, height: 800 } })
    await phone.addInitScript(() => { if (window.top === window) localStorage.setItem('cookie-consent', 'declined') })
    await phone.goto(`${base}/epc-ratings-by-borough`, { waitUntil: 'networkidle' })
    ok(await phone.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, 'no sideways scroll at 360')
    await phone.locator(`.bx-tiles a[href="#borough-${bottom.slug}"]`).click()
    await phone.waitForTimeout(900)
    const box = await phone.locator(`#borough-${bottom.slug}`).boundingBox()
    ok(box.y < 800 && box.y + box.height > 0, 'phone: a tile tap brings its panel into view')
    await phone.locator('#table summary').click()
    ok(await phone.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, 'phone: the open table does not scroll the page sideways')
    ok(await phone.locator('#table .in-tscroll').evaluate((d) => d.scrollWidth > d.clientWidth), 'phone: the table scrolls inside its frame')
    const small = await phone.locator('#borough-select, .in-schip, .st__b, #table summary, .in-prow').evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().height > 0 && e.getBoundingClientRect().height < 44).length)
    eq(small, 0, 'tap targets at least 44 px')
    await phone.close()
    console.log(`ok 360px · ${checks} checks`)
  } finally { await browser.close() }
})().catch((error) => { console.error(error); process.exit(1) })
