import Link from 'next/link'
import { Mrs_Saint_Delafield } from 'next/font/google'
import { BookOpen, Calculator, CalendarClock, ClipboardCheck, ExternalLink, MapPin, MessageCircle, Phone, ReceiptText, type LucideIcon } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Accordion } from '@/components/ui/Accordion'
import { site } from '@/lib/site'
import { quoteHref } from '@/lib/quote-context'
import { homeBookingFaqs } from '@/lib/homepage-content'
import { promises } from '@/components/sections/HomeHero'
import { StackMotion, WordReveal, RevealOnScroll, CloseMotion } from '@/components/sections/home/HomeMotion'

const closeHeading = 'Ready to arrange your EPC?'

// Signature only, far below the fold: not preloaded so it never competes with the hero.
const signature = Mrs_Saint_Delafield({ weight: '400', subsets: ['latin'], display: 'swap', preload: false })

const steps: [string, string][] = [
  ['Send your property details', 'Choose your service and share what you know about the property: size, access and any deadline.'],
  ['Agree your quote and appointment', 'Abdul confirms the exact price, access and available timing. Nothing is booked until you agree.'],
  ['The visit', 'Abdul assesses the property on site. With a floor plan, every room is laser-measured during the same visit.'],
  ['Lodged and delivered', 'Your EPC is lodged on the GOV.UK register and the link sent once it is live. Floor plans arrive as JPEG and PDF.'],
]
const promiseDetail: Record<string, string> = {
  'Same working-day reply': 'Message us on a working day and you’ll hear back that day.',
  'No surprise charges': 'No travel or call-out charges. Any extra, like next-day lodgement, is agreed before you book.',
  'Free rearrange if we reschedule': 'If we need to reschedule your appointment, we’ll arrange the next available slot at no extra cost.',
}
const creds: [string, string][] = [
  ['Elmhurst accredited', site.assessor.accreditationNumber],
  ['DBS checked', 'Background checked'],
  ['£5m PI & PL insured', 'Through Elmhurst’s scheme'],
  ['RdSAP 10', 'Current methodology since June 2025'],
  ['Stratford E15', 'Visits across London'],
]
const prep = [
  'Arrange access to rooms and the loft hatch, where present.',
  'Keep heating, hot-water controls and meters accessible.',
  'Have evidence of relevant improvements ready, if available.',
  'Coordinate keys and access with occupants or tenants.',
]
// `more` is the visible label and names the section it opens; the title link stays the accessible name.
const worthKnowing: { Icon: LucideIcon; title: string; body: string; href: string; more: string }[] = [
  { Icon: ReceiptText, title: 'Exact quote', body: 'Based on the property details you give us. Anything materially different is discussed and agreed before the assessment begins.', href: '/preparing-for-your-epc#quote-and-property-complexity', more: 'How your quote is set' },
  { Icon: Calculator, title: 'Independent rating', body: 'We record the property; the score is calculated by the approved methodology. It cannot be manually adjusted.', href: '/preparing-for-your-epc#how-your-epc-rating-is-calculated', more: 'How ratings are calculated' },
  { Icon: CalendarClock, title: 'RdSAP 10', body: 'Existing homes have used the updated methodology since June 2025, so an older EPC may not reproduce exactly.', href: '/preparing-for-your-epc#rdsap-10', more: 'What changed in June 2025' },
]
const areas = [['Stratford', 'stratford'], ['Newham', 'newham'], ['Tower Hamlets', 'tower-hamlets'], ['Hackney', 'hackney'], ['Waltham Forest', 'waltham-forest'], ['Redbridge', 'redbridge']]
const guides = [
  ['What happens during an EPC assessment', 'what-happens-during-epc-assessment'],
  ['Why EPC ratings can differ', 'why-is-my-epc-different'],
  ['EPC, floor plan or survey: what each provides', 'epc-vs-floor-plan-vs-survey'],
]
// MEES facts: GOV.UK landlord guidance (E since 1 April 2020) and the 2026
// government response on privately rented homes (C from 1 October 2030; a C
// before 1 October 2029 counts until that EPC expires). Captured 14/10/2026,
// and consistent with /blog/epc-c-by-2030. No rating or compliance promise.
const rules: { band: string; colour: string; title: string; body: string }[] = [
  { band: 'E', colour: '#FCAA65', title: 'Now', body: 'A rating of E or above is needed to let, unless a valid exemption is registered.' },
  { band: 'C', colour: '#8DCE46', title: 'From 1 October 2030 (planned)', body: 'The government plans C as the minimum for private tenancies. The regulations are still to be made.' },
  { band: '✓', colour: '#0D1B33', title: 'Head start', body: 'Under the plan, a home rated C or above before 1 October 2029 counts until that EPC expires or is replaced.' },
]
const route: [string, string, string][] = [
  ['Pre-Assessment', 'Find out your score privately. Nothing is lodged.', '/services/epc-pre-assessment'],
  ['Domestic EPC', 'Lodged on the GOV.UK register and valid for 10 years.', '/services/domestic-epc'],
  ['Improvement Plan', 'Your priorities for the property, with the full Energy Report.', '/services/epc-improvement-plan'],
]
const ratingScale: [string, string, number][] = [['A', '#008054', 96], ['B', '#19B459', 116], ['C', '#8DCE46', 136], ['D', '#FFD500', 156], ['E', '#FCAA65', 176], ['F', '#EF8023', 196], ['G', '#E9153B', 216]]

