import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { OurPromise } from '@/components/sections/OurPromise'
import { Container } from '@/components/ui/Container'
import { Ico } from '@/components/sections/home/HomeIcon'
import { OnThisPage, type PageSection } from '@/components/inner/OnThisPage'
import { ReadNext, type NextStep } from '@/components/inner/ReadNext'
import { InnerEnding } from '@/components/inner/InnerEnding'
import {
  site, topBand, pricing, priceFrom, maxBundleSaving, formatPrice, SAME_DAY_LODGEMENT_SURCHARGE, NEXT_DAY_VISIT_SURCHARGE,
  defaultOgImage, govUk,
} from '@/lib/site'
import { areaServedLondon } from '@/lib/boroughs'
import { quoteHref } from '@/lib/quote-context'
import { Crumbs, PriceBlock, FaqList, faqSchema, Ticks, type ServiceFaq } from '../ServiceParts'
import '@/app/inner.css'
import '../services.css'

/*
 * /services/domestic-epc, rebuilt 24/10/2026 on the inner-page parts (/landlords, approved 23/10): hero with the EPC
 * column of the price list as a title block, On this page, Our promise under the prices, Read next, ending A. Title and
 * descriptions stay frozen until 14/12; only the H1 changes. #epc-process is linked from lib/faq.ts and #pricing from
 * tests/booking-navigation.cjs, so both ids stay, as do the old page's other section ids.
 * Parity: Abdul-2 projects/ld-energy-redesign-2026-10/research/domestic-epc-parity-2026-10-24.md
 */
export const metadata: Metadata = {
  title: `Domestic EPC Certificates in London`,
  description: `Domestic EPC certificate in London from £${priceFrom.epc}. Elmhurst and Quidos accredited assessor, property visit and lodged certificate. Exact quote and timing confirmed before booking.`,
  alternates: { canonical: `${site.url}/services/domestic-epc` },
  openGraph: {
    images: [defaultOgImage],
    title: `Domestic EPC Certificate London | From £${priceFrom.epc} | L&D Energy`,
    description: `Get your domestic EPC certificate in London from £${priceFrom.epc}. Elmhurst and Quidos accredited assessor, property visit and lodged certificate. Exact quote before booking.`,
    url: `${site.url}/services/domestic-epc`,
  },
  twitter: {
    images: [defaultOgImage.url],
    title: `Domestic EPC Certificate London | From £${priceFrom.epc}`,
    description:
      'Elmhurst and Quidos accredited assessor, property visit and lodged certificate. Exact quote before booking.',
  },
}

const q = (ctaId: 'hero' | 'pricing' | 'inline' | 'bottom') => quoteHref({ service: 'epc', sourcePage: 'domestic-epc', ctaId })

/** What the certificate shows (old page, "Your EPC includes"). */
const epcContents = [
  'Current energy efficiency rating (A to G)',
  'Potential rating if recommended improvements are made',
  'Estimated annual energy costs',
  'CO₂ emissions estimate',
  'Specific recommendations to improve efficiency',
  'Estimated cost and savings for each recommendation',
]

const whenRequired = [
  'Selling or letting a property that needs a valid EPC, subject to exemptions',
  'Replacing an expired certificate when a valid EPC is needed',
  'Reassessing after improvements when you want an updated rating',
]

const personas = [
  {
    icon: 'key' as const,
    title: 'Sellers',
    body: 'Generally, commission an EPC before marketing your home. Exemptions and time limits apply. Tell us your listing deadline so we can confirm an available appointment.',
    href: '/sellers', link: 'EPCs for sellers',
  },
  {
    icon: 'house' as const,
    title: 'Landlords',
    body: 'For domestic rentals within MEES scope, the minimum is E unless a valid exemption is registered. Current financial penalties are capped at £5,000 per property in total. An assessment establishes the rating; it does not itself guarantee compliance.',
    href: '/landlords', link: 'EPCs for landlords',
  },
  {
    icon: 'flat' as const,
    title: 'Agents',
    body: 'Quick turnaround for new instructions. Portfolio rates available for multiple properties. We work with letting agents across London.',
    href: '/estate-agents', link: 'EPCs for agents',
  },
]

