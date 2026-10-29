// Renders the quote-request emails with made-up customers for review, and checks the parts that must never drift:
// one reference in both emails, the price lines add up to the guide total, the access step is not repeated, every
// customer value is escaped, and both emails declare UTF-8 (the old notification did not, so "£" showed as "Â£").
//   node --require ./tests/register.cjs tests/booking-emails-preview.cjs [outDir]
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { buildBusinessEmail, buildCustomerEmail, bookingReference } = require('../lib/booking-emails')
const { NEXT_DAY_VISIT_SPEED } = require('../lib/booking-options')

const out = process.argv[2]
if (out) fs.mkdirSync(out, { recursive: true })

const base = {
  name: 'Sam Example', phone: '07700 900123', email: 'sam@example.com', address: '12 Example Road', postcode: 'E15 1AA',
  customerType: 'Homeowner', speed: 'Standard (72 hours)', sourcePage: 'pricing', ctaId: 'hero',
}
const cases = {
  epc: { ...base, dwellingType: 'Flat', areaBand: 'up-to-40', services: ['EPC Certificate'] },
  bundle: { ...base, name: 'Priya <b>Test</b>', dwellingType: 'House', areaBand: 'over-115', floorArea: '150', services: ['Both (Bundle)'],
    speed: NEXT_DAY_VISIT_SPEED, improvementPlan: true, preferredDate: '2026-11-08', notes: 'Side gate code 1234.\nDog is friendly.' },
  tenanted: { ...base, customerType: 'Landlord (tenanted)', dwellingType: 'Maisonette', areaBand: '55-75', services: ['EPC Certificate'], areaPage: 'newham' },
  bulk: { ...base, customerType: 'Letting agent / firm', services: ['Bulk / Agency Enquiry'], propertyCount: '12', address: '12 flats across E15 and E20', postcode: '' },
}

let checks = 0
const ok = (c, m) => { assert.ok(c, m); checks++ }
const ref = bookingReference()
ok(/^LD-[A-HJ-KM-NP-Z2-9]{6}$/.test(ref), 'reference format')
for (const [name, data] of Object.entries(cases)) {
  const meta = { reference: 'LD-7K3QX9', received: new Date('2026-10-29T18:05:00Z'), turnstilePassed: true }
  const biz = buildBusinessEmail(data, meta)
  const cust = buildCustomerEmail(data, meta)
  for (const [who, mail] of [['business', biz], ['customer', cust]]) {
    ok(mail.html.includes('<meta charset="utf-8">'), `${name} ${who}: declares UTF-8`)
    ok(mail.html.includes('LD-7K3QX9') && mail.text.includes('LD-7K3QX9'), `${name} ${who}: carries the reference`)
    ok(!mail.html.includes('<b>Test</b>'), `${name} ${who}: customer values are escaped`)
    if (out) fs.writeFileSync(path.join(out, `${name}-${who}.html`), mail.html)
  }
  ok(!/Before the visit, make sure/.test(cust.html), `${name}: the access step is not repeated above the checklist`)
}
const bundle = buildCustomerEmail(cases.bundle, { reference: 'LD-7K3QX9' }).text
ok(/EPC \+ Floor Plan, 150 m².*From £235/.test(bundle), 'bundle at 150 m² starts from £235')
ok(/Total: From £305/.test(bundle), 'bundle + next-day £35 + plan £35 = From £305')
ok(!buildCustomerEmail(cases.bulk, { reference: 'X' }).html.includes('When you pay'), 'portfolio: no payment box before a price exists')
console.log(`PASS booking emails: ${checks} checks${out ? `, previews in ${out}` : ''}`)