function Examples() {
  return (
    <div className="hw-examples">
      <figure>
        <svg viewBox="0 0 320 200" role="img" aria-label="Example EPC rating C on the A to G scale">
          {ratingScale.map(([letter, colour, w], i) => (
            <g key={letter}>
              <rect x="2" y={6 + i * 27} width={w} height="22" rx="4" fill={colour} stroke={letter === 'C' ? '#0D1B33' : undefined} strokeWidth={letter === 'C' ? 2.5 : undefined} />
              <text x="12" y={22 + i * 27} fill={letter === 'D' ? '#0D1B33' : '#fff'} fontSize="13" fontWeight="700">{letter}</text>
              {letter === 'C' && <text x="146" y="76" fill="#0D1B33" fontSize="13" fontWeight="700">← example</text>}
            </g>
          ))}
        </svg>
        <figcaption>Example rating</figcaption>
      </figure>
      <figure>
        <svg viewBox="0 0 380 300" role="img" aria-label="Example floor plan of a made-up flat" className="hw-plan">
          <defs><pattern id="plan-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="rgba(13,27,51,.07)" /></pattern></defs>
          <rect width="380" height="300" fill="url(#plan-grid)" />
          <rect x="50" y="30" width="288" height="216" fill="#fff" />
          <path d="M50 30 H338 V246 H50 Z" fill="none" stroke="#0D1B33" strokeWidth="6" />
          <path d="M230 30 V150 M230 178 V246 M50 160 H150 M178 160 H230 M282 150 H338 M282 150 V246" fill="none" stroke="#0D1B33" strokeWidth="3" />
          <path d="M150 160 A28 28 0 0 1 178 132 M230 150 A28 28 0 0 0 202 178" fill="none" stroke="#0D1B33" strokeWidth="1.4" />
          <path d="M50 268 H230 M50 262 V274 M230 262 V274 M22 30 V160 M16 30 H28 M16 160 H28" stroke="#386B59" strokeWidth="1.4" />
          <text x="98" y="98">Living and kitchen</text><text x="258" y="98">Bedroom</text><text x="92" y="208">Hall</text><text x="298" y="204">Bath</text>
          <text x="124" y="288">5.2 m</text><text x="4" y="100" transform="rotate(-90 12 96)">4.1 m</text>
        </svg>
        <figcaption>Example floor plan, supplied as JPEG and PDF</figcaption>
      </figure>
    </div>
  )
}

