const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const base = process.env.BOOKING_TEST_URL || 'http://localhost:3111'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')
const out = path.resolve('../../../audits/website-growth-audit/ld-energy-stage1-review-fix-2026-09-11')

;(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  const page = await browser.newPage({ reducedMotion: 'reduce' })
  await page.addInitScript(() => { if (window.top === window) localStorage.setItem('cookie-consent', 'declined') })
  const measurements = [], copy = []
  try {
    for (const [width,height] of [[320,568],[360,800],[375,812],[390,844],[412,915],[430,932],[768,1024],[1440,900]]) {
      await page.setViewportSize({ width, height })
      await page.goto(base + '/contact', { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      const y = (await page.locator('form input[name="services"]').first().boundingBox()).y
      if (width === 390) assert.ok(y <= 450)
      if (width === 320) assert.ok(y < height)
      assert.equal(await page.locator('form [name="customerType"]:checked').count(), 0)
      assert.equal(await page.locator('form [data-estimate-summary]').count(), 0)
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      await page.screenshot({ path: path.join(out, `production-contact-${width}.png`) })
      measurements.push({ width, height, firstControlTop: y })
    }
    for (const route of ['/services/domestic-epc','/services/floor-plans','/services/epc-pre-assessment','/services/epc-improvement-plan','/blog','/landlords','/sellers','/estate-agents','/areas/stratford','/about','/areas','/faq','/domestic-energy-assessor-london']) {
      await page.goto(base + route, { waitUntil: 'networkidle' })
      const labels = await page.locator('a[href*="/contact"], a[href="#contact"]').allTextContents()
      for (const label of labels) assert.doesNotMatch(label, /\bbook(?:ing)?\b/i, route)
      copy.push({ route, enquiryLabels: labels.map(label => label.trim()), passed: true })
    }
    await page.goto(base + '/contact', { waitUntil: 'networkidle' })
    assert.match(await page.locator('form').innerText(), /Your full Energy Report plus Abdul's personalised plan explaining what's holding the rating back and which improvements to consider first\. Your standard EPC recommendations are included either way\./)
    assert.doesNotMatch(await page.locator('form').innerText(), /Recommendations remain on your EPC|Who are you booking as/)
    fs.writeFileSync(path.join(out, 'production-layout-copy.json'), JSON.stringify({ measurements, copy }, null, 2))
    console.log('PASS production first-control positions at all 8 widths and enquiry labels on 13 changed surfaces')
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
