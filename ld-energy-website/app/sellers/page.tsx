import type { Metadata } from 'next'
import Link from 'next/link'
import { OurPromise } from '@/components/sections/OurPromise'
import { ChevronDown, ShieldCheck } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Ico } from '@/components/sections/home/HomeIcon'
import { OnThisPage, type PageSection } from '@/components/inner/OnThisPage'
import { ReadNext, type NextStep } from '@/components/inner/ReadNext'
import { InnerEnding } from '@/components/inner/InnerEnding'
import {
  site, pricing, priceFrom, defaultOgImage, govUk, insurance, SAME_DAY_LODGEMENT_SURCHARGE, NEXT_DAY_VISIT_SURCHARGE,
} from '@/lib/site'
import { areaServedLondon } from '@/lib/boroughs'
import { quoteHref } from '@/lib/quote-context'
import type { AreaChoice } from '@/lib/floor-area'
import '@/app/inner.css'
import '@/app/landlords/landlords.css'
import './sellers.css'

/*
 * /sellers, rebuilt 24/10/2026 on the /landlords template (approved 23/10): hero with the title-block price list and
 * On this page, the selling sections, Our promise, FAQ, Read next and ending A. Title and descriptions stay frozen until
 * 14/12; only the H1 changes, to sentence case. The marketing rules were re-read from the 2012 Regulations (regs 5 to 8)
 * and GOV.UK on 24/10/2026. Parity record: Abdul-2 projects/ld-energy-redesign-2026-10/research/sellers-parity-2026-10-24.md.
 */
export const metadata: Metadata = {
  title: `EPC for Selling Your Home London | From £${priceFrom.epc}`,
  description:
    `EPC certificates for selling your London home. Generally commissioned before marketing; exemptions apply. Lodged within 72 hours, next-day visits available. Guide prices from £${priceFrom.epc}.`,
  alternates: { canonical: `${site.url}/sellers` },
  openGraph: {
    images: [defaultOgImage],
    title: `EPC for Selling Your Home London | From £${priceFrom.epc} | L&D Energy`,
    description:
      `EPC certificates for selling your London home. Generally commissioned before marketing; exemptions apply. Lodged within 72 hours, next-day visits available. Guide prices from £${priceFrom.epc}.`,
    url: `${site.url}/sellers`,
  },
  twitter: {
    images: [defaultOgImage.url],
    title: `EPC for Selling Your Home London | From £${priceFrom.epc}`,
    description:
      'EPC certificates for selling your London home. Generally commissioned before marketing; exemptions apply. Book today.',
  },
}

/** The Energy Performance of Buildings (England and Wales) Regulations 2012, reg 7: EPCs on marketing. Read 24/10/2026. */
const REG_7 = 'https://www.legislation.gov.uk/uksi/2012/3118/regulation/7'

const waHref = `${site.whatsappHref}?text=${encodeURIComponent('Hi, I\'m selling my home and I\'d like a quote for an EPC. The address and postcode are:')}`
const q = (ctaId: 'hero' | 'pricing' | 'inline' | 'bottom') => quoteHref({ service: 'epc', sourcePage: 'sellers', ctaId })

const timeline = [
  {
    title: 'Get your EPC before marketing',
    body: 'Unless the home already has a valid EPC, one must be commissioned before it is advertised. Your agent has to be satisfied it has been commissioned before they market the home, so they will ask for it on day one.',
  },
  {
    title: 'Book early in the listing process',
    body: 'Booking your EPC at the same time as your photography and floor plan keeps everything ready for launch day.',
  },
  {
    title: 'Book a next-day visit if you’re tight',
    body: `If your agent has already started chasing, we can visit the next day and lodge your certificate that day (+£${NEXT_DAY_VISIT_SURCHARGE}).`,
  },
  {
    title: 'Give it to buyers',
    body: 'Show it free to anyone who asks about the home or views it, and give a copy to the person who buys it. Your solicitor may ask for it early in conveyancing.',
  },
]

