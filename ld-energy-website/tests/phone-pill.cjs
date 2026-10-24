// Phones get the scroll pill (Abdul 24/10/2026, after nateherk.com on a phone): the bar scrolls away, the compact pill
// docks 10 px down with the mark, Landlords, Pricing and a menu button that opens the same sheet and takes focus back.
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const base = process.env.BOOKING_TEST_URL || 'http://localhost:3100'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')

;(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  let checks = 0
  const ok = (value, message) => { assert.ok(value, message); checks++ }
  try {
    for (const width of [390, 360, 320]) {
      const page = await (await browser.newContext({ viewport: { width, height: 800 }, hasTouch: true, isMobile: true })).newPage()
      await page.addInitScript(() => { if (window.top === window) localStorage.setItem('cookie-consent', 'declined') })
      await page.goto(`${base}/landlords`, { waitUntil: 'networkidle' })
      ok(await page.evaluate(() => document.querySelector('nav.pill').dataset.on) === 'false', `${width}: no pill at the top`)
      await page.evaluate(() => scrollTo(0, 1600)); await page.waitForTimeout(900)
      const s = await page.evaluate(() => {
        const n = document.querySelector('nav.pill'), r = n.getBoundingClientRect()
        const shown = [...n.querySelectorAll('a, button')].filter(e => getComputedStyle(e).display !== 'none' && e.closest('li, nav') && getComputedStyle(e.closest('li') || n).display !== 'none').map(e => e.getAttribute('href') || e.getAttribute('aria-label'))
        return { on: n.dataset.on, top: Math.round(r.top), left: r.left, right: r.right, shown, bar: Math.round(document.querySelector('header.sh').getBoundingClientRect().bottom) }
      })
      ok(s.on === 'true' && s.top === 10, `${width}: the pill docks 10 px down (${JSON.stringify(s)})`)
      ok(s.left >= 8 && s.right <= width - 8, `${width}: the pill fits the screen`)
      ok(s.bar <= 0, `${width}: the bar has scrolled away`)
      ok(JSON.stringify(s.shown) === JSON.stringify(['/', '/landlords', '/pricing', 'Open menu']), `${width}: mark, Landlords, Pricing, menu (${s.shown})`)
      await page.locator('.pill__menu').tap(); await page.waitForTimeout(400)
      ok(await page.locator('#mobile-nav-panel').isVisible(), `${width}: the pill's menu opens the sheet`)
      await page.keyboard.press('Escape'); await page.waitForTimeout(300)
      ok(await page.evaluate(() => document.activeElement?.classList.contains('pill__menu')), `${width}: focus returns to the pill's menu button`)
      await page.close()
    }
    console.log(`PASS phone pill: ${checks} checks (hidden at the top, docked 10 px down at 390/360/320, fits, bar gone, four controls, menu opens and returns focus)`)
  } finally {
    await browser.close()
  }
})().catch(err => { console.error(err); process.exitCode = 1 })
