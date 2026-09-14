import { quoteHref } from '@/lib/quote-context'
import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, CheckCircle2, Clock, ShieldCheck, FileText, CalendarRange } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Accordion } from '@/components/ui/Accordion'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { PageHero } from '@/components/sections/PageHero'
import { Pricing } from '@/components/sections/Pricing'
import { CtaStrip } from '@/components/sections/CtaStrip'
import { site, pricing, priceFrom } from '@/lib/site'
import { areaServedLondon } from '@/lib/boroughs'
import type { FaqItem } from '@/lib/faq'

export const metadata: Metadata = {
  title: 'EPC for Landlords London | Domestic MEES Compliance',
  description: `Domestic EPC assessments for London landlords. See where your rental stands against the current band E requirement. Guide prices from £${priceFrom.epc}, exact quote before booking.`,
  alternates: { canonical: `${site.url}/landlords` },
  openGraph: {
    title: 'EPC for Landlords London | Domestic MEES Compliance | L&D Energy',
    description: `Domestic EPC assessments for London landlords. Check where your rental stands against the current band E requirement. Guide prices from £${priceFrom.epc}, portfolio rates available.`,
    url: `${site.url}/landlords`,
  },
  twitter: {
    title: 'EPC for Landlords London | Domestic MEES Compliance',
    description:
      'Domestic EPC assessments for London landlords. Check where your rental stands against the current band E requirement.',
  },
}

const breadcrumbs = [
  { href: '/', label: 'Home' },
  { href: '/landlords', label: 'For Landlords' },
]

const penalties = [
  { breach: 'False information on PRS Exemptions Register', fine: '£1,000' },
  { breach: 'Failing to comply with a compliance notice', fine: '£2,000' },
  { breach: 'Letting a non-compliant property under 3 months', fine: '£2,000' },
  { breach: 'Letting a non-compliant property 3+ months', fine: '£4,000' },
]

const landlordNeeds = [
  'For rentals within MEES scope: EPC E or above, or a registered valid exemption',
  'EPC must be provided to tenants before signing',
  'Certificate must be lodged on the government register',
  'Valid for 10 years',
  'Must be replaced when expired before re-letting',
]

const ourService = [
  {
    Icon: FileText,
    title: 'Portfolio discounts',
    body: 'Multiple-property pricing for landlords and letting agents, contact us for a tailored quote.',
  },
  {
    Icon: ShieldCheck,
    title: 'Improvement advice',
    body: 'Standard EPC recommendations are included where applicable. They identify potential improvements; they do not guarantee EPC C or future compliance.',
  },
  {
    Icon: Clock,
    title: 'Appointment requests',
    body: 'Tell us your tenancy deadline and access needs. We confirm an available appointment and delivery timing before booking.',
  },
  {
    Icon: CalendarRange,
    title: 'Agent-friendly delivery',
    body: 'We can send certificates directly to letting agents (with your written permission) to save you forwarding paperwork.',
  },
]

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
    { '@type': 'ListItem', position: 2, name: 'For Landlords', item: `${site.url}/landlords` },
  ],
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Energy Performance Certificate',
  name: 'EPC for Landlords (MEES Compliance)',
  description:
    'Domestic EPC certificates for London landlords, helping you meet MEES minimum energy efficiency standards for rental properties. Portfolio rates available.',
  provider: { '@id': `${site.url}/#business` },
  url: `${site.url}/landlords`,
  areaServed: areaServedLondon,
  offers: {
    '@type': 'Offer',
    // Guide price, so minPrice — a fixed `price` would misstate the page.
    priceSpecification: { '@type': 'PriceSpecification', minPrice: pricing[0].epc, priceCurrency: 'GBP' },
    availability: 'https://schema.org/InStock',
  },
}