const process = [
  { title: 'Request your quote', body: 'Online form, phone, WhatsApp or email, whichever suits you.' },
  { title: 'We confirm details', body: 'We confirm time, address and any access requirements during our opening hours, Mon–Sun 8am–8pm.' },
  { title: 'On-site assessment', body: 'Our DEA measures and records all required data. Typically 45 minutes to 2 hours depending on property size.' },
  { title: 'Software processing', body: 'The assessment data is processed through Elmhurst’s government-approved RdSAP software. The software calculates the rating and standard recommendations for the property.' },
  { title: 'Certificate delivered', body: 'Lodged on the official GOV.UK EPC register within 72 hours (or on the day of the visit with same-day lodgement), with your certificate link sent once it is live.' },
]

const assessed = [
  'Property dimensions and total floor area',
  'Number of habitable rooms and storeys',
  'Wall construction type and insulation',
  'Roof type and insulation depth',
  'Floor construction and insulation',
  'Window glazing type, frame and age',
  'External doors',
  'Main and secondary heating systems',
  'Heating controls and programmer',
  'Hot water system and cylinder insulation',
  'Ventilation systems',
  'Lighting (lamp counts and types in permanent fittings)',
  'Renewable energy systems (solar PV, heat pumps, etc.)',
]

/** The old Pricing section's three service cards, stated rather than ranked (no favourite, as /pricing). */
const options = [
  {
    name: 'Domestic EPC', from: priceFrom.epc, service: 'epc' as const, go: 'Get an EPC quote',
    lead: 'A full on-site assessment, lodged on the official GOV.UK EPC Register and valid for ten years.',
    items: [
      'Carried out by an accredited Domestic Energy Assessor',
      'Standard lodgement within 72 hours, same day available',
      'Certificate link sent as soon as it is live on the register',
      'Standard EPC recommendation report included, where applicable',
    ],
  },
  {
    name: 'EPC and floor plan', from: priceFrom.bundle, service: 'bundle' as const, go: 'Get a quote for both',
    save: `Up to £${formatPrice(maxBundleSaving)} less than booking both separately`,
    lead: 'Both surveys completed in one property visit, so a listing has everything it needs.',
    items: [
      'Everything in the Domestic EPC',
      'Laser-measured 2D floor plan to Rightmove and Zoopla spec',
      'Total floor area, room dimensions, compass point, floor labels',
      'Supplied as high-resolution JPG and PDF',
    ],
  },
  {
    name: 'Floor plan only', from: priceFrom.floorPlan, service: 'floor-plan' as const, go: 'Get a floor plan quote',
    lead: 'A professional measured plan for a property that already has a valid EPC.',
    items: [
      'Laser-measured on site, drawn to portal specification',
      'Total floor area, room dimensions, compass point, floor labels',
      'High-resolution JPG and PDF supplied',
      'Ready for Rightmove, Zoopla and OnTheMarket',
    ],
  },
]

