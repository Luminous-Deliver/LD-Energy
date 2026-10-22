// The booking form's v7 drafts, approved 22/10/2026 (prototype v7.2, BRIEF.md § v7): the property type, a portfolio
// without a property type or visit date, the visit-date rules, What you get / What you receive, the WhatsApp text
// built from the choices, and both emails carrying the property type and the deliverables.
const { test } = require('node:test')
const assert = require('node:assert/strict')
const { site } = require('../lib/site.ts')
const { contactSchema, BULK, NEXT_DAY_VISIT_SPEED, dwellingTypes } = require('../lib/validators.ts')
const { londonYmd, isPastVisitDate, PAST_DATE_ERROR } = require('../lib/booking-options.ts')
const { visitDateNote, whatsappFormText, whatYouGet, deliveredList, dwellingChoices, nextSteps } = require('../lib/booking-copy.ts')
const { whatsappQuoteText } = require('../lib/area-page.ts')
const { POST } = require('../app/api/contact/route.ts')

const sample = { name: 'Test Customer', email: 'test@example.invalid', phone: '07000000000', address: '1 Test Road', postcode: 'E15 1AA', areaBand: '55-75', dwellingType: 'Maisonette', services: ['EPC Certificate'], customerType: 'Homeowner', speed: 'Standard (72 hours)', consent: true, turnstileToken: 'mock-token', website: '' }
const issues = (data) => { const r = contactSchema.safeParse(data); return r.success ? [] : r.error.issues.map((i) => i.path.join('.')) }

test('property type: the four RdSAP kinds with their helper lines, required except on a portfolio', () => {
  assert.deepEqual([...dwellingTypes], ['Flat', 'Maisonette', 'House', 'Bungalow'])
  assert.deepEqual(dwellingChoices.map((c) => c.description), ['On one floor', 'A flat on two floors or more', 'Terraced, semi or detached', 'A house on one floor'])
  assert.deepEqual(issues(sample), [])
  assert.ok(issues({ ...sample, dwellingType: '' }).includes('dwellingType'))
  assert.ok(issues({ ...sample, dwellingType: undefined }).includes('dwellingType'))
  assert.ok(issues({ ...sample, dwellingType: 'Castle' }).includes('dwellingType'))
  const portfolio = { ...sample, services: [BULK], customerType: 'Estate agent', dwellingType: '', areaBand: '', propertyCount: '12', address: '', postcode: '' }
  assert.deepEqual(issues(portfolio), [], 'a portfolio needs no property type, size, address or postcode')
})

test('visit dates: never in the past (London calendar); today, tomorrow and next-day notes', () => {
  const now = new Date('2026-10-23T09:00:00Z')
  const today = londonYmd(0, now), tomorrow = londonYmd(1, now), yesterday = londonYmd(-1, now)
  assert.equal(today, '2026-10-23')
  // 23:30 UTC on 23/10 is already 24/10 in London (BST)
  assert.equal(londonYmd(0, new Date('2026-10-23T23:30:00Z')), '2026-10-24')
  assert.equal(isPastVisitDate(yesterday, now), true)
  assert.equal(isPastVisitDate(today, now), false)
  assert.equal(isPastVisitDate('', now), false)
  assert.deepEqual(visitDateNote(yesterday, false, now), { text: PAST_DATE_ERROR, blocking: true })
  assert.match(visitDateNote(today, false, now).text, /^A visit today depends on availability/)
  assert.match(visitDateNote(tomorrow, false, now).text, /^A visit tomorrow depends on availability/)
  assert.match(visitDateNote(londonYmd(5, now), true, now).text, /^A next-day visit means tomorrow/)
  assert.equal(visitDateNote(londonYmd(5, now), true, now).blocking, false)
  assert.equal(visitDateNote(tomorrow, true, now).text.startsWith('A visit tomorrow'), true)
  assert.equal(visitDateNote('', true, now).text, '')
  // the schema refuses a past date, but not on a portfolio (which has no visit date)
  assert.ok(issues({ ...sample, preferredDate: '2020-01-01' }).includes('preferredDate'))
  assert.deepEqual(issues({ ...sample, preferredDate: '2099-01-01', speed: NEXT_DAY_VISIT_SPEED }), [])
})

