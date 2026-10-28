// /estate-agents, redesigned 24/10/2026 on the /landlords template: every price and quote link against lib/site.ts,
// the portfolio rates word for word, the old page's facts carried over (parity: Abdul-2
// projects/ld-energy-redesign-2026-10/research/estate-agents-parity-2026-10-24.md), the frozen title, ids, FAQ, schema,
// the quote dialog and no sideways scroll.
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const base = process.env.BOOKING_TEST_URL || 'http://localhost:3100'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')

const norm = (s) => s.toLowerCase().replace(/[’']/g, "'")
const ids = ['up-to-40', '40-55', '55-75', '75-95', '95-115', 'over-115']
const epc = [65, 75, 85, 95, 105, 120]
const { portfolioRatesText: rates } = require('../lib/site') // pinned word for word in portfolio-rates.test.cjs

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
    await page.goto(`${base}/estate-agents`, { waitUntil: 'networkidle' })
    eq(await page.locator('h1').innerText(), 'Your EPC partner for new instructions', 'H1, sentence case')
    eq(await page.title(), 'EPC Provider for Estate & Letting Agents London | L&D Energy', 'title unchanged (frozen until 14/12)')
    eq(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://epc.luminousanddeliver.co.uk/estate-agents', 'canonical')
    ok((await page.locator('meta[name="description"]').getAttribute('content')).startsWith('Reliable EPC and floor plan partner for London estate and letting agents.'), 'description unchanged')
    for (const id of ['why-agents', 'how-it-works', 'portfolio', 'agent-faq', 'book']) eq(await page.locator('#' + id).count(), 1, `#${id} exists`)
    eq(await page.locator('.in-crumbs [aria-current="page"]').innerText(), 'Agents', 'one name: Agents (decision 23/10)')

    // Title-block price list: every band, every link
    const rows = page.locator('.in-tb__rows a')
    eq(await rows.count(), 7, 'six bands and the list row')
    for (const [i, id] of ids.entries()) {
      const text = (await rows.nth(i).innerText()).replace(/\s+/g, ' ')
      ok(text.includes(`£${epc[i]}`) && /from/.test(text) === (i === 5), `band ${id}: £${epc[i]}`)
      eq(await rows.nth(i).getAttribute('href'), `/quote?service=epc&area=${id}&source=estate-agents&cta=pricing`, `band ${id}: quote link`)
    }
    eq(await rows.nth(6).getAttribute('href'), '/quote?service=bulk&source=estate-agents&cta=pricing', 'three homes or more: bulk quote')
    const foot = (await page.locator('.in-tb__other').innerText()).replace(/\s+/g, ' ')
    ok(/Floor plan from £65/.test(foot) && /from £115/.test(foot) && /£15 extra/.test(foot) && /£35 extra/.test(foot), `price list foot (${foot})`)
    eq(await page.locator('.in-hd__acts a.ld-btn').getAttribute('href'), '/quote?service=epc&source=estate-agents&cta=hero', 'hero quote link')
    ok((await page.locator('.in-hd__acts a.in-wa').getAttribute('href')).startsWith('https://wa.me/447492575396?text='), 'hero WhatsApp a list')

    // The old page's facts
    const main = (await page.locator('main').innerText()).replace(/\s+/g, ' ')
    ok((await page.locator('#portfolio').innerText()).includes(rates), 'portfolio rates, approved wording (#portfolio)')
    ok((await page.locator('#why-agents').innerText()).includes(rates), 'portfolio rates, approved wording (#why-agents)')
    for (const fact of ['Taking on new agencies', 'We currently have capacity for new estate and letting agency clients across London',
      'Agree a rate card once', 'Appointments 7 days a week, 8am–8pm', 'One appointment, both listing essentials',
      'A direct line, not a call centre', 'so your negotiators stay off the phone', 'ready to attach to the listing',
      'No portals, no forms, no friction', 'Address, property size, and the occupier’s contact details', 'Mon–Sun 8am–8pm',
      '45 minutes to 2 hours on-site', 'or the same day for urgent listings', 'Everything a listing needs',
      'Professional floor plan, discounted with an EPC', 'High-resolution files sized for Rightmove and Zoopla',
      'Same-day lodgement (+£15) or a next-day visit (+£35) for urgent instructions', 'One supplier for all 32 boroughs, no travel charges',
      'Property photography', 'Coming soon', 'up to £35 less than booking them separately', 'Not to exact scale']) ok(norm(main).includes(norm(fact)), `fact: ${fact}`)
    for (const href of ['/services/domestic-epc', '/services/floor-plans', '/pricing']) ok(await page.locator(`main a[href="${href}"]`).count() > 0, `links ${href}`)
    eq(await page.locator('.ea-soon a').count(), 0, 'photography: no link, no CTA')

    // Promise, FAQ, Read next, ending
    ok(await page.locator('.op').getByText('If we’re late, you pay less.').isVisible(), 'our promise shown')
    eq(await page.locator('#agent-faq details').count(), 6, 'six agent questions')
    eq(await page.locator('#agent-faq details[open]').count(), 1, 'first question open')
    for (const href of ['/landlords', '/sellers', '/blog/mees-regulations-2026', '/pricing']) eq(await page.locator(`.in-rn a[href="${href}"]`).count(), 1, `read next: ${href}`)
    eq(await page.locator('#book a.ld-btn').getAttribute('href'), '/quote?service=bulk&source=estate-agents&cta=bottom', 'ending: agency (bulk) quote')
    ok(/Add a reliable EPC supplier to your panel/.test(await page.locator('#book').innerText()), 'ending heading carried over')

    // Schema
    const schema = await page.evaluate(() => [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => [JSON.parse(s.textContent)].flat()))
    const types = schema.map((x) => x['@type'])
    ok(['BreadcrumbList', 'Service', 'FAQPage'].every((t) => types.includes(t)), `schema ${types}`)
    const svc = schema.find((x) => x['@type'] === 'Service' && x.url?.endsWith('/estate-agents'))
    eq(svc.offers.priceSpecification.minPrice, 65, 'Service minPrice')
    ok(!('price' in svc.offers.priceSpecification), 'no fixed price in schema')
    eq(svc.audience.name, 'Estate agents and letting agents', 'Service audience kept')
    eq(schema.find((x) => x['@type'] === 'FAQPage').mainEntity.length, 6, 'FAQPage has six questions')
    eq(schema.find((x) => x['@type'] === 'BreadcrumbList').itemListElement[1].name, 'Agents', 'breadcrumb schema: Agents')

    ok(!main.includes('—'), 'no em dashes in the copy')
    for (const label of await page.locator('a[href*="/quote"]').allTextContents()) ok(!/\bbook(?:ing)?\b/i.test(label), `quote link label without "book": ${label.trim()}`)
    eq(errors.length, 0, `no page errors ${errors}`)
    eq(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, true, 'no sideways scroll at 1440')
    await page.close()
    console.log('ok 1440px')

    // Phone: no sideways scroll, the price row opens the quote dialog
    const phone = await browser.newPage({ viewport: { width: 360, height: 800 } })
    await phone.addInitScript(() => { if (window.top === window) localStorage.setItem('cookie-consent', 'declined') })
    const perr = []
    phone.on('pageerror', (e) => perr.push(String(e)))
    await phone.goto(`${base}/estate-agents`, { waitUntil: 'networkidle' })
    eq(await phone.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, true, 'no sideways scroll at 360')
    const small = await phone.evaluate(() => [...document.querySelectorAll('main a, main button, main summary')].filter((el) => {
      const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.height < 24 && !el.closest('p, li p, .in-faq__a, .in-crumbs, figcaption')
    }).map((el) => el.textContent.trim().slice(0, 30)))
    eq(small.length, 0, `stand-alone tap targets are not tiny (${small})`)
    const row = phone.locator('.in-tb__rows a').nth(2)
    await row.scrollIntoViewIfNeeded()
    await row.click()
    await phone.locator('dialog[open]').waitFor()
    ok(await phone.locator('dialog[open] #qd-title').isVisible(), 'phone: a price row opens the quote dialog')
    eq(perr.length, 0, `no page errors on the phone ${perr}`)
    await phone.close()
    console.log(`ok 360px · ${checks} checks`)
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exit(1) })
