// Homepage (16/10/2026): the hero card is the booking form (3 steps, in place), links, layout.
// Run against a local production build: npx next start -p 3120, then
//   node tests/home-v3.cjs            (BOOKING_TEST_URL overrides the base)
const assert = require('node:assert/strict')
const { chromium } = require('playwright')
// The real price table, loaded through the repo's TypeScript test loader, so the
// test can never agree with a copy of it.
require('./register.cjs')
const { pricing, EXPRESS_SURCHARGE } = require('../lib/site.ts')
const { EXPRESS_SPEED } = require('../lib/validators.ts')

const base = process.env.BOOKING_TEST_URL || 'http://localhost:3120'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')

const bands = ['up-to-37', '38-52', '53-70', '71-95', '96-120', '121-plus']
const key = { epc: 'epc', bundle: 'bundle', 'floor-plan': 'floorPlan' }
const value = { epc: 'EPC Certificate', bundle: 'Both (Bundle)', 'floor-plan': 'Floor Plan' }
const footerLinks = [
  '/services/domestic-epc', '/services/floor-plans', '/services/epc-pre-assessment', '/services/epc-improvement-plan',
  '/pricing', '/landlords', '/sellers', '/estate-agents', '/areas', '/about', '/domestic-energy-assessor-london',
  '/preparing-for-your-epc', '/faq', '/blog', '/contact#booking-form', '/terms',
]

