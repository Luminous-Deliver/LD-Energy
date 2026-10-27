import { quoteHref } from '@/lib/quote-context'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Ico } from '@/components/sections/home/HomeIcon'
import { InnerEnding } from '@/components/inner/InnerEnding'
import { whatsappQuoteHref } from '@/lib/area-page'
import { site, insurance, defaultOgImage } from '@/lib/site'
import '../inner.css'
import './about.css'

export const metadata: Metadata = {
  title: 'Abdul Motaleb Taher | About Your EPC Assessor',
  description:
    'Elmhurst and Quidos accredited Domestic Energy Assessor based in Stratford, East London. EPC certificates and floor plans across all 32 London boroughs.',
  alternates: { canonical: `${site.url}/about` },
  openGraph: {
    images: [defaultOgImage],
    title: 'About L&D Energy | London EPC Assessor | Elmhurst Accredited',
    description:
      'L&D Energy, Elmhurst and Quidos accredited Domestic Energy Assessor based in Stratford, East London. Professional EPC certificates and floor plans across all London boroughs.',
    url: `${site.url}/about`,
  },
  twitter: {
    images: [defaultOgImage.url],
    title: 'About L&D Energy | London EPC Assessor',
    description:
      'Elmhurst and Quidos accredited Domestic Energy Assessor based in Stratford, East London. EPC certificates across all London boroughs.',
  },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
    { '@type': 'ListItem', position: 2, name: 'About', item: `${site.url}/about` },
  ],
}

const [elmhurst, quidos] = site.assessor.accreditations
const registerSearch = 'https://getting-new-energy-certificate.service.gov.uk/find-an-assessor/search-by-name?name='

/**
 * Each scheme's record, with the GOV.UK search that finds it (re-run 23/10/2026): the full name finds only the
 * Elmhurst record; "Abdul Taher" finds both, the Quidos one listed under that shorter name. The Quidos record still
 * shows Abdul's personal email; he is asking Quidos to change it, and the link stays as it is meanwhile.
 */
const records = [
  { ...elmhurst, label: 'Elmhurst Energy', listedAs: site.assessor.name, check: `${registerSearch}Abdul+Motaleb+Taher` },
  { ...quidos, label: 'Quidos', listedAs: 'Abdul Taher', check: site.assessor.verifyUrl },
]

/** The ID card itself names this page as the place to verify it. */
const elmhurstFinder = 'https://www.elmhurstenergy.co.uk/find-an-assessor/'

const steps = [
  { stage: 'You ask', title: 'We answer the phone', body: 'Phone, WhatsApp and email reach Abdul directly. Use the enquiry form to send the property details needed for an exact quote.' },
  { stage: 'You book', title: 'No surprise fees', body: 'Guide prices are based mainly on internal floor area. Any additional charges are explained before you agree to the quote.' },
  { stage: 'We visit', title: 'We turn up on time', body: 'Booked slots are kept. If anything changes, we tell you immediately. Your time matters.' },
  { stage: 'You get it', title: 'We deliver on schedule', body: '72-hour standard lodgement, or on the day of the visit if you choose same-day lodgement or a next-day visit. We lodge directly on the GOV.UK EPC Register and send you the certificate link once it is live.' },
]

/** Approved by Abdul 23/10/2026 (About board Q3). */
const dont = [
  { title: 'Commercial EPCs', body: 'Shops, offices and other non-domestic buildings need a non-domestic assessor.' },
  { title: 'Building or homebuyer surveys', body: 'An EPC rates energy use. It does not report on the condition of the building.' },
  { title: 'Measured building surveys', body: 'Our floor plans are illustrative and come with a note saying so.' },
  { title: 'Retrofit assessments', body: 'We can tell you what the EPC recommends. A full retrofit assessment is a separate service.' },
]

const onThisPage = [
  { href: '#abdul', label: 'Meet Abdul' },
  { href: '#how', label: 'How we work' },
  { href: '#credentials', label: 'Accreditation and credentials' },
  { href: '#scope', label: 'What we don’t do' },
  { href: '#where', label: 'Where we work' },
]

/** A magnifier for the Check buttons; the shared icon set has none. */
function SearchIcon() {
  return (
    <svg className="i" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" focusable="false">
      <circle cx="10.5" cy="10.5" r="6.25" /><path d="M15 15l5.5 5.5" />
    </svg>
  )
}

function CrossIcon() {
  return (
    <svg className="i" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" focusable="false">
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </svg>
  )
}

function CheckLink({ href, label, number }: { href: string; label: string; number: string }) {
  return (
    <a className="ab-chk" href={href} target="_blank" rel="noopener noreferrer" aria-label={`Check ${label} accreditation ${number} on the GOV.UK register`}>
      <SearchIcon />Check
    </a>
  )
}

/**
 * About, option B "founder story" from the About board (Abdul 23/10/2026), with A's register card in the hero in
 * place of a price card and A's ending (the night band). Visits: Abdul does them himself and sometimes sends a
 * trusted, experienced colleague when he is ill or unable (23/10/2026), so nothing here says "always Abdul".
 */