const faqs: ServiceFaq[] = [
  {
    q: 'How much does a domestic EPC cost in London?',
    a: `Guide prices start from £${pricing[0].epc} for properties ${pricing[0].areaLabel.toLowerCase()} and rise with internal floor area; homes ${topBand.areaLabel.toLowerCase()} start from £${topBand.epc}. Internal floor area (m²) is the main factor, alongside extensions, layout and condition. Your exact quote is confirmed before booking.`,
  },
  {
    q: 'Are the prices on your website fixed?',
    a: 'No. The figures shown are guide prices, based mainly on internal floor area (m²). Extensions, loft conversions, layout and access can change the final figure, so we confirm your exact quote before you book. That applies to urgent and same-day jobs too: we confirm availability and any surcharge before accepting the booking.',
  },
  {
    q: 'Can I get a next-day EPC?',
    a: `Yes. A next-day visit and lodgement costs £${NEXT_DAY_VISIT_SURCHARGE} extra: we visit the next day and lodge your certificate that day. On any other visit, same-day lodgement puts it on the register on the day of the visit for £${SAME_DAY_LODGEMENT_SURCHARGE} extra. Appointment availability and delivery timing are confirmed before booking.`,
  },
  {
    q: 'How long does an EPC assessment take?',
    a: 'Assessments typically take 45 minutes for studios up to around 2 hours for larger 4–5 bedroom homes. You do not need to do any preparation, just normal access to all rooms.',
  },
  {
    q: 'How quickly will I receive my EPC certificate?',
    a: `Standard lodgement is within 72 hours of the assessment. Same-day lodgement puts your certificate on the register on the day of the visit for an additional £${SAME_DAY_LODGEMENT_SURCHARGE}.`,
    body: (
      <p>
        Standard lodgement is within 72 hours of the assessment. Same-day lodgement puts your certificate on the register on the
        day of the visit for an additional £{SAME_DAY_LODGEMENT_SURCHARGE}. Once it is live you can also{' '}
        <a href={govUk.findCertificate} target="_blank" rel="noopener">find it on GOV.UK</a>.
      </p>
    ),
  },
  {
    q: 'Do I legally need an EPC?',
    a: 'Generally, commission an EPC before marketing a home for sale or rent; exemptions and time limits apply. Reasonable efforts must be made to obtain it within seven days, with a further 21 days allowed if those efforts fail. Domestic MEES duties apply separately to rentals within scope: the current minimum is E unless a valid exemption is registered.',
  },
  {
    q: 'How long is an EPC valid for?',
    a: 'An EPC is valid for 10 years. You can use the same certificate for multiple lettings within that period as long as it remains on the government register.',
  },
]

const sections: PageSection[] = [
  { id: 'what-is-epc', heading: 'what-h', label: 'What a Domestic EPC is' },
  { id: 'who-needs-epc', heading: 'who-h', label: 'Who needs one' },
  { id: 'epc-process', heading: 'process-h', label: 'How the visit works' },
  { id: 'pricing', heading: 'pricing-h', label: 'What it costs' },
  { id: 'epc-faq', heading: 'questions-h', label: 'EPC questions' },
  { id: 'book', heading: 'in-end-h', label: 'Get my exact quote' },
]

const readNext: NextStep[] = [
  { kicker: 'Same visit', title: 'Floor plans, laser-measured', href: '/services/floor-plans', img: '/illustrations/report-900.webp',
    text: `Added to an EPC it costs up to £${formatPrice(maxBundleSaving)} less than booking both separately.` },
  { kicker: 'Before anything is lodged', title: 'EPC Pre-Assessment', href: '/services/epc-pre-assessment', img: '/guides/house-section-720.webp',
    text: 'The same survey, not lodged. Guidance only, so you see the rating first.' },
  { kicker: `£${site.addOns.improvementPlan} add-on`, title: 'EPC Improvement Plan', href: '/services/epc-improvement-plan', img: '/home/terrace-cutaway-900.webp',
    text: 'Abdul\'s written priorities on top of the recommendations every EPC includes.' },
  { kicker: 'Every price', title: 'Prices for every size', href: '/pricing', go: true, cta: 'See every price',
    text: 'EPC, floor plan, both together and Pre-Assessment, by floor area.' },
]

const schema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Energy Performance Certificate Assessment',
    name: 'Domestic EPC',
    description:
      'Official Energy Performance Certificate for residential properties, required for selling or renting in England and Wales.',
    provider: { '@id': `${site.url}/#business` },
    url: `${site.url}/services/domestic-epc`,
    areaServed: areaServedLondon,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'EPC Pricing',
      // Guide prices, so minPrice: a fixed `price` would misstate the page.
      itemListElement: pricing.map((p) => ({
        '@type': 'Offer',
        name: `Domestic EPC, ${p.areaLabel}`,
        priceSpecification: { '@type': 'PriceSpecification', minPrice: p.epc, priceCurrency: 'GBP' },
      })),
    },
  },
  faqSchema(faqs),
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
      { '@type': 'ListItem', position: 2, name: 'Domestic EPC', item: `${site.url}/services/domestic-epc` },
    ],
  },
]

