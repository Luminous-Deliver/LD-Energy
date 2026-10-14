// Homepage (14/10/2026): one guide-price calculator, routes, hand-offs, links, layout.
// Run against a local production build: npx next start -p 3120, then
//   node tests/home-v3.cjs            (BOOKING_TEST_URL overrides the base)
const assert = require('node:assert/strict')
const { chromium } = require('playwright')
// The real price table, loaded through the repo's TypeScript test loader, so the
// test can never agree with a copy of it.
require('./register.cjs')
const { pricing, EXPRESS_SURCHARGE } = require('../lib/site.ts')

const base = process.env.BOOKING_TEST_URL || 'http://localhost:3120'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')

const bands = ['up-to-37', '38-52', '53-70', '71-95', '96-120', '121-plus']
const key = { epc: 'epc', bundle: 'bundle', 'floor-plan': 'floorPlan' }
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
    await context.addInitScript(() => { try { localStorage.setItem('cookie-consent', 'declined') } catch {} })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
    await page.goto(base + '/', { waitUntil: 'networkidle' })

    // Before any choice: no guide price anywhere on the page except add-on mentions.
    const strays = await page.evaluate(() => {
      const hits = []
      const walk = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT)
      while (walk.nextNode()) {
        const t = walk.currentNode.textContent
        if (walk.currentNode.parentElement.closest('script')) continue
        // Add-ons and cover amounts are not guide prices.
        if (/£\d/.test(t) && !/£35 Improvement Plan|£5m|£15/.test(t)) hits.push(t.trim())
      }
      return hits
    })
    check(strays.length === 0, 'prices outside the calculator: ' + JSON.stringify(strays))

    // Every route opens the calculator with the right service; Back returns.
    for (const [route, service] of [['landlord', 'epc'], ['agent', 'epc'], ['seller', 'bundle'], ['home', 'epc']]) {
      await page.click(`[data-route="${route}"]`)
      check(await page.getAttribute(`[data-svc="${service}"]`, 'aria-pressed') === 'true', `route ${route} -> ${service}`)
      check(await page.evaluate(() => document.activeElement?.textContent) === 'Your guide price', `route ${route}: focus on heading`)
      await page.click('text=Change what you need')
      check(await page.isVisible('[data-route="home"]'), `back from ${route}`)
    }

    // Truth table: 3 services x 6 bands against lib/site.ts.
    await page.click('[data-route="home"]')
    for (const service of ['epc', 'bundle', 'floor-plan']) {
      await page.click(`[data-svc="${service}"]`)
      for (let i = 0; i < 6; i++) {
        await page.click(`.qc [data-band="${bands[i]}"]`)
        const band = pricing[i]
        const want = band[key[service]]
        const got = await page.evaluate(() => ({
          price: document.querySelector('[data-price]').textContent,
          href: document.querySelector('[data-quote]').getAttribute('href'),
          save: document.querySelector('[data-save] dd')?.textContent || null,
          tile: [...document.querySelectorAll('.qc__size')].map((t) => t.querySelector('.qc__size-top span').textContent),
          extra: document.querySelector('.qc__extra')?.textContent || null,
        }))
        check(got.price === `£${want}`, `${service} ${bands[i]}: price ${got.price} != £${want}`)
        check(got.tile.join() === pricing.map((p) => `£${p[key[service]]}`).join(), `${service}: tile prices ${got.tile}`)
        check(got.href === `/contact?service=${service}&area=${bands[i]}&source=home&cta=estimator#booking-form`, `${service} ${bands[i]}: href ${got.href}`)
        if (service === 'bundle') check(got.save === `−£${band.epc + band.floorPlan - band.bundle}`, `bundle ${bands[i]}: saving ${got.save}`)
        else check(got.save === null, `${service}: saving shown`)
        check(service === 'floor-plan' ? got.extra === null : got.extra === `Next-day lodgement +£${EXPRESS_SURCHARGE} when agreed`, `${service}: express note ${got.extra}`)
      }
    }
    await page.click('.qc [data-band="unknown"]')
    check(await page.textContent('[data-price]') === 'Quote', 'unknown band shows Quote')
    check((await page.getAttribute('[data-quote]', 'href')).includes('area=unknown'), 'unknown band href')

    // Service-card buttons: switch service, keep the size, bring the card into view.
    await page.click('.qc [data-band="96-120"]')
    for (const service of ['epc', 'bundle', 'floor-plan']) {
      await page.evaluate(() => document.getElementById('services').scrollIntoView())
      await page.click(`[data-pick="${service}"]`)
      await page.waitForTimeout(900)
      const s = await page.evaluate(() => ({
        svc: document.querySelector('[data-svc][aria-pressed="true"]').dataset.svc,
        band: document.querySelector('.qc__size[aria-pressed="true"]')?.dataset.band,
        top: Math.round(document.querySelector('.qc').getBoundingClientRect().top),
      }))
      check(s.svc === service && s.band === '96-120' && s.top >= 0 && s.top < 400, `pick ${service}: ${JSON.stringify(s)}`)
      check(await page.textContent('[data-price]') === `£${pricing[4][key[service]]}`, `pick ${service}: price`)
    }

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
      if (width === 390) {
        await page.click('.svc__toggle >> nth=0')
        check(await page.isVisible('#svc-epc-list'), 'mobile checklist opens')
        await page.evaluate(() => scrollTo(0, 2600))
        await page.waitForTimeout(600)
        const bar = await page.evaluate(() => { const a = document.querySelector('a[href*="cta=mobile-bar"]'); if (!a) return null; const r = a.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 })
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
  console.log('home-v3: all checks passed (4 routes, 18 price cells + tiles, unknown band, 3 hand-offs, anchors, footer, schema, overflow x4, mobile toggle + bar, reduced motion)')
})()
