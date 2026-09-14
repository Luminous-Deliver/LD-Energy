const { test } = require('node:test')
const assert = require('node:assert/strict')
const { analyticsAllowed, analyticsPreferenceKey } = require('../lib/analytics-preference.ts')

test('analytics preference honours rejections, explicit choices and browser signals', () => {
  const values = new Map()
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { doNotTrack: null } })
  globalThis.localStorage = { getItem: key => values.get(key) ?? null }
  assert.equal(analyticsAllowed(), true)
  values.set('cookie-consent', 'declined')
  assert.equal(analyticsAllowed(), false)
  values.set(analyticsPreferenceKey, 'on')
  assert.equal(analyticsAllowed(), true)
  values.set(analyticsPreferenceKey, 'off')
  assert.equal(analyticsAllowed(), false)
  values.set(analyticsPreferenceKey, 'on')
  navigator.doNotTrack = '1'
  assert.equal(analyticsAllowed(), false)
  navigator.doNotTrack = null
  navigator.globalPrivacyControl = true
  assert.equal(analyticsAllowed(), false)
  navigator.globalPrivacyControl = false
  globalThis.localStorage = { getItem() { throw new Error('Storage unavailable') } }
  assert.equal(analyticsAllowed(), false)
})
