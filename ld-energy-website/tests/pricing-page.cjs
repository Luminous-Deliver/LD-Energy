// /pricing, redesigned 24/10/2026: every price for every size and service against Abdul's 22/10 spec, each price's
// quote link, the phone tabs and their roll, the extras and their prices, the content carried over from the old page
// (parity: projects/ld-energy-redesign-2026-10/research/pricing-page-parity-2026-10-24.md) and the anchors other pages
// link to. Replaces the /pricing block of tests/pricing-2026-10-22.cjs.
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const base = process.env.BOOKING_TEST_URL || 'http://localhost:3100'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')

const bands = ['Up to 40 m²', 'Over 40–55 m²', 'Over 55–75 m²', 'Over 75–95 m²', 'Over 95–115 m²', 'Over 115 m²']
const ids = ['up-to-40', '40-55', '55-75', '75-95', '95-115', 'over-115']
const captions = ['Studios and compact flats', '1-bedroom flats', '2-bedroom flats and small homes', '2–3-bedroom homes', '3–4-bedroom houses', 'Large homes, 4+ bedrooms']
// Abdul's 22/10/2026 spec §2, column by column
const services = [
  { id: 'epc', label: 'Domestic EPC', tab: 'EPC', prices: [65, 75, 85, 95, 105, 120] },
  { id: 'floor-plan', label: 'Floor plan', tab: 'Floor plan', prices: [55, 65, 75, 90, 105, 125] },
  { id: 'bundle', label: 'EPC + floor plan', tab: 'EPC + plan', prices: [105, 120, 135, 155, 175, 210], save: [15, 20, 25, 30, 35] },
  { id: 'pre-assessment', label: 'Pre-Assessment', tab: 'Pre-Assessment', prices: [90, 100, 110, 120, 130, 145] },
]

