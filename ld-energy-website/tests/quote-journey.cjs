// The quote journey (Abdul's brief, 23/10/2026): /quote is the reliable page, the dialog an optional shortcut over any
// page, /contact routes prices to the quote and questions to its own form, and area pages keep one form at #contact
// (decisions/log.md 23/10/2026 late, "Correction: the area-page form stays", and that evening's "Pop-up rule").
// Also saves the review screenshots when QUOTE_SHOTS is set. Run against a local server:
//   BOOKING_TEST_URL=http://localhost:3220 node --require ./tests/register.cjs tests/quote-journey.cjs
const assert = require('node:assert/strict')
const path = require('node:path')
const { chromium } = require('playwright')

const base = process.env.BOOKING_TEST_URL || 'http://localhost:3220'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')
const shots = process.env.QUOTE_SHOTS || ''
const executablePath = process.env.PLAYWRIGHT_MCP_EXECUTABLE_PATH || undefined

;(async () => {
  let passed = 0
  const ok = (cond, msg) => { assert.ok(cond, msg); passed++ }
  const browser = await chromium.launch(executablePath ? { executablePath, headless: true } : { channel: 'msedge', headless: true })
  const shot = async (page, name, fullPage = false) => { if (shots) await page.screenshot({ path: path.join(shots, `${name}.png`), fullPage }) }
  const noSideways = (page) => page.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 0)
  try {
    for (const [w, h] of [[1440, 900], [390, 844]]) {
      const page = await browser.newPage({ viewport: { width: w, height: h } })
      const errors = []
      page.on('pageerror', (e) => errors.push(e.message))
      const events = []
      await page.exposeFunction('__ev', (name) => events.push(name))
      await page.addInitScript(() => window.addEventListener('ld-energy:conversion', (e) => window.__ev(e.detail.name)))

      // ------------------------------------------------ an area page: one v7 form at #contact (23/10 late correction);
      // buttons at the top or always on screen open the pop-up, only the buttons beside the form jump to it (23/10 Pop-up rule)
      await page.goto(base + '/areas/newham', { waitUntil: 'networkidle' })
      ok(await page.locator('main form').count() === 1 && await page.locator('#contact form[aria-label="Exact quote enquiry"]').count() === 1, `${w}: /areas/newham has one booking form, at #contact`)
      ok(await page.locator('#contact').count() === 1 && await page.locator('#contact').evaluate((s) => s.classList.contains('in-contact')), `${w}: #contact is the form's section`)
      ok(await page.locator('main .in-ncard--go').getAttribute('href') === '#contact', `${w}: the Read next quote card jumps to the form`)
      ok(await page.locator('main .in-end-a a.ld-btn').first().getAttribute('href') === '#contact', `${w}: the closing band jumps to the form`)
      // besides those two, only the On this page list may name #contact
      ok(await page.locator('main a[href="#contact"]').evaluateAll((as) => as.every((a) => a.closest('nav, .in-otp, .in-secbar, .in-ncard--go, .in-end-a'))), `${w}: no other button points at #contact`)
      ok(await page.locator('main .in-hd a.ld-btn, main .in-hd .in-tb__rows a').evaluateAll((as) => as.length >= 9 && as.every((a) => a.getAttribute('href').startsWith('/quote'))), `${w}: the hero's button and price rows go to the quote pop-up`)
      ok(await page.locator('header .sh__quote, [data-dock] a.ld-btn--primary, #mobile-nav-panel a.ld-btn--primary').evaluateAll((as) => as.length >= 3 && as.every((a) => a.getAttribute('href').startsWith('/quote'))), `${w}: header, phone menu and dock go to the quote pop-up`)
      ok(await noSideways(page), `${w}: area page, no sideways scroll`)
      if (w === 1440) {
        const hero = page.locator('.in-hd .in-hd__acts a.ld-btn--primary')
        ok((await hero.getAttribute('href')) === '/quote?service=epc&source=area&cta=hero&page=newham', `area hero CTA href (${await hero.getAttribute('href')})`)
      }
      await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
      await page.waitForTimeout(400)
      await shot(page, `area-bottom-${w}`)

      // the closing band's button scrolls to the form on the page and opens no pop-up
      await page.locator('main .in-end-a a.ld-btn').first().click()
      await page.waitForFunction(() => location.hash === '#contact')
      await page.waitForTimeout(400)
      ok(!(await page.evaluate(() => document.querySelector('dialog.qd')?.open)) && await page.locator('#contact form').isVisible(), `${w}: the closing band scrolls to the form, no pop-up`)

      const trigger = page.locator('.in-hd .in-hd__acts a.ld-btn--primary')
      await trigger.scrollIntoViewIfNeeded()
      await trigger.click()
      const dialog = page.locator('dialog.qd')
      await page.waitForFunction(() => document.querySelector('dialog.qd')?.open)
      ok(new URL(page.url()).pathname === '/areas/newham', `${w}: the click stayed on the page (dialog, not navigation)`)
      await dialog.locator('form[aria-label="Exact quote enquiry"]').waitFor({ timeout: 15000 })
      // phones draw the form as a rail, one question open at a time (d72a832, 23/10/2026): the service shows once "you" is answered
      if (w === 390) { await dialog.getByRole('radio', { name: 'Homeowner' }).check(); await dialog.locator('.bf-st.is-open input[name="services"]').first().waitFor() }
      ok(await dialog.locator('input[name="services"][value="EPC Certificate"]').isChecked(), `${w}: dialog form starts on the EPC`)
      ok(await page.evaluate(() => document.documentElement.classList.contains('qd-locked')), `${w}: page scroll locked while open`)
      ok(events.includes('quote_dialog_open'), `${w}: quote_dialog_open fired`)
      const ids = await page.evaluate(() => { const all = [...document.querySelectorAll('[id]')].map((e) => e.id); return all.filter((id, i) => all.indexOf(id) !== i) })
      ok(ids.length === 0, `${w}: no duplicate ids with the dialog open (${ids})`)
      if (w === 390) {
        const box = await dialog.boundingBox()
        ok(Math.round(box.width) === 390 && Math.round(box.height) === 844, `390: the dialog is a full-screen sheet (${box.width}x${box.height})`)
      }
      await page.waitForTimeout(400)
      await shot(page, `dialog-newham-${w}`)

      await page.keyboard.press('Escape')
      await page.waitForFunction(() => !document.querySelector('dialog.qd')?.open)
      ok(!(await page.evaluate(() => document.documentElement.classList.contains('qd-locked'))), `${w}: Escape closes and unlocks the page`)
      ok(await page.evaluate(() => document.activeElement?.closest('.in-hd__acts') !== null), `${w}: focus returns to the trigger`)

      await trigger.click()
      await page.waitForFunction(() => document.querySelector('dialog.qd')?.open)
      await dialog.locator('.qd__x').click()
      await page.waitForFunction(() => !document.querySelector('dialog.qd')?.open)
      ok(true, `${w}: the × button closes the dialog`)
      if (w === 1440) {
        // backdrop click (desktop only; the phone sheet has no backdrop)
        await trigger.click()
        await page.waitForFunction(() => document.querySelector('dialog.qd')?.open)
        await page.mouse.click(10, 10)
        await page.waitForFunction(() => !document.querySelector('dialog.qd')?.open)
        ok(true, '1440: a backdrop click closes the dialog')
        // a modifier click is left alone (new tab), so the dialog stays shut
        const [popup] = await Promise.all([page.context().waitForEvent('page', { timeout: 5000 }).catch(() => null), trigger.click({ modifiers: ['Control'] })])
        ok(!(await page.evaluate(() => document.querySelector('dialog.qd').open)), '1440: Ctrl+click does not open the dialog')
        if (popup) await popup.close()
      }

      // area pages pass the area page slug into the dialog form (attribution)
      await page.goto(base + '/areas/newham', { waitUntil: 'networkidle' })
      await page.locator('.in-hd .in-hd__acts a.ld-btn--primary').click()
      await page.waitForFunction(() => document.querySelector('dialog.qd')?.open)
      await dialog.locator('form[aria-label="Exact quote enquiry"]').waitFor({ timeout: 15000 })
      // the area page is held in form state, not the DOM; the dialog's full-page fallback link carries it
      ok((await dialog.locator('.qd__page a').getAttribute('href')).includes('page=newham'), `${w}: the dialog's fallback link carries the area page`)
      await page.keyboard.press('Escape')

      // ------------------------------------------------ /quote: params pre-filled
      await page.goto(base + '/quote?service=bundle&area=55-75&speed=same-day&plan=1&source=area&cta=hero&page=newham', { waitUntil: 'networkidle' })
      await page.locator('main form[aria-label="Exact quote enquiry"]').waitFor()
      ok(await page.title() === 'EPC Quote London: Exact Price Before Booking | L&D Energy', `${w}: /quote title (${await page.title()})`)
      ok((await page.title()).length <= 60, `${w}: /quote title under 60 characters`)
      ok(await page.locator('link[rel="canonical"]').getAttribute('href') === 'https://epc.luminousanddeliver.co.uk/quote', `${w}: /quote canonical`)
      if (w === 390) {
        // phones: the rail shows one question at a time (d72a832), so each pre-filled answer is read as its question opens
        const qf = page.locator('main form[aria-label="Exact quote enquiry"]'), open = qf.locator('.bf-st.is-open')
        await qf.getByRole('radio', { name: 'Homeowner' }).check(); await open.locator('input[name="services"]').first().waitFor()
        ok(await open.locator('input[name="services"][value="Both (Bundle)"]').isChecked(), `${w}: /quote pre-fills the service`)
        await open.getByRole('button', { name: 'Continue', exact: true }).click(); await qf.getByRole('radio', { name: 'Flat', exact: true }).check()
        await open.locator('input[name="areaBand"]').first().waitFor()
        ok(await open.locator('input[name="areaBand"][value="55-75"]').isChecked(), `${w}: /quote pre-fills the size`)
        await open.locator('input[name="areaBand"][value="55-75"]').click(); await open.locator('input[name="improvementPlan"]').waitFor()
        ok(await open.locator('input[type="checkbox"][name="improvementPlan"]').isChecked(), `${w}: /quote pre-fills the plan`)
      } else {
        ok(await page.locator('main input[name="services"][value="Both (Bundle)"]').isChecked(), `${w}: /quote pre-fills the service`)
        ok(await page.locator('main input[name="areaBand"][value="55-75"]').isChecked(), `${w}: /quote pre-fills the size`)
        ok(await page.locator('main input[type="checkbox"][name="improvementPlan"]').isChecked(), `${w}: /quote pre-fills the plan`)
      }
      ok(await noSideways(page), `${w}: /quote, no sideways scroll`)
      // a quote link on /quote itself navigates instead of opening the dialog
      await shot(page, `quote-${w}`, true)

      // ------------------------------------------------ /contact
      await page.goto(base + '/contact', { waitUntil: 'networkidle' })
      ok((await page.locator('h1').innerText()) === 'How can we help?', `${w}: /contact H1`)
      ok(await page.locator('main form[aria-label="Exact quote enquiry"]').count() === 0, `${w}: no booking form on /contact`)
      ok(await page.locator('main form').count() === 1, `${w}: one form on /contact (the general enquiry)`)
      ok(await page.locator('main .ld-btn--primary').count() === 1, `${w}: one filled button on /contact`)
      ok(await noSideways(page), `${w}: /contact, no sideways scroll`)
      await shot(page, `contact-${w}`, true)
      await page.locator('#eq-type').selectOption('Quote for a property')
      ok(await page.locator('#eq-name').count() === 0, `${w}: "Quote for a property" replaces the fields`)
      const go = page.locator('.eq__route a')
      ok((await go.getAttribute('href')).startsWith('/quote'), `${w}: and offers the quote journey`)
      await go.click()
      await page.waitForFunction(() => document.querySelector('dialog.qd')?.open)
      ok(true, `${w}: which opens the quote dialog`)
      await page.keyboard.press('Escape')
      await page.locator('#eq-type').selectOption('General question')
      await page.locator('#eq-name').fill('Test Person'); await page.locator('#eq-email').fill('test@example.com')
      await page.locator('#eq-message').fill('Do you cover Epping?'); await page.locator('#eq-consent').check()
      await page.locator('.eq button[type="submit"]').click()
      await page.locator('.eq--done').waitFor()
      ok((await page.locator('.eq--done').innerText()).includes('Draft preview: nothing was sent'), `${w}: general enquiry submits (draft: nothing sent)`)

      // the primary button opens the dialog
      await page.goto(base + '/contact', { waitUntil: 'networkidle' })
      await page.locator('.cp-price__go').click()
      await page.waitForFunction(() => document.querySelector('dialog.qd')?.open)
      ok(new URL(page.url()).pathname === '/contact', `${w}: "Request a quote" opens the dialog on /contact`)
      await page.keyboard.press('Escape')

      // old quote links on /contact land on /quote with their choices
      await page.goto(base + '/contact?service=floor-plan&source=blog&cta=inline#booking-form', { waitUntil: 'networkidle' })
      ok(new URL(page.url()).pathname === '/quote' && page.url().includes('service=floor-plan'), `${w}: old /contact?service= link lands on /quote (${page.url()})`)
      await page.goto(base + '/contact#booking-form', { waitUntil: 'networkidle' })
      await page.waitForURL(/\/quote/, { timeout: 5000 })
      ok(new URL(page.url()).pathname === '/quote', `${w}: old /contact#booking-form lands on /quote`)

      // ------------------------------------------------ the homepage hero opens the dialog; the inline form stays
      await page.goto(base + '/', { waitUntil: 'networkidle' })
      await page.waitForFunction(() => !document.querySelector('.ld-intro'), null, { timeout: 4000 }).catch(() => {})
      ok(await page.locator('#prices #pricing form[aria-label="Exact quote enquiry"]').count() === 1, `${w}: homepage inline form still in Prices`)
      await page.locator('#hero-quote').click()
      await page.waitForFunction(() => document.querySelector('dialog.qd')?.open)
      await dialog.locator('form[aria-label="Exact quote enquiry"]').waitFor({ timeout: 15000 })
      ok(new URL(page.url()).pathname === '/', `${w}: the hero button opens the dialog over the homepage`)
      const dup = await page.evaluate(() => { const all = [...document.querySelectorAll('[id]')].map((e) => e.id); return all.filter((id, i) => all.indexOf(id) !== i) })
      ok(dup.length === 0, `${w}: homepage + dialog share no ids (${dup})`)
      await page.waitForTimeout(400)
      await shot(page, `dialog-home-${w}`)
      await page.keyboard.press('Escape')

      ok(errors.length === 0, `${w}: no page errors (${errors})`)
      await page.close()
    }

    // ------------------------------------------------ reduced motion: no dialog animation
    {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
      await page.goto(base + '/landlords', { waitUntil: 'networkidle' })
      await page.locator('main a[href^="/quote"]').first().click()
      await page.waitForFunction(() => document.querySelector('dialog.qd')?.open)
      ok(await page.evaluate(() => getComputedStyle(document.querySelector('dialog.qd')).animationName) === 'none', 'reduced motion: the dialog does not animate')
      await page.close()
    }

    // ------------------------------------------------ no JS: the link is the page
    {
      const ctx = await browser.newContext({ javaScriptEnabled: false })
      const page = await ctx.newPage()
      // the header's quote link (next dev streams page bodies behind loading.tsx, which only a script swaps in; a
      // production prerender serves the whole page, so on the live site the body's buttons behave the same)
      await page.goto(base + '/areas/newham')
      ok((await page.locator('header .sh__quote').getAttribute('href')).includes('page=newham'), 'no JavaScript: header quote link carries the area page')
      await page.locator('header .sh__quote').click()
      await page.waitForURL(/\/quote\?/)
      ok(new URL(page.url()).pathname === '/quote', 'no JavaScript: the quote CTA navigates to /quote')
      await ctx.close()
    }
  } finally { await browser.close() }
  console.log(`PASS quote journey: ${passed} checks (area pages: one form at #contact, top buttons open the pop-up, closing band jumps to the form; dialog open/close by Esc, × and backdrop, focus return, scroll lock, full-screen on phones, /quote pre-fill and metadata, /contact routing and enquiry form, legacy /contact links, homepage hero dialog, reduced motion, no-JS fallback)`)
})().catch((e) => { console.error(e); process.exitCode = 1 })
