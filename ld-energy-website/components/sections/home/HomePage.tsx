import Link from 'next/link'
import { preload } from 'react-dom'
import { site, priceFrom, maxBundleSaving, insurance, SAME_DAY_LODGEMENT_SURCHARGE, NEXT_DAY_VISIT_SURCHARGE } from '@/lib/site'
import { boroughList } from '@/lib/boroughs'
import { DATA_PAGE_PATH } from '@/lib/borough-ratings'
import { whatsappQuoteHref } from '@/lib/area-page'
import { homeBookingFaqs } from '@/lib/homepage-content'
import { quoteHref } from '@/lib/quote-context'
import { HomeQuoteProvider } from './HomeQuoteContext'
import { HomeQuoteCard } from './HomeQuoteCard'
import { HomeV7Motion } from './HomeV7Motion'
import { HeroSky } from './HeroSky'
import { PickService } from './PickService'
import { HomeQuoteBar } from './HomeQuoteBar'
import { Ico } from './HomeIcon'
import { HERO_PLAN_SVG } from './v7-assets'

/*
 * The homepage body, ported from the approved prototype v7.2 (Abdul 22/10/2026): the rooftop hero with the rating
 * climb, How it works as a timeline, a photo break, What you get with each service and the Pre-Assessment strip,
 * Prices (the live booking form, restyled only), Proof, the FAQ, Guides and the close. Copy is the prototype's;
 * every price and fact comes from lib/site.ts; WhatsApp is the approved prefill (whatsappQuoteHref). The H1 keeps the
 * live wording until 14/12 (references/local-seo.md).
 */

const rating = site.reviews.ratingValue.toFixed(1)
const stars = '★'.repeat(Math.round(site.reviews.ratingValue)) + '☆'.repeat(5 - Math.round(site.reviews.ratingValue))
const [elmhurst, quidos] = site.assessor.accreditations
const ext = { target: '_blank', rel: 'noopener noreferrer' } as const

function Rating() {
  return (
    <a className="lde-rating" href={site.reviews.profileUrl} {...ext}>
      <b>{rating}</b><span className="sr-only"> out of 5,</span><span className="lde-stars" aria-hidden="true">{stars}</span><span className="lde-count">{site.reviews.reviewCount} Google reviews</span>
    </a>
  )
}

function Facts() {
  return (
    <ul className="facts">
      <li><Ico name="check" />No upfront payment</li>
      <li><Ico name="map-pin" />No travel charges</li>
    </ul>
  )
}

