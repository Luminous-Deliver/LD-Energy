// Run with --require ./tests/register.cjs against the isolated production preview.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { boroughMeta } = require('../lib/boroughs.ts')
const base = process.env.BOOKING_TEST_URL || 'http://localhost:3110'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')
const out = path.resolve('../../../audits/website-growth-audit/ld-energy-stage1-review-fix-2026-09-11')

;(async () => {
  const report = []
  assert.equal(Object.keys(boroughMeta).length, 34)
  for (const slug of Object.keys(boroughMeta)) {
    const response = await fetch(`${base}/areas/${slug}`)
    assert.equal(response.status, 200)
    const html = await response.text()
    const anchors = [...html.matchAll(/<a\b[^>]*>/g)].map(match => match[0])
    for (const cta of ['hero','pricing','bottom']) {
      const found = anchors.filter(anchor => anchor.includes(`data-enquiry-cta="${cta}"`))
      assert.equal(found.length, 1, `${slug}: ${cta}`)
      assert.match(found[0], /href="#contact"/)
    }
    assert.equal((html.match(/<form\b/g) || []).length, 1)
    assert.match(html, /id="contact"/)
    assert.match(html, new RegExp(`<link[^>]+rel="canonical"[^>]+href="https://epc.luminousanddeliver.co.uk/areas/${slug}"`))
    report.push({ slug, hero: '#contact', pricing: '#contact', bottom: '#contact', sharedForm: true })
  }
  fs.writeFileSync(path.join(out, 'area-cta-survey.json'), JSON.stringify(report, null, 2))
  console.log('PASS all 34 rendered area pages: explicit hero/pricing/bottom anchors, one form, original canonical')
})().catch(error => { console.error(error); process.exitCode = 1 })
