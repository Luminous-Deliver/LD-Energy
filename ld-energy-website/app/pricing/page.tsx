import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronDown, ShieldCheck } from 'lucide-react'
import { OurPromise } from '@/components/sections/OurPromise'
import { Container } from '@/components/ui/Container'
import { Ico } from '@/components/sections/home/HomeIcon'
import { OnThisPage, type PageSection } from '@/components/inner/OnThisPage'
import { RevealOnScroll } from '@/components/inner/RevealOnScroll'
import { innerReveals } from '@/components/inner/innerReveals'
import { ReadNext, type NextStep } from '@/components/inner/ReadNext'
import { InnerEnding } from '@/components/inner/InnerEnding'
import { PriceMatrix } from '@/components/inner/PriceMatrix'
import {
  pricing, site, formatPrice, maxBundleSaving, priceFrom, standardBands, topBand, portfolioMinHomes, portfolioRatesText, portfolioRatesList, largerHomesText,
  SAME_DAY_LODGEMENT_SURCHARGE, NEXT_DAY_VISIT_SURCHARGE, defaultOgImage,
} from '@/lib/site'
import { quoteHref } from '@/lib/quote-context'
import '@/app/inner.css'
import './pricing.css'

/*
 * /pricing, redesigned 24/10/2026 on the inner-page parts (/landlords) and the board-v3 pricing rules
 * (projects/ld-energy-redesign-2026-10/references/board-v3/pricing/README.md): every price visible up front, receipt
 * alignment, extras stated rather than ticked, no favourite column, no anchors or urgency. Title and descriptions stay
 * frozen until 14/12; only the H1 changes. Section ids #pricing-table, #whats-included and #pricing-faq are linked from
 * lib/faq.ts, so they stay.
 */
export const metadata: Metadata = {
  title: `EPC Prices London | From £${priceFrom.epc}`,
  description: `Guide prices for EPC and floor plan services in London, from £${priceFrom.epc}. Priced mainly on internal floor area (m²). Your exact quote is confirmed before booking.`,
  alternates: { canonical: `${site.url}/pricing` },
  openGraph: {
    images: [defaultOgImage],
    title: `EPC Prices London | From £${priceFrom.epc} | Transparent Guide Pricing | L&D Energy`,
    description: `Guide prices for EPC and floor plan services in London, from £${priceFrom.epc}. Priced mainly on internal floor area (m²). Exact quote confirmed before booking.`,
    url: `${site.url}/pricing`,
  },
  twitter: {
    images: [defaultOgImage.url],
    title: `EPC Prices London | From £${priceFrom.epc} | Transparent Guide Pricing`,
    description: `Guide prices from £${priceFrom.epc}, based mainly on internal floor area (m²). Exact quote confirmed before booking.`,
  },
}

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
const Portfolio = (WORDS[portfolioMinHomes] ?? String(portfolioMinHomes)).replace(/^./, (c) => c.toUpperCase())
const listHref = `${site.whatsappHref}?text=${encodeURIComponent('Hi, I\'d like a quote for EPCs on these addresses:')}`
const q = (ctaId: 'hero' | 'pricing' | 'inline' | 'bottom') => quoteHref({ sourcePage: 'pricing', ctaId })

