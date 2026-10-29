import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { OurPromise } from '@/components/sections/OurPromise'
import { Container } from '@/components/ui/Container'
import { Ico } from '@/components/sections/home/HomeIcon'
import { OnThisPage, type PageSection } from '@/components/inner/OnThisPage'
import { RevealOnScroll } from '@/components/inner/RevealOnScroll'
import { innerReveals } from '@/components/inner/innerReveals'
import { ReadNext, type NextStep } from '@/components/inner/ReadNext'
import { InnerEnding } from '@/components/inner/InnerEnding'
import { site, priceFrom, defaultOgImage } from '@/lib/site'
import { areaServedLondon } from '@/lib/boroughs'
import { quoteHref } from '@/lib/quote-context'
import { Crumbs, FaqList, faqSchema, Ticks, type ServiceFaq } from '../ServiceParts'
import '@/app/inner.css'
import '../services.css'

/*
 * /services/epc-improvement-plan, rebuilt 24/10/2026 on the inner-page parts, as /services/domestic-epc. One flat add-on
 * price, so the hero's title block states it beside what every EPC already includes rather than listing sizes. Every
 * standard EPC includes its recommendations; the £35 plan is extra interpretation (memory
 * epc-recommendations-policy-corrected). Our promise applies: the plan always comes with a lodged EPC.
 * Title and descriptions stay frozen until 14/12; only the H1 changes. Section ids kept.
 * Parity: Abdul-2 projects/ld-energy-redesign-2026-10/research/epc-improvement-plan-parity-2026-10-24.md
 */
const PLAN_PRICE = `£${site.addOns.improvementPlan}`

export const metadata: Metadata = {
  title: `EPC Improvement Plan London | ${PLAN_PRICE}`,
  description:
    `Abdul's personalised plan explaining what is holding your EPC rating back and which improvements to consider first, supported by the full Elmhurst Energy Report. ${PLAN_PRICE} extra.`,
  alternates: { canonical: `${site.url}/services/epc-improvement-plan` },
  openGraph: {
    images: [defaultOgImage],
    title: `EPC Improvement Plan London | ${PLAN_PRICE} | L&D Energy`,
    description:
      `A personalised written plan and the full Elmhurst Energy Report for ${PLAN_PRICE} extra. Standard EPC recommendations are included either way.`,
    url: `${site.url}/services/epc-improvement-plan`,
  },
  twitter: {
    images: [defaultOgImage.url],
    title: `EPC Improvement Plan London | ${PLAN_PRICE}`,
    description: `Personalised EPC improvement priorities supported by the full Elmhurst Energy Report. ${PLAN_PRICE} extra, with no guaranteed rating or savings.`,
  },
}

const q = (ctaId: 'hero' | 'pricing' | 'inline' | 'bottom') => quoteHref({ service: 'epc', plan: true, sourcePage: 'improvement-plan', ctaId })

/** What every lodged EPC already carries (the Domestic EPC page's "Your EPC includes", the recommendation lines). */
const everyEpc = [
  'Current energy efficiency rating, and the potential rating if the recommended improvements are made',
  'Specific recommendations to improve efficiency',
  'Estimated cost and savings for each recommendation',
]

const parts = [
  { h: 'A personalised written plan.', t: 'Abdul explains what is holding the rating back and which improvements to consider first, based on the property assessed.' },
  { h: 'The full Elmhurst Energy Report.', t: 'Supporting assessment evidence, including modelled energy use and costs. These estimates use standard occupancy assumptions, not your household bills.' },
  { h: 'Priorities and practical limitations.', t: 'What to investigate first, how measures relate to each other, and where installer or other specialist advice is needed before proceeding.' },
]

const covered = [
  'What is holding the rating back, based on the assessment data',
  'Indicative installation costs and modelled savings, with their limitations',
  'Estimated energy-cost distribution for heating, hot water and lighting under standard occupancy assumptions',
  'Which improvements to consider first and which need further investigation',
  'How the EPC recommendations relate to current MEES requirements, where applicable',
  'What is realistic for the property type: solid wall, flat, period conversion',
  'Which measures may be unsuitable or need specialist advice, and why',
]

/* Disclaimers (Abdul 28/10/2026: "add all the disclaimers"). Worded within the Consumer Rights Act 2015: no exclusion
   of liability for our own care and skill (s. 57) or negligence causing injury (s. 65); the cap lives in terms §8. */
