// /services/epc-pre-assessment, rebuilt 24/10/2026: Pre-Assessment prices and links from lib/site, the "guidance only"
// wording (decision 24/10 night; Elmhurst 29/09/2026), lodging later at site.addOns.lodgeLater with the 3 and 18 month
// limits, no Our promise (not lodged), the content carried over. Parity:
// Abdul-2 projects/ld-energy-redesign-2026-10/research/epc-pre-assessment-parity-2026-10-24.md
const { checkServicePage, ids } = require('./service-page-checks.cjs')
const pa = [90, 100, 110, 120, 130, 145]
const q = (a) => `/quote?service=pre-assessment&area=${a}&source=pre-assessment&cta=pricing`

checkServicePage({
  route: '/services/epc-pre-assessment',
  h1: 'EPC Pre-Assessment',
  title: 'EPC Pre-Assessment London | Your Score Without Lodging It | From £90 | L&D Energy',
  ids: ['what-it-is', 'guidance-only', 'lodge-later', 'who-its-for', 'pre-assessment-faq', 'book'],
  faqId: 'pre-assessment-faq', faqCount: 5,
  schemaTypes: ['Service', 'FAQPage', 'BreadcrumbList'],
  rows: [...ids.map((a, i) => ({ text: `£${pa[i]}`, from: i === 5, href: q(a) })), { text: 'Not sure of the size', href: q('unknown') }],
  promise: null,
  extra: async (page, { ok, eq }) => {
    ok((await page.locator('.sv-tb .in-tb__head').innerText()).includes('Guidance only'), 'title block: guidance only')
    const g = (await page.locator('#guidance-only').innerText()).replace(/'/g, '’')
    for (const s of ['not an Energy Performance Certificate', 'isn’t covered by our professional insurance', 'not a retrofit assessment', 'meeting MEES as a landlord', 'cannot produce a better rating than the property earns']) ok(g.includes(s), `guidance only: ${s}`)
    const later = (await page.locator('#lodge-later').innerText()).replace(/\s+/g, ' ')
    for (const s of ['Within 3 months', '3 to 18 months', 'your letter confirming nothing about the property has changed', 'priced as a new EPC']) ok(later.includes(s), `lodge later: ${s}`)
    eq((later.match(/\+£35/g) || []).length, 2, 'lodge later at £35 (site.addOns.lodgeLater), twice')
    eq(await page.locator('#what-it-is .in-ticks li').count(), 6, 'six included items')
    eq(await page.locator('#who-its-for .sv-way').count(), 3, 'three situations')
    ok((await page.locator('#who-its-for').innerText()).includes('we will say so rather than sell you this'), 'honest steer kept')
    eq(await page.locator('#book a[data-enquiry-cta="bottom"]').getAttribute('href'), '/quote?service=pre-assessment&source=pre-assessment&cta=bottom', 'ending quote link')
    const svc = await page.evaluate(() => [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => [JSON.parse(s.textContent)].flat()).find((b) => b['@type'] === 'Service'))
    eq(svc.offers.priceSpecification.minPrice, 90, 'schema minPrice from priceFrom')
  },
}).catch((e) => { console.error(e); process.exit(1) })
