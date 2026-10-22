// Homepage v7.2 port (23/10/2026): every prototype section in order, the frozen title, description and H1, prices
// equal to lib/site.ts, the approved WhatsApp prefill everywhere, the FAQ schema matching the visible questions,
// reviewers named by first name and initial, every internal link the previous homepage had, the hero climb (pinned on
// desktop, in flow on phones, finished under reduced motion), and the service buttons handing over to the live form.
// Run against a local production build:
//   BOOKING_TEST_URL=http://localhost:3104 node --require ./tests/register.cjs tests/home-v7.cjs
const assert = require('node:assert/strict')
const { chromium } = require('playwright')
const { site, priceFrom, maxBundleSaving, SAME_DAY_LODGEMENT_SURCHARGE, NEXT_DAY_VISIT_SURCHARGE } = require('../lib/site.ts')
const { whatsappQuoteHref } = require('../lib/area-page.ts')
const { homeBookingFaqs } = require('../lib/homepage-content.ts')

const base = process.env.BOOKING_TEST_URL || 'http://localhost:3104'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')

const SECTIONS = ['top', 'how', 'services', 'prices', 'proof', 'faq', 'guides', 'quote']
// Frozen until 14/12/2026 (references/local-seo.md): the live wording, never the prototype's.
const TITLE = `EPC London from £${priceFrom.epc} | Elmhurst Accredited | L&D Energy`
const DESCRIPTION = `Domestic EPCs across London from an Elmhurst and Quidos accredited assessor based in Stratford. Guide prices from £${priceFrom.epc}, based on floor area. Exact quote before booking.`
const H1 = 'Domestic EPCs in London'
// Every internal destination the previous homepage body linked to (HomeHero, HomeServices, HomeContent at 71203fa),
// except /about, which the header and phone menu carry (Abdul 23/10: no link the prototype lacks in Proof).
const KEEP = [
  '/services/domestic-epc', '/pricing', '/services/floor-plans', '/services/epc-pre-assessment', '/services/epc-improvement-plan',
  '/preparing-for-your-epc', '/preparing-for-your-epc#quote-and-property-complexity', '/preparing-for-your-epc#how-your-epc-rating-is-calculated',
  '/preparing-for-your-epc#rdsap-10', '/blog/epc-c-by-2030', '/blog/mees-timeline-2026-2030', '/landlords', '/estate-agents',
  '/contact?service=bulk&source=home&cta=inline#booking-form', '/areas', '/faq', '/blog', '/blog/what-happens-during-epc-assessment',
  '/blog/why-is-my-epc-different', '/blog/epc-vs-floor-plan-vs-survey',
  ...['stratford', 'newham', 'tower-hamlets', 'hackney', 'waltham-forest', 'redbridge'].map((s) => `/areas/${s}`),
]

