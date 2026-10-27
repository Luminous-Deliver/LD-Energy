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
  site, pricing, formatPrice, bundleSaving, maxBundleSaving, priceFrom, defaultOgImage, floorPlanDisclaimer,
} from '@/lib/site'
import { areaServedLondon } from '@/lib/boroughs'
import { quoteHref, type QuoteService } from '@/lib/quote-context'
import type { AreaChoice } from '@/lib/floor-area'
import { Crumbs, PriceBlock, FaqList, faqSchema, Ticks, type ServiceFaq } from '../ServiceParts'
import '@/app/inner.css'
import '../services.css'

/*
 * /services/floor-plans, rebuilt 24/10/2026 on the inner-page parts, as /services/domestic-epc: the floor plan column of
 * the price list as a title block, the RICS disclaimer wherever a plan is offered, the saving against booking separately
 * from bundleSaving(). Title and descriptions stay frozen until 14/12; only the H1 changes. Section ids kept.
 * Parity: Abdul-2 projects/ld-energy-redesign-2026-10/research/floor-plans-parity-2026-10-24.md
 */
export const metadata: Metadata = {
  title: `Property Floor Plans London | From £${priceFrom.floorPlan}`,
  description: `Professional property floor plans across London. Laser-measured, high-resolution files for estate agents. Guide prices from £${priceFrom.floorPlan}, better value when booked alongside an EPC.`,
  alternates: { canonical: `${site.url}/services/floor-plans` },
  openGraph: {
    images: [defaultOgImage],
    title: `Property Floor Plans London | From £${priceFrom.floorPlan} | L&D Energy`,
    description: `Professional property floor plans across London. Laser-measured, high-resolution files for estate agents and property marketing. Better value when booked alongside an EPC.`,
    url: `${site.url}/services/floor-plans`,
  },
  twitter: {
    images: [defaultOgImage.url],
    title: `Property Floor Plans London | From £${priceFrom.floorPlan}`,
    description:
      'Professional property floor plans across London. High-resolution files for estate agents. Better value bundled with an EPC.',
  },
}

const q = (ctaId: 'hero' | 'pricing' | 'inline' | 'bottom') => quoteHref({ service: 'floor-plan', sourcePage: 'floor-plans', ctaId })
const save = formatPrice(maxBundleSaving)

const included = [
  'On-site laser measurements, with approximate dimensions shown',
  'Individual room dimensions',
  'Total floor area (gross internal area)',
  'Room labels and layout',
  'High-resolution image file',
  'Multiple format options (JPEG, PDF)',
  'Suitable for portals (Rightmove, Zoopla, OnTheMarket)',
  'Suitable for printed brochures',
]

const process = [
  { title: 'Request a quote', body: 'Contact us by phone, WhatsApp, email, or use our online form. Tell us your property address and preferred time.' },
  { title: 'We visit and measure', body: 'Our assessor visits at your chosen time and measures every room using laser distance tools.' },
  { title: 'Floor plan drawn', body: 'Measurements are drafted into a clean, professional floor plan using specialist software.' },
  { title: 'Delivered to your inbox', body: 'High-resolution JPEG and PDF files emailed to you within 72 hours of the assessment.' },
]

const faqs: ServiceFaq[] = [
  {
    q: 'How much does a floor plan cost?',
    a: `Floor plans have guide prices from £${priceFrom.floorPlan}, priced on the same internal floor-area bands as the EPC. Booking an EPC and floor plan together costs less than booking them separately, up to £${save} less, because we measure the property during the assessment anyway, so it is one visit rather than two. Your exact quote is confirmed before booking.`,
  },
  {
    q: 'Is the floor plan to scale?',
    a: `No. ${floorPlanDisclaimer} Plans are not architectural drawings or legal boundaries, and EPC floor area may differ because EPC measurement conventions differ.`,
  },
  {
    q: 'What do I get, and when?',
    a: 'High-resolution JPEG and PDF files, emailed to you within 72 hours of the assessment. They show room dimensions, total floor area and room labels, and suit Rightmove, Zoopla, OnTheMarket and printed brochures.',
  },
  {
    q: 'Can you draw one for a licence application?',
    a: 'If your council asks for one with a licence application, we draw the floor plan on the same visit as the EPC.',
  },
  {
    q: 'I already have an EPC. Can I book just the floor plan?',
    a: `Yes. A floor plan on its own starts from £${priceFrom.floorPlan}. If the EPC is due too, booking both on one visit costs up to £${save} less.`,
  },
]

