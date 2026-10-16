// Homepage intro (16/10/2026): skipped on Data Saver and 2G/3G connections, shown otherwise,
// including browsers with no navigator.connection (Safari, Firefox).
// Run against a local production build: npx next start -p 3120, then
//   node tests/intro-connection.cjs   (BOOKING_TEST_URL overrides the base)
const { chromium } = require('playwright')

const base = process.env.BOOKING_TEST_URL || 'http://localhost:3120'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')

const cases = [
  { name: '4g', connection: { effectiveType: '4g', saveData: false }, intro: true },
  { name: 'no Network Information API', connection: undefined, intro: true },
  { name: '3g', connection: { effectiveType: '3g', saveData: false }, intro: false },
  { name: '2g', connection: { effectiveType: '2g', saveData: false }, intro: false },
  { name: 'slow-2g', connection: { effectiveType: 'slow-2g', saveData: false }, intro: false },
  { name: '4g with Data Saver', connection: { effectiveType: '4g', saveData: true }, intro: false },
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
      await page.goto(`${base}/`, { waitUntil: 'load' })
      const seen = await page.evaluate(() => window.__introSeen)
      if (seen !== c.intro) fails.push(`${c.name}: intro ${seen ? 'shown' : 'skipped'}, expected ${c.intro ? 'shown' : 'skipped'}`)
      else console.log(`ok  ${c.name}: intro ${seen ? 'shown' : 'skipped'}`)
      await context.close()
    }
  } finally {
    await browser.close()
  }
  if (fails.length) {
    console.error(fails.join('\n'))
    process.exit(1)
  }
})()
