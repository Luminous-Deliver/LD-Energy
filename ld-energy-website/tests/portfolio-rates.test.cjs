// Portfolio rates: the site prints Abdul's approved wording (24/10/2026; one same-day rule 28/10) word for word, built from lib/site.ts numbers.
const test = require('node:test')
const assert = require('node:assert')
const { portfolioRatesText, portfolioRates } = require('../lib/site')

const APPROVED = "Homes visited on the same day within 23 minutes' travel of each other, including flats in the same building: the first is full price, then £5 off each one after it. This applies to an EPC or a floor plan booked on its own; an EPC and floor plan booked together already have the bundle saving. Never less than £65 for an EPC or a floor plan. Faster options stay full price."

test('portfolio rates text is the approved sentence', () => {
  assert.strictEqual(portfolioRatesText, APPROVED)
})
test('the floor never sits above the smallest band price', () => {
  assert.ok(portfolioRates.floor <= 65)
})
