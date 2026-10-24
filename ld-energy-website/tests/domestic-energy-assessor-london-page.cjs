// /domestic-energy-assessor-london, redesigned 24/10/2026: the register card and both scheme checks, every price and
// quote link against lib/site.ts, the visits wording (no "always Abdul"), no home address, the section ids, the FAQ and
// its schema, the promise, no em dashes, no sideways scroll.
// (parity: projects/ld-energy-redesign-2026-10/research/domestic-energy-assessor-london-parity-2026-10-24.md)
//
//   node --require ./tests/register.cjs tests/domestic-energy-assessor-london-page.cjs
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const { site, pricing, priceFrom, insurance, SAME_DAY_LODGEMENT_SURCHARGE, NEXT_DAY_VISIT_SURCHARGE } = require('../lib/site.ts')
const base = process.env.BOOKING_TEST_URL || 'http://localhost:3100'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')

const PATH = '/domestic-energy-assessor-london'
const norm = (s) => s.replace(/\s+/g, ' ').trim()

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
    await page.goto(`${base}${PATH}`, { waitUntil: 'networkidle' })
    eq(await page.locator('h1').innerText(), 'Your local domestic energy assessor in London', 'H1, sentence case')
    eq(await page.title(), 'Domestic Energy Assessor in London | L&D Energy', 'title unchanged (frozen until 14/12)')
    for (const id of ['what-is-a-dea', 'what-a-dea-does', 'accreditation', 'why-local', 'faq', 'book']) eq(await page.locator('#' + id).count(), 1, `#${id} exists`)
    const main = norm(await page.locator('main').innerText())
    ok(main.includes(`guide prices from £${priceFrom.epc} and next-day appointments available`), 'hero: from price')

    // The register card: both schemes, their numbers and GOV.UK checks
    const reg = page.locator('.da-reg')
    for (const a of site.assessor.accreditations) {
      ok((await reg.innerText()).includes(a.number), `register card: ${a.short} ${a.number}`)
      const check = reg.locator(`a[aria-label*="${a.number}"]`)
      ok((await check.getAttribute('href')).startsWith('https://getting-new-energy-certificate.service.gov.uk/find-an-assessor/search-by-name?name='), `${a.short}: GOV.UK register search`)
      eq(await check.getAttribute('target'), '_blank', `${a.short}: opens in a new tab`)
    }
    eq(await page.locator(`.in-by a[href="${site.assessor.verifyUrl}"]`).count(), 1, 'accreditation line links the register')
    ok(main.includes(insurance.full), 'insurance sentence from lib/site.ts')
    ok(main.includes('sometimes sends a trusted, experienced colleague in his place, and lets you know in advance'), 'visits wording as /about (23/10)')
    ok(!/personally carries out|not handed to a subcontractor/i.test(main), 'no "always Abdul" claim')

    // No home address: locality and outward code only, nothing street level, in the copy or the schema
    const html = await page.content()
    ok(!/streetAddress/.test(html), 'no streetAddress anywhere')
    ok(!/\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/.test(main), 'no full postcode in the copy')
    ok(main.includes(`${site.address.locality} (${site.address.postalCode})`), 'based in Stratford (E15)')

    // The price list: every band against lib/site.ts, each row opens the quote with its size
    const rows = page.locator('.da-tb .in-tb__rows a')
    eq(await rows.count(), pricing.length + 1, 'six bands and Not sure')
    for (const [i, b] of pricing.entries()) {
      const row = rows.nth(i)
      const text = norm(await row.innerText())
      ok(text.includes(norm(b.areaLabel)) && text.includes(norm(b.typicalLabel)) && text.includes(`£${b.epc}`), `${b.areaLabel}: £${b.epc} (${text})`)
      eq(/from/.test(text), !!b.startingPrice, `${b.areaLabel}: "from" only on the top band`)
      eq(await row.getAttribute('href'), `/quote?service=epc&area=${b.id}&source=assessor&cta=pricing`, `${b.areaLabel}: quote link`)
    }
    eq(await rows.nth(pricing.length).getAttribute('href'), '/quote?service=epc&area=unknown&source=assessor&cta=pricing', 'Not sure: quote link')
    const foot = norm(await page.locator('.da-tb .in-tb__other').innerText())
    for (const p of [priceFrom.floorPlan, priceFrom.bundle, SAME_DAY_LODGEMENT_SURCHARGE, NEXT_DAY_VISIT_SURCHARGE]) ok(foot.includes(`£${p}`), `price list foot: £${p}`)
    ok(main.includes(`72-hour standard lodgement, same-day lodgement for £${SAME_DAY_LODGEMENT_SURCHARGE}, or a next-day visit and lodgement for £${NEXT_DAY_VISIT_SURCHARGE}`), 'fast and flexible: surcharges')

    // Quote links: attribution, and no "book" in a quote label
    const quotes = await page.locator('main a[href*="/quote"]').evaluateAll((as) => as.map((a) => ({ href: a.getAttribute('href'), label: a.textContent.trim() })))
    for (const cta of ['hero', 'pricing', 'bottom']) ok(quotes.some((x) => x.href === `/quote?service=epc&source=assessor&cta=${cta}`), `${cta} quote link`)
    for (const x of quotes) ok(!/\bbook(?:ing)?\b/i.test(x.label), `no "book" in "${x.label}"`)

    // The duties, the reasons, the promise, the questions
    eq(await page.locator('.da-steps li').count(), 4, 'four duties')
    eq(await page.locator('.da-why li').count(), 4, 'four reasons')
    ok(await page.evaluate(() => document.querySelector('.op')?.nextElementSibling?.id === 'faq'), 'our promise straight before the questions (as /landlords)')
    eq(await page.locator('#faq details').count(), 6, 'six questions')
    eq(await page.locator('#faq details[open]').count(), 1, 'first question open')
    const shown = await page.locator('#faq details').evaluateAll((ds) => ds.map((d) => [d.querySelector('summary').textContent, d.querySelector('.in-faq__a').textContent]))
    ok(shown[1][1].includes(site.phone), 'phone number from lib/site.ts')
    ok(shown[3][1].includes(site.assessor.accreditations[0].number) && shown[3][1].includes(site.assessor.accreditations[1].number), 'accreditation numbers from lib/site.ts')

    // Schema: BreadcrumbList, FAQPage = the visible questions, Service with minPrice (never price)
    const blocks = await page.evaluate(() => [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => [JSON.parse(s.textContent)].flat()))
    const types = blocks.map((b) => b['@type'])
    ok(['BreadcrumbList', 'FAQPage', 'Service'].every((t) => types.includes(t)), `schema ${types}`)
    eq(blocks.find((b) => b['@type'] === 'FAQPage').mainEntity.map((e) => [e.name, e.acceptedAnswer.text]), shown.map(([q, a]) => [norm(q), a]), 'FAQPage matches the visible questions')
    const offer = blocks.find((b) => b['@type'] === 'Service').offers
    eq(offer.priceSpecification.minPrice, pricing[0].epc, 'Service offer: minPrice')
    ok(!('price' in offer) && !('price' in offer.priceSpecification), 'no fixed price in the schema')

    ok(!(await page.locator('main').innerText()).includes('—'), 'no em dashes in the copy')
    eq(errors, [], 'no page errors')
    ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, 'no sideways scroll at 1440')

    // A price row opens the quote dialog
    await rows.nth(2).click()
    await page.locator('dialog[open]').waitFor()
    ok(await page.locator('dialog[open] #qd-title').isVisible(), 'a price row opens the quote dialog')
    await page.close()
    console.log('ok 1440px')

    const phone = await browser.newPage({ viewport: { width: 360, height: 800 } })
    await phone.addInitScript(() => { if (window.top === window) localStorage.setItem('cookie-consent', 'declined') })
    await phone.goto(`${base}${PATH}`, { waitUntil: 'networkidle' })
    ok(await phone.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, 'no sideways scroll at 360')
    const order = await phone.evaluate(() => ['.in-hd__copy', '.da-reg', '.da-tb', '.in-otp'].map((s) => Math.round(document.querySelector(s).getBoundingClientRect().top)))
    ok(order.every((y, i) => i === 0 || y > order[i - 1]), `phone order: copy, register card, prices, On this page (${order})`)
    const small = await phone.locator('.da-chk, .da-tb .in-tb__rows a, #faq summary').evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().height < 44).length)
    eq(small, 0, 'tap targets at least 44 px')
    await phone.close()
    console.log(`ok 360px · ${checks} checks`)
  } finally { await browser.close() }
})().catch((error) => { console.error(error); process.exit(1) })
