import type { Metadata } from 'next'
import Link from 'next/link'
import { OurPromise } from '@/components/sections/OurPromise'
import { ChevronDown, ShieldCheck } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Ico } from '@/components/sections/home/HomeIcon'
import { OnThisPage, type PageSection } from '@/components/inner/OnThisPage'
import { ReadNext, type NextStep } from '@/components/inner/ReadNext'
import { InnerEnding } from '@/components/inner/InnerEnding'
import { RevealOnScroll } from '@/components/inner/RevealOnScroll'
import {
  site, pricing, priceFrom, defaultOgImage, govUk, insurance, floorPlanDisclaimer, portfolioMinHomes, portfolioRatesText,
  SAME_DAY_LODGEMENT_SURCHARGE, NEXT_DAY_VISIT_SURCHARGE,
} from '@/lib/site'
import { areaServedLondon } from '@/lib/boroughs'
import { quoteHref } from '@/lib/quote-context'
import type { AreaChoice } from '@/lib/floor-area'
import '@/app/inner.css'
import './landlords.css'

/*
 * /landlords, rebuilt from the approved audience-pages prototype (Abdul 23/10/2026, "yes do the recommended"): area hero
 * D with the title-block price list and On this page, Read next C, ending A. Title and descriptions stay frozen until
 * 14/12; only the H1 changes. MEES figures re-checked against GOV.UK on 23/10/2026 (govUk in lib/site.ts).
 */
export const metadata: Metadata = {
  title: 'EPC for Landlords London | Domestic MEES Compliance',
  description: `Domestic EPC assessments for London landlords. See where your rental stands against the current band E requirement. Guide prices from £${priceFrom.epc}, exact quote before booking.`,
  alternates: { canonical: `${site.url}/landlords` },
  openGraph: {
    images: [defaultOgImage],
    title: 'EPC for Landlords London | Domestic MEES Compliance | L&D Energy',
    description: `Domestic EPC assessments for London landlords. Check where your rental stands against the current band E requirement. Guide prices from £${priceFrom.epc}, portfolio rates available.`,
    url: `${site.url}/landlords`,
  },
  twitter: {
    images: [defaultOgImage.url],
    title: 'EPC for Landlords London | Domestic MEES Compliance',
    description:
      'Domestic EPC assessments for London landlords. Check where your rental stands against the current band E requirement.',
  },
}

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
const portfolioWord = WORDS[portfolioMinHomes] ?? String(portfolioMinHomes)
const Portfolio = portfolioWord.charAt(0).toUpperCase() + portfolioWord.slice(1)

const listHref = `${site.whatsappHref}?text=${encodeURIComponent('Hi, I\'d like a quote for EPCs on these addresses:')}`
const q = (ctaId: 'hero' | 'pricing' | 'inline' | 'bottom') => quoteHref({ service: 'epc', sourcePage: 'landlords', ctaId })

/** Today's maximum penalties per property (GOV.UK landlord guidance, section 6, read 23/10/2026). */
const penalties = [
  { breach: 'Letting below E for under 3 months', max: 2000 },
  { breach: 'Letting below E for 3 months or more', max: 4000 },
  { breach: 'False information on the exemptions register', max: 1000 },
  { breach: 'Not complying with a compliance notice', max: 2000 },
]
const PENALTY_TOTAL = 5000
const PENALTY_2030 = 30000
const COST_CAP_2030 = 10000
const gbp = (n: number) => `£${n.toLocaleString('en-GB')}`

