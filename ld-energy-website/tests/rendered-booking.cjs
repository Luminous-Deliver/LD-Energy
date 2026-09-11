const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const base = process.env.BOOKING_TEST_URL || 'http://localhost:3110'
const out = path.resolve('../../../audits/website-growth-audit/ld-energy-stage1-2026-09-10')
const baseline = JSON.parse(fs.readFileSync(path.resolve('../../../audits/website-growth-audit/ld-energy-phase1-2026-09-10/crawl.json'), 'utf8'))
// ff9efbf updated this existing article before Stage 1 began, after the audit crawl.
function withoutEarlierArticleUpdate(value) {
  if (typeof value === 'string' && value.startsWith('RdSAP 10: What Changed in 2025')) return 'RdSAP article title updated in ff9efbf'
  if (Array.isArray(value)) return value.map(withoutEarlierArticleUpdate)
  if (value && typeof value === 'object') {
    if (['BlogPosting', 'Article'].includes(value['@type']) && JSON.stringify(value).includes('/blog/rdsap-10-what-changed-2025')) return 'Article updated before Stage 1: ff9efbf'
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, withoutEarlierArticleUpdate(item)]))
  }
  return value
}

;(async () => {
  const sitemap = await (await fetch(base + '/sitemap.xml')).text()
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1])
  const report = []
  for (let index = 0; index < urls.length; index += 6) {
    await Promise.all(urls.slice(index, index + 6).map(async url => {
      const route = new URL(url).pathname
      const response = await fetch(base + route)
      assert.equal(response.status, 200, route)
      const html = await response.text()
      const canonicalTag = html.match(/<link\b[^>]*rel="canonical"[^>]*>/)?.[0]
      const canonical = canonicalTag?.match(/href="([^"]+)"/)?.[1]
      assert.equal(canonical, url.replace(/\/$/, ''), route)
      const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)]
      assert.equal(headings.length, 1, route)
      const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]))
      assert.doesNotMatch(JSON.stringify(schemas), /AggregateRating/)
      const before = baseline.find(item => item.url === url)
      if (before) {
        assert.equal(canonical, before.canonical, route)
        assert.deepEqual(withoutEarlierArticleUpdate(schemas), withoutEarlierArticleUpdate(before.schemas), `Structured data changed: ${route}`)
      }
      const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(match => match[1].replace(/&amp;/g, '&'))
      report.push({ route, status: response.status, canonical, schemas: schemas.length, quoteLinks: links.filter(href => href.includes('/contact')) })
    }))
  }
  assert.equal(report.filter(item => item.route.startsWith('/areas/')).length, 34)
  for (const query of ['?service=bundle&area=unknown', '?service=epc&plan=1&speed=express', '?service=malicious&area=address']) {
    const html = await (await fetch(base + '/contact' + query)).text()
    assert.match(html, /rel="canonical" href="https:\/\/epc.luminousanddeliver.co.uk\/contact"/)
    assert.match(html, /id="booking-form"/)
  }
  const redirect = await fetch(base + '/services/retrofit-consultation', { redirect: 'manual' })
  assert.equal(redirect.status, 308)
  assert.match(redirect.headers.get('location'), /\/services\/epc-improvement-plan$/)
  assert.equal((await fetch(base + '/stage-one-test-not-a-page')).status, 404)
  fs.writeFileSync(path.join(out, 'rendered-regression.json'), JSON.stringify(report.sort((a,b) => a.route.localeCompare(b.route)), null, 2))
  console.log(`PASS ${report.length} sitemap pages: status, H1, clean canonical, JSON-LD; all 34 locations retained; query variants, redirect and 404 verified`)
})().catch(error => { console.error(error); process.exitCode = 1 })
