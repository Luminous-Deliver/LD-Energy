import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronDown, ShieldCheck } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Ico } from '@/components/sections/home/HomeIcon'
import { OurPromise } from '@/components/sections/OurPromise'
import { OnThisPage, type PageSection } from '@/components/inner/OnThisPage'
import { RevealOnScroll } from '@/components/inner/RevealOnScroll'
import { innerReveals } from '@/components/inner/innerReveals'
import { ReadNext, type NextStep } from '@/components/inner/ReadNext'
import { InnerEnding } from '@/components/inner/InnerEnding'
import {
  site, topBand, pricing, priceFrom, insurance, SAME_DAY_LODGEMENT_SURCHARGE, NEXT_DAY_VISIT_SURCHARGE, defaultOgImage,
} from '@/lib/site'
import { areaServedLondon } from '@/lib/boroughs'
import { quoteHref } from '@/lib/quote-context'
import type { AreaChoice } from '@/lib/floor-area'
import '@/app/inner.css'
import './assessor.css'

/*
 * /domestic-energy-assessor-london, redesigned 24/10/2026 on the inner-page parts (/landlords, /about): the credentials
 * and verification page (areas plan §9), both schemes shown with their GOV.UK register checks. Visits: Abdul does them
 * and sometimes sends a trusted, experienced colleague when he is ill or unable, telling the customer in advance
 * (23/10/2026), so nothing here says "always Abdul". No home address: Stratford (E15) only. Title and descriptions stay
 * frozen until 14/12; only the H1 changes.
 */
const PATH = '/domestic-energy-assessor-london'

export const metadata: Metadata = {
  title: 'Domestic Energy Assessor in London',
  description:
    `Elmhurst and Quidos accredited domestic energy assessor in Stratford, covering all 32 London boroughs. Official EPC certificates from £${priceFrom.epc}, next-day visits available.`,
  alternates: { canonical: `${site.url}${PATH}` },
  openGraph: {
    images: [defaultOgImage],
    title: 'Domestic Energy Assessor London | Elmhurst Accredited | L&D Energy',
    description:
      `Elmhurst and Quidos accredited domestic energy assessor covering all 32 London boroughs. Official EPC certificates from £${priceFrom.epc}, next-day visits available.`,
    url: `${site.url}${PATH}`,
  },
  twitter: {
    images: [defaultOgImage.url],
    title: 'Domestic Energy Assessor London | Elmhurst Accredited',
    description:
      `Elmhurst and Quidos accredited domestic energy assessor covering all 32 London boroughs. EPCs from £${priceFrom.epc}.`,
  },
}

const q = (ctaId: 'hero' | 'pricing' | 'inline' | 'bottom') => quoteHref({ service: 'epc', sourcePage: 'assessor', ctaId })
const [elmhurst, quidos] = site.assessor.accreditations
const registerSearch = 'https://getting-new-energy-certificate.service.gov.uk/find-an-assessor/search-by-name?name='

/**
 * Each scheme's record, with the GOV.UK search that finds it (as /about, re-run 23/10/2026): the full name finds only the
 * Elmhurst record; "Abdul Taher" finds both, the Quidos one listed under that shorter name.
 */
const records = [
  { ...elmhurst, label: 'Elmhurst Energy', check: `${registerSearch}Abdul+Motaleb+Taher` },
  { ...quidos, label: 'Quidos', check: site.assessor.verifyUrl },
]

const duties = [
  {
    title: 'Inspects the property',
    body: 'A non-invasive survey recording construction, insulation, heating, hot water, glazing, lighting and ventilation, room by room.',
  },
  {
    title: 'Calculates the rating',
    body: 'Details are entered into government-approved RdSAP 10 software, which produces a SAP score from 1 to 100 and the matching A to G band.',
  },
  {
    title: 'Lodges the certificate',
    body: 'The completed EPC is lodged on the official UK Government EPC Register, the only place a domestic EPC is legally valid.',
  },
  {
    title: 'Recommends improvements',
    body: 'Where improvements are possible, the certificate lists them with a typical installation cost for each, to help you raise the rating and cut running costs.',
  },
]

