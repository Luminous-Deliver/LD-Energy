// node --require ./tests/register.cjs --test tests/lead-source.test.cjs
const { test } = require('node:test')
const assert = require('node:assert/strict')
const { referrerLabel, SOURCE_TAG_RE } = require('../lib/landing.ts')
const { deviceLabel } = require('../lib/device.ts')
const { emailDomainCompletions } = require('../lib/email-check.ts')
const { contactSchema } = require('../lib/validators.ts')
const { buildBusinessEmail, buildCustomerEmail } = require('../lib/booking-emails.ts')

test('where they came from: Google hosts are told apart, AI tools and tags are named', () => {
  const cases = {
    'google.co.uk': 'Google (google.co.uk)', 'gemini.google.com': 'Gemini (gemini.google.com)', 'maps.google.com': 'Google Maps (maps.google.com)',
    'com.google.android.gm': 'the Gmail app (com.google.android.gm)', 'com.google.android.googlequicksearchbox': 'the Google app (com.google.android.googlequicksearchbox)',
    'copilot.microsoft.com': 'Microsoft Copilot (copilot.microsoft.com)', 'bing.com': 'Bing (bing.com)', 'search.brave.com': 'Brave Search (search.brave.com)',
    'chatgpt.com': 'ChatGPT (chatgpt.com)', 'rightmove.co.uk': 'rightmove.co.uk',
  }
  for (const [host, label] of Object.entries(cases)) assert.equal(referrerLabel(host), label, host)
  assert.ok(SOURCE_TAG_RE.test('chatgpt.com'), 'ChatGPT’s own tag is kept')
  assert.equal(referrerLabel(undefined, 'chatgpt.com'), 'ChatGPT (link tag utm_source=chatgpt.com)')
  assert.ok(!SOURCE_TAG_RE.test('a b'), 'no spaces or other text')
})

test('device: kind, browser and system from the User-Agent', () => {
  const ua = {
    iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
    android: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Mobile Safari/537.36',
    samsung: 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/27.0 Chrome/125.0 Mobile Safari/537.36',
    edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36 Edg/141.0',
    googleApp: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) GSA/380.0 Mobile/15E148 Safari/604.1',
    ipad: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  }
  assert.equal(deviceLabel(ua.iphone), 'Phone · Safari · iOS')
  assert.equal(deviceLabel(ua.android), 'Phone · Chrome · Android')
  assert.equal(deviceLabel(ua.samsung), 'Phone · Samsung Internet · Android')
  assert.equal(deviceLabel(ua.edge), 'Computer · Edge · Windows')
  assert.equal(deviceLabel(ua.googleApp), 'Phone · the Google app · iOS')
  assert.equal(deviceLabel(ua.ipad), 'Tablet · Safari · iOS')
  assert.equal(deviceLabel(''), 'Not recorded')
})

test('endings after "@": all on "@", narrowed by what is typed, gone once a dot is typed', () => {
  assert.deepEqual(emailDomainCompletions('fazmin@'), ['fazmin@gmail.com', 'fazmin@hotmail.co.uk', 'fazmin@outlook.com', 'fazmin@icloud.com', 'fazmin@yahoo.co.uk'])
  assert.deepEqual(emailDomainCompletions('fazmin@ho'), ['fazmin@hotmail.co.uk', 'fazmin@hotmail.com'])
  assert.deepEqual(emailDomainCompletions('fazmin@gmail.'), [])
  assert.deepEqual(emailDomainCompletions('fazmin@citywide'), [])
  assert.deepEqual(emailDomainCompletions('fazmin'), [])
  assert.deepEqual(emailDomainCompletions('@'), [])
})

test('"How did you find us?" is optional, closed-list, and reaches only the business email', () => {
  const base = { name: 'Test', email: 't@example.com', phone: '07000000000', address: '1 Road', postcode: 'E15 1AA', areaBand: '55-75', dwellingType: 'Flat', services: ['EPC Certificate'], customerType: 'Homeowner', speed: 'Standard (72 hours)', consent: true, turnstileToken: 't', website: '' }
  assert.equal(contactSchema.parse(base).foundVia, undefined)
  assert.equal(contactSchema.parse({ ...base, foundVia: 'Google Maps' }).foundVia, 'Google Maps')
  assert.equal(contactSchema.parse({ ...base, foundVia: '<script>' }).foundVia, '', 'anything off the list is dropped, never fatal')
  const meta = { reference: 'LD-7K3QX9', received: new Date(), turnstilePassed: true, device: 'Phone · Safari · iOS' }
  const biz = buildBusinessEmail({ ...base, foundVia: 'ChatGPT or another AI assistant' }, meta).text
  assert.match(biz, /They said they found us via: ChatGPT or another AI assistant/)
  assert.match(biz, /Device: Phone · Safari · iOS/)
  assert.doesNotMatch(buildBusinessEmail(base, meta).text, /They said/, 'no row when not answered')
  const customer = buildCustomerEmail({ ...base, foundVia: 'Google Maps' }, meta)
  assert.doesNotMatch(customer.text + customer.html, /Google Maps|Phone · Safari/)
})