;(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  let checks = 0
  const ok = (value, message) => { assert.ok(value, message); checks++ }
  const eq = (actual, expected, message) => { assert.equal(actual, expected, message); checks++ }
  try {
    // Desktop: the whole table, the extras, the carried-over content
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await page.addInitScript(() => { if (window.top === window) localStorage.setItem('cookie-consent', 'declined') })
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e)))
    await page.goto(`${base}/pricing`, { waitUntil: 'networkidle' })
    eq(await page.locator('h1').innerText(), 'EPC and floor plan prices', 'H1')
    eq(await page.title(), 'EPC Prices London | From £65 | L&D Energy', 'title unchanged (frozen until 14/12)')
    for (const id of ['pricing-table', 'whats-included', 'pricing-faq', 'extras', 'portfolio', 'book']) ok(await page.locator('#' + id).count() === 1, `#${id} exists (linked from lib/faq.ts and On this page)`)

    const table = page.locator('#pricing-table table')
    eq(await table.locator('thead th:visible').count(), 5, 'area + four service columns on desktop')
    const rows = table.locator('tbody tr')
    eq(await rows.count(), 6, 'six bands')
    for (const [i, band] of bands.entries()) {
      const row = rows.nth(i)
      const head = await row.locator('th').innerText()
      ok(head.includes(band) && head.includes(captions[i]), `${band}: label and muted caption`)
      const cells = row.locator('td.pm__svc')
      for (const [j, s] of services.entries()) {
        const cell = cells.nth(j)
        const text = (await cell.innerText()).replace(/\s+/g, ' ').trim()
        const top = i === 5
        ok(text.includes(`£${s.prices[i]}`) && /from/.test(text) === top, `${s.label} ${band}: £${s.prices[i]}${top ? ', from' : ''} (${text})`)
        if (s.save) ok(top ? !/save/.test(text) : text.includes(`save £${s.save[i]}`), `${s.label} ${band}: saving ${top ? 'not shown on the top band' : s.save[i]}`)
        eq(await cell.locator('a').getAttribute('href'), `/quote?service=${s.id}&area=${ids[i]}&source=pricing&cta=pricing`, `${s.label} ${band}: quote link`)
      }
    }
    ok(await page.getByText('Larger or unusually complex properties are quoted individually.', { exact: false }).first().isVisible(), 'Abdul\'s guide-price sentence (spec §11)')
    ok(await page.getByText('Bedrooms are shown only as a rough guide', { exact: false }).isVisible(), 'bedrooms as a rough guide')
    ok(/up to £35 on one visit/.test(await page.locator('.pr-notes').innerText()), 'largest bundle saving')
    // 24/10: Abdul kept "Best value" on the bundle (a true saving, shown under each price); "most popular" needs booking data
    ok(!(await page.locator('#pricing-table').innerText()).match(/most popular/i), 'no "most popular" claim')
    ok(JSON.stringify(await page.locator('.pm__t thead .pm__tag').evaluateAll(t => t.map(e => [e.closest('th').dataset.s, e.textContent]))) === '[["bundle","Best value"]]', '"Best value" on the bundle column only')

    // Extras: each stated with its price, nothing to tick
    const extras = (await page.locator('#extras').innerText()).replace(/\s+/g, ' ')
    for (const [label, price] of [['Same-day lodgement', '+£15'], ['Next-day visit and lodgement', '+£35'], ['EPC Improvement Plan', '+£35'],
      ['Lodging a held Pre-Assessment later', '+£35'], ['A return visit when we couldn\'t get in', '£25'], ['Travel or call-out', 'None']]) {
      ok(new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^£]*?' + price.replace(/[+£]/g, (c) => '\\' + c)).test(extras), `extra: ${label} ${price}`)
    }
    eq(await page.locator('#extras input').count(), 0, 'no checkboxes in the extras')
    ok(/Domestic EPC, Over 55–75 m² £85 Same-day lodgement \+£15 Guide total £100/.test(extras), 'worked example adds up')
    ok(/Mon–Sun, 8am–8pm/.test(extras), 'faster options: standard hours')

    // Portfolio: Abdul's approved wording, word for word
    ok((await page.locator('#portfolio').innerText()).includes('Three to five homes: £5 off each EPC. Six or more: £10 off each. Flats in the same building on the same day: £15 off each after the first. That replaces the other discount, it doesn\'t add to it. Never less than £55 an EPC. Floor plans and faster options stay full price.'), 'portfolio rates, approved wording')

    // Included / not included, carried over item for item
    const inc = await page.locator('#whats-included').innerText()
    for (const item of ['On-site assessment by an Elmhurst and Quidos accredited DEA', 'Official lodgement on the UK Government EPC Register',
      'Certificate link sent once lodged on the government register', 'Standard software-generated EPC recommendation report, where applicable',
      'No travel or call-out charges', 'Optional personalised EPC Improvement Plan and full Elmhurst Energy Report, £35 extra',
      'Re-visits due to access issues, charged at £25 per visit', 'For properties outside our service radius, contact us for a tailored quote.']) ok(inc.includes(item), `included: ${item}`)

    // Promise, FAQ (all nine, first open), schema
    ok(await page.locator('.op').getByText('If we’re late, you pay less.').isVisible(), 'our promise shown')
    ok(await page.evaluate(() => document.querySelector('#pricing-table').nextElementSibling?.classList.contains('op')), 'our promise directly under the prices (Abdul 24/10)')
    eq(await page.locator('#pricing-faq details').count(), 9, 'nine pricing questions')
    eq(await page.locator('#pricing-faq details[open]').count(), 1, 'first question open')
    const types = await page.evaluate(() => [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => [JSON.parse(s.textContent)].flat()).map((x) => x['@type']))
    ok(['ItemList', 'BreadcrumbList', 'FAQPage'].every((t) => types.includes(t)), `schema ${types}`)
    ok(!(await page.locator('main').innerText()).includes('—'), 'no em dashes in the copy')
    eq(errors.length, 0, `no page errors ${errors}`)
    eq(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, true, 'no sideways scroll at 1440')
    await page.close()
    console.log('ok 1440px')

    // Phone: one service at a time, the row opens the quote, the price rolls on a tab change
    const phone = await browser.newPage({ viewport: { width: 360, height: 800 } })
    await phone.addInitScript(() => { if (window.top === window) localStorage.setItem('cookie-consent', 'declined') })
    await phone.goto(`${base}/pricing`, { waitUntil: 'networkidle' })
    const t = phone.locator('#pricing-table table')
    eq(await t.locator('thead th:visible').count(), 2, 'phone: area + one price column')
    eq(await phone.getByRole('radio', { name: 'EPC', exact: true }).getAttribute('aria-checked'), 'true', 'phone: EPC first')
    const shown = () => t.locator('td.pm__one .sr-only').allInnerTexts()
    eq((await shown()).join(' '), services[0].prices.map((p) => `£${p}`).join(' '), 'phone: EPC prices')
    for (const s of services.slice(1)) {
      await phone.getByRole('radio', { name: s.tab, exact: true }).click()
      eq((await shown()).join(' '), s.prices.map((p) => `£${p}`).join(' '), `phone: ${s.label} prices`)
      eq(await t.locator('td.pm__one a').first().getAttribute('href'), `/quote?service=${s.id}&area=up-to-40&source=pricing&cta=pricing`, `phone: ${s.label} link`)
      ok((await phone.locator('.pm__sub').innerText()).startsWith(s.label), `phone: ${s.label} named under the tabs`)
    }
    // the roll: a digit column is mid-slide straight after a change
    await phone.getByRole('radio', { name: 'EPC', exact: true }).click()
    const moving = await phone.evaluate(() => [...document.querySelectorAll('td.pm__one .odo__s')].some((s) => getComputedStyle(s).transitionDuration !== '0s' && s.getAnimations().length > 0))
    ok(moving, 'phone: the price rolls on a tab change')
    await t.locator('tbody tr').nth(2).scrollIntoViewIfNeeded()
    const row = await t.locator('tbody tr').nth(2).boundingBox()
    await phone.mouse.click(row.x + 20, row.y + row.height / 2)
    // every /quote link opens the quote dialog over the page (QuoteDialog, Abdul 23/10), started from the link's choices
    // (the links' service and size are checked above; on phones the dialog's first step is "Which best describes you?")
    await phone.locator('dialog[open]').waitFor()
    ok(await phone.locator('dialog[open] #qd-title').isVisible(), 'phone: tapping the row label opens the quote')
    await phone.goto(`${base}/pricing`, { waitUntil: 'networkidle' })
    eq(await phone.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, true, 'no sideways scroll at 360')
    await phone.close()
    console.log(`ok 360px · ${checks} checks`)
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exit(1) })