const whyMatters = [
  {
    icon: 'document' as const,
    title: 'Legal requirement',
    body: 'Generally, an EPC must be commissioned before marketing a home for sale in England and Wales. The rules allow limited time to obtain it; exemptions apply.',
  },
  {
    icon: 'epc-rating' as const,
    title: 'Buyers care about efficiency',
    body: 'With rising energy bills and tighter mortgage criteria, more buyers now factor EPC rating into offers. A better rating supports your asking price.',
  },
  {
    icon: 'clock' as const,
    title: 'Don’t hold up your sale',
    body: 'Conveyancing solicitors will ask for the certificate early. Our 72-hour standard delivery (or same-day lodgement) keeps your timeline on track.',
  },
]

const improvements = [
  { title: 'LED lighting', body: 'Low-cost swap. Every lamp in a fixed fitting is counted by type on the EPC, and only LED lamps are recorded as LED.' },
  { title: 'Modern condensing boiler', body: 'A high-efficiency boiler with good controls is one of the highest-impact upgrades for older properties.' },
  { title: 'Loft and cavity wall insulation', body: 'Quick, cost-effective improvements that meaningfully shift your rating in many London homes.' },
  { title: 'Renewables', body: 'Solar PV or a heat pump may be suitable, depending on the building and system design. A particular rating gain is not guaranteed.' },
]

const faqs: { q: string; a: string }[] = [
  {
    q: 'Do I need the EPC before or after I list my home?',
    a: 'Generally, commission the EPC before marketing. Make reasonable efforts to obtain it within seven days; a further 21 days is allowed if those efforts fail. Exemptions apply. Arranging it early helps avoid delays.',
  },
  {
    q: 'Should I arrange the EPC myself or leave it to my estate agent?',
    a: 'Either works, but booking directly is often faster and cheaper than an agent-arranged panel provider. You keep control of the timing and can have the certificate ready the moment you instruct your agent.',
  },
  {
    q: 'Does a higher EPC rating actually help my sale?',
    a: 'Increasingly, yes. With higher energy bills and tighter mortgage stress-testing, more buyers factor the EPC rating into their offers. A better rating can support your asking price and speed up the sale, while a poor one gives buyers a reason to negotiate down.',
  },
  {
    q: 'Should I improve my rating before selling, or sell as-is?',
    a: 'It depends on your timeline. Cheap quick wins like LED lighting and topping up loft insulation can lift the rating before you list. If you need to move fast, selling as-is is perfectly fine: the improvement recommendations on your certificate simply pass to the buyer.',
  },
  {
    q: 'I already have an EPC from when I bought the property. Can I reuse it?',
    a: 'Yes, as long as it is still within its 10-year validity. The certificate is tied to the property, not the owner. If it has expired and an EPC is required, commission a new one before marketing. Improvements do not automatically invalidate an EPC, but a fresh assessment can record the changed property.',
  },
]

// ids kept from the old page (why-it-matters, sale-price, timeline, seller-faq)
const sections: PageSection[] = [
  { id: 'why-it-matters', heading: 'why-it-matters-h', label: 'Why you need an EPC to sell' },
  { id: 'timeline', heading: 'timeline-h', label: 'When to book your EPC' },
  { id: 'sale-price', heading: 'sale-price-h', label: 'How your EPC affects your sale' },
  { id: 'seller-faq', heading: 'seller-faq-h', label: 'Seller questions' },
  { id: 'book', heading: 'in-end-h', label: 'Get my exact quote' },
]

const readNext: NextStep[] = [
  { kicker: 'Selling', title: 'EPCs for selling a house, in full', href: '/blog/epc-for-selling-house',
    text: 'The time limits, who has to show the EPC, and what to do if the rating is low.' },
  { kicker: 'Validity', title: 'How long an EPC lasts', href: '/blog/how-long-does-epc-last',
    text: 'Ten years, when you need a new one, and how to check the one you have.' },
  { kicker: 'Letting instead?', title: 'EPCs for London landlords', href: '/landlords',
    text: 'Where a rental stands against the E minimum, one let or a portfolio.' },
  { kicker: 'Selling through an agent?', title: 'Your agent can book it', href: '/estate-agents', go: true, cta: 'Agents',
    text: 'One home or a list, with the certificate sent straight to the branch.' },
]

