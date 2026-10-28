const { test } = require('node:test')
const assert = require('node:assert/strict')
const { pricing, SAME_DAY_LODGEMENT_SURCHARGE, NEXT_DAY_VISIT_SURCHARGE, site } = require('../lib/site.ts')
const { areaBands, legacyPropertyTypes } = require('../lib/floor-area.ts')
const { contactSchema, PRE_ASSESSMENT, BULK, SAME_DAY_LODGEMENT_SPEED, NEXT_DAY_VISIT_SPEED, LEGACY_EXPRESS_SPEED } = require('../lib/validators.ts')
const { guideEstimate, guideEstimateLine, guideEstimateRows } = require('../lib/pricing-estimate.ts')
const { quoteHref, parseQuoteContext, quoteServices } = require('../lib/quote-context.ts')
const { POST } = require('../app/api/contact/route.ts')
const { boroughMeta } = require('../lib/boroughs.ts')
const { sourcePages, ctaIds, customerTypeForSource } = require('../lib/enquiry-attribution.ts')

const sample = { name: 'Test Customer', email: 'test@example.invalid', phone: '07000000000', address: '1 Test Road', postcode: 'E15 1AA', areaBand: '55-75', dwellingType: 'Flat', services: ['EPC Certificate'], customerType: 'Homeowner', speed: 'Standard (72 hours)', consent: true, turnstileToken: 'mock-token', website: '' }