const landlordFaq: FaqItem[] = [
  {
    q: 'When do I need to give my tenant the EPC?',
    a: 'You must make the EPC available to prospective tenants before they view or rent the property, and provide a copy before the tenancy begins. In practice, have it ready before you start marketing the let so nothing holds up move-in.',
  },
  {
    q: 'Do I need a new EPC for every new tenant?',
    a: 'No. An EPC lasts 10 years and covers consecutive tenancies within that period, as long as it stays valid on the government register. A replacement is needed when an EPC is legally required and the existing one is no longer valid. Improvements do not automatically invalidate it, but a fresh assessment can record the changed property.',
  },
  {
    q: 'What happens if I let a property without a valid EPC?',
    a: 'Failing to provide an EPC and letting a sub-standard property under MEES are separate breaches. For rentals within MEES scope, an F- or G-rated property must be improved to E or have a valid registered exemption. Current MEES financial penalties total up to £5,000 per property; a planned £30,000 maximum still requires legislation.',
  },
  {
    q: 'My rental is rated F or G — what are my options?',
    a: 'If MEES applies, you must improve it to at least E or register a valid exemption before letting or continuing to let it. Your EPC report lists the specific improvements; common routes are loft and cavity insulation, LED lighting, and a modern boiler with controls.',
  },
  {
    q: 'Can you handle EPCs for my whole portfolio in one booking?',
    a: 'Yes. We offer portfolio rates for landlords and letting agents and can schedule several properties together across London. Send us the addresses and we’ll arrange a coordinated visit and a tailored quote.',
  },
]

const landlordFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: landlordFaq.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}