const schema = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
      { '@type': 'ListItem', position: 2, name: 'Sellers', item: `${site.url}/sellers` },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Energy Performance Certificate',
    name: 'EPC for Selling a Home',
    description:
      'Domestic EPC certificates for homeowners selling in London. Generally commissioned before marketing, subject to exemptions. Appointment and delivery timing confirmed before booking.',
    provider: { '@id': `${site.url}/#business` },
    url: `${site.url}/sellers`,
    areaServed: areaServedLondon,
    offers: {
      '@type': 'Offer',
      // Guide price, so minPrice: a fixed `price` would misstate the page.
      priceSpecification: { '@type': 'PriceSpecification', minPrice: pricing[0].epc, priceCurrency: 'GBP' },
      availability: 'https://schema.org/InStock',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  },
]

export default function SellersPage() {
  const reg = site.assessor.accreditations
  return (
    <div className="in lp sl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* HERO: the /landlords hero with the drawn street corner */}
      <section className="in-hd" aria-labelledby="sl-h1">
        <Container>
          <nav className="in-crumbs" aria-label="Breadcrumb">
            <ol>
              <li><Link href="/">Home</Link><span className="sep" aria-hidden="true">›</span></li>
              <li><span aria-current="page">Sellers</span></li>
            </ol>
          </nav>
          <div className="in-hd__grid lp-hd">
            <div className="in-hd__copy">
              <p className="in-eyebrow">For home sellers</p>
              <h1 id="sl-h1">EPCs for selling your London home</h1>
              <p className="in-hd__answer">
                Generally, an EPC must be commissioned before your home is marketed for sale; exemptions apply. One accredited visit,
                and your certificate is on the GOV.UK register <b>within 72 hours</b> as standard, or the same day
                for £{SAME_DAY_LODGEMENT_SURCHARGE} extra. Your exact price comes before you book.
              </p>
              <div className="in-hd__acts">
                <a className="ld-btn ld-btn--primary" href={q('hero')} data-enquiry-cta="hero">Get my exact quote</a>
                <a className="in-wa" href={waHref} target="_blank" rel="noopener noreferrer"><Ico name="message" size={18} /> Ask on WhatsApp</a>
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

            <figure className="in-hd__art lp-art">
              {/* eslint-disable-next-line @next/next/no-img-element -- srcset WebP; next/image is unoptimised on Pages */}
              <img src="/home/hero-cutaway-1600.webp" srcSet="/home/hero-cutaway-900.webp 900w, /home/hero-cutaway-1600.webp 1600w"
                sizes="(max-width: 899px) 92vw, 46vw" width={1600} height={900} fetchPriority="high"
                alt="A London corner house with its front wall cut away, showing the loft, the bedrooms, the front room and the kitchen, on a quiet terraced street" />
              <figcaption className="in-hd__cap">What we record: walls, loft, windows, heating and hot water, lighting and floor area, room by room. An AI-generated illustration.</figcaption>
            </figure>

            <aside className="in-tb lp-tb" aria-labelledby="sl-tb-h">
              <div className="in-tb__head">
                <div><span>Service</span><b id="sl-tb-h">Domestic EPC</b></div>
                <div><span>For</span><b>Sellers</b></div>
                <div><span>Status</span><b>Guide price</b></div>
              </div>
              <div className="in-tb__cols" aria-hidden="true"><span>Floor area</span><span>Price</span><span /></div>
              <ul className="in-tb__rows">
                {pricing.map((b) => (
                  <li key={b.id}>
                    <a href={quoteHref({ service: 'epc', area: b.id as AreaChoice, sourcePage: 'sellers', ctaId: 'pricing' })}>
                      <span className="in-tb__s">{b.areaLabel}<small>{b.typicalLabel}</small></span>
                      <span className="in-tb__p num">{b.startingPrice && <small>from</small>}£{b.epc}</span>
                      <Ico name="arrow-right" size={16} />
                    </a>
                  </li>
                ))}
                <li>
                  <a href={quoteHref({ service: 'epc', area: 'unknown', sourcePage: 'sellers', ctaId: 'pricing' })}>
                    <span className="in-tb__s">Not sure of the size<small>We work it out from your property details</small></span>
                    <span className="in-tb__p in-tb__p--tbc">Exact quote</span>
                    <Ico name="arrow-right" size={16} />
                  </a>
                </li>
              </ul>
              <div className="in-tb__foot">
                <a className="ld-btn ld-btn--primary ld-btn--block" href={q('pricing')} data-enquiry-cta="pricing">Get my exact quote</a>
                <p className="in-tb__other">
                  Floor plan from <b className="num">£{priceFrom.floorPlan}</b>, or EPC and floor plan on one visit from{' '}
                  <b className="num">£{priceFrom.bundle}</b>. Same-day lodgement <b>£{SAME_DAY_LODGEMENT_SURCHARGE}</b> extra; a next-day
                  visit with lodgement that day <b>£{NEXT_DAY_VISIT_SURCHARGE}</b> extra. No travel charges, and you pay once the visit is done.
                </p>
              </div>
            </aside>

            <OnThisPage sections={sections} />
          </div>
        </Container>
      </section>

      {/* WHY YOU NEED AN EPC TO SELL */}
      <section className="in-sec in-sec--band" id="why-it-matters" aria-labelledby="why-it-matters-h">
        <Container>
          <p className="in-eyebrow">Why it matters</p>
          <h2 className="in-h2" id="why-it-matters-h">Why you need an EPC to sell</h2>
          <p className="in-lede">
            An EPC generally must be commissioned before a home is marketed for sale in England and Wales. Reasonable efforts must be
            made to obtain it within seven days of marketing, with a further 21 days allowed if those efforts fail. It is provided to
            prospective buyers as required; exemptions apply.
          </p>
          <ul className="sl-why">
            {whyMatters.map((m) => (
              <li key={m.title}>
                <span className="sl-why__ico"><Ico name={m.icon} size={24} /></span>
                <h3 className="in-h3">{m.title}</h3>
                <p>{m.body}</p>
              </li>
            ))}
          </ul>
          <p className="sl-direct">
            You can book directly with us, often faster and cheaper than an agent-arranged panel provider, and if you work in
            property, <Link className="in-link" href="/estate-agents">estate and letting agents can partner with us</Link> for all their listings.
          </p>
          <p className="in-src">
            Sources: <a href={REG_7} target="_blank" rel="noopener">the Energy Performance of Buildings Regulations 2012, regulation 7</a> and
            GOV.UK <a href={govUk.epcGuidance} target="_blank" rel="noopener">guidance for sellers</a>, which lists the buildings that don&apos;t
            need one. Read 24/10/2026.
          </p>
        </Container>
      </section>

      {/* WHEN TO BOOK */}
      <section className="in-sec" id="timeline" aria-labelledby="timeline-h">
        <Container className="lp-visit">
          <div>
            <p className="in-eyebrow">Timeline</p>
            <h2 className="in-h2" id="timeline-h">When to book your EPC</h2>
            <p className="in-lede">The earlier the better. Here&apos;s how to fit your EPC into a typical sale.</p>
            {/* eslint-disable-next-line @next/next/no-img-element -- WebP from the homepage; next/image is unoptimised on Pages */}
            <img className="lp-visit__img" src="/home/assessor-visit-900.webp" width={900} height={600} loading="lazy" decoding="async"
              alt="An assessor in a sage jacket measures a London front room with a laser measure, beside a sash window and a column radiator" />
          </div>
          <ol className="lp-steps">
            {timeline.map((s, i) => (
              <li key={s.title}><span className="lp-steps__n">{i + 1}</span><div><h3 className="in-h3">{s.title}</h3><p>{s.body}</p></div></li>
            ))}
          </ol>
        </Container>
      </section>

      {/* HOW YOUR EPC AFFECTS YOUR SALE */}
      <section className="in-sec in-sec--band" id="sale-price" aria-labelledby="sale-price-h">
        <Container>
          <div className="sl-sale">
            <div>
              <p className="in-eyebrow">Sale price and speed</p>
              <h2 className="in-h2" id="sale-price-h">How your EPC affects your sale</h2>
              <p className="in-lede">
                EPC ratings show on Rightmove, Zoopla and OnTheMarket listings. With energy costs and lender stress-testing in the
                spotlight, more buyers consider efficiency before making an offer.
              </p>
              <p className="sl-p">
                A higher rating signals lower running costs, which can support your asking price and reduce time on market. A lower
                rating doesn&apos;t stop a sale, but it gives buyers a reason to negotiate down. The improvement recommendations on your
                certificate give you a roadmap if you want to push the rating up before relisting.
              </p>
              <dl className="in-diffs lp-opts sl-opts">
                <div><dt>Included</dt><dd><b>The recommendations</b> on every EPC list the improvements that could raise the rating, with a rough cost for each.</dd></div>
                <div><dt>£{site.addOns.improvementPlan} extra</dt><dd><b><Link className="in-link" href="/services/epc-improvement-plan">EPC Improvement Plan</Link>.</b> Abdul writes out what is holding the rating back and what to do first, with the full Elmhurst Energy Report behind it.</dd></div>
                <div><dt>From £{priceFrom.preAssessment}</dt><dd><b><Link className="in-link" href="/services/epc-pre-assessment">EPC Pre-Assessment</Link>.</b> Planning works before you list? The same survey as guidance only, not lodged, so you know where the rating stands before anything goes on the register.</dd></div>
              </dl>
            </div>
            <div className="sl-wins">
              <h3 className="in-h3">Quick-win improvements for sellers</h3>
              <ul>
                {improvements.map((i) => <li key={i.title}><b>{i.title}</b><span>{i.body}</span></li>)}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* PROOF */}
      <section className="in-sec" aria-labelledby="proof-h">
        <Container>
          <p className="in-eyebrow">Check us before you book</p>
          <h2 className="in-h2" id="proof-h">{site.reviews.ratingValue.toFixed(1)} on Google <span className="lp-quiet">from {site.reviews.reviewCount} reviews</span></h2>
          <ul className="lp-trust">
            <li>
              <h3 className="in-h3">{site.assessor.name}</h3>
              <p>{site.assessor.qualification} with {reg.map((a, i) => <span key={a.number}>{i > 0 && ' and '}{a.scheme} (<b>{a.number}</b>)</span>)}. DBS checked.</p>
              <a className="in-arrow in-link" href={site.assessor.verifyUrl} target="_blank" rel="noopener">Check the GOV.UK register</a>
            </li>
            <li>
              <h3 className="in-h3">£5m cover, twice over</h3>
              <p>{insurance.full}</p>
            </li>
            <li>
              <h3 className="in-h3">All 32 boroughs and the City</h3>
              <p>Based in {site.address.locality}, {site.address.postalCode}. No travel charges anywhere we cover.</p>
              <Link className="in-arrow in-link" href="/areas">See every area</Link>
            </li>
          </ul>
        </Container>
      </section>

      {/* Our promise, before the questions (Abdul 24/10) */}
      <OurPromise />

      {/* QUESTIONS */}
      <section className="in-sec" id="seller-faq" aria-labelledby="seller-faq-h">
        <Container className="lp-faqwrap">
          <div>
            <p className="in-eyebrow">Seller questions</p>
            <h2 className="in-h2" id="seller-faq-h">Before you list</h2>
            <p className="in-note lp-faqside">
              Not covered here? <a className="in-link" href={site.whatsappHref} target="_blank" rel="noopener">WhatsApp us</a>, or read
              the <Link className="in-link" href="/blog/epc-for-selling-house">full guide to selling</Link>.
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

      <div id="book">
        <InnerEnding variant="a" source="sellers"
          eyebrow={<>Sellers · from <span className="num">£{priceFrom.epc}</span></>}
          heading="Don’t let an EPC delay your sale"
          text={`Standard 72-hour lodgement, same-day lodgement for £${SAME_DAY_LODGEMENT_SURCHARGE} extra, or a next-day visit for £${NEXT_DAY_VISIT_SURCHARGE} extra. We'll fit you in around your viewings.`}
          whatsapp={{ href: waHref, label: 'Or WhatsApp a quote request' }} />
      </div>
    </div>
  )
}
