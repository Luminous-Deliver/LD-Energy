// Abdul's 22/10/2026 pricing spec, in the browser: every band's price on every tab, the summary states, the add-on
// rules across tab switches, the shared floor-area field (spec 2) and what is submitted. Run against a local
// `next start` of a build made with a test Turnstile site key (NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA).
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const base = process.env.BOOKING_TEST_URL || 'http://localhost:3100'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')
const out = path.resolve(process.env.BOOKING_EVIDENCE_DIR || '../../../audits/website-growth-audit/ld-energy-pricing-2026-10-22')
fs.mkdirSync(out, { recursive: true })

const bands = ['Up to 40 m²', 'Over 40–55 m²', 'Over 55–75 m²', 'Over 75–95 m²', 'Over 95–115 m²', 'Over 115 m²']
// Abdul, 22/10/2026 (later): bedroom captions back under each band, kept muted and secondary to the m² label.
const captions = ['Studios and compact flats', '1-bedroom flats', '2-bedroom flats and small homes', '2–3-bedroom homes', '3–4-bedroom houses', 'Large homes, 4+\u00a0bedrooms']
const prices = {
  'Domestic EPC': ['£65', '£75', '£85', '£95', '£105', 'From £120'],
  'Floor Plan': ['£55', '£65', '£75', '£90', '£105', 'From £125'],
  'EPC + Floor Plan': ['£105', '£120', '£135', '£155', '£175', 'From £210'],
  'EPC Pre-Assessment': ['£90', '£100', '£110', '£120', '£130', 'From £145'],
}
const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

