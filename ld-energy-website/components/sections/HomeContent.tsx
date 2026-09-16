import Link from 'next/link'
import { BookOpen, Building2, ClipboardCheck, House, KeyRound, MapPin, MessageCircle, Phone, Signpost, type LucideIcon } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Accordion } from '@/components/ui/Accordion'
import { site } from '@/lib/site'
import { quoteHref } from '@/lib/quote-context'
import { homeBookingFaqs } from '@/lib/homepage-content'

const steps = [
  ['Send your property details', 'Choose your service and share what you know about the property.'],
  ['Agree your quote and appointment', 'Abdul confirms the exact price, access and available timing.'],
  ['Assessment and delivery', 'The visit takes place and your agreed documents are supplied.'],
]
const audiences: [string, string, string, LucideIcon][] = [
  ['Homeowners', 'For your home and future plans.', '/services/domestic-epc', House],
  ['Sellers', 'Prepare your property for marketing.', '/sellers', Signpost],
  ['Landlords', 'EPC requirements and tenant access.', '/landlords', KeyRound],
  ['Agencies and portfolios', 'Repeat instructions and multiple properties.', '/estate-agents', Building2],
]
const prep = [
  'Arrange access to rooms and the loft hatch, where present.',
  'Keep heating, hot-water controls and meters accessible.',
  'Have evidence of relevant improvements ready, if available.',
  'Coordinate keys and access with occupants or tenants.',
]
const areas = [['Stratford', 'stratford'], ['Newham', 'newham'], ['Tower Hamlets', 'tower-hamlets'], ['Hackney', 'hackney'], ['Waltham Forest', 'waltham-forest'], ['Redbridge', 'redbridge']]
const guides = [
  ['What happens during an EPC assessment', 'what-happens-during-epc-assessment'],
  ['Why EPC ratings can differ', 'why-is-my-epc-different'],
  ['EPC, floor plan or survey: what each provides', 'epc-vs-floor-plan-vs-survey'],
]

// Below lg every section renders the compact mobile layout; lg: classes and
// hidden lg:* elements add the desktop composition only.
const card = 'lg:rounded-2xl lg:bg-white lg:shadow-premium'

