import { quoteHref } from '@/lib/quote-context'
import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Zap, LayoutPanelTop, PhoneCall, BadgePercent, CalendarClock, FileCheck2, Camera } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Accordion } from '@/components/ui/Accordion'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { PageHero } from '@/components/sections/PageHero'
import { Pricing } from '@/components/sections/Pricing'
import { CtaStrip } from '@/components/sections/CtaStrip'
import { site, pricing, EXPRESS_SURCHARGE } from '@/lib/site'
import { areaServedLondon } from '@/lib/boroughs'
import type { FaqItem } from '@/lib/faq'

export const metadata: Metadata = {
  title: 'EPC Provider for Estate & Letting Agents London',
  description:
    'Reliable EPC and floor plan partner for London estate and letting agents. Fast turnaround on new instructions, volume rates, direct line to your assessor. Taking on new agencies now.',
  alternates: { canonical: `${site.url}/estate-agents` },
  openGraph: {
    title: 'EPC Provider for Estate & Letting Agents London | L&D Energy',
    description:
      'Reliable EPC and floor plan partner for London estate and letting agents. Fast turnaround on new instructions, volume rates, direct line to your assessor.',
    url: `${site.url}/estate-agents`,
  },
  twitter: {
    title: 'EPC Provider for Estate & Letting Agents London',
    description:
      'Fast EPCs and floor plans for London agents. Volume rates, quick turnaround on new instructions. Taking on new agencies now.',
  },
}

const breadcrumbs = [
  { href: '/', label: 'Home' },
  { href: '/estate-agents', label: 'For Agents' },
]

const whyAgents = [
  {
    Icon: Zap,
    title: 'Fast turnaround on new instructions',
    body: 'Appointments 7 days a week, 8am–8pm, with certificates lodged within 72 hours and next-day available. Your listing goes live on time, every time.',
  },
  {
    Icon: LayoutPanelTop,
    title: 'EPC + floor plan in one visit',
    body: 'We measure the property anyway during the assessment, so booking a floor plan alongside the EPC costs less than booking it separately. One appointment, both listing essentials.',
  },
  {
    Icon: BadgePercent,
    title: 'Volume rates for agencies',
    body: 'Regular instructions get agency pricing, not one-off consumer rates. The more properties you send, the better your rate.',
  },
  {
    Icon: PhoneCall,
    title: 'A direct line, not a call centre',
    body: 'You deal with the accredited assessor directly, by phone or WhatsApp. Same-day confirmations during opening hours, and no chasing for certificates.',
  },
  {
    Icon: CalendarClock,
    title: 'Vendor and tenant-friendly booking',
    body: 'Give us the occupier’s details and we’ll arrange access directly, including evenings and weekends, so your negotiators stay off the phone.',
  },
  {
    Icon: FileCheck2,
    title: 'Certificates sent where you need them',
    body: 'Lodged on the government EPC Register, with the certificate link sent straight to your branch inbox (with the client’s permission), ready to attach to the listing.',
  },
]

const process = [
  { step: 'Send the instruction', detail: 'Address, property size, and the occupier’s contact details, by phone, WhatsApp, or email.' },
  { step: 'We arrange access', detail: 'We contact the vendor or tenant directly and confirm the appointment during our opening hours, Mon–Sun 8am–8pm.' },
  { step: 'Assessment done', detail: '45 minutes to 2 hours on-site, evenings and weekends included.' },
  { step: 'Certificate lodged', detail: 'Lodged on the GOV.UK EPC register within 72 hours, or next day for urgent listings, with the certificate link sent to your branch once live.' },
]

const agentFaq: FaqItem[] = [
  {
    q: 'Do you take on new estate and letting agencies?',
    a: 'Yes, we are actively taking on new agency clients across London. Whether you need a reliable EPC supplier for occasional instructions or a regular partner for a busy branch, get in touch and we’ll agree turnaround expectations and agency rates that work for your volume.',
  },
  {
    q: 'What are your rates for agents?',
    a: `Guide prices start from £${pricing[0].epc} per EPC, and agencies sending regular instructions get volume pricing below our standard rates. Floor plans are better value when booked with an EPC in the same visit. Contact us with your typical monthly volume for a tailored rate card.`,
  },
  {
    q: 'How quickly can you assess a new instruction?',
    a: 'We offer appointments 7 days a week including evenings, and can usually attend within one to two working days of the instruction. Certificates are lodged within 72 hours of the visit as standard, or within 24 hours with our next-day service, so your listing is portal-ready fast.',
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
    a: 'We cover all 32 London boroughs and the City of London from our base in Stratford, East London, with no travel charges within our core service area. If your branches span multiple boroughs, one supplier covers them all.',
  },
]

const serviceSchema = {
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
    // Guide price, so minPrice — a fixed `price` would misstate the page.
    priceSpecification: { '@type': 'PriceSpecification', minPrice: pricing[0].epc, priceCurrency: 'GBP' },
    availability: 'https://schema.org/InStock',
  },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.map((b, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: b.label,
    item: `${site.url}${b.href === '/' ? '' : b.href}`,
  })),
}

const agentFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: agentFaq.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}

export default function EstateAgentsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, serviceSchema, agentFaqSchema]) }}
      />

      <BreadcrumbNav items={breadcrumbs} />

      <PageHero
        eyebrow="For Estate & Letting Agents"
        heading="Your EPC Partner for New Instructions"
        subheading="Elmhurst-accredited assessor covering all 32 London boroughs, available for new agency partnerships now. Fast, reliable EPCs and floor plans so your listings go live on time."
        primaryCta={{ label: 'Partner With Us', href: quoteHref({ service: 'bulk', sourcePage: 'estate-agents', ctaId: 'hero' }) }}
      />

      {/* Availability banner */}
      <Section variant="default" id="availability" className="py-10 md:py-12">
        <div className="rounded-2xl bg-primary-50 ring-1 ring-primary-200 p-6 md:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-primary-600 px-4 py-1.5 text-sm font-bold text-white">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
            </span>
            Taking on new agencies
          </span>
          <p className="text-secondary-800 leading-relaxed flex-1">
            We currently have capacity for new estate and letting agency clients across London, from occasional
            one-off instructions to regular branch volume. Agree a rate card once, then send instructions by
            phone, WhatsApp or email whenever you need us.
          </p>
        </div>
      </Section>

      {/* Why agents choose us */}
      <Section variant="muted" id="why-agents">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-wide font-semibold text-primary-700">Built for Agency Workflows</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            Why London Agents Work With Us
          </h2>
        </div>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {whyAgents.map((s) => (
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

      {/* How instructions work */}
      <Section variant="default" id="how-it-works">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-start">
          <div>
            <p className="text-xs uppercase tracking-wide font-semibold text-primary-700">Simple by Design</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
              How Instructions Work
            </h2>
            <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
              No portals, no forms, no friction. Send the instruction the way your branch already works, and we
              handle everything from access to lodgement.
            </p>
            <ol className="mt-8 space-y-6">
              {process.map((p, i) => (
                <li key={p.step} className="flex gap-5">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary-600 text-white font-bold text-sm shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900">{p.step}</h3>
                    <p className="mt-1 text-secondary-700 leading-relaxed">{p.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <Card className="p-5 md:p-8">
            <h3 className="text-xl font-semibold text-secondary-900">Everything a listing needs</h3>
            <ul className="mt-4 space-y-2.5">
              {[
                'Official EPC lodged on the government register',
                'Professional floor plan, discounted with an EPC',
                'High-resolution files sized for Rightmove and Zoopla',
                `Next-day option for urgent instructions (+£${EXPRESS_SURCHARGE})`,
                'Evening and weekend access appointments',
                'One supplier for all 32 boroughs, no travel charges',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-secondary-700">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-secondary-600">
              See our <Link href="/services/domestic-epc" className="text-primary-700 underline">Domestic EPC service</Link>{' '}
              and <Link href="/services/floor-plans" className="text-primary-700 underline">floor plans</Link> for full details,
              or <Link href="/pricing" className="text-primary-700 underline">guide pricing</Link> by property size.
            </p>
          </Card>
        </div>
      </Section>

      <Pricing sourcePage="estate-agents" />

      {/* Agent FAQ */}
      <Section variant="default" id="agent-faq">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-wide font-semibold text-primary-700">Agent Questions</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            EPC FAQs for Estate &amp; Letting Agents
          </h2>
          <div className="mt-8">
            <Accordion items={agentFaq} />
          </div>
        </div>
      </Section>

      {/* Not bookable yet: no link, no price, no CTA, and deliberately absent
          from this page's Service/OfferCatalog schema. */}
      <Section variant="default" tier="compact">
        <div className="mx-auto flex max-w-3xl items-start gap-3 rounded-2xl border border-dashed border-secondary-300 bg-secondary-50/60 p-4 sm:p-5">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary-200 text-secondary-600">
            <Camera className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="flex flex-wrap items-center gap-2 text-base font-semibold text-secondary-900">
              Property Photography
              <span className="rounded-full bg-secondary-200 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-secondary-700">
                Coming soon
              </span>
            </p>
            <p className="mt-1 text-sm leading-relaxed text-secondary-600">
              Professional property photography for listings on Rightmove, Zoopla and other property
              portals. Intended for agencies that may eventually want EPCs, floor plans and
              listing-ready photography handled in one visit.
            </p>
          </div>
        </div>
      </Section>

      <CtaStrip
        heading="Add a Reliable EPC Supplier to Your Panel"
        body="Send an enquiry with your typical volume and we'll confirm an agency quote."
        primaryCta={{ label: 'Get In Touch', href: quoteHref({ service: 'bulk', sourcePage: 'estate-agents', ctaId: 'bottom' }) }}
      />
    </>
  )
}