/** Extras sit on top of the size price: stated with their price, never ticked (board-v3: no pre-ticks, no calculator). */
type Extra = { label: string; note?: string; price: string; muted?: boolean }
const extras: Array<{ group: string; rows: Extra[] }> = [
  {
    group: 'How fast',
    rows: [
      { label: 'Standard lodgement', note: 'On the GOV.UK register within 72 hours of the visit', price: 'Included', muted: true },
      { label: 'Same-day lodgement', note: 'Lodged on the day of the visit', price: `+£${SAME_DAY_LODGEMENT_SURCHARGE}` },
      { label: 'Next-day visit and lodgement', note: 'We visit the next day and lodge it that day', price: `+£${NEXT_DAY_VISIT_SURCHARGE}` },
    ],
  },
  {
    group: 'Reports',
    rows: [
      { label: 'Suggested improvements on your EPC', note: 'A short list on the certificate itself: each step, its typical cost and the rating after', price: 'Included', muted: true },
      { label: 'EPC Improvement Plan', note: 'Abdul\'s written priorities, with the full Elmhurst Energy Report', price: `+£${site.addOns.improvementPlan}` },
      { label: 'Lodging a held Pre-Assessment later', note: 'The same survey, no second visit, if nothing has changed', price: `+£${site.addOns.lodgeLater}` },
    ],
  },
  {
    group: 'Quoted before you book',
    rows: [
      { label: 'Extensions, loft conversions or unusual layouts', price: 'Exact quote', muted: true },
      { label: 'Multiple floors or additional measurement complexity', price: 'Exact quote', muted: true },
      { label: 'Large or unusually complex properties', price: 'Exact quote', muted: true },
    ],
  },
  {
    group: 'Other charges',
    rows: [
      { label: 'Travel or call-out', note: 'Anywhere in the 32 boroughs and the City', price: 'None', muted: true },
      { label: 'A return visit when we couldn\'t get in', note: 'Per visit, for access problems on the day', price: '£25' },
    ],
  },
]

/** One worked example under the extras, built from the live figures (board-v3 receipt line). */
const ex = pricing.find((b) => b.id === '55-75') ?? pricing[0]

const included = [
  'On-site assessment by an Elmhurst and Quidos accredited DEA',
  'Official lodgement on the UK Government EPC Register',
  'Certificate link sent once lodged on the government register',
  'Suggested improvements listed on the certificate, where applicable',
  'No travel or call-out charges',
  'No VAT to add: we are not VAT registered, so the price is the total',
]
const notIncluded = [
  `Optional personalised EPC Improvement Plan and full Elmhurst Energy Report, £${site.addOns.improvementPlan} extra`,
  'Re-visits due to access issues, charged at £25 per visit',
]

type Faq = { q: string; a: string }
const faqs: Faq[] = [
  {
    q: 'How much does an EPC cost in London?',
    a: `Guide prices start at £${pricing[0].epc} for properties ${pricing[0].areaLabel.toLowerCase()} and rise with internal floor area. Homes ${topBand.areaLabel.toLowerCase()} start from £${topBand.epc}. These are guide prices, not fixed quotes. The final price depends on the internal floor area (m²), any extensions or loft conversions, layout and condition. Your exact quote is confirmed before you book.`,
  },
  {
    q: 'Are there any hidden fees?',
    a: 'No. The price we confirm before booking is the price you pay. Quotes are worked out from your property size and condition, so there are no surprise add-ons or call-out charges. Anything that could change the figure, like extensions or an unusual layout, is priced into the quote up front. There are no travel or call-out charges, and no VAT to add because we are not VAT registered.',
  },
  {
    q: 'Does my EPC include improvement recommendations?',
    a: `Yes. Your standard EPC includes its software-generated recommendation report at no extra charge, unless there is no reasonable potential for improvements. The optional £${site.addOns.improvementPlan} EPC Improvement Plan adds Abdul's personalised interpretation and priorities, supported by the full Elmhurst Energy Report. It explains what is holding the rating back and which improvements to consider first. It does not guarantee a rating or savings.`,
  },
  {
    q: 'How much is an EPC Pre-Assessment?',
    a: `From £${priceFrom.preAssessment}, on the same floor-area bands as the EPC. It is the same visit, the same measuring and the same evidence gathering; only the lodgement is skipped, and your personalised written improvement plan is included in the price. A separate energy report is available at no extra charge if you ask for it. If you later decide you want the certificate after all, we can usually lodge the same survey for £${site.addOns.lodgeLater} with no second visit, provided nothing at the property has changed and the survey remains valid for lodgement under applicable rules. It is not a substitute for an EPC where one is legally required.`,
  },
  {
    q: 'Do you charge for travel?',
    a: 'No. There are no travel or call-out charges.',
  },
  {
    q: 'Can I get a discount for multiple properties?',
    a: `Yes. ${portfolioRatesText} Send us the addresses and we will quote the whole set together.`,
  },
  {
    q: 'What are the faster options?',
    a: `Same-day lodgement (£${SAME_DAY_LODGEMENT_SURCHARGE} extra per EPC) puts your certificate on the register on the day of the visit rather than within the standard 72 hours. A next-day visit and lodgement (£${NEXT_DAY_VISIT_SURCHARGE} extra per EPC) means we visit the next day and lodge the certificate that day. Both apply to visits in our standard hours (Mon–Sun, 8am–8pm), and availability is confirmed before booking.`,
  },
  {
    q: 'How much does a floor plan cost?',
    a: `Floor plans have guide prices from £${priceFrom.floorPlan}, priced on the same internal floor-area bands as the EPC. Booking an EPC and floor plan together costs less than booking them separately, up to £${formatPrice(maxBundleSaving)} less, because we measure the property during the assessment anyway, so it is one visit rather than two. Your exact quote is confirmed before booking.`,
  },
  {
    q: `What if my property is larger than ${standardBands[standardBands.length - 1].areaMax} m²?`,
    a: `Guide prices for homes ${topBand.areaLabel.toLowerCase()} start from £${topBand.epc} for the EPC, £${topBand.floorPlan} for a floor plan and £${topBand.bundle} for both together. ${largerHomesText} Large properties vary a great deal in layout and complexity, so this band is a starting point rather than a typical figure. Send us the address and we will confirm the exact quote before you book.`,
  },
]

