// Exact floor area beside the preset sizes. Run against a local `next start` of the production build.
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const base = process.env.BOOKING_TEST_URL || 'http://localhost:3100'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')
const out = path.resolve(process.env.BOOKING_EVIDENCE_DIR || '../../../audits/website-growth-audit/ld-energy-exact-floor-area-2026-09-26')
fs.mkdirSync(out, { recursive: true })

;(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  try {
    for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [1440, 900]]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' })
      await page.addInitScript(() => { if (window.top === window) localStorage.setItem('cookie-consent', 'declined') })
      const submissions = []
      await page.route('**/api/contact', async route => {
        submissions.push(route.request().postDataJSON())
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, delivered: true, confirmationSent: true }) })
      })
      await page.goto(`${base}/contact#booking-form`)
      const form = page.getByRole('form', { name: 'Exact quote enquiry' })
      const exact = form.getByLabel('Exact size')
      const tile = name => form.getByRole('radio', { name, exact: true })
      const estimate = () => form.locator('[data-estimate-summary]').first().innerText()

      // Three sizes across at every width, and no label spills out of its tile.
      const tiles = await form.locator('fieldset', { hasText: 'Internal floor area' }).evaluate(fieldset => [...fieldset.querySelectorAll('label:has(input[value$="plus"]), label:has(input[value*="-"])')].map(label => ({ top: Math.round(label.getBoundingClientRect().top), spill: [...label.querySelectorAll('span')].some(span => span.scrollWidth > label.clientWidth) })))
      assert.equal(new Set(tiles.map(t => t.top)).size, 2, 'six sizes in two rows')
      assert.equal(tiles.some(t => t.spill), false, 'label overflow')
      // Typing a figure selects its size and prices it.
      await exact.fill('134')
      assert.equal(await tile('121 m²+').isChecked(), true)
      assert.match(await estimate(), /Guide estimate: £125 · 134 m²/)
      // The selected tick must never sit on top of the size label.
      const clash = await tile('121 m²+').evaluate(input => {
        const label = input.closest('label'), tick = label.querySelector('svg'), text = label.querySelector('span')
        if (!tick || !tick.getClientRects().length) return false
        const a = tick.getBoundingClientRect(), range = document.createRange(); range.selectNodeContents(text.firstChild)
        const b = range.getBoundingClientRect()
        return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
      })
      assert.equal(clash, false, 'tick overlaps size label')
      await form.screenshot({ path: path.join(out, `typed-134-${width}.png`) })
      await exact.fill('74.3')
      assert.equal(await tile('71–95 m²').isChecked(), true)
      assert.match(await estimate(), /£95 · 74\.3 m²/)

      // Choosing a size that contradicts the figure clears it; choosing a matching one keeps it.
      await tile('71–95 m²').check()
      assert.equal(await exact.inputValue(), '74.3')
      await tile('53–70 m²').check()
      assert.equal(await exact.inputValue(), '')
      assert.match(await estimate(), /£85 · 53–70 m²/)
      await exact.fill('60')
      await tile('Not sure of floor area').check()
      assert.equal(await exact.inputValue(), '')

      // Square-feet nudge, then an unusable figure blocks Continue with a clear message.
      await exact.fill('850')
      await assert.doesNotReject(form.getByText('If your figure is in square feet').waitFor())
      await form.screenshot({ path: path.join(out, `sqft-hint-${width}.png`) })
      await exact.fill('lots')
      await tile('Homeowner').check()
      await form.getByRole('button', { name: 'Continue' }).click()
      await form.getByText('Enter the floor area as a number of square metres').waitFor()
      assert.equal(await form.getByText('Step 1 of 3').count(), 1)
      await form.screenshot({ path: path.join(out, `invalid-${width}.png`) })

      // A valid figure submits with its band, and the success summary shows the figure.
      await exact.fill('134')
      await form.getByRole('button', { name: 'Continue' }).click()
      await form.getByText('Step 2 of 3').waitFor()
      await form.getByRole('button', { name: 'Continue' }).click()
      await form.getByLabel('Full name').fill('Test Customer')
      await form.getByLabel('Phone number').fill('07000000000')
      await form.getByLabel('Email address').fill('test@example.invalid')
      await form.getByLabel('Property address').fill('1 Test Road')
      await form.getByLabel('Postcode').fill('E15 1AA')
      await form.locator('#consent').check()
      await page.waitForFunction(() => document.querySelector('[name="cf-turnstile-response"]')?.value)
      await form.getByRole('button', { name: 'Send my quote request' }).click()
      await page.getByText('Request sent').waitFor()
      assert.equal(submissions.length, 1)
      assert.equal(submissions[0].areaBand, '121-plus')
      assert.equal(submissions[0].floorArea, '134')
      await assert.doesNotReject(page.getByText('134 m²').first().waitFor())
      await page.locator('[aria-labelledby="request-sent-heading"]').screenshot({ path: path.join(out, `sent-${width}.png`) })
      if (width === 1440) await page.getByRole('complementary', { name: 'Your quote summary' }).count().then(n => assert.ok(n <= 1))
      await page.close()
      console.log(`ok ${width}px`)
    }
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exit(1) })