;(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  let checks = 0
  const ok = (value, message) => { assert.ok(value, message); checks++ }
  const eq = (actual, expected, message) => { assert.equal(actual, expected, message); checks++ }
  try {
    for (const [width, height] of [[360, 800], [768, 1024], [1440, 900]]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' })
      await page.addInitScript(() => { if (window.top === window) localStorage.setItem('cookie-consent', 'declined') })
      const submissions = []
      await page.route('**/api/contact', async route => {
        submissions.push(route.request().postDataJSON())
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, delivered: true, confirmationSent: true }) })
      })
      await page.goto(`${base}/contact#booking-form`, { waitUntil: 'networkidle' })
      const form = page.getByRole('form', { name: 'Exact quote enquiry' })
      const service = name => form.getByRole('radio', { name, exact: true })
      const size = name => form.getByRole('radio', { name: new RegExp('^' + escape(name) + '(,|$)') })
      const unsure = form.getByRole('radio', { name: 'Not sure of floor area', exact: true })
      const panel = form.locator('[data-estimate]')
      const price = () => panel.locator('[data-price]').innerText()
      const plan = form.getByRole('checkbox', { name: /Add a personalised EPC Improvement Plan/ })
      const report = form.getByRole('checkbox', { name: /Include a separate energy report/ })
      const field = form.locator('#floorArea')

      // §1 and §2: every band on every tab shows the configured price; only the top band reads "From"; each band has a muted bedroom caption.
      for (const [tab, expected] of Object.entries(prices)) {
        await service(tab).check()
        for (const [i, band] of bands.entries()) {
          const label = await size(band).getAttribute('aria-label')
          eq(label, `${band}, ${captions[i]}, ${expected[i]}`, `${tab} ${band}`)
        }
        const sizesText = await form.locator('.bf__sizes').innerText()
        ok(captions.every(c => sizesText.includes(c)), `${tab}: every band shows its bedroom caption`)
        ok(/Price confirmed before booking/.test(sizesText) && /We’ll confirm the size and price from your property details\./.test(sizesText), `${tab}: the not-sure row`)
      }
      ok(await form.getByText('Choose the approximate internal floor area. Bedrooms are only a rough guide. Not sure? We can confirm it from your property details.').isVisible(), 'size hint')
      // Subtle: the caption is smaller, lighter and greyer than the m² label it sits under.
      const tone = await form.locator('.bf-tile--size').first().evaluate(tile => {
        const read = el => { const cs = getComputedStyle(el); return { size: parseFloat(cs.fontSize), weight: +cs.fontWeight, color: cs.color } }
        return { area: read(tile.querySelector('.bf-size__top b')), caption: read(tile.querySelector('.bf-tile__d')) }
      })
      ok(tone.caption.size < tone.area.size && tone.caption.weight < tone.area.weight && tone.caption.color !== tone.area.color, `caption is muted ${JSON.stringify(tone)}`)

      // §8A: starting prices before a size, with the paid plan added where it applies.
      await service('Domestic EPC').check()
      eq(await price(), '£65', 'EPC from'); ok(/From/.test(await panel.innerText()) && /Pick a size for your guide price\./.test(await panel.innerText()), 'EPC from line')
      await plan.check(); eq(await price(), '£100', 'EPC + plan from')
      await service('EPC + Floor Plan').check(); eq(await price(), '£140', 'bundle + plan from (plan kept between EPC and bundle)')
      await service('Floor Plan').check(); eq(await price(), '£55', 'floor plan from'); eq(await plan.count(), 0, 'no plan on Floor Plan'); eq(await report.count(), 0, 'no report on Floor Plan')
      await service('EPC Pre-Assessment').check(); eq(await price(), '£90', 'pre-assessment from'); eq(await plan.count(), 0, 'no paid plan on Pre-Assessment')

      // §8B, §5, §7: a standard band, its saving, the plan's £35, and no "From".
      await service('EPC + Floor Plan').check()
      eq(await plan.isChecked(), false, 'leaving for Floor Plan cleared the paid plan')
      await size('Over 55–75 m²').check()
      eq(await price(), '£135', 'bundle 55-75'); ok(!/From/.test(await panel.locator('.bf__price').innerText()), 'no From on a standard band')
      ok(await panel.getByText('Save £25 compared with booking separately.').isVisible(), 'saving line')
      await plan.check(); eq(await price(), '£170', 'bundle 55-75 + plan')
      await service('Domestic EPC').check(); eq(await price(), '£120', 'EPC 55-75 + plan (§7 example)')
      ok(await panel.locator('.bf__rows').getByText('Personalised EPC Improvement Plan').isVisible(), 'plan row')

      // §6 and §10: the free report never changes the price, shows in the summary, and never follows to another tab.
      await service('EPC Pre-Assessment').check(); eq(await price(), '£110', 'pre-assessment 55-75, paid plan cleared')
      await report.check(); eq(await price(), '£110', 'report is free')
      ok(await panel.locator('.bf__rows').getByText('Included at no extra charge').isVisible(), 'report row')
      await service('Domestic EPC').check(); await service('EPC Pre-Assessment').check()
      eq(await report.isChecked(), false, 'report cleared on leaving Pre-Assessment')

      // §8C and spec 2: the top band opens the shared field under its row, with "I don't know the floor area".
      await service('Domestic EPC').check()
      eq(await form.getByRole('button', { name: 'Know the exact size? Enter it in m²' }).isVisible(), true, 'subtle control below the list')
      await size('Over 115 m²').check()
      ok(await form.getByLabel('Approximate internal floor area').isVisible(), 'top band label')
      eq(await field.getAttribute('placeholder'), 'e.g. 145', 'top band placeholder')
      ok(await form.getByText('Include all floors. An estimate is fine.').isVisible(), 'top band help')
      eq(await form.locator('.bf__area').count(), 1, 'one shared field')
      const order = await form.evaluate(f => { const row = f.querySelector('input[value="over-115"]').closest('label'), area = f.querySelector('.bf__area'), not = f.querySelector('input[value="unknown"]').closest('label'); return row.compareDocumentPosition(area) & 4 && area.compareDocumentPosition(not) & 4 })
      ok(order, 'field sits directly beneath the Over 115 row')
      eq(await price(), '£120', 'EPC top band'); ok(/From/.test(await panel.locator('.bf__price').innerText()), 'From on the top band')
      ok(await panel.getByText('Final price depends on property size and complexity.', { exact: false }).isVisible(), 'top band note')
      await form.getByRole('radio', { name: 'Homeowner' }).check()
      await form.getByRole('button', { name: 'Continue' }).click()
      ok(await form.getByText('Enter an approximate floor area, or choose “I don’t know the floor area”.').isVisible(), 'top band needs an area or unknown')
      eq(await form.getByText('Step 1 of 3').count(), 1, 'stays on step 1')
      await form.getByRole('checkbox', { name: 'I don’t know the floor area' }).check()
      eq(await size('Over 115 m²').isChecked(), true, 'unknown keeps the band')
      if (width === 1440) await form.screenshot({ path: path.join(out, `top-band-${width}.png`) })

      // Typing keeps focus and the field even when the figure moves to a smaller band; decimals are never rounded.
      await field.click(); await field.pressSequentially('100')
      eq(await page.evaluate(() => document.activeElement?.id), 'floorArea', 'focus stays in the field while typing')
      eq(await size('Over 95–115 m²').isChecked(), true, '100 m² selects 95-115')
      ok(await field.isVisible(), 'field stays open on a smaller band')
      eq(await form.getByRole('checkbox', { name: 'I don’t know the floor area' }).count(), 0, 'unknown option only on the top band')
      eq(await price(), '£105', 'EPC 95-115')
      for (const [m2, band] of [['40', 'Up to 40 m²'], ['40.5', 'Over 40–55 m²'], ['55', 'Over 40–55 m²'], ['55.5', 'Over 55–75 m²'], ['75', 'Over 55–75 m²'], ['75.5', 'Over 75–95 m²'], ['95', 'Over 75–95 m²'], ['95.5', 'Over 95–115 m²'], ['115', 'Over 95–115 m²'], ['115.5', 'Over 115 m²']]) {
        await field.fill(m2); eq(await size(band).isChecked(), true, `${m2} m²`)
      }
      eq(await price(), '£120', 'From £120 for 115.5 m²')
      // A manual pick of another band clears the figure; zero is rejected inline.
      await size('Over 55–75 m²').check(); eq(await field.inputValue(), '', 'manual pick clears the figure')
      await field.fill('0'); await form.getByRole('button', { name: 'Continue' }).click()
      ok(await form.getByText('Enter a floor area greater than 0 m².').isVisible(), 'zero rejected')
      await field.fill('')

      // §8D: not sure: no figure, the plan listed on its own.
      await unsure.check(); await plan.check()
      eq(await price(), 'Price to be confirmed', 'unknown size')
      ok(await panel.getByText('We’ll confirm the size and price from your property details.').isVisible(), 'unknown line')
      ok(await panel.locator('.bf__rows').getByText('+£35').isVisible(), 'plan +£35 listed separately')
      ok(!/£\d/.test(await panel.locator('.bf__price').innerText()), 'no invented total')

      // Keyboard: arrow keys move through the bands and the summary follows.
      await size('Over 40–55 m²').focus(); await page.keyboard.press('ArrowRight')
      eq(await size('Over 55–75 m²').isChecked(), true, 'arrow key moves the band')

      // §12: submission and review carry the band id, the figure, the plan and the price.
      await form.locator('#floorArea').fill('62')
      eq(await price(), '£120', 'EPC 55-75 + plan before submit')
      if (width === 360 || width === 1440) await form.screenshot({ path: path.join(out, `step1-${width}.png`) })
      await form.getByRole('button', { name: 'Continue' }).click(); await form.getByText('Step 2 of 3').waitFor()
      ok(/Guide estimate: £120 · 62 m²/.test(await form.locator('[data-estimate-summary]').innerText()), 'step 2 summary')
      await form.getByRole('button', { name: 'Continue to your details' }).click()
      await form.getByLabel('Full name').fill('Test Customer'); await form.getByLabel('Phone number').fill('07000000000')
      await form.getByLabel('Email address').fill('test@example.invalid'); await form.getByLabel('Property address').fill('1 Test Road')
      await form.getByLabel('Postcode').fill('E15 1AA'); await form.locator('#consent').check()
      await page.waitForFunction(() => document.querySelector('[name="cf-turnstile-response"]')?.value, null, { timeout: 30000 })
      await form.getByRole('button', { name: 'Send my quote request' }).click()
      await page.getByText('Request sent').waitFor()
      eq(submissions.length, 1, 'one submission')
      const sent = submissions[0]
      eq(sent.areaBand, '55-75', 'band id'); eq(sent.floorArea, '62', 'figure'); eq(sent.improvementPlan, true, 'plan'); eq(sent.energyReport, false, 'no report on an EPC')
      const review = await page.locator('[aria-labelledby="request-sent-heading"]').innerText()
      ok(/Personalised EPC Improvement Plan[\s\S]*\+£35/.test(review) && /£120/.test(review), 'review shows the plan and the guide')
      if (width === 1440) await page.locator('[aria-labelledby="request-sent-heading"]').screenshot({ path: path.join(out, `sent-${width}.png`) })
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
      eq(overflow <= 0, true, `no sideways scroll at ${width}`)
      await page.close()
      console.log(`ok ${width}px`)
    }
    // The pricing page: the same table, From on the top band only, a muted caption under each band (no column), the guide-price sentence.
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
    await page.goto(`${base}/pricing`, { waitUntil: 'networkidle' })
    const table = page.locator('#pricing-table table').first()
    const rows = await table.locator('tbody tr').allInnerTexts()
    eq(rows.length, 6, 'six bands on /pricing')
    ok(rows[0].includes('Up to 40 m²') && rows[0].includes('£65') && rows[0].includes('£90') && !/From/.test(rows[0]), 'first row')
    ok(/Over 115 m²[\s\S]*From[\s\S]*£120[\s\S]*From[\s\S]*£125[\s\S]*From[\s\S]*£145[\s\S]*From[\s\S]*£210/.test(rows[5]) && !/Save/.test(rows[5]), 'top row')
    eq(await table.locator('thead th').count(), 5, 'no bedroom column')
    ok(rows.every((row, i) => row.includes(captions[i])), 'each band row shows its caption')
    ok(await page.getByText('Larger or unusually complex properties are quoted individually.', { exact: false }).first().isVisible(), 'guide-price sentence')
    await page.locator('#pricing-table').screenshot({ path: path.join(out, 'pricing-table-1440.png') })
    console.log(`ok /pricing · ${checks + 5} checks`)
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exit(1) })