/** One plane of the scene: a phone cut (portrait) and a desktop cut (wide) of the same morning. */
function Hero() {
  const wa = whatsappQuoteHref()
  return (
    <section id="top" className="hp-hero hp-hero--dusk" aria-labelledby="home-h1">
      <div className="hero__stage">
        <div className="scene-wrap">
          <div className="scene" aria-hidden="true">
            {/* hero B-wide at dusk (Abdul 23/10: "Dusk. New picture, reversed logo, light text"): one 21:9 plane on
                desktop, a taller crop round the cut-open house on phones that fades into the night at its top edge;
                HeroSky draws the stars and the rooms lighting up over it. The motion script still writes the far, glow and mist planes,
                so they stay as empty boxes */}
            <div className="pl pl--far" />
            <div className="pl pl--glow" />
            <div className="pl pl--mid">
              {/* eslint-disable-next-line @next/next/no-img-element -- next/image is unoptimised on Pages */}
              <picture>
                <source media="(max-width: 759px)" srcSet="/home/hero-dusk-phone-800.webp 800w, /home/hero-dusk-phone-1200.webp 1200w" sizes="100vw" width={1200} height={743} />
                <img src="/home/hero-dusk-1600.webp" srcSet="/home/hero-dusk-900.webp 900w, /home/hero-dusk-1600.webp 1600w, /home/hero-dusk-2560.webp 2560w" sizes="100vw" alt="" width={1600} height={689} fetchPriority="high" />
              </picture>
              <HeroSky />
            </div>
            <div className="pl pl--mist" />
          </div>
          <span className="hero__scrim" aria-hidden="true" />
          <div className="hero__copy wrap">
            {/* H1 option C (Abdul 23/10): the page's one H1 keeps the frozen live wording (references/local-seo.md, until
                14/12) as the kicker; the big line is the prototype's headline, set as a paragraph, not a heading */}
            <div className="hero__head">
              <h1 id="home-h1" className="eyebrow">Domestic EPCs in London</h1>
              <p className="hero__title">Your EPC, ready within 72&nbsp;hours</p>
            </div>
            <p className="hero__sub">One accredited visit for London landlords and letting agents. Your exact price is confirmed before you book.</p>
            <div className="hero__cta">
              {/* opens the quote dialog over the page (Abdul 23/10: "cross it off and continue to scroll"); /quote without JS */}
              <a className="btn btn-primary" id="hero-quote" href={quoteHref({ sourcePage: 'home', ctaId: 'hero' })}>Get my exact quote</a>
              <a className="link arrow-link" href={wa} {...ext}>Or message us on WhatsApp</a>
            </div>
          </div>
          <p className="hero__credit">An AI-generated illustration.</p>
        </div>

        {/* the sheet: its strip is in the first screen; the example report rises over the scene as the page moves */}
        <div className="report">
          <div className="strip">
            <div className="wrap">
              <p className="strip__item"><span className="eyebrow">Domestic EPC</span><span className="price"><small>from</small>£{priceFrom.epc}</span></p>
              <p className="strip__item"><span className="eyebrow">EPC + floor plan</span><span className="price"><small>from</small>£{priceFrom.bundle}</span></p>
              <p className="strip__item"><Rating /></p>
              <Facts />
            </div>
          </div>
          <div className="report__body wrap">
            {/* phones: the rating and the two facts, which the strip has no room for */}
            <div className="report__rating"><Rating /><Facts /></div>
            <p className="report__cap"><span className="eyebrow">Example property · what one visit gives you</span><span className="eyebrow">Illustrative figures</span></p>
            <div className="report__grid" aria-hidden="true">
              <figure className="report__plan">
                <div dangerouslySetInnerHTML={{ __html: HERO_PLAN_SVG }} />
                <figcaption>The floor plan, measured on the visit.</figcaption>
              </figure>
              <div className="graph">
                <span className="graph__h">Energy rating</span><span className="graph__h">Current</span><span className="graph__h">Potential</span>
                <ol className="bars">
                  {([['a', '92+', 46, true], ['b', '81-91', 55, true], ['c', '69-80', 64], ['d', '55-68', 73], ['e', '39-54', 82], ['f', '21-38', 91], ['g', '1-20', 100, true]] as const).map(([band, range, width, dark]) => (
                    <li key={band} className={dark ? 'on-dark' : undefined} style={{ ['--c' as string]: `var(--epc-${band})`, width: `${width}%` }}><span>{range}</span><b>{band.toUpperCase()}</b></li>
                  ))}
                </ol>
                <div className="gcol"><span className="garrow" style={{ ['--row' as string]: 5 }} data-band="F">34</span></div>
                <div className="gcol"><span className="garrow" data-pot style={{ ['--row' as string]: 5 }} data-band="F"><span className="odo" data-pot-score dangerouslySetInnerHTML={{ __html: '34' }} /></span></div>
                <p className="graph__note">The EPC, with its recommendations.</p>
              </div>
              <div>
                <ol className="measures">
                  {[['Loft insulation to 270 mm', 'E', 44], ['Hot water cylinder insulation', 'E', 48], ['Heating controls', 'E', 52], ['Condensing boiler', 'D', 58]].map(([what, band, score], i) => (
                    <li key={what}><b>{i + 1}</b><span>{what}</span><span className="res" data-band={band}>{band} {score}</span></li>
                  ))}
                </ol>
                <p className="verdict" dangerouslySetInnerHTML={{ __html: 'Below the E minimum for letting.' }} />
              </div>
            </div>
            <p className="sr-only">Example property, illustrative figures. A floor plan measured on the visit, and the EPC: current rating F, 34. With loft insulation to 270 mm it reaches E 44, with hot water cylinder insulation E 48, with heating controls E 52, and with a condensing boiler D 58.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

const worthKnowing = [
  { icon: 'pound', href: '/preparing-for-your-epc#quote-and-property-complexity', title: 'Tell us about every floor', body: 'Your price is based on the details you send. A flat on two floors (a maisonette), an extension or a loft room can change it, so mention them. Anything different on the day is agreed before the assessment begins.' },
  { icon: 'epc-rating', href: '/preparing-for-your-epc#how-your-epc-rating-is-calculated', title: 'We can’t add a point or two', body: 'We record the property and the approved software works out the score. Nobody can adjust it by hand. Evidence of improvements you’ve made does count, so have it ready.' },
  { icon: 'calendar', href: '/preparing-for-your-epc#rdsap-10', title: 'Different from next door, or your old EPC?', body: 'Existing homes have used RdSAP 10, a more detailed method, since June 2025, so an older EPC may not match. A neighbour’s can differ too, because each home’s floor area, insulation and heating are recorded as they are.' },
]
const prep = [
  'Arrange access to rooms and the loft hatch, where present.',
  'Keep heating, hot-water controls and meters accessible.',
  'Have evidence of relevant improvements ready, if available.',
  'Coordinate keys and access with occupants or tenants.',
]

function HowItWorks() {
  return (
    <section className="sec" id="how" aria-labelledby="how-title">
      <div className="wrap">
        <div className="how__head">
          <p className="eyebrow">How it works</p>
          <h2 className="statement" id="how-title">One visit, then the paperwork is done</h2>
          <p className="lede-l">Your assessor does the measuring and the recording. You get the certificate and, if you want it, the plan.</p>
        </div>
        <div className="how__grid">
          <div className="tl" id="tl">
            <span className="tl__rail" aria-hidden="true"><span className="tl__fill" /><span className="tl__head" /></span>
            <ol className="tl__list">
              <li className="tl__step">
                <p className="tl__n" aria-hidden="true">1</p>
                <div className="tl__body">
                  <h3>You book</h3>
                  <p>Send the address and floor area, or tell us you’re not sure. We confirm the exact price and a time before you agree.</p>
                  <p className="tl__fact"><Ico name="clock" />Same working-day reply. Next-day appointments available.</p>
                </div>
              </li>
              <li className="tl__step">
                <p className="tl__n" aria-hidden="true">2</p>
                <div className="tl__body">
                  <h3>Your assessor visits</h3>
                  <p>Every room is measured with a laser, and the insulation, heating, hot water, windows and ventilation are recorded.</p>
                  <p className="tl__fact"><Ico name="clock" />45 minutes for a studio, up to 2 hours for a large home.</p>
                  <div className="prep" id="before-the-visit">
                    <h4>Before your visit</h4>
                    <ul className="ticks">{prep.map((p) => <li key={p}><Ico name="check" />{p}</li>)}</ul>
                    <Link prefetch={false} className="link arrow-link" href="/preparing-for-your-epc">Full preparation checklist <Ico name="arrow-right" /></Link>
                  </div>
                </div>
              </li>
              <li className="tl__step">
                <p className="tl__n" aria-hidden="true">3</p>
                <div className="tl__body">
                  <h3>Ready within 72 hours</h3>
                  <p>Your EPC goes on the GOV.UK register with its recommendations, and the certificate link comes to you once it is live. Floor plans come as JPG and PDF, drawn to scale.</p>
                  <p className="tl__fact"><Ico name="calendar" />Same-day lodgement, £{SAME_DAY_LODGEMENT_SURCHARGE} more. Next-day visit and lodgement, £{NEXT_DAY_VISIT_SURCHARGE} more.</p>
                </div>
              </li>
            </ol>
          </div>
          <aside className="notes" id="worth-knowing" aria-labelledby="worth-title">
            <h3 className="notes__t" id="worth-title">Three things worth knowing first</h3>
            <ul>
              {worthKnowing.map((n) => (
                <li key={n.title}><Ico name={n.icon} /><div><h4><Link prefetch={false} href={n.href}>{n.title}</Link></h4><p>{n.body}</p></div></li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  )
}

function PhotoBreak() {
  // replaced the AI street photo (Abdul 23/10: "looks a bit random") with scene 3, the assessor on the visit, his board pick
  return (
    <figure className="break break--scene wrap">
      {/* eslint-disable-next-line @next/next/no-img-element -- next/image is unoptimised on Pages */}
      <img src="/home/assessor-visit-1600.webp" srcSet="/home/assessor-visit-900.webp 900w, /home/assessor-visit-1600.webp 1600w" sizes="(max-width: 1240px) 92vw, 1140px" alt="An assessor in a sage jacket measures a London front room with a laser measure, beside a sash window and a column radiator" width={1600} height={1067} loading="lazy" decoding="async" />
      <figcaption>Every room is measured and the heating, windows and insulation recorded. An AI-generated illustration.</figcaption>
    </figure>
  )
}

// what the assessor checks, on the AI-polished terrace (scene 1B, 23/10): numbered markers on the drawing, the key as
// live text underneath so the house stays clear at phone width; x/y are % of the 1600x900 image
const CUTAWAY_POINTS = [
  { t: 'Loft', s: 'insulation depth', x: 43.8, y: 25.3 },
  { t: 'Walls', s: 'solid brick or cavity', x: 29.3, y: 62.2 },
  { t: 'Windows', s: 'glazing and frames', x: 70.5, y: 43.6 },
  { t: 'Heating', s: 'boiler and controls', x: 58.4, y: 58.2 },
] as const

function TerraceCutaway() {
  return (
    <figure className="pre__art tc">
      <div className="tc__pic">
        {/* eslint-disable-next-line @next/next/no-img-element -- next/image is unoptimised on Pages */}
        <img src="/home/terrace-cutaway-900.webp" srcSet="/home/terrace-cutaway-900.webp 900w, /home/terrace-cutaway-1600.webp 1600w" sizes="(max-width: 899px) 92vw, 42vw" alt="A London terrace house with its front wall cut away, showing the loft, bedrooms, front room with fireplace and the kitchen boiler" width={1600} height={900} loading="lazy" decoding="async" />
        {CUTAWAY_POINTS.map(({ t, x, y }, i) => <span key={t} className="tc__m" style={{ left: `${x}%`, top: `${y}%` }} aria-hidden="true">{i + 1}</span>)}
      </div>
      <ol className="tc__key">{CUTAWAY_POINTS.map(({ t, s }, i) => <li key={t}><i aria-hidden="true">{i + 1}</i><b>{t}</b><span>{s}</span></li>)}</ol>
      <figcaption className="tc__cap">What the assessor checks. An AI-generated illustration.</figcaption>
    </figure>
  )
}

function Ticks({ items }: { items: string[] }) {
  return <ul className="ticks">{items.map((t) => <li key={t}><Ico name="check" />{t}</li>)}</ul>
}

function Services() {
  return (
    <section className="sec" id="services" aria-labelledby="services-title">
      <div className="wrap">
        <div className="offers__head">
          <h2 className="statement" id="services-title">What you get with each service</h2>
          <p className="lede-l">More than a certificate: an accredited assessment on site, files you can use straight away, and a clear next step.</p>
        </div>
        <ul className="offers">
          <li className="offer" id="offer-epc">
            <div className="offer__top"><span className="offer__ico"><Ico name="document" /></span></div>
            <h3>Domestic EPC</h3>
            <p className="offer__for">For lettings, sales and your own home</p>
            <div className="offer__groups">
              <div><p className="offer__g">On the visit</p><Ticks items={['On-site assessment by an accredited Domestic Energy Assessor']} /></div>
              <div><p className="offer__g">You receive</p><Ticks items={['Your EPC, lodged on the official GOV.UK EPC Register', 'A certificate link once it is live on the register', 'The standard recommendation report, where applicable', 'A certificate valid for 10 years']} /></div>
              <div><p className="offer__g">Optional</p>
                <ul className="ticks"><li><span className="plus" aria-hidden="true" />£{site.addOns.improvementPlan} Improvement Plan: your priorities, with the full Energy Report</li></ul></div>
            </div>
            <div className="offer__foot">
              {/* price by the button (Abdul 23/10): the three line up on one baseline, the hero strip already leads with "from" */}
              <div className="offer__cost"><p className="offer__price"><small>from</small>£{priceFrom.epc}</p><p className="offer__note">Exact price confirmed before booking</p></div>
              <PickService service="epc" className="btn btn-line">See my EPC price</PickService>
              <Link prefetch={false} className="link arrow-link" href="/services/domestic-epc">Domestic EPC details <Ico name="arrow-right" /></Link>
            </div>
          </li>
          <li className="offer offer--feature" id="offer-bundle">
            <div className="offer__top"><span className="offer__ico"><Ico name="floor-plan" /></span><span className="offer__flag">One visit · save up to £{maxBundleSaving}</span></div>
            <h3>EPC + Floor Plan</h3>
            <p className="offer__for">For sellers, re-lets and agents preparing a listing</p>
            <div className="offer__groups">
              <div><p className="offer__g">Everything in the Domestic EPC</p><Ticks items={['Assessment, lodged EPC, certificate link and recommendation report']} /></div>
              <div><p className="offer__g">Plus the floor plan</p><Ticks items={['Laser-measured plan for Rightmove, Zoopla and OnTheMarket', 'Total floor area, approximate room dimensions and labels', 'High-resolution JPEG and PDF files']} /></div>
              <div><p className="offer__g">Why together</p><Ticks items={['Both surveys are completed during the same property visit']} /></div>
            </div>
            <div className="offer__foot">
              <div className="offer__cost"><p className="offer__price"><small>from</small>£{priceFrom.bundle}</p><p className="offer__note">Exact price confirmed before booking</p></div>
              <PickService service="bundle" className="btn btn-primary">See my EPC + Floor Plan price</PickService>
              <Link prefetch={false} className="link arrow-link" href="/pricing">EPC and floor plan pricing <Ico name="arrow-right" /></Link>
            </div>
          </li>
          <li className="offer" id="offer-fp">
            <div className="offer__top"><span className="offer__ico"><Ico name="dimension" /></span></div>
            <h3>Floor Plan</h3>
            <p className="offer__for">For sellers, <Link prefetch={false} className="link" href="/estate-agents">estate agents</Link>, rental listings and property licence applications</p>
            <div className="offer__groups">
              <div><p className="offer__g">On the visit</p><Ticks items={['Every room laser-measured on site']} /></div>
              <div><p className="offer__g">You receive</p><Ticks items={['Total floor area, as gross internal area', 'Approximate room dimensions and room labels', 'High-resolution JPEG and PDF files', 'A plan suitable for Rightmove, Zoopla and OnTheMarket']} /></div>
            </div>
            <div className="offer__foot">
              <div className="offer__cost"><p className="offer__price"><small>from</small>£{priceFrom.floorPlan}</p><p className="offer__note">Exact price confirmed before booking</p></div>
              <PickService service="floor-plan" className="btn btn-line">See my Floor Plan price</PickService>
              <Link prefetch={false} className="link arrow-link" href="/services/floor-plans">Floor plan details <Ico name="arrow-right" /></Link>
            </div>
          </li>
        </ul>

        {/* the Pre-Assessment as a strip under the three services, with the first L&D drawing beside it */}
        <div className="pre" id="pre-assessment">
          <TerraceCutaway />
          <div className="pre__body">
            <p className="eyebrow">Your score, privately</p>
            <h3>An EPC Pre-Assessment</h3>
            <p>The same survey as an EPC, with nothing lodged on the public register. Your personalised improvement plan is included, from £{priceFrom.preAssessment}.</p>
            <p className="pre__fine">A pre-assessment isn’t a retrofit assessment, and it isn’t an EPC. It can’t be used to market a sale or a let, or to show that a rented home meets the minimum energy efficiency standard. We can lodge the EPC within 18 months of the visit, as long as nothing about the home has changed.</p>
            <div className="pre__cta">
              <PickService service="pre-assessment" className="btn btn-line">See my Pre-Assessment price</PickService>
              <Link prefetch={false} className="link arrow-link" href="/services/epc-pre-assessment">How it works <Ico name="arrow-right" /></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Prices() {
  return (
    <section className="sec prices" id="prices" aria-labelledby="prices-title">
      <div className="wrap">
        <div className="prices__head">
          <div style={{ display: 'grid', gap: 20 }}>
            <p className="eyebrow">Prices</p>
            <h2 className="statement" id="prices-title">Prices, by floor area</h2>
          </div>
          <div className="prices__side">
            <p className="lede">Guide prices. We confirm your exact quote before you book. No travel charges.</p>
            <Rating />
            <a className="acc-line" href={site.assessor.verifyUrl} {...ext}><Ico name="epc-rating" /><span>Elmhurst and Quidos accredited assessor, <span className="num">{elmhurst.number}</span> and <span className="num">{quidos.number}</span>. <u>Check the GOV.UK register</u></span></a>
          </div>
        </div>
        {/* the live booking form, unchanged; the dock and the old #pricing links land here */}
        <div id="pricing" className="scroll-mt-28"><HomeQuoteCard /></div>
      </div>
    </section>
  )
}

/** Real Google reviews, word for word (references/reviews-2026-10-21), credited by first name and surname initial (Abdul 23/10/2026: reads as a real person; Google shows the names publicly). */
const quotes = [
  { who: 'Anum T.', what: 'floor plan for a property licence', paras: ['Excellent service from start to finish! I needed a floor plan for my flat that met the requirements for a property licence application. The whole process was smooth, efficient, and professional, with a very quick turnaround. The pricing was also very reasonable and offered great value for money. I’m really pleased with the service and would highly recommend L&D Energy to anyone needing a floor plan for their property. Thank you!'] },
  { who: 'Abiola O.', what: 'EPC', paras: ['I was very pleased with the service provided by L&D Energy. My EPC was completed within a day, which was extremely impressive. The service was quick, efficient and professional, and the whole process was smooth and hassle-free.', 'I really appreciate the prompt turnaround and would happily recommend L&D Energy to anyone looking for a reliable EPC service.', 'Thank you for the excellent service!'] },
]

function Proof() {
  const areas = [...boroughList].sort((a, b) => a.name.localeCompare(b.name))
  return (
    <section className="sec" id="proof" aria-labelledby="proof-title">
      <div className="wrap">
        <div className="proof__big">
          <h2 className="eyebrow" id="proof-title">Check us before you book</h2>
          <div><span className="proof__stars" aria-hidden="true">{stars}</span><p className="statement">{rating} on Google <em>from {site.reviews.reviewCount} reviews</em></p></div>
          <a className="link arrow-link" href={site.reviews.profileUrl} {...ext}>Read all {site.reviews.reviewCount} reviews on Google <Ico name="arrow-right" /></a>
        </div>
        <div className="quotes">
          {quotes.map((q) => (
            <figure className="quote" key={q.who}>
              <blockquote>{q.paras.map((p) => <p key={p}>{p}</p>)}</blockquote>
              <figcaption><span className="quote__stars" role="img" aria-label="5 out of 5">★★★★★</span> {q.who}, {q.what} · Google review</figcaption>
            </figure>
          ))}
        </div>
        <div className="creds">
          <div>
            <h3>{site.assessor.name}</h3>
            <p>Domestic Energy Assessor with {elmhurst.scheme} (<span className="acc">{elmhurst.number}</span>) and {quidos.scheme} (<span className="acc">{quidos.number}</span>). DBS checked.</p>
            <a className="link arrow-link" href={site.assessor.verifyUrl} {...ext}>Check the GOV.UK register <Ico name="arrow-right" /></a>
          </div>
          <div>
            <h3>£5m cover, twice over</h3>
            <p>{insurance.full}</p>
          </div>
          <div>
            <h3>All 32 boroughs and the City</h3>
            <p>Based in Stratford, E15. No travel charges anywhere we cover.</p>
            <details className="areas-more">
              <summary>See every area <Ico name="arrow-right" /></summary>
              <ul className="boroughs">{areas.map((b) => <li key={b.slug}><Link prefetch={false} href={`/areas/${b.slug}`}>{b.name}</Link></li>)}</ul>
            </details>
            {/* the map index and the borough figures (Abdul 19/10 picks; the 23/10 audit found the homepage linked neither) */}
            <div className="areas-links">
              <Link prefetch={false} className="link arrow-link" href="/areas">Map of the areas we cover <Ico name="arrow-right" /></Link>
              <Link prefetch={false} className="link arrow-link" href={DATA_PAGE_PATH}>EPC ratings in every borough <Ico name="arrow-right" /></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Faq() {
  return (
    <section className="sec faq" id="faq" aria-labelledby="faq-title">
      <div className="wrap faq__grid">
        <div className="faq__side">
          <h2 className="faq__title" id="faq-title">Questions before you book</h2>
          <p className="faq__more">Not covered here? <a href={whatsappQuoteHref()} {...ext}>WhatsApp us</a>, or read <Link prefetch={false} href="/faq">every question</Link>.</p>
        </div>
        <div className="faq__list">
          {homeBookingFaqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}<span className="plus" aria-hidden="true" /></summary>
              <div>
                <p>{f.a}</p>
                {f.links && <p className="faq__links">{f.links.map((l) => <Link prefetch={false} key={l.href} href={l.href}>{l.label}</Link>)}</p>}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

const guides = [
  { slug: 'epc-c-by-2030', title: 'What the 2030 standard means for landlords', line: 'A rented home needs E or better today, unless a valid exemption is registered. A standard equivalent to C is confirmed from 1 October 2030; it still needs legislation.' },
  { slug: 'what-happens-during-epc-assessment', title: 'What happens during an EPC assessment', line: 'What an EPC assessor records during a visit: walls, heating, windows, lighting.' },
  { slug: 'why-is-my-epc-different', title: 'Why EPC ratings can differ', line: 'Two near-identical London homes can score differently on an EPC.' },
  { slug: 'epc-vs-floor-plan-vs-survey', title: 'EPC, floor plan or survey: what each provides', line: 'What each document does, who needs one when selling, letting or buying, and which are legally required.' },
]

function Guides() {
  return (
    <section className="sec guides" id="guides" aria-labelledby="guides-title">
      <div className="wrap">
        <div className="guides__head">
          <p className="eyebrow">Guides</p>
          <h2 className="statement" id="guides-title">Understand your EPC</h2>
          <p className="lede-l">An EPC describes your home’s modelled energy performance. Your rating and recommendations depend on the assessed property; they do not predict your actual bills.</p>
        </div>
        <ul className="guides__list">
          {guides.map((g) => <li key={g.slug}><Link prefetch={false} href={`/blog/${g.slug}`}><b>{g.title}</b><span>{g.line}</span></Link></li>)}
        </ul>
        <p className="guides__more">
          <Link prefetch={false} className="link arrow-link" href="/blog">Browse all EPC guides <Ico name="arrow-right" /></Link>
          <Link prefetch={false} className="link arrow-link" href="/blog/mees-timeline-2026-2030">MEES timeline, now to 2030 <Ico name="arrow-right" /></Link>
        </p>
      </div>
    </section>
  )
}

function Close() {
  return (
    <section className="sec close" id="quote" aria-labelledby="close-title">
      <div className="wrap">
        <div className="close__grid">
          <h2 className="statement" id="close-title">Get a quote for your property</h2>
          <div className="close__side">
            <p>Send the address and floor area, or tell us you’re not sure. We confirm your exact price before anyone visits, and you pay once the assessment is done.</p>
            <a className="btn btn-primary" id="close-quote" href="#prices">Get my exact quote</a>
            <ul className="contact">
              <li><a href={whatsappQuoteHref()} {...ext}><Ico name="message" />WhatsApp, with your details ready to fill in</a></li>
              <li><a href={site.phoneHref}><Ico name="phone" />{site.phone}</a></li>
              <li><a href={site.emailHref}><Ico name="mail" />{site.email}</a></li>
            </ul>
          </div>
        </div>
        <p className="signature">{site.assessor.name}, Domestic Energy Assessor. {elmhurst.short} Energy <span className="acc">{elmhurst.number}</span>, {quidos.short} <span className="acc">{quidos.number}</span>.</p>
      </div>
    </section>
  )
}

export function HomePage() {
  // The LCP image: the wide cut from 760 px, the crop round the house on phones (media keeps it to one download).
  preload('/home/hero-dusk-1600.webp', { as: 'image', fetchPriority: 'high', media: '(min-width: 760px)', imageSrcSet: '/home/hero-dusk-900.webp 900w, /home/hero-dusk-1600.webp 1600w, /home/hero-dusk-2560.webp 2560w', imageSizes: '100vw' })
  preload('/home/hero-dusk-phone-800.webp', { as: 'image', fetchPriority: 'high', media: '(max-width: 759px)', imageSrcSet: '/home/hero-dusk-phone-800.webp 800w, /home/hero-dusk-phone-1200.webp 1200w', imageSizes: '100vw' })
  return (
    <div className="hp">
      {/* the service cards and the booking form share one state: "See my price" picks the service in the form */}
      <HomeQuoteProvider>
        <Hero />
        <HowItWorks />
        <PhotoBreak />
        <Services />
        <Prices />
        <Proof />
        <Faq />
        <Guides />
        <Close />
      </HomeQuoteProvider>
      <HomeV7Motion />
      <HomeQuoteBar epcFrom={priceFrom.epc} />
    </div>
  )
}
