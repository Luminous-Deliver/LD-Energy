const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const base = process.env.BOOKING_TEST_URL || 'http://localhost:3100'
const out = path.resolve(process.env.BOOKING_EVIDENCE_DIR || '../../../audits/website-growth-audit/ld-energy-stage1-review-fix-2026-09-11')
const { rail } = require('./quote-rail.cjs')
// Since the 23/10/2026 quote journey (decisions/log.md 23/10 late, 54d75fd) quote buttons are links to /quote: a click
// opens the quote pop-up over the page, and /quote itself is the page a refresh or a shared link lands on.

;(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.addInitScript(() => { if (window.top === window) localStorage.setItem('cookie-consent', 'declined') })
  const report = []
  try {
    for (const [route, service, label, plan] of [
      ['/services/domestic-epc','epc','Domestic EPC',false],
      ['/services/floor-plans','floor-plan','Floor Plan',false],
      ['/services/epc-pre-assessment','pre-assessment','EPC Pre-Assessment',false],
      ['/services/epc-improvement-plan','epc','Domestic EPC',true],
      ['/estate-agents','bulk','Agency / portfolio enquiry',false],
    ]) {
      await page.goto(base + route, { waitUntil: 'networkidle' })
      let cta = page.locator('main a[href^="/quote"]').first()
      if (service === 'bulk') {
        // 7d7a15b (24/10/2026, parity item 9): the Agents hero quotes one home; the bulk route is the price list's
        // "Three homes or more" row and the ending
        assert.match(await cta.getAttribute('href'), /service=epc/)
        cta = page.locator('main a[href^="/quote"][href*="service=bulk"]').first()
      }
      const href = await cta.getAttribute('href')
      assert.match(href, new RegExp('service=' + service))
      assert.equal(new URL(href, base).pathname, '/quote')
      await cta.click()
      const dialogForm = page.locator('dialog.qd form[aria-label="Exact quote enquiry"]')
      await dialogForm.waitFor({ timeout: 15000 })
      const dr = rail(page, dialogForm)
      await dr.go(plan ? 'price' : 'service')
      if (plan) assert.equal(await dialogForm.getByRole('checkbox', { name: /Add a personalised EPC Improvement Plan/ }).isChecked(), true)
      else await page.waitForFunction(label => [...document.querySelectorAll('dialog.qd input[type="radio"]')].some(input => input.getAttribute('aria-label') === label && input.checked), label)
      await page.keyboard.press('Escape')
      // the page the link stands for, with its own clean canonical
      await page.goto(base + href, { waitUntil: 'networkidle' })
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://epc.luminousanddeliver.co.uk/quote')
      assert.equal(await page.locator('h1').count(), 1)
      report.push({ route, href, service, passed: true })
    }
    // The floor-area picker became the hero's title-block price list in 4356ef2 (24/10/2026, domestic-epc parity item 25):
    // every size shows its price and opens the quote with that size.
    await page.goto(base + '/services/domestic-epc', { waitUntil: 'networkidle' })
    const guideLink = page.locator('main a[href^="/quote"][href*="area=75-95"]').first()
    assert.match(await guideLink.getAttribute('href'), /area=75-95/)
    await guideLink.click()
    const dialogForm = page.locator('dialog.qd form[aria-label="Exact quote enquiry"]')
    await dialogForm.waitFor({ timeout: 15000 })
    await rail(page, dialogForm).go('size')
    await page.waitForFunction(() => document.querySelector('dialog.qd input[value="75-95"]')?.checked)
    assert.match(await dialogForm.innerText(), /Guide estimate: £95/)
    await page.keyboard.press('Escape')
    // User edits win over URL defaults, and valid speed is retained on refresh (on /quote, the page that keeps its URL).
    await page.goto(base + await guideLink.getAttribute('href'), { waitUntil: 'networkidle' })
    const form = page.locator('main form[aria-label="Exact quote enquiry"]')
    const r = rail(page, form)
    const service = async name => { await r.go('service'); await r.pick(form.getByRole('radio', { name, exact: true })) }
    await service('Floor Plan')
    await page.reload({ waitUntil: 'networkidle' })
    await r.go('service')
    assert.equal(await form.getByRole('radio', { name: 'Floor Plan', exact: true }).isChecked(), true)
    assert.match(await form.innerText(), /Guide estimate: £95/)
    await page.goto(base + '/contact?service=epc&area=up-to-40&speed=express&plan=1#booking-form', { waitUntil: 'networkidle' })
    await page.waitForURL(/\/quote/)
    await form.waitFor()
    assert.match(await form.innerText(), /Guide estimate: £115/)
    await service('Floor Plan')
    // the URL follows the choice after React commits it
    await page.waitForFunction(() => !/speed=express|plan=1/.test(location.href), null, { timeout: 5000 }).catch(() => {})
    assert.doesNotMatch(page.url(), /speed=express|plan=1/)
    // Same-document history may change the URL, but must not reapply its defaults.
    await page.evaluate(() => history.pushState(history.state, '', '/quote#booking-form'))
    await service('EPC + Floor Plan')
    await r.go('size'); await r.pick(form.locator('input[value="40-55"]'))
    await page.goBack({ waitUntil: 'networkidle' })
    await r.go('service')
    assert.equal(await form.getByRole('radio', { name: 'EPC + Floor Plan', exact: true }).isChecked(), true)
    await r.go('size')
    assert.equal(await form.locator('input[value="40-55"]').isChecked(), true)
    for (const width of [320,390,768,1024,1440]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(base, { waitUntil: 'networkidle' })
      const header = await page.locator('header').evaluate(header => ({
        overflow: [...header.querySelectorAll('a,button')].filter(e => e.checkVisibility() && (e.getBoundingClientRect().right > innerWidth || e.getBoundingClientRect().left < 0)).map(e => e.textContent),
        // the visible mark (day or reversed, 23/10/2026); the house mark alone since the L1 logo, the name is text
        logo: [...header.querySelectorAll('img')].filter(img => img.checkVisibility()).map(img => { const r = img.getBoundingClientRect(); return { w: r.width, h: r.height, ratio: img.naturalWidth / img.naturalHeight } })[0],
      }))
      assert.deepEqual(header.overflow, [])
      // L1 logo (decisions/log.md 23/10/2026 evening): house 32 px tall on desktop, phones keep their 28 px; never squeezed
      assert.ok(header.logo && header.logo.h >= (width >= 768 ? 32 : 28) && Math.abs(header.logo.w / header.logo.h - header.logo.ratio) < 0.02, `Logo squeezed at ${width}: ${JSON.stringify(header.logo)}`)
      await page.screenshot({ path: path.join(out, `homepage-${width}-viewport.png`) })
    }
    fs.writeFileSync(path.join(out, 'booking-navigation.json'), JSON.stringify(report, null, 2))
    console.log('PASS service CTAs, area/price intent, edits, browser Back, clean canonicals and header breakpoints')
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