test('every service and band retains prices and eligible extras; unknown and absent area never have a total', () => {
  for (const [service, label] of Object.entries(quoteServices)) {
    for (const [index, areaBand] of areaBands.entries()) {
      const speedExtras = [[sample.speed, 0], [SAME_DAY_LODGEMENT_SPEED, SAME_DAY_LODGEMENT_SURCHARGE], [NEXT_DAY_VISIT_SPEED, NEXT_DAY_VISIT_SURCHARGE]]
      for (const [speed, extra] of speedExtras) for (const plan of [false, true]) {
        const estimate = guideEstimate({ areaBand, services: [label], speed, improvementPlan: plan })
        const lodged = service === 'epc' || service === 'bundle'
        const base = service === 'bulk' ? null : service === 'bundle' ? pricing[index].bundle : service === 'floor-plan' ? pricing[index].floorPlan
          : service === 'pre-assessment' ? pricing[index].preAssessment : pricing[index].epc
        assert.equal(estimate.total, base === null ? null : base + (lodged ? extra : 0) + (lodged && plan ? site.addOns.improvementPlan : 0))
        assert.equal(estimate.isLodged, lodged)
        assert.equal(estimate.planIncluded, service === 'pre-assessment')
        assert.equal(estimate.isStartingPrice, service !== 'bulk' && !!pricing[index].startingPrice)
      }
    }
    for (const areaBand of ['', undefined, 'unknown']) {
      const estimate = guideEstimate({ areaBand, services: [label], speed: NEXT_DAY_VISIT_SPEED, improvementPlan: true })
      assert.equal(estimate.total, null)
      // An unknown size never shows a figure for the service; a chosen extra may still be listed on its own.
      const rows = guideEstimateRows(estimate)
      if (areaBand !== 'unknown') assert.deepEqual(rows, [])
      for (const [rowLabel, value] of rows) assert.match(value, /^\+£\d+$|^Included/, rowLabel)
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
    // The open-ended top band asks for an approximate area or "I don't know the floor area".
    assert.equal(contactSchema.safeParse({ ...legacy, areaBand: areaBands[index], floorAreaUnknown: !!pricing[index].startingPrice }).success, true)
    assert.equal(contactSchema.safeParse({ ...legacy, areaBand: 'unknown' }).success, false)
  }
  assert.equal(contactSchema.safeParse({ ...sample, services: [BULK], areaBand: '', address: '', postcode: '', propertyCount: '20+' }).success, true)
  assert.equal(contactSchema.safeParse({ ...sample, services: [BULK], propertyCount: '' }).success, false)
  assert.equal(contactSchema.safeParse({ ...sample, services: [PRE_ASSESSMENT, 'EPC Certificate'] }).success, false)
  assert.equal(contactSchema.safeParse({ ...sample, services: ['EPC Certificate', 'Floor Plan'] }).success, true)
})

test('an exact floor area is optional, picks its own band and must agree with the band chosen', () => {
  const { parseExactArea, bandForArea, areaLabel } = require('../lib/floor-area.ts')
  const { enquirySummaryText } = require('../lib/booking-copy.ts')
  assert.equal(parseExactArea('85'), 85)
  assert.equal(parseExactArea(' 74.3 '), 74.3)
  assert.equal(parseExactArea('85 m2'), 85)
  assert.equal(parseExactArea('85m²'), 85)
  assert.equal(parseExactArea('134 sqm'), 134)
  // Spec §9: zero, negative and non-numeric values are rejected; any positive figure is accepted.
  for (const bad of ['', undefined, 'abc', '0', '0.0', '-50', '1,200', '85 sq ft', '1e3', '85.123']) assert.equal(parseExactArea(bad), undefined, String(bad))
  assert.equal(parseExactArea('9'), 9)
  assert.equal(parseExactArea('2001'), 2001)
  // Spec §9's boundaries: a band includes its ceiling, and decimals are never rounded into another band.
  for (const [m2, band] of [[0.5, 'up-to-40'], [40, 'up-to-40'], [40.5, '40-55'], [55, '40-55'], [55.5, '55-75'], [75, '55-75'], [75.5, '75-95'], [95, '75-95'], [95.5, '95-115'], [115, '95-115'], [115.5, 'over-115'], [134, 'over-115'], [2000, 'over-115']]) assert.equal(bandForArea(m2), band, String(m2))
  for (const [index, band] of pricing.entries()) if (band.areaMax) assert.equal(bandForArea(band.areaMax), areaBands[index])
  assert.equal(areaLabel('over-115', '134'), '134 m²')
  assert.equal(areaLabel('55-75', '74.30'), '74.3 m²')
  assert.equal(areaLabel('over-115', ''), '116 m² and over')
  assert.equal(areaLabel('over-115', 'lots'), '116 m² and over')
  assert.equal(areaLabel('53-70', ''), '53–70 m² (earlier price list)')
  assert.equal(contactSchema.safeParse({ ...sample, areaBand: 'over-115', floorArea: '134' }).success, true)
  assert.equal(contactSchema.safeParse({ ...sample, floorArea: '' }).success, true)
  // Spec 2: the top band needs an approximate figure, or "I don't know the floor area".
  assert.equal(contactSchema.safeParse({ ...sample, areaBand: 'over-115' }).success, false)
  assert.equal(contactSchema.safeParse({ ...sample, areaBand: 'over-115', floorAreaUnknown: true }).success, true)
  const mismatch = contactSchema.safeParse({ ...sample, areaBand: '55-75', floorArea: '134' })
  assert.equal(mismatch.success, false)
  assert.deepEqual(mismatch.error.issues.map(issue => issue.path.join('.')), ['floorArea'])
  for (const floorArea of ['lots', '0', '-5', '5000']) assert.equal(contactSchema.safeParse({ ...sample, floorArea }).success, false, floorArea)
  assert.equal(contactSchema.safeParse({ ...sample, floorArea: '0' }).error.issues[0].message, 'Enter a floor area greater than 0 m².')
  // A page cached before the 22/10/2026 price change can still send a retired band.
  assert.equal(contactSchema.safeParse({ ...sample, areaBand: '53-70' }).success, true)
  assert.equal(guideEstimate({ ...sample, areaBand: '53-70' }).total, null)
  assert.equal(guideEstimate({ ...sample, areaBand: '53-70' }).priceStatus, 'to-confirm')
  assert.equal(contactSchema.safeParse({ ...sample, areaBand: 'unknown', floorArea: '134' }).success, false)
  // A portfolio has no single floor area, so a stray figure is ignored rather than blocking it.
  assert.equal(contactSchema.safeParse({ ...sample, services: [BULK], areaBand: '', address: '', postcode: '', propertyCount: '20+', floorArea: 'lots' }).success, true)
  assert.ok(enquirySummaryText({ ...sample, areaBand: 'over-115', floorArea: '134' }).includes('Floor area: 134 m²'))
})

test('the 22/10/2026 pricing spec: example totals, statuses, savings, starting prices and the free report', () => {
  const { priceFrom, maxBundleSaving, topBand } = require('../lib/site.ts')
  const { guidePrice, bookingPriceRows } = require('../lib/pricing-estimate.ts')
  const EPC = 'EPC Certificate', BUNDLE = 'Both (Bundle)', FP = 'Floor Plan'
  const show = e => e.state === 'priced' ? guidePrice(e, e.total) : null
  // Spec §14's example totals, verbatim.
  for (const [areaBand, service, plan, report, expected] of [
    ['up-to-40', EPC, false, false, '£65'], ['up-to-40', EPC, true, false, '£100'], ['55-75', EPC, false, false, '£85'],
    ['75-95', EPC, false, false, '£95'], ['95-115', BUNDLE, false, false, '£175'], ['95-115', BUNDLE, true, false, '£210'],
    ['over-115', EPC, false, false, 'From £120'], ['over-115', EPC, true, false, 'From £155'], ['over-115', BUNDLE, false, false, 'From £205'],
    ['over-115', BUNDLE, true, false, 'From £240'], ['up-to-40', PRE_ASSESSMENT, false, false, '£90'], ['up-to-40', PRE_ASSESSMENT, false, true, '£90'],
    ['over-115', PRE_ASSESSMENT, false, false, 'From £145'],
  ]) assert.equal(show(guideEstimate({ areaBand, services: [service], improvementPlan: plan, energyReport: report })), expected, `${areaBand} ${service} ${plan} ${report}`)
  // Spec §2's table, every cell.
  const table = [[65, 65, 115, 90], [75, 75, 130, 100], [85, 85, 145, 110], [95, 95, 160, 120], [105, 105, 175, 130], [120, 120, 205, 145]]
  assert.deepEqual(pricing.map(b => [b.epc, b.floorPlan, b.bundle, b.preAssessment]), table)
  assert.deepEqual(pricing.map(b => b.areaLabel), ['Up to 40 m²', '41–55 m²', '56–75 m²', '76–95 m²', '96–115 m²', '116 m² and over'])
  assert.equal(topBand.startingPrice, true)
  // Spec §5's savings; none promised on the top band; the headline is £35.
  assert.deepEqual(areaBands.map(areaBand => guideEstimate({ areaBand, services: [BUNDLE] }).saving), [15, 20, 25, 30, 35, 0])
  assert.equal(maxBundleSaving, 35)
  assert.equal(guideEstimate({ areaBand: 'unknown', services: [BUNDLE] }).saving, 0)
  // Spec §8A: starting summaries before a size, with the plan added where it applies.
  assert.deepEqual([EPC, FP, BUNDLE, PRE_ASSESSMENT].map(service => guideEstimate({ areaBand: '', services: [service] }).fromTotal), [65, 65, 115, 90])
  assert.deepEqual([EPC, BUNDLE].map(service => guideEstimate({ areaBand: '', services: [service], improvementPlan: true }).fromTotal), [100, 150])
  assert.equal(priceFrom.preAssessment, 90)
  // Spec §7: the paid plan never applies to Floor Plan or Pre-Assessment; the free report only to Pre-Assessment.
  for (const service of [FP, PRE_ASSESSMENT]) assert.equal(guideEstimate({ areaBand: '55-75', services: [service], improvementPlan: true }).improvementPlan, 0)
  for (const service of [EPC, BUNDLE, FP]) assert.equal(guideEstimate({ areaBand: '55-75', services: [service], energyReport: true }).energyReport, false)
  // Spec §8D: unknown size, no invented total, the plan listed on its own.
  const unsure = guideEstimate({ areaBand: 'unknown', services: [EPC], improvementPlan: true })
  assert.equal(unsure.total, null)
  assert.deepEqual(guideEstimateRows(unsure), [['Personalised EPC Improvement Plan', '+£35']])
  assert.deepEqual(guideEstimateRows(guideEstimate({ areaBand: 'unknown', services: [PRE_ASSESSMENT], energyReport: true })).at(-1), ['Separate energy report', 'Included at no extra charge'])
  // Spec §12: the booking's price record distinguishes the three kinds of figure.
  const record = e => Object.fromEntries(bookingPriceRows(e))
  assert.equal(record(guideEstimate({ areaBand: '55-75', services: [EPC] }))['Price status'], 'Standard guide')
  assert.equal(record(guideEstimate({ areaBand: 'over-115', services: [EPC] }))['Price status'], 'Starting price')
  assert.equal(record(guideEstimate({ areaBand: 'over-115', services: [EPC] }))['Guide total'], 'From £120')
  assert.equal(record(unsure)['Price status'], 'To be confirmed')
  assert.equal(record(unsure)['Guide total'], 'To be confirmed')
  assert.equal(record(guideEstimate({ areaBand: 'up-to-40', services: [PRE_ASSESSMENT], energyReport: true }))['Separate energy report'], 'Requested (no extra charge)')
})

test('quote links allow only safe selections, preserve intent and never contain customer data or prices', () => {
  for (const service of Object.keys(quoteServices)) {
    const url = new URL(quoteHref({ service, area: 'unknown', speed: 'next-day', plan: true, name: 'secret', total: 123 }), site.url)
    const context = parseQuoteContext(url.searchParams)
    assert.equal(context.service, service)
    assert.equal(context.speed, ['epc', 'bundle'].includes(service) ? 'next-day' : 'standard')
    assert.equal(context.area, 'unknown')
    assert.equal(context.plan, ['epc', 'bundle'].includes(service))
    assert.equal(url.hash, '') // since 23/10 quote links open /quote, which is the form; no #booking-form hash
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
  // Abdul's wording, 22/10/2026 pricing spec §6 and §7
  assert.match(form, /Add a personalised EPC Improvement Plan/)
  assert.match(form, /Your standard EPC recommendations are included whether or not you choose this extra\./)
  assert.match(form, /Include a separate energy report — no extra charge/)
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
      assert.match(messages[0].text, /Internal floor area: 56–75 m²/)
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
        assert.match(message.text, /quoted individually|exact quote after reviewing|price to be confirmed/i)
      }
    }
    messages = []
    assert.equal((await request({ ...sample, services: ['Both (Bundle)'], speed: SAME_DAY_LODGEMENT_SPEED, improvementPlan: true, total: 1 })).status, 200)
    assert.match(messages[0].text, /£195 guide/)
    assert.match(messages[1].text, /£195 guide/)

    // A customer's own figure reaches Abdul with the band that priced the guide.
    messages = []
    assert.equal((await request({ ...sample, areaBand: 'over-115', floorArea: '134' })).status, 200)
    assert.equal(messages[0].subject, 'EPC booking: Test Customer — 134 m² (E15 1AA)')
    assert.match(messages[0].text, /Internal floor area: 134 m² \(customer's figure\) · 116 m² and over band/)
    assert.match(messages[0].text, /From £120 starting price/)
    assert.match(messages[0].text, /Price status: Starting price/)
    assert.match(messages[1].text, /Floor area: 134 m²/)
    assert.match(messages[1].text, /From £120, a starting price for a larger home/)
    assert.equal((await request({ ...sample, areaBand: '55-75', floorArea: '134' })).status, 400)
    // A retired band from a cached page still reaches Abdul, named, with no figure priced from it.
    messages = []
    assert.equal((await request({ ...sample, areaBand: '53-70' })).status, 200)
    assert.match(messages[0].text, /Internal floor area: 53–70 m² \(earlier price list\)/)
    assert.match(messages[0].text, /Price status: To be confirmed/)
    assert.doesNotMatch(messages[0].text + messages[1].text, /£85/)
    // The Pre-Assessment's free energy report is recorded and shown; the price is unchanged.
    messages = []
    assert.equal((await request({ ...sample, services: [PRE_ASSESSMENT], areaBand: 'up-to-40', energyReport: true })).status, 200)
    assert.match(messages[0].text, /Separate energy report: Requested \(no extra charge\)/)
    assert.match(messages[0].text, /£90 guide/)
    assert.match(messages[1].text, /Also included: Separate energy report, at no extra charge/)
    assert.match(messages[1].text, /improvement plan and your separate energy report are sent within 72 hours/)
    messages = []
    assert.equal((await request({ ...sample, services: [BULK], propertyCount: '5', floorArea: '134' })).status, 200)
    assert.doesNotMatch(messages[0].text + messages[0].subject + messages[1].text, /134 m²/)
    messages = []
    assert.equal((await request({ ...sample, services: ['Both (Bundle)'], speed: SAME_DAY_LODGEMENT_SPEED, improvementPlan: true, total: 1 })).status, 200)

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
      assert.match(body, /on the day of the visit/)
      assert.match(body, /Before your visit/)
      assert.match(body, /preparing-for-your-epc#please-read/)
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
    assert.equal((await request({ ...sample, customerType: 'Landlord (tenanted)', preferredDate: '2099-10-07', notes: 'Key with <neighbour>' })).status, 200)
    assert.match(messages[1].html, /Tenanted property\?/)
    assert.match(messages[1].text, /Preferred date: 07\/10\/2099/)
    assert.match(messages[0].text, /Preferred Date: 07\/10\/2099/)
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
  assert.match(nextSteps('epc', SAME_DAY_LODGEMENT_SPEED).at(-1), /on the day of the visit/)
  assert.match(nextSteps('bundle', NEXT_DAY_VISIT_SPEED).at(-1), /lodged on the GOV\.UK register on the day of the visit/)
  assert.match(nextSteps('epc', 'Standard (72 hours)').at(-1), /within 72 hours/)
  assert.match(nextSteps('preAssessment').at(-1), /Nothing is lodged/)
  assert.deepEqual(['epc', 'bundle', 'preAssessment', 'floorPlan', 'bulk'].map(hasPrepChecklist), [true, true, true, false, false])
  assert.equal(formatPreferredDate('2026-10-07'), '07/10/2026')
  assert.equal(formatPreferredDate('next Tuesday'), 'next Tuesday')
  assert.equal(formatPreferredDate(''), '')
  assert.equal(serviceLabel(BULK), 'Agency / portfolio enquiry')
  assert.ok(enquirySummaryText({ ...sample, speed: NEXT_DAY_VISIT_SPEED }).includes('Visit and lodgement: next day'))
  const summary = enquirySummaryText({ ...sample, services: ['Both (Bundle)'], speed: SAME_DAY_LODGEMENT_SPEED, improvementPlan: true, preferredDate: '2026-10-07', notes: 'Side gate' })
  for (const expected of ['Service: EPC + Floor Plan', 'Floor area: 56–75 m²', 'I am: Homeowner', 'Lodgement: same day as the visit', 'Add-on: EPC Improvement Plan', 'Address: 1 Test Road, E15 1AA', 'Preferred date: 07/10/2026', 'Notes: Side gate', 'Name: Test Customer', 'Phone: 07000000000', 'Email: test@example.invalid']) assert.ok(summary.includes(expected), expected)
  const bulk = enquirySummaryText({ ...sample, services: [BULK], customerType: 'Estate agent', propertyCount: '20+', address: 'A\nB', postcode: '' })
  assert.match(bulk, /Properties: 20\+/)
  assert.match(bulk, /Properties and postcodes: A\nB/)
  assert.doesNotMatch(bulk, /Floor area|Address:/)
})

test('a form loaded before 22/10/2026 still books: the old next-day value becomes same-day lodgement', () => {
  const parsed = contactSchema.safeParse({ ...sample, speed: LEGACY_EXPRESS_SPEED })
  assert.ok(parsed.success, JSON.stringify(parsed.error?.issues))
  assert.equal(parsed.data.speed, SAME_DAY_LODGEMENT_SPEED)
  assert.equal(parseQuoteContext(new URLSearchParams('service=epc&speed=express')).speed, 'same-day')
  assert.equal(parseQuoteContext(new URLSearchParams('service=floor-plan&speed=next-day')).speed, 'standard')
  assert.equal(guideEstimate({ areaBand: '55-75', services: ['EPC Certificate'], speed: NEXT_DAY_VISIT_SPEED }).total, pricing[2].epc + NEXT_DAY_VISIT_SURCHARGE)
  assert.equal(guideEstimate({ areaBand: '55-75', services: ['Floor Plan'], speed: NEXT_DAY_VISIT_SPEED }).express, 0)
})
