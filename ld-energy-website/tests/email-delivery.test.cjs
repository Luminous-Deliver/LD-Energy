// node --require ./tests/register.cjs --test tests/email-delivery.test.cjs
const { test } = require('node:test')
const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const { CONFIRMATION_SUBJECT, deliveryState, referenceIn, resendTime } = require('../lib/email-delivery.ts')
const { GET } = require('../app/api/contact/delivery/route.ts')
const webhook = require('../app/api/resend-webhook/route.ts')

const ID = '01a189d6-c6c9-7682-a365-aaed1d142b5a'
const resendStamp = (ms) => new Date(ms).toISOString().replace('T', ' ').replace('Z', '+00')

test('helpers: states, Resend timestamps and the form reference', () => {
  assert.equal(deliveryState('bounced'), 'bounced')
  assert.equal(deliveryState('delivered'), 'delivered')
  assert.equal(deliveryState('delivery_delayed'), 'pending')
  assert.equal(deliveryState(undefined), 'pending')
  assert.equal(resendTime('2026-10-29 22:45:21.164+00'), Date.parse('2026-10-29T22:45:21.164Z'))
  assert.ok(Number.isNaN(resendTime('nonsense')))
  assert.equal(referenceIn('Your reference LD-URBE6F. Abdul will reply'), 'LD-URBE6F')
  assert.equal(referenceIn('no reference here'), null)
})

test('delivery route answers one word, only for a recent form copy', async () => {
  const previous = { fetch: global.fetch, key: process.env.RESEND_API_KEY }
  process.env.RESEND_API_KEY = 'test-only-key'
  let email = {}, calls = 0
  global.fetch = async (url) => { calls++; assert.equal(url, `https://api.resend.com/emails/${ID}`); return Response.json(email) }
  const ask = async (id = ID) => { const r = await GET(new Request(`https://epc.luminousanddeliver.co.uk/api/contact/delivery?id=${id}`)); return [r.status, await r.json()] }
  try {
    email = { id: ID, subject: CONFIRMATION_SUBJECT, last_event: 'bounced', created_at: resendStamp(Date.now() - 20_000), to: ['a@b.com'], text: 'secret' }
    assert.deepEqual(await ask(), [200, { state: 'bounced' }], 'only the state, never the address or text')
    email.last_event = 'delivered'
    assert.deepEqual(await ask(), [200, { state: 'delivered' }])
    email.last_event = 'sent'
    assert.deepEqual(await ask(), [200, { state: 'pending' }])
    email.subject = 'Re: EPCs - 43 Elvaston Place, SW7'
    assert.equal((await ask())[0], 404, 'any other email in the account is not answered')
    email.subject = CONFIRMATION_SUBJECT; email.created_at = resendStamp(Date.now() - 31 * 60_000)
    assert.equal((await ask())[0], 404, 'an old copy is not answered')
    calls = 0
    assert.equal((await ask('../domains'))[0], 404)
    assert.equal(calls, 0, 'a malformed id never reaches Resend')
  } finally {
    global.fetch = previous.fetch
    previous.key === undefined ? delete process.env.RESEND_API_KEY : process.env.RESEND_API_KEY = previous.key
  }
})

test('webhook forwards a bounce to the business inbox once, and never alerts on its own alert', async () => {
  const secretBytes = crypto.randomBytes(24)
  const previous = { fetch: global.fetch, secret: process.env.RESEND_WEBHOOK_SECRET, key: process.env.RESEND_API_KEY }
  process.env.RESEND_WEBHOOK_SECRET = 'whsec_' + secretBytes.toString('base64')
  process.env.RESEND_API_KEY = 'test-only-key'
  let stored = {}, sent = [], sendStatus = 200
  global.fetch = async (url, options = {}) => {
    if (url === `https://api.resend.com/emails/${ID}`) return Response.json(stored)
    assert.equal(url, 'https://api.resend.com/emails')
    sent.push({ body: JSON.parse(options.body), headers: options.headers })
    return Response.json({ id: 'alert' }, { status: sendStatus })
  }
  const deliver = (event, svixId = 'msg_' + crypto.randomBytes(4).toString('hex')) => {
    const body = JSON.stringify(event)
    const ts = String(Math.floor(Date.now() / 1000))
    const sig = crypto.createHmac('sha256', secretBytes).update(`${svixId}.${ts}.${body}`).digest('base64')
    return webhook.POST(new Request('https://epc.luminousanddeliver.co.uk/api/resend-webhook', {
      method: 'POST', body, headers: { 'svix-id': svixId, 'svix-timestamp': ts, 'svix-signature': `v1,${sig}`, 'content-length': String(body.length) },
    }))
  }
  try {
    stored = { id: ID, subject: CONFIRMATION_SUBJECT, to: ['fazmin@gmial.com'], text: 'Your reference LD-URBE6F.' }
    let res = await deliver({ type: 'email.bounced', data: { email_id: ID, bounce: { message: 'Mailbox does not exist' } } }, 'msg_one')
    assert.equal(res.status, 200)
    assert.equal(sent.length, 1)
    assert.equal(sent[0].body.to, 'contact@luminousanddeliver.co.uk')
    assert.match(sent[0].body.subject, /^Bounced: LD-URBE6F to fazmin@gmial\.com did not deliver$/)
    assert.match(sent[0].body.text, /automatic copy to fazmin@gmial\.com bounced: Mailbox does not exist/)
    assert.match(sent[0].body.text, /search the inbox for LD-URBE6F/)
    assert.equal(sent[0].headers['Idempotency-Key'], 'bounce-msg_one', 'a Resend retry cannot send a second alert')

    sent = []
    stored = { id: ID, subject: 'Re: EPCs - 43 Elvaston Place, SW7', to: ['louis@example.com'], text: 'Hi Louis' }
    await deliver({ type: 'email.bounced', data: { email_id: ID } })
    assert.equal(sent.length, 1, 'a quote reply bounce is forwarded too')
    assert.match(sent[0].body.text, /“Re: EPCs - 43 Elvaston Place, SW7” to louis@example\.com bounced\./)

    sent = []
    stored = { id: ID, subject: 'Bounced: LD-URBE6F to x did not deliver', to: ['contact@luminousanddeliver.co.uk'] }
    assert.equal((await deliver({ type: 'email.bounced', data: { email_id: ID } })).status, 200)
    assert.equal(sent.length, 0, 'an alert that bounces is not alerted again')

    sent = []
    assert.equal((await deliver({ type: 'email.delivered', data: { email_id: ID } })).status, 200)
    assert.equal(sent.length, 0, 'deliveries send nothing')

    stored = { id: ID, subject: CONFIRMATION_SUBJECT, to: ['a@b.com'], text: '' }
    sendStatus = 500
    assert.equal((await deliver({ type: 'email.bounced', data: { email_id: ID } })).status, 500, 'a failed alert asks Resend to retry')
  } finally {
    global.fetch = previous.fetch
    for (const [name, value] of [['RESEND_WEBHOOK_SECRET', previous.secret], ['RESEND_API_KEY', previous.key]]) value === undefined ? delete process.env[name] : process.env[name] = value
  }
})