const beforeYouAct = [
  'It is guidance based on what was recorded at the visit. It is not a survey of the structure or condition of the building, an installation design or a PAS 2035 retrofit assessment.',
  'Costs, savings and ratings are estimates from the approved software and typical figures. They are not quotes, and real results depend on the installer, the materials and how the home is used.',
  'No particular rating, band, grant, funding or MEES exemption is guaranteed. A later EPC is a new assessment of the property as it is then.',
  'Get quotes and advice from qualified installers before any work, and check planning permission, listed building consent and Building Regulations where they apply.',
  'Which works to do is your decision. We are not responsible for installers’ work, products, prices or results.',
]

const audience = [
  {
    icon: 'key' as const,
    title: 'Landlords facing MEES',
    body: 'For rentals covered by MEES, the current minimum is E unless a valid exemption is registered. The confirmed higher standard for 1 October 2030 still needs legislation. The plan helps you consider property-specific options.',
  },
  {
    icon: 'house' as const,
    title: 'Owners planning works',
    body: 'Considering insulation, heating or glazing work? A personalised plan helps you consider priorities before seeking installation advice and quotes.',
  },
  {
    icon: 'document' as const,
    title: 'Buyers and sellers',
    body: 'Understand the assessed property and possible improvements before making decisions about a sale or purchase.',
  },
]

const faqs: ServiceFaq[] = [
  {
    q: 'Does my EPC include improvement recommendations?',
    a: `Yes. Your standard EPC includes its software-generated recommendation report at no extra charge, unless there is no reasonable potential for improvements. The optional ${PLAN_PRICE} EPC Improvement Plan adds Abdul's personalised interpretation and priorities, supported by the full Elmhurst Energy Report. It explains what is holding the rating back and which improvements to consider first. It does not guarantee a rating or savings.`,
  },
  {
    q: 'When do I decide whether to add it?',
    a: 'Tick the box on the enquiry form, or mention it when you call. You can also decide on the day, before we lodge.',
  },
  {
    q: 'Will the plan get my home to a particular band?',
    a: 'No particular rating or improvement is guaranteed. Costs and savings are estimates, not quotes or guarantees. The plan is not a PAS 2035 retrofit assessment or an installation design.',
  },
  {
    q: 'Is it included in a Pre-Assessment?',
    a: 'Yes. The written improvement plan is already included in the price of an EPC Pre-Assessment, so there is nothing to add.',
  },
]

const sections: PageSection[] = [
  { id: 'what-it-is', heading: 'what-h', label: 'What every EPC includes, and what the plan adds' },
  { id: 'what-it-covers', heading: 'covers-h', label: 'What it covers' },
  { id: 'who-its-for', heading: 'who-h', label: 'Who it helps' },
  { id: 'improvement-plan-faq', heading: 'questions-h', label: 'Improvement Plan questions' },
  { id: 'book', heading: 'in-end-h', label: 'Get my exact quote' },
]

const readNext: NextStep[] = [
  { kicker: 'The service it adds to', title: 'What a Domestic EPC involves', href: '/services/domestic-epc', img: '/guides/assessor-room-720.webp',
    text: 'The visit, what we record and how the rating is worked out.' },
  { kicker: 'Plan included', title: 'EPC Pre-Assessment', href: '/services/epc-pre-assessment', img: '/guides/house-section-720.webp',
    text: 'A full EPC assessment, not lodged: your exact rating, with the written plan in the price. Guidance only.' },
  { kicker: 'Same visit', title: 'Floor plans, laser-measured', href: '/services/floor-plans', img: '/illustrations/report-900.webp',
    text: 'A floor plan drawn from the same visit, as JPG and PDF.' },
  { kicker: 'Every price', title: 'Prices for every size', href: '/pricing', go: true, cta: 'See every price',
    text: 'EPC, floor plan, both together and Pre-Assessment, by floor area.' },
]

const schema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${site.url}/services/epc-improvement-plan#service`,
    name: 'EPC Improvement Plan',
    serviceType: 'Energy efficiency improvement report',
    description:
      'An additional personalised written plan from Abdul Motaleb Taher explaining what is holding the EPC rating back and which improvements to consider first, supported by the full Elmhurst Energy Report. Standard EPC recommendations are included independently of this add-on. No rating or savings are guaranteed.',
    provider: { '@id': `${site.url}/#business` },
    areaServed: areaServedLondon,
    offers: {
      '@type': 'Offer',
      // minPrice, as every service page (rollout brief rule 4); the add-on is a flat £35, so minPrice is the price.
      priceSpecification: { '@type': 'PriceSpecification', minPrice: site.addOns.improvementPlan, priceCurrency: 'GBP' },
      description: 'Added to any EPC assessment',
      availability: 'https://schema.org/InStock',
    },
  },
  faqSchema(faqs),
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
      { '@type': 'ListItem', position: 2, name: 'EPC Improvement Plan', item: `${site.url}/services/epc-improvement-plan` },
    ],
  },
]

