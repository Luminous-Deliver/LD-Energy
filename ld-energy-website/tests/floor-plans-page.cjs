// /services/floor-plans, rebuilt 24/10/2026: floor plan prices and links from lib/site (Abdul's 22/10 spec), the
// separately-and-together table with each band's saving, the RICS disclaimer, the content carried over. Parity:
// Abdul-2 projects/ld-energy-redesign-2026-10/research/floor-plans-parity-2026-10-24.md
const { checkServicePage, ids } = require('./service-page-checks.cjs')
const epc = [65, 75, 85, 95, 105, 120]
const fp = [65, 75, 85, 95, 105, 120]
const both = [115, 130, 145, 160, 175, 200]
const disclaimer = 'Not to exact scale. Measurements are approximate and for guidance only, following RICS guidance; floor areas are calculated in accordance with RICS Property Measurement Standards. Do not rely on them for valuation, flooring or furnishing.'
const q = (s, a) => `/quote?service=${s}&area=${a}&source=floor-plans&cta=pricing`

checkServicePage({
  route: '/services/floor-plans',
  h1: 'Professional property floor plans',
  title: 'Property Floor Plans London | From £65 | L&D Energy',
  ids: ['why-floor-plans', 'included', 'process', 'pricing', 'floor-plan-faq', 'book'],
  faqId: 'floor-plan-faq', faqCount: 5,
  schemaTypes: ['Service', 'FAQPage', 'BreadcrumbList'],
  rows: [...ids.map((a, i) => ({ text: `£${fp[i]}`, from: i === 5, href: q('floor-plan', a) })), { text: 'Not sure of the size', href: q('floor-plan', 'unknown') }],
  promise: 'pricing',
  extra: async (page, { ok, eq }) => {
    const rows = page.locator('#pricing tbody tr')
    eq(await rows.count(), 6, 'six bands in the table')
    for (const [i, a] of ids.entries()) {
      const cells = rows.nth(i).locator('td a')
      for (const [s, p] of [['epc', epc], ['floor-plan', fp], ['bundle', both]]) {
        const cell = rows.nth(i).locator(`td a[href="${q(s, a)}"]`)
        eq(await cell.count(), 1, `${s} ${a}: link`)
        const t = (await cell.innerText()).replace(/\s+/g, ' ')
        ok(t.includes(`£${p[i]}`) && /from/.test(t) === (i === 5), `${s} ${a}: £${p[i]} (${t})`)
      }
      const t = await cells.nth(2).innerText()
      const save = epc[i] + fp[i] - both[i]
      ok(i === 5 ? !/Save/.test(t) : t.includes(`Save £${save}`), `${a}: saving ${i === 5 ? 'not on the top band' : save}`)
    }
    ok((await page.locator('main').innerText()).includes('save up to £35'), 'largest saving, maxBundleSaving')
    ok((await page.locator('.sv-tb').innerText()).includes(disclaimer), 'disclaimer with the hero prices')
    ok((await page.locator('#included').innerText()).includes(disclaimer + ' Plans are not architectural drawings or legal boundaries'), 'disclaimer and limits in What\'s included')
    eq(await page.locator('#included .in-ticks li').count(), 8, 'eight included items')
    eq(await page.locator('#process .sv-steps li').count(), 4, 'four steps')
    for (const href of ['/estate-agents', '/landlords#portfolio']) eq(await page.locator(`#why-floor-plans a[href="${href}"]`).count(), 1, `why: ${href}`)
    eq(await page.locator('#book a[data-enquiry-cta="bottom"]').getAttribute('href'), '/quote?service=floor-plan&source=floor-plans&cta=bottom', 'ending quote link')
  },
}).catch((e) => { console.error(e); process.exit(1) })