const sections: PageSection[] = [
  { id: 'pricing-table', heading: 'prices-h', label: 'Every price, by floor area' },
  { id: 'extras', heading: 'extras-h', label: 'Faster options and extras' },
  { id: 'portfolio', heading: 'portfolio-h', label: `${Portfolio} homes or more` },
  { id: 'whats-included', heading: 'included-h', label: 'What every EPC includes' },
  { id: 'pricing-faq', heading: 'questions-h', label: 'Pricing questions' },
  { id: 'book', heading: 'in-end-h', label: 'Get my exact quote' },
]

const readNext: NextStep[] = [
  { kicker: 'The main service', title: 'What a Domestic EPC involves', href: '/services/domestic-epc',
    text: 'The visit, what we record and how the rating is worked out.' },
  { kicker: 'Same visit', title: 'Floor plans, drawn to scale', href: '/services/floor-plans',
    text: `Added to an EPC it costs up to £${formatPrice(maxBundleSaving)} less than booking both separately.` },
  { kicker: 'Before the visit', title: 'Preparing for your EPC', href: '/preparing-for-your-epc',
    text: 'What to have ready, so the rating counts everything you have done.' },
  { kicker: 'Letting a home?', title: 'EPCs for landlords', href: '/landlords', go: true, cta: 'Landlords',
    text: 'Where your rental stands against the E minimum, one let or a portfolio.' },
]

// minPrice, not price: every figure on this page is a starting guide, and a fixed price would misstate the page.
const schema = [
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'EPC and Floor Plan Pricing',
    itemListElement: pricing.map((row, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Offer',
        name: `Domestic EPC, ${row.areaLabel}`,
        priceSpecification: { '@type': 'PriceSpecification', minPrice: row.epc, priceCurrency: 'GBP' },
        availability: 'https://schema.org/InStock',
        url: `${site.url}/quote`,
        seller: { '@id': `${site.url}/#business` },
      },
    })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
      { '@type': 'ListItem', position: 2, name: 'Pricing', item: `${site.url}/pricing` },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  },
]