;(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  const fails = []
  const check = (ok, msg) => { if (!ok) fails.push(msg) }
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    await context.addInitScript(() => {
      try { localStorage.setItem('cookie-consent', 'declined') } catch {}
      // Security check stub: the real widget never loads in a local test.
      window.turnstile = { render: (el, o) => { setTimeout(() => o.callback('test-token'), 20); return 'mock' }, reset: () => {}, remove: () => {}, getResponse: () => 'test-token' }
    })
    const page = await context.newPage()
    const submissions = []
    await page.route('**/api/contact', async (route) => {
      submissions.push(route.request().postDataJSON())
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, delivered: true, confirmationSent: true }) })
    })
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
    await page.goto(base + '/', { waitUntil: 'networkidle' })

    const card = page.locator('#pricing')
    const form = card.getByRole('form', { name: 'Exact quote enquiry' })
    check(await form.count() === 1, 'the hero card is the booking form')
    const pickService = (v) => card.locator(`label.bf-pill:has(input[name="services"][value="${v}"])`).click()
    const pickSize = (i) => card.locator('label.bf-tile--size').nth(i).click()

    // Before any choice: no guide price on the page outside the booking card.
    const strays = await page.evaluate(() => {
      const hits = []
      const walk = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT)
      while (walk.nextNode()) {
        const el = walk.currentNode.parentElement
        if (el.closest('script') || el.closest('#pricing')) continue
        const t = walk.currentNode.textContent
        // Add-ons and cover amounts are not guide prices.
        if (/£\d/.test(t) && !/£35 Improvement Plan|£5m|£15/.test(t)) hits.push(t.trim())
      }
      return hits
    })
    check(strays.length === 0, 'prices outside the booking card: ' + JSON.stringify(strays))
    check(await card.locator('[name="customerType"]:checked').count() === 0 && await card.locator('[name="areaBand"]:checked').count() === 0, 'nothing pre-selected but the service')

    // An estate agent who has not picked a service gets the EPC + floor plan bundle as a default.
    await card.locator('label.bf-tile--who:has(input[value="Estate agent"])').click()
    check(await card.locator('input[name="services"][value="Both (Bundle)"]').isChecked(), 'estate agent defaults to the bundle')
    await card.locator('label.bf-tile--who:has(input[value="Landlord (tenanted)"])').click()

    // Truth table: 3 services x 6 bands against lib/site.ts, in the card itself.
    for (const service of ['epc', 'bundle', 'floor-plan']) {
      await pickService(value[service])
      for (let i = 0; i < 6; i++) {
        await pickSize(i)
        const band = pricing[i]
        const want = band[key[service]]
        const got = await card.evaluate((c) => ({
          price: c.querySelector('[data-price]').textContent,
          tile: [...c.querySelectorAll('.bf-tile--size .bf-size__top span')].map((t) => t.textContent),
          rows: c.querySelector('.bf__rows')?.textContent || '',
        }))
        check(got.price === `£${want}`, `${service} ${bands[i]}: price ${got.price} != £${want}`)
        check(got.tile.join() === pricing.map((p) => `£${p[key[service]]}`).join(), `${service}: tile prices ${got.tile}`)
        if (service === 'bundle') check(got.rows.includes(`Bundle saving−£${band.epc + band.floorPlan - band.bundle}`), `bundle ${bands[i]}: saving ${got.rows}`)
        else check(!got.rows.includes('Bundle saving'), `${service}: saving shown`)
      }
    }
    await card.locator('label.bf-tile--unsure').click()
    check(await card.locator('[data-price]').textContent() === 'Quote', 'unknown band shows Quote')

    // Service-card buttons further down: switch service, keep the size, bring the card back into view.
    await pickSize(4)
    for (const service of ['epc', 'bundle', 'floor-plan']) {
      await page.evaluate(() => document.getElementById('services').scrollIntoView())
      await page.click(`[data-pick="${service}"]`)
      await page.waitForTimeout(900)
      const s = await card.evaluate((c) => ({
        svc: c.querySelector('input[name="services"]:checked')?.value,
        band: c.querySelector('input[name="areaBand"]:checked')?.value,
        top: Math.round(c.getBoundingClientRect().top),
      }))
      check(s.svc === value[service] && s.band === bands[4] && s.top >= 0 && s.top < 400, `pick ${service}: ${JSON.stringify(s)}`)
      check(await card.locator('[data-price]').textContent() === `£${pricing[4][key[service]]}`, `pick ${service}: price`)
    }

    // The enquiry runs in place: three steps, the running total follows, the send stays on the homepage.
    await pickService(value.epc)
    await pickSize(2)
    await card.locator('.bf__go').click()
    check(await card.locator('.bf__h').textContent() === 'Timing and access', 'step 2 is timing and access')
    check(await page.evaluate(() => document.activeElement?.textContent) === 'Timing and access', 'step 2: focus on heading')
    await card.locator(`label.bf-tile:has(input[name="speed"][value="${EXPRESS_SPEED}"])`).click()
    check((await card.locator('[data-estimate-summary]').textContent()).includes(`£${pricing[2].epc + EXPRESS_SURCHARGE}`), 'running total includes next-day lodgement')
    await card.locator('.bf__go').click()
    check(await card.locator('.bf__h').textContent() === 'Your details', 'step 3 is your details')
    await page.fill('#name', 'Test Customer'); await page.fill('#phone', '07000 000000'); await page.fill('#email', 'test@example.com')
    await page.fill('#address', '1 Test Street, London'); await page.fill('#postcode', 'E15 1AA'); await page.check('#consent')
    await page.waitForFunction(() => !document.querySelector('#pricing button[type="submit"]').disabled)
    await card.locator('button[type="submit"]').click()
    await card.locator('#request-sent-heading').waitFor()
    check(new URL(page.url()).pathname === '/', 'stayed on the homepage after sending')
    const [sent] = submissions
    check(submissions.length === 1, `one submission, got ${submissions.length}`)
    check(sent && sent.sourcePage === 'home' && sent.ctaId === 'hero-form' && sent.customerType === 'Landlord (tenanted)'
      && sent.services.join() === 'EPC Certificate' && sent.areaBand === bands[2] && sent.speed === EXPRESS_SPEED && sent.consent === true,
      'submitted payload: ' + JSON.stringify(sent && { ...sent, turnstileToken: undefined }))
    await page.goto(base + '/', { waitUntil: 'networkidle' })

    // Anchors resolve; footer keeps every link.
    const dead = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')).filter((h) => h.length > 1 && !document.getElementById(h.slice(1))))
    check(dead.length === 0, 'dead anchors: ' + dead)
    const foot = await page.evaluate(() => [...document.querySelectorAll('footer a')].map((a) => a.getAttribute('href')))
    for (const href of footerLinks) check(foot.includes(href), 'footer missing ' + href)
    check(new Set(foot.filter((h) => h.startsWith('/areas/'))).size === 12, 'footer popular areas != 12')
    check((await page.$$('script[type="application/ld+json"]')).length >= 1, 'schema present')
    const faqSchema = await page.evaluate(() => [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent).join(''))
    check(faqSchema.includes('What if my rating comes back low?'), 'FAQ schema has the new question')
    check(errors.length === 0, 'console errors: ' + errors.join(' | '))

    // Overflow at four widths; mobile quote bar appears once the hero button scrolls away.
    for (const width of [360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 860 })
      await page.goto(base + '/', { waitUntil: 'networkidle' })
      const [sw, vw] = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth])
      check(sw <= vw, `overflow at ${width}: ${sw} > ${vw}`)
      if (width === 1440) {
        // OmniRated nav (15/10/2026): a plain bar in the hero at the top, gone mid-scroll,
        // a small frosted pill once the hero's buttons have left. Then back to the bar.
        const nav = () => page.evaluate(() => { const h = document.querySelector('header[data-nav]'); const l = h.querySelector('[data-look]'); const r = l.getBoundingClientRect(); return { stage: h.dataset.nav, look: l.dataset.look, w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), bg: getComputedStyle(l).backgroundColor } })
        // Draft A v3 reading line: fixed 3px at the very top, empty at the top, part-filled mid-page.
        const line = () => page.evaluate(() => { const s = document.querySelector('[data-scroll-progress]'); const r = s.getBoundingClientRect(); return { top: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width), pos: getComputedStyle(s).position } })
        const top = await nav()
        const line0 = await line()
        await page.evaluate(() => scrollTo(0, 300)); await page.waitForTimeout(800)
        const mid = await nav()
        await page.evaluate(() => scrollTo(0, 1200)); await page.waitForTimeout(800)
        const down = await nav()
        const line1 = await line()
        check(line0.pos === 'fixed' && line0.top === 0 && line0.h === 3 && line0.w === 0, `progress line empty at the top: ${JSON.stringify(line0)}`)
        check(line1.top === 0 && line1.w > 0 && line1.w < 1440, `progress line part-filled once scrolled: ${JSON.stringify(line1)}`)
        await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(800)
        const back = await nav()
        check(top.stage === 'top' && top.look === 'bar' && top.bg === 'rgba(0, 0, 0, 0)', `nav bar blends into the hero at the top: ${JSON.stringify(top)}`)
        check(mid.stage === 'away' && mid.top < 0, `nav out of sight mid-hero: ${JSON.stringify(mid)}`)
        check(down.stage === 'pill' && down.w < 800 && down.h <= 48 && down.top >= 10 && down.top <= 18, `small pill once scrolled: ${JSON.stringify(down)}`)
        check(back.stage === 'top' && back.look === 'bar', `bar again at the top: ${JSON.stringify(back)}`)
      }
      if (width === 390) {
        await page.click('.svc__toggle >> nth=0')
        check(await page.isVisible('#svc-epc-list'), 'mobile checklist opens')
        // The bar stays hidden while the booking card is on screen; scroll past the card.
        await page.evaluate(() => scrollTo(0, document.querySelector('#pricing').getBoundingClientRect().bottom + scrollY + 200))
        await page.waitForTimeout(600)
        const bar = await page.evaluate(() => { const a = document.querySelector('[data-mobile-quote] a[href="#pricing"]'); if (!a) return null; const r = a.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 })
        check(bar === true, 'mobile quote bar visible after scrolling')
      }
    }

    // Reduced motion: page works and every section is visible.
    const rm = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } })
    const p2 = await rm.newPage()
    const rmErrors = []
    p2.on('pageerror', (e) => rmErrors.push(e.message))
    await p2.goto(base + '/', { waitUntil: 'networkidle' })
    await p2.evaluate(() => scrollTo(0, document.body.scrollHeight))
    const hidden = await p2.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter((e) => getComputedStyle(e).opacity !== '1').length)
    check(hidden === 0 && rmErrors.length === 0, `reduced motion: ${hidden} hidden, errors ${rmErrors}`)
  } finally {
    await browser.close()
  }
  if (fails.length) { console.error('FAIL\n' + fails.join('\n')); process.exit(1) }
  console.log('home-v3: all checks passed (card is the form, agent default, 18 price cells + tiles, unknown band, 3 hand-offs, 3 steps in place with running total and stubbed send, anchors, footer, schema, overflow x4, compact nav, progress line, mobile toggle + bar, reduced motion)')
})()