export default function AboutPage() {
  return (
    <div className="in ab">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="in-hd" aria-labelledby="about-h1">
        <Container>
          <nav className="in-crumbs" aria-label="Breadcrumb">
            <ol>
              <li><Link href="/">Home</Link><span className="sep" aria-hidden="true">›</span></li>
              <li><span aria-current="page">About</span></li>
            </ol>
          </nav>
          <div className="ab-hero">
            <div className="in-hd__copy ab-hero__copy">
              <p className="in-eyebrow">About us</p>
              <h1 id="about-h1">About L&amp;D Energy</h1>
              <p className="in-hd__answer">
                Elmhurst and Quidos accredited Domestic Energy Assessor based in Stratford, East London. We deliver fast,
                transparent-priced EPC certificates and floor plans across every London borough.
              </p>
              <div className="in-hd__acts">
                <a className="ld-btn ld-btn--primary" href={quoteHref({ service: 'epc', sourcePage: 'about', ctaId: 'hero' })} data-enquiry-cta="hero">Get my exact quote</a>
                <a className="in-wa" href={whatsappQuoteHref()} target="_blank" rel="noopener noreferrer"><Ico name="message" size={18} /> WhatsApp us</a>
              </div>
            </div>

            {/* A's register card: who comes, both scheme IDs with their own Check, and the cover */}
            <div className="in-tb ab-reg" aria-labelledby="ab-reg-h">
              <div className="in-tb__head">
                <div><span>Assessor</span><b id="ab-reg-h">{site.assessor.name}</b></div>
                <div><span>Role</span><b>{site.assessor.qualification}</b></div>
                <div><span>Base</span><b>Stratford E15</b></div>
              </div>
              <ul className="ab-rows">
                {records.map((r) => (
                  <li key={r.number} className="ab-row ab-row--id">
                    <span className="ab-k">{r.label}</span>
                    <span className="ab-v num">{r.number}</span>
                    <CheckLink href={r.check} label={r.short} number={r.number} />
                  </li>
                ))}
                <li className="ab-row"><span className="ab-k">Method</span><span className="ab-v ab-v--wide">RdSAP 10, Elmhurst software</span></li>
                <li className="ab-row"><span className="ab-k">Insurance</span><span className="ab-v ab-v--wide">£5m Professional Indemnity, £5m Public Liability</span></li>
                <li className="ab-row"><span className="ab-k">DBS</span><span className="ab-v ab-v--wide">Checked by both schemes</span></li>
                <li className="ab-row"><span className="ab-k">Hours</span><span className="ab-v ab-v--wide">Monday to Sunday, 8am to 8pm</span></li>
              </ul>
              <p className="ab-reg__foot">
                Every certificate is lodged on the UK Government EPC Register. Check opens that register in a new tab; the
                Quidos record is listed as Abdul Taher.
              </p>
            </div>

            <nav className="in-otp ab-otp" aria-label="On this page">
              <p className="in-eyebrow">On this page</p>
              <ol>{onThisPage.map((l) => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}</ol>
            </nav>
          </div>
        </Container>
      </section>

      <section className="in-sec in-sec--band" aria-labelledby="abdul">
        <Container>
          <p className="in-eyebrow">The founder</p>
          <h2 className="ab-h2" id="abdul">Meet Abdul</h2>
          <div className="ab-story">
            <p className="ab-pull">Unanswered phones, missed appointments, slow certificates, and surprise fees. <span>We do the opposite.</span></p>
            <div>
              <p className="ab-p">
                L&amp;D Energy is led by Abdul M Taher, an Elmhurst and Quidos accredited Domestic Energy Assessor based in
                Stratford, East London. Abdul carries out the assessments himself. If he is ill or unable to make a visit, he
                sometimes sends a trusted, experienced colleague in his place, and lets you know in advance.
              </p>
              <p className="ab-p">
                The service was set up because too many landlords and sellers told us the same story. So we do the opposite:
                transparent pricing, clear timelines, and a real person who picks up.
              </p>
              <p className="ab-p">
                L&amp;D Energy is the domestic Energy Performance Certificate brand of {site.parentBrand}. We focus on what
                landlords, homeowners and letting agents actually need: predictable pricing, fast turnaround, and a qualified
                assessor who answers their phone.
              </p>
              <figure className="ab-card">
                {/* eslint-disable-next-line @next/next/no-img-element -- single WebP; next/image is unoptimised on Pages */}
                <img className="ab-card__id" src="/elmhurst-id.webp" width={360} height={554} loading="lazy" decoding="async"
                  alt={`Elmhurst Energy accreditation ID card for ${site.assessor.name}, ${elmhurst.number}`} />
                <figcaption>
                  <span className="ab-card__k">Elmhurst ID card</span>
                  <span className="ab-card__t">The number on it, <span className="num">{elmhurst.number}</span>, matches Abdul’s entry on the GOV.UK register.</span>
                  <a className="in-link ab-card__a" href={elmhurstFinder} target="_blank" rel="noopener noreferrer">Verify it on Elmhurst’s site</a>
                </figcaption>
              </figure>
            </div>
          </div>
        </Container>
      </section>

      <section className="in-sec" aria-labelledby="how">
        <Container>
          <p className="in-eyebrow">Our approach</p>
          <h2 className="ab-h2" id="how">How we work, from first message to certificate</h2>
          <ol className="ab-steps">
            {steps.map((s) => (
              <li key={s.stage}><span className="ab-stage">{s.stage}</span><h3>{s.title}</h3><p>{s.body}</p></li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="in-sec in-sec--band" aria-labelledby="credentials">
        <Container>
          <p className="in-eyebrow">Credentials</p>
          <h2 className="ab-h2" id="credentials">Accreditation and credentials</h2>
          <p className="ab-p ab-lede">Only an accredited Domestic Energy Assessor (DEA) can produce a domestic EPC that’s recognised by the UK Government EPC Register.</p>
          <div className="ab-ledger" role="table" aria-label="Accreditation and credentials">
            <div className="ab-lr ab-lr--h" role="row">
              <span role="columnheader">Scheme</span><span role="columnheader">Assessor ID</span>
              <span role="columnheader">On the register as</span><span role="columnheader"><span className="sr-only">Check</span></span>
            </div>
            {records.map((r) => (
              <div key={r.number} className="ab-lr" role="row">
                <span role="cell" className="ab-s">{r.scheme}</span>
                <span role="cell" className="ab-n num">{r.number}</span>
                <span role="cell" className="ab-as">{r.listedAs}</span>
                <span role="cell"><CheckLink href={r.check} label={r.short} number={r.number} /></span>
              </div>
            ))}
          </div>
          <p className="in-src">
            GOV.UK’s advice when you find an assessor is to “check that they’re part of an accredited scheme”{' '}
            (<a href="https://www.gov.uk/get-new-energy-certificate" target="_blank" rel="noopener noreferrer">Get a new energy certificate</a>).
            Each Check button runs the register search that finds that record.
          </p>
          <dl className="ab-more">
            <div><dt>Elmhurst SAP Software</dt><dd>We use Elmhurst’s government-approved software with RdSAP 10, the methodology approved for existing dwellings in England and Wales from 15 June 2025. Other accredited assessors may use other approved software.</dd></div>
            <div><dt>Fully Insured</dt><dd>{insurance.full}</dd></div>
            <div><dt>DBS checked</dt><dd>Elmhurst and Quidos both checked Abdul’s DBS when he applied for accreditation.</dd></div>
            <div><dt>If something goes wrong</dt><dd>Tell us first, by phone, WhatsApp or email, and we will look at it. If you are still unhappy with an EPC, GOV.UK says you can then contact the accreditation scheme named on the certificate.</dd></div>
          </dl>
        </Container>
      </section>

      <section className="in-sec" aria-labelledby="scope">
        <Container>
          <div className="ab-scope-h">
            <div>
              <p className="in-eyebrow">Homes only</p>
              <h2 className="ab-h2" id="scope">What we don’t do</h2>
            </div>
            <p className="ab-p ab-quiet">Better to know before you book. These need a different specialist.</p>
          </div>
          <ul className="ab-dont">
            {dont.map((d) => <li key={d.title}><CrossIcon /><b>{d.title}</b><span>{d.body}</span></li>)}
          </ul>
        </Container>
      </section>

      <section className="in-sec" aria-labelledby="where">
        <Container className="ab-where">
          <div>
            <p className="in-eyebrow">Coverage</p>
            <h2 className="ab-h2" id="where">Where we work</h2>
            <p className="ab-p ab-lede">Based in Stratford (E15), we cover all 32 London boroughs, the City of London, and surrounding areas within a 1.5-hour radius, parts of Essex, Kent, Hertfordshire and Surrey included.</p>
            <p className="ab-p ab-lede"><Link className="in-link" href="/areas">Find your borough</Link></p>
            <p className="ab-legal">{site.legal.statement}</p>
          </div>
          {/* a real Google review, word for word (references/reviews-2026-10-21), first name and surname initial as on the homepage */}
          <figure className="ab-rev">
            <blockquote><p>“Excellent service from start to finish! I needed a floor plan for my flat that met the requirements for a property licence application.”</p></blockquote>
            <figcaption>
              <span className="ab-stars" aria-label="5 out of 5 stars">★★★★★</span>Anum T., Google review ·{' '}
              <a href={site.reviews.profileUrl} target="_blank" rel="noopener noreferrer">{site.reviews.ratingValue.toFixed(1)} from {site.reviews.reviewCount} Google reviews</a>
            </figcaption>
          </figure>
        </Container>
      </section>

      <InnerEnding
        variant="a"
        image="/illustrations/evening"
        eyebrow="Get in touch"
        heading="Ready to work with us?"
        text="Request your EPC quote online, or get in touch with any question. We reply during our opening hours, Monday to Sunday, 8am to 8pm."
        source="about"
      />
    </div>
  )
}
