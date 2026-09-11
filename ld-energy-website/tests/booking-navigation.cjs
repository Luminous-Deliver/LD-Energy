const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const base = process.env.BOOKING_TEST_URL || 'http://localhost:3100'
const out = path.resolve('../../../audits/website-growth-audit/ld-energy-stage1-2026-09-10')

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
      const cta = page.locator('main a[href*="/contact"]').first()
      const href = await cta.getAttribute('href')
      assert.match(href, new RegExp('service=' + service))
      assert.match(href, /#booking-form$/)
      await cta.click()
      await page.getByRole('form', { name: 'Exact quote enquiry' }).waitFor()
      await page.waitForFunction(label => [...document.querySelectorAll('input[type="radio"]')].some(input => input.getAttribute('aria-label') === label && input.checked), label)
      if (plan) assert.equal(await page.getByRole('checkbox', { name: /Add the Improvement Plan/ }).isChecked(), true)
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://epc.luminousanddeliver.co.uk/contact')
      assert.equal(await page.locator('h1').count(), 1)
      report.push({ route, href, service, passed: true })
    }
    await page.goto(base + '/#pricing', { waitUntil: 'networkidle' })
    await page.getByText('View guide prices by floor area', { exact: true }).click()
    const picker = page.locator('.md\\:hidden').filter({ has: page.getByText('View guide prices by floor area', { exact: true }) })
    await picker.getByRole('button', { name: /71/ }).click()
    const guideLink = picker.getByRole('link', { name: 'Get my exact quote', exact: true })
    assert.match(await guideLink.getAttribute('href'), /area=71-95/)
    await guideLink.click()
    await page.waitForFunction(() => document.querySelector('input[value="71-95"]')?.checked)
    assert.match(await page.locator('form').innerText(), /Guide estimate: £95/)
    // User edits win over URL defaults, and valid speed is retained on refresh.
    await page.getByRole('radio', { name: 'Floor Plan', exact: true }).check()
    await page.reload({ waitUntil: 'networkidle' })
    assert.equal(await page.getByRole('radio', { name: 'Floor Plan', exact: true }).isChecked(), true)
    assert.match(await page.locator('form').innerText(), /Guide estimate: £90/)
    await page.goto(base + '/contact?service=epc&area=up-to-37&speed=express&plan=1#booking-form', { waitUntil: 'networkidle' })
    assert.match(await page.locator('form').innerText(), /Guide estimate: £115/)
    await page.getByRole('radio', { name: 'Floor Plan', exact: true }).check()
    assert.doesNotMatch(page.url(), /speed=express|plan=1/)
    await page.goBack({ waitUntil: 'networkidle' })
    assert.equal(await page.getByRole('radio', { name: 'Floor Plan', exact: true }).isChecked(), true)
    assert.equal(await page.locator('input[value="71-95"]').isChecked(), true)
    for (const width of [320,390,768,1024,1440]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(base, { waitUntil: 'networkidle' })
      const header = await page.locator('header').evaluate(header => ({
        overflow: [...header.querySelectorAll('a,button')].filter(e => e.checkVisibility() && (e.getBoundingClientRect().right > innerWidth || e.getBoundingClientRect().left < 0)).map(e => e.textContent),
        logo: header.querySelector('img').getBoundingClientRect().width,
      }))
      assert.deepEqual(header.overflow, [])
      assert.ok(header.logo >= 60, `Logo squeezed at ${width}: ${header.logo}`)
      await page.screenshot({ path: path.join(out, `homepage-${width}-viewport.png`) })
    }
    fs.writeFileSync(path.join(out, 'booking-navigation.json'), JSON.stringify(report, null, 2))
    console.log('PASS service CTAs, area/price intent, edits, browser Back, clean canonicals and header breakpoints')
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
