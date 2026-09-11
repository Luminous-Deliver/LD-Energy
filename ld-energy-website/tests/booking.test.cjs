const { test } = require('node:test')
const assert = require('node:assert/strict')
const { pricing, EXPRESS_SURCHARGE, site } = require('../lib/site.ts')
const { areaBands, legacyPropertyTypes } = require('../lib/floor-area.ts')
const { contactSchema, PRE_ASSESSMENT, BULK, EXPRESS_SPEED } = require('../lib/validators.ts')
const { guideEstimate, guideEstimateLine, guideEstimateRows } = require('../lib/pricing-estimate.ts')
const { quoteHref, parseQuoteContext, quoteServices } = require('../lib/quote-context.ts')
const { POST } = require('../app/api/contact/route.ts')
const { boroughMeta } = require('../lib/boroughs.ts')
const { sourcePages, ctaIds, customerTypeForSource } = require('../lib/enquiry-attribution.ts')

const sample = { name: 'Test Customer', email: 'test@example.invalid', phone: '07000000000', address: '1 Test Road', postcode: 'E15 1AA', areaBand: '53-70', services: ['EPC Certificate'], customerType: 'Homeowner', speed: 'Standard (72 hours)', consent: true, turnstileToken: 'mock-token', website: '' }

test('every service and band retains prices and eligible extras; unknown and absent area never have a total', () => {
  for (const [service, label] of Object.entries(quoteServices)) {
    for (const [index, areaBand] of areaBands.entries()) {
      for (const express of [false, true]) for (const plan of [false, true]) {
        const estimate = guideEstimate({ areaBand, services: [label], speed: express ? EXPRESS_SPEED : sample.speed, improvementPlan: plan })
        const lodged = service === 'epc' || service === 'bundle'
        const base = service === 'bulk' ? null : service === 'bundle' ? pricing[index].bundle : service === 'floor-plan' ? pricing[index].floorPlan : pricing[index].epc
        assert.equal(estimate.total, base === null ? null : base + (lodged && express ? EXPRESS_SURCHARGE : 0) + (lodged && plan ? site.addOns.improvementPlan : 0))
        assert.equal(estimate.isLodged, lodged)
        assert.equal(estimate.planIncluded, service === 'pre-assessment')
      }
    }
    for (const areaBand of ['', undefined, 'unknown']) {
      const estimate = guideEstimate({ areaBand, services: [label], speed: EXPRESS_SPEED, improvementPlan: true })
      assert.equal(estimate.total, null)
      assert.deepEqual(guideEstimateRows(estimate), [])
      assert.doesNotMatch(guideEstimateLine(estimate), /£0|£85|NaN|null|undefined/)
    }
  }
})

test('server schema accepts unknown area and legacy clients, rejects missing/conflicting size and mixed services', () => {
  assert.equal(contactSchema.safeParse({ ...sample, areaBand: 'unknown' }).success, true)
  assert.equal(contactSchema.safeParse({ ...sample, areaBand: '' }).success, false)
  for (const [index, propertyType] of legacyPropertyTypes.entries()) {
    const legacy = { ...sample, areaBand: undefined, propertyType }
    assert.equal(contactSchema.safeParse(legacy).success, true)
    assert.equal(guideEstimate(legacy).total, pricing[index].epc)
    assert.equal(contactSchema.safeParse({ ...legacy, areaBand: areaBands[index] }).success, true)
    assert.equal(contactSchema.safeParse({ ...legacy, areaBand: 'unknown' }).success, false)
  }
  assert.equal(contactSchema.safeParse({ ...sample, services: [BULK], areaBand: '', address: '', postcode: '', propertyCount: '20+' }).success, true)
  assert.equal(contactSchema.safeParse({ ...sample, services: [BULK], propertyCount: '' }).success, false)
  assert.equal(contactSchema.safeParse({ ...sample, services: [PRE_ASSESSMENT, 'EPC Certificate'] }).success, false)
  assert.equal(contactSchema.safeParse({ ...sample, services: ['EPC Certificate', 'Floor Plan'] }).success, true)
})

test('quote links allow only safe selections, preserve intent and never contain customer data or prices', () => {
  for (const service of Object.keys(quoteServices)) {
    const url = new URL(quoteHref({ service, area: 'unknown', speed: 'express', plan: true, name: 'secret', total: 123 }), site.url)
    const context = parseQuoteContext(url.searchParams)
    assert.equal(context.service, service)
    assert.equal(context.area, 'unknown')
    assert.equal(context.plan, ['epc', 'bundle'].includes(service))
    assert.equal(url.hash, '#booking-form')
    assert.doesNotMatch(url.search, /secret|123|total|name/)
  }
  const context = parseQuoteContext(new URLSearchParams('service=__proto__&area=address&speed=tomorrow&plan=evil'))
  assert.equal(context.service, 'epc')
  assert.equal(context.area, undefined)
})

test('customer type is required; only landlord and agency context initialise it', () => {
  for (const source of [undefined, 'home', 'contact', 'sellers', 'area']) assert.equal(customerTypeForSource(source), '')
  assert.equal(customerTypeForSource('landlords'), 'Landlord (tenanted)')
  assert.equal(customerTypeForSource('estate-agents'), 'Estate agent')
  assert.equal(contactSchema.safeParse({ ...sample, customerType: '' }).success, false)
  assert.equal(contactSchema.safeParse({ ...sample, customerType: undefined }).success, false)
})

