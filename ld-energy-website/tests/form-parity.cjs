// The quote form's behaviours from the approved prototype v7.2 that the 22/10 port dropped and 24/10 restored
// (projects/ld-energy-redesign-2026-10/research/prototype-parity-2026-10-24.md, items 1, 2, 4-10). Desktop, homepage.
// Item 3 (a pick after a sent request starts a fresh one) needs a real send past the security check, so it is not here.
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const base = process.env.BOOKING_TEST_URL || 'http://localhost:3100'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')

;(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  let checks = 0
  const ok = (value, message) => { assert.ok(value, message); checks++ }
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await page.addInitScript(() => { if (window.top === window) localStorage.setItem('cookie-consent', 'declined') })
    await page.goto(`${base}/`, { waitUntil: 'networkidle' })
    const form = page.locator('#pricing form').first()

    // 2 + 4: a card's "See my price" moves focus to the form's heading and brings the Prices section's head up
    await page.locator('[data-pick]').first().click(); await page.waitForTimeout(1200)
    ok(await page.evaluate(() => document.activeElement?.classList.contains('bf__h')), 'a pick moves focus to the form heading')
    const top = await page.evaluate(() => Math.round(document.getElementById('prices').getBoundingClientRect().top))
    ok(top >= 0 && top < 160, `a pick brings the Prices section's head to the top (${top})`)

    // Abdul 24/10: picking a band opens the exact size under it, with an example inside that band
    ok(await form.getByText('Know the exact size?').count() === 1, 'before a pick: the exact-size link')
    await form.getByRole('radio', { name: /56–75 m²/ }).check({ force: true }); await page.waitForTimeout(300)
    ok(await form.locator('[id$="floorArea"]').getAttribute('placeholder') === 'e.g. 64', 'a pick opens the exact size, its example inside 56–75 m²')
    ok(await form.getByText('Know the exact size?').count() === 0, 'after a pick: no link, the field is open')
    // 24/10 regression: typing a figure that selects another band must not move the field mid-word and drop focus
    await form.getByRole('radio', { name: /^116 m² and over/ }).check({ force: true }); await page.waitForTimeout(200)
    const area = form.locator('[id$="floorArea"]')
    await area.click(); await area.pressSequentially('100')
    ok(await area.inputValue() === '100', `typing 100 keeps every digit (${await area.inputValue()})`)
    ok(await page.evaluate(() => /floorArea$/.test(document.activeElement?.id || '')), 'focus stays in the field while typing')
    ok(await form.getByRole('radio', { name: /^96–115 m²/ }).isChecked(), '100 m² selects 95–115')
    await area.fill('')
    await form.getByRole('radio', { name: /56–75 m²/ }).check({ force: true }); await page.waitForTimeout(200)

    // 8: the tenant note keeps its key
    await form.getByRole('radio', { name: /tenanted/i }).first().check({ force: true })
    ok(await form.locator('.bf__note--key svg.bf__note-ico').count() >= 1, 'the tenant note has its key icon')

    // 5 + 7: a portfolio has three "who" columns and its "Quote" at the text size
    await form.getByRole('radio', { name: 'Agency / portfolio enquiry', exact: true }).check({ force: true }); await page.waitForTimeout(300)
    const who = await form.locator('.bf__who').first().evaluate(e => ({ cls: e.className, cols: getComputedStyle(e).gridTemplateColumns.split(' ').length, n: e.querySelectorAll('input[type=radio]').length }))
    ok(who.n === 3 && who.cols === 3, `portfolio: three options in three columns (${JSON.stringify(who)})`)
    const quoteSize = await form.locator('.bf__price b').first().evaluate(e => parseFloat(getComputedStyle(e).fontSize))
    ok(quoteSize <= 40, `portfolio "Quote" at the text size (${quoteSize}px)`)

    // 9: ticking the plan stops its pulse
    await form.getByRole('radio', { name: 'Domestic EPC', exact: true }).check({ force: true })
    await form.getByRole('radio', { name: 'Homeowner', exact: true }).check({ force: true })
    await form.getByRole('radio', { name: 'Flat', exact: true }).check({ force: true })
    await form.getByRole('radio', { name: /m²/ }).first().check({ force: true }); await page.waitForTimeout(300)
    const plan = form.locator('label.bf-check--offer').first()
    await plan.evaluate(e => e.classList.add('is-pulsing'))
    await plan.locator('input').check({ force: true })
    ok(!(await plan.evaluate(e => e.classList.contains('is-pulsing'))), 'ticking the plan stops its pulse')

    // 1 + 6: the next step arrives with its entrance; the speeds are one ruled column with radio dots
    await form.getByRole('button', { name: /^Continue/ }).click(); await page.waitForTimeout(500)
    ok(await form.locator('.bf__body').evaluate(e => getComputedStyle(e).animationName) === 'bf-step-in', 'a new step plays its entrance')
    const speeds = await form.locator('.bf__choices--ruled').evaluate(e => ({ cols: getComputedStyle(e).gridTemplateColumns.split(' ').length, dot: getComputedStyle(e.querySelector('.bf-tile--row'), '::before').content }))
    ok(speeds.cols === 1 && speeds.dot === '""', `speeds: one column with a radio dot (${JSON.stringify(speeds)})`)

    // 10: a refused send focuses the error summary, drawn with a red rule
    await form.getByRole('button', { name: /^Continue to your details/ }).click(); await page.waitForTimeout(500)
    await form.evaluate(f => f.requestSubmit()); await page.waitForTimeout(600)
    const sum = await page.evaluate(() => { const a = document.activeElement; return { cls: a?.className || '', rule: a ? getComputedStyle(a).borderLeftWidth : '' } })
    ok(/bf__errsum/.test(sum.cls) && sum.rule === '2px', `a refused send focuses the error summary (${JSON.stringify(sum)})`)

    await page.close()
    console.log(`PASS form parity: ${checks} checks (pick focus and scroll, exact size opens on a pick, tenant key, portfolio three columns and Quote size, plan pulse stops, step entrance, ruled speeds, error summary focus)`)
  } finally {
    await browser.close()
  }
})().catch(err => { console.error(err); process.exitCode = 1 })
