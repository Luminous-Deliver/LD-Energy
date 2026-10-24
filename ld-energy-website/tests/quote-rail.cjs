// Phones draw the quote form as a rail, one question open at a time (system C, d72a832, 23/10/2026). Suites written for
// the three-step form use these to reach a question before using or reading it. On desktop every helper is a no-op
// or the plain action, so a suite keeps one code path.
const questions = {
  who: 'Which best describes you?', service: 'Which service?', dwelling: 'What type of property is it?',
  size: 'How big is the property?', price: 'Your guide price', timing: /How quickly do you need the certificate\?|When it’s ready/,
  details: 'Where should we send your exact price?',
}
const changes = {
  who: 'Change which best describes you', service: 'Change service', dwelling: 'Change property type', size: 'Change size',
  price: 'Change guide price options', timing: 'Change timing and access', details: 'Change your details',
}
const order = ['who', 'service', 'dwelling', 'size', 'price', 'timing', 'details']

function rail(page, form) {
  const isPhone = () => form.evaluate(f => f.hasAttribute('data-rail'))
  const open = form.locator('.bf-st.is-open')
  const heading = id => open.locator('[data-rail-q]', { hasText: questions[id] })
  const openId = async () => { for (const id of order) if (await heading(id).count()) return id; return null }
  const continueIn = name => open.getByRole('button', { name, exact: true })

  /** Answers the open question the way a customer taps through it, keeping any answer already chosen. */
  async function answer(id, answers) {
    const tapChecked = async (name, fallback) => {
      const checked = open.locator(`input[name="${name}"]:checked`)
      if (await checked.count()) await checked.click()
      else await open.getByRole('radio', fallback).first().check()
    }
    if (id === 'who') await tapChecked('customerType', { name: answers.who || 'Homeowner', exact: true })
    else if (id === 'service') await continueIn('Continue').click()
    else if (id === 'dwelling') await tapChecked('dwellingType', { name: answers.dwelling || 'Flat', exact: true })
    else if (id === 'size') {
      const checked = open.locator('input[name="areaBand"]:checked')
      const value = await checked.count() ? await checked.getAttribute('value') : (answers.size || 'unknown')
      if (value === 'over-115') { if (!await checked.count()) await open.locator('input[value="over-115"]').check(); await continueIn('Continue').click() }
      else await open.locator(`input[name="areaBand"][value="${value}"]`).click()
    } else if (id === 'price') await open.getByRole('button', { name: /^Continue to/ }).click()
    else if (id === 'timing') await continueIn('Continue to your details').click()
  }

  /** Opens question `id`: by its Change button once answered, else by answering the questions before it. */
  async function go(id, answers = {}) {
    if (!await isPhone()) return
    for (let guard = 0; guard < 10; guard++) {
      const now = await openId()
      if (now === id) return
      const change = form.getByRole('button', { name: changes[id], exact: true })
      if (await change.count()) { await change.click(); await heading(id).waitFor(); return }
      if (!now) throw new Error(`rail: no open question on the way to ${id}`)
      const before = await heading(now).textContent()
      await answer(now, answers)
      await form.locator('.bf-st.is-open [data-rail-q]').filter({ hasNotText: before }).first().waitFor()
    }
    throw new Error(`rail: could not reach ${id}`)
  }

  /** Picks a radio. A tap on a phone folds the question and opens the next; Space picks it and stays put. */
  async function pick(radio) {
    if (await isPhone()) { await radio.focus(); await page.keyboard.press('Space') } else await radio.check()
  }

  return { isPhone, go, pick, open }
}

module.exports = { rail }