;(async () => {
  let passed = 0
  const ok = (cond, msg) => { assert.ok(cond, msg); passed++ }
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  try {
    // ------------------------------------------------------------------ the page as served, desktop
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
    await page.goto(base + '/', { waitUntil: 'networkidle' })
    await page.waitForFunction(() => !document.querySelector('.ld-intro'), null, { timeout: 4000 })

    ok(await page.title() === TITLE, `title frozen (${await page.title()})`)
    ok(await page.locator('meta[name="description"]').getAttribute('content') === DESCRIPTION, 'meta description frozen')
    const h1s = await page.locator('h1').allTextContents()
    ok(h1s.length === 1 && h1s[0] === H1, `one H1, the live wording (${h1s})`)
    // option C (23/10): the H1 is the small kicker; the big line is the prototype's headline and not a heading
    const big = page.locator('#top .hero__title')
    ok(await big.innerText() === 'Your EPC, ready within 72 hours' && await big.evaluate((e) => e.tagName === 'P' && !e.closest('h1,h2,h3,h4,h5,h6') && e.previousElementSibling.tagName === 'H1'), 'big line is the prototype headline, a paragraph after the H1')
    ok(await page.locator('#home-h1').evaluate((e) => parseFloat(getComputedStyle(e).fontSize) <= 13 && getComputedStyle(e).textTransform === 'uppercase'), 'the H1 is styled as the eyebrow')

    const ids = await page.evaluate(() => [...document.querySelectorAll('main section[id]')].map((s) => s.id))
    ok(JSON.stringify(ids) === JSON.stringify(SECTIONS), `sections in the prototype's order (${ids})`)
    ok(await page.locator('main figure.break').evaluate((f) => f.previousElementSibling.id === 'how' && f.nextElementSibling.id === 'services'), 'the photo break sits between How it works and the services')

    // prices, all from lib/site.ts
    const text = (sel) => page.locator(sel).first().innerText()
    const strip = await page.locator('#top .strip .price').allInnerTexts()
    ok(strip[0].replace(/\s+/g, '') === `from£${priceFrom.epc}` && strip[1].replace(/\s+/g, '') === `from£${priceFrom.bundle}`, `hero strip prices (${strip})`)
    for (const [id, v] of [['offer-epc', priceFrom.epc], ['offer-bundle', priceFrom.bundle], ['offer-fp', priceFrom.floorPlan]]) {
      ok((await text(`#${id} .offer__price`)).replace(/\s+/g, '') === `from£${v}`, `${id} price £${v}`)
    }
    ok((await text('#offer-bundle .offer__flag')).includes(`save up to £${maxBundleSaving}`), 'bundle saving from maxBundleSaving')
    ok((await text('#offer-epc')).includes(`£${site.addOns.improvementPlan} Improvement Plan`), 'plan price from site.addOns')
    ok((await text('#pre-assessment')).includes(`from £${priceFrom.preAssessment}.`), 'Pre-Assessment from price')
    ok((await text('#how')).includes(`Same-day lodgement, £${SAME_DAY_LODGEMENT_SURCHARGE} more. Next-day visit and lodgement, £${NEXT_DAY_VISIT_SURCHARGE} more.`), 'speed surcharges')
    const typedPrices = await page.evaluate(() => {
      // every £ figure outside the booking form must be one lib/site.ts produces
      const found = []
      const walk = document.createTreeWalker(document.querySelector('.hp'), NodeFilter.SHOW_TEXT)
      while (walk.nextNode()) { const el = walk.currentNode.parentElement; if (el.closest('#pricing, script')) continue; found.push(...(walk.currentNode.textContent.match(/£\d+(?:\.\d+)?m?/g) || [])) }
      return [...new Set(found)]
    })
    const allowed = new Set([priceFrom.epc, priceFrom.bundle, priceFrom.floorPlan, priceFrom.preAssessment, maxBundleSaving, site.addOns.improvementPlan, SAME_DAY_LODGEMENT_SURCHARGE, NEXT_DAY_VISIT_SURCHARGE].map((n) => `£${n}`).concat('£5m'))
    ok(typedPrices.every((p) => allowed.has(p)), `no typed price outside lib/site.ts (${typedPrices})`)

    // WhatsApp: the approved prefill, and nothing else, in the body
    // (the live form's own "Need help?" link is the form component's, left exactly as it is: scope rule 6)
    const wa = await page.locator('.hp a[href*="wa.me"]').evaluateAll((as) => as.filter((a) => !a.closest('#pricing')).map((a) => a.getAttribute('href')))
    ok(wa.length === 3 && wa.every((h) => h === whatsappQuoteHref()), `every body WhatsApp link outside the form is whatsappQuoteHref() (${wa.length})`)

    // the live booking form, in Prices
    ok(await page.locator('#prices #pricing form[aria-label="Exact quote enquiry"]').count() === 1, 'the live booking form sits in Prices, under #pricing')

    // FAQ: schema equals the visible questions
    const schema = await page.evaluate(() => [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => [].concat(JSON.parse(s.textContent))))
    const faq = schema.find((s) => s['@type'] === 'FAQPage')
    const visible = await page.locator('#faq summary').allInnerTexts()
    ok(faq && faq.mainEntity.length === visible.length && faq.mainEntity.every((q, i) => q.name === visible[i].trim() && q.acceptedAnswer.text === homeBookingFaqs[i].a), 'FAQPage JSON-LD matches the visible FAQ')
    ok(schema.some((s) => s['@type'] === 'WebSite'), 'WebSite JSON-LD kept')

    // reviews: real, credited by first name and surname initial
    const credits = await page.locator('#proof .quote figcaption').allInnerTexts()
    ok(credits.length === 2 && credits.every((c) => /^★★★★★\s+[A-Z]\. [A-Z]\., .+ · Google review$/.test(c.trim())), `reviewers by initials, as the prototype (${credits})`)

    // every internal destination the old homepage had
    const hrefs = new Set(await page.locator('.hp a[href^="/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href'))))
    const missing = KEEP.filter((h) => !hrefs.has(h))
    ok(missing.length === 0, `internal links kept (missing: ${missing})`)

    // the climb, pinned: starts at F 34, ends at D 58 with every recommendation landed and the plan drawn
    ok(await page.evaluate(() => getComputedStyle(document.querySelector('#top .hero__stage')).position) === 'sticky', '1440: the hero pins')
    ok(await page.locator('#top [data-pot]').getAttribute('data-band') === 'F', 'climb starts at F')
    await page.evaluate(() => { const h = document.getElementById('top'); scrollTo(0, h.offsetTop + h.offsetHeight - innerHeight - 2) })
    await page.waitForTimeout(700)
    ok(await page.locator('#top [data-pot]').getAttribute('data-band') === 'D', 'climb ends at D')
    ok(await page.locator('#top .measures li.is-on').count() === 4, 'all four recommendations landed')
    ok((await page.locator('#top .verdict').innerText()) === 'D with all four improvements.', 'verdict at D')
    ok(Number(await page.locator('#top .hplan').evaluate((s) => s.style.getPropertyValue('--draw'))) === 1, 'plan drawn')

    // How it works: the line draws, every step lit at the end
    await page.locator('#how .tl__step').last().scrollIntoViewIfNeeded()
    await page.evaluate(() => scrollBy(0, 300)); await page.waitForTimeout(400)
    ok(await page.locator('#how .tl__step.is-on').count() === 3, 'timeline: all three steps lit')

    // a service button hands over to the live form with that service picked
    await page.locator('[data-pick="floor-plan"]').click()
    await page.waitForTimeout(900)
    ok(await page.locator('#pricing input[name="services"][value="Floor Plan"]').isChecked(), 'See my Floor Plan price picks Floor Plan in the form')
    await page.locator('[data-pick="pre-assessment"]').click()
    await page.waitForTimeout(900)
    ok(await page.locator('#pricing input[name="services"][value="EPC Pre-Assessment (not lodged)"]').isChecked(), 'the Pre-Assessment button picks it in the form')
    ok(errors.length === 0, `no console errors (${errors})`)
    await page.close()

    // ------------------------------------------------------------------ widths: no sideways scroll, pin rule
    for (const [w, h, pin] of [[390, 844, false], [768, 1024, true], [1024, 768, false], [1440, 900, true], [360, 640, false]]) {
      const p = await browser.newPage({ viewport: { width: w, height: h } })
      await p.goto(base + '/', { waitUntil: 'networkidle' })
      await p.waitForFunction(() => !document.querySelector('.ld-intro'), null, { timeout: 4000 })
      ok(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, `${w}: no sideways scroll`)
      ok(await p.evaluate(() => getComputedStyle(document.querySelector('#top .hero__stage')).position === 'sticky') === pin, `${w}x${h}: pinned ${pin}`)
      ok(await p.locator('#hero-quote').evaluate((a) => a.getBoundingClientRect().bottom <= innerHeight), `${w}: the quote button is in the first screen`)
      const strip = await p.locator('#top .strip').evaluate((s) => [...s.querySelectorAll('.strip__item')].filter((i) => getComputedStyle(i).display !== 'none').every((i) => i.getBoundingClientRect().right <= innerWidth))
      ok(strip, `${w}: the strip fits the screen`)
      if (w <= 390) {
        // in flow: the rows land as each passes 70% of the screen
        await p.locator('#top .measures li').last().evaluate((li) => scrollTo(0, li.getBoundingClientRect().top + scrollY - innerHeight * 0.5))
        await p.waitForTimeout(500)
        ok(await p.locator('#top .measures li.is-on').count() === 4, `${w}: rows landed in flow`)
      }
      await p.close()
    }

    // ------------------------------------------------------------------ reduced motion: the finished report, no pin
    const r = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
    await r.goto(base + '/', { waitUntil: 'networkidle' })
    ok(await r.evaluate(() => getComputedStyle(document.querySelector('#top .hero__stage')).position) !== 'sticky', 'reduced motion: no pin')
    ok(await r.locator('#top [data-pot]').getAttribute('data-band') === 'D' && await r.locator('#top .measures li.is-on').count() === 4, 'reduced motion: D 58, all four listed')
    ok(await r.locator('#how .tl__step.is-on').count() === 3, 'reduced motion: the timeline complete')
    await r.close()
  } finally {
    await browser.close()
  }
  console.log(`PASS homepage v7.2: ${passed} checks (sections in order, frozen title/description/H1 + option C, prices from lib/site.ts, WhatsApp prefill, FAQ schema, reviewer names, kept links, climb pinned/in flow/reduced, form hand-over, 5 widths)`)
})().catch((e) => { console.error(e); process.exit(1) })
