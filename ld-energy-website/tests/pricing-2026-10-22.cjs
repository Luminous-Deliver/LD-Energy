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

const bands = ['Up to 40 m²', '41–55 m²', '56–75 m²', '76–95 m²', '96–115 m²', '116 m² and over']
// Abdul, 22/10/2026 (later): bedroom captions back under each band, kept muted and secondary to the m² label.
const captions = ['Studios and compact flats', '1-bedroom flats', '2-bedroom flats and small homes', '2–3-bedroom homes', '3–4-bedroom houses', 'Large homes, 4+\u00a0bedrooms']
const prices = {
  'Domestic EPC': ['£65', '£75', '£85', '£95', '£105', 'From £120'],
  'Floor Plan': ['£65', '£75', '£85', '£95', '£105', 'From £120'],
  'EPC + Floor Plan': ['£115', '£130', '£145', '£160', '£175', 'From £205'],
  'EPC Pre-Assessment': ['£90', '£100', '£110', '£120', '£130', 'From £145'],
}
const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

;(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  let checks = 0
  const skipped = new Set()
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
      // the quote form moved from /contact to /quote with the 23/10/2026 /contact split (54d75fd); old links redirect
      await page.goto(`${base}/quote#booking-form`, { waitUntil: 'networkidle' })
      const form = page.getByRole('form', { name: 'Exact quote enquiry' })
      const service = name => form.getByRole('radio', { name, exact: true })
      const size = name => form.getByRole('radio', { name: new RegExp('^' + escape(name) + '(,|$)') })
      const unsure = form.getByRole('radio', { name: 'Not sure of floor area', exact: true })
      const panel = form.locator('[data-estimate]')
      const price = () => panel.locator('[data-price]').innerText()
      const plan = form.getByRole('checkbox', { name: /Add a personalised EPC Improvement Plan/ })
      const report = form.getByRole('checkbox', { name: /Include a separate energy report/ })
      const field = form.locator('#floorArea')
      const link = form.getByRole('button', { name: 'Know the exact size? Enter it in m²' })

      // Phones (under 760px) draw the same form as a rail, one question open at a time (system C, d72a832, 23/10/2026):
      // `go` opens a question by its Change button before its controls are used or read; on desktop it does nothing.
      const phone = width < 760
      const questions = { who: 'Which best describes you?', service: 'Which service?', dwelling: 'What type of property is it?', size: 'How big is the property?', price: 'Your guide price' }
      const changes = { who: 'Change which best describes you', service: 'Change service', dwelling: 'Change property type', size: 'Change size', price: 'Change guide price options' }
      const openQuestion = id => form.locator('.bf-st.is-open [data-rail-q]', { hasText: questions[id] })
      const go = async id => {
        if (!phone || await openQuestion(id).count()) return
        await form.getByRole('button', { name: changes[id], exact: true }).click(); await openQuestion(id).waitFor()
      }
      // A tap on a phone folds the question and opens the next one; Space picks without moving on, so the test opens what it reads.
      const pick = async radio => { if (phone) { await radio.focus(); await page.keyboard.press('Space') } else await radio.check(); ok(await radio.isChecked(), 'picked') }
      const chooseService = async tab => { await go('service'); await pick(service(tab)) }
      const chooseSize = async band => { await go('size'); await pick(band === 'unsure' ? unsure : size(band)) }
      const guide = async () => { await go('price'); return price() }
      const togglePlan = async () => { await go('price'); await plan.check() }
      const dwelling = form.getByRole('radio', { name: 'Flat', exact: true })
      const sizeFieldset = form.locator('fieldset', { has: page.locator('input[name="areaBand"]') })

      if (phone) {
        // Answer the rail once, as a customer taps through it, so every step-1 question then has its Change button.
        // The price question only opens after a size, so the phone starts on the smallest band, whose prices are the "From" prices.
        await form.getByRole('radio', { name: 'Homeowner' }).check(); await openQuestion('service').waitFor()
        await form.locator('.bf-st.is-open').getByRole('button', { name: 'Continue', exact: true }).click(); await openQuestion('dwelling').waitFor()
        await dwelling.check(); await openQuestion('size').waitFor()
        ok(await link.isVisible(), 'subtle control below the list')
        await size('Up to 40 m²').check(); await openQuestion('price').waitFor()
        await form.getByRole('button', { name: 'Continue to timing' }).click(); await form.getByRole('button', { name: changes.price }).waitFor()
      } else {
        ok(await link.isVisible(), 'subtle control below the list, before a size is picked')
      }

      // §1 and §2: every band on every tab shows the configured price; only the top band reads "From"; each band has a muted bedroom caption.
      for (const [tab, expected] of Object.entries(prices)) {
        await chooseService(tab); await go('size')
        for (const [i, band] of bands.entries()) {
          const label = await size(band).getAttribute('aria-label')
          eq(label, `${band}, ${captions[i]}, ${expected[i]}`, `${tab} ${band}`)
        }
        const sizesText = await sizeFieldset.innerText()
        ok(captions.every(c => sizesText.includes(c)), `${tab}: every band shows its bedroom caption`)
        // the phone's not-sure row keeps only the confirm line (system C, d72a832)
        ok((phone || /Price confirmed before booking/.test(sizesText)) && /We’ll confirm the size and price from your property details\./.test(sizesText), `${tab}: the not-sure row`)
      }
      ok(await form.getByText('Choose the approximate internal floor area. Bedrooms are only a rough guide. Not sure? We can confirm it from your property details.').isVisible(), 'size hint')
      // Subtle: the caption is smaller, lighter and greyer than the m² label it sits under.
      const tone = await form.locator('input[name="areaBand"][value="up-to-40"]').evaluate(input => {
        const tile = input.closest('label')
        const read = el => { const cs = getComputedStyle(el); return { size: parseFloat(cs.fontSize), weight: +cs.fontWeight, color: cs.color } }
        return { area: read(tile.querySelector('b')), caption: read(tile.querySelector('.bf-tile__d, .bf-rr__d')) }
      })
      ok(tone.caption.size < tone.area.size && tone.caption.weight < tone.area.weight && tone.caption.color !== tone.area.color, `caption is muted ${JSON.stringify(tone)}`)

      // §8A: starting prices before a size, with the paid plan added where it applies. A phone shows the price after a
      // size (d72a832), so there these are the smallest band's prices, which are the same figures.
      await chooseService('Domestic EPC')
      eq(await guide(), '£65', 'EPC from')
      if (!phone) ok(/From/.test(await panel.innerText()) && /Pick a size for your guide price\./.test(await panel.innerText()), 'EPC from line')
      await togglePlan(); eq(await price(), '£100', 'EPC + plan from')
      await chooseService('EPC + Floor Plan'); eq(await guide(), '£150', 'bundle + plan from (plan kept between EPC and bundle)')
      await chooseService('Floor Plan'); eq(await guide(), '£65', 'floor plan from'); eq(await plan.count(), 0, 'no plan on Floor Plan'); eq(await report.count(), 0, 'no report on Floor Plan')
      await chooseService('EPC Pre-Assessment'); eq(await guide(), '£90', 'pre-assessment from'); eq(await plan.count(), 0, 'no paid plan on Pre-Assessment')

      // §8B, §5, §7: a standard band, its saving, the plan's £35, and no "From".
      await chooseService('EPC + Floor Plan'); await go('price')
      eq(await plan.isChecked(), false, 'leaving for Floor Plan cleared the paid plan')
      await chooseSize('56–75 m²')
      eq(await guide(), '£145', 'bundle 55-75'); ok(!/From/.test(await panel.locator('.bf__price').innerText()), 'no From on a standard band')
      ok(await panel.getByText('Save £25 compared with booking separately.').isVisible(), 'saving line')
      await togglePlan(); eq(await price(), '£180', 'bundle 55-75 + plan')
      await chooseService('Domestic EPC'); eq(await guide(), '£120', 'EPC 55-75 + plan (§7 example)')
      ok(await panel.locator('.bf__rows').getByText('Personalised EPC Improvement Plan').isVisible(), 'plan row')

      // §6 and §10: the free report never changes the price, shows in the summary, and never follows to another tab.
      await chooseService('EPC Pre-Assessment'); eq(await guide(), '£110', 'pre-assessment 55-75, paid plan cleared')
      await report.check(); eq(await price(), '£110', 'report is free')
      ok(await panel.locator('.bf__rows').getByText('Included at no extra charge').isVisible(), 'report row')
      await chooseService('Domestic EPC'); await chooseService('EPC Pre-Assessment'); await go('price')
      eq(await report.isChecked(), false, 'report cleared on leaving Pre-Assessment')

      // §8C and spec 2: the top band opens the shared field under its row, with "I don't know the floor area".
      await chooseService('Domestic EPC'); await go('size')
      if (!phone) {
        // desktop, 72f7735 (Abdul 24/10/2026): a picked band opens the exact size under it, so the link gives way to the field
        eq(await link.count(), 0, 'a picked band replaces the link with the field')
        ok(await form.getByLabel('Internal floor area', { exact: true }).isVisible(), 'the field is open under the picked band')
        eq(await field.getAttribute('placeholder'), 'e.g. 64', 'its example sits inside 56–75 m²')
      }
      await chooseSize('116 m² and over')
      ok(await form.getByLabel('Approximate internal floor area').isVisible(), 'top band label')
      eq(await field.getAttribute('placeholder'), 'e.g. 145', 'top band placeholder')
      ok(await form.getByText('Include all floors. An estimate is fine.').isVisible(), 'top band help')
      eq(await form.locator('.bf__area').count(), 1, 'one shared field')
      const order = await form.evaluate(f => { const row = f.querySelector('input[value="over-115"]').closest('label'), area = f.querySelector('.bf__area'), not = f.querySelector('input[value="unknown"]').closest('label'); return row.compareDocumentPosition(area) & 4 && area.compareDocumentPosition(not) & 4 })
      ok(order, 'field sits directly beneath the Over 115 row')
      eq(await guide(), '£120', 'EPC top band'); ok(/From/.test(await panel.locator('.bf__price').innerText()), 'From on the top band')
      ok(await panel.getByText('Final price depends on property size and complexity.', { exact: false }).isVisible(), 'top band note')
      if (phone) {
        // the phone's size question has its own Continue under the field
        await go('size'); await form.locator('.bf-st.is-open').getByRole('button', { name: 'Continue', exact: true }).click()
        ok(await form.getByText('Enter an approximate floor area, or choose “I don’t know the floor area”.').isVisible(), 'top band needs an area or unknown')
        eq(await openQuestion('size').count(), 1, 'stays on the size question')
      } else {
        // the property type is a required step-1 question since the v7 form (3abe7f8, 22/10/2026)
        await form.getByRole('radio', { name: 'Homeowner' }).check(); await dwelling.check()
        await form.getByRole('button', { name: 'Continue' }).click()
        ok(await form.getByText('Enter an approximate floor area, or choose “I don’t know the floor area”.').isVisible(), 'top band needs an area or unknown')
        eq(await form.getByText('Step 1 of 3').count(), 1, 'stays on step 1')
      }
      await form.getByRole('checkbox', { name: 'I don’t know the floor area' }).check()
      eq(await size('116 m² and over').isChecked(), true, 'unknown keeps the band')
      if (width === 1440) await form.screenshot({ path: path.join(out, `top-band-${width}.png`) })

      // Typing keeps focus and the field even when the figure moves to a smaller band; decimals are never rounded.
      await field.click(); await field.pressSequentially('100')
      eq(await page.evaluate(() => document.activeElement?.id), 'floorArea', 'focus stays in the field while typing')
      eq(await size('96–115 m²').isChecked(), true, '100 m² selects 95-115')
      ok(await field.isVisible(), 'field stays open on a smaller band')
      eq(await form.getByRole('checkbox', { name: 'I don’t know the floor area' }).count(), 0, 'unknown option only on the top band')
      eq(await guide(), '£105', 'EPC 95-115')
      await go('size')
      for (const [m2, band] of [['40', 'Up to 40 m²'], ['40.5', '41–55 m²'], ['55', '41–55 m²'], ['55.5', '56–75 m²'], ['75', '56–75 m²'], ['75.5', '76–95 m²'], ['95', '76–95 m²'], ['95.5', '96–115 m²'], ['115', '96–115 m²'], ['115.5', '116 m² and over']]) {
        await field.fill(m2); eq(await size(band).isChecked(), true, `${m2} m²`)
      }
      eq(await guide(), '£120', 'From £120 for 115.5 m²')
      // A manual pick of another band clears the figure; zero is rejected inline.
      await chooseSize('56–75 m²'); eq(await field.inputValue(), '', 'manual pick clears the figure')
      await field.fill('0')
      await (phone ? form.locator('.bf-st.is-open').getByRole('button', { name: 'Continue', exact: true }) : form.getByRole('button', { name: 'Continue' })).click()
      ok(await form.getByText('Enter a floor area greater than 0 m².').isVisible(), 'zero rejected')
      await field.fill('')

      // §8D: not sure: no figure, the plan listed on its own.
      await chooseSize('unsure'); await togglePlan()
      eq(await price(), 'Price to be confirmed', 'unknown size')
      ok(await panel.getByText('We’ll confirm the size and price from your property details.').isVisible(), 'unknown line')
      ok(await panel.locator('.bf__rows').getByText('+£35').isVisible(), 'plan +£35 listed separately')
      ok(!/£\d/.test(await panel.locator('.bf__price').innerText()), 'no invented total')

      // Keyboard: arrow keys move through the bands and the summary follows.
      await go('size'); await size('41–55 m²').focus(); await page.keyboard.press('ArrowRight')
      eq(await size('56–75 m²').isChecked(), true, 'arrow key moves the band')

      // §12: submission and review carry the band id, the figure, the plan and the price.
      if (phone && !(await field.isVisible())) await link.click()
      await form.locator('#floorArea').fill('62')
      eq(await guide(), '£120', 'EPC 55-75 + plan before submit')
      if (width === 360 || width === 1440) await form.screenshot({ path: path.join(out, `step1-${width}.png`) })
      if (phone) {
        // the phone folds each answer into its line instead of a step-2 summary
        await form.getByRole('button', { name: 'Continue to timing' }).click(); await form.getByRole('button', { name: changes.price }).waitFor()
        const folds = await form.locator('.bf-fold').allInnerTexts()
        ok(folds.some(t => /Guide price[\s\S]*£120/i.test(t)) && folds.some(t => /Size[\s\S]*62 m²/i.test(t)), `step 2 summary ${JSON.stringify(folds)}`)
      } else {
        await form.getByRole('button', { name: 'Continue' }).click(); await form.getByText('Step 2 of 3').waitFor()
        ok(/Guide estimate: £120 · 62 m²/.test(await form.locator('[data-estimate-summary]').innerText()), 'step 2 summary')
      }
      await form.getByRole('button', { name: 'Continue to your details' }).click()
      await form.getByLabel('Full name').fill('Test Customer'); await form.getByLabel('Phone number').fill('07000000000')
      await form.getByLabel('Email address').fill('test@example.invalid'); await form.getByLabel('Property address').fill('1 Test Road')
      await form.getByLabel('Postcode').fill('E15 1AA'); await form.locator('#consent').check()
      // A draft-branch build (FORM_DRAFT, e0c0fe8) skips the security check and sends nothing, so there is no request to read.
      const draft = await form.getByText('Draft preview: the security check is skipped and nothing is sent.').count() > 0
      if (!draft) await page.waitForFunction(() => document.querySelector('[name="cf-turnstile-response"]')?.value, null, { timeout: 30000 })
      await form.getByRole('button', { name: 'Send my quote request' }).click()
      await page.getByText('Request sent').waitFor()
      if (draft) {
        skipped.add(`${width}px`)
      } else {
        eq(submissions.length, 1, 'one submission')
        const sent = submissions[0]
        eq(sent.areaBand, '55-75', 'band id'); eq(sent.floorArea, '62', 'figure'); eq(sent.improvementPlan, true, 'plan'); eq(sent.energyReport, false, 'no report on an EPC')
      }
      const review = await page.locator('[aria-labelledby="request-sent-heading"]').innerText()
      ok(/Personalised EPC Improvement Plan[\s\S]*\+£35/.test(review) && /£120/.test(review), 'review shows the plan and the guide')
      if (width === 1440) await page.locator('[aria-labelledby="request-sent-heading"]').screenshot({ path: path.join(out, `sent-${width}.png`) })
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
      eq(overflow <= 0, true, `no sideways scroll at ${width}`)
      await page.close()
      console.log(`ok ${width}px`)
    }
    // The /pricing page's checks moved to tests/pricing-page.cjs with its 24/10/2026 redesign.
    if (skipped.size) console.log(`DRAFT BUILD: sends are stubbed, so the submitted fields were NOT checked (${[...skipped].join(', ')}). Run against a FORM_DRAFT=false build for those.`)
    console.log(`ok form · ${checks} checks`)
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exit(1) })
