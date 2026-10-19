// Homepage (16/10/2026 evening): the hero card is a price card with no inputs; every price
// opens /contact with the service and size chosen. Links, layout.
// Run against a local production build (NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA npm run build,
// Cloudflare's always-pass test key), served with npx next start -p 3120, then
//   node tests/home-v3.cjs            (BOOKING_TEST_URL overrides the base)
const assert = require('node:assert/strict')
const { chromium } = require('playwright')
// The real price table, loaded through the repo's TypeScript test loader, so the
// test can never agree with a copy of it.
require('./register.cjs')
const { pricing } = require('../lib/site.ts')

const base = process.env.BOOKING_TEST_URL || 'http://localhost:3120'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')

const bands = ['up-to-37', '38-52', '53-70', '71-95', '96-120', '121-plus']
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
    const turnstileLoads = []
    page.on('request', (r) => { if (r.url().includes('challenges.cloudflare.com')) turnstileLoads.push(r.url()) })
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
    await page.goto(base + '/', { waitUntil: 'networkidle' })

    const card = page.locator('#pricing .hpc')
    check(await card.count() === 1, 'the hero holds the price card')
    check(await page.locator('main form').count() === 0, 'no form on the homepage')
    check(turnstileLoads.length === 0, 'no security-check script on the homepage')

    // Prices appear only in the card (service cards and copy stay price-free).
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
    check(strays.length === 0, 'prices outside the price card: ' + JSON.stringify(strays))

    // Truth table: 6 bands x (EPC, bundle) against lib/site.ts, each a link carrying its choice.
    const cells = await card.evaluate((c) => [...c.querySelectorAll('tbody tr')].map((tr) =>
      [...tr.querySelectorAll('a.hpc__price')].map((a) => ({ text: a.textContent, href: a.getAttribute('href') }))))
    check(cells.length === 6, `six size rows, got ${cells.length}`)
    cells.forEach((row, i) => {
      const [epc, bundle] = row
      check(epc && epc.text.endsWith(`£${pricing[i].epc}`), `${bands[i]} EPC: ${epc && epc.text}`)
      check(bundle && bundle.text.endsWith(`£${pricing[i].bundle}`), `${bands[i]} bundle: ${bundle && bundle.text}`)
      check(epc && epc.href === `/contact?service=epc&area=${bands[i]}&source=home&cta=hero#booking-form`, `${bands[i]} EPC href ${epc && epc.href}`)
      check(bundle && bundle.href === `/contact?service=bundle&area=${bands[i]}&source=home&cta=hero#booking-form`, `${bands[i]} bundle href ${bundle && bundle.href}`)
    })
    check(await card.locator('a.hpc__unsure').getAttribute('href') === '/contact?service=epc&area=unknown&source=home&cta=hero#booking-form', 'unsure row asks for the address')

    // A price hands over to /contact with service and size already chosen; nothing asked twice.
    await card.locator('a.hpc__price').nth(5).click() // 53-70 m², bundle
    await page.waitForURL((u) => u.pathname === '/contact')
    const form = page.getByRole('form', { name: 'Exact quote enquiry' })
    await form.waitFor()
    check(await form.locator(`input[name="services"][value="${value.bundle}"]`).isChecked(), 'bundle pre-chosen on /contact')
    check(await form.locator(`input[name="areaBand"][value="${bands[2]}"]`).isChecked(), 'size pre-chosen on /contact')
    check((await form.locator('[data-estimate-announcement]').textContent()).includes(`£${pricing[2].bundle}`), 'same guide price on /contact')
    await form.locator('label.bf-tile--who:has(input[value="Landlord (tenanted)"])').click()
    await form.locator('.bf__go').click()
    await form.locator('.bf__go').click()
    await page.fill('#name', 'Test Customer'); await page.fill('#phone', '07000 000000'); await page.fill('#email', 'test@example.com')
    await page.fill('#address', '1 Test Street, London'); await page.fill('#postcode', 'E15 1AA'); await page.check('#consent')
    await page.waitForFunction(() => !document.querySelector('#booking-form button[type="submit"], form button[type="submit"]').disabled)
    await form.locator('button[type="submit"]').click()
    await page.locator('#request-sent-heading').waitFor()
    const [sent] = submissions
    check(submissions.length === 1, `one submission, got ${submissions.length}`)
    check(sent && sent.sourcePage === 'home' && sent.ctaId === 'hero' && sent.customerType === 'Landlord (tenanted)'
      && sent.services.join() === value.bundle && sent.areaBand === bands[2] && sent.consent === true,
      'submitted payload: ' + JSON.stringify(sent && { ...sent, turnstileToken: undefined }))

    // Service cards further down open /contact with their service picked.
    await page.goto(base + '/', { waitUntil: 'networkidle' })
    for (const service of ['epc', 'bundle', 'floor-plan']) {
      const href = await page.getAttribute(`[data-pick="${service}"]`, 'href')
      check(href === `/contact?service=${service}&source=home&cta=pricing#booking-form`, `pick ${service}: ${href}`)
    }
    await page.click('[data-pick="floor-plan"]')
    await page.waitForURL((u) => u.pathname === '/contact')
    await form.waitFor()
    check(await form.locator(`input[name="services"][value="${value['floor-plan']}"]`).isChecked(), 'floor plan pre-chosen from the service card')
    check(await form.locator('input[name="areaBand"]:checked').count() === 0, 'no size invented by the service card')
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
        // The bar stays hidden while the price card is on screen; scroll past the card.
        await page.evaluate(() => scrollTo(0, document.querySelector('#pricing').getBoundingClientRect().bottom + scrollY + 200))
        await page.waitForTimeout(600)
        const bar = await page.evaluate(() => { const a = document.querySelector('[data-mobile-quote] a[href^="/contact"]'); if (!a) return null; const r = a.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 })
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
  console.log('home-v3: all checks passed (price card, no form or Turnstile, 12 prices + hrefs vs lib/site.ts, unsure row, price -> /contact prefill + send, 3 service hand-offs, anchors, footer, schema, overflow x4, compact nav, progress line, mobile toggle + bar, reduced motion)')
})()