const whyLocal = [
  {
    title: 'Knows London housing stock',
    body: 'Victorian terraces, ex-council blocks, new-build flats, conservation areas: we assess all of them and know what affects each one.',
  },
  {
    title: 'A real assessor, not a call centre',
    body: 'Abdul carries out the assessments himself. If he is ill or unable to make a visit, he sometimes sends a trusted, experienced colleague in his place, and lets you know in advance.',
  },
  {
    title: 'Fast and flexible',
    body: `72-hour standard lodgement, same-day lodgement for £${SAME_DAY_LODGEMENT_SURCHARGE}, or a next-day visit and lodgement for £${NEXT_DAY_VISIT_SURCHARGE}. Appointments 7 days a week, including evenings and weekends.`,
  },
  {
    title: 'Accredited and insured',
    body: insurance.full,
  },
]

type Faq = { q: string; a: string }
const faqs: Faq[] = [
  {
    q: 'What is a domestic energy assessor?',
    a: 'A domestic energy assessor (DEA) is a qualified, accredited professional licensed to assess the energy efficiency of residential properties and produce an Energy Performance Certificate (EPC). Only an accredited DEA registered with a government-approved scheme such as Elmhurst Energy or Quidos can lodge a domestic EPC on the official UK Government EPC Register.',
  },
  {
    q: 'How do I find a domestic energy assessor in London?',
    a: `You can search the official GOV.UK find-an-assessor tool, or go directly to a local accredited DEA. L&D Energy is an Elmhurst and Quidos accredited domestic energy assessor based in ${site.address.locality}, East London, covering all 32 London boroughs and surrounding areas within a 1.5-hour radius. Call ${site.phone} or get a quote online.`,
  },
  {
    q: 'How much does a domestic energy assessor charge in London?',
    a: `Guide prices start from £${pricing[0].epc} for properties ${pricing[0].areaLabel.toLowerCase()} and rise with internal floor area; homes ${topBand.areaLabel.toLowerCase()} start from £${topBand.epc}. These are starting estimates. The final price depends on internal floor area (m²), extensions, layout and condition. There are no travel or call-out charges.`,
  },
  {
    q: 'Do I need an accredited assessor for an EPC?',
    a: `Yes. A domestic EPC is only legally valid if it is produced by an accredited domestic energy assessor and lodged on the UK Government EPC Register. An EPC from an unaccredited person cannot be used to sell or rent a property. Always check your assessor’s accreditation number. Ours are ${elmhurst.number} with Elmhurst Energy and ${quidos.number} with Quidos.`,
  },
  {
    q: 'How long does a domestic energy assessment take?',
    a: 'The on-site assessment usually takes 45 minutes to 2 hours depending on the size of the property. Your certificate is then lodged on the GOV.UK EPC Register within 72 hours as standard, or on the day of the visit if you choose same-day lodgement, and we send you the link once it is live.',
  },
  {
    q: 'Is a domestic energy assessor the same as a commercial energy assessor?',
    a: 'No. A domestic energy assessor (DEA) assesses residential homes using RdSAP. Commercial (non-domestic) properties require a non-domestic energy assessor using different methodology. L&D Energy specialises in domestic EPCs for houses and flats.',
  },
]

const sections: PageSection[] = [
  { id: 'what-is-a-dea', heading: 'what-is-h', label: 'What is a domestic energy assessor?' },
  { id: 'what-a-dea-does', heading: 'does-h', label: 'What a domestic energy assessor does' },
  { id: 'accreditation', heading: 'accreditation-h', label: 'An assessor you can verify' },
  { id: 'why-local', heading: 'local-h', label: 'Why use a local London assessor' },
  { id: 'faq', heading: 'faq-h', label: 'Domestic energy assessor FAQs' },
  { id: 'book', heading: 'in-end-h', label: 'Get my exact quote' },
]

