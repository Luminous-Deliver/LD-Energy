// Run with --require ./tests/register.cjs against the isolated production preview.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { boroughMeta } = require('../lib/boroughs.ts')
const base = process.env.BOOKING_TEST_URL || 'http://localhost:3110'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')
const out = path.resolve(process.env.BOOKING_EVIDENCE_DIR || '../../../audits/website-growth-audit/ld-energy-stage1-review-fix-2026-09-11')

;(async () => {
  const report = []
  assert.equal(Object.keys(boroughMeta).length, 34)
  for (const slug of Object.keys(boroughMeta)) {
    const response = await fetch(`${base}/areas/${slug}`)
    assert.equal(response.status, 200)
    const html = await response.text()
    const anchors = [...html.matchAll(/<a\b[^>]*>/g)].map(match => match[0].replaceAll('&amp;', '&'))
    for (const cta of ['hero','pricing','bottom']) {
      const found = anchors.filter(anchor => anchor.includes(`data-enquiry-cta="${cta}"`))
      assert.equal(found.length, 1, `${slug}: ${cta}`)
      assert.ok(found[0].includes(`href="/contact?service=epc&source=area&cta=${cta}&borough=${slug}#booking-form"`), `${slug}: ${cta} href`)
    }
    // No form on area pages: the hero price card links each size into /contact (16/10/2026 evening).
    assert.equal((html.match(/<form\b/g) || []).length, 0)
    const prices = anchors.filter(anchor => anchor.includes('class="hpc__price"'))
    assert.equal(prices.length, 12, `${slug}: six sizes x EPC and bundle`)
    for (const a of prices) assert.ok(a.includes(`borough=${slug}`) && /area=[0-9a-z-]+/.test(a), `${slug}: price link ${a}`)
    assert.match(html, new RegExp(`<link[^>]+rel="canonical"[^>]+href="https://epc.luminousanddeliver.co.uk/areas/${slug}"`))
    report.push({ slug, hero: 'contact', pricing: 'contact', bottom: 'contact', priceLinks: prices.length, form: false })
  }
  fs.writeFileSync(path.join(out, 'area-cta-survey.json'), JSON.stringify(report, null, 2))
  console.log('PASS all 34 rendered area pages: hero/pricing/bottom anchors to /contact with the slug, 12 price links, no form, original canonical')
})().catch(error => { console.error(error); process.exitCode = 1 })