export function HomeContent() {
  return (
    <>
      <RevealOnScroll />

      <section id="how-it-works" aria-labelledby="how-h" className="hv-band hv-band--white">
        <Container>
          <div className="hv-top" data-reveal>
            <div>
              <p className="hv-pill">How it works</p>
              <h2 id="how-h" className="hv-h2">Four steps, nothing booked until you agree</h2>
            </div>
            <Link prefetch={false} href={quoteHref({ sourcePage: 'home', ctaId: 'inline' })} className="home-link">Get my exact quote →</Link>
          </div>
          <ol id="how-steps" className="hw-steps">
            {steps.map(([title, copy], i) => (
              <li key={title} className={i < steps.length - 1 ? 'hw-step hw-step--sticky' : 'hw-step'} style={{ ['--k' as string]: i }}>
                <div data-inner className="hw-step__in">
                  <span aria-hidden="true" className="hw-step__n">{i + 1}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                  {i === steps.length - 1 && <Examples />}
                </div>
              </li>
            ))}
          </ol>
          <StackMotion targetId="how-steps" />
        </Container>
      </section>

      <section id="why" aria-labelledby="why-h" className="hv-band">
        <Container>
          <div className="mx-auto max-w-[812px]">
            <h2 id="why-h" className="hv-pill">Why L&amp;D Energy</h2>
            <WordReveal className="hy-words" text="You deal with the assessor from the first message to the certificate. We record the property. The score is calculated by the approved methodology, and it cannot be manually adjusted." />
          </div>
          <div className="hy-vow" data-reveal>
            <h3>Book with confidence</h3>
            <ul>
              {promises.map((p) => <li key={p}><b>{p}</b><span>{promiseDetail[p]}</span></li>)}
            </ul>
          </div>
          <ul className="hy-creds" data-reveal>
            {creds.map(([b, s]) => <li key={b}><b>{b}</b><span>{s}</span></li>)}
          </ul>
        </Container>
      </section>

      <section id="reviews" aria-labelledby="rev-h" className="hv-band hv-band--white hv-band--tight">
        <Container>
          <div className="hr-proof" data-reveal>
            <div>
              <h2 id="rev-h" className="sr-only">Reviews</h2>
              <p className="hr-score tabular-nums">{site.reviews.ratingValue.toFixed(1)}</p>
              <span aria-hidden="true" className="hr-stars">★★★★★</span>
              <span className="hr-count">from {site.reviews.reviewCount} Google reviews</span>
            </div>
            <div>
              <p>Speak directly with the person assessing your property. Check the accreditation number on the government register before you book.</p>
              <div className="mt-3 flex flex-wrap gap-x-6">
                <a href={site.reviews.profileUrl} target="_blank" rel="noopener noreferrer" className="home-link">Read the reviews <ExternalLink aria-hidden="true" className="h-4 w-4" /></a>
                <a href={site.assessor.verifyUrl} target="_blank" rel="noopener noreferrer" className="home-link">Verify Abdul on GOV.UK <ExternalLink aria-hidden="true" className="h-4 w-4" /></a>
                <Link prefetch={false} href="/about" className="home-link">More about your assessor →</Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="landlords" aria-labelledby="ll-h" className="hv-band">
        <Container>
          <div className="hv-top" data-reveal>
            <div>
              <p className="hv-pill">Landlords and agents</p>
              <h2 id="ll-h" className="hv-h2">Know where your rental stands</h2>
            </div>
            <p className="hv-lede">An EPC tells you more than whether you can let. It shows where the property sits against today&rsquo;s rule and the one planned for 2030.</p>
          </div>
          <div className="hl-grid" data-reveal>
            <div className="hl-rules">
              <ol>
                {rules.map((r) => (
                  <li key={r.title}>
                    <span aria-hidden="true" className={r.band === '✓' ? 'hl-band hl-band--dark' : 'hl-band'} style={{ background: r.colour }}>{r.band}</span>
                    <div><b>{r.title}</b><p>{r.body}</p></div>
                  </li>
                ))}
              </ol>
              <div className="hl-links">
                <Link prefetch={false} href="/blog/epc-c-by-2030" className="home-link">The 2030 rented home standard →</Link>
                <Link prefetch={false} href="/blog/mees-timeline-2026-2030" className="home-link">MEES timeline, now to 2030 →</Link>
              </div>
            </div>
            <div className="hl-path">
              <p className="hl-path__t">Your route</p>
              <ol>
                {route.map(([t, d, href]) => (
                  <li key={t}><Link prefetch={false} href={href}><b>{t}</b><span>{d}</span></Link></li>
                ))}
              </ol>
              <Link prefetch={false} href="/landlords" className="hl-path__more">The landlord guide →</Link>
            </div>
          </div>
          <div id="agency" className="hl-agent scroll-mt-28" data-reveal>
            <div>
              <p className="hl-agent__t">Letting, managing or estate agent?</p>
              <p>Repeat instructions and multiple properties, with one accredited contact. Send the list and we&rsquo;ll quote the batch.</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <Button href={quoteHref({ service: 'bulk', sourcePage: 'home', ctaId: 'inline' })} variant="accent" className="rounded-full">Start a portfolio enquiry</Button>
              <Link prefetch={false} href="/estate-agents" className="home-link">For agencies →</Link>
            </div>
          </div>
        </Container>
      </section>

      <section id="before-the-visit" aria-labelledby="prep-h" className="hv-band hv-band--white">
        <Container>
          <div className="hp-panel" data-reveal>
            <div>
              <span aria-hidden="true" className="hp-ico"><ClipboardCheck className="h-6 w-6" /></span>
              <h2 id="prep-h" className="hv-h2">Before your visit</h2>
              <Link prefetch={false} href="/preparing-for-your-epc" className="home-link mt-2">Full preparation checklist →</Link>
            </div>
            <ul>
              {prep.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <h3 id="worth-knowing" className="hk-h scroll-mt-28" data-reveal>Three things worth knowing first</h3>
          <ul className="hk-grid" data-reveal>
            {worthKnowing.map(({ Icon, title, body, href, more }) => (
              <li key={title}>
                <span aria-hidden="true" className="hk-ico"><Icon className="h-5 w-5" /></span>
                <h4><Link prefetch={false} href={href}>{title}</Link></h4>
                <p>{body}</p>
                <span aria-hidden="true" className="hk-more">{more} →</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section id="areas" aria-labelledby="areas-h" className="hv-band hv-band--tight">
        <Container className="ha-grid">
          <div data-reveal>
            <p className="hv-pill">Areas</p>
            <h2 id="areas-h" className="hv-h2">Based in Stratford. Serving London.</h2>
            <p className="hv-lede mt-4">One Stratford E15 base, with visits across London. Check your area or include your postcode in your quote request.</p>
          </div>
          <div data-reveal>
            <nav aria-label="Featured London areas" className="flex flex-wrap gap-2.5">
              {areas.map(([name, slug]) => (
                <Link prefetch={false} key={slug} href={'/areas/' + slug} className="hv-chip">
                  <MapPin aria-hidden="true" className="h-4 w-4 text-[#386B59]" />EPC {name}
                </Link>
              ))}
            </nav>
            <Link prefetch={false} href="/areas" className="home-link mt-3">View all London service areas →</Link>
          </div>
        </Container>
      </section>

      <section id="faq" aria-labelledby="faq-h" className="hv-band hv-band--white">
        <Container className="hf-grid">
          <div data-reveal>
            <p className="hv-pill">Questions</p>
            <h2 id="faq-h" className="hv-h2">Before you enquire</h2>
            <Link prefetch={false} href="/faq" className="home-link mt-2">All EPC questions →</Link>
            <div className="hf-ask">
              <p className="hf-ask__t">Prefer to ask directly?</p>
              <p>Call or WhatsApp Abdul with your question.</p>
              <div className="flex flex-wrap gap-x-6">
                <a href={site.phoneHref} className="home-link"><Phone aria-hidden="true" className="h-4 w-4" />{site.phone}</a>
                <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" className="home-link"><MessageCircle aria-hidden="true" className="h-4 w-4" />WhatsApp</a>
              </div>
            </div>
          </div>
          <Accordion items={homeBookingFaqs} />
        </Container>
      </section>

      <section id="what-is-epc" aria-labelledby="learn-h" className="hv-band">
        <Container className="ha-grid">
          <div data-reveal>
            <p className="hv-pill">Guides</p>
            <h2 id="learn-h" className="hv-h2">Understand your EPC</h2>
            <p className="hv-lede mt-4">An EPC describes your home&rsquo;s modelled energy performance. Your rating and recommendations depend on the assessed property; they do not predict your actual bills.</p>
          </div>
          <ul className="hg-list" data-reveal>
            {guides.map(([label, slug]) => (
              <li key={slug}>
                <Link prefetch={false} href={'/blog/' + slug} className="hg-link">
                  <span aria-hidden="true" className="hk-ico"><BookOpen className="h-5 w-5" /></span>
                  {label}
                  <span aria-hidden="true" className="ml-auto text-[#386B59]">→</span>
                </Link>
              </li>
            ))}
            <li><Link prefetch={false} href="/blog" className="home-link px-1">Browse all EPC guides →</Link></li>
          </ul>
        </Container>
      </section>

      {/* Close: the hero's Thames an hour later, at night, fading into the footer's navy so the page ends as one scene. */}
      <section id="contact" aria-labelledby="close-h" className="hc-close scroll-mt-28">
        <div className="hc-sky" aria-hidden="true" />
        <div className="hc-land" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element -- next/image is unoptimised on Pages; the hero's photo, regraded to night */}
          <img className="hc-night" data-rate="0.22" src="/hero/thames-night-2400.webp" srcSet="/hero/thames-night-1440.webp 1440w, /hero/thames-night-2400.webp 2400w" sizes="max(100vw, 1700px)" width={2400} height={625} alt="" loading="lazy" decoding="async" />
        </div>
        <div className="hc-fade" aria-hidden="true" />
        <Container className="hc-in">
          <h2 id="close-h">
            <span className="sr-only">{closeHeading}</span>
            <span data-close-type className="hc-type" aria-hidden="true">
              {[...closeHeading].map((ch, i) => <span key={i} data-l>{ch}</span>)}
            </span>
          </h2>
          <p data-close-after className="hc-lede">Exact quote confirmed before booking. Same working-day reply.</p>
          <div data-close-after className="flex flex-wrap justify-center gap-3">
            <Button href={quoteHref({ sourcePage: 'home', ctaId: 'bottom' })} variant="accent" className="hc-cta rounded-full px-7">Get my exact quote</Button>
            <Button href={site.whatsappHref} target="_blank" rel="noopener noreferrer" variant="secondary" className="hc-ghost rounded-full px-7">WhatsApp Abdul</Button>
          </div>
          <div data-reveal className="hc-contact">
            <div><small>Phone</small><a className="tabular-nums" href={site.phoneHref}>{site.phone}</a></div>
            <div><small>Email</small><a href={site.emailHref}>{site.email}</a></div>
            <div><small>Hours</small><span>{site.hours}</span></div>
          </div>
          <div className="hc-sign">
            <p className="hc-sign__line" aria-hidden="true"><span data-close-sig className={`hc-sign__name ${signature.className}`}>Abdul</span></p>
            <p className="hc-who">{site.assessor.name}, your assessor</p>
          </div>
          <p className="hc-credit">
            Hero photo: <a href="https://commons.wikimedia.org/wiki/File:Canary_Wharf_from_Blackheath_(2)_-_2022-04-24.jpg" target="_blank" rel="noopener noreferrer">&ldquo;Canary Wharf from Blackheath (2)&rdquo;</a> by The wub,{' '}
            <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a>, cut into layers, which are shared under the same licence. Closing photo:{' '}
            <a href="https://commons.wikimedia.org/wiki/File:London_Thames_Sunset_panorama_-_Feb_2008.jpg" target="_blank" rel="noopener noreferrer">&ldquo;London Thames Sunset panorama&rdquo;</a> by Diliff,{' '}
            <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener noreferrer">CC BY 3.0</a>, regraded to night.
          </p>
        </Container>
        <CloseMotion />
      </section>
    </>
  )
}
