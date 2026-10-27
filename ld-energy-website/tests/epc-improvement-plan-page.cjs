// /services/epc-improvement-plan, rebuilt 24/10/2026: the flat add-on price (site.addOns.improvementPlan) beside what
// every EPC already includes, quote links with the plan ticked, the no-guarantee wording, Our promise (the plan comes
// with a lodged EPC), the content carried over. Parity:
// Abdul-2 projects/ld-energy-redesign-2026-10/research/epc-improvement-plan-parity-2026-10-24.md
const { checkServicePage } = require('./service-page-checks.cjs')
const q = (cta) => `/quote?service=epc&plan=1&source=improvement-plan&cta=${cta}`

checkServicePage({
  route: '/services/epc-improvement-plan',
  h1: 'EPC Improvement Plan',
  title: 'EPC Improvement Plan London | £35 | L&D Energy',
  ids: ['what-it-is', 'what-it-covers', 'who-its-for', 'improvement-plan-faq', 'book'],
  faqId: 'improvement-plan-faq', faqCount: 4,
  schemaTypes: ['Service', 'FAQPage', 'BreadcrumbList'],
  rows: [
    { text: 'EPC recommendation report', href: '/services/domestic-epc' },
    { text: '+£35', href: q('pricing') },
    { text: 'In an EPC Pre-Assessment', href: '/services/epc-pre-assessment' },
  ],
  promise: 'what-it-is',
  extra: async (page, { ok, eq }) => {
    eq(await page.locator('.in-hd a[data-enquiry-cta="hero"]').getAttribute('href'), q('hero'), 'hero quote link, plan ticked')
    eq(await page.locator('#book a[data-enquiry-cta="bottom"]').getAttribute('href'), q('bottom'), 'ending quote link, plan ticked')
    const what = (await page.locator('#what-it-is').innerText()).replace(/\s+/g, ' ')
    ok(what.includes('Your standard EPC already includes its software-generated recommendation report'), 'every EPC includes its recommendations')
    ok(/Every EPC Included/i.test(what) && /Improvement Plan \+£35/i.test(what), 'included vs +£35 side by side')
    eq(await page.locator('#what-it-is .sv-parts li').count(), 3, 'three parts of the plan')
    const covers = await page.locator('#what-it-covers').innerText()
    eq(await page.locator('#what-it-covers .in-ticks li').count(), 7, 'seven covered items')
    for (const s of ['not a PAS 2035 retrofit assessment', 'No particular rating or improvement is guaranteed', 'not quotes or guarantees']) ok(covers.includes(s), `no-guarantee wording: ${s}`)
    const svc = await page.evaluate(() => [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => [JSON.parse(s.textContent)].flat()).find((b) => b['@type'] === 'Service'))
    eq(svc.offers.priceSpecification.minPrice, 35, 'schema minPrice £35')
  },
}).catch((e) => { console.error(e); process.exit(1) })
