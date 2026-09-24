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
  let messages = [], verification = true, providerStatus = 200, confirmationStatus = 200
  global.fetch = async (url, options) => {
    if (url.includes('siteverify')) return Response.json({ success: verification })
    assert.equal(url, 'https://api.resend.com/emails')
    messages.push(JSON.parse(options.body))
    // The first send is the internal notification, the second the customer confirmation.
    return Response.json({ id: 'mock-message' }, { status: messages.length === 2 ? confirmationStatus : providerStatus })
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

    // Downstream scripts and /quote-reply match these subjects exactly.
    assert.match(messages[0].subject, /^EPC booking: /)
    assert.equal(messages[1].subject, 'We’ve received your EPC request — L&D Energy')
    // Internal notification: one tap to the customer.
    assert.match(messages[0].html, /href="https:\/\/wa\.me\/447000000000"/)
    assert.match(messages[0].html, /href="tel:07000000000"/)
    assert.match(messages[0].text, /Reply by WhatsApp: https:\/\/wa\.me\/447000000000/)
    // Confirmation: next steps, the lodgement promise the customer chose, the prep checklist, no emoji or em dash in the body.
    for (const body of [messages[1].text, messages[1].html]) {
      assert.match(body, /What happens next/)
      assert.match(body, /within 24 hours/)
      assert.match(body, /Before your visit/)
      assert.match(body, /preparing-for-your-epc#what-to-have-ready/)
      assert.match(body, /Booking as/)
    }
    assert.doesNotMatch(messages[1].html, /&#128222;/)
    assert.doesNotMatch(messages[1].text, /—/)

    // Floor plans and portfolios have no EPC survey, so no EPC checklist; tenants are only mentioned to landlords.
    for (const services of [['Floor Plan'], [BULK]]) {
      messages = []
      assert.equal((await request({ ...sample, services, propertyCount: '5' })).status, 200)
      assert.doesNotMatch(messages[1].html, /Before your visit/)
    }
    messages = []
    assert.equal((await request({ ...sample, customerType: 'Landlord (tenanted)', preferredDate: '2026-10-07', notes: 'Key with <neighbour>' })).status, 200)
    assert.match(messages[1].html, /Tenanted property\?/)
    assert.match(messages[1].text, /Preferred date: 07\/10\/2026/)
    assert.match(messages[0].text, /Preferred Date: 07\/10\/2026/)
    assert.match(messages[1].html, /Key with &lt;neighbour&gt;/)

    // The response says whether the customer's copy actually went, so the page never claims it did when it did not.
    messages = []
    let response = await request(sample)
    assert.deepEqual(await response.json(), { ok: true, delivered: true, confirmationSent: true })
    messages = []; confirmationStatus = 500
    response = await request(sample)
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { ok: true, delivered: true, confirmationSent: false })
    confirmationStatus = 200

    // The production pages.dev alias is the same deployment; other origins stay refused.
    assert.equal((await request(sample, 'https://epc-euc.pages.dev')).status, 200)
    assert.equal((await request(sample, 'https://preview.epc-euc.pages.dev')).status, 403)
    assert.equal((await request(sample, 'https://evil.invalid')).status, 403)
    assert.equal((await request({ ...sample, notes: 'x'.repeat(11000) })).status, 413)
    assert.equal((await request({ ...sample, propertyType: 'Studio' })).status, 400)
    assert.equal((await request({ ...sample, website: 'bot' })).status, 400)
    verification = false
    response = await request(sample)
    assert.equal(response.status, 400)
    assert.equal((await response.json()).code, 'security')
    verification = true; providerStatus = 500; assert.equal((await request(sample)).status, 502)
    delete process.env.TURNSTILE_SECRET_KEY; assert.equal((await request(sample)).status, 503)
    process.env.TURNSTILE_SECRET_KEY = 'test-only-secret'; delete process.env.RESEND_API_KEY
    assert.equal((await request(sample)).status, 503)
  } finally {
    global.fetch = previous.fetch
    for (const [key, value] of [['NODE_ENV', previous.node], ['TURNSTILE_SECRET_KEY', previous.turnstile], ['RESEND_API_KEY', previous.resend]]) value === undefined ? delete process.env[key] : process.env[key] = value
  }
})

