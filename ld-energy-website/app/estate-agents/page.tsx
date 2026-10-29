import type { Metadata } from 'next'
import Link from 'next/link'
import { OurPromise } from '@/components/sections/OurPromise'
import { ChevronDown, ShieldCheck } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Ico } from '@/components/sections/home/HomeIcon'
import { OnThisPage, type PageSection } from '@/components/inner/OnThisPage'
import { RevealOnScroll } from '@/components/inner/RevealOnScroll'
import { innerReveals } from '@/components/inner/innerReveals'
import { ReadNext, type NextStep } from '@/components/inner/ReadNext'
import { InnerEnding } from '@/components/inner/InnerEnding'
import {
  site, pricing, priceFrom, maxBundleSaving, defaultOgImage, insurance, floorPlanDisclaimer, portfolioMinHomes, portfolioRatesText,
  SAME_DAY_LODGEMENT_SURCHARGE, NEXT_DAY_VISIT_SURCHARGE,
} from '@/lib/site'
import { areaServedLondon } from '@/lib/boroughs'
import { quoteHref } from '@/lib/quote-context'
import type { AreaChoice } from '@/lib/floor-area'
import '@/app/inner.css'
import '@/app/landlords/landlords.css'
import './estate-agents.css'

/*
 * /estate-agents, rebuilt 24/10/2026 on the /landlords template (approved 23/10): hero with the title-block price list
 * and On this page, the agency sections, Our promise, FAQ, Read next and ending A. One name for the audience, "Agents"
 * (decision 23/10); the URL stays. Title and descriptions stay frozen until 14/12; only the H1 changes, to sentence
 * case. Parity record: Abdul-2 projects/ld-energy-redesign-2026-10/research/estate-agents-parity-2026-10-24.md.
 */
export const metadata: Metadata = {
  title: 'EPC Provider for Estate & Letting Agents London',
  description:
    'Reliable EPC and floor plan partner for London estate and letting agents. Fast turnaround on new instructions, volume rates, direct line to your assessor. Taking on new agencies now.',
  alternates: { canonical: `${site.url}/estate-agents` },
  openGraph: {
    images: [defaultOgImage],
    title: 'EPC Provider for Estate & Letting Agents London | L&D Energy',
    description:
      'Reliable EPC and floor plan partner for London estate and letting agents. Fast turnaround on new instructions, volume rates, direct line to your assessor.',
    url: `${site.url}/estate-agents`,
  },
  twitter: {
    images: [defaultOgImage.url],
    title: 'EPC Provider for Estate & Letting Agents London',
    description:
      'Fast EPCs and floor plans for London agents. Volume rates, quick turnaround on new instructions. Taking on new agencies now.',
  },
}

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
const portfolioWord = WORDS[portfolioMinHomes] ?? String(portfolioMinHomes)
const Portfolio = portfolioWord.charAt(0).toUpperCase() + portfolioWord.slice(1)

const listHref = `${site.whatsappHref}?text=${encodeURIComponent('Hi, I\'m an agent and I\'d like a quote for EPCs on these addresses:')}`
const q = (ctaId: 'hero' | 'pricing' | 'inline' | 'bottom') => quoteHref({ service: 'epc', sourcePage: 'estate-agents', ctaId })
const bulk = (ctaId: 'hero' | 'pricing' | 'inline' | 'bottom') => quoteHref({ service: 'bulk', sourcePage: 'estate-agents', ctaId })

