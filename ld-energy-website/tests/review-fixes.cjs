const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const base = process.env.BOOKING_TEST_URL || 'http://localhost:3100'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')
const out = path.resolve(process.env.BOOKING_EVIDENCE_DIR || '../../../audits/website-growth-audit/ld-energy-stage1-review-fix-2026-09-11')
fs.mkdirSync(out, { recursive: true })
const widths = [[320,568],[360,800],[375,812],[390,844],[412,915],[430,932],[768,1024],[1440,900]]
const { rail } = require('./quote-rail.cjs')
// Since the 23/10/2026 quote journey (decisions/log.md 23/10 late, 54d75fd) quote buttons are /quote links that open the
// pop-up, /quote is the page they stand for, and area pages keep one form at #contact that only the buttons beside it
// jump to (23/10 late correction and that evening's Pop-up rule). Phones draw the form as a rail (d72a832).

;(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  const report = []
  const skipped = new Set()
  try {
    for (const [width, height] of widths) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' })
      const errors = [], payloads = []
      page.on('pageerror', error => errors.push(error.message))
      await page.addInitScript(() => {
        if (window.top !== window) return
        localStorage.setItem('cookie-consent', 'declined')
        window.turnstile = { render: (_, options) => { setTimeout(() => options.callback('test-token'), 20); return 'test' }, remove() {}, reset() {} }
      })
      await page.route('**/api/contact', route => {
        payloads.push(route.request().postDataJSON())
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, delivered: true }) })
      })
      // the form in use: the pop-up's while it is open, else the page's own
      const form = page.locator('dialog.qd[open] form[aria-label="Exact quote enquiry"], body:not(:has(dialog.qd[open])) main form[aria-label="Exact quote enquiry"]')
      const r = rail(page, form)
      const next = () => form.getByRole('button', { name: /^Continue/ }).click()
      const back = () => form.getByRole('button', { name: 'Back', exact: true }).click()
      const choose = name => form.getByRole('radio', { name, exact: true }).check()
      // a choice on a given question: on a phone that question is opened first, and Space keeps it open
      const set = async (id, radio) => { await r.go(id); await r.pick(radio) }
      const chooseOn = (id, name) => set(id, form.getByRole('radio', { name, exact: true }))
      // a draft build says so on its confirmation
      const draft = async () => await page.getByText('Draft preview: nothing was sent.', { exact: false }).count() > 0
      const detailAndSubmit = async () => {
        if (await r.isPhone()) await r.go('details')
        else { await next(); await next() }
        await form.locator('[id$="name"]').first().fill('Test Customer')
        await form.locator('input[id$="phone"]').fill('07000000000')
        await form.locator('input[id$="email"]').fill('test@example.invalid')
        await form.locator('[id$="address"]').fill('1 Test Road')
        await form.locator('input[id$="postcode"]').fill('E15 1AA')
        await form.locator('input[id$="consent"]').check()
        await form.getByRole('button', { name: 'Send my quote request' }).click()
        await page.getByRole('heading', { name: /^Request sent\. Thanks, Test\.$/ }).waitFor()
      }

      // Page-specific defaults are seeds, not rules that can overwrite a customer's selection.
      const customers = []
      for (const [route, initial] of [['landlords','Landlord (tenanted)'], ['estate-agents','Estate agent'], ['sellers','']]) {
        await page.goto(`${base}/${route}`, { waitUntil: 'networkidle' })
        // the first quote button; on /estate-agents that quotes one home since 7d7a15b (parity item 9), not a portfolio
        const opener = page.locator('main a[href^="/quote"]').first()
        const bulk = /service=bulk/.test(await opener.getAttribute('href'))
        await opener.click()
        await page.locator('dialog.qd[open] form').waitFor({ timeout: 15000 })
        const phone = await r.isPhone()
        if (initial) assert.equal(await form.getByRole('radio', { name: initial, exact: true }).isChecked(), true)
        else assert.equal(await form.locator('input[name="customerType"]:checked').count(), 0)
        await chooseOn('who', 'Letting agent / firm')
        if (!bulk) {
          // Validation must not change the manual customer selection.
          if (phone) await page.keyboard.press('Enter') // Enter on a rail answer moves on, as Continue does
          else await next()
          await r.go('who')
          assert.equal(await form.getByRole('radio', { name: 'Letting agent / firm', exact: true }).isChecked(), true)
          await chooseOn('size', 'Not sure of floor area'); await chooseOn('dwelling', 'Flat')
        }
        // the timing step, or a portfolio's details step (it skips timing, 3abe7f8)
        if (phone) await r.go(bulk ? 'details' : 'timing')
        else await next()
        await form.locator('[id$="notes"]').fill('Private access note')
        if (phone) await r.go('service'); else await back()
        await chooseOn('service', 'Floor Plan')
        await r.go('who')
        assert.equal(await form.getByRole('radio', { name: 'Letting agent / firm', exact: true }).isChecked(), true)
        await page.keyboard.press('Escape')
        customers.push({ route, initial: initial || 'unselected', manualChoicePreserved: true })
      }

      // Exact reviewer reproduction: a real same-page quote link creates a history entry. The header's quote link on
      // /quote itself navigates (no pop-up on its own page) and adds the entry the old #booking-form link did.
      await page.goto(base + '/quote', { waitUntil: 'networkidle' })
      await page.locator('header a.sh__quote').evaluate(anchor => anchor.click())
      await page.waitForURL(/cta=header/)
      await chooseOn('service', 'EPC + Floor Plan')
      await set('size', form.locator('input[value="40-55"]'))
      await chooseOn('dwelling', 'Flat')
      await chooseOn('who', 'Letting agent / firm')
      const phone = await r.isPhone()
      if (phone) await r.go('timing'); else await next()
      await form.locator('[id$="notes"]').fill('Keep this history note')
      if (!phone) await back()
      await page.goBack({ waitUntil: 'networkidle' })
      await r.go('service')
      assert.equal(await form.getByRole('radio', { name: 'EPC + Floor Plan', exact: true }).isChecked(), true)
      await r.go('size')
      assert.equal(await form.locator('input[value="40-55"]').isChecked(), true)
      await r.go('who')
      assert.equal(await form.getByRole('radio', { name: 'Letting agent / firm', exact: true }).isChecked(), true)
      if (phone) await r.go('timing'); else await next()
      assert.equal(await form.locator('[id$="notes"]').inputValue(), 'Keep this history note')
      if (!phone) await back()
      await page.goForward({ waitUntil: 'networkidle' })
      await r.go('size')
      assert.equal(await form.locator('input[value="40-55"]').isChecked(), true)
      await chooseOn('service', 'Floor Plan')
      assert.match(await form.locator('[data-estimate-announcement]').innerText(), /£75/)
      await chooseOn('size', 'Not sure of floor area'); await chooseOn('dwelling', 'Flat')
      assert.doesNotMatch(await form.locator('[data-estimate-announcement]').innerText(), /£/)
      await chooseOn('service', 'Agency / portfolio enquiry')
      assert.doesNotMatch(await form.locator('[data-estimate-announcement]').innerText(), /£/)

      const areas = []
      for (const areaPage of ['stratford','newham','croydon']) {
        // Contradictory query context must not replace the server-known geographic landing page.
        await page.goto(`${base}/areas/${areaPage}?areaPage=unknown<script>&borough=hackney&source=evil`, { waitUntil: 'networkidle' })
        const ctas = []
        for (const ctaId of ['hero','pricing','bottom']) {
          const cta = page.locator(`main a[data-enquiry-cta="${ctaId}"]`)
          assert.equal(await cta.count(), 1)
          const href = await cta.getAttribute('href')
          if (ctaId === 'bottom') {
            // beside the form: the closing band jumps to it
            assert.equal(href, '#contact')
            await cta.click()
            await page.waitForURL(url => url.pathname === `/areas/${areaPage}` && url.hash === '#contact')
            assert.equal(new URL(page.url()).pathname, `/areas/${areaPage}`)
            assert.equal(new URL(page.url()).hash, '#contact')
            assert.equal(await page.locator('#contact form').count(), 1)
          } else {
            // at the top: the pop-up, carrying the server-known area page and this button's id
            const url = new URL(href, base)
            assert.equal(url.pathname, '/quote')
            assert.equal(url.searchParams.get('page'), areaPage)
            assert.equal(url.searchParams.get('cta'), ctaId)
            await cta.click()
            await page.locator('dialog.qd[open] form').waitFor({ timeout: 15000 })
            assert.equal(new URL(page.url()).pathname, `/areas/${areaPage}`)
          }
          if (await r.isPhone()) await r.go('details', { who: 'Homeowner', dwelling: 'Flat', size: 'unknown' })
          else { await choose('Not sure of floor area'); await choose('Flat'); await choose('Homeowner') }
          await detailAndSubmit()
          if (await draft()) {
            // a draft-branch build (FORM_DRAFT, e0c0fe8) sends nothing, so there is no payload to read
            skipped.add(`${width}px`)
          } else {
            const payload = payloads.at(-1)
            assert.equal(payload.areaPage, areaPage)
            assert.equal(payload.areaBand, 'unknown')
            assert.equal(payload.sourcePage, 'area')
            assert.equal(payload.ctaId, ctaId)
            assert.equal(payload.customerType, 'Homeowner')
            assert.deepEqual(payload.services, ['EPC Certificate'])
          }
          await page.getByRole('button', { name: 'Send another request' }).click()
          assert.equal(await form.locator('input[name="customerType"]:checked').count(), 0)
          if (ctaId !== 'bottom') await page.keyboard.press('Escape')
          ctas.push({ ctaId, href, payloadVerified: !skipped.has(`${width}px`) })
        }
        if (width === 390) await page.locator('#contact').screenshot({ path: path.join(out, `${areaPage}-embedded-form.png`) })
        areas.push({ areaPage, ctas })
      }
      assert.deepEqual(errors, [])
      report.push({ width, customers, areas, browserHistoryPreservesEdits: true, estimatesCorrect: true })
      console.log(`PASS ${width}: audience defaults/edits, real-link Back/Forward, 9 area-CTA submissions, estimates`)
      await page.close()
    }
    fs.writeFileSync(path.join(out, 'review-fixes.json'), JSON.stringify(report, null, 2))
    if (skipped.size) console.log(`DRAFT BUILD: sends are stubbed, so the 9 area submissions' payloads were NOT checked (${[...skipped].join(', ')}). Run against a FORM_DRAFT=false build for those.`)
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
