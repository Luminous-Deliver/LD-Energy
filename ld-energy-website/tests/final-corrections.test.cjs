const { test } = require('node:test')
const assert = require('node:assert/strict')
const { customerTypes } = require('../lib/booking-options.ts')
const { CUSTOMER_TYPE_HISTORY_KEY, restoredCustomerType, rememberCustomerType } = require('../lib/customer-type-history.ts')
const { customerTypeForSource } = require('../lib/enquiry-attribution.ts')

test('history restoration accepts only a customer-type enum or explicit empty reset', () => {
  for (const customerType of ['', ...customerTypes]) {
    assert.equal(restoredCustomerType({ [CUSTOMER_TYPE_HISTORY_KEY]: { customerType } }), customerType)
  }
  for (const state of [null, 'text', {}, { [CUSTOMER_TYPE_HISTORY_KEY]: 'text' },
    { [CUSTOMER_TYPE_HISTORY_KEY]: { customerType: 'private text' } },
    { [CUSTOMER_TYPE_HISTORY_KEY]: { customerType: { name: 'Customer' } } }]) {
    assert.equal(restoredCustomerType(state), undefined)
  }
})

test('manual selection and reset preserve router state and store only one controlled field', () => {
  const original = { __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: ['route', { children: 'contact' }], other: { retained: true } }
  const history = { state: original, calls: 0, replaceState(state, title, url) { this.state = state; this.calls++; assert.equal(title, ''); assert.equal(url, undefined) } }
  rememberCustomerType('Homeowner', history)
  assert.deepEqual(history.state, { ...original, [CUSTOMER_TYPE_HISTORY_KEY]: { customerType: 'Homeowner' } })
  assert.equal(history.state.__PRIVATE_NEXTJS_INTERNALS_TREE, original.__PRIVATE_NEXTJS_INTERNALS_TREE)
  assert.deepEqual(original, { __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: ['route', { children: 'contact' }], other: { retained: true } })
  assert.equal(restoredCustomerType(history.state) ?? customerTypeForSource('landlords'), 'Homeowner')
  rememberCustomerType('', history)
  assert.equal(restoredCustomerType(history.state) ?? customerTypeForSource('landlords'), '')
  rememberCustomerType('Private customer text', history)
  assert.equal(history.calls, 2)
  assert.equal(restoredCustomerType(undefined) ?? customerTypeForSource('landlords'), 'Landlord (tenanted)')
})