test('WhatsApp from the form starts with the approved wording, then the choices', () => {
  const text = whatsappFormText(whatsappQuoteText(), { services: ['Both (Bundle)'], dwellingType: 'House', areaLabel: 'Over 75–95 m²', guide: '£155' })
  assert.ok(text.startsWith("Hi, I'd like a quote for an EPC.\nFull address:\nPostcode:\n"))
  assert.match(text, /Service: EPC \+ Floor Plan\nProperty type: House\nFloor area: Over 75–95 m²\nGuide price shown: £155\nPreferred date:$/)
  const bulk = whatsappFormText(whatsappQuoteText(), { services: [BULK] })
  assert.match(bulk, /Service: Agency \/ portfolio enquiry\nRoughly how many properties:\nPreferred date:$/)
  assert.doesNotMatch(bulk, /Property type|Floor area/)
})

test('What you get (step 1) and What you receive (confirmation) follow the service', () => {
  assert.equal(whatYouGet('epc').length, 3)
  assert.equal(whatYouGet('none').length, 0)
  assert.deepEqual(deliveredList('epc'), ['Your EPC, lodged on the official GOV.UK EPC Register', 'A certificate link once it is live on the register', 'The standard recommendation report, where applicable', 'A certificate valid for 10 years'])
  assert.equal(deliveredList('bundle', { improvementPlan: true }).at(-1), 'Personalised EPC Improvement Plan: your priorities, with the full Energy Report')
  assert.equal(deliveredList('floorPlan', { improvementPlan: true }).some((l) => /Improvement Plan/.test(l)), false, 'no plan on a floor plan')
  assert.deepEqual(deliveredList('preAssessment', { energyReport: true }), ['Property energy assessment', 'Personalised written improvement plan', 'Separate energy report'])
  assert.deepEqual(deliveredList('bulk'), [])
  assert.ok(nextSteps('epc').includes('Before the visit, make sure every room, the loft hatch, the boiler and the meters are easy to reach.'))
  assert.ok(nextSteps('floorPlan').includes('Before the visit, make sure every room is easy to reach.'))
})

test('the API: property type required and carried into both emails, with What you receive; past dates refused', async () => {
  const previous = { fetch: global.fetch, node: process.env.NODE_ENV, turnstile: process.env.TURNSTILE_SECRET_KEY, resend: process.env.RESEND_API_KEY }
  process.env.NODE_ENV = 'production'
  process.env.TURNSTILE_SECRET_KEY = 'test-only-secret'
  process.env.RESEND_API_KEY = 'test-only-key'
  let messages = []
  global.fetch = async (url, options) => {
    if (url.includes('siteverify')) return Response.json({ success: true })
    messages.push(JSON.parse(options.body))
    return Response.json({ id: 'mock-message' })
  }
  const request = (data) => POST(new Request(site.url + '/api/contact', { method: 'POST', headers: { origin: site.url, 'Content-Type': 'application/json' }, body: JSON.stringify(data) }))
  try {
    assert.equal((await request({ ...sample, dwellingType: '' })).status, 400)
    assert.equal(messages.length, 0)
    assert.equal((await request({ ...sample, preferredDate: '2020-01-01' })).status, 400)
    assert.equal(messages.length, 0)

    assert.equal((await request({ ...sample, services: ['Both (Bundle)'], improvementPlan: true })).status, 200)
    assert.match(messages[0].text, /Property type: Maisonette/)
    assert.match(messages[1].text, /Property type: Maisonette/)
    assert.match(messages[1].text, /What you receive:\n {2}- Assessment, lodged EPC, certificate link and recommendation report/)
    assert.match(messages[1].text, /Personalised EPC Improvement Plan: your priorities, with the full Energy Report/)
    assert.match(messages[1].html, /What you receive/)

    messages = []
    assert.equal((await request({ ...sample, services: [BULK], customerType: 'Estate agent', dwellingType: '', areaBand: '', propertyCount: '12', address: '', postcode: '' })).status, 200)
    assert.doesNotMatch(messages[0].text + messages[1].text, /Property type|What you receive/)
  } finally {
    global.fetch = previous.fetch
    process.env.NODE_ENV = previous.node
    for (const [k, v] of [['TURNSTILE_SECRET_KEY', previous.turnstile], ['RESEND_API_KEY', previous.resend]]) { if (v === undefined) delete process.env[k]; else process.env[k] = v }
  }
})
