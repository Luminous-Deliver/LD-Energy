import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
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
import { Crumbs, PriceBlock, FaqList, faqSchema, Ticks, type ServiceFaq } from '../ServiceParts'
import '@/app/inner.css'
import '../services.css'

/*
 * /services/epc-pre-assessment, rebuilt 24/10/2026 on the inner-page parts, as /services/domestic-epc. Legal-sensitive:
 * it carries the "guidance only" wording Abdul approved on 24/10 (decisions log, 24/10 night), built on Elmhurst's
 * 29/09/2026 answers (Abdul-2 references/epc-audit-and-scheme-rules.md): unlodged it is not an EPC and isn't insured; it
 * can be lodged as the EPC within 3 months as is, or up to 18 months with the homeowner's letter; it must not be
 * presented as a retrofit assessment. No Our promise here: its first promise is about lodgement, and this is not lodged.
 * Title and descriptions stay frozen until 14/12; only the H1 changes. Section ids kept.
 * Parity: Abdul-2 projects/ld-energy-redesign-2026-10/research/epc-pre-assessment-parity-2026-10-24.md
 */
const LODGE_LATER = `£${site.addOns.lodgeLater}`
const FROM_PRICE = `£${priceFrom.preAssessment}`

export const metadata: Metadata = {
  title: `EPC Pre-Assessment London | Your Score Without Lodging It | From ${FROM_PRICE}`,
  description:
    `Find out what your London property would score before anything goes on the public register. A full survey by an accredited assessor, deliberately not lodged, with a written improvement plan included. From ${FROM_PRICE}.`,
  alternates: { canonical: `${site.url}/services/epc-pre-assessment` },
  openGraph: {
    images: [defaultOgImage],
    title: `EPC Pre-Assessment London | From ${FROM_PRICE} | L&D Energy`,
    description:
      `A full survey deliberately not lodged as part of this service, so no certificate is published. Your score, what is holding it back, and a written plan to improve it. From ${FROM_PRICE}.`,
    url: `${site.url}/services/epc-pre-assessment`,
  },
  twitter: {
    images: [defaultOgImage.url],
    title: `EPC Pre-Assessment London | From ${FROM_PRICE}`,
    description: `Know your rating before it becomes public. Nothing is lodged. From ${FROM_PRICE}.`,
  },
}

const q = (ctaId: 'hero' | 'pricing' | 'inline' | 'bottom') => quoteHref({ service: 'pre-assessment', sourcePage: 'pre-assessment', ctaId })

const included = [
  'A full survey of the property by an Elmhurst accredited assessor: the same visit and the same measuring as a real EPC',
  'The score calculated from the assessed property data',
  'A full breakdown of what is helping and what is holding the score back',
  'Abdul’s personalised written improvement plan: what to consider improving, in what order, and why',
  'A separate energy report summarising the assessed energy performance and findings, at no extra charge if you ask for it',
  'Nothing lodged, nothing published: no entry appears on the GOV.UK register',
]

const audience = [
  {
    icon: 'house' as const,
    title: 'Planning works first',
    body: 'You intend to insulate, reglaze or change the heating before you sell or let. Find out where you stand now, do the work, and lodge a certificate that reflects the finished property.',
  },
  {
    icon: 'key' as const,
    title: 'Landlords checking MEES',
    body: 'You suspect the property is below band E and want to know before anything is on the public record. A pre-assessment helps you understand the assessed property, but does not replace an EPC or satisfy MEES duties.',
  },
  {
    icon: 'pound' as const,
    title: 'Buyers weighing a purchase',
    body: 'Considering a property with no valid EPC, or an old one. Review modelled energy costs and possible improvement priorities before you commit; actual bills and installation prices will differ.',
  },
]