/** The six reasons from the old page, word for word apart from sentence case. */
const whyAgents: { icon: Parameters<typeof Ico>[0]['name']; title: string; body: string }[] = [
  { icon: 'clock', title: 'Fast turnaround on new instructions',
    body: 'Appointments 7 days a week, 8am–8pm, with certificates lodged within 72 hours, with same-day lodgement and next-day visits available.' },
  { icon: 'floor-plan', title: 'EPC and floor plan in one visit',
    body: 'We measure the property anyway during the assessment, so booking a floor plan alongside the EPC costs less than booking it separately. One appointment, both listing essentials.' },
  { icon: 'pound', title: 'Portfolio rates, published',
    body: portfolioRatesText },
  { icon: 'phone', title: 'A direct line, not a call centre',
    body: 'You deal with the accredited assessor directly, by phone or WhatsApp, with no chasing for certificates.' },
  { icon: 'key', title: 'Vendor and tenant-friendly booking',
    body: 'Give us the occupier’s details and we’ll arrange access directly, including evenings and weekends, so your negotiators stay off the phone.' },
  { icon: 'mail', title: 'Certificates sent where you need them',
    body: 'Lodged on the government EPC Register, with the certificate link sent straight to your branch inbox (with the client’s permission), ready to attach to the listing.' },
]

const steps = [
  { step: 'Send the instruction', detail: 'Address, property size, and the occupier’s contact details, by phone, WhatsApp, or email.' },
  { step: 'We arrange access', detail: 'We contact the vendor or tenant directly and confirm the appointment during our opening hours, Mon–Sun 8am–8pm.' },
  { step: 'Assessment done', detail: '45 to 90 minutes on site, evenings and weekends included.' },
  { step: 'Certificate lodged', detail: 'Lodged on the GOV.UK EPC register within 72 hours, or the same day for urgent listings, with the certificate link sent to your branch once live.' },
]

const listingNeeds = [
  'Official EPC lodged on the government register',
  'Professional floor plan, discounted with an EPC',
  'High-resolution files sized for Rightmove and Zoopla',
  `Same-day lodgement (+£${SAME_DAY_LODGEMENT_SURCHARGE}) or a next-day visit (+£${NEXT_DAY_VISIT_SURCHARGE}) for urgent instructions`,
  'Evening and weekend access appointments',
  'One supplier for all 32 boroughs, no travel charges',
]

const faqs: { q: string; a: string }[] = [
  {
    q: 'Do you take on new estate and letting agencies?',
    a: 'Yes, we are actively taking on new agency clients across London. Whether you need a reliable EPC supplier for occasional instructions or a regular partner for a busy branch, get in touch and we’ll agree turnaround expectations and agency rates that work for your volume.',
  },
  {
    q: 'What are your rates for agents?',
    a: `Guide prices start from £${pricing[0].epc} per EPC. ${portfolioRatesText} An EPC and floor plan booked together for the same visit costs less than booking them separately.`,
  },
  {
    q: 'How quickly can you assess a new instruction?',
    a: 'Tell us your listing deadline and access requirements. We confirm an available appointment and delivery timing before accepting the instruction. Next-day visits are available. Standard lodgement is within 72 hours of the visit; same-day lodgement and next-day visits are agreed before booking.',
  },
  {
    q: 'Can you deal with the vendor or tenant directly?',
    a: 'Yes. Send us the occupier’s contact details and we’ll arrange access, confirm the appointment, and handle any rescheduling directly, keeping your negotiators free. You stay copied in as much or as little as you like.',
  },
  {
    q: 'Can you send certificates straight to our branch?',
    a: 'Yes. With the client’s permission we send the certificate link directly to your branch inbox as soon as it’s lodged on the government EPC Register, so there’s no forwarding or chasing paperwork.',
  },
  {
    q: 'Do you cover our whole patch?',
    a: `We cover all 32 London boroughs and the City of London from our base in ${site.address.locality}, East London, with no travel charges. If your branches span multiple boroughs, one supplier covers them all.`,
  },
]

// ids kept from the old page (why-agents, how-it-works, agent-faq); nothing in the repo links to them, but they cost nothing
const sections: PageSection[] = [
  { id: 'why-agents', heading: 'why-agents-h', label: 'Why London agents work with us' },
  { id: 'how-it-works', heading: 'how-it-works-h', label: 'How instructions work' },
  { id: 'portfolio', heading: 'portfolio-h', label: 'One home or a list' },
  { id: 'agent-faq', heading: 'agent-faq-h', label: 'Agent questions' },
  { id: 'book', heading: 'in-end-h', label: 'Get a quote' },
]