test('health route reports runtime-resolved secrets as booleans, never values', async () => {
  const { GET } = require('../app/api/health/route.ts')
  const names = ['TURNSTILE_SECRET_KEY', 'RESEND_API_KEY', 'RESEND_WEBHOOK_SECRET']
  const previous = Object.fromEntries(names.map(name => [name, process.env[name]]))
  const previousFetch = global.fetch
  global.fetch = async () => { throw new Error('health must not call upstream services') }
  try {
    for (const name of names) process.env[name] = `test-only-${name}`
    let response = await GET()
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    const body = await response.json()
    assert.deepEqual(body, { ok: true, checks: { TURNSTILE_SECRET_KEY: true, RESEND_API_KEY: true, RESEND_WEBHOOK_SECRET: true } })
    assert.doesNotMatch(JSON.stringify(body), /test-only/)
    // An empty string is how a blanked Pages secret resolves; it must read as missing.
    process.env.RESEND_API_KEY = ''
    response = await GET()
    assert.equal(response.status, 503)
    assert.deepEqual((await response.json()).checks, { TURNSTILE_SECRET_KEY: true, RESEND_API_KEY: false, RESEND_WEBHOOK_SECRET: true })
  } finally {
    global.fetch = previousFetch
    for (const name of names) previous[name] === undefined ? delete process.env[name] : process.env[name] = previous[name]
  }
})

test('form classifies send failures and never shows raw server text to the customer', () => {
  const fs = require('node:fs'), path = require('node:path')
  const form = fs.readFileSync(path.join(__dirname, '../components/forms/ContactForm.tsx'), 'utf8')
  assert.doesNotMatch(form, /body\.error/)
  assert.match(form, /body\.code === 'security'/)
  const route = fs.readFileSync(path.join(__dirname, '../app/api/contact/route.ts'), 'utf8')
  // The daily health check greps this exact sentence; the form reads the code beside it.
  assert.match(route, /error: 'Security verification failed\. Please refresh and try again\.', code: 'security'/)
})

test('customer types, next steps, dates and the fallback summary', () => {
  const { customerTypeChoices, nextSteps, formatPreferredDate, enquirySummaryText, hasPrepChecklist, serviceLabel } = require('../lib/booking-copy.ts')
  assert.deepEqual(customerTypeChoices(true).map(choice => choice.value), ['Landlord (tenanted)', 'Estate agent', 'Letting agent / firm'])
  assert.deepEqual(customerTypeChoices(false).map(choice => choice.value), ['Homeowner', 'Landlord (tenanted)', 'Estate agent', 'Letting agent / firm'])
  for (const kind of ['epc', 'bundle', 'floorPlan', 'preAssessment', 'bulk', 'none']) {
    const steps = nextSteps(kind, 'Standard (72 hours)')
    assert.ok(steps.length >= 2)
    for (const step of steps) assert.doesNotMatch(step, /—|undefined|minutes/)
    assert.match(steps[0], /Mon–Sun, 8am–8pm/)
  }
  assert.match(nextSteps('epc', EXPRESS_SPEED).at(-1), /within 24 hours/)
  assert.match(nextSteps('epc', 'Standard (72 hours)').at(-1), /within 72 hours/)
  assert.match(nextSteps('preAssessment').at(-1), /Nothing is lodged/)
  assert.deepEqual(['epc', 'bundle', 'preAssessment', 'floorPlan', 'bulk'].map(hasPrepChecklist), [true, true, true, false, false])
  assert.equal(formatPreferredDate('2026-10-07'), '07/10/2026')
  assert.equal(formatPreferredDate('next Tuesday'), 'next Tuesday')
  assert.equal(formatPreferredDate(''), '')
  assert.equal(serviceLabel(BULK), 'Agency / portfolio enquiry')
  const summary = enquirySummaryText({ ...sample, services: ['Both (Bundle)'], speed: EXPRESS_SPEED, improvementPlan: true, preferredDate: '2026-10-07', notes: 'Side gate' })
  for (const expected of ['Service: EPC + Floor Plan', 'Floor area: 53–70 m²', 'I am: Homeowner', 'Lodgement: next day', 'Add-on: EPC Improvement Plan', 'Address: 1 Test Road, E15 1AA', 'Preferred date: 07/10/2026', 'Notes: Side gate', 'Name: Test Customer', 'Phone: 07000000000', 'Email: test@example.invalid']) assert.ok(summary.includes(expected), expected)
  const bulk = enquirySummaryText({ ...sample, services: [BULK], customerType: 'Estate agent', propertyCount: '20+', address: 'A\nB', postcode: '' })
  assert.match(bulk, /Properties: 20\+/)
  assert.match(bulk, /Properties and postcodes: A\nB/)
  assert.doesNotMatch(bulk, /Floor area|Address:/)
})
