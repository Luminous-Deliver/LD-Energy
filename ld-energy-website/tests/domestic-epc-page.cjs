// /services/domestic-epc, rebuilt 24/10/2026 on the inner-page parts: every price and quote link against lib/site
// figures, the frozen title, the section ids other files link to, the FAQ and schema, Our promise under the prices,
// no em dashes, no page errors and no sideways scroll. Parity:
// Abdul-2 projects/ld-energy-redesign-2026-10/research/domestic-epc-parity-2026-10-24.md
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const base = process.env.BOOKING_TEST_URL || 'http://localhost:3100'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')

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
    await page.goto(`${base}/services/domestic-epc`, { waitUntil: 'networkidle' })
    eq(await page.locator('h1').innerText(), 'Domestic EPC certificates in London', 'H1, sentence case')
    eq(await page.title(), 'Domestic EPC Certificates in London | L&D Energy', 'title unchanged (frozen until 14/12)')
    eq(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://epc.luminousanddeliver.co.uk/services/domestic-epc', 'canonical')
    ok((await page.locator('meta[name="description"]').getAttribute('content')).startsWith('Domestic EPC certificate in London from £65. Elmhurst and Quidos accredited assessor'), 'description unchanged')
    for (const id of ['what-is-epc', 'who-needs-epc', 'epc-process', 'pricing', 'epc-faq', 'book']) eq(await page.locator('#' + id).count(), 1, `#${id} exists`)

    // the title block: every size opens the quote with the EPC and that size
    const rows = page.locator('.sv-tb .in-tb__rows a')
    eq(await rows.count(), 7, 'six sizes and "not sure"')
    for (const [i, id] of ids.entries()) {
      const text = (await rows.nth(i).innerText()).replace(/\s+/g, ' ')
      ok(text.includes(`£${epc[i]}`) && /from/.test(text) === (i === 5), `row ${id}: £${epc[i]} (${text})`)
      eq(await rows.nth(i).getAttribute('href'), `/quote?service=epc&area=${id}&source=domestic-epc&cta=pricing`, `row ${id}: quote link`)
    }
    eq(await rows.nth(6).getAttribute('href'), '/quote?service=epc&area=unknown&source=domestic-epc&cta=pricing', 'not sure: quote link')
    const other = await page.locator('.sv-tb .in-tb__other').innerText()
    for (const s of ['Floor plan from £55', 'from £105', 'Same-day lodgement £15', '£35 extra', 'No travel charges']) ok(other.includes(s), `title block foot: ${s}`)
    eq(await page.locator('.in-hd a[data-enquiry-cta="hero"]').getAttribute('href'), '/quote?service=epc&source=domestic-epc&cta=hero', 'hero quote link')

    // what it costs: the three services and extras, from lib/site
    const costs = (await page.locator('#pricing').innerText()).replace(/\s+/g, ' ')
    for (const [name, from, service] of [['Domestic EPC', 65, 'epc'], ['EPC and floor plan', 105, 'bundle'], ['Floor plan only', 55, 'floor-plan']]) {
      ok(new RegExp(`${name} Guide price from £${from}`).test(costs), `${name} from £${from}`)
      eq(await page.locator(`#pricing a[href="/quote?service=${service}&source=domestic-epc&cta=pricing"]`).count(), 1, `${name}: quote link`)
    }
    ok(costs.includes('Up to £35 less than booking both separately'), 'bundle saving, maxBundleSaving')
    for (const [label, price] of [['Same-day lodgement', '+£15'], ['Next-day visit and lodgement', '+£35'], ['EPC Improvement Plan', '+£35'], ['EPC recommendation report', 'Included'], ['Travel or call-out', 'None']]) {
      ok(new RegExp(label + '[^£]*?' + price.replace(/[+£]/g, (c) => '\\' + c)).test(costs), `extra: ${label} ${price}`)
    }
    ok(costs.includes('from £90') && costs.includes('guidance only, not an EPC'), 'Pre-Assessment alternative, guidance only')
    ok(!/best value|most popular/i.test(costs), 'no favourite service')

    // content carried over
    const what = await page.locator('#what-is-epc').innerText()
    for (const s of ['Estimated cost and savings for each recommendation', 'CO₂ emissions estimate', 'Reassessing after improvements when you want an updated rating']) ok(what.includes(s), `what it is: ${s}`)
    eq(await page.locator('.sv-scale__bars li').count(), 7, 'A to G scale')
    const proc = await page.locator('#epc-process').innerText()
    eq(await page.locator('.sv-steps li').count(), 5, 'five process steps')
    eq(await page.locator('.sv-rec__list li').count(), 13, 'thirteen items recorded')
    ok(proc.includes('Elmhurst’s government-approved RdSAP software') && proc.includes('Mon–Sun 8am–8pm'), 'process wording kept')
    for (const href of ['/sellers', '/landlords', '/estate-agents']) eq(await page.locator(`#who-needs-epc a[href="${href}"]`).count() >= 1, true, `who it's for links ${href}`)

    // promise directly under the prices, FAQ, read next, ending
    ok(await page.evaluate(() => document.querySelector('#pricing').nextElementSibling?.classList.contains('op')), 'our promise directly under the prices')
    eq(await page.locator('#epc-faq details').count(), 7, 'seven questions')
    eq(await page.locator('#epc-faq details[open]').count(), 1, 'first question open')
    for (const href of ['/services/floor-plans', '/services/epc-pre-assessment', '/services/epc-improvement-plan', '/pricing']) eq(await page.locator(`.in-rn a[href="${href}"]`).count(), 1, `read next: ${href}`)
    eq(await page.locator('#book a[data-enquiry-cta="bottom"]').getAttribute('href'), '/quote?service=epc&source=domestic-epc&cta=bottom', 'ending quote link')

    const blocks = await page.evaluate(() => [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => [JSON.parse(s.textContent)].flat()))
    const types = blocks.map((x) => x['@type'])
    ok(['Service', 'FAQPage', 'BreadcrumbList'].every((t) => types.includes(t)), `schema ${types}`)
    const svc = blocks.find((b) => b['@type'] === 'Service')
    eq(svc.hasOfferCatalog.itemListElement.map((o) => o.priceSpecification.minPrice).join(','), epc.join(','), 'schema minPrice per band')
    ok(!JSON.stringify(svc).includes('"price"'), 'schema uses minPrice, never price')
    eq(blocks.find((b) => b['@type'] === 'FAQPage').mainEntity.length, 7, 'FAQPage matches the seven questions')
    ok(!(await page.locator('main').innerText()).includes('—'), 'no em dashes')
    for (const l of await page.locator('main a[href^="/quote"]').allInnerTexts()) ok(!/\bbook(?:ing)?\b/i.test(l), `quote link label without "book": ${l.trim()}`)
    eq(errors.length, 0, `no page errors ${errors}`)
    eq(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, true, 'no sideways scroll at 1440')
    await page.close()

    for (const w of [1024, 390, 360]) {
      const p = await browser.newPage({ viewport: { width: w, height: 800 } })
      await p.addInitScript(() => { if (window.top === window) localStorage.setItem('cookie-consent', 'declined') })
      await p.goto(`${base}/services/domestic-epc`, { waitUntil: 'networkidle' })
      eq(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, true, `no sideways scroll at ${w}`)
      if (w === 360) {
        const small = await p.evaluate(() => [...document.querySelectorAll('main a, main summary, main button')].filter((e) => e.checkVisibility() && !e.closest('.in-crumbs, p, dt, li.sv-way, .in-faq__a') && e.getBoundingClientRect().height < 44).map((e) => e.textContent.trim().slice(0, 30)))
        eq(small.length, 0, `tap targets at least 44 px: ${small}`)
        // a row tap opens the quote dialog over the page
        await p.locator('.sv-tb .in-tb__rows a').nth(2).click()
        await p.locator('dialog[open]').waitFor()
        ok(await p.locator('dialog[open] #qd-title').isVisible(), 'phone: a price row opens the quote')
      }
      await p.close()
    }
    console.log(`ok /services/domestic-epc · ${checks} checks`)
  } finally { await browser.close() }
})().catch((error) => { console.error(error); process.exit(1) })