type Faq = { q: string; a: string; body?: React.ReactNode }
const faqs: Faq[] = [
  {
    q: 'When do I give my tenant the EPC?',
    a: 'Make it available to people looking at the property, and give your tenant a copy before the tenancy starts. In practice, have it ready before you advertise the let.',
  },
  {
    q: 'Do I need a new EPC for each tenant?',
    a: 'No. An EPC lasts 10 years and covers every tenancy in that time. You need a new one when it has expired and the law needs one again. Work you\'ve done doesn\'t cancel it, but a new assessment can record it.',
  },
  {
    q: 'Does the EPC make my let compliant?',
    a: 'It tells you where the property stands. If the rules cover the let and the rating is E or above, you meet today\'s minimum. An exemption has its own evidence and has to be registered; the EPC doesn\'t do that for you.',
  },
  {
    q: 'What are the penalties for letting below E?',
    a: `Councils enforce the rules. These are today's maximums per property, not automatic charges: ${penalties.map((p) => `${gbp(p.max)} for ${p.breach.charAt(0).toLowerCase()}${p.breach.slice(1)}`).join(', ')}, up to ${gbp(PENALTY_TOTAL)} in total. A council can also publish the breach. A ${gbp(PENALTY_2030)} maximum is planned for the 2030 standard but still needs legislation.`,
    body: (
      <>
        <p>Councils enforce the rules. These are today&apos;s maximums per property, not automatic charges:</p>
        <div className="in-tscroll">
          <table className="in-table lp-pen">
            <thead><tr><th>Breach</th><th className="r">Maximum</th></tr></thead>
            <tbody>
              {penalties.map((p) => <tr key={p.breach}><td>{p.breach}</td><td className="r num">{gbp(p.max)}</td></tr>)}
              <tr><th>Total per property</th><td className="r num"><b>{gbp(PENALTY_TOTAL)}</b></td></tr>
            </tbody>
          </table>
        </div>
        <p>
          A council can also publish the breach. A {gbp(PENALTY_2030)} maximum is planned for the 2030 standard but still needs
          legislation. Source: <a href={govUk.meesLandlordGuidance} target="_blank" rel="noopener">GOV.UK landlord guidance</a>.
        </p>
      </>
    ),
  },
  {
    q: 'Can my tenant be at home for the visit?',
    a: 'Yes. An adult who can open every part of the home needs to be there: you, your tenant or your agent. Tell us who, and we arrange the time with them.',
  },
  {
    q: 'Can you do my whole portfolio?',
    a: `Yes. Send the addresses in one message. We price each home by its size and group the visits by area across London. ${portfolioRatesText}`,
  },
]

const sections: PageSection[] = [
  { id: 'stands', heading: 'stands-h', label: 'Where your rental stands' },
  { id: 'portfolio', heading: 'portfolio-h', label: 'One let or a portfolio' },
  { id: 'visit', heading: 'visit-h', label: 'How the visit works' },
  { id: 'low', heading: 'low-h', label: 'If it comes back F or G' },
  { id: 'questions', heading: 'questions-h', label: 'Landlord questions' },
  { id: 'book', heading: 'in-end-h', label: 'Get my exact quote' },
]

const readNext: NextStep[] = [
  { kicker: 'Letting and MEES', title: 'The rules and the fines, in full', href: '/blog/mees-regulations-2026',
    text: 'Who the minimum covers, how exemptions work and what councils can charge.' },
  { kicker: 'What\'s coming', title: 'The 2030 standard for rented homes', href: '/blog/epc-c-by-2030',
    text: `What is settled, what still needs legislation, and the ${gbp(COST_CAP_2030)} cap.` },
  { kicker: 'Borough figures', title: 'EPC ratings in every borough', href: '/epc-ratings-by-borough',
    text: 'How homes rate across all 33 London councils, from GOV.UK data.' },
  { kicker: 'Using an agent?', title: 'Your agent can book it', href: '/estate-agents', go: true, cta: 'Agents',
    text: 'One home or a list, with the certificate sent straight to the branch.' },
]

const schema = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
      { '@type': 'ListItem', position: 2, name: 'Landlords', item: `${site.url}/landlords` },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Energy Performance Certificate',
    name: 'EPCs for London landlords',
    description: 'Domestic EPCs for rented homes across London, one let or a portfolio, lodged on the GOV.UK register within 72 hours.',
    provider: { '@id': `${site.url}/#business` },
    url: `${site.url}/landlords`,
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

