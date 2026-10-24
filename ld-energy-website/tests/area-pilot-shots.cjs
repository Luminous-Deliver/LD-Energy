// Full-page phone screenshots (390 px) of the rebuilt area pages, plus an overflow check: no element may
// stick out past the viewport's right edge. Run against a local build:
//   BOOKING_TEST_URL=http://localhost:3100 SHOTS_DIR=<folder> node tests/area-pilot-shots.cjs [slug,slug]
// Browser: Brave when PLAYWRIGHT_MCP_EXECUTABLE_PATH is set, otherwise Edge (as the other browser tests).
const { chromium } = require('playwright')
const path = require('node:path')
const fs = require('node:fs')

const base = process.env.BOOKING_TEST_URL || 'http://localhost:3100'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')
const dir = process.env.SHOTS_DIR || path.join(__dirname, '..', '.shots')
const slugs = (process.argv[2] || 'stratford,newham,croydon,wandsworth,waltham-forest,greenwich,lambeth,brent,tower-hamlets,camden,barking-dagenham').split(',')

;(async () => {
  fs.mkdirSync(dir, { recursive: true })
  const exe = process.env.PLAYWRIGHT_MCP_EXECUTABLE_PATH
  const browser = await chromium.launch(exe ? { executablePath: exe, headless: true } : { channel: 'msedge', headless: true })
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true })
  let failed = false
  for (const slug of slugs) {
    await page.goto(`${base}/areas/${slug}`, { waitUntil: 'networkidle' })
    // Let reveal-on-scroll content settle: scroll to the bottom and back.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)) }
      window.scrollTo(0, 0)
    })
    const overflow = await page.evaluate(() => {
      const w = document.documentElement.clientWidth
      return [...document.querySelectorAll('main *')]
        .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.right > w + 1 && getComputedStyle(el).position !== 'fixed' })
        // Inside a scroll box or a clipped screen-reader block is fine; the page-width check below catches leaks.
        .filter((el) => !el.closest('.overflow-x-auto, .sr-only'))
        .slice(0, 5)
        .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} right=${Math.round(el.getBoundingClientRect().right)}`)
    })
    const height = await page.evaluate(() => document.documentElement.scrollHeight)
    const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    if (pageWidth > 390) overflow.push(`page is ${pageWidth}px wide`)
    const file = path.join(dir, `${slug}-390.png`)
    await page.screenshot({ path: file, fullPage: true })
    console.log(`${slug}: ${height}px tall, ${overflow.length ? 'OVERFLOW ' + overflow.join(' | ') : 'no horizontal overflow'} -> ${file}`)
    if (overflow.length) failed = true
  }
  await browser.close()
  process.exit(failed ? 1 : 0)
})().catch((e) => { console.error(e); process.exit(1) })