/** Lodging the same survey as the EPC later (Elmhurst, 29/09/2026), with the old page's conditions. */
const later = [
  { when: 'Within 3 months', what: 'Lodged as it is, with no second visit, provided nothing about the property has changed.', price: `+${LODGE_LATER}` },
  { when: '3 to 18 months', what: 'Lodged with your letter confirming nothing about the property has changed since the visit.', price: `+${LODGE_LATER}` },
  { when: 'After works, or after 18 months', what: 'A fresh visit with new photographs and measurements, priced as a new EPC.', price: 'New EPC' },
]

const faqs: ServiceFaq[] = [
  {
    q: 'Is a Pre-Assessment an EPC?',
    a: 'No. Because it is not lodged, it is guidance only. It is not an Energy Performance Certificate, it is not a retrofit assessment, and it isn’t covered by our professional insurance. It is not a substitute for an EPC where one is legally required, including marketing a property for sale or rent, and meeting MEES as a landlord.',
  },
  {
    q: 'How much is an EPC Pre-Assessment?',
    a: `From ${FROM_PRICE}, on the same floor-area bands as the EPC. It is the same visit, the same measuring and the same evidence gathering; only the lodgement is skipped, and your personalised written improvement plan is included in the price. A separate energy report is available at no extra charge if you ask for it. If you later decide you want the certificate after all, we can usually lodge the same survey for ${LODGE_LATER} with no second visit, provided nothing at the property has changed and the survey remains valid for lodgement under applicable rules. It is not a substitute for an EPC where one is legally required.`,
  },
  {
    q: 'How long can I wait before lodging it as my EPC?',
    a: `Within 3 months of the visit we can lodge it as it is. From 3 to 18 months we need a letter from you confirming nothing about the property has changed. After 18 months, or once work has been done, it needs a fresh visit, priced as a new EPC. Lodging it later costs ${LODGE_LATER}. Ask us to confirm before relying on it.`,
  },
  {
    q: 'Can a Pre-Assessment get me a better rating?',
    a: 'No. A pre-assessment cannot produce a better rating than the property earns. The score comes from approved software and the evidence recorded; changes to evidence or methodology can also affect a later rating without physical works.',
  },
  {
    q: 'Can I find out my rating without it going on the public register?',
    a: `Yes, that is an EPC Pre-Assessment. We carry out the full survey exactly as we would for a real EPC, but we do not lodge it, so no certificate is published and nothing appears on the GOV.UK register. You get the score, a breakdown of what is holding it back, and a written improvement plan. It is priced on the same floor-area bands as an EPC, from ${FROM_PRICE}.`,
  },
]

const sections: PageSection[] = [
  { id: 'what-it-is', heading: 'what-h', label: 'A private assessment' },
  { id: 'guidance-only', heading: 'guidance-h', label: 'Guidance only' },
  { id: 'lodge-later', heading: 'later-h', label: 'Lodging it later' },
  { id: 'who-its-for', heading: 'who-h', label: 'Who it helps' },
  { id: 'pre-assessment-faq', heading: 'questions-h', label: 'Pre-Assessment questions' },
  { id: 'book', heading: 'in-end-h', label: 'Get my exact quote' },
]

const readNext: NextStep[] = [
  { kicker: 'Need it lodged now', title: 'What a Domestic EPC involves', href: '/services/domestic-epc', img: '/guides/assessor-room-720.webp',
    text: 'The certificate on the GOV.UK register within 72 hours of the visit.' },
  { kicker: `£${site.addOns.improvementPlan} add-on`, title: 'EPC Improvement Plan', href: '/services/epc-improvement-plan', img: '/home/terrace-cutaway-900.webp',
    text: 'The same written plan, added to a lodged EPC.' },
  { kicker: 'Same visit', title: 'Floor plans, laser-measured', href: '/services/floor-plans', img: '/illustrations/report-900.webp',
    text: 'A floor plan drawn from the same visit, as JPG and PDF.' },
  { kicker: 'Every price', title: 'See the price bands', href: '/pricing', go: true, cta: 'See every price',
    text: 'Pre-Assessment, EPC, floor plan and both together, by floor area.' },
]