export default function LandlordsPage() {
  const reg = site.assessor.accreditations
  return (
    <div className="in lp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* HERO: area hero D (title-block price list and On this page) with the drawn terrace */}
      <section className="in-hd" aria-labelledby="lp-h1">
        <Container>
          <nav className="in-crumbs" aria-label="Breadcrumb">
            <ol>
              <li><Link href="/">Home</Link><span className="sep" aria-hidden="true">›</span></li>
              <li><span aria-current="page">Landlords</span></li>
            </ol>
          </nav>
          <div className="in-hd__grid lp-hd">
            <div className="in-hd__copy">
              <p className="in-eyebrow">For landlords</p>
              <h1 id="lp-h1">EPCs for London landlords</h1>
              <p className="in-hd__answer">
                One rental or twenty. Each home gets one accredited visit and a certificate on the GOV.UK register <b>within 72 hours</b>.
                You get a straight answer on where it stands against the E minimum, and your exact price before you book.
              </p>
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
              <img src="/home/terrace-cutaway-1600.webp" srcSet="/home/terrace-cutaway-900.webp 900w, /home/terrace-cutaway-1600.webp 1600w"
                sizes="(max-width: 899px) 92vw, 46vw" width={1600} height={900} fetchPriority="high"
                alt="A London terrace with its front wall cut away, showing the loft, two bedrooms, the front room and the kitchen" />
              <figcaption className="in-hd__cap">What we record: walls, loft, windows, heating and hot water, lighting and floor area, room by room. An AI-generated illustration.</figcaption>
            </figure>

            <aside className="in-tb lp-tb" aria-labelledby="lp-tb-h">
              <div className="in-tb__head">
                <div><span>Service</span><b id="lp-tb-h">Domestic EPC</b></div>
                <div><span>For</span><b>Landlords</b></div>
                <div><span>Status</span><b>Guide price</b></div>
              </div>
              <div className="in-tb__cols" aria-hidden="true"><span>Floor area</span><span>Price</span><span /></div>
              <ul className="in-tb__rows">
                {pricing.map((b) => (
                  <li key={b.id}>
                    <a href={quoteHref({ service: 'epc', area: b.id as AreaChoice, sourcePage: 'landlords', ctaId: 'pricing' })}>
                      <span className="in-tb__s">{b.areaLabel}<small>{b.typicalLabel}</small></span>
                      <span className="in-tb__p num">{b.startingPrice && <small>from</small>}£{b.epc}</span>
                      <Ico name="arrow-right" size={16} />
                    </a>
                  </li>
                ))}
                <li>
                  <a className="is-common" href={quoteHref({ service: 'bulk', sourcePage: 'landlords', ctaId: 'pricing' })}>
                    <span className="in-tb__s">{Portfolio} homes or more<small>Each home priced by its size, visits grouped by area</small></span>
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
                  visit with lodgement that day <b>£{NEXT_DAY_VISIT_SURCHARGE}</b> extra. No travel charges, and you pay once the visit is done.
                </p>
              </div>
            </aside>

            <OnThisPage sections={sections} />
          </div>
        </Container>
      </section>

      {/* WHERE YOUR RENTAL STANDS */}
      <section className="in-sec in-sec--band" id="stands" aria-labelledby="stands-h">
        <Container>
          <p className="in-eyebrow" data-reveal>The rule today</p>
          <h2 className="in-h2" id="stands-h" data-reveal>Where your rental stands</h2>
          <p className="in-lede" data-reveal>For lets the rules cover in England and Wales, the minimum is E, unless a valid exemption is registered. Your EPC shows which of these you are in.</p>
          <ul className="lp-bands" data-reveal="list">
            <li>
              <div className="lp-bands__k">
                <span className="lp-chip lp-chip--w" style={{ '--c': 'var(--epc-a)' } as React.CSSProperties}>A</span>
                <span className="lp-chip" style={{ '--c': 'var(--epc-c)' } as React.CSSProperties}>C</span>
                <span className="lp-chip" style={{ '--c': 'var(--epc-e)' } as React.CSSProperties}>E</span>
                <span className="lp-bands__lbl">A to E</span>
              </div>
              <h3 className="in-h3">You can let it</h3>
              <p>Keep the certificate valid. It lasts 10 years and covers every tenancy in that time.</p>
            </li>
            <li>
              <div className="lp-bands__k">
                <span className="lp-chip" style={{ '--c': 'var(--epc-f)' } as React.CSSProperties}>F</span>
                <span className="lp-chip lp-chip--w" style={{ '--c': 'var(--epc-g)' } as React.CSSProperties}>G</span>
                <span className="lp-bands__lbl">F or G</span>
              </div>
              <h3 className="in-h3">Improve it, or register an exemption</h3>
              <p>Bring it up to E, or register a valid exemption, before you let it or carry on letting it. This applies to existing tenancies too.</p>
            </li>
            <li>
              <div className="lp-bands__k">
                <span className="lp-chip lp-chip--none">?</span>
                <span className="lp-bands__lbl">No EPC, or expired</span>
              </div>
              <h3 className="in-h3">Get a new one first</h3>
              <p>Have it ready before you market the let. Your tenant needs a copy before the tenancy starts.</p>
            </li>
          </ul>
          <div className="lp-2030" data-reveal>
            <p className="in-eyebrow">2030: confirmed, not law yet</p>
            <p>
              Government has confirmed a higher standard, equivalent to C, from 1 October 2030, with a {gbp(COST_CAP_2030)} cost cap per
              property. It still needs legislation. Until then the minimum stays at E.{' '}
              <Link className="in-link" href="/blog/epc-c-by-2030">What the 2030 standard means</Link>
            </p>
          </div>
          <p className="in-src" data-reveal>
            Sources: GOV.UK <a href={govUk.meesLandlordGuidance} target="_blank" rel="noopener">landlord guidance on the minimum standard</a> and
            the <a href={govUk.prsResponse2026} target="_blank" rel="noopener">January 2026 government response</a>. HMOs, holiday lets and
            listed buildings need their own check. An EPC shows the rating; it does not register an exemption.
          </p>
        </Container>
      </section>

      {/* ONE LET OR A PORTFOLIO */}
      <section className="in-sec" id="portfolio" aria-labelledby="portfolio-h">
        <Container>
          <p className="in-eyebrow" data-reveal>How you book</p>
          <h2 className="in-h2" id="portfolio-h" data-reveal>One let or a portfolio</h2>
          <div className="lp-ways" data-reveal="list">
            <article className="lp-way">
              <span className="lp-way__ico"><Ico name="house" size={28} /></span>
              <h3 className="in-h3">One home</h3>
              <p>Send the address and the size. We confirm the price and a time. If a tenant lives there, we arrange access with them or your agent.</p>
              <a className="in-arrow in-link" href={q('inline')}>Get my exact quote <Ico name="arrow-right" size={16} /></a>
            </article>
            <article className="lp-way">
              <span className="lp-way__ico"><Ico name="flat" size={28} /></span>
              <h3 className="in-h3">{Portfolio} homes or more</h3>
              <p>
                Send the addresses in one message. We price each home by its size, group the visits by area
                and send every certificate to you, or to your agent with your permission.
              </p>
              {/* Abdul's approved portfolio rates (24/10), word for word from lib/site.ts */}
              <p className="lp-way__rates">{portfolioRatesText}</p>
              <a className="in-arrow in-link" href={listHref} target="_blank" rel="noopener noreferrer">WhatsApp the list <Ico name="arrow-right" size={16} /></a>
            </article>
            <article className="lp-way">
              <span className="lp-way__ico"><Ico name="floor-plan" size={28} /></span>
              <h3 className="in-h3">A floor plan for a licence</h3>
              <p>If your council asks for one with a licence application, we draw the floor plan on the same visit as the EPC.</p>
              <p className="lp-way__note">{floorPlanDisclaimer}</p>
              <Link className="in-arrow in-link" href="/services/floor-plans">Floor Plans <Ico name="arrow-right" size={16} /></Link>
            </article>
          </div>
          <figure className="lp-quote" data-reveal>
            <blockquote>
              <p>I needed a floor plan for my flat that met the requirements for a property licence application. The whole process was smooth, efficient, and professional, with a very quick turnaround.</p>
            </blockquote>
            <figcaption>
              <span className="lp-stars" aria-label="5 stars">★★★★★</span> Anum T., floor plan for a property licence ·{' '}
              <a href={site.reviews.profileUrl} target="_blank" rel="noopener">Google review</a>
            </figcaption>
          </figure>
        </Container>
      </section>

      {/* HOW THE VISIT WORKS */}
      <section className="in-sec in-sec--band" id="visit" aria-labelledby="visit-h">
        <Container className="lp-visit">
          <div data-reveal>
            <p className="in-eyebrow">On the day</p>
            <h2 className="in-h2" id="visit-h">How the visit works</h2>
            <p className="in-lede">Your tenant doesn&apos;t need to move out or clear anything. We need to reach every room, the loft hatch (if there is one), the boiler and the meters.</p>
            {/* eslint-disable-next-line @next/next/no-img-element -- WebP from the homepage; next/image is unoptimised on Pages */}
            <img className="lp-visit__img" src="/home/assessor-visit-900.webp" width={900} height={600} loading="lazy" decoding="async"
              alt="An assessor in a sage jacket measures a London front room with a laser measure, beside a sash window and a column radiator" />
          </div>
          <ol className="lp-steps" data-reveal="list">
            <li><span className="lp-steps__n">1</span><div><h3 className="in-h3">You book</h3><p>Send the address and the floor area, or tell us you&apos;re not sure. We confirm the exact price and a time before you agree. Same working-day reply.</p></div></li>
            <li><span className="lp-steps__n">2</span><div><h3 className="in-h3">We visit</h3><p>Every room is measured with a laser, and the insulation, heating, hot water, windows and lighting are recorded. About 45 minutes for a studio, up to 2 hours for a large home.</p></div></li>
            <li><span className="lp-steps__n">3</span><div><h3 className="in-h3">Ready within 72 hours</h3><p>Your EPC goes on the GOV.UK register with its recommendations, and the link comes to you, or to your agent if you ask.</p></div></li>
          </ol>
        </Container>
      </section>

      {/* IF IT COMES BACK F OR G */}
      <section className="in-sec" id="low" aria-labelledby="low-h">
        <Container className="lp-low">
          <div data-reveal>
            <p className="in-eyebrow">Straight answer</p>
            <h2 className="in-h2" id="low-h">If it comes back F or G</h2>
            <p className="in-lede">
              We record the property and approved software works out the rating. Nobody can move it by hand, so we can&apos;t promise a band.
              Evidence of work you&apos;ve done does count, so <Link className="in-link" href="/preparing-for-your-epc#documents-and-evidence">have it ready</Link>.
            </p>
          </div>
          <dl className="in-diffs lp-opts" data-reveal="list">
            <div><dt>Included</dt><dd><b>The recommendations</b> on every EPC list the improvements that could raise the rating, with a rough cost for each.</dd></div>
            <div><dt>£{site.addOns.improvementPlan} extra</dt><dd><b><Link className="in-link" href="/services/epc-improvement-plan">EPC Improvement Plan</Link>.</b> Abdul writes out what is holding the rating back and what to do first, with the full Elmhurst Energy Report behind it.</dd></div>
            <div><dt>From £{priceFrom.preAssessment}</dt><dd><b><Link className="in-link" href="/services/epc-pre-assessment">EPC Pre-Assessment</Link>.</b> Planning works before re-letting? The same survey, not lodged, so you know the rating before anything goes on the register.</dd></div>
          </dl>
        </Container>
      </section>

      {/* PROOF */}
      <section className="in-sec in-sec--band" aria-labelledby="proof-h">
        <Container>
          <p className="in-eyebrow" data-reveal>Check us before you book</p>
          <h2 className="in-h2" id="proof-h" data-reveal>{site.reviews.ratingValue.toFixed(1)} on Google <span className="lp-quiet">from {site.reviews.reviewCount} reviews</span></h2>
          <ul className="lp-trust" data-reveal="list">
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
      <section className="in-sec" id="questions" aria-labelledby="questions-h">
        <Container className="lp-faqwrap">
          <div data-reveal>
            <p className="in-eyebrow">Landlord questions</p>
            <h2 className="in-h2" id="questions-h">Before you book</h2>
            <p className="in-note lp-faqside">
              Not covered here? <a className="in-link" href={site.whatsappHref} target="_blank" rel="noopener">WhatsApp us</a>, or read
              the <Link className="in-link" href="/blog/mees-regulations-2026">full guide to the rules</Link>.
            </p>
          </div>
          <div className="in-faq" data-reveal>
            {faqs.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary><span>{f.q}</span><ChevronDown size={20} className="i" aria-hidden="true" /></summary>
                <div className="in-faq__a">{f.body ?? <p>{f.a}</p>}</div>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <ReadNext steps={readNext} />

      {/* section reveals (motion, Considered); Our promise, Read next and the ending are shared parts, marked by selector */}
      <RevealOnScroll blocks={['.lp .op__in', '.lp .in-rn h2', '.lp .in-end-a__in']} lists={['.lp .in-ncards']} />

      <div id="book">
        <InnerEnding variant="a" source="landlords"
          eyebrow={<>Landlords · from <span className="num">£{priceFrom.epc}</span></>}
          heading="Get a quote for your rental"
          text="Send the address and the size, or a list of them. We confirm your exact price and a visit time before you book."
          whatsapp={{ href: listHref, label: 'Or WhatsApp a list of addresses' }} />
      </div>
    </div>
  )
}