const readNext: NextStep[] = [
  { kicker: 'Letting for a landlord', title: 'EPCs for London landlords', href: '/landlords',
    text: 'Where a rental stands against the E minimum, and what to do if it comes back F or G.' },
  { kicker: 'Selling for a vendor', title: 'EPCs for selling a home', href: '/sellers', img: '/inner/rn-seller.svg',
    text: 'When the EPC has to be commissioned, and the time limits once a home is on the market.' },
  { kicker: 'Letting and MEES', title: 'The rules and the fines, in full', href: '/blog/mees-regulations-2026',
    text: 'Who the minimum covers, how exemptions work and what councils can charge.' },
  { kicker: 'Every price', title: 'Prices by floor area', href: '/pricing', go: true, cta: 'Pricing',
    text: 'EPC, floor plan and both together, for every size, with the extras.' },
]

const schema = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
      { '@type': 'ListItem', position: 2, name: 'Agents', item: `${site.url}/estate-agents` },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Energy Performance Certificate',
    name: 'EPC & Floor Plan Service for Estate and Letting Agents',
    description:
      'Trade EPC and floor plan service for London estate and letting agents: fast turnaround on new instructions, volume rates, direct assessor contact, and the certificate link sent straight to your branch once lodged on the GOV.UK EPC Register.',
    provider: { '@id': `${site.url}/#business` },
    url: `${site.url}/estate-agents`,
    areaServed: areaServedLondon,
    audience: { '@type': 'BusinessAudience', name: 'Estate agents and letting agents' },
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

