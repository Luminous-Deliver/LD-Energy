const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const out = path.resolve(process.env.BOOKING_EVIDENCE_DIR || '../../../audits/website-growth-audit/ld-energy-stage1-final-2026-09-11')
fs.mkdirSync(path.join(out, 'browser-temp'), { recursive: true })
// Keep test profiles on D: while the owner recovers C:. No changes to system settings.
process.env.TEMP = process.env.TMP = path.join(out, 'browser-temp')
const { chromium } = require('playwright')
const base = process.env.BOOKING_TEST_URL || 'http://localhost:3100'
if (!['localhost','127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')
const historyKey = 'ldEnergyQuoteForm'
const { rail } = require('./quote-rail.cjs')
// Since the 23/10/2026 quote journey (decisions/log.md 23/10 late, 54d75fd) the form lives on /quote, quote buttons are
// /quote links (a click opens the pop-up), and phones draw the form as a rail (d72a832): `r.go` opens a question first.

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
    const form = page.locator('main form[aria-label="Exact quote enquiry"]')
    const r = rail(page, form)
    const choose = name => form.getByRole('radio', { name, exact: true }).check()
    const next = () => form.getByRole('button', { name: /^Continue/ }).click()

    for (const [width,height] of [[320,568],[390,844],[768,1024]]) {
      await page.setViewportSize({ width, height })
      await page.goto(base + '/quote', { waitUntil: 'networkidle' })
      const phone = await r.isPhone()
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
      for (const [value, expected] of [['up-to-40','£65'],['over-115','From £120'],['unknown','Price to be confirmed']]) {
        // the walk to the size answers "you" as a landlord, so the Homeowner pick below is still a change
        await r.go('size', { who: 'Landlord (tenanted)' })
        const input = form.locator(`input[name="areaBand"][value="${value}"]`)
        await input.scrollIntoViewIfNeeded()
        // when the floor-area field above closes (320 px), the tapped row is kept in view: scrolling up by the height
        // the form gave back is that, any more would be the reveal jumping upward
        const before = await form.evaluate(f => ({ y: scrollY, h: f.getBoundingClientRect().height }))
        await r.pick(input)
        await page.waitForFunction(text => document.querySelector('[data-estimate-announcement]').textContent.includes(text), expected)
        // The result is on screen where the visitor tapped: the tile carries its own price.
        assert.ok(await input.evaluate(el => { const r = el.closest('label').getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight }), `chosen tile on screen at ${width}: ${value}`)
        if (value === 'unknown') assert.doesNotMatch(await form.locator('[data-estimate-announcement]').innerText(), /£/)
        assert.equal(await page.evaluate(() => window.liveNode === document.querySelector('[data-estimate-announcement]')), true)
        // a phone's top band moves focus into the floor-area field it opens (d72a832); elsewhere focus stays on the tile
        if (phone && value === 'over-115') assert.equal(await page.evaluate(() => document.activeElement.id), 'floorArea')
        else assert.equal(await page.evaluate(() => document.activeElement.value), value)
        assert.ok(await form.evaluate((f, b) => scrollY >= b.y - Math.max(0, b.h - f.getBoundingClientRect().height) - 1, before), 'Result reveal never scrolls upward beyond keeping the row in view')
        // a phone shows the summary in its own question, after the size (d72a832)
        await r.go('price')
        const summary = form.locator('[data-estimate]')
        assert.ok((await summary.innerText()).includes(expected.replace('From ', '')))
        await page.screenshot({ path: path.join(out, `estimate-${width}-${value}.png`) })
      }
      const announcements = await page.evaluate(() => window.announcements)
      assert.equal(announcements.length, 3)
      assert.match(announcements[0], /Guide estimate: £65/)
      await r.go('who'); await r.pick(form.getByRole('radio', { name: 'Homeowner', exact: true }))
      assert.deepEqual(await page.evaluate(() => window.announcements), announcements, 'Customer changes do not reannounce the estimate')
      // the property type has been a required step-1 question since the v7 form (3abe7f8, 22/10/2026)
      if (phone) await r.go('timing')
      else { await choose('Flat'); await next() }
      assert.equal(await page.evaluate(() => window.liveNode === document.querySelector('[data-estimate-announcement]')), true)
      await form.locator('#notes').fill('Private test note')
      assert.deepEqual(await page.evaluate(() => window.announcements), announcements)
      if (phone) await r.go('service')
      else await form.getByRole('button', { name: 'Back', exact: true }).click()
      await r.pick(form.getByRole('radio', { name: 'Agency / portfolio enquiry', exact: true }))
      await page.waitForFunction(() => document.querySelector('[data-estimate-announcement]').textContent === 'Your portfolio will be quoted individually.')
      await r.go('price')
      assert.match(await form.locator('[data-estimate]').innerText(), /quoted individually/)
      assert.equal(await form.locator('input[name="areaBand"]').count(), 0)
      report.estimates.push({ width, noArea: true, known: true, unknown: true, bulk: true, stableLiveRegion: true, firstAnnouncement: announcements[0], visibleWithoutUpwardScroll: true })
      console.log(`PASS ${width}: inline estimate states, visible result, stable/non-noisy live region`)
    }

    await page.setViewportSize({ width: 1440, height: 900 })
    const initialEntry = async route => {
      await page.goto(base + route, { waitUntil: 'networkidle' })
      // a quote button opens the pop-up; its link is the /quote page, where history and refresh apply
      if (route !== '/') await page.goto(base + await page.locator('main a[href^="/quote"]').first().getAttribute('href'), { waitUntil: 'networkidle' })
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
      // Any client-side link will do; the desktop footer lost its /pricing link on 16/09 (86869dd).
      // The header slides away mid-page since 15/10 (OmniRated nav); at the top it is a plain bar.
      await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(500)
      await page.locator('a[href="/pricing"]:visible').first().click()
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
      // Hydration can briefly re-render the browser-restored choice before history restores it.
      await page.waitForLoadState('networkidle')
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
    await choose('Not sure of floor area'); await choose('Flat')
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
      const links = await page.locator('main a[href^="/quote"]').evaluateAll(anchors => anchors.map(a => ({ href: a.getAttribute('href'), label: a.textContent.trim() })))
      if (source === 'preparation' && links.length === 0) {
        // the prep page rebuild (54d75fd) is for booked customers and has no quote buttons; flagged, not asserted
        console.log('NOTE /preparing-for-your-epc has no quote links since 54d75fd, so its attribution check has nothing to check')
        report.attribution.push({ route, source, ctas: [], note: 'no quote links since 54d75fd' })
        continue
      }
      const ctas = []
      for (const link of links) {
        const url = new URL(link.href, base)
        assert.equal(url.searchParams.get('source'), source)
        // /pricing's price grid opens the quote with its service and size (1800e8b, 24/10/2026): cta=pricing plus area
        assert.ok(['hero','bottom','inline','pricing'].includes(url.searchParams.get('cta')))
        assert.equal(url.pathname, '/quote')
        assert.ok([...url.searchParams.keys()].every(key => ['source','cta','service','area'].includes(key)))
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
