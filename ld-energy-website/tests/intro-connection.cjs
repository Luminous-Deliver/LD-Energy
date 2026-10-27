// The homepage intro overlay is gone (Abdul 23/10/2026, the redesign): on every connection type the page paints
// straight away, no .ld-intro is ever added and nothing covers the hero. Replaces the 16/10 test, which checked the
// intro was skipped only on Data Saver and 2G/3G.
// Run against a local production build:
//   BOOKING_TEST_URL=http://localhost:3104 node tests/intro-connection.cjs
const { chromium } = require('playwright')

const base = process.env.BOOKING_TEST_URL || 'http://localhost:3104'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')

const cases = [
  { name: '4g', connection: { effectiveType: '4g', saveData: false } },
  { name: 'no Network Information API', connection: undefined },
  { name: '3g', connection: { effectiveType: '3g', saveData: false } },
  { name: '4g with Data Saver', connection: { effectiveType: '4g', saveData: true } },
]

;(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  const fails = []
  try {
    for (const c of cases) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
      await context.addInitScript((conn) => {
        Object.defineProperty(Navigator.prototype, 'connection', { configurable: true, get: () => conn })
        window.__introSeen = false
        new MutationObserver((records) => {
          for (const r of records) for (const n of r.addedNodes) if (n.classList && n.classList.contains('ld-intro')) window.__introSeen = true
        }).observe(document, { childList: true, subtree: true })
      }, c.connection)
      const page = await context.newPage()
      await page.goto(base + '/', { waitUntil: 'networkidle' })
      const seen = await page.evaluate(() => window.__introSeen)
      const covered = await page.evaluate(() => { const h = document.querySelector('#hero-quote').getBoundingClientRect(); const el = document.elementFromPoint(h.left + h.width / 2, h.top + h.height / 2); return !el || !el.closest('#hero-quote') })
      if (seen) fails.push(`${c.name}: the intro overlay appeared`)
      if (covered) fails.push(`${c.name}: something covers the hero's quote button`)
      await context.close()
    }
    const html = await (await fetch(base + '/')).text()
    if (/ld-intro/.test(html)) fails.push('the served HTML still carries the intro script')
  } finally {
    await browser.close()
  }
  if (fails.length) { console.error(fails.join('\n')); process.exit(1) }
  console.log(`PASS no homepage intro: ${cases.length} connection types, no overlay, the hero's quote button uncovered, no intro script in the HTML`)
})()