/** The A to G scale with each band's SAP range (SAP 10.2 Table 14, as components/blog/GuideScale.tsx), drawn for the "what it is" section: an illustration of how the rating reads, not anyone's rating. */
const scale = [
  { b: 'A', r: '92+', w: 34, c: 'var(--epc-a)', light: true },
  { b: 'B', r: '81–91', w: 44, c: 'var(--epc-b)', light: true },
  { b: 'C', r: '69–80', w: 54, c: 'var(--epc-c)' },
  { b: 'D', r: '55–68', w: 64, c: 'var(--epc-d)' },
  { b: 'E', r: '39–54', w: 74, c: 'var(--epc-e)' },
  { b: 'F', r: '21–38', w: 84, c: 'var(--epc-f)', light: true },
  { b: 'G', r: '1–20', w: 94, c: 'var(--epc-g)', light: true },
]

export default function DomesticEpcPage() {
  const reg = site.assessor.accreditations
  return (
    <div className="in sv">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* HERO: answer, the EPC price list as a title block, On this page */}
      <section className="in-hd" aria-labelledby="sv-h1">
        <Container>
          <Crumbs label="Domestic EPC" />
          <div className="in-hd__grid sv-hd">
            <div className="in-hd__copy">
              <p className="in-eyebrow">Domestic EPC certificates</p>
              <h1 id="sv-h1">Domestic EPC certificates in London</h1>
              <p className="in-hd__answer">
                The official certificate for selling or letting your home. One accredited visit, then your EPC on the GOV.UK
                register <b>within 72 hours</b>. Guide prices from <b className="num">£{priceFrom.epc}</b>, with your exact
                price confirmed before you book.
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

            <figure className="in-hd__art sv-art">
              {/* eslint-disable-next-line @next/next/no-img-element -- srcset WebP; next/image is unoptimised on Pages */}
              <img src="/home/terrace-cutaway-1600.webp" srcSet="/home/terrace-cutaway-900.webp 900w, /home/terrace-cutaway-1600.webp 1600w"
                sizes="(max-width: 899px) 92vw, 46vw" width={1600} height={900} fetchPriority="high"
                alt="A London terrace with its front wall cut away, showing the loft, two bedrooms, the front room and the kitchen" />
              <figcaption className="in-hd__cap">What we record: walls, loft, windows, heating and hot water, lighting and floor area, room by room. An AI-generated illustration.</figcaption>
            </figure>

            <PriceBlock id="sv-tb-h" service="epc" column="epc" sourcePage="domestic-epc"
              head={[{ k: 'Service', v: 'Domestic EPC' }, { k: 'Register', v: 'GOV.UK' }, { k: 'Status', v: 'Guide price' }]}
              foot={(
                <>
                  <a className="ld-btn ld-btn--primary ld-btn--block" href={q('pricing')} data-enquiry-cta="pricing">Get my exact quote</a>
                  <p className="in-tb__other">
                    Floor plan from <b className="num">£{priceFrom.floorPlan}</b>, or EPC and floor plan on one visit from{' '}
                    <b className="num">£{priceFrom.bundle}</b>. Same-day lodgement <b>£{SAME_DAY_LODGEMENT_SURCHARGE}</b> extra; a next-day
                    visit with lodgement that day <b>£{NEXT_DAY_VISIT_SURCHARGE}</b> extra. No travel charges, and you pay once the visit is done.
                  </p>
                </>
              )} />

            <OnThisPage sections={sections} />
          </div>
        </Container>
      </section>

      {/* WHAT A DOMESTIC EPC IS */}
      <section className="in-sec in-sec--band" id="what-is-epc" aria-labelledby="what-h">
        <Container>
          <div className="sv-split">
            <div>
              <p className="in-eyebrow">What it is</p>
              <h2 className="in-h2" id="what-h">What a Domestic EPC is</h2>
              <p className="in-lede">
                An Energy Performance Certificate is an official UK government document. It rates a home&apos;s energy
                efficiency from A, the most efficient, to G, the least. It shows the current and potential rating, estimated
                energy costs, and recommendations for improvement.
              </p>
            </div>
            <figure className="sv-scale" aria-labelledby="sv-scale-cap">
              <ol className="sv-scale__bars" aria-label="Energy efficiency rating bands, A to G">
                {scale.map((s) => (
                  <li key={s.b} style={{ '--c': s.c, '--w': `${s.w}%` } as React.CSSProperties} className={s.light ? 'is-light' : undefined}>
                    <span className="sv-scale__bar"><b>{s.b}</b><span className="num">{s.r}</span></span>
                    {s.b === 'D' && <span className="sv-scale__tag">Current</span>}
                    {s.b === 'B' && <span className="sv-scale__tag sv-scale__tag--pot">Potential</span>}
                  </li>
                ))}
              </ol>
              <figcaption id="sv-scale-cap" className="in-hd__cap">How the rating reads: the current band, and the band the home could reach with the recommended improvements. An illustration, not a real rating.</figcaption>
            </figure>
          </div>
          <div className="sv-cols">
            <div>
              <h3 className="sv-k">Your EPC includes</h3>
              <Ticks items={epcContents} />
            </div>
            <div>
              <h3 className="sv-k">Common reasons to arrange an EPC</h3>
              <Ticks items={whenRequired} />
            </div>
          </div>
        </Container>
      </section>

      {/* WHO NEEDS ONE */}
      <section className="in-sec" id="who-needs-epc" aria-labelledby="who-h">
        <Container>
          <p className="in-eyebrow">Who it&apos;s for</p>
          <h2 className="in-h2" id="who-h">Who needs a Domestic EPC</h2>
          <div className="sv-ways">
            {personas.map((p) => (
              <article key={p.title} className="sv-way">
                <span className="sv-way__ico"><Ico name={p.icon} size={28} /></span>
                <h3 className="in-h3">{p.title}</h3>
                <p>{p.body}</p>
                <Link className="in-arrow in-link" href={p.href}>{p.link} <Ico name="arrow-right" size={16} /></Link>
              </article>
            ))}
          </div>
          <p className="in-note sv-after">
            Estate or letting agent instructing on behalf of clients? See our{' '}
            <Link className="in-link" href="/estate-agents">EPC service for agents</Link>, with volume rates and fast turnaround
            on new instructions.
          </p>
        </Container>
      </section>

      {/* HOW THE VISIT WORKS */}
      <section className="in-sec in-sec--band" id="epc-process" aria-labelledby="process-h">
        <Container>
          <div className="sv-visit">
            <div>
              <p className="in-eyebrow">The process</p>
              <h2 className="in-h2" id="process-h">How the visit works</h2>
              <p className="in-lede">From your request to your certificate live on the GOV.UK register, usually within 72 hours.</p>
              {/* eslint-disable-next-line @next/next/no-img-element -- WebP from the homepage; next/image is unoptimised on Pages */}
              <img className="sv-visit__img" src="/home/assessor-visit-900.webp" width={900} height={600} loading="lazy" decoding="async"
                alt="An assessor in a sage jacket measures a London front room with a laser measure, beside a sash window and a column radiator" />
            </div>
            <ol className="sv-steps">
              {process.map((s, i) => (
                <li key={s.title}>
                  <span className="sv-steps__n">{i + 1}</span>
                  <div><h3 className="in-h3">{s.title}</h3><p>{s.body}</p></div>
                </li>
              ))}
            </ol>
          </div>
          <div className="sv-rec">
            <div>
              <h3 className="in-h3">What we record</h3>
              <p className="in-note">
                Our DEA records the following during the on-site visit. No preparation is needed, just normal access to all rooms.
                Paperwork for hidden work, like insulation certificates, helps the rating count it:{' '}
                <Link className="in-link" href="/preparing-for-your-epc">what to have ready</Link>.
              </p>
            </div>
            <Ticks items={assessed} className="sv-rec__list" />
          </div>
        </Container>
      </section>

      {/* WHAT IT COSTS */}
      <section className="in-sec" id="pricing" aria-labelledby="pricing-h">
        <Container>
          <div className="sv-head">
            <div>
              <p className="in-eyebrow">Services and guide pricing</p>
              <h2 className="in-h2" id="pricing-h">What you get, and what it costs</h2>
            </div>
            <p className="in-lede">
              An accredited assessor, an officially lodged certificate, and a price agreed with you before the visit is booked.
              Internal floor area is the main factor in the final figure.
            </p>
          </div>
          <ul className="sv-opts">
            {options.map((o) => (
              <li key={o.name} className="sv-opt">
                <div className="sv-opt__top">
                  <h3 className="sv-opt__h">{o.name}</h3>
                  <p className="sv-opt__p"><small>Guide price from</small><b className="num">£{o.from}</b></p>
                  {o.save && <p className="sv-opt__save">{o.save}</p>}
                </div>
                <p className="sv-opt__lead">{o.lead}</p>
                <Ticks items={o.items} />
                <a className="in-arrow in-link sv-opt__go" href={quoteHref({ service: o.service, sourcePage: 'domestic-epc', ctaId: 'pricing' })}>
                  {o.go} <Ico name="arrow-right" size={16} />
                </a>
              </li>
            ))}
          </ul>

          <div className="sv-costs">
            <div className="sv-ledger">
              <h3 className="sv-k">On top of the size price</h3>
              <dl>
                <div><dt>Standard lodgement<small>On the GOV.UK register within 72 hours of the visit</small></dt><dd className="is-muted">Included</dd></div>
                <div><dt>Same-day lodgement<small>Lodged on the day of the visit</small></dt><dd className="num">+£{SAME_DAY_LODGEMENT_SURCHARGE}</dd></div>
                <div><dt>Next-day visit and lodgement<small>We visit the next day and lodge it that day</small></dt><dd className="num">+£{NEXT_DAY_VISIT_SURCHARGE}</dd></div>
                <div><dt>EPC recommendation report<small>Software-generated, on every EPC where improvements are possible</small></dt><dd className="is-muted">Included</dd></div>
                <div>
                  <dt>
                    <Link className="in-link" href="/services/epc-improvement-plan">EPC Improvement Plan</Link>
                    <small>Optional: Abdul&apos;s personalised plan with the full Elmhurst Energy Report</small>
                  </dt>
                  <dd className="num">+£{site.addOns.improvementPlan}</dd>
                </div>
                <div><dt>Travel or call-out<small>Anywhere in the 32 boroughs and the City</small></dt><dd className="is-muted">None</dd></div>
              </dl>
              <p className="in-note">The faster options cover visits in our standard hours (Mon–Sun, 8am–8pm), and availability is confirmed before booking.</p>
            </div>
            <div className="sv-aside">
              <div className="sv-callout">
                <p className="sv-callout__h">Your exact quote is confirmed before booking</p>
                <p>
                  Guide prices are based mainly on internal floor area. Extensions, loft conversions, unusual layouts and multiple
                  floors can affect the final figure, so you get the real number first, in writing.
                </p>
                <a className="in-arrow in-link" href={q('inline')}>Get my exact quote <Ico name="arrow-right" size={16} /></a>
              </div>
              <div className="sv-callout sv-callout--quiet">
                <p className="sv-callout__h">Don&apos;t want it on the public register?</p>
                <p>
                  The <Link className="in-link" href="/services/epc-pre-assessment">EPC Pre-Assessment</Link> is the same survey,
                  not lodged, from <b className="num">£{priceFrom.preAssessment}</b> with a personalised improvement plan included.
                  It is guidance only, not an EPC.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Our promise, directly under the prices (Abdul 24/10) */}
      <OurPromise />

      {/* QUESTIONS */}
      <section className="in-sec" id="epc-faq" aria-labelledby="questions-h">
        <Container className="sv-faqwrap">
          <div>
            <p className="in-eyebrow">Common questions</p>
            <h2 className="in-h2" id="questions-h">Domestic EPC questions</h2>
            <p className="in-note sv-faqside">
              Not covered here? Call <a className="in-link num" href={site.phoneHref}>{site.phone}</a> or{' '}
              <a className="in-link" href={site.whatsappHref} target="_blank" rel="noopener">WhatsApp us</a>, {site.hours}. Or read
              the <Link className="in-link" href="/faq">full EPC FAQ</Link>.
            </p>
          </div>
          <FaqList faqs={faqs} />
        </Container>
      </section>

      <ReadNext steps={readNext} />

      <div id="book">
        <InnerEnding variant="a" source="domestic-epc"
          eyebrow={<>Domestic EPC · from <span className="num">£{priceFrom.epc}</span></>}
          heading="Ready for your EPC quote?"
          text="Send the address and the size. We confirm your exact price and a visit time that suits you before you book." />
      </div>
    </div>
  )
}
