// The booking form's v7 drafts in the browser (approved 22/10/2026), on the homepage and /contact: numbered questions,
// the property type (required, error and focus), What you get and What's included in the price panel, a portfolio
// skipping step 2, the visit-date rules, the WhatsApp line built from the choices, the confirmation's What you
// receive, and the homepage's phone quote bar in place of the dock. Sends are intercepted; nothing leaves the page.
//   BOOKING_TEST_URL=http://localhost:3104 node --require ./tests/register.cjs tests/booking-v7.cjs
const assert = require('node:assert/strict')
const { chromium } = require('playwright')
const { priceFrom, pricing } = require('../lib/site.ts')
const { londonYmd } = require('../lib/booking-options.ts')

const base = process.env.BOOKING_TEST_URL || 'http://localhost:3104'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')

;(async () => {
  let passed = 0
  const ok = (cond, msg) => { assert.ok(cond, msg); passed++ }
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    await context.addInitScript(() => {
      try { localStorage.setItem('cookie-consent', 'declined') } catch {}
      window.turnstile = { render: (el, o) => { setTimeout(() => o.callback('test-token'), 20); return 'mock' }, reset: () => {}, remove: () => {}, getResponse: () => 'test-token' }
    })
    const payloads = []
    await context.route('**/api/contact', (route) => { payloads.push(route.request().postDataJSON()); return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, delivered: true, confirmationSent: true }) }) })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.goto(base + '/', { waitUntil: 'networkidle' })
    const form = page.locator('#pricing form')
    const choose = (name) => form.getByRole('radio', { name, exact: true }).check()
    const go = () => form.getByRole('button', { name: /^Continue/ }).click()

    // ------------------------------------------------------------- step 1: four numbered questions
    const legends = await form.locator('legend').allInnerTexts()
    ok(JSON.stringify(legends.map((l) => l.replace(/\s+/g, ' ').trim())) === JSON.stringify(['1Which best describes you?', '2Which service?', '3What type of property is it?', '4How big is the property?']), `numbered questions (${legends})`)
    ok(await form.locator('#dwellingType-hint').innerText() === 'It helps us confirm your exact price.', 'property type hint')
    for (const [v, d] of [['Flat', 'On one floor'], ['Maisonette', 'A flat on two floors or more'], ['House', 'Terraced, semi or detached'], ['Bungalow', 'A house on one floor']]) {
      ok((await form.locator(`label:has(input[name="dwellingType"][value="${v}"])`).innerText()).includes(d), `${v}: ${d}`)
    }
    ok((await form.locator('.bf__get li').allInnerTexts()).length === 3, 'What you get: three lines under the price')
    ok(await form.locator('details.bf__incl summary').innerText() === 'What’s included in the price', 'What’s included in the price, inside the panel')
    await form.locator('details.bf__incl summary').click()
    ok((await form.locator('details.bf__incl li').count()) === 4, 'the disclosure opens to four lines')
    ok((await form.locator('.bf__foot').innerText()).startsWith('Questions first? Message us on WhatsApp, and what you’ve chosen so far comes with it.'), 'the WhatsApp line')

    // the property type is required: Continue lands focus on it with its error
    await choose('Homeowner')
    await choose('Over 55–75 m², 2-bedroom flats and small homes, £' + pricing[2].epc)
    await go()
    await page.waitForFunction(() => document.activeElement?.name === 'dwellingType')
    ok(await form.locator('#dwellingType-error').innerText() === 'Please tell us the property type', 'property type error, focus on it')
    await choose('Maisonette')
    const wa = decodeURIComponent(await form.locator('.bf__foot a').getAttribute('href'))
    ok(wa.includes("Hi, I'd like a quote for an EPC.\nFull address:\nPostcode:\nService: Domestic EPC\nProperty type: Maisonette\nFloor area: Over 55–75 m²\nGuide price shown: £" + pricing[2].epc), `WhatsApp carries the choices (${wa})`)
    await go()
    await page.waitForFunction(() => document.activeElement?.textContent === 'Timing and access')
    ok(await form.locator('.bf__count').textContent() === 'Step 2 of 3', 'three steps for one property')
    ok((await form.locator('[data-estimate-summary]').innerText()).includes('Domestic EPC · Maisonette · Homeowner'), 'summary names the property type')
    ok(await form.locator('legend', { hasText: 'How quickly do you need the certificate?' }).count() === 1, 'speed question in the prototype’s words')

    // ------------------------------------------------------------- step 2: visit-date rules
    const date = form.locator('#preferredDate')
    ok(await date.getAttribute('min') === londonYmd(0), 'no date before today can be picked')
    await date.fill('2020-01-01')
    ok(await form.locator('#preferredDate-note').innerText() === 'That date has passed. Choose today or a later date.', 'a past date is flagged at once')
    await go()
    await page.waitForTimeout(300)
    ok(await form.locator('.bf__count').textContent() === 'Step 2 of 3', 'a past date blocks Continue')
    await date.fill(londonYmd(0))
    ok((await form.locator('#preferredDate-note').innerText()).startsWith('A visit today depends on availability'), 'today’s note')
    await date.fill('')
    await form.getByRole('radio', { name: /^Next-day visit and lodgement/ }).check()
    ok(await date.inputValue() === londonYmd(1), 'a next-day visit fills in tomorrow')
    ok((await form.locator('#preferredDate-note').innerText()).startsWith('A visit tomorrow depends on availability'), 'tomorrow’s note')
    await date.fill(londonYmd(4))
    ok((await form.locator('#preferredDate-note').innerText()).startsWith('A next-day visit means tomorrow'), 'next-day with another date says so')
    await date.fill(londonYmd(1))
    await go()
    await page.waitForFunction(() => document.activeElement?.textContent === 'Your details')
    ok(await form.locator('.bf__reply').innerText() === 'Same working-day reply, with your exact price and available times.', 'reply line under Send')

    // ------------------------------------------------------------- send: the confirmation lists what arrives
    await form.locator('#name').fill('Test Customer')
    await form.locator('#phone').fill('07000000000')
    await form.locator('#email').fill('test@example.invalid')
    await form.locator('#address').fill('1 Test Road')
    await form.locator('#postcode').fill('E15 1AA')
    await form.locator('#consent').check()
    await form.getByRole('button', { name: 'Send my quote request' }).click()
    const sent = page.locator('#pricing .bf__sent')
    await sent.waitFor()
    const sentText = await sent.textContent()
    ok(payloads.at(-1).dwellingType === 'Maisonette' && payloads.at(-1).preferredDate === londonYmd(1), 'the property type and date are sent')
    for (const t of ['Request sent. Thanks, Test.', 'Before the visit, make sure every room', 'Your EPC, lodged on the official GOV.UK EPC Register', 'A certificate valid for 10 years', 'Property type', 'Maisonette', 'Next-day visit and lodgement', 'Need it sooner? Message us on WhatsApp']) ok(sentText.includes(t), `sent screen: ${t}`)
    await page.getByRole('button', { name: 'Send another request', exact: true }).click()

    // ------------------------------------------------------------- a portfolio skips step 2
    await choose('Agency / portfolio enquiry')
    ok(await form.locator('input[name="dwellingType"]').count() === 0, 'no property type on a portfolio')
    await choose('Letting agent / firm')
    await go()
    await page.waitForFunction(() => document.activeElement?.textContent === 'Your details')
    ok(await form.locator('.bf__count').textContent() === 'Step 2 of 2', 'a portfolio: straight to details, step 2 of 2')
    ok(await form.locator('#propertyCount').count() === 1 && await form.locator('#notes').count() === 1, 'its count and notes are on the details step')
    await form.getByRole('button', { name: 'Back', exact: true }).click()
    await page.waitForFunction(() => document.activeElement?.textContent === 'Your guide price')
    ok(await form.locator('.bf__count').textContent() === 'Step 1 of 2', 'Back returns to step 1')
    ok(errors.length === 0, `no page errors (${errors})`)
    await context.close()

    // ------------------------------------------------------------- the same form on /contact gets the same questions
    const c = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await c.goto(base + '/contact', { waitUntil: 'networkidle' })
    ok(await c.locator('form input[name="dwellingType"]').count() === 4, '/contact asks the property type too')
    await c.close()

    // ------------------------------------------------------------- homepage phones: the prototype's quote bar, not the dock
    const ph = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await ph.goto(base + '/', { waitUntil: 'networkidle' })
    await ph.waitForFunction(() => !document.querySelector('.ld-intro'), null, { timeout: 4000 })
    ok(await ph.locator('[data-dock]').isHidden(), 'homepage: the shared dock is not shown')
    ok(await ph.locator('[data-quotebar]').getAttribute('data-on') === 'false', 'quote bar hidden at the top')
    await ph.evaluate(() => { const r = document.querySelector('#how').getBoundingClientRect(); scrollTo(0, r.top + scrollY + 400) })
    await ph.waitForTimeout(500)
    const bar = ph.locator('[data-quotebar]')
    ok(await bar.getAttribute('data-on') === 'true' && (await bar.innerText()).replace(/\s+/g, ' ').trim() === `EPC from £${priceFrom.epc} Ready within 72 hours Get a quote`, 'quote bar: EPC from £65 · Ready within 72 hours · Get a quote')
    await ph.locator('#pricing form').scrollIntoViewIfNeeded(); await ph.waitForTimeout(500)
    ok(await bar.getAttribute('data-on') === 'false', 'quote bar steps aside over the form')
    await ph.close()
  } finally {
    await browser.close()
  }
  console.log(`PASS booking v7: ${passed} checks (numbered questions, property type, What you get, What's included, WhatsApp line, visit-date rules, confirmation What you receive, portfolio skips step 2, /contact, homepage quote bar)`)
})().catch((e) => { console.error(e); process.exit(1) })