const readNext: NextStep[] = [
  { kicker: 'Comparing homes', title: 'Why EPC ratings differ between similar homes', href: '/blog/why-is-my-epc-different',
    text: 'Floor area, outside walls, heating and evidence, side by side.' },
  { kicker: 'The method', title: 'RdSAP 10: what changed in 2025', href: '/blog/rdsap-10-what-changed-2025',
    text: 'Why a new EPC may not match an old one, even when nothing has changed.' },
  { kicker: 'Before the visit', title: 'Preparing for your EPC', href: '/preparing-for-your-epc',
    text: 'What to have ready, so the rating counts everything you have done.' },
  { kicker: 'Your assessor', title: 'Meet Abdul', href: '/about', go: true, cta: 'About L&D Energy',
    text: 'How we work, what we don’t do, and the ID card behind the register entry.' },
]

const schema = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
      { '@type': 'ListItem', position: 2, name: 'Domestic Energy Assessor', item: `${site.url}${PATH}` },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Domestic Energy Assessment',
    name: 'Domestic Energy Assessor in London',
    description:
      'Elmhurst and Quidos accredited domestic energy assessor producing official EPC certificates for residential properties across all 32 London boroughs.',
    areaServed: areaServedLondon,
    provider: { '@id': `${site.url}/#business` },
    url: `${site.url}${PATH}`,
    offers: {
      '@type': 'Offer',
      // Guide price, so minPrice: a fixed `price` would misstate the page.
      priceSpecification: { '@type': 'PriceSpecification', minPrice: pricing[0].epc, priceCurrency: 'GBP' },
      availability: 'https://schema.org/InStock',
    },
  },
]

