// /faq, redesigned 24/10/2026: every question, group, answer and link from lib/faq.ts on the page and in the FAQPage
// schema, in the same order; the group anchors; the question ids the prep page shares; the quote links; the promise
// under the pricing questions; no new em dashes; no sideways scroll.
// (parity: projects/ld-energy-redesign-2026-10/research/faq-parity-2026-10-24.md)
//
//   node --require ./tests/register.cjs tests/faq-page.cjs
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const { fullFaq, ratingQuestions } = require('../lib/faq.ts')
const { site } = require('../lib/site.ts')
const base = process.env.BOOKING_TEST_URL || 'http://localhost:3100'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only')

const items = fullFaq.flatMap((c) => c.items)
const norm = (s) => s.replace(/\s+/g, ' ').trim()

;(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  let checks = 0
  const ok = (value, message) => { assert.ok(value, message); checks++ }
  const eq = (actual, expected, message) => { assert.deepEqual(actual, expected, message); checks++ }
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await page.addInitScript(() => { if (window.top === window) localStorage.setItem('cookie-consent', 'declined') })
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e)))
    await page.goto(`${base}/faq`, { waitUntil: 'networkidle' })
    eq(await page.locator('h1').innerText(), 'EPC questions, answered', 'H1, sentence case')
    eq(await page.title(), 'EPC FAQ | Common Questions in London | L&D Energy', 'title unchanged (frozen until 14/12)')

    // Groups: every lib/faq.ts group, in order, with its id kept
    const groups = await page.locator('main section[id] h2.in-h2').evaluateAll((hs) => hs.map((h) => ({ id: h.closest('section').id, text: h.textContent })))
    eq(groups.slice(0, fullFaq.length).map((g) => g.id), fullFaq.map((c) => c.id), 'group ids, in lib order')
    for (const [i, c] of fullFaq.entries()) eq(groups[i].text.toLowerCase(), c.title.toLowerCase(), `group ${c.id}: heading is the lib title`)
    for (const c of fullFaq) eq(await page.locator(`#${c.id} details`).count(), c.items.length, `group ${c.id}: ${c.items.length} questions`)
    ok(await page.locator('#more-questions').count() === 1 && await page.locator('#book').count() === 1, '#more-questions and #book exist')
    eq(await page.locator('.in-otp a').evaluateAll((as) => as.map((a) => a.getAttribute('href'))), [...fullFaq.map((c) => `#${c.id}`), '#more-questions'], 'On this page lists every group')

    // Questions, answers and links: verbatim from lib/faq.ts, in order
    const shown = await page.locator('main .in-faq details').evaluateAll((ds) => ds.map((d) => ({
      id: d.id, q: d.querySelector('summary').textContent, a: d.querySelector('.in-faq__a > p').textContent,
      links: [...d.querySelectorAll('.fq-links a')].map((a) => ({ href: a.getAttribute('href'), label: a.textContent.trim(), blank: a.target === '_blank' })),
    })))
    eq(shown.length, items.length, `${items.length} questions on the page`)
    for (const [i, it] of items.entries()) {
      eq(norm(shown[i].q), norm(it.q), `question ${i + 1}`)
      eq(shown[i].a, it.a, `answer ${i + 1} verbatim`)
      eq(shown[i].links.map((l) => [l.href, l.label, l.blank]), (it.links || []).map((l) => [l.href, l.label, !!l.external]), `answer ${i + 1}: every link`)
    }
    for (const r of ratingQuestions) eq(shown.find((s) => s.id === r.id)?.q && norm(shown.find((s) => s.id === r.id).q), norm(r.q), `rating question #${r.id} carries its id`)
    eq(await page.locator('main .in-faq details[open]').count(), 1, 'first question open, the rest closed')

    // Opening a question shows its answer
    const second = page.locator('main .in-faq details').nth(1)
    ok(!(await second.locator('.in-faq__a').isVisible()), 'second answer hidden before a tap')
    await second.locator('summary').click()
    ok(await second.locator('.in-faq__a').isVisible(), 'tapping a question opens it')

    // Schema: FAQPage = the visible questions and answers, in order
    const blocks = await page.evaluate(() => [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => [JSON.parse(s.textContent)].flat()))
    const faq = blocks.find((b) => b['@type'] === 'FAQPage')
    ok(faq && blocks.some((b) => b['@type'] === 'BreadcrumbList'), `schema ${blocks.map((b) => b['@type'])}`)
    eq(faq.mainEntity.map((e) => [norm(e.name), e.acceptedAnswer.text]), shown.map((s) => [norm(s.q), s.a]), 'FAQPage matches the visible questions')

    // Our promise sits straight under the pricing questions
    ok(await page.evaluate(() => document.querySelector('#pricing').nextElementSibling?.classList.contains('op')), 'our promise under the pricing questions')

    // Quote links: attribution, and no "book" in a quote label (tests/review-layout.cjs rule)
    const quotes = await page.locator('main a[href*="/quote"]').evaluateAll((as) => as.map((a) => ({ href: a.getAttribute('href'), label: a.textContent.trim() })))
    ok(quotes.some((x) => x.href === '/quote?service=epc&source=faq&cta=hero'), 'hero quote link')
    ok(quotes.some((x) => x.href === '/quote?service=epc&source=faq&cta=bottom'), 'ending quote link')
    for (const x of quotes) ok(!/\bbook(?:ing)?\b/i.test(x.label), `no "book" in "${x.label}"`)
    ok(await page.locator(`main a[href="${site.phoneHref}"]`).count() >= 1 && await page.locator(`main a[href="${site.emailHref}"]`).count() === 1, 'phone and email in Still have a question')

    // No em dashes in the page's own copy. lib/faq.ts answers still carry five; they are flagged, not rewritten here,
    // because the answers are shared with the schema and the homepage.
    const own = await page.evaluate(() => { const m = document.querySelector('main').cloneNode(true); m.querySelectorAll('.in-faq__a > p, script').forEach((p) => p.remove()); return m.textContent })
    ok(!own.includes('—'), 'no em dashes in the page copy')
    // lib/faq.ts answers rewritten without em dashes (24/10, lead session)
    ok(!shown.some((s) => s.a.includes('—')), 'no em dashes in any answer')

    // On this page jumps to a group
    await page.locator('.in-otp a[href="#your-rating"]').click()
    await page.waitForTimeout(2000)  // a smooth scroll over most of the page
    const top = await page.locator('#your-rating-h').evaluate((h) => h.getBoundingClientRect().top)
    ok(top > 0 && top < 300, `On this page lands on the group (heading at ${Math.round(top)} px)`)

    eq(errors, [], 'no page errors')
    ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, 'no sideways scroll at 1440')

    // The hero quote opens the quote dialog over the page
    await page.goto(`${base}/faq`, { waitUntil: 'networkidle' })
    await page.locator('a[data-enquiry-cta="hero"]').click()
    await page.locator('dialog[open]').waitFor()
    ok(await page.locator('dialog[open] #qd-title').isVisible(), 'hero quote opens the quote dialog')
    await page.close()
    console.log('ok 1440px')

    const phone = await browser.newPage({ viewport: { width: 360, height: 800 } })
    await phone.addInitScript(() => { if (window.top === window) localStorage.setItem('cookie-consent', 'declined') })
    await phone.goto(`${base}/faq`, { waitUntil: 'networkidle' })
    ok(await phone.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, 'no sideways scroll at 360')
    const small = await phone.locator('main .in-faq summary, .fq-links a, .fq-ways a').evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().height > 0 && e.getBoundingClientRect().height < 44).length)
    eq(small, 0, 'tap targets at least 44 px')
    await phone.close()
    console.log(`ok 360px · ${checks} checks`)
  } finally { await browser.close() }
})().catch((error) => { console.error(error); process.exit(1) })
