const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const base = process.env.BOOKING_TEST_URL || 'http://localhost:3100'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')
const out = path.resolve(process.env.BOOKING_EVIDENCE_DIR || '../../../audits/website-growth-audit/ld-energy-stage1-review-fix-2026-09-11')
fs.mkdirSync(out, { recursive: true })
const widths = [[320,568],[360,800],[375,812],[390,844],[412,915],[430,932],[768,1024],[1440,900]]

;(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  const report = []
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
      const form = page.locator('form')
      const next = () => form.getByRole('button', { name: /^Continue/ }).click()
      const back = () => form.getByRole('button', { name: 'Back', exact: true }).click()
      const choose = name => form.getByRole('radio', { name, exact: true }).check()
      const detailAndSubmit = async () => {
        await next(); await next()
        await form.locator('#name').fill('Test Customer')
        await form.locator('#phone').fill('07000000000')
        await form.locator('#email').fill('test@example.invalid')
        await form.locator('#address').fill('1 Test Road')
        await form.locator('#postcode').fill('E15 1AA')
        await form.locator('#consent').check()
        await form.getByRole('button', { name: 'Send my quote request' }).click()
        await page.getByRole('heading', { name: /^Request sent\. Thanks, Test\.$/ }).waitFor()
      }

      // Page-specific defaults are seeds, not rules that can overwrite a customer's selection.
      const customers = []
      for (const [route, initial] of [['landlords','Landlord (tenanted)'], ['estate-agents','Estate agent'], ['sellers','']]) {
        await page.goto(`${base}/${route}`, { waitUntil: 'networkidle' })
        await page.locator('main a[href*="/contact"]').first().click()
        await form.waitFor()
        if (initial) assert.equal(await form.getByRole('radio', { name: initial, exact: true }).isChecked(), true)
        else assert.equal(await form.locator('input[name="customerType"]:checked').count(), 0)
        await choose('Letting agent / firm')
        if (route !== 'estate-agents') {
          await next() // Validation must not change the manual customer selection.
          assert.equal(await form.getByRole('radio', { name: 'Letting agent / firm', exact: true }).isChecked(), true)
          await choose('Not sure of floor area')
        }
        await next()
        await form.locator('#notes').fill('Private access note')
        await back()
        await choose('Floor Plan')
        assert.equal(await form.getByRole('radio', { name: 'Letting agent / firm', exact: true }).isChecked(), true)
        customers.push({ route, initial: initial || 'unselected', manualChoicePreserved: true })
      }

      // Exact reviewer reproduction: real same-page quote link creates a history entry.
      await page.goto(base + '/contact', { waitUntil: 'networkidle' })
      await page.locator('header a[href="#booking-form"]').first().evaluate(anchor => anchor.click())
      await choose('EPC + Floor Plan')
      await form.locator('input[value="38-52"]').check()
      await choose('Letting agent / firm')
      await next()
      await form.locator('#notes').fill('Keep this history note')
      await back()
      await page.goBack({ waitUntil: 'networkidle' })
      assert.equal(await form.getByRole('radio', { name: 'EPC + Floor Plan', exact: true }).isChecked(), true)
      assert.equal(await form.locator('input[value="38-52"]').isChecked(), true)
      assert.equal(await form.getByRole('radio', { name: 'Letting agent / firm', exact: true }).isChecked(), true)
      await next()
      assert.equal(await form.locator('#notes').inputValue(), 'Keep this history note')
      await back()
      await page.goForward({ waitUntil: 'networkidle' })
      assert.equal(await form.locator('input[value="38-52"]').isChecked(), true)
      await choose('Floor Plan')
      assert.match(await form.locator('[data-estimate-announcement]').innerText(), /£65/)
      await choose('Not sure of floor area')
      assert.doesNotMatch(await form.locator('[data-estimate-announcement]').innerText(), /£/)
      await choose('Agency / portfolio enquiry')
      assert.doesNotMatch(await form.locator('[data-estimate-announcement]').innerText(), /£/)

      const areas = []
      for (const areaPage of ['stratford','newham','croydon']) {
        // Area pages hold no form (16/10/2026 evening): every CTA opens /contact carrying the
        // server-rendered slug. Query text on the area URL must not change where it points.
        const ctas = []
        for (const ctaId of ['hero','pricing','bottom']) {
          await page.goto(`${base}/areas/${areaPage}?areaPage=unknown<script>&borough=hackney&source=evil`, { waitUntil: 'networkidle' })
          assert.equal(await page.locator('main form').count(), 0)
          const cta = page.locator(`main a[data-enquiry-cta="${ctaId}"]`)
          assert.equal(await cta.count(), 1)
          const href = await cta.getAttribute('href')
          assert.equal(href, `/contact?service=epc&source=area&cta=${ctaId}&borough=${areaPage}#booking-form`)
          await cta.click()
          await page.waitForURL(url => url.pathname === '/contact')
          await form.waitFor()
          await choose('Not sure of floor area')
          await choose('Homeowner')
          await detailAndSubmit()
          const payload = payloads.at(-1)
          assert.equal(payload.areaPage, areaPage)
          assert.equal(payload.areaBand, 'unknown')
          assert.equal(payload.sourcePage, 'area')
          assert.equal(payload.ctaId, ctaId)
          assert.equal(payload.customerType, 'Homeowner')
          assert.deepEqual(payload.services, ['EPC Certificate'])
          ctas.push({ ctaId, href, payloadVerified: true })
        }
        // A price in the hero card pre-chooses the size, and the enquiry still names the page.
        await page.goto(`${base}/areas/${areaPage}`, { waitUntil: 'networkidle' })
        await page.locator('.hpc a.hpc__price').nth(3).click() // row 2 (38-52 m²), bundle column
        await page.waitForURL(url => url.pathname === '/contact')
        await form.waitFor()
        assert.equal(await form.locator('input[value="38-52"]').isChecked(), true)
        assert.equal(await form.getByRole('radio', { name: 'EPC + Floor Plan', exact: true }).isChecked(), true)
        await choose('Homeowner')
        await detailAndSubmit()
        assert.equal(payloads.at(-1).areaPage, areaPage)
        assert.equal(payloads.at(-1).areaBand, '38-52')
        if (width === 390) await page.goto(`${base}/areas/${areaPage}`, { waitUntil: 'networkidle' }).then(() => page.locator('.hpc').screenshot({ path: path.join(out, `${areaPage}-price-card.png`) }))
        areas.push({ areaPage, ctas, priceCardPrefill: true })
      }
      assert.deepEqual(errors, [])
      report.push({ width, customers, areas, browserHistoryPreservesEdits: true, estimatesCorrect: true })
      console.log(`PASS ${width}: audience defaults/edits, real-link Back/Forward, 12 area submissions via /contact, estimates`)
      await page.close()
    }
    fs.writeFileSync(path.join(out, 'review-fixes.json'), JSON.stringify(report, null, 2))
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