export default function LandlordsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, serviceSchema, landlordFaqSchema]) }}
      />

      <BreadcrumbNav items={breadcrumbs} />

      <PageHero
        eyebrow="For Landlords"
        heading="EPCs for London Landlords &amp; Domestic MEES Compliance"
        subheading="Accredited domestic EPC assessments across London, from our base in Stratford. Your certificate tells you exactly where the property stands against the current band E requirement — lodged within 72 hours, or next day if you need it urgently."
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ service: 'epc', sourcePage: 'landlords', ctaId: 'hero' }) }}
      />

      {/* Opening: scope the service honestly before anything else. The SERP for
          generic "MEES compliance services" is largely commercial-property
          consultancy, which is outside what we do — so this page is explicit
          that the service is domestic EPC assessment with landlord context
          around it, not compliance consultancy. */}
      <Section variant="default" id="mees">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-wide font-semibold text-primary-700">What we do for landlords</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            Domestic EPC assessments, with the MEES context around them
          </h2>
          <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
            We carry out accredited domestic EPC assessments on rental properties across London, from
            our base in {site.address.locality}. The certificate is what tells you where a property
            actually stands — and for a landlord, that is the question that matters.
          </p>
          <p className="mt-4 text-secondary-700 leading-relaxed">
            Under the Minimum Energy Efficiency Standards, a property covered by the regulations
            cannot be let in England and Wales with an EPC rating below band E unless a valid
            exemption is registered. That has applied to all tenancies since April 2020. Your EPC
            shows the current band, and the recommendations on it indicate improvements that could
            raise the rating if you need to.
          </p>
          <p className="mt-4 text-secondary-700 leading-relaxed">
            Two things worth being straight about. The rating is{' '}
            <Link href="/preparing-for-your-epc#how-your-epc-rating-is-calculated" className="text-primary-700 underline underline-offset-2 hover:text-primary-800">
              calculated by approved software
            </Link>{' '}
            from the assessed data — we record the property accurately, we do not choose or adjust the
            score. And registering a formal MEES exemption has its own eligibility rules and
            evidence requirements; that is a separate process which the assessment does not
            automatically certify.
          </p>
          <p className="mt-4 text-secondary-700 leading-relaxed">
            For the detail behind the rules, see our guides to{' '}
            <Link href="/blog/mees-regulations-2026" className="text-primary-700 underline underline-offset-2 hover:text-primary-800">
              the current MEES regulations
            </Link>
            ,{' '}
            <Link href="/blog/epc-for-landlords-2026" className="text-primary-700 underline underline-offset-2 hover:text-primary-800">
              EPC requirements and exemptions for landlords
            </Link>{' '}
            and{' '}
            <Link href="/blog/mees-timeline-2026-2030" className="text-primary-700 underline underline-offset-2 hover:text-primary-800">
              current law and the confirmed 2030 policy
            </Link>
            .
          </p>
        </div>
      </Section>

      {/* Penalties */}
      <Section variant="muted" id="penalties">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-wide font-semibold text-warm-700">Don&rsquo;t Get Caught Out</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            Penalties for Non-Compliance
          </h2>
          <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
            The current domestic MEES maxima are shown below. Financial penalties are capped at £5,000 per property in total; a publication penalty may also apply.
          </p>
        </div>

        <div className="mt-10 overflow-x-auto rounded-lg border border-warm-200">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="bg-warm-50 border-b border-warm-200">
                <th className="px-4 py-3 text-left font-semibold text-warm-700">Breach</th>
                <th className="px-4 py-3 text-right font-semibold text-warm-700">Maximum Fine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100 bg-white">
              {penalties.map((row) => (
                <tr key={row.breach}>
                  <td className="px-4 py-3 text-secondary-800">{row.breach}</td>
                  <td className="px-4 py-3 text-right font-bold text-warm-700">{row.fine}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 rounded-lg border border-warm-200 bg-warm-50 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warm-700 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-warm-800">
            <span className="font-semibold">Heads up:</span> Government intends to raise the maximum to £30,000 per property per breach under the future standard. This requires legislation and is not the current penalty limit.
          </p>
        </div>
      </Section>

      {/* EPC C Roadmap */}
      <Section variant="default" id="epc-c-roadmap">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-start">
          <div>
            <p className="text-xs uppercase tracking-wide font-semibold text-primary-700">What&rsquo;s Coming</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
              EPC C by 2030
            </h2>
            <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
              The January 2026 government response confirmed a higher standard equivalent to EPC C for 1 October 2030, using reformed metrics. Implementing legislation is still required; the current E minimum remains in force.
            </p>
            <ul className="mt-6 space-y-2.5">
              {[
                'One compliance date: 1 October 2030 for tenancies in scope',
                'Confirmed policy: fabric performance plus heating system or smart readiness',
                'Confirmed policy cost cap: £10,000, subject to implementing legislation',
                'Existing EER C certificates issued before 1 October 2029 can qualify under the transitional policy until expiry or replacement',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-secondary-700">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Card className="p-5 md:p-8">
            <h3 className="text-xl font-semibold text-secondary-900">What landlords need</h3>
            <ul className="mt-4 space-y-2.5">
              {landlordNeeds.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-secondary-700">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      {/* Our Landlord Service */}
      <Section variant="muted" id="our-service">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
            <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
            For Portfolios &amp; Single Lets
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            Our Landlord Service
          </h2>
          <p className="mt-4 text-secondary-700 leading-relaxed">
            Letting agent managing properties for landlords?{' '}
            <Link href="/estate-agents" className="text-primary-700 underline underline-offset-2 hover:text-primary-800 font-medium">
              See our dedicated service for agents
            </Link>
            , with agency rates and direct-to-branch certificate delivery.
          </p>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ourService.map((s) => (
            <li key={s.title} className="flex sm:flex-col items-start gap-4 sm:gap-0 rounded-2xl bg-canvas ring-1 ring-secondary-900/5 p-5 md:p-6 shadow-sm">
              <div className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary-50 ring-1 ring-primary-100 text-primary-700">
                <s.Icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="sm:mt-4">
                <h3 className="text-base md:text-lg font-semibold text-secondary-900">{s.title}</h3>
                <p className="mt-1.5 text-sm text-secondary-700 leading-relaxed">{s.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Pricing sourcePage="landlords" />

      {/* Landlord FAQ */}
      <Section variant="default" id="landlord-faq">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-wide font-semibold text-primary-700">Landlord Questions</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            EPC FAQs for London Landlords
          </h2>
          <div className="mt-8">
            <Accordion items={landlordFaq} />
          </div>
        </div>
      </Section>

      <CtaStrip
        heading="Protect Your Rental Income"
        body="Request your EPC quote and stay ahead of MEES. Portfolio enquiries welcome."
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ service: 'epc', sourcePage: 'landlords', ctaId: 'bottom' }) }}
      />
    </>
  )
}