export default function EpcImprovementPlanPage() {
  const reg = site.assessor.accreditations
  return (
    <div className="in sv">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* HERO */}
      <section className="in-hd" aria-labelledby="sv-h1">
        <Container>
          <Crumbs label="Improvement Plan" />
          <div className="in-hd__grid sv-hd">
            <div className="in-hd__copy">
              <p className="in-eyebrow">Add-on service</p>
              <h1 id="sv-h1">EPC Improvement Plan</h1>
              <p className="in-hd__answer">
                Every EPC already lists its recommendations. Abdul&apos;s personalised plan explains what is holding your rating back
                and which improvements to consider first. Written after your assessment, with the full Elmhurst Energy Report as
                supporting evidence. <b className="num">{PLAN_PRICE}</b> extra.
              </p>
              <div className="in-hd__acts">
                <a className="ld-btn ld-btn--primary" href={q('hero')} data-enquiry-cta="hero">Get my exact quote</a>
                <a className="in-wa" href={site.whatsappHref} target="_blank" rel="noopener noreferrer"><Ico name="message" size={18} /> Ask on WhatsApp</a>
              </div>
              <p className="in-by">
                <ShieldCheck size={18} className="i" aria-hidden="true" />
                <span>
                  Written by <Link href="/about"><b>{site.assessor.name}</b></Link>, {reg.map((a) => a.short).join(' and ')} accredited,{' '}
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
              <figcaption className="in-hd__cap">The plan works from what the visit recorded: walls, loft, windows, heating and hot water, room by room. An AI-generated illustration.</figcaption>
            </figure>

            {/* the title block states the one add-on price beside what is already included, not a table of sizes */}
            <aside className="in-tb sv-tb" aria-labelledby="sv-tb-h">
              <div className="in-tb__head">
                <div><span>Service</span><b id="sv-tb-h">Improvement Plan</b></div>
                <div><span>Added to</span><b>Any EPC</b></div>
                <div><span>Price</span><b>Flat add-on</b></div>
              </div>
              <div className="in-tb__cols" aria-hidden="true"><span>With your EPC</span><span>Price</span><span /></div>
              <ul className="in-tb__rows">
                <li>
                  <Link href="/services/domestic-epc">
                    <span className="in-tb__s">Suggested improvements on your EPC<small>A short list on the certificate itself: each step, its typical cost and the rating after</small></span>
                    <span className="in-tb__p in-tb__p--tbc">Included</span>
                    <Ico name="arrow-right" size={16} />
                  </Link>
                </li>
                <li>
                  <a className="is-common" href={q('pricing')}>
                    <span className="in-tb__s">EPC Improvement Plan<small>Abdul&apos;s written priorities, with the full Elmhurst Energy Report</small></span>
                    <span className="in-tb__p num">+£{site.addOns.improvementPlan}</span>
                    <Ico name="arrow-right" size={16} />
                  </a>
                </li>
                <li>
                  <Link href="/services/epc-pre-assessment">
                    <span className="in-tb__s">In an EPC Pre-Assessment<small>The written plan is already in the price</small></span>
                    <span className="in-tb__p in-tb__p--tbc">Included</span>
                    <Ico name="arrow-right" size={16} />
                  </Link>
                </li>
              </ul>
              <div className="in-tb__foot">
                <a className="ld-btn ld-btn--primary ld-btn--block" href={q('pricing')} data-enquiry-cta="pricing">Get my exact quote</a>
                <p className="in-tb__other">
                  Added to any EPC assessment, from <b className="num">£{priceFrom.epc}</b>. Tick the box on the enquiry form, or
                  mention it when you call. You can also decide on the day, before we lodge.
                </p>
              </div>
            </aside>

            <OnThisPage sections={sections} />
          </div>
        </Container>
      </section>

      {/* INCLUDED vs THE PLAN */}
      <section className="in-sec in-sec--band" id="what-it-is" aria-labelledby="what-h">
        <Container>
          <div className="sv-head">
            <div>
              <p className="in-eyebrow">What it is</p>
              <h2 className="in-h2" id="what-h">What every EPC includes, and what the plan adds</h2>
            </div>
            <p className="in-lede">
              Your standard EPC already includes its software-generated recommendation report, where applicable. The optional
              Improvement Plan adds Abdul&apos;s interpretation of the assessment and priorities for your property.
            </p>
          </div>
          <div className="sv-vs">
            <div>
              <p className="sv-vs__k"><span>Every EPC</span><b className="is-muted">Included</b></p>
              <h3>The recommendations</h3>
              <p>Standard recommendations come from the assessment software, on the certificate itself.</p>
              <Ticks items={everyEpc} />
            </div>
            <div>
              <p className="sv-vs__k"><span>Improvement Plan</span><b className="num">+{PLAN_PRICE}</b></p>
              <h3>What the plan adds</h3>
              <ol className="sv-parts">
                {parts.map((p, i) => (
                  <li key={p.h}><span className="sv-parts__n">{i + 1}</span><span><b>{p.h}</b> {p.t}</span></li>
                ))}
              </ol>
            </div>
          </div>
          <p className="in-note sv-after">
            Abdul&apos;s additional plan puts the recommendations in context for your property and explains the priorities in
            writing. It costs <b>{PLAN_PRICE}</b> on top of your EPC and is already included in an{' '}
            <Link className="in-link" href="/services/epc-pre-assessment">EPC Pre-Assessment</Link>.
          </p>
        </Container>
      </section>

      {/* Our promise, under the price: the plan always comes with a lodged EPC */}
      <OurPromise />

      {/* WHAT IT COVERS */}
      <section className="in-sec" id="what-it-covers" aria-labelledby="covers-h">
        <Container className="sv-two">
          <div>
            <p className="in-eyebrow">In the plan</p>
            <h2 className="in-h2" id="covers-h">What it covers</h2>
            <div className="sv-callout sv-callout--warn sv-gap">
              <p className="sv-callout__h">Standard recommendations are included either way</p>
              <p>
                A recommendation report may be omitted where there is no reasonable potential for improvement; any legitimate
                omission follows assessment rules, not your add-on choice. The plan is not a PAS 2035 retrofit assessment or an
                installation design. Costs and savings are estimates, not quotes or guarantees. No particular rating or improvement
                is guaranteed.
              </p>
            </div>
            <div className="sv-callout sv-gap">
              <p className="sv-callout__h">Before you act on the plan</p>
              <ul>
                {beforeYouAct.map((t) => <li key={t}>{t}</li>)}
              </ul>
              <p>
                Nothing here limits your statutory rights. Our liability is set out in{' '}
                <Link className="in-link" href="/terms#liability">our terms</Link>.
              </p>
            </div>
          </div>
          <div>
            <h3 className="sv-k">Written for your property</h3>
            <Ticks items={covered} />
          </div>
        </Container>
      </section>

      {/* WHO IT HELPS */}
      <section className="in-sec in-sec--band" id="who-its-for" aria-labelledby="who-h">
        <Container>
          <p className="in-eyebrow">Who it helps</p>
          <h2 className="in-h2" id="who-h">Most useful if you&apos;re in one of these positions</h2>
          <div className="sv-ways">
            {audience.map((a) => (
              <article key={a.title} className="sv-way">
                <span className="sv-way__ico"><Ico name={a.icon} size={28} /></span>
                <h3 className="in-h3">{a.title}</h3>
                <p>{a.body}</p>
              </article>
            ))}
          </div>
          <p className="in-note sv-after">
            Not sure whether it&apos;s worth it? <a className="in-link" href={q('inline')}>Ask us in your enquiry</a>. Tell us what you
            want to understand and we can explain whether the plan fits that need.
          </p>
        </Container>
      </section>

      {/* QUESTIONS */}
      <section className="in-sec" id="improvement-plan-faq" aria-labelledby="questions-h">
        <Container className="sv-faqwrap">
          <div>
            <p className="in-eyebrow">Common questions</p>
            <h2 className="in-h2" id="questions-h">Improvement Plan questions</h2>
            <p className="in-note sv-faqside">
              Not covered here? Call <a className="in-link num" href={site.phoneHref}>{site.phone}</a> or{' '}
              <a className="in-link" href={site.whatsappHref} target="_blank" rel="noopener">WhatsApp us</a>, {site.hours}.
            </p>
          </div>
          <FaqList faqs={faqs} />
        </Container>
      </section>

      <ReadNext steps={readNext} />

      {/* section reveals (motion, Considered); the price sections are left out on purpose, see innerReveals */}
      <RevealOnScroll {...innerReveals('.sv', { lists: ['.sv-ways', '.sv-vs'], blocks: ['#what-it-covers .sv-two > div + div', '#what-it-covers .sv-callout'] })} />

      <div id="book">
        <InnerEnding variant="a" source="improvement-plan" quote={q('bottom')}
          eyebrow={<>Improvement Plan · <span className="num">{PLAN_PRICE}</span> on any EPC</>}
          heading="Get a quote for an EPC with the Improvement Plan"
          text={`Add it to any assessment for ${PLAN_PRICE}. We'll confirm your slot and exact price before you book.`} />
      </div>
    </div>
  )
}