export function HomeContent() {
  return (
    <>
      {/* Desktop shows the assessor in the hero card instead. */}
      <section id="assessor" className="home-section lg:hidden">
        <Container className="grid gap-5 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="home-heading">Your verified assessor</h2>
            <p className="mt-3 text-base leading-6">Speak directly with the person assessing your property.</p>
          </div>
          <div className="border-l-2 border-[#47846E] pl-5">
            <h3 className="text-2xl font-semibold">{site.assessor.name}</h3>
            <p className="mt-1 text-base">Domestic Energy Assessor</p>
            <p className="mt-2 text-sm leading-6">Elmhurst Accredited · {site.assessor.accreditationNumber}</p>
            <a href={site.assessor.verifyUrl} target="_blank" rel="noopener noreferrer" className="home-link">Verify Abdul on GOV.UK ↗</a>
            <div>
              <a href={site.reviews.profileUrl} target="_blank" rel="noopener noreferrer" className="home-link">Read customer reviews on Google ↗</a>
            </div>
            <Link prefetch={false} href="/about" className="home-link">More about your assessor →</Link>
          </div>
        </Container>
      </section>

      <section id="how-it-works" className="home-section border-y border-secondary-200 bg-white">
        <Container className="lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-x-10">
          <h2 className="home-heading">How it works</h2>
          <ol className="mt-5 grid gap-5 lg:col-span-2 lg:row-start-2 lg:mt-10 lg:grid-cols-3 lg:gap-10">
            {steps.map(([title, copy], i) => (
              <li key={title} className="flex gap-3 lg:relative lg:flex-col lg:gap-5 lg:after:absolute lg:after:-right-8 lg:after:left-14 lg:after:top-5 lg:after:h-px lg:after:bg-secondary-300 lg:after:content-[''] lg:last:after:hidden">
                <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-base font-semibold text-primary-900 lg:h-10 lg:w-10 lg:bg-[#0D1B33] lg:font-serif lg:text-lg lg:text-white">{i + 1}</span>
                <div>
                  <h3 className="text-lg font-semibold lg:text-xl">{title}</h3>
                  <p className="mt-1 text-base leading-6 text-secondary-700 lg:mt-2">{copy}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link prefetch={false} href={quoteHref({ sourcePage: 'home', ctaId: 'inline' })} className="home-link mt-4 lg:col-start-2 lg:row-start-1 lg:mt-0">Get my exact quote →</Link>
        </Container>
      </section>

      <section id="who-we-help" className="home-section">
        <Container>
          <h2 className="home-heading">An EPC for your next step</h2>
          <div className="mt-4 grid gap-x-8 sm:grid-cols-2 lg:mt-8 lg:grid-cols-4 lg:gap-5">
            {audiences.map(([title, copy, href, Icon]) => (
              <div key={href} id={href === '/estate-agents' ? 'agency' : undefined} className={`border-b border-secondary-200 py-3 lg:relative lg:border lg:p-6 lg:transition-shadow lg:hover:shadow-premium-lg ${card}`}>
                <span aria-hidden="true" className="mb-4 hidden h-11 w-11 items-center justify-center rounded-xl bg-[#F1F6F3] text-[#386B59] lg:flex">
                  <Icon className="h-5 w-5" />
                </span>
                <Link prefetch={false} href={href} className="home-link text-lg lg:no-underline lg:after:absolute lg:after:inset-0 lg:after:rounded-2xl lg:after:content-['']">{title} →</Link>
                <p className="text-base leading-6 text-secondary-700 lg:mt-1">{copy}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section id="before-the-visit" className="home-section bg-[#F1F6F3]">
        <Container className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-center lg:gap-16">
          <div>
            <span aria-hidden="true" className="mb-5 hidden h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#386B59] shadow-premium lg:flex">
              <ClipboardCheck className="h-6 w-6" />
            </span>
            <h2 className="home-heading">Before your visit</h2>
            <Link prefetch={false} href="/preparing-for-your-epc" className="home-link mt-2">Full preparation checklist →</Link>
          </div>
          <ul className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {prep.map((item) => (
              <li key={item} className={`flex gap-3 text-base leading-6 lg:p-5 ${card}`}>
                <span aria-hidden="true" className="font-semibold text-primary-800 lg:flex lg:h-7 lg:w-7 lg:shrink-0 lg:items-center lg:justify-center lg:rounded-full lg:bg-[#47846E] lg:text-sm lg:text-white">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section id="areas" className="home-section">
        <Container className="grid gap-4 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <h2 className="home-heading">Based in Stratford. Serving London.</h2>
            <p className="mt-3 text-base leading-6">One Stratford E15 base, with visits across London. Check your area or include your postcode in your quote request.</p>
          </div>
          <div>
            <nav aria-label="Featured London areas" className="flex flex-wrap gap-x-6 lg:gap-3">
              {areas.map(([name, slug]) => (
                <Link prefetch={false} key={slug} href={'/areas/' + slug} className="home-link lg:min-h-12 lg:rounded-full lg:border lg:border-secondary-300 lg:bg-white lg:px-5 lg:no-underline lg:transition-colors lg:hover:border-[#47846E] lg:hover:bg-[#F1F6F3]">
                  <MapPin aria-hidden="true" className="hidden h-4 w-4 text-[#386B59] lg:block" />
                  EPC {name}
                </Link>
              ))}
            </nav>
            <Link prefetch={false} href="/areas" className="home-link mt-2 lg:mt-5">View all London service areas →</Link>
          </div>
        </Container>
      </section>

      <section id="faq" className="home-section border-y border-secondary-200 bg-white">
        <Container className="grid gap-5 lg:grid-cols-[1fr_1.65fr] lg:gap-16">
          <div>
            <h2 className="home-heading">Before you enquire</h2>
            <Link prefetch={false} href="/faq" className="home-link mt-2">All EPC questions →</Link>
            <div className="mt-8 hidden rounded-2xl bg-[#F1F6F3] p-6 lg:block">
              <p className="font-serif text-xl font-semibold text-secondary-900">Prefer to ask directly?</p>
              <p className="mt-2 text-base leading-6 text-secondary-700">Call or WhatsApp Abdul with your question.</p>
              <div className="mt-3 flex flex-wrap gap-x-6">
                <a href={site.phoneHref} className="home-link">
                  <Phone aria-hidden="true" className="h-4 w-4" />
                  {site.phone}
                </a>
                <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" className="home-link">
                  <MessageCircle aria-hidden="true" className="h-4 w-4" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
          <Accordion items={homeBookingFaqs} />
        </Container>
      </section>

      <section id="what-is-epc" className="home-section">
        <Container className="grid gap-4 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <h2 className="home-heading">Understand your EPC</h2>
            <p className="mt-3 text-base leading-6">An EPC describes your home&rsquo;s modelled energy performance. Your rating and recommendations depend on the assessed property; they do not predict your actual bills.</p>
          </div>
          <ul className="divide-y divide-secondary-200 lg:grid lg:gap-3 lg:divide-y-0">
            {guides.map(([label, slug]) => (
              <li key={slug}>
                <Link prefetch={false} href={'/blog/' + slug} className="home-link py-3 lg:flex lg:gap-3 lg:rounded-2xl lg:border lg:border-secondary-200 lg:bg-white lg:px-5 lg:py-4 lg:no-underline lg:transition-colors lg:hover:border-[#47846E]">
                  <BookOpen aria-hidden="true" className="hidden h-5 w-5 shrink-0 text-[#386B59] lg:block" />
                  {label} →
                </Link>
              </li>
            ))}
            <li>
              <Link prefetch={false} href="/blog" className="home-link py-3 lg:px-5">Browse all EPC guides →</Link>
            </li>
          </ul>
        </Container>
      </section>

      <section id="contact" className="home-section scroll-mt-28 bg-[#0D1B33] text-white">
        <Container className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="home-heading text-white">Ready to arrange your EPC?</h2>
            <p className="mt-3 text-base leading-6 text-[#D6E1F0]">Send your property details. Agree your exact quote before booking.</p>
          </div>
          <Button href={quoteHref({ sourcePage: 'home', ctaId: 'bottom' })} variant="accent">Get my exact quote</Button>
        </Container>
      </section>
    </>
  )
}