const schema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${site.url}/services/epc-pre-assessment#service`,
    name: 'EPC Pre-Assessment',
    serviceType: 'Domestic energy assessment (not lodged)',
    description:
      'A full RdSAP survey of a residential property carried out by an accredited Domestic Energy Assessor and deliberately not lodged on the GOV.UK EPC Register, so no certificate is published. Includes an Energy Report and a written improvement plan. Not a substitute for an Energy Performance Certificate where one is legally required.',
    provider: { '@id': `${site.url}/#business` },
    areaServed: areaServedLondon,
    offers: {
      '@type': 'Offer',
      priceSpecification: { '@type': 'PriceSpecification', minPrice: priceFrom.preAssessment, priceCurrency: 'GBP' },
      availability: 'https://schema.org/InStock',
      url: `${site.url}/quote`,
    },
  },
  faqSchema(faqs),
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
      { '@type': 'ListItem', position: 2, name: 'EPC Pre-Assessment', item: `${site.url}/services/epc-pre-assessment` },
    ],
  },
]

export default function EpcPreAssessmentPage() {
  const reg = site.assessor.accreditations
  return (
    <div className="in sv">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* HERO */}
      <section className="in-hd" aria-labelledby="sv-h1">
        <Container>
          <Crumbs label="EPC Pre-Assessment" />
          <div className="in-hd__grid sv-hd">
            <div className="in-hd__copy">
              <p className="in-eyebrow">Assessment service</p>
              <h1 id="sv-h1">EPC Pre-Assessment</h1>
              <p className="in-hd__answer">
                Find out what your property would score before anything goes on the public register. You get a full EPC assessment
                with your exact rating and a written improvement plan, from <b className="num">{FROM_PRICE}</b>. It is deliberately
                not lodged, so there is no certificate and nothing to undo. It is <b>guidance only</b>.
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
              <img src="/guides/house-section-1200.webp" srcSet="/guides/house-section-720.webp 720w, /guides/house-section-1200.webp 1200w"
                sizes="(max-width: 899px) 92vw, 46vw" width={1200} height={667} fetchPriority="high"
                alt="A house drawn in section, showing the insulated loft, two bedrooms, the stairs, the front room and the kitchen" />
              <figcaption className="in-hd__cap">The same survey as an EPC: walls, loft, windows, heating and hot water, room by room. An AI-generated illustration.</figcaption>
            </figure>

            <PriceBlock id="sv-tb-h" service="pre-assessment" column="preAssessment" sourcePage="pre-assessment"
              head={[{ k: 'Service', v: 'Pre-Assessment' }, { k: 'Lodged', v: 'No' }, { k: 'Status', v: 'Guidance only' }]}
              foot={(
                <>
                  <a className="ld-btn ld-btn--primary ld-btn--block" href={q('pricing')} data-enquiry-cta="pricing">Get my exact quote</a>
                  <p className="in-tb__other">
                    Priced on the same floor-area bands as an EPC, with its own guide prices. Your personalised written improvement
                    plan is <b>included</b>; a separate energy report is available at no extra charge. Lodge it as your EPC later
                    for <b className="num">{LODGE_LATER}</b>.
                  </p>
                </>
              )} />

            <OnThisPage sections={sections} />
          </div>
        </Container>
      </section>

      {/* WHAT IT IS */}
      <section className="in-sec in-sec--band" id="what-it-is" aria-labelledby="what-h">
        <Container className="sv-two">
          <div className="in-prose">
            <p className="in-eyebrow">What it is</p>
            <h2 className="in-h2" id="what-h">A private assessment, not a lodged EPC</h2>
            <p className="in-lede">
              A pre-assessment is the same survey by the same accredited assessor, with one difference: we do not lodge it. You get
              the score, the reasons for it, and a plan, and no public record.
            </p>
            <p>
              A lodged EPC is normally valid for ten years unless replaced; historical records may remain on the register longer. A
              pre-assessment is private advisory work. It does not postpone a legal duty to obtain an EPC, even if improvements are
              planned.
            </p>
          </div>
          <div>
            <h3 className="sv-k">What you get</h3>
            <Ticks items={included} />
          </div>
        </Container>
      </section>

      {/* GUIDANCE ONLY */}
      <section className="in-sec" id="guidance-only" aria-labelledby="guidance-h">
        <Container className="sv-two">
          <div>
            <p className="in-eyebrow">Important</p>
            <h2 className="in-h2" id="guidance-h">Guidance only</h2>
            <p className="in-lede">Because it is not lodged, a Pre-Assessment is guidance to help you decide. Please read what that means before you book one.</p>
          </div>
          <div className="sv-callout sv-callout--warn">
            <ul className="sv-dash">
              <li>It is <b>not</b> an Energy Performance Certificate.</li>
              <li>It isn&apos;t covered by our professional insurance.</li>
              <li>It is not a retrofit assessment.</li>
              <li>
                It is not a substitute for an EPC where one is legally required, including marketing a property for sale or rent, and
                meeting MEES as a landlord. If you need a valid EPC now, see the{' '}
                <Link className="in-link" href="/services/domestic-epc">Domestic EPC</Link> instead.
              </li>
              <li>
                It cannot produce a better rating than the property earns. The score comes from approved software and the evidence
                recorded; changes to evidence or methodology can also affect a later rating without physical works.
              </li>
            </ul>
          </div>
        </Container>
      </section>

      {/* LODGING IT LATER */}
      <section className="in-sec in-sec--band" id="lodge-later" aria-labelledby="later-h">
        <Container>
          <div className="sv-head">
            <div>
              <p className="in-eyebrow">If you want the certificate after all</p>
              <h2 className="in-h2" id="later-h">Lodging it as your EPC later</h2>
            </div>
            <p className="in-lede">
              We can usually lodge the same survey without coming back, provided nothing about the property has changed since the
              visit and the survey is still valid for lodgement under the applicable scheme and methodology rules.
            </p>
          </div>
          <ol className="sv-later">
            {later.map((l, i) => (
              <li key={l.when}>
                <span className="sv-later__n num">{i + 1}</span>
                <h3 className="sv-later__h">{l.when}</h3>
                <p>{l.what}</p>
                <b className={l.price.startsWith('+') ? 'sv-later__p num' : 'sv-later__p is-muted'}>{l.price}</b>
              </li>
            ))}
          </ol>
          <p className="in-note sv-after">
            If work <em>has</em> been done (an extension, new windows, new heating, new insulation) that is the whole point of having
            waited, but it needs a fresh visit with new photographs and measurements, priced as a new EPC. Ask us to confirm before
            relying on the later-lodgement option.
          </p>
        </Container>
      </section>

      {/* WHO IT HELPS */}
      <section className="in-sec" id="who-its-for" aria-labelledby="who-h">
        <Container>
          <p className="in-eyebrow">Who it helps</p>
          <h2 className="in-h2" id="who-h">Worth it when the timing is wrong</h2>
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
            Not sure which you need? <a className="in-link" href={q('inline')}>Tell us the situation</a>. If you need a lodged
            certificate, we will say so rather than sell you this.
          </p>
        </Container>
      </section>

      {/* QUESTIONS */}
      <section className="in-sec in-sec--band" id="pre-assessment-faq" aria-labelledby="questions-h">
        <Container className="sv-faqwrap">
          <div>
            <p className="in-eyebrow">Common questions</p>
            <h2 className="in-h2" id="questions-h">Pre-Assessment questions</h2>
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
      <RevealOnScroll {...innerReveals('.sv', { lists: ['.sv-ways', '.sv-later'], blocks: ['#what-it-is .sv-two > div + div', '#guidance-only .sv-callout'] })} />

      <div id="book">
        <InnerEnding variant="a" source="pre-assessment" quote={q('bottom')}
          eyebrow={<>Pre-Assessment · from <span className="num">{FROM_PRICE}</span></>}
          heading="Know the score before it is public"
          text="A full survey with nothing lodged. We'll confirm your slot and exact price before you book." />
      </div>
    </div>
  )
}