export default function EstateAgentsPage() {
  const reg = site.assessor.accreditations
  return (
    <div className="in lp ea">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* HERO: the /landlords hero with the listing drawing */}
      <section className="in-hd" aria-labelledby="ea-h1">
        <Container>
          <nav className="in-crumbs" aria-label="Breadcrumb">
            <ol>
              <li><Link href="/">Home</Link><span className="sep" aria-hidden="true">›</span></li>
              <li><span aria-current="page">Agents</span></li>
            </ol>
          </nav>
          <div className="in-hd__grid lp-hd">
            <div className="in-hd__copy">
              <p className="in-eyebrow">For estate and letting agents</p>
              <h1 id="ea-h1">Your EPC partner for new instructions</h1>
              <p className="in-hd__answer">
                Book for a vendor or a landlord, one home or a list. We arrange access with the occupier, and the certificate
                link comes straight to your branch once it&apos;s on the GOV.UK register, <b>within 72 hours</b>.
              </p>
              <p className="ea-avail"><span className="ea-avail__dot" aria-hidden="true" />Taking on new agencies across all 32 boroughs</p>
              <div className="in-hd__acts">
                <a className="ld-btn ld-btn--primary" href={q('hero')} data-enquiry-cta="hero">Get my exact quote</a>
                <a className="in-wa" href={listHref} target="_blank" rel="noopener noreferrer"><Ico name="message" size={18} /> WhatsApp a list of addresses</a>
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
              <img src="/illustrations/report-1600.webp" srcSet="/illustrations/report-900.webp 900w, /illustrations/report-1600.webp 1600w"
                sizes="(max-width: 899px) 92vw, 46vw" width={1600} height={1200} fetchPriority="high"
                alt="A tablet showing the EPC rating bands beside a drawn floor plan, a set of keys and a pen" />
              <figcaption className="in-hd__cap">What a listing needs from us: the EPC and the floor plan, from one visit. An AI-generated illustration.</figcaption>
            </figure>

            <aside className="in-tb lp-tb" aria-labelledby="ea-tb-h">
              <div className="in-tb__head">
                <div><span>Service</span><b id="ea-tb-h">Domestic EPC</b></div>
                <div><span>For</span><b>Agents</b></div>
                <div><span>Status</span><b>Guide price</b></div>
              </div>
              <div className="in-tb__cols" aria-hidden="true"><span>Floor area</span><span>Price</span><span /></div>
              <ul className="in-tb__rows">
                {pricing.map((b) => (
                  <li key={b.id}>
                    <a href={quoteHref({ service: 'epc', area: b.id as AreaChoice, sourcePage: 'estate-agents', ctaId: 'pricing' })}>
                      <span className="in-tb__s">{b.areaLabel}<small>{b.typicalLabel}</small></span>
                      <span className="in-tb__p num">{b.startingPrice && <small>from</small>}£{b.epc}</span>
                      <Ico name="arrow-right" size={16} />
                    </a>
                  </li>
                ))}
                <li>
                  <a className="is-common" href={bulk('pricing')}>
                    <span className="in-tb__s">{Portfolio} homes or more<small>Portfolio rates, each home priced by its size</small></span>
                    <span className="in-tb__p in-tb__p--tbc">Send the list</span>
                    <Ico name="arrow-right" size={16} />
                  </a>
                </li>
              </ul>
              <div className="in-tb__foot">
                <a className="ld-btn ld-btn--primary ld-btn--block" href={q('pricing')} data-enquiry-cta="pricing">Get my exact quote</a>
                <p className="in-tb__other">
                  Floor plan from <b className="num">£{priceFrom.floorPlan}</b>, or EPC and floor plan on one visit from{' '}
                  <b className="num">£{priceFrom.bundle}</b>. Same-day lodgement <b>£{SAME_DAY_LODGEMENT_SURCHARGE}</b> extra; a next-day
                  visit with lodgement that day <b>£{NEXT_DAY_VISIT_SURCHARGE}</b> extra. No travel charges.
                </p>
              </div>
            </aside>

            <OnThisPage sections={sections} />
          </div>
        </Container>
      </section>

      {/* WHY AGENTS WORK WITH US */}
      <section className="in-sec in-sec--band" id="why-agents" aria-labelledby="why-agents-h">
        <Container>
          <p className="in-eyebrow">Built for agency workflows</p>
          <h2 className="in-h2" id="why-agents-h">Why London agents work with us</h2>
          <p className="in-lede">
            We currently have capacity for new estate and letting agency clients across London, from occasional one-off
            instructions to regular branch volume. Agree a rate card once, then send instructions by phone, WhatsApp or email
            whenever you need us.
          </p>
          <ul className="ea-why">
            {whyAgents.map((w) => (
              <li key={w.title}>
                <span className="ea-why__ico"><Ico name={w.icon} size={24} /></span>
                <h3 className="in-h3">{w.title}</h3>
                <p>{w.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* HOW INSTRUCTIONS WORK */}
      <section className="in-sec" id="how-it-works" aria-labelledby="how-it-works-h">
        <Container className="lp-visit">
          <div>
            <p className="in-eyebrow">Simple by design</p>
            <h2 className="in-h2" id="how-it-works-h">How instructions work</h2>
            <p className="in-lede">
              No portals, no forms, no friction. Send the instruction the way your branch already works, and we handle everything
              from access to lodgement.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element -- WebP from the prep page; next/image is unoptimised on Pages */}
            <img className="lp-visit__img ea-access" src="/illustrations/access-900.webp" width={900} height={500} loading="lazy" decoding="async"
              alt="A London terrace drawn with its side cut away: a ladder up to the open loft hatch, the boiler, two bedrooms, the front room and the kitchen" />
          </div>
          <ol className="lp-steps">
            {steps.map((s, i) => (
              <li key={s.step}><span className="lp-steps__n">{i + 1}</span><div><h3 className="in-h3">{s.step}</h3><p>{s.detail}</p></div></li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ONE HOME OR A LIST */}
      <section className="in-sec in-sec--band" id="portfolio" aria-labelledby="portfolio-h">
        <Container>
          <p className="in-eyebrow">How you book</p>
          <h2 className="in-h2" id="portfolio-h">One home or a list</h2>
          <div className="lp-ways">
            <article className="lp-way">
              <span className="lp-way__ico"><Ico name="house" size={28} /></span>
              <h3 className="in-h3">One home</h3>
              <p>
                For a vendor or a landlord. Send the address, the size and the occupier&apos;s details. We confirm the price and a time,
                and arrange access with them.
              </p>
              <a className="in-arrow in-link" href={q('inline')}>Get my exact quote <Ico name="arrow-right" size={16} /></a>
            </article>
            <article className="lp-way">
              <span className="lp-way__ico"><Ico name="flat" size={28} /></span>
              <h3 className="in-h3">{Portfolio} homes or more</h3>
              <p>Send the addresses in one message. We price each home by its size, group the visits by area and send every certificate to your branch.</p>
              {/* Abdul's approved portfolio rates (24/10), word for word from lib/site.ts */}
              <p className="lp-way__rates">{portfolioRatesText}</p>
              <a className="in-arrow in-link" href={listHref} target="_blank" rel="noopener noreferrer">WhatsApp the list <Ico name="arrow-right" size={16} /></a>
            </article>
            <article className="lp-way">
              <span className="lp-way__ico"><Ico name="floor-plan" size={28} /></span>
              <h3 className="in-h3">A floor plan with the EPC</h3>
              <p>
                Laser-measured on the same visit and drawn to Rightmove and Zoopla spec, as high-resolution JPG and PDF. From{' '}
                <b className="num">£{priceFrom.bundle}</b> with the EPC, up to £{maxBundleSaving} less than booking them separately.
              </p>
              <p className="lp-way__note">{floorPlanDisclaimer}</p>
              <Link className="in-arrow in-link" href="/services/floor-plans">Floor Plans <Ico name="arrow-right" size={16} /></Link>
            </article>
          </div>

          <div className="ea-needs">
            <h3 className="in-h3">Everything a listing needs</h3>
            <ul className="in-ticks">
              {listingNeeds.map((item) => <li key={item}><Ico name="check" size={20} /><span>{item}</span></li>)}
            </ul>
            <p className="in-note">
              See our <Link className="in-link" href="/services/domestic-epc">Domestic EPC service</Link> and{' '}
              <Link className="in-link" href="/services/floor-plans">floor plans</Link> for full details, or{' '}
              <Link className="in-link" href="/pricing">guide pricing</Link> by property size.
            </p>
          </div>

          {/* Not bookable yet: no link, no price, no CTA, and deliberately absent from this page's Service schema. */}
          <p className="ea-soon">
            <span className="ea-soon__tag">Coming soon</span>
            <span>
              <b>Property photography.</b> Professional property photography for listings on Rightmove, Zoopla and other property
              portals. Intended for agencies that may eventually want EPCs, floor plans and listing-ready photography handled in one visit.
            </span>
          </p>
        </Container>
      </section>

      {/* PROOF */}
      <section className="in-sec" aria-labelledby="proof-h">
        <Container>
          <p className="in-eyebrow">Check us before you instruct</p>
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
      <section className="in-sec" id="agent-faq" aria-labelledby="agent-faq-h">
        <Container className="lp-faqwrap">
          <div>
            <p className="in-eyebrow">Agent questions</p>
            <h2 className="in-h2" id="agent-faq-h">Before you send an instruction</h2>
            <p className="in-note lp-faqside">
              Not covered here? <a className="in-link" href={site.whatsappHref} target="_blank" rel="noopener">WhatsApp us</a>, or call{' '}
              <a className="in-link num" href={site.phoneHref}>{site.phone}</a>.
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
      <RevealOnScroll {...innerReveals('.ea', { lists: ['.ea-why', '.lp-steps', '.lp-ways', '.lp-trust'], blocks: ['.ea-needs', '.ea-soon'] })} />

      <div id="book">
        <InnerEnding variant="a" source="estate-agents" quote={bulk('bottom')}
          eyebrow={<>Agents · from <span className="num">£{priceFrom.epc}</span></>}
          heading="Add a reliable EPC supplier to your panel"
          text="Send an enquiry with your typical volume and we'll confirm an agency quote."
          whatsapp={{ href: listHref, label: 'Or WhatsApp a list of addresses' }} />
      </div>
    </div>
  )
}
