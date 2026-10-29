// node --require ./tests/register.cjs --test tests/email-check.test.cjs
const { test } = require('node:test')
const assert = require('node:assert/strict')
const { emailTypoSuggestion, emailDomainCanReceive } = require('../lib/email-check.ts')

test('common slips get a suggestion; right or unusual domains do not', () => {
  const cases = {
    'fazmin@gmial.com': 'fazmin@gmail.com', 'a@gmail.co.uk': 'a@gmail.com', 'a@gmail.con': 'a@gmail.com', 'a@gamil.com': 'a@gmail.com',
    'a@hotmial.com': 'a@hotmail.com', 'a@hotmail.co': 'a@hotmail.co.uk', 'a@outlok.com': 'a@outlook.com', 'a@yahooo.com': 'a@yahoo.com',
    'a@yahoo.co': 'a@yahoo.co.uk', 'a@icloud.con': 'a@icloud.com', 'a@btinternet.co.uk': 'a@btinternet.com', 'A.B@GMIAL.COM': 'A.B@gmail.com',
  }
  for (const [typed, fixed] of Object.entries(cases)) assert.equal(emailTypoSuggestion(typed), fixed, typed)
  for (const fine of ['a@gmail.com', 'a@hotmail.co.uk', 'a@mail.com', 'a@gmx.com', 'a@ymail.com', 'louis@citywidemaintenancesolutions.co.uk', 'a@ealing.gov.uk', 'a@lbhf.gov.uk', 'a', 'a@', '@gmail.com', 'a@gmail'])
    assert.equal(emailTypoSuggestion(fine), null, fine)
})

test('the domain check refuses only on a definite no and lets every failure through', async () => {
  const previous = global.fetch
  const answers = {}
  global.fetch = async (url, options) => {
    const u = new URL(url)
    const reply = answers[`${u.searchParams.get('name')} ${u.searchParams.get('type')}`]
    if (reply === 'throw') throw new Error('network down')
    // like the real fetch: never answers, but rejects when the caller aborts
    if (reply === 'hang') return new Promise((_, reject) => options.signal.addEventListener('abort', () => reject(new Error('aborted'))))
    return Response.json(reply ?? { Status: 0 })
  }
  try {
    Object.assign(answers, {
      'gmail.com MX': { Status: 0, Answer: [{ type: 15, data: '5 gmail-smtp-in.l.google.com.' }] },
      'gmial.com MX': { Status: 3 },
      'nullmx.example MX': { Status: 0, Answer: [{ type: 15, data: '0 .' }] },
      'aonly.example MX': { Status: 0 }, 'aonly.example A': { Status: 0, Answer: [{ type: 1, data: '192.0.2.1' }] }, 'aonly.example AAAA': { Status: 0 },
      'nothing.example MX': { Status: 0 }, 'nothing.example A': { Status: 0 }, 'nothing.example AAAA': { Status: 0 },
      'servfail.example MX': { Status: 2 },
      'down.example MX': 'throw',
      'slow.example MX': 'hang',
    })
    assert.equal(await emailDomainCanReceive('a@gmail.com'), true)
    assert.equal(await emailDomainCanReceive('a@gmial.com'), false, 'domain does not exist')
    assert.equal(await emailDomainCanReceive('a@nullmx.example'), false, 'null MX')
    assert.equal(await emailDomainCanReceive('a@aonly.example'), true, 'no MX but an address record: mail still works')
    assert.equal(await emailDomainCanReceive('a@nothing.example'), false, 'no MX and no address')
    assert.equal(await emailDomainCanReceive('a@servfail.example'), true, 'a DNS failure says nothing')
    assert.equal(await emailDomainCanReceive('a@down.example'), true, 'network failure lets it through')
    assert.equal(await emailDomainCanReceive('a@slow.example', 50), true, 'a slow lookup lets it through')
  } finally {
    global.fetch = previous
  }
})