export default function PricingPage() {
  const reg = site.assessor.accreditations
  return (
    <div className="in pr">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* HERO: the answer, four facts and On this page */}
      <section className="in-hd" aria-labelledby="pr-h1">
        <Container>
          <nav className="in-crumbs" aria-label="Breadcrumb">
            <ol>
              <li><Link href="/">Home</Link><span className="sep" aria-hidden="true">›</span></li>
              <li><span aria-current="page">Pricing</span></li>
            </ol>
          </nav>
          <div className="pr-hd">
            <div className="in-hd__copy">
              <p className="in-eyebrow">Pricing</p>
              <h1 id="pr-h1">EPC and floor plan prices</h1>
              <p className="in-hd__answer">
                One price list for all of London, set mainly by the home&apos;s internal floor area. EPCs from{' '}
                <b className="num">£{priceFrom.epc}</b>, with no travel charges and no VAT to add. Every figure is a guide: we confirm your exact price
                before you book, never after.
              </p>
              <div className="in-hd__acts">
                <a className="ld-btn ld-btn--primary" href={q('hero')} data-enquiry-cta="hero">Get my exact quote</a>
                <a className="in-wa" href={site.whatsappHref} target="_blank" rel="noopener noreferrer"><Ico name="message" size={18} /> Ask on WhatsApp</a>
              </div>
              <p className="in-by">
                <ShieldCheck size={18} className="i" aria-hidden="true" />
                <span>
                  <Link href="/about"><b>{site.assessor.name}</b></Link>, {reg.map((a) => a.short).join(' and ')} accredited,{' '}
                  {reg.map((a, i) => <span key={a.number}>{i > 0 && ' and '}<span className="num">{a.number}</span></span>)}.{' '}
                  <a href={site.assessor.verifyUrl} target="_blank" rel="noopener">Check the GOV.UK register</a>
                </span>
              </p>
            </div>
            <div className="pr-hd__side">
              <ul className="pr-facts">
                <li><b className="num">£{priceFrom.epc}</b><span>EPCs from, by floor area</span></li>
                <li><b className="num">£{priceFrom.floorPlan}</b><span>Floor plans from</span></li>
                <li><b className="num">72 h</b><span>On the GOV.UK register after the visit</span></li>
                <li><b className="num">{site.reviews.ratingValue.toFixed(1)}</b><span>On Google, from {site.reviews.reviewCount} reviews</span></li>
              </ul>
              <OnThisPage sections={sections} />
            </div>
          </div>
        </Container>
      </section>

      {/* EVERY PRICE */}
      <section className="in-sec in-sec--band" id="pricing-table" aria-labelledby="prices-h">
        <Container>
          <div className="pr-head">
            <div>
              <p className="in-eyebrow">Guide prices · {site.reviews.ratingValue.toFixed(1)} on Google</p>
              <h2 className="in-h2" id="prices-h">Every price, by floor area</h2>
            </div>
            <p className="in-lede">
              Find your size, then your service. Each price opens the quote with both filled in. Not sure of the size? Pick the
              nearest; we confirm it from your property details.
            </p>
          </div>
          <PriceMatrix />
          <div className="pr-notes">
            {/* Abdul's wording, 22/10/2026 pricing spec §11 */}
            <p><b>Guide prices for standard domestic properties.</b> Larger or unusually complex properties are quoted individually. Your exact price is confirmed before booking.</p>
            <p>
              Internal floor area (m²) is the biggest factor in the price, alongside extensions, loft conversions, layout and condition.
              Bedrooms are shown only as a rough guide, and the largest band shows starting prices. Savings are the difference between
              the two services booked separately and booked together: up to <b className="num">£{formatPrice(maxBundleSaving)}</b> on one visit.{' '}
              <a className="in-link" href={q('inline')}>Request an exact quote</a>
            </p>
            <p className="pr-notes__small">{largerHomesText}</p>
          </div>
        </Container>
      </section>

      {/* Our promise, directly under the prices (Abdul 24/10) */}
      <OurPromise />

      {/* EXTRAS */}
      <section className="in-sec" id="extras" aria-labelledby="extras-h">
        <Container className="pr-extras">
          <div>
            <p className="in-eyebrow">On top of the size price</p>
            <h2 className="in-h2" id="extras-h">Faster options and extras</h2>
            <p className="in-lede">Each one has its price beside it. Anything marked &ldquo;exact quote&rdquo; is confirmed in writing before you book, never added afterwards.</p>
            <figure className="pr-receipt" aria-labelledby="pr-receipt-cap">
              <figcaption id="pr-receipt-cap" className="in-eyebrow">A worked example</figcaption>
              <dl>
                <div><dt>Domestic EPC, {ex.areaLabel}</dt><dd className="num">£{ex.epc}</dd></div>
                <div><dt>Same-day lodgement</dt><dd className="num">+£{SAME_DAY_LODGEMENT_SURCHARGE}</dd></div>
                <div className="pr-receipt__t"><dt>Guide total</dt><dd className="num">£{ex.epc + SAME_DAY_LODGEMENT_SURCHARGE}</dd></div>
              </dl>
            </figure>
          </div>
          <div className="pr-ledger">
            {extras.map((g) => (
              <div key={g.group} className="pr-ledger__g">
                <h3 className="pr-ledger__h">{g.group}</h3>
                <dl>
                  {g.rows.map((r) => (
                    <div key={r.label}>
                      <dt>{r.label}{r.note && <small>{r.note}</small>}</dt>
                      <dd className={r.muted ? 'is-muted' : 'num'}>{r.price}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
            <p className="in-note">
              The faster options cover visits in our standard hours (Mon–Sun, 8am–8pm), and availability is confirmed before booking.
            </p>
          </div>
        </Container>
      </section>

      {/* PORTFOLIO */}
      <section className="in-sec in-sec--band" id="portfolio" aria-labelledby="portfolio-h">
        <Container className="pr-port">
          <div>
            <p className="in-eyebrow">Landlords and agents</p>
            <h2 className="in-h2" id="portfolio-h">{Portfolio} homes or more</h2>
            <p className="in-lede">Send the addresses in one message. We price each home by its size, group the visits by area across London and quote the whole set together.</p>
            <div className="in-hd__acts pr-port__acts">
              <a className="in-wa" href={listHref} target="_blank" rel="noopener noreferrer"><Ico name="message" size={18} /> WhatsApp a list of addresses</a>
              <a className="in-arrow in-link" href={quoteHref({ service: 'bulk', sourcePage: 'pricing', ctaId: 'inline' })}>Or use the quote form <Ico name="arrow-right" size={16} /></a>
            </div>
          </div>
          {/* Abdul's approved portfolio rates (24/10), word for word from lib/site.ts */}
          <ul className="pr-port__rates">{portfolioRatesList.map((r) => <li key={r}>{r}</li>)}</ul>
        </Container>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="in-sec" id="whats-included" aria-labelledby="included-h">
        <Container>
          <p className="in-eyebrow">No surprises</p>
          <h2 className="in-h2" id="included-h">What every EPC includes</h2>
          <div className="pr-inc">
            <div>
              <h3 className="pr-ledger__h">Included</h3>
              <ul className="in-ticks">
                {included.map((item) => <li key={item}><Ico name="check" size={20} /><span>{item}</span></li>)}
              </ul>
            </div>
            <div>
              <h3 className="pr-ledger__h">Not included</h3>
              <ul className="in-ticks pr-inc__no">
                {notIncluded.map((item) => <li key={item}><span className="pr-dash" aria-hidden="true" /><span>{item}</span></li>)}
              </ul>
              <p className="in-note pr-inc__far">For properties outside our service radius, contact us for a tailored quote.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* QUESTIONS */}
      <section className="in-sec" id="pricing-faq" aria-labelledby="questions-h">
        <Container className="pr-faqwrap">
          <div>
            <p className="in-eyebrow">FAQ</p>
            <h2 className="in-h2" id="questions-h">Pricing questions</h2>
            <p className="in-note pr-faqside">
              Not covered here? <a className="in-link" href={site.whatsappHref} target="_blank" rel="noopener">WhatsApp us</a>, or see
              the <Link className="in-link" href="/faq">full FAQ</Link>.
            </p>
          </div>
          <div className="in-faq">
            {faqs.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary><span>{f.q}</span><ChevronDown size={20} className="i" aria-hidden="true" /></summary>
                <div className="in-faq__a"><p>{f.a}</p></div>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <ReadNext steps={readNext} />

      {/* section reveals (motion, Considered); the price sections are left out on purpose, see innerReveals */}
      <RevealOnScroll {...innerReveals('.pr', { lists: ['.pr-inc'], blocks: ['.pr-port__acts'] })} />

      <div id="book">
        <InnerEnding variant="a" source="pricing"
          eyebrow={<>EPCs from <span className="num">£{priceFrom.epc}</span> · no travel charges</>}
          heading="Get a personalised quote"
          text="Send us the address and property size, and we'll confirm your exact price before anything is booked." />
      </div>
    </div>
  )
}
