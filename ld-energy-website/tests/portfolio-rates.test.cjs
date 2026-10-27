// Portfolio rates: the site prints Abdul's approved wording (24/10/2026) word for word, built from lib/site.ts numbers.
const test = require('node:test')
const assert = require('node:assert')
const { portfolioRatesText, portfolioRates } = require('../lib/site')

const APPROVED = 'Three to five homes: £5 off each EPC. Six or more: £10 off each. Flats in the same building on the same day: £15 off each after the first. That replaces the other discount, it doesn\'t add to it. Never less than £55 an EPC. Floor plans and faster options stay full price.'

test('portfolio rates text is the approved sentence', () => {
  assert.strictEqual(portfolioRatesText, APPROVED)
})
test('the floor sits at or below the smallest band after the largest discount', () => {
  assert.ok(portfolioRates.floor <= 65 - portfolioRates.largeOff)
})
