// Renders the form emails with made-up customers for review, and checks the parts that must never drift:
// one reference in both emails, the price lines add up to the guide total, the access step is not repeated, every
// customer value is escaped, every email declares UTF-8 (the old notification did not, so "£" showed as "Â£"), the
// old notification's rows are all still present, the postcode check and "came from" rows, and the /contact email.
//   node --require ./tests/register.cjs tests/booking-emails-preview.cjs [outDir]   (LIVE=1 also calls postcodes.io)
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { buildBusinessEmail, buildCustomerEmail, buildEnquiryEmail, bookingReference } = require('../lib/booking-emails')
const { NEXT_DAY_VISIT_SPEED } = require('../lib/booking-options')
const { checkPostcode, distanceKm } = require('../lib/postcode-check')
const { referrerLabel, REFERRER_HOST_RE, LANDING_PAGE_RE } = require('../lib/landing')
const { contactSchema } = require('../lib/validators')

;(async () => {
  const out = process.argv[2]
  if (out) fs.mkdirSync(out, { recursive: true })
  let checks = 0
  const ok = (c, m) => { assert.ok(c, m); checks++ }

  const base = {
    name: 'Sam Example', phone: '07700 900123', email: 'sam@example.com', address: '12 Example Road', postcode: 'E15 1AA',
    customerType: 'Homeowner', speed: 'Standard (72 hours)', sourcePage: 'pricing', ctaId: 'hero', referrerHost: 'bing.com', landingPage: '/areas/newham',
  }
  const cases = {
    epc: { ...base, dwellingType: 'Flat', areaBand: 'up-to-40', services: ['EPC Certificate'], referrerHost: undefined },
    bundle: { ...base, name: 'Priya <b>Test</b>', dwellingType: 'House', areaBand: 'over-115', floorArea: '150', services: ['Both (Bundle)'],
      speed: NEXT_DAY_VISIT_SPEED, improvementPlan: true, preferredDate: '2026-11-08', notes: 'Side gate code 1234.\nDog is friendly.', areaPage: 'newham' },
    tenanted: { ...base, customerType: 'Landlord (tenanted)', dwellingType: 'Maisonette', areaBand: '55-75', services: ['EPC Certificate'], postcode: 'CM16 4AA' },
    bulk: { ...base, customerType: 'Letting agent / firm', services: ['Bulk / Agency Enquiry'], propertyCount: '12', address: '12 flats across E15 and E20', postcode: '' },
  }
  const checksFor = {
    epc: { status: 'ok', postcode: 'E15 1AA', borough: 'Newham', ward: 'Stratford Olympic Park', inLondon: true, region: 'London', km: 0.6 },
    bundle: { status: 'ok', postcode: 'E15 1AA', borough: 'Newham', ward: 'Stratford Olympic Park', inLondon: true, region: 'London', km: 0.6 },
    tenanted: { status: 'ok', postcode: 'CM16 4AA', borough: 'Epping Forest', inLondon: false, region: 'East of England', km: 21.4 },
    bulk: undefined,
  }

  ok(/^LD-[A-HJ-KM-NP-Z2-9]{6}$/.test(bookingReference()), 'reference format')
  for (const [name, data] of Object.entries(cases)) {
    const meta = { reference: 'LD-7K3QX9', received: new Date('2026-10-29T18:05:00Z'), turnstilePassed: true, postcodeCheck: checksFor[name] }
    const biz = buildBusinessEmail(data, meta)
    const cust = buildCustomerEmail(data, meta)
    for (const [who, mail] of [['business', biz], ['customer', cust]]) {
      ok(mail.html.includes('<meta charset="utf-8">'), `${name} ${who}: declares UTF-8`)
      ok(mail.html.includes('LD-7K3QX9') && mail.text.includes('LD-7K3QX9'), `${name} ${who}: carries the reference`)
      ok(!mail.html.includes('<b>Test</b>'), `${name} ${who}: customer values are escaped`)
      ok(mail.html.includes('/email/logo-energy-560.png'), `${name} ${who}: the current logo`)
      if (out) fs.writeFileSync(path.join(out, `${name}-${who}.html`), mail.html)
    }
    ok(!/Before the visit, make sure/.test(cust.html), `${name}: the access step is not repeated above the checklist`)
    // parity with the old notification's rows
    for (const row of ['Name', 'Phone', 'Email', 'Booking as', 'Service', 'Turnaround', 'Preferred date', 'Access notes', 'Price status', 'Found us via', 'First page', 'Form used', 'Reference', 'Received'])
      ok(biz.text.includes(`${row}:`), `${name} business: has "${row}"`)
    if (name !== 'bulk') ok(biz.text.includes('Postcode check:'), `${name} business: postcode check row`)
  }
  const bundleBiz = buildBusinessEmail(cases.bundle, { reference: 'R', received: new Date(), turnstilePassed: true, postcodeCheck: checksFor.bundle }).text
  ok(/Floor area: 150 m² \(their figure\), 116 m² and over band/.test(bundleBiz), 'bundle: their exact figure and the band')
  ok(/Price status: Starting price/.test(bundleBiz), 'bundle: starting-price status')
  ok(/Found us via: Bing \(bing\.com\)/.test(bundleBiz) && /First page: \/areas\/newham/.test(bundleBiz) && /Form used: pricing page, Newham, “hero” button/.test(bundleBiz), 'came from rows')
  ok(/Newham, Stratford Olympic Park ward · inside London · 0\.6 km/.test(bundleBiz), 'postcode check line')
  ok(/OUTSIDE London \(East of England\)/.test(buildBusinessEmail(cases.tenanted, { reference: 'R', received: new Date(), turnstilePassed: true, postcodeCheck: checksFor.tenanted }).text), 'outside London is flagged')
  ok(/Found us via: Direct/.test(buildBusinessEmail(cases.epc, { reference: 'R', received: new Date(), turnstilePassed: true }).text), 'no referrer reads as direct')
  const bundle = buildCustomerEmail(cases.bundle, { reference: 'LD-7K3QX9' }).text
  ok(/EPC \+ Floor Plan, 150 m²: From £235/.test(bundle), 'bundle at 150 m² starts from £235')
  ok(/Total: From £305/.test(bundle), 'bundle + next-day £35 + plan £35 = From £305')
  ok(/Your phone: 07700 900123/.test(bundle), 'customer sees their phone number')
  ok(!buildCustomerEmail(cases.bulk, { reference: 'X' }).html.includes('When you pay'), 'portfolio: no payment box before a price exists')

  // landing: only a bare domain and a bare path get through the schema
  ok(referrerLabel('google.co.uk') === 'Google (google.co.uk)' && referrerLabel('chatgpt.com') === 'ChatGPT (chatgpt.com)' && referrerLabel('omnirated.co.uk') === 'omnirated.co.uk', 'referrer labels')
  ok(REFERRER_HOST_RE.test('bing.com') && !REFERRER_HOST_RE.test('https://bing.com/search?q=epc') && LANDING_PAGE_RE.test('/areas/newham') && !LANDING_PAGE_RE.test('/quote?name=x'), 'landing shapes')
  const sample = { name: 'Sam Example', phone: '07700900123', email: 'sam@example.com', address: '12 Example Road', postcode: 'E15 1AA', customerType: 'Homeowner', services: ['EPC Certificate'], dwellingType: 'Flat', areaBand: 'up-to-40', speed: 'Standard (72 hours)', consent: true, turnstileToken: 't' }
  const parsed = contactSchema.safeParse({ ...sample, referrerHost: 'https://evil.example/?q=x', landingPage: '/quote?email=a@b.c' })
  ok(parsed.success && parsed.data.referrerHost === undefined && parsed.data.landingPage === undefined, 'bad landing values are dropped, the enquiry still goes')

  // the /contact enquiry email
  const enq = buildEnquiryEmail({ kind: 'enquiry', enquiryType: 'General question', name: 'Jo <i>Test</i>', email: 'jo@example.com', phone: '07700 900456', message: 'Do you cover Epping?\nThanks', consent: true, turnstileToken: 't', referrerHost: 'google.com', landingPage: '/faq' }, { received: new Date('2026-10-29T18:05:00Z'), turnstilePassed: true })
  ok(enq.html.includes('<meta charset="utf-8">') && !enq.html.includes('<i>Test</i>') && /Found us via: Google/.test(enq.text) && enq.html.includes('Call Jo'), 'enquiry email')
  if (out) fs.writeFileSync(path.join(out, 'enquiry-business.html'), enq.html)

  // postcodes.io, without the network: found, not found, down
  const fake = (status, body) => async () => ({ status, ok: status < 300, json: async () => body })
  const hit = await checkPostcode('e15 1aa', fake(200, { result: { postcode: 'E15 1AA', region: 'London', country: 'England', admin_district: 'Newham', admin_ward: 'Stratford', latitude: 51.5416, longitude: -0.0034 } }))
  ok(hit.status === 'ok' && hit.borough === 'Newham' && hit.inLondon && hit.km < 1, 'postcode check: found')
  ok((await checkPostcode('ZZ1 1ZZ', fake(404, {}))).status === 'not-found', 'postcode check: not found')
  ok((await checkPostcode('E15 1AA', async () => { throw new Error('down') })).status === 'unavailable', 'postcode check: service down never throws')
  ok(distanceKm({ lat: 51.5, lng: 0 }, { lat: 51.5, lng: 0 }) === 0, 'distance zero')
  if (process.env.LIVE) {
    const live = await checkPostcode('E15 1DA')
    ok(live.status === 'ok' && live.borough === 'Newham' && live.inLondon, `postcodes.io live: ${JSON.stringify(live)}`)
  }
  console.log(`PASS form emails: ${checks} checks${out ? `, previews in ${out}` : ''}`)
})().catch((e) => { console.error(e); process.exit(1) })
