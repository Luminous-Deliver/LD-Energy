const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const out = path.resolve('../../../audits/website-growth-audit/ld-energy-stage1-final-2026-09-11')
fs.mkdirSync(path.join(out, 'browser-temp'), { recursive: true })
// Keep test profiles on D: while the owner recovers C:. No changes to system settings.
process.env.TEMP = process.env.TMP = path.join(out, 'browser-temp')
const { chromium } = require('playwright')
const base = process.env.BOOKING_TEST_URL || 'http://localhost:3100'
if (!['localhost','127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')
const historyKey = 'ldEnergyQuoteForm'

;(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--disable-features=BackForwardCache'] })
  const report = { estimates: [], history: [], attribution: [] }
  try {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    await context.addInitScript(() => {
      if (window.top !== window) return
      localStorage.setItem('cookie-consent', 'declined')
      window.turnstile = { render: (_, options) => { setTimeout(() => options.callback('test-token'), 20); return 'test' }, remove() {}, reset() {} }
    })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.route('**/api/contact', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, delivered: true }) }))
    const form = page.locator('form')
    const choose = name => form.getByRole('radio', { name, exact: true }).check()
    const next = () => form.getByRole('button', { name: 'Continue', exact: true }).click()

    for (const [width,height] of [[320,568],[390,844],[768,1024]]) {
      await page.setViewportSize({ width, height })
      await page.goto(base + '/contact', { waitUntil: 'networkidle' })
      const live = page.locator('[data-estimate-announcement]')
      assert.equal(await live.count(), 1)
      assert.equal(await live.getAttribute('aria-live'), 'polite')
      assert.equal(await live.getAttribute('aria-atomic'), 'true')
      assert.equal(await live.innerText(), '')
      assert.equal(await form.locator('[data-estimate-summary]').count(), 0)
      await page.evaluate(() => {
        window.liveNode = document.querySelector('[data-estimate-announcement]')
        window.announcements = []
        new MutationObserver(() => window.announcements.push(window.liveNode.textContent)).observe(window.liveNode, { subtree: true, childList: true, characterData: true })
      })
      for (const [value, expected] of [['up-to-37','£65'],['121-plus','£125'],['unknown',"We'll confirm your exact quote after reviewing your property details."]]) {
        const input = form.locator(`input[name="areaBand"][value="${value}"]`)
        await input.scrollIntoViewIfNeeded()
        const before = await page.evaluate(() => scrollY)
        await input.check()
        await page.waitForFunction(() => {
          const rect = document.querySelector('[data-estimate-summary]')?.getBoundingClientRect()
          return rect && rect.top >= 0 && rect.bottom <= innerHeight
        })
        const summary = form.locator('[data-estimate-summary]')
        assert.ok((await summary.innerText()).includes(expected))
        if (value === 'unknown') assert.doesNotMatch(await summary.innerText(), /£/)
        assert.equal(await page.evaluate(() => window.liveNode === document.querySelector('[data-estimate-announcement]')), true)
        assert.equal(await page.evaluate(() => document.activeElement.value), value)
        assert.ok(await page.evaluate(previous => scrollY >= previous, before), 'Result reveal never scrolls upward')
        const order = await summary.evaluate(element => ({
          top: element.getBoundingClientRect().top,
          areaBottom: document.querySelector('input[name="areaBand"]').closest('fieldset').getBoundingClientRect().bottom,
          customerTop: document.querySelector('input[name="customerType"]').closest('fieldset').getBoundingClientRect().top,
          bottom: element.getBoundingClientRect().bottom,
        }))
        assert.ok(order.top >= order.areaBottom && order.bottom <= order.customerTop)
        await page.screenshot({ path: path.join(out, `estimate-${width}-${value}.png`) })
      }
      const announcements = await page.evaluate(() => window.announcements)
      assert.equal(announcements.length, 3)
      assert.match(announcements[0], /Guide estimate: £65/)
      await choose('Homeowner')
      assert.deepEqual(await page.evaluate(() => window.announcements), announcements, 'Customer changes do not reannounce the estimate')
      await next()
      assert.equal(await page.evaluate(() => window.liveNode === document.querySelector('[data-estimate-announcement]')), true)
      await form.locator('#notes').fill('Private test note')
      assert.deepEqual(await page.evaluate(() => window.announcements), announcements)
      await form.getByRole('button', { name: 'Back', exact: true }).click()
      await choose('Agency / portfolio enquiry')
      await page.waitForFunction(() => document.querySelector('[data-estimate-summary]').getBoundingClientRect().bottom <= innerHeight)
      assert.equal(await form.locator('[data-estimate-summary]').innerText(), 'Your portfolio will be quoted individually.')
      assert.equal(await form.locator('input[name="areaBand"]').count(), 0)
      report.estimates.push({ width, noArea: true, known: true, unknown: true, bulk: true, stableLiveRegion: true, firstAnnouncement: announcements[0], visibleWithoutUpwardScroll: true })
      console.log(`PASS ${width}: inline estimate states, visible result, stable/non-noisy live region`)
    }

    await page.setViewportSize({ width: 1440, height: 900 })
    const initialEntry = async route => {
      await page.goto(base + route, { waitUntil: 'networkidle' })
      if (route !== '/') await page.locator('main a[href*="/contact"]').first().click()
      await form.waitFor()
    }
    for (const [route, initial, manual] of [['/landlords','Landlord (tenanted)','Homeowner'],['/estate-agents','Estate agent','Letting agent / firm'],['/','','Landlord (tenanted)']]) {
      await initialEntry(route)
      if (initial) await page.waitForFunction(value => document.querySelector(`input[name="customerType"][value="${value}"]`)?.checked, initial)
      else assert.equal(await form.locator('input[name="customerType"]:checked').count(), 0)
      const original = await page.evaluate(() => ({ state: history.state, local: { ...localStorage }, session: { ...sessionStorage } }))
      await choose(manual)
      const saved = await page.evaluate(key => history.state[key], historyKey)
      assert.deepEqual(saved, { customerType: manual })
      const router = await page.evaluate(key => { const copy = { ...history.state }; delete copy[key]; return copy }, historyKey)
      assert.deepEqual(router, original.state)
      const entryUrl = page.url()
      // Next client navigation also unmounts the form; its router state must survive.
      await page.locator('footer a[href="/pricing"]').first().click()
      await page.waitForURL(base + '/pricing')
      assert.equal(await form.count(), 0)
      assert.equal(await page.evaluate(key => history.state[key], historyKey), undefined)
      await page.goBack({ waitUntil: 'networkidle' })
      await page.waitForFunction(value => document.querySelector(`input[name="customerType"][value="${value}"]`)?.checked, manual)
      // Hard navigation plus disabled bfcache forces a fresh document/form on Back.
      await page.goto(base + '/pricing', { waitUntil: 'networkidle' })
      assert.equal(await form.count(), 0)
      assert.equal(await page.evaluate(key => history.state[key], historyKey), undefined)
      await page.goBack({ waitUntil: 'networkidle' })
      assert.equal(page.url(), entryUrl)
      await page.waitForFunction(value => document.querySelector(`input[name="customerType"][value="${value}"]`)?.checked, manual)
      await page.goForward({ waitUntil: 'domcontentloaded' })
      await page.waitForURL(base + '/pricing', { waitUntil: 'domcontentloaded' })
      await page.goBack({ waitUntil: 'domcontentloaded' })
      await page.waitForFunction(value => document.querySelector(`input[name="customerType"][value="${value}"]`)?.checked, manual)
      assert.equal(await form.getByRole('radio', { name: manual, exact: true }).isChecked(), true)
      await page.reload({ waitUntil: 'networkidle' })
      assert.equal(await form.getByRole('radio', { name: manual, exact: true }).isChecked(), true)
      assert.deepEqual(await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } })), { local: original.local, session: original.session })
      report.history.push({ route, initial: initial || 'unselected', manual, clientNavigationBack: true, awayBack: true, forwardBack: true, refreshPreserved: true, onlyCustomerTypeStored: true })
      console.log(`PASS ${route}: full-document history and refresh restore ${manual}`)
    }

    await initialEntry('/landlords')
    assert.equal(await form.getByRole('radio', { name: 'Landlord (tenanted)', exact: true }).isChecked(), true)
    assert.equal(await page.evaluate(key => history.state[key], historyKey), undefined)
    await choose('Homeowner')
    await choose('Not sure of floor area')
    await next(); await next()
    await form.locator('#name').fill('Test Customer')
    await form.locator('#phone').fill('07000000000')
    await form.locator('#email').fill('test@example.invalid')
    await form.locator('#address').fill('1 Test Road')
    await form.locator('#postcode').fill('E15 1AA')
    await form.locator('#consent').check()
    assert.deepEqual(await page.evaluate(key => history.state[key], historyKey), { customerType: 'Homeowner' })
    await form.getByRole('button', { name: 'Send my quote request' }).click()
    await page.getByRole('button', { name: 'Send another request' }).click()
    assert.equal(await form.locator('input[name="customerType"]:checked').count(), 0)
    assert.deepEqual(await page.evaluate(key => history.state[key], historyKey), { customerType: '' })
    await page.reload({ waitUntil: 'networkidle' })
    assert.equal(await form.locator('input[name="customerType"]:checked').count(), 0)
    report.reset = { freshLandlordDefault: true, explicitResetUnselected: true, resetSurvivesRefresh: true, piiAbsent: true }

    for (const [route,source] of [['/pricing','pricing'],['/preparing-for-your-epc','preparation']]) {
      await page.goto(base + route, { waitUntil: 'networkidle' })
      const links = await page.locator('main a[href*="/contact"]').evaluateAll(anchors => anchors.map(a => ({ href: a.getAttribute('href'), label: a.textContent.trim() })))
      const ctas = []
      for (const link of links) {
        const url = new URL(link.href, base)
        assert.equal(url.searchParams.get('source'), source)
        assert.ok(['hero','bottom','inline'].includes(url.searchParams.get('cta')))
        assert.equal(url.hash, '#booking-form')
        assert.ok([...url.searchParams.keys()].every(key => ['source','cta','service'].includes(key)))
        ctas.push(url.searchParams.get('cta'))
      }
      assert.ok(ctas.includes('hero') && ctas.includes('bottom'))
      if (source === 'preparation') assert.doesNotMatch(links.map(link => link.label).join(' '), /Book your EPC/i)
      report.attribution.push({ route, source, ctas })
    }
    assert.deepEqual(errors, [])
    fs.writeFileSync(path.join(out, 'targeted-browser-results.json'), JSON.stringify(report, null, 2))
    console.log('PASS fresh defaults, explicit reset, no PII/storage leakage, pricing/preparation attribution')
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