const sections: PageSection[] = [
  { id: 'why-floor-plans', heading: 'why-h', label: 'Why floor plans' },
  { id: 'included', heading: 'included-h', label: 'What’s included' },
  { id: 'process', heading: 'process-h', label: 'How it works' },
  { id: 'pricing', heading: 'pricing-h', label: 'Floor plan pricing' },
  { id: 'floor-plan-faq', heading: 'questions-h', label: 'Floor plan questions' },
  { id: 'book', heading: 'in-end-h', label: 'Get my exact quote' },
]

const readNext: NextStep[] = [
  { kicker: 'Same visit', title: 'What a Domestic EPC involves', href: '/services/domestic-epc', img: '/guides/assessor-room-720.webp',
    text: 'The visit, what we record and how the rating is worked out.' },
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
    serviceType: 'Property Floor Plan',
    name: 'Floor Plans',
    description:
      'Professionally measured illustrative floor plans for property marketing across London, with approximate dimensions. Not architectural or legal plans.',
    provider: { '@id': `${site.url}/#business` },
    url: `${site.url}/services/floor-plans`,
    areaServed: areaServedLondon,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Floor Plan Pricing',
      itemListElement: pricing.map((p) => ({
        '@type': 'Offer',
        name: `Floor plan, ${p.areaLabel}`,
        priceSpecification: { '@type': 'PriceSpecification', minPrice: p.floorPlan, priceCurrency: 'GBP' },
      })),
    },
  },
  faqSchema(faqs),
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
      { '@type': 'ListItem', position: 2, name: 'Floor Plans', item: `${site.url}/services/floor-plans` },
    ],
  },
]

function Cell({ service, label, area, price, from, note }: { service: QuoteService; label: string; area: string; price: number; from?: boolean; note?: string }) {
  return (
    <td>
      <a href={quoteHref({ service, area: area as AreaChoice, sourcePage: 'floor-plans', ctaId: 'pricing' })} data-label={label}>
        <span className="sv-ptable__p num">{from && <small>from</small>}£{formatPrice(price)}</span>
        {note && <span className="sv-ptable__s">{note}</span>}
      </a>
    </td>
  )
}

