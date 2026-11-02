// node --require ./tests/register.cjs --test tests/digital-optin.test.cjs
// The optional L&D Digital box (Abdul 02/11/2026): unticked by default, one email only when ticked (PECR consent).
const { test } = require('node:test')
const assert = require('node:assert/strict')
const { contactSchema } = require('../lib/validators.ts')
const { buildDigitalEmail, DIGITAL_SUBJECT, DIGITAL_URL, BUILDS_URL } = require('../lib/booking-emails.ts')
const { POST } = require('../app/api/contact/route.ts')
const { site } = require('../lib/site.ts')

const sample = { name: 'Test Customer', email: 'test@example.invalid', phone: '07000000000', address: '1 Test Road', postcode: 'E15 1AA', areaBand: '55-75', dwellingType: 'Flat', services: ['EPC Certificate'], customerType: 'Homeowner', speed: 'Standard (72 hours)', consent: true, turnstileToken: 'mock-token', website: '' }

test('the box is off unless the customer ticks it', () => {
  assert.equal(contactSchema.parse(sample).digitalOptIn, false)
  assert.equal(contactSchema.parse({ ...sample, digitalOptIn: true }).digitalOptIn, true)
  assert.equal(contactSchema.safeParse({ ...sample, digitalOptIn: 'yes' }).success, false)
})

test('the details email: services, link, the opt-out line, no prices', () => {
  const e = buildDigitalEmail({ name: 'Jo <b>Bloggs</b>' })
  assert.equal(e.subject, DIGITAL_SUBJECT)
  for (const body of [e.text, e.html]) {
    assert.ok(body.includes(DIGITAL_URL))
    assert.ok(body.includes(BUILDS_URL))
    assert.match(body, /You buy the parts and pay me for the build/)
    assert.match(body, /only email about L&(amp;)?D Digital or L&(amp;)?D Builds we('|&#39;)ll send unless you reply/)
    assert.match(body, /Business cards and print design/)
    assert.doesNotMatch(body, /£|undefined|NaN/)
  }
  assert.match(e.text, /^Hi Jo,/)
  assert.doesNotMatch(e.html, /<b>Bloggs/)
})

test('route: unticked sends two emails, ticked sends a third to the customer as L&D Digital', async () => {
  const previous = { fetch: global.fetch, node: process.env.NODE_ENV, turnstile: process.env.TURNSTILE_SECRET_KEY, resend: process.env.RESEND_API_KEY }
  process.env.NODE_ENV = 'production'
  process.env.TURNSTILE_SECRET_KEY = 'test-only-secret'
  process.env.RESEND_API_KEY = 'test-only-key'
  let messages = [], failDigital = false
  global.fetch = async (url, options) => {
    if (url.includes('siteverify')) return Response.json({ success: true })
    if (url.includes('api.postcodes.io')) return Response.json({ status: 404 }, { status: 404 })
    if (url.includes('cloudflare-dns.com')) return Response.json({ Status: 0, Answer: [{ type: 15, data: '10 mx.example.com.' }] })
    assert.equal(url, 'https://api.resend.com/emails')
    messages.push(JSON.parse(options.body))
    return Response.json({ id: 'mock' }, { status: failDigital && messages.length === 3 ? 500 : 200 })
  }
  const request = (data) => POST(new Request(site.url + '/api/contact', { method: 'POST', headers: { origin: site.url, 'Content-Type': 'application/json' }, body: JSON.stringify(data) }))
  try {
    assert.equal((await request(sample)).status, 200)
    assert.equal(messages.length, 2)
    assert.doesNotMatch(messages[0].text, /L&D Digital: Ticked/)

    messages = []
    assert.equal((await request({ ...sample, digitalOptIn: true })).status, 200)
    assert.equal(messages.length, 3)
    assert.match(messages[0].text, /L&D Digital: Ticked "Send me more details about L&D Digital \.\.\. and L&D Builds"/)
    const digital = messages[2]
    assert.equal(digital.to, sample.email)
    assert.equal(digital.subject, DIGITAL_SUBJECT)
    assert.match(digital.from, /^Luminous & Deliver <[^>]+@luminousanddeliver\.co\.uk>$/)
    assert.equal(digital.reply_to, messages[0].to)

    // a failed details email never fails the booking
    messages = []
    failDigital = true
    const res = await request({ ...sample, digitalOptIn: true })
    assert.equal(res.status, 200)
    assert.equal((await res.json()).ok, true)
  } finally {
    global.fetch = previous.fetch
    process.env.NODE_ENV = previous.node
    if (previous.turnstile === undefined) delete process.env.TURNSTILE_SECRET_KEY; else process.env.TURNSTILE_SECRET_KEY = previous.turnstile
    if (previous.resend === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = previous.resend
  }
})