export default function DomesticEnergyAssessorPage() {
  const reg = site.assessor.accreditations
  return (
    <div className="in da">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* HERO: the answer, the register card, the price list and On this page */}
      <section className="in-hd" aria-labelledby="da-h1">
        <Container>
          <nav className="in-crumbs" aria-label="Breadcrumb">
            <ol>
              <li><Link href="/">Home</Link><span className="sep" aria-hidden="true">›</span></li>
              <li><span aria-current="page">Domestic Energy Assessor</span></li>
            </ol>
          </nav>
          <div className="in-hd__grid da-hd">
            <div className="in-hd__copy">
              <p className="in-eyebrow">Domestic Energy Assessor</p>
              <h1 id="da-h1">Your local domestic energy assessor in London</h1>
              <p className="in-hd__answer">
                L&amp;D Energy is an Elmhurst and Quidos accredited Domestic Energy Assessor (DEA) based in {site.address.locality},
                East London. We produce official EPC certificates for homes across all 32 London boroughs, with guide prices
                from <b className="num">£{priceFrom.epc}</b> and next-day appointments available.
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

            {/* the register card: who you're getting, with both scheme records one tap from the GOV.UK register */}
            <aside className="in-hd__art da-reg" aria-labelledby="da-reg-h">
              <div className="in-tb__head">
                <div><span>Assessor</span><b id="da-reg-h">{site.assessor.name}</b></div>
                <div><span>Status</span><b>Accredited</b></div>
              </div>
              <ul className="da-reg__rows">
                {records.map((r) => (
                  <li key={r.number}>
                    <span className="da-reg__k">{r.label}</span>
                    <span className="da-reg__v num">{r.number}</span>
                    <a className="da-chk" href={r.check} target="_blank" rel="noopener noreferrer" aria-label={`Check ${r.label} accreditation ${r.number} on the GOV.UK register`}>
                      Check <Ico name="arrow-right" size={14} />
                    </a>
                  </li>
                ))}
                <li><span className="da-reg__k">Method</span><span className="da-reg__v da-reg__v--w">RdSAP 10</span></li>
                <li><span className="da-reg__k">Insurance</span><span className="da-reg__v da-reg__v--w">£5m Professional Indemnity, £5m Public Liability</span></li>
                <li><span className="da-reg__k">DBS</span><span className="da-reg__v da-reg__v--w">Checked by both schemes</span></li>
                <li><span className="da-reg__k">Based in</span><span className="da-reg__v da-reg__v--w">{site.address.locality} ({site.address.postalCode}), all 32 boroughs and the City</span></li>
              </ul>
              <p className="da-reg__foot">Each Check runs the GOV.UK register search that finds that record.</p>
            </aside>

            <aside className="in-tb da-tb" aria-labelledby="da-tb-h">
              <div className="in-tb__head">
                <div><span>Service</span><b id="da-tb-h">Domestic EPC</b></div>
                <div><span>Area</span><b>All London</b></div>
                <div><span>Status</span><b>Guide price</b></div>
              </div>
              <div className="in-tb__cols" aria-hidden="true"><span>Floor area</span><span>Price</span><span /></div>
              <ul className="in-tb__rows">
                {pricing.map((b) => (
                  <li key={b.id}>
                    <a href={quoteHref({ service: 'epc', area: b.id as AreaChoice, sourcePage: 'assessor', ctaId: 'pricing' })}>
                      <span className="in-tb__s">{b.areaLabel}<small>{b.typicalLabel}</small></span>
                      <span className="in-tb__p num">{b.startingPrice && <small>from</small>}£{b.epc}</span>
                      <Ico name="arrow-right" size={16} />
                    </a>
                  </li>
                ))}
                <li>
                  <a className="is-common" href={quoteHref({ service: 'epc', area: 'unknown', sourcePage: 'assessor', ctaId: 'pricing' })}>
                    <span className="in-tb__s">Not sure of the size<small>We confirm it from your property details</small></span>
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
                  visit with lodgement that day <b>£{NEXT_DAY_VISIT_SURCHARGE}</b> extra. No travel charges.{' '}
                  <Link className="in-link" href="/pricing">Every price</Link>
                </p>
              </div>
            </aside>

            <OnThisPage sections={sections} />
          </div>
        </Container>
      </section>

      {/* WHAT IS A DEA */}
      <section className="in-sec in-sec--band" id="what-is-a-dea" aria-labelledby="what-is-h">
        <Container className="da-two">
          <div>
            <p className="in-eyebrow">The basics</p>
            <h2 className="in-h2" id="what-is-h">What is a domestic energy assessor?</h2>
            <p className="in-lede">
              A domestic energy assessor (DEA) is a qualified, accredited professional licensed to assess the energy efficiency of
              residential properties and produce an Energy Performance Certificate (EPC).
            </p>
          </div>
          <div className="in-prose da-prose">
            <p>
              Only an accredited DEA, registered with a government-approved scheme such as Elmhurst Energy or Quidos, can lodge a
              domestic EPC on the official <b>UK Government EPC Register</b>. An EPC from an unaccredited person cannot legally be
              used to sell or rent a home.
            </p>
            <p>
              The assessment itself is non-invasive: your assessor surveys the property, records its construction and services,
              and the approved RdSAP software calculates the rating.
            </p>
            <p>
              Need the certificate itself? See our <Link href="/services/domestic-epc">domestic EPC service</Link> or{' '}
              <Link href="/pricing">view pricing</Link>.
            </p>
          </div>
        </Container>
      </section>

      {/* WHAT A DEA DOES */}
      <section className="in-sec" id="what-a-dea-does" aria-labelledby="does-h">
        <Container className="da-does">
          <div>
            <p className="in-eyebrow">The role</p>
            <h2 className="in-h2" id="does-h">What a domestic energy assessor does</h2>
            <p className="in-lede">Four steps, from first visit to your certificate live on the GOV.UK register.</p>
            {/* eslint-disable-next-line @next/next/no-img-element -- WebP from the homepage; next/image is unoptimised on Pages */}
            <img className="da-does__img" src="/home/assessor-visit-900.webp" width={900} height={600} loading="lazy" decoding="async"
              alt="An assessor in a sage jacket measures a London front room with a laser measure, beside a sash window and a column radiator" />
            <p className="in-hd__cap da-does__cap">An AI-generated illustration.</p>
          </div>
          <ol className="da-steps">
            {duties.map((d, i) => (
              <li key={d.title}>
                <span className="da-steps__n">{i + 1}</span>
                <div><h3 className="in-h3">{d.title}</h3><p>{d.body}</p></div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ACCREDITATION */}
      <section className="in-sec in-sec--band" id="accreditation" aria-labelledby="accreditation-h">
        <Container>
          <div className="da-head">
            <div>
              <p className="in-eyebrow">Accredited and qualified</p>
              <h2 className="in-h2" id="accreditation-h">An assessor you can verify</h2>
            </div>
            <p className="in-lede">
              Your EPC is only as trustworthy as the assessor behind it. L&amp;D Energy is led by {site.assessor.name}, an Elmhurst and
              Quidos accredited domestic energy assessor whose credentials you can check independently.
            </p>
          </div>
          <div className="da-ledger" role="table" aria-label="Accreditation">
            <div className="da-lr da-lr--h" role="row">
              <span role="columnheader">Scheme</span><span role="columnheader">Number</span><span role="columnheader">Check</span>
            </div>
            {records.map((r) => (
              <div key={r.number} className="da-lr" role="row">
                <span role="cell" className="da-lr__s">{r.scheme}</span>
                <span role="cell" className="da-lr__n num">{r.number}</span>
                <span role="cell">
                  <a className="in-link in-arrow" href={r.check} target="_blank" rel="noopener noreferrer" aria-label={`Verify ${r.label} accreditation ${r.number} on the official register`}>
                    Verify on the official register <Ico name="arrow-right" size={16} />
                  </a>
                </span>
              </div>
            ))}
          </div>
          <dl className="in-diffs da-facts">
            <div><dt>Method</dt><dd>RdSAP 10, the methodology approved for existing dwellings in England and Wales, in Elmhurst&apos;s government-approved software.</dd></div>
            <div><dt>Insured</dt><dd>{insurance.full}</dd></div>
            <div><dt>DBS checked</dt><dd>Elmhurst and Quidos both checked Abdul&apos;s DBS when he applied for accreditation.</dd></div>
          </dl>
          <p className="da-more">
            Read more about <Link className="in-link" href="/about">your assessor and our story</Link>, or check the live coverage
            across <Link className="in-link" href="/areas">all 32 London boroughs</Link>.
          </p>
        </Container>
      </section>

      {/* WHY LOCAL */}
      <section className="in-sec" id="why-local" aria-labelledby="local-h">
        <Container>
          <p className="in-eyebrow">Why local</p>
          <h2 className="in-h2" id="local-h">Why use a local London assessor</h2>
          <ul className="da-why">
            {whyLocal.map((w) => (
              <li key={w.title}>
                <h3 className="in-h3">{w.title}</h3>
                <p>{w.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Our promise, before the questions, as on /landlords (Abdul 24/10) */}
      <OurPromise />

      {/* QUESTIONS */}
      <section className="in-sec" id="faq" aria-labelledby="faq-h">
        <Container className="da-faqwrap">
          <div>
            <p className="in-eyebrow">FAQ</p>
            <h2 className="in-h2" id="faq-h">Domestic energy assessor FAQs</h2>
            <p className="in-note da-faqside">
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
      <RevealOnScroll {...innerReveals('.da', { lists: ['.da-steps', '.da-why', '.da-facts'] })} />

      <div id="book">
        <InnerEnding variant="a" source="assessor"
          heading="Get a quote from your London domestic energy assessor"
          text={`Elmhurst and Quidos accredited, all 32 boroughs, guide prices from £${priceFrom.epc}. Lodged in 72 hours, or the same day for £${SAME_DAY_LODGEMENT_SURCHARGE} extra.`} />
      </div>
    </div>
  )
}
