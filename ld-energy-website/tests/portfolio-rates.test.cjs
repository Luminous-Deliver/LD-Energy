// Portfolio rates: the site prints Abdul's approved wording (24/10/2026, floor plans + same-area tier 28/10) word for word, built from lib/site.ts numbers.
const test = require('node:test')
const assert = require('node:assert')
const { portfolioRatesText, portfolioRates } = require('../lib/site')

const APPROVED = "Three to five homes: £5 off each EPC or floor plan. Six or more: £10 off each. Homes in the same postcode area (like E15) on the same day: £10 off each after the first. Flats in the same building on the same day: £15 off each after the first. Only the biggest discount applies; they don't add up. With an EPC and floor plan together, you pay the bundle price and the discount comes off once per home. Never less than £55 for an EPC or a floor plan, or £100 for both. Faster options stay full price."

test('portfolio rates text is the approved sentence', () => {
  assert.strictEqual(portfolioRatesText, APPROVED)
})
test('the floor sits at or below the smallest band after the largest discount', () => {
  assert.ok(portfolioRates.floor <= 65 - portfolioRates.largeOff)
})
test('the bundle floor sits at or below the smallest bundle after the biggest discount', () => {
  const { pricing } = require('../lib/site')
  assert.ok(portfolioRates.bundleFloor <= pricing[0].bundle - portfolioRates.sameBuildingOff)
})
