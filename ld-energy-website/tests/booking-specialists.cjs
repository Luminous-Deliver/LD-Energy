const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const out = '../../../audits/website-growth-audit/ld-energy-stage1-review-fix-2026-09-11'

;(async () => {
  const browser = await chromium.launch({ channel: 'msedge' })
  const page = await browser.newPage({ viewport: { width: 320, height: 568 }, reducedMotion: 'reduce' })
  try {
    await page.addInitScript(() => {
      if (window.top !== window) return
      localStorage.setItem('cookie-consent', 'declined')
      window.turnstile = { render: (_, options) => { setTimeout(() => options.callback('mock-token'), 20); return 'test' }, remove: () => {}, reset: () => {} }
    })
    let submission
    await page.route('**/api/contact', route => { submission = route.request().postDataJSON(); return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, delivered: true }) }) })
    for (const service of ['floor-plan', 'pre-assessment', 'bulk']) {
      await page.goto(`http://localhost:3100/contact?service=${service}&area=unknown&speed=express&plan=1#booking-form`, { waitUntil: 'networkidle' })
      assert.equal(await page.getByRole('checkbox', { name: /Add the EPC Improvement Plan/ }).count(), 0)
      if (service === 'pre-assessment') assert.match(await page.locator('form').innerText(), /included in your Pre-Assessment/)
      if (service === 'bulk') {
        assert.equal(await page.locator('input[name="areaBand"]').count(), 0)
        await page.getByRole('radio', { name: 'Landlord (tenanted)', exact: true }).focus()
        await page.keyboard.press('Space')
        assert.equal(await page.getByRole('radio', { name: 'Landlord (tenanted)', exact: true }).isChecked(), true)
      }
      if (service !== 'bulk') await page.getByRole('radio', { name: 'Homeowner', exact: true }).check()
      await page.getByRole('button', { name: 'Continue', exact: true }).click()
      assert.equal(await page.locator('input[name="speed"]').count(), 0)
      assert.equal(await page.locator('input[name="preferredDate"]').count(), service === 'bulk' ? 0 : 1)
      await page.getByRole('button', { name: 'Continue', exact: true }).click()
      if (service === 'bulk') {
        assert.equal(await page.locator('#postcode').count(), 0)
        assert.equal(await page.locator('#address').getAttribute('required'), null)
        assert.equal(await page.locator('#propertyCount').getAttribute('required'), '')
        await page.locator('#name').fill('Test Landlord')
        await page.locator('#phone').fill('07000000000')
        await page.locator('#email').fill('test@example.invalid')
        await page.locator('#propertyCount').fill('20+')
        await page.locator('#consent').check()
        await page.screenshot({ path: out + '/bulk320-details.png', fullPage: true })
        await page.getByRole('button', { name: 'Send my quote request' }).click()
        await page.getByRole('heading', { name: 'Your quote request has been received' }).waitFor()
        assert.equal(submission.customerType, 'Landlord (tenanted)')
        assert.equal(submission.propertyCount, '20+')
        assert.equal(submission.speed, 'Standard (72 hours)')
        assert.equal(submission.improvementPlan, false)
      }
    }
    const storage = await browser.newPage({ viewport: { width: 390, height: 844 } })
    const errors = []
    storage.on('pageerror', error => errors.push(error.message))
    await storage.addInitScript(() => { if (window.top === window) Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage blocked', 'SecurityError') } }) })
    await storage.goto((process.env.BOOKING_PRODUCTION_URL || 'http://localhost:3110') + '/contact', { waitUntil: 'networkidle' })
    await storage.getByRole('button', { name: 'Decline', exact: true }).click()
    await storage.getByRole('radio', { name: 'Not sure of floor area', exact: true }).check()
    await storage.getByRole('radio', { name: 'Homeowner', exact: true }).check()
    await storage.getByRole('button', { name: 'Continue', exact: true }).click()
    assert.equal(await storage.locator('form h2').innerText(), 'Timing and access')
    assert.deepEqual(errors, [])
    fs.writeFileSync(out + '/specialist-checks.json', JSON.stringify({ floorPlan: true, preAssessment: true, bulkLandlordSubmission: true, blockedStorageProduction: true }, null, 2))
    console.log('PASS specialist eligibility, bulk landlord submission, keyboard selection, blocked-storage production journey')
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
