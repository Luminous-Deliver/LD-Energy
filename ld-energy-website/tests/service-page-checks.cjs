// Shared checks for the rebuilt service pages (24/10/2026): frozen title, ids, title-block links, FAQ and schema, no em
// dashes, no page errors, no "book" in quote link labels, no sideways scroll at 1440, 1024, 390 and 360, and a price
// row opening the quote dialog on a phone. Each page's test adds its own content checks through `extra`.
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const base = process.env.BOOKING_TEST_URL || 'http://localhost:3100'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')

const ids = ['up-to-40', '40-55', '55-75', '75-95', '95-115', 'over-115']

async function checkServicePage({ route, h1, title, ids: sectionIds, faqId, faqCount, schemaTypes, rows, promise, extra }) {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  let checks = 0
  const ok = (value, message) => { assert.ok(value, message); checks++ }
  const eq = (actual, expected, message) => { assert.equal(actual, expected, message); checks++ }
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await page.addInitScript(() => { if (window.top === window) localStorage.setItem('cookie-consent', 'declined') })
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e)))
    await page.goto(base + route, { waitUntil: 'networkidle' })
    eq(await page.locator('h1').innerText(), h1, 'H1, sentence case')
    eq(await page.title(), title, 'title unchanged (frozen until 14/12)')
    eq(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://epc.luminousanddeliver.co.uk' + route, 'canonical')
    for (const id of sectionIds) eq(await page.locator('#' + id).count(), 1, `#${id} exists`)

    // the hero title block: each size (or row) with its price and quote link
    if (rows) {
      const links = page.locator('.sv-tb .in-tb__rows a')
      eq(await links.count(), rows.length, 'title block rows')
      for (const [i, r] of rows.entries()) {
        const text = (await links.nth(i).innerText()).replace(/\s+/g, ' ')
        ok(text.includes(r.text), `row ${i}: ${r.text} (${text})`)
        if (r.from !== undefined) eq(/\bfrom\b/.test(text), r.from, `row ${i}: "from" ${r.from ? 'shown' : 'not shown'}`)
        eq(await links.nth(i).getAttribute('href'), r.href, `row ${i}: link`)
      }
    }

    const has = await page.locator('.op').count()
    eq(has, promise ? 1 : 0, `our promise ${promise ? 'shown' : 'not shown'}`)
    if (promise) ok(await page.evaluate((after) => document.querySelector('#' + after).nextElementSibling?.classList.contains('op'), promise), `our promise directly after #${promise}`)

    eq(await page.locator(`#${faqId} details`).count(), faqCount, `${faqCount} questions`)
    eq(await page.locator(`#${faqId} details[open]`).count(), 1, 'first question open')
    const blocks = await page.evaluate(() => [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => [JSON.parse(s.textContent)].flat()))
    const types = blocks.map((x) => x['@type'])
    ok(schemaTypes.every((t) => types.includes(t)), `schema ${types}`)
    eq(blocks.find((b) => b['@type'] === 'FAQPage').mainEntity.length, faqCount, 'FAQPage matches the questions')
    ok(!JSON.stringify(blocks.find((b) => b['@type'] === 'Service')).includes('"price"'), 'schema uses minPrice, never price')
    for (const href of ['/services/domestic-epc', '/services/floor-plans', '/services/epc-pre-assessment', '/services/epc-improvement-plan', '/pricing'].filter((h) => h !== route)) {
      eq(await page.locator(`.in-rn a[href="${href}"]`).count(), 1, `read next: ${href}`)
    }
    ok(!(await page.locator('main').innerText()).includes('—'), 'no em dashes')
    for (const l of await page.locator('main a[href^="/quote"]').allInnerTexts()) ok(!/\bbook(?:ing)?\b/i.test(l), `quote link label without "book": ${l.trim()}`)
    if (extra) await extra(page, { ok, eq })
    eq(errors.length, 0, `no page errors ${errors}`)
    eq(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, true, 'no sideways scroll at 1440')
    await page.close()

    for (const w of [1024, 390, 360]) {
      const p = await browser.newPage({ viewport: { width: w, height: 800 } })
      await p.addInitScript(() => { if (window.top === window) localStorage.setItem('cookie-consent', 'declined') })
      await p.goto(base + route, { waitUntil: 'networkidle' })
      eq(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, true, `no sideways scroll at ${w}`)
      if (w === 360) {
        const small = await p.evaluate(() => [...document.querySelectorAll('main a, main summary, main button')].filter((e) => e.checkVisibility() && !e.closest('.in-crumbs, p, dt, .in-faq__a, .sv-dash') && e.getBoundingClientRect().height < 44).map((e) => e.textContent.trim().slice(0, 30)))
        eq(small.length, 0, `tap targets at least 44 px: ${small}`)
        await p.locator('.sv-tb .in-tb__rows a[href^="/quote"]').first().click()
        await p.locator('dialog[open]').waitFor()
        ok(await p.locator('dialog[open] #qd-title').isVisible(), 'phone: a price row opens the quote')
      }
      await p.close()
    }
    console.log(`ok ${route} · ${checks} checks`)
  } finally { await browser.close() }
}

module.exports = { checkServicePage, ids }
