// /sellers, redesigned 24/10/2026 on the /landlords template: every price and quote link against lib/site.ts, the old
// page's timeline, tips and FAQ carried over (parity: Abdul-2 projects/ld-energy-redesign-2026-10/research/
// sellers-parity-2026-10-24.md), the marketing rule as the 2012 Regulations put it, the frozen title, ids, schema, the
// quote dialog and no sideways scroll.
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const base = process.env.BOOKING_TEST_URL || 'http://localhost:3100'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')

const norm = (s) => s.toLowerCase().replace(/[’']/g, "'")
const ids = ['up-to-40', '40-55', '55-75', '75-95', '95-115', 'over-115']
const epc = [65, 75, 85, 95, 105, 120]

;(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  let checks = 0
  const ok = (value, message) => { assert.ok(value, message); checks++ }
  const eq = (actual, expected, message) => { assert.equal(actual, expected, message); checks++ }
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await page.addInitScript(() => { if (window.top === window) localStorage.setItem('cookie-consent', 'declined') })
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e)))
    await page.goto(`${base}/sellers`, { waitUntil: 'networkidle' })
    eq(await page.locator('h1').innerText(), 'EPCs for selling your London home', 'H1, sentence case')
    eq(await page.title(), 'EPC for Selling Your Home London | From £65 | L&D Energy', 'title unchanged (frozen until 14/12)')
    eq(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://epc.luminousanddeliver.co.uk/sellers', 'canonical')
    ok((await page.locator('meta[name="description"]').getAttribute('content')).startsWith('EPC certificates for selling your London home. Generally commissioned before marketing; exemptions apply.'), 'description unchanged')
    for (const id of ['why-it-matters', 'timeline', 'sale-price', 'seller-faq', 'book']) eq(await page.locator('#' + id).count(), 1, `#${id} exists`)

    // Title-block price list: every band, every link
    const rows = page.locator('.in-tb__rows a')
    eq(await rows.count(), 7, 'six bands and "not sure of the size"')
    for (const [i, id] of ids.entries()) {
      const text = (await rows.nth(i).innerText()).replace(/\s+/g, ' ')
      ok(text.includes(`£${epc[i]}`) && /from/.test(text) === (i === 5), `band ${id}: £${epc[i]}`)
      eq(await rows.nth(i).getAttribute('href'), `/quote?service=epc&area=${id}&source=sellers&cta=pricing`, `band ${id}: quote link`)
    }
    eq(await rows.nth(6).getAttribute('href'), '/quote?service=epc&area=unknown&source=sellers&cta=pricing', 'not sure of the size')
    const foot = (await page.locator('.in-tb__other').innerText()).replace(/\s+/g, ' ')
    ok(/Floor plan from £55/.test(foot) && /from £105/.test(foot) && /£15 extra/.test(foot) && /£35 extra/.test(foot), `price list foot (${foot})`)
    eq(await page.locator('.in-hd__acts a.ld-btn').getAttribute('href'), '/quote?service=epc&source=sellers&cta=hero', 'hero quote link')
    ok(/same day for £15 extra/.test(await page.locator('.in-hd__answer').innerText()), 'hero: same-day £15 extra')

    // The rule, the timeline, the tips
    const main = (await page.locator('main').innerText()).replace(/\s+/g, ' ')
    const why = (await page.locator('#why-it-matters').innerText()).replace(/\s+/g, ' ')
    ok(/commissioned before a home is marketed for sale in England and Wales/.test(why) && /seven days/.test(why) && /further 21 days/.test(why) && /exemptions apply/.test(why), 'the marketing rule (2012 Regs reg 7)')
    ok(await page.locator('#why-it-matters a[href="https://www.legislation.gov.uk/uksi/2012/3118/regulation/7"]').count() === 1, 'source: regulation 7')
    ok(await page.locator('#why-it-matters a[href="/estate-agents"]').count() === 1, 'link to agents kept')
    const steps = await page.locator('#timeline .lp-steps h3').allInnerTexts()
    eq(steps.join(' | '), 'Get your EPC before marketing | Book early in the listing process | Book a next-day visit if you’re tight | Give it to buyers', 'timeline, four steps')
    ok(/lodge your certificate that day \(\+£35\)/.test(main), 'next-day visit +£35')
    for (const fact of ['Legal requirement', 'Buyers care about efficiency', 'Don’t hold up your sale', 'with the price up front',
      'Rightmove, Zoopla and OnTheMarket', 'A lower rating doesn’t stop a sale', 'Booking your EPC at the same time as your photography and floor plan',
      'LED lighting', 'Modern condensing boiler', 'Loft and cavity wall insulation', 'Renewables', 'A particular rating gain is not guaranteed',
      'guidance only, not lodged']) ok(norm(main).includes(norm(fact)), `fact: ${fact}`)
    ok(norm(main).includes('£35 extra') && norm(main).includes('from £90'), 'improvement plan and pre-assessment prices from lib/site')

    // Promise, FAQ, Read next, ending
    ok(await page.locator('.op').getByText('If we’re late, you pay less.').isVisible(), 'our promise shown')
    eq(await page.locator('#seller-faq details').count(), 5, 'five seller questions')
    eq(await page.locator('#seller-faq details[open]').count(), 1, 'first question open')
    for (const href of ['/blog/epc-for-selling-house', '/blog/how-long-does-epc-last', '/landlords', '/estate-agents']) eq(await page.locator(`.in-rn a[href="${href}"]`).count(), 1, `read next: ${href}`)
    eq(await page.locator('#book a.ld-btn').getAttribute('href'), '/quote?service=epc&source=sellers&cta=bottom', 'ending quote link')
    ok(/same-day lodgement for £15 extra, or a next-day visit for £35 extra/.test(await page.locator('#book').innerText()), 'ending: speed options as extras')

    // Schema
    const schema = await page.evaluate(() => [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => [JSON.parse(s.textContent)].flat()))
    const types = schema.map((x) => x['@type'])
    ok(['BreadcrumbList', 'Service', 'FAQPage'].every((t) => types.includes(t)), `schema ${types}`)
    const svc = schema.find((x) => x['@type'] === 'Service' && x.url?.endsWith('/sellers'))
    eq(svc.name, 'EPC for Selling a Home', 'Service name kept')
    eq(svc.offers.priceSpecification.minPrice, 65, 'Service minPrice')
    ok(!('price' in svc.offers.priceSpecification), 'no fixed price in schema')
    eq(schema.find((x) => x['@type'] === 'FAQPage').mainEntity.length, 5, 'FAQPage has five questions')

    ok(!main.includes('—'), 'no em dashes in the copy')
    for (const label of await page.locator('a[href*="/quote"]').allTextContents()) ok(!/\bbook(?:ing)?\b/i.test(label), `quote link label without "book": ${label.trim()}`)
    eq(errors.length, 0, `no page errors ${errors}`)
    eq(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, true, 'no sideways scroll at 1440')
    await page.close()
    console.log('ok 1440px')

    const phone = await browser.newPage({ viewport: { width: 360, height: 800 } })
    await phone.addInitScript(() => { if (window.top === window) localStorage.setItem('cookie-consent', 'declined') })
    const perr = []
    phone.on('pageerror', (e) => perr.push(String(e)))
    await phone.goto(`${base}/sellers`, { waitUntil: 'networkidle' })
    eq(await phone.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, true, 'no sideways scroll at 360')
    const row = phone.locator('.in-tb__rows a').nth(6)
    await row.scrollIntoViewIfNeeded()
    await row.click()
    await phone.locator('dialog[open]').waitFor()
    ok(await phone.locator('dialog[open] #qd-title').isVisible(), 'phone: "not sure of the size" opens the quote dialog')
    eq(perr.length, 0, `no page errors on the phone ${perr}`)
    await phone.close()
    console.log(`ok 360px · ${checks} checks`)
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exit(1) })
