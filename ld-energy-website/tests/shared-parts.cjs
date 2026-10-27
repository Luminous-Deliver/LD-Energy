// Shared parts (whole-site slice 1, 22/10/2026): the header's WhatsApp link and nav, the phone menu and the
// phone dock. Run against a local production server:
//   BOOKING_TEST_URL=http://localhost:3103 node --require ./tests/register.cjs tests/shared-parts.cjs
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const { whatsappQuoteHref } = require('../lib/area-page.ts')
const base = process.env.BOOKING_TEST_URL || 'http://localhost:3103'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')

const pages = ['/', '/pricing', '/areas/newham', '/blog/how-long-does-epc-last', '/contact', '/landlords']

;(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  let passed = 0
  const ok = (cond, msg) => { assert.ok(cond, msg); passed++ }
  try {
    // ---------------------------------------------------------------- the header, from the server's HTML
    const wa = whatsappQuoteHref()
    ok(wa === 'https://wa.me/447492575396?text=' + encodeURIComponent("Hi, I'd like a quote for an EPC.\nFull address:\nPostcode:"), 'the approved wording')
    for (const url of pages) {
      const html = await (await fetch(base + url)).text()
      const header = html.slice(html.indexOf('<header class="sh"'), html.indexOf('</header>'))
      ok(header.length > 100, `${url}: header rendered`)
      const waLink = (header.match(/class="sh__wa" href="([^"]*)"/) || [])[1]?.replace(/&#x27;/g, "'").replace(/&amp;/g, '&')
      ok(waLink === wa, `${url}: header WhatsApp href is whatsappQuoteHref() (${waLink})`)
      for (const href of ['/landlords', '/estate-agents', '/pricing', '/about']) ok(header.includes(`href="${href}"`), `${url}: header links ${href}`)
      ok(!/href="tel:/.test(header), `${url}: no phone number in the bar`)
      ok(!html.includes('fonts.googleapis.com') && !html.includes('fonts.gstatic.com'), `${url}: no Google Fonts request`)
    }

    // --------------------------------------------------------------- desktop: no dock, WhatsApp in the bar
    {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
      await page.goto(base + '/pricing', { waitUntil: 'networkidle' })
      ok(await page.locator('[data-dock]').isHidden(), 'desktop: the dock is not displayed')
      // 70% of the way down, whatever the page's length (the 24/10 /pricing redesign made it longer than 3000 px x 2)
      await page.mouse.wheel(0, await page.evaluate(() => Math.round((document.documentElement.scrollHeight - innerHeight) * 0.7))); await page.waitForTimeout(500)
      ok(await page.locator('[data-dock]').isHidden(), 'desktop: still no dock after scrolling')
      ok(await page.locator('header .sh__wa').isVisible(), 'desktop: WhatsApp in the bar at 1440')
      ok(await page.locator('header .sh__menu').isHidden(), 'desktop: no menu button')
      // the bar scrolls away and the pill takes over (Abdul 23/10/2026, after nateherk.com)
      ok(await page.evaluate(() => getComputedStyle(document.querySelector('header.sh')).position) !== 'sticky', 'desktop: the bar scrolls with the page')
      ok(await page.evaluate(() => document.querySelector('header.sh').dataset.solid) === 'true', 'desktop: solid once the page moves')
      await page.waitForTimeout(700)
      const pill = await page.evaluate(() => { const p = document.querySelector('nav.pill'), r = p.getBoundingClientRect(), s = getComputedStyle(p); return { on: p.dataset.on, top: Math.round(r.top), vis: s.visibility, op: s.opacity, cx: Math.round(r.left + r.width / 2 - innerWidth / 2), quote: p.querySelector('a.ld-btn')?.getAttribute('href') } })
      ok(pill.on === 'true' && pill.top === 14 && pill.vis === 'visible' && pill.op === '1' && Math.abs(pill.cx) <= 1, `desktop: the pill is docked, centred, 14 px down (${JSON.stringify(pill)})`)
      ok(/^\/quote/.test(pill.quote || ''), `desktop: the pill's quote button goes to the quote journey (${pill.quote})`)
      for (const href of ['/landlords', '/estate-agents', '/pricing', '/about']) ok(await page.locator(`nav.pill a[href="${href}"]`).count() === 1, `desktop: the pill links ${href}`)
      const line = await page.evaluate(() => { const m = getComputedStyle(document.querySelector('.sline')).transform; return m === 'none' ? 0 : Number(m.split('(')[1].split(',')[0]) })
      ok(line > 0.5 && line <= 1, `desktop: the scroll line has filled with the page (${line})`)
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await page.waitForTimeout(800)
      ok(await page.evaluate(() => { const p = document.querySelector('nav.pill'); return p.dataset.on === 'false' && getComputedStyle(p).visibility === 'hidden' }), 'desktop: the pill leaves (and the tab order) back at the top')
      await page.setViewportSize({ width: 1024, height: 800 })
      ok(await page.locator('header .sh__wa').isHidden(), '1024: WhatsApp leaves the bar below 1200 px, as in the prototype')
      await page.close()
    }

    // ----------------------------------------------------------------------- phones: the dock and the menu
    for (const [w, h] of [[390, 844], [360, 800], [320, 568]]) {
      for (const reducedMotion of ['no-preference', 'reduce']) {
        const page = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion })
        const errors = []
        page.on('pageerror', (e) => errors.push(e.message))
        const dock = page.locator('[data-dock]')
        const state = () => page.evaluate(() => {
          const d = document.querySelector('[data-dock]'); const r = d.getBoundingClientRect()
          return { on: d.dataset.on, visible: getComputedStyle(d).visibility === 'visible' && r.top < innerHeight - 10, inert: d.inert, role: d.getAttribute('role'), label: d.getAttribute('aria-label'), h: Math.round(r.height) }
        })
        // html has scroll-behavior: smooth, so every scroll here is instant; then wait out the dock's .3 s transition
        const settle = () => page.waitForTimeout(450)

        await page.goto(base + '/pricing', { waitUntil: 'networkidle' })
        ok((await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, `${w}: no sideways scroll`)
        // phones: the bar is the logo and the menu only (Abdul 23/10/2026); the quote action lives in the hero and the dock
        if (reducedMotion === 'no-preference') {
          ok(await page.locator('header .sh__quote').isHidden(), `${w}: no quote button in the phone header`)
          ok(await page.locator('header .sh__menu').isVisible(), `${w}: the menu button is shown`)
          const bar = await page.evaluate(() => { const l = document.querySelector('header .lg').getBoundingClientRect(), m = document.querySelector('header .sh__menu').getBoundingClientRect(); return { gap: m.left - l.right, right: innerWidth - m.right } })
          ok(bar.gap >= 24 && bar.right >= 4 && bar.right <= 16, `${w}: logo and menu sit apart, menu at the edge (${JSON.stringify(bar)})`)
        }
        let s = await state()
        ok(s.on === 'false' && !s.visible && s.inert, `${w}/${reducedMotion}: hidden while the hero is on screen`)
        ok(s.role === 'group' && s.label === 'Quick contact', `${w}: role="group" with a label`)
        // past the hero, clear of the footer
        await page.evaluate(() => { const h1 = document.querySelector('main h1').closest('section') ?? document.querySelector('main h1'); scrollTo({ top: h1.getBoundingClientRect().bottom + scrollY + 200, behavior: 'instant' }) })
        await settle()
        s = await state()
        ok(s.on === 'true' && s.visible && !s.inert, `${w}/${reducedMotion}: shown once the hero has gone`)
        ok(s.h >= 64 && s.h <= 76, `${w}: dock height ${s.h}`)
        const links = await dock.locator('a').evaluateAll((as) => as.map((a) => ({ href: a.getAttribute('href'), text: a.textContent.trim(), h: a.getBoundingClientRect().height, w: a.getBoundingClientRect().width })))
        ok(links[0].text === 'WhatsApp' && links[0].href === whatsappQuoteHref(), `${w}: WhatsApp first, prefilled`)
        ok(links[1].text === 'Get my exact quote', `${w}: then Get my exact quote`)
        ok(links.every((l) => l.h >= 44 && l.w >= 44), `${w}: 44 px targets`)
        // over the footer
        await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })); await settle()
        ok((await state()).on === 'false', `${w}/${reducedMotion}: hidden over the footer`)

        // over a booking form (/quote's), and on an area page (no form since 23/10) the quote carries the area page
        await page.goto(base + '/quote', { waitUntil: 'networkidle' })
        await page.locator('main form').evaluate((f) => f.scrollIntoView({ block: 'center', behavior: 'instant' })); await settle()
        ok((await state()).on === 'false', `${w}/${reducedMotion}: hidden over the booking form`)
        await page.goto(base + '/areas/newham', { waitUntil: 'networkidle' })
        ok((await dock.locator('a').nth(1).getAttribute('href')) === '/quote?service=epc&source=area&cta=mobile-bar&page=newham', `${w}: on an area page the quote goes to the quote journey with the area page`)

        // the menu: dialog, focus to Close, Tab trapped, Escape returns focus, dock steps aside while open
        await page.goto(base + '/pricing', { waitUntil: 'networkidle' })
        await page.evaluate(() => scrollTo({ top: 1200, behavior: 'instant' })); await settle()
        const trigger = page.locator('header [aria-controls="mobile-nav-panel"]')
        await trigger.evaluate((b) => b.click())
        await page.waitForTimeout(350)
        ok(await page.locator('#mobile-nav-panel').getAttribute('role') === 'dialog', `${w}: the menu is a dialog`)
        ok(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')) === 'Close menu', `${w}: focus on Close`)
        ok((await state()).on === 'false', `${w}: dock hidden while the menu is open`)
        const reachable = await page.locator('#mobile-nav-panel a').evaluateAll((as) => as.map((a) => a.getAttribute('href')))
        for (const href of ['/areas', '/pricing', '/faq', '/blog', '/contact', '/about', '/landlords', '/sellers', '/estate-agents', '/services/domestic-epc', '/services/floor-plans']) ok(reachable.includes(href), `${w}: menu reaches ${href}`)
        await page.keyboard.press('Shift+Tab')
        ok(await page.evaluate(() => !!document.activeElement?.closest('#mobile-nav-panel')), `${w}: Tab stays in the menu`)
        await page.keyboard.press('Escape'); await page.waitForTimeout(300)
        ok(await page.evaluate(() => document.activeElement?.getAttribute('aria-controls')) === 'mobile-nav-panel', `${w}: Escape returns focus to the menu button`)
        ok(await trigger.getAttribute('aria-expanded') === 'false', `${w}: menu closed`)
        ok(errors.length === 0, `${w}: no page errors ${errors.join('; ')}`)
        await page.close()
      }
    }
  } finally { await browser.close() }
  console.log(`PASS shared parts: ${passed} checks (header WhatsApp href and nav on ${pages.length} pages, desktop without dock, dock at 390/360/320 with and without reduced motion: hidden over hero, footer and form, shown between; menu dialog, focus and reach)`)
})().catch((error) => { console.error(error); process.exitCode = 1 })