export default function FloorPlansPage() {
  const reg = site.assessor.accreditations
  return (
    <div className="in sv">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* HERO */}
      <section className="in-hd" aria-labelledby="sv-h1">
        <Container>
          <Crumbs label="Floor Plans" />
          <div className="in-hd__grid sv-hd">
            <div className="in-hd__copy">
              <p className="in-eyebrow">Floor plans</p>
              <h1 id="sv-h1">Professional property floor plans</h1>
              <p className="in-hd__answer">
                Laser-measured floor plans for property marketing, as JPG and PDF <b>within 72 hours</b>. Guide prices from{' '}
                <b className="num">£{priceFrom.floorPlan}</b>, and up to <b className="num">£{save}</b> less when booked together
                with an EPC on the same visit.
              </p>
              <div className="in-hd__acts">
                <a className="ld-btn ld-btn--primary" href={q('hero')} data-enquiry-cta="hero">Get my exact quote</a>
                <a className="in-wa" href={site.whatsappHref} target="_blank" rel="noopener noreferrer"><Ico name="message" size={18} /> Ask on WhatsApp</a>
              </div>
              <p className="in-by">
                <ShieldCheck size={18} className="i" aria-hidden="true" />
                <span>
                  Measured on site by <Link href="/about"><b>{site.assessor.name}</b></Link>, {reg.map((a) => a.short).join(' and ')} accredited.{' '}
                  <a href={site.assessor.verifyUrl} target="_blank" rel="noopener">Check the GOV.UK register</a>
                </span>
              </p>
            </div>

            <figure className="in-hd__art sv-art">
              {/* eslint-disable-next-line @next/next/no-img-element -- srcset WebP; next/image is unoptimised on Pages */}
              <img src="/illustrations/report-1600.webp" srcSet="/illustrations/report-900.webp 900w, /illustrations/report-1600.webp 1600w"
                sizes="(max-width: 899px) 92vw, 46vw" width={1600} height={1200} fetchPriority="high"
                alt="A drawn floor plan of a flat on a sheet of paper, beside a tablet showing the EPC rating colours, a pen and a set of keys" />
              <figcaption className="in-hd__cap">One visit, two documents: the floor plan and the EPC. An AI-generated illustration, not one of our plans.</figcaption>
            </figure>

            <PriceBlock id="sv-tb-h" service="floor-plan" column="floorPlan" sourcePage="floor-plans"
              head={[{ k: 'Service', v: 'Floor plan' }, { k: 'Files', v: 'JPG and PDF' }, { k: 'Status', v: 'Guide price' }]}
              foot={(
                <>
                  <a className="ld-btn ld-btn--primary ld-btn--block" href={q('pricing')} data-enquiry-cta="pricing">Get my exact quote</a>
                  <p className="in-tb__other">
                    EPC and floor plan on one visit from <b className="num">£{priceFrom.bundle}</b>, up to <b className="num">£{save}</b> less
                    than booking both separately. No travel charges, and you pay once the visit is done.
                  </p>
                  <p className="in-note">{floorPlanDisclaimer}</p>
                </>
              )} />

            <OnThisPage sections={sections} />
          </div>
        </Container>
      </section>

      {/* WHY FLOOR PLANS */}
      <section className="in-sec in-sec--band" id="why-floor-plans" aria-labelledby="why-h">
        <Container>
          <p className="in-eyebrow">Why they matter</p>
          <h2 className="in-h2" id="why-h">Why floor plans</h2>
          <p className="in-lede">
            Floor plans help buyers and tenants understand the layout before viewing. They show room dimensions, floor area and key
            features to support a property listing.
          </p>
          <div className="sv-ways">
            <article className="sv-way">
              <span className="sv-way__ico"><Ico name="flat" size={28} /></span>
              <h3 className="in-h3">Booking for a branch</h3>
              <p>One home or a list, with the plan and the EPC from the same visit.</p>
              <Link className="in-arrow in-link" href="/estate-agents">EPCs and floor plans for agents <Ico name="arrow-right" size={16} /></Link>
            </article>
            <article className="sv-way">
              <span className="sv-way__ico"><Ico name="key" size={28} /></span>
              <h3 className="in-h3">Letting a licensed home</h3>
              <p>Letting a home your council licenses? Landlords can add a floor plan for a licence application to the EPC visit.</p>
              <Link className="in-arrow in-link" href="/landlords#portfolio">Floor plan for a licence application <Ico name="arrow-right" size={16} /></Link>
            </article>
            <article className="sv-way">
              <span className="sv-way__ico"><Ico name="house" size={28} /></span>
              <h3 className="in-h3">Selling your home</h3>
              <p>A plan for the listing, measured on the same visit as the EPC you need before marketing.</p>
              <Link className="in-arrow in-link" href="/sellers">EPCs for sellers <Ico name="arrow-right" size={16} /></Link>
            </article>
          </div>
        </Container>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="in-sec" id="included" aria-labelledby="included-h">
        <Container className="sv-two">
          <div>
            <p className="in-eyebrow">The deliverable</p>
            <h2 className="in-h2" id="included-h">What&apos;s included</h2>
            <p className="in-lede">Every floor plan we produce is measured on-site with laser tools and drawn in professional software.</p>
            <div className="sv-callout sv-callout--warn sv-gap">
              <p className="sv-callout__h">Before you rely on the measurements</p>
              <p>
                {floorPlanDisclaimer} Plans are not architectural drawings or legal boundaries, and EPC floor area may differ because
                EPC measurement conventions differ. Check dimensions independently before relying on them for a purchase, fit-out or
                building work.
              </p>
            </div>
          </div>
          <div>
            <h3 className="sv-k">Every plan comes with</h3>
            <Ticks items={included} />
          </div>
        </Container>
      </section>

      {/* HOW IT WORKS */}
      <section className="in-sec in-sec--band" id="process" aria-labelledby="process-h">
        <Container>
          <div className="sv-visit">
            <div>
              <p className="in-eyebrow">The process</p>
              <h2 className="in-h2" id="process-h">How it works</h2>
              <p className="in-lede">Every room is measured with a laser on the visit, then drawn up and emailed to you.</p>
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
        </Container>
      </section>

      {/* PRICING */}
      <section className="in-sec" id="pricing" aria-labelledby="pricing-h">
        <Container>
          <div className="sv-head">
            <div>
              <p className="in-eyebrow">Pricing</p>
              <h2 className="in-h2" id="pricing-h">Floor plan pricing</h2>
            </div>
            <p className="in-lede">
              Guide prices only: your exact quote is confirmed before booking. Internal floor area sets the band; bedrooms are shown
              only as a rough guide. Booking a floor plan alongside an EPC costs less than booking them separately, because we
              measure the property during the assessment anyway.
            </p>
          </div>
          <div className="in-tscroll">
            <table className="sv-ptable">
              <thead>
                <tr>
                  <th scope="col">Internal floor area</th>
                  <th scope="col">EPC</th>
                  <th scope="col">Floor plan</th>
                  <th scope="col">EPC and floor plan</th>
                </tr>
              </thead>
              <tbody>
                {pricing.map((row) => (
                  <tr key={row.id}>
                    <th scope="row">{row.areaLabel}<small>{row.typicalLabel}</small></th>
                    <Cell service="epc" label="EPC" area={row.id} price={row.epc} from={row.startingPrice} />
                    <Cell service="floor-plan" label="Floor plan" area={row.id} price={row.floorPlan} from={row.startingPrice} />
                    <Cell service="bundle" label="Both" area={row.id} price={row.bundle} from={row.startingPrice}
                      note={row.startingPrice ? undefined : `Save £${formatPrice(bundleSaving(row))}`} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="sv-costs">
            <p className="in-note">
              Each price opens the quote with that service and size filled in. The largest band shows starting prices, so it carries
              no saving. Savings are the difference between the two services booked separately and booked together.
            </p>
            <div className="sv-callout">
              <p className="sv-callout__h">Better value together</p>
              <p>Book both services in one visit and save up to <b className="num">£{save}</b>: one appointment, both services completed together.</p>
              <a className="in-arrow in-link" href={quoteHref({ service: 'bundle', sourcePage: 'floor-plans', ctaId: 'inline' })}>
                Get a quote for both <Ico name="arrow-right" size={16} />
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* Our promise, under the prices (Abdul 24/10): the EPC in a bundle is lodged */}
      <OurPromise />

      {/* QUESTIONS */}
      <section className="in-sec" id="floor-plan-faq" aria-labelledby="questions-h">
        <Container className="sv-faqwrap">
          <div>
            <p className="in-eyebrow">Common questions</p>
            <h2 className="in-h2" id="questions-h">Floor plan questions</h2>
            <p className="in-note sv-faqside">
              Not covered here? Call <a className="in-link num" href={site.phoneHref}>{site.phone}</a> or{' '}
              <a className="in-link" href={site.whatsappHref} target="_blank" rel="noopener">WhatsApp us</a>, {site.hours}.
            </p>
          </div>
          <FaqList faqs={faqs} />
        </Container>
      </section>

      <ReadNext steps={readNext} />

      <div id="book">
        <InnerEnding variant="a" source="floor-plans" quote={q('bottom')}
          eyebrow={<>Floor plans · from <span className="num">£{priceFrom.floorPlan}</span></>}
          heading="Ready for your floor plan quote?"
          text="Request your exact quote online or call us. We'll arrange a visit at a time that suits you." />
      </div>
    </div>
  )
}