test('operational attribution accepts only controlled categories and never URL text or identifiers', () => {
  for (const sourcePage of sourcePages) for (const ctaId of ctaIds) {
    const url = new URL(quoteHref({ sourcePage, ctaId }), site.url)
    assert.equal(parseQuoteContext(url.searchParams).sourcePage, sourcePage)
    assert.equal(parseQuoteContext(url.searchParams).ctaId, ctaId)
    assert.equal(contactSchema.safeParse({ ...sample, sourcePage, ctaId }).success, true)
  }
  for (const value of ['<script>', 'https://example.invalid/customer', '__proto__', 'click-123']) {
    assert.equal(contactSchema.safeParse({ ...sample, sourcePage: value }).success, false)
    assert.equal(contactSchema.safeParse({ ...sample, ctaId: value }).success, false)
    assert.equal(parseQuoteContext(new URLSearchParams({ source: value, cta: value })).sourcePage, undefined)
    assert.doesNotMatch(quoteHref({ sourcePage: value, ctaId: value }), /source=|cta=/)
  }
  const clean = contactSchema.parse({ ...sample, referrer: 'private', trackingId: 'secret', query: 'address=private' })
  assert.equal(clean.referrer, undefined)
  assert.equal(clean.trackingId, undefined)
  assert.equal(clean.query, undefined)
})

test('form add-on copy uses the approved additional-product model', () => {
  const form = require('node:fs').readFileSync(require('node:path').join(__dirname, '../components/forms/ContactForm.tsx'), 'utf8')
  assert.match(form, /Add the EPC Improvement Plan/)
  assert.match(form, /Your standard EPC recommendations are included either way\./)
  assert.doesNotMatch(form, /Recommendations remain on your EPC|£9|fixed rating gains/)
})

test('contact API security, recalculation and both email representations with delivery mocked', async () => {
  const previous = { fetch: global.fetch, node: process.env.NODE_ENV, turnstile: process.env.TURNSTILE_SECRET_KEY, resend: process.env.RESEND_API_KEY }
  process.env.NODE_ENV = 'production'
  process.env.TURNSTILE_SECRET_KEY = 'test-only-secret'
  process.env.RESEND_API_KEY = 'test-only-key'
  let messages = [], verification = true, providerStatus = 200
  global.fetch = async (url, options) => {
    if (url.includes('siteverify')) return Response.json({ success: verification })
    assert.equal(url, 'https://api.resend.com/emails')
    messages.push(JSON.parse(options.body))
    return Response.json({ id: 'mock-message' }, { status: providerStatus })
  }
  const request = (data, origin = site.url) => POST(new Request(site.url + '/api/contact', { method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify(data) }))
  try {
    assert.equal(Object.keys(boroughMeta).length, 34)
    for (const [areaPage, area] of Object.entries(boroughMeta)) {
      messages = []
      assert.equal((await request({ ...sample, areaPage, sourcePage: 'area', ctaId: 'pricing' })).status, 200)
      assert.ok(messages[0].text.includes(`Area page: ${area.name}`))
      assert.ok(messages[0].html.includes(area.name.replace(/&/g, '&amp;').replace(/'/g, '&#39;')))
      assert.match(messages[0].text, /Source page: area\nCTA: pricing/)
      assert.match(messages[0].text, /Internal floor area: 53/)
      assert.doesNotMatch(messages[1].text + messages[1].html, /Area page|Source page|>CTA</)
    }
    for (const areaPage of ['__proto__', '<img src=x onerror=alert(1)>', 'invented-borough', '']) {
      messages = []
      assert.equal((await request({ ...sample, areaPage })).status, 400)
      assert.equal(messages.length, 0)
    }
    for (const field of ['sourcePage', 'ctaId', 'customerType']) {
      messages = []
      assert.equal((await request({ ...sample, [field]: '<script>' })).status, 400)
      assert.equal(messages.length, 0)
    }
    for (const services of Object.values(quoteServices).map(value => [value])) {
      messages = []
      const result = await request({ ...sample, services, propertyCount: '12', areaBand: 'unknown', total: 1, name: '<Test Customer>' })
      assert.equal(result.status, 200)
      assert.equal(messages.length, 2)
      assert.match(messages[1].text, /confirmed only once you agree/)
      assert.match(messages[1].html, /confirmed only once you agree/)
      assert.doesNotMatch(messages[1].html, /one of our team/)
      for (const message of messages) {
        assert.doesNotMatch(message.html, /<Test Customer>|£null|£undefined|£0|£85/)
        assert.doesNotMatch(message.text, /undefined|NaN/)
        assert.match(message.text, /quoted individually|exact quote after reviewing/i)
      }
    }
    messages = []
    assert.equal((await request({ ...sample, services: ['Both (Bundle)'], speed: EXPRESS_SPEED, improvementPlan: true, total: 1 })).status, 200)
    assert.match(messages[0].text, /£185 guide/)
    assert.match(messages[1].text, /£185 guide/)
    assert.equal((await request(sample, 'https://evil.invalid')).status, 403)
    assert.equal((await request({ ...sample, notes: 'x'.repeat(11000) })).status, 413)
    assert.equal((await request({ ...sample, propertyType: 'Studio' })).status, 400)
    assert.equal((await request({ ...sample, website: 'bot' })).status, 400)
    verification = false; assert.equal((await request(sample)).status, 400)
    verification = true; providerStatus = 500; assert.equal((await request(sample)).status, 502)
    delete process.env.TURNSTILE_SECRET_KEY; assert.equal((await request(sample)).status, 503)
    process.env.TURNSTILE_SECRET_KEY = 'test-only-secret'; delete process.env.RESEND_API_KEY
    assert.equal((await request(sample)).status, 503)
  } finally {
    global.fetch = previous.fetch
    for (const [key, value] of [['NODE_ENV', previous.node], ['TURNSTILE_SECRET_KEY', previous.turnstile], ['RESEND_API_KEY', previous.resend]]) value === undefined ? delete process.env[key] : process.env[key] = value
  }
})
