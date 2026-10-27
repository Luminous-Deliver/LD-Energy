// Inner-page motion, Considered (projects/ld-energy-redesign-2026-10/research/motion-proposal-2026-10-24.md §5, built
// 24/10/2026): section reveals on /landlords, the FAQ open, the On this page bar list, the quote dialog's exit and the
// touch hover guard. Tests the behaviour, not that a class exists, at 1440 and 390. Run against a local production server:
//   BOOKING_TEST_URL=http://localhost:3274 node --require ./tests/register.cjs tests/inner-motion.cjs
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const base = process.env.BOOKING_TEST_URL || 'http://localhost:3274'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')

const SAMPLE = '/landlords'
const AREA = '/areas/newham'
const widths = [1440, 390]
const vp = (w) => ({ width: w, height: w > 800 ? 900 : 844 })

;(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  let checks = 0
  const ok = (value, message) => { assert.ok(value, message); checks++ }
  const context = async (w, extra = {}) => {
    const ctx = await browser.newContext({ viewport: vp(w), ...extra })
    await ctx.addInitScript(() => { if (window.top === window) localStorage.setItem('cookie-consent', 'declined') })
    return ctx
  }
  const motionOn = (page) => page.waitForFunction(() => document.documentElement.getAttribute('data-motion') === 'on')
  const settle = (page) => page.waitForFunction(() => new Promise((res) => {
    let last = scrollY, still = 0
    const tick = () => { if (scrollY === last) { if (++still > 12) return res(true) } else { still = 0; last = scrollY } requestAnimationFrame(tick) }
    tick()
  }), null, { timeout: 15000 })
  // every [data-reveal] block, or list child, that is on screen or above it, and is not fully shown
  const hiddenInView = (page) => page.evaluate(() => {
    const els = [...document.querySelectorAll('[data-reveal]')].flatMap((el) => el.getAttribute('data-reveal') === 'list' ? [...el.children] : [el])
    return els.filter((el) => el.getBoundingClientRect().top < innerHeight && (getComputedStyle(el).opacity !== '1' || getComputedStyle(el).transform !== 'none'))
      .map((el) => el.className || el.tagName)
  })

  try {
    for (const w of widths) {
      // ------------------------------------------------ 1. above the fold is never hidden, on no frame
      for (const url of [SAMPLE, AREA]) {
        const ctx = await context(w)
        await ctx.addInitScript(() => {
          window.__dim = []
          const hero = '.in-hd h1, .in-hd .in-hd__answer, .in-hd .in-tb, .in-hd .in-crumbs, .in-hd .in-otp, .in-hh h1'
          const watch = () => {
            for (const el of document.querySelectorAll(`${hero}, [data-reveal], [data-reveal="list"] > *`)) {
              const r = el.getBoundingClientRect()
              if (r.top >= innerHeight || r.bottom <= 0) continue
              const cs = getComputedStyle(el)
              if (cs.opacity !== '1' || cs.transform !== 'none') window.__dim.push(`${el.tagName}.${el.className} ${cs.opacity} ${cs.transform}`)
            }
            if (performance.now() < 4000) requestAnimationFrame(watch)
          }
          requestAnimationFrame(watch)
        })
        const page = await ctx.newPage()
        await page.goto(base + url, { waitUntil: 'networkidle' })
        if (url === SAMPLE) await motionOn(page)
        await page.waitForFunction(() => performance.now() > 4000)
        const dim = await page.evaluate(() => window.__dim)
        ok(dim.length === 0, `${w} ${url}: nothing on screen at load is dimmed or moved on any frame (${dim.slice(0, 3)})`)
        const heroCount = await page.locator('.in-hd h1, .in-hd .in-tb').count()
        ok(heroCount === 2, `${w} ${url}: the hero H1 and title block were watched (${heroCount})`)
        if (url === SAMPLE) {
          const below = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter((el) => el.getBoundingClientRect().top > innerHeight * 1.2 && getComputedStyle(el.getAttribute('data-reveal') === 'list' ? el.firstElementChild : el).opacity === '0').length)
          ok(below > 5, `${w}: blocks below the fold do wait to be revealed (${below})`)
          ok(await page.evaluate(() => !document.querySelector('.in-hd [data-reveal], .in-hd[data-reveal]')), `${w}: the hero carries no data-reveal`)
        }
        await ctx.close()
      }

      // ------------------------------------------------ 2. a reveal plays once; 3. the stagger is capped at 4 steps
      {
        const ctx = await context(w)
        const page = await ctx.newPage()
        await page.goto(base + SAMPLE, { waitUntil: 'networkidle' })
        await motionOn(page)
        const samples = await page.evaluate(() => new Promise((resolve) => {
          const el = document.querySelector('#portfolio-h')
          const read = () => { const cs = getComputedStyle(el); return { o: +cs.opacity, y: cs.transform === 'none' ? 0 : new DOMMatrix(cs.transform).m42, t: performance.now() } }
          const out = []
          new MutationObserver((_, mo) => {
            if (el.getAttribute('data-revealed') !== 'in') return
            mo.disconnect()
            const t0 = performance.now()
            const at = (ms) => new Promise((r) => { const step = () => (performance.now() - t0 >= ms ? r(read()) : requestAnimationFrame(step)); step() })
            ;(async () => { for (const ms of [0, 120, 560]) out.push(await at(ms)); resolve({ out, anims: el.getAnimations().length }) })()
          }).observe(el, { attributes: true })
          scrollTo(0, scrollY + el.getBoundingClientRect().top - innerHeight * 0.6)
        }))
        const [a, b, c] = samples.out
        ok(a.o < b.o && b.o < c.o, `${w}: opacity rises (${a.o.toFixed(2)}, ${b.o.toFixed(2)}, ${c.o})`)
        ok(a.y > b.y && b.y > c.y - 0.001 && a.y <= 12, `${w}: it rises from 12 px or less (${a.y.toFixed(1)}, ${b.y.toFixed(1)}, ${c.y})`)
        ok(c.o === 1 && c.y === 0 && samples.anims === 0, `${w}: ends at opacity 1, no transform, no animation left`)
        await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(200)
        await page.evaluate(() => { const el = document.querySelector('#portfolio-h'); scrollTo(0, scrollY + el.getBoundingClientRect().top - innerHeight * 0.5) })
        await page.waitForTimeout(80)
        const again = await page.evaluate(() => { const el = document.querySelector('#portfolio-h'); return { anims: el.getAnimations().length, o: getComputedStyle(el).opacity } })
        ok(again.anims === 0 && again.o === '1', `${w}: scrolled away and back, it does not play again`)

        // a fifth card, added before the list is seen, to prove the cap
        await page.evaluate(() => { const ul = document.querySelector('.in-ncards'); ul.appendChild(ul.lastElementChild.cloneNode(true)) })
        await page.evaluate(() => { const ul = document.querySelector('.in-ncards'); scrollTo(0, scrollY + ul.getBoundingClientRect().top - innerHeight * 0.6) })
        await page.waitForFunction(() => document.querySelector('.in-ncards')?.getAttribute('data-revealed') === 'in')
        const delays = await page.evaluate(() => [...document.querySelectorAll('.in-ncards > li')].map((li) => getComputedStyle(li).animationDelay))
        ok(JSON.stringify(delays) === JSON.stringify(['0s', '0.06s', '0.12s', '0.18s', '0.18s']), `${w}: Read next starts 0, 60, 120, 180, 180 ms (${delays})`)
        await ctx.close()
      }

      // ------------------------------------------------ 4. reduced motion: nothing hidden, every change in one frame
      {
        const ctx = await context(w, { reducedMotion: 'reduce' })
        const page = await ctx.newPage()
        await page.goto(base + SAMPLE, { waitUntil: 'networkidle' })
        await page.waitForTimeout(300)
        ok(!(await page.evaluate(() => document.documentElement.hasAttribute('data-motion'))), `${w} reduced: html has no data-motion`)
        const hiddenAll = await page.evaluate(() => [...document.querySelectorAll('[data-reveal], [data-reveal="list"] > *')].filter((el) => getComputedStyle(el).opacity !== '1').length)
        ok(hiddenAll === 0, `${w} reduced: every [data-reveal] block shows at load (${hiddenAll} hidden)`)
        // FAQ: the answer is at full height and opacity in the frame it opens
        const faq = await page.evaluate(() => {
          const d = document.querySelectorAll('.in-faq details')[1]
          d.scrollIntoView({ block: 'center' })
          d.querySelector('summary').click()
          const a = d.querySelector('.in-faq__a')
          return { open: d.open, h: a.getBoundingClientRect().height, o: getComputedStyle(a).opacity, box: d.getBoundingClientRect().height - d.querySelector('summary').getBoundingClientRect().height }
        })
        ok(faq.open && faq.o === '1' && faq.box >= faq.h - 1 && faq.h > 20, `${w} reduced: the FAQ opens in one frame (${JSON.stringify(faq)})`)
        // the bar list
        await page.evaluate(() => scrollTo(0, document.querySelector('#visit').offsetTop))
        await page.waitForFunction(() => document.querySelector('.in-secbar')?.getAttribute('data-on') === 'true')
        const bar = await page.evaluate(() => {
          document.querySelector('.in-secbar__btn').click()
          return new Promise((r) => requestAnimationFrame(() => { const l = document.querySelector('.in-secbar__list'); const cs = getComputedStyle(l); r({ hidden: l.hidden, o: cs.opacity, t: cs.transform, d: cs.display }) }))
        })
        ok(!bar.hidden && bar.o === '1' && bar.t === 'none' && bar.d !== 'none', `${w} reduced: the bar list opens in one frame (${JSON.stringify(bar)})`)
        await page.evaluate(() => document.querySelector('.in-secbar__btn').click())
        // the dialog closes in the same task as the click
        await page.evaluate(() => scrollTo(0, 0))
        await page.locator('.in-hd .in-hd__acts a.ld-btn--primary').click()
        await page.waitForFunction(() => document.querySelector('dialog.qd')?.open)
        const shut = await page.evaluate(() => { document.querySelector('.qd__x').click(); return document.querySelector('dialog.qd').open })
        ok(shut === false, `${w} reduced: the dialog closes at once`)
        await ctx.close()
      }

      // ------------------------------------------------ 5. no JavaScript: every section is there
      {
        const ctx = await context(w, { javaScriptEnabled: false })
        const page = await ctx.newPage()
        await page.goto(base + SAMPLE, { waitUntil: 'load' })
        const total = await page.locator('[data-reveal]').count()
        const hidden = await page.evaluate(() => [...document.querySelectorAll('[data-reveal], [data-reveal="list"] > *')].filter((el) => getComputedStyle(el).opacity !== '1').length)
        ok(total >= 15 && hidden === 0, `${w} no JS: all ${total} marked blocks show (${hidden} hidden)`)
        await ctx.close()
      }

      // ------------------------------------------------ 6. jumps never land beside hidden sections
      {
        const ctx = await context(w)
        const page = await ctx.newPage()
        await page.goto(base + SAMPLE + '#book', { waitUntil: 'networkidle' })
        await motionOn(page); await settle(page)
        let bad = await hiddenInView(page)
        ok(bad.length === 0, `${w}: loaded at #book, everything on screen and above shows (${bad})`)
        ok(await page.evaluate(() => scrollY > innerHeight * 2), `${w}: the load did land at #book`)
        await page.goto(base + SAMPLE, { waitUntil: 'networkidle' })
        await motionOn(page)
        await page.locator('.in-otp a', { hasText: 'Landlord questions' }).click()
        await settle(page)
        bad = await hiddenInView(page)
        ok(bad.length === 0, `${w}: after an On this page jump, the target and everything above it shows (${bad})`)
        ok(await page.evaluate(() => Math.abs(document.querySelector('#questions-h').getBoundingClientRect().top) < innerHeight / 2), `${w}: the jump landed on Landlord questions`)
        await ctx.close()
      }

      // ------------------------------------------------ 7. the FAQ opens with height, then closes
      {
        const ctx = await context(w)
        const page = await ctx.newPage()
        await page.goto(base + SAMPLE, { waitUntil: 'networkidle' })
        await page.evaluate(() => document.querySelectorAll('.in-faq details')[2].scrollIntoView({ block: 'center' }))
        await page.waitForTimeout(700)
        const r = await page.evaluate(() => new Promise((resolve) => {
          const d = document.querySelectorAll('.in-faq details')[2]
          const s = d.querySelector('summary')
          const h = () => d.getBoundingClientRect().height - s.getBoundingClientRect().height - 1
          const out = {}
          s.click()
          const t0 = performance.now()
          const step = () => {
            const t = performance.now() - t0
            if (out.h100 === undefined && t >= 100) { out.h100 = h(); out.o100 = +getComputedStyle(d.querySelector('.in-faq__a')).opacity }
            if (out.h260 === undefined && t >= 260) out.h260 = h()
            if (t >= 700) { out.final = h(); return resolve(out) }
            requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }))
        ok(r.h100 > 0 && r.h100 < r.final - 2, `${w}: at 100 ms the answer is part open (${r.h100.toFixed(0)} of ${r.final.toFixed(0)} px)`)
        ok(Math.abs(r.h260 - r.final) < 1, `${w}: open in full by 260 ms (${r.h260.toFixed(0)})`)
        ok(r.o100 > 0 && r.o100 < 1, `${w}: the answer's text is fading in at 100 ms (${r.o100.toFixed(2)})`)
        const closed = await page.evaluate(() => new Promise((resolve) => {
          const d = document.querySelectorAll('.in-faq details')[2]
          d.querySelector('summary').click()
          setTimeout(() => resolve({ open: d.open, h: d.getBoundingClientRect().height - d.querySelector('summary').getBoundingClientRect().height }), 260)
        }))
        ok(!closed.open && closed.h < 2, `${w}: it closes within 260 ms (${closed.h.toFixed(0)} px left)`)
        await ctx.close()
      }

      // ------------------------------------------------ 8. the dialog leaves before it closes; focus goes back
      {
        const ctx = await context(w)
        const page = await ctx.newPage()
        await page.goto(base + SAMPLE, { waitUntil: 'networkidle' })
        const trigger = page.locator('.in-hd .in-hd__acts a.ld-btn--primary')
        for (const how of ['button', 'backdrop']) {
          // the backdrop is the dialog's own box outside its sheet; phones have none (full-screen sheet)
          if (how === 'backdrop' && w < 800) continue
          await trigger.click()
          await page.waitForFunction(() => document.querySelector('dialog.qd')?.open)
          await page.waitForTimeout(450)
          const r = await page.evaluate((how) => new Promise((resolve) => {
            const d = document.querySelector('dialog.qd')
            if (how === 'button') d.querySelector('.qd__x').click()
            else { d.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); d.click() }
            const t0 = performance.now()
            const out = {}
            const step = () => {
              const t = performance.now() - t0
              if (out.at90 === undefined && t >= 90) { out.at90 = d.open; out.o90 = +getComputedStyle(d).opacity }
              if (t >= 250) { out.at250 = d.open; out.focus = !!document.activeElement?.closest('.in-hd__acts'); out.locked = document.documentElement.classList.contains('qd-locked'); return resolve(out) }
              requestAnimationFrame(step)
            }
            requestAnimationFrame(step)
          }), how)
          ok(r.at90 === true && r.o90 < 1, `${w} ${how}: still open and fading at 90 ms (opacity ${r.o90.toFixed(2)})`)
          ok(r.at250 === false && !r.locked, `${w} ${how}: closed and unlocked by 250 ms`)
          ok(r.focus, `${w} ${how}: focus is back on the trigger`)
        }
        // Escape closes at once (keyboard: the next keystroke must reach the page, which a modal keeps inert until close)
        await trigger.click()
        await page.waitForFunction(() => document.querySelector('dialog.qd')?.open)
        await page.waitForTimeout(450)
        await page.keyboard.press('Escape')
        const esc = await page.evaluate(() => ({ open: document.querySelector('dialog.qd').open, focus: !!document.activeElement?.closest('.in-hd__acts') }))
        ok(!esc.open && esc.focus, `${w} Escape: closes at once and focus is back on the trigger (${JSON.stringify(esc)})`)
        // opening again starts clean: no leftover exit state
        await trigger.click()
        await page.waitForFunction(() => document.querySelector('dialog.qd')?.open)
        await page.waitForTimeout(450)
        ok(await page.evaluate(() => !document.querySelector('dialog.qd').hasAttribute('data-closing') && getComputedStyle(document.querySelector('dialog.qd')).opacity === '1'), `${w}: reopened, the dialog is fully shown`)
        await ctx.close()
      }

      // ------------------------------------------------ 9. no layout shift from motion across a full scroll
      {
        const ctx = await context(w)
        await ctx.addInitScript(() => {
          window.__shifts = []
          new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__shifts.push({ v: e.value, t: e.startTime, src: (e.sources || []).map((s) => s.node?.className || s.node?.nodeName || '?').join(' | ') }) }).observe({ type: 'layout-shift', buffered: true })
        })
        const page = await ctx.newPage()
        await page.goto(base + SAMPLE, { waitUntil: 'networkidle' })
        await motionOn(page)
        const loadShift = await page.evaluate(() => window.__shifts.length)
        const h = await page.evaluate(() => document.documentElement.scrollHeight)
        for (let y = 0; y < h; y += 300) { await page.evaluate((v) => scrollTo(0, v), y); await page.waitForTimeout(60) }
        await page.waitForTimeout(700)
        const shifts = await page.evaluate((n) => window.__shifts.slice(n), loadShift)
        // the On this page bar's button is as wide as the section name it shows, so it resizes as the name changes: a
        // shift of the fixed bar itself, older than this motion (redesign 6df47de) and not caused by it
        const own = shifts.filter((e) => e.src !== 'in-secbar__btn')
        const sum = own.reduce((s, e) => s + e.v, 0)
        ok(sum === 0, `${w}: layout shift across the scroll is 0, bar label aside (${sum.toFixed(4)} ${JSON.stringify(own.slice(0, 3))})`)
        const fromReveal = await page.evaluate(() => window.__shifts.filter((e) => /lp-|in-h2|in-eyebrow|in-faq|in-ncards|op__in|in-end-a__in/.test(e.src)).length)
        ok(fromReveal === 0, `${w}: no shift at any time names a revealed block`)
        await ctx.close()
      }

      // ------------------------------------------------ 10. a tap leaves no hover state behind
      {
        const ctx = await context(w, { hasTouch: true, isMobile: w < 800 })
        const page = await ctx.newPage()
        await page.goto(base + SAMPLE, { waitUntil: 'networkidle' })
        ok(await page.evaluate(() => !matchMedia('(hover: hover) and (pointer: fine)').matches), `${w} touch: the page sees a touch pointer`)
        // keep the page: the tap should land, not navigate or open the dialog
        await page.evaluate(() => window.addEventListener('click', (e) => { if (e.target.closest('a')) { e.preventDefault(); e.stopImmediatePropagation() } }, true))
        const row = page.locator('.in-tb__rows li:first-child a')
        await row.scrollIntoViewIfNeeded(); await row.tap(); await page.waitForTimeout(300)
        const rowState = await row.evaluate((a) => ({ bg: getComputedStyle(a).backgroundColor, t: getComputedStyle(a.querySelector('.i, svg')).transform }))
        // transparent: alpha 0 (the colour channels can still read the band's on the fade's last frame)
        const alpha = (c) => (c.startsWith('rgba') ? +c.slice(5, -1).split(',')[3] : 1)
        ok(alpha(rowState.bg) === 0 && rowState.t === 'none', `${w} touch: a tapped price row is not left lit or nudged (${JSON.stringify(rowState)})`)
        const card = page.locator('.in-ncards li:first-child .in-ncard')
        await card.scrollIntoViewIfNeeded(); await page.waitForTimeout(700); await card.tap(); await page.waitForTimeout(500)
        const cardState = await card.evaluate((a) => ({ b: getComputedStyle(a).borderTopColor, img: getComputedStyle(a.querySelector('img')).transform, l: getComputedStyle(a.querySelector('.in-ncard__l svg, .in-ncard__l .i')).transform }))
        ok(cardState.b === 'rgba(51, 56, 79, 0.42)' && cardState.img === 'none' && cardState.l === 'none', `${w} touch: a tapped Read next card is not left in its hover state (${JSON.stringify(cardState)})`)
        await ctx.close()
        // the control: a mouse still gets the hover
        const mctx = await context(w)
        const mpage = await mctx.newPage()
        await mpage.goto(base + SAMPLE, { waitUntil: 'networkidle' })
        const mrow = mpage.locator('.in-tb__rows li:first-child a')
        await mrow.scrollIntoViewIfNeeded(); await mrow.hover(); await mpage.waitForTimeout(300)
        const hov = await mrow.evaluate((a) => ({ bg: getComputedStyle(a).backgroundColor, t: getComputedStyle(a.querySelector('.i, svg')).transform }))
        ok(hov.bg !== 'rgba(0, 0, 0, 0)' && /matrix\(1, 0, 0, 1, 3, 0\)/.test(hov.t), `${w} mouse: hover still lights the row and nudges the chevron 3 px (${JSON.stringify(hov)})`)
        await mctx.close()
      }
    }
    console.log(`PASS inner motion: ${checks} checks (above the fold never hidden, reveal once, 4-step stagger cap, reduced motion, no JS, jumps, FAQ open and close, dialog exit, no layout shift, touch hover guard; 1440 and 390)`)
  } finally {
    await browser.close()
  }
})().catch((err) => { console.error(err); process.exitCode = 1 })
