// The guide price rolls digit by digit when the size changes (prototype v7.2 `odo`, approved 22/10/2026; lost in the
// port and restored 24/10/2026). Guards the behaviour itself, so a later form rebuild cannot drop it unnoticed:
// a column per digit, the 0.45 s roll, none with reduced motion, and the price still reads as plain "£125" text.
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const base = process.env.BOOKING_TEST_URL || 'http://localhost:3100'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')

;(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  let checks = 0
  const ok = (value, message) => { assert.ok(value, message); checks++ }
  try {
    for (const reducedMotion of ['no-preference', 'reduce']) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion })
      await page.addInitScript(() => { if (window.top === window) localStorage.setItem('cookie-consent', 'declined') })
      await page.goto(`${base}/#pricing`, { waitUntil: 'networkidle' })
      const form = page.locator('#pricing form').first()
      const sizes = form.getByRole('radio', { name: /m²/ })
      ok(await sizes.count() >= 5, 'five floor-area bands to pick from')
      await sizes.nth(0).check({ force: true })
      const price = form.locator('[data-price]').first()
      const first = await price.innerText()
      await sizes.nth(4).check({ force: true })
      const second = await price.innerText()
      ok(/^£\d[\d,]*$/.test(first) && /^£\d[\d,]*$/.test(second), `plain price text, not digit columns (${first}, ${second})`)
      ok(first !== second, 'the price changes with the size')
      const digits = second.replace(/\D/g, '').length
      ok(await price.locator('.odo__c').count() === digits, 'one rolling column per digit')
      const duration = await price.locator('.odo__s').first().evaluate(e => getComputedStyle(e).transitionDuration)
      ok(reducedMotion === 'reduce' ? duration === '0s' : duration === '0.45s', `roll ${duration} with ${reducedMotion}`)
      ok(await price.locator('.odo').getAttribute('aria-hidden') === 'true', 'the columns are hidden from screen readers')
      await page.close()
    }
    console.log(`PASS price roll: ${checks} checks (columns per digit, 0.45 s roll, none with reduced motion, plain text for innerText and screen readers)`)
  } finally {
    await browser.close()
  }
})().catch(err => { console.error(err); process.exitCode = 1 })
