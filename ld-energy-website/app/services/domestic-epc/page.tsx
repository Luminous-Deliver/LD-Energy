import { quoteHref } from '@/lib/quote-context'
import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, User, Building2, Users } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { StepList } from '@/components/ui/StepList'
import { PageHero } from '@/components/sections/PageHero'
import { Pricing } from '@/components/sections/Pricing'
import { CtaStrip } from '@/components/sections/CtaStrip'
import { Faq } from '@/components/sections/Faq'
import { site, pricing, priceFrom, EXPRESS_SURCHARGE } from '@/lib/site'
import { areaServedLondon } from '@/lib/boroughs'
import type { FaqItem } from '@/lib/faq'
import { Accordion } from '@/components/ui/Accordion'

export const metadata: Metadata = {
  title: `Domestic EPC London | From £${priceFrom.epc} | Next-Day`,
  description: `Domestic EPC certificate in London from £${priceFrom.epc}. Elmhurst-accredited assessor, next-day available, 72-hour standard lodgement. Exact quote before booking.`,
  alternates: { canonical: `${site.url}/services/domestic-epc` },
  openGraph: {
    title: `Domestic EPC Certificate London | From £${priceFrom.epc} | L&D Energy`,
    description: `Get your domestic EPC certificate in London from £${priceFrom.epc}. Elmhurst accredited assessor, 72-hour standard lodgement, next-day available. Required for selling or renting your home.`,
    url: `${site.url}/services/domestic-epc`,
  },
  twitter: {
    title: `Domestic EPC Certificate London | From £${priceFrom.epc}`,
    description:
      'Elmhurst accredited assessor, 72-hour standard delivery, next-day available. Required for selling or renting.',
  },
}

const breadcrumbs = [
  { href: '/', label: 'Home' },
  { href: '/services/domestic-epc', label: 'Domestic EPC' },
]

const epcContents = [
  'Current energy efficiency rating (A–G)',
  'Potential rating if recommended improvements are made',
  'Estimated annual energy costs',
  'CO₂ emissions estimate',
  'Specific recommendations to improve efficiency',
  'Estimated cost and savings for each recommendation',
]

const whenRequired = [
  'Selling a residential property',
  'Renting a property to a new tenant',
  'Marketing a property for sale or rent',
  'Completing major renovations that change energy performance',
]

const personas = [
  {
    Icon: User,
    title: 'Homeowners Selling',
    body: 'You need a valid EPC before marketing your property. Estate agents cannot legally list your home without one. We provide same-week service to avoid delaying your sale.',
  },
  {
    Icon: Building2,
    title: 'Landlords',
    body: 'MEES regulations require all rental properties to have an EPC rated E or above. Fines reach £5,000 per non-compliant property. We help landlords stay compliant with fast, transparent pricing.',
  },
  {
    Icon: Users,
    title: 'Letting Agents',
    body: 'Quick turnaround for new instructions. Portfolio rates available for multiple properties. We work with letting agents across London.',
  },
]

const process = [
  {
    title: 'Request your quote',
    body: 'Online form, phone, WhatsApp, or email, whichever suits you.',
  },
  {
    title: 'We confirm details',
    body: 'We confirm time, address, and any access requirements during our opening hours, Mon–Sun 8am–8pm.',
  },
  {
    title: 'On-site assessment',
    body: 'Our DEA measures and records all required data. Typically 45 minutes to 2 hours depending on property size.',
  },
  {
    title: 'Software processing',
    body: 'Data is processed through Elmhurst SAP (RdSAP 10), the same software used by all registered UK assessors.',
  },
  {
    title: 'Certificate delivered',
    body: 'Lodged on the official GOV.UK EPC register within 72 hours (or next day if express), with your certificate link sent once it is live.',
  },
]

const assessed = [
  'Property dimensions and total floor area',
  'Number of habitable rooms and storeys',
  'Wall construction type and insulation',
  'Roof type and insulation depth',
  'Floor construction and insulation',
  'Window glazing type, frame, and age',
  'External doors',
  'Main and secondary heating systems',
  'Heating controls and programmer',
  'Hot water system and cylinder insulation',
  'Ventilation systems',
  'Lighting (count of low-energy fittings)',
  'Renewable energy systems (solar PV, heat pumps, etc.)',
]

const serviceFaq: FaqItem[] = [
  {
    q: 'How much does a domestic EPC cost in London?',
    a: `Guide prices start from £${pricing[0].epc} for properties up to 37 m² and rise with internal floor area, up to £${pricing[5].epc} for homes over 121 m². Internal floor area (m²) is the main factor, alongside extensions, layout and condition. Your exact quote is confirmed before booking.`,
  },
  {
    q: 'Can I get a next-day EPC?',
    a: `Yes. Add our next-day service for £${EXPRESS_SURCHARGE} and your certificate is lodged within 24 hours of the assessment rather than the standard 72. Book before noon for the best chance of a same-day or next-morning appointment.`,
  },
  {
    q: 'How long does an EPC assessment take?',
    a: 'Assessments typically take 45 minutes for studios up to around 2 hours for larger 4–5 bedroom homes. You do not need to do any preparation, just normal access to all rooms.',
  },
  {
    q: 'Do I legally need an EPC?',
    a: 'Yes. You must have a valid EPC before marketing a property for sale or letting it to a new tenant. Estate agents cannot legally list a property without one, and landlords currently face fines of up to £5,000 per property for letting without a compliant EPC (the government has proposed raising this to £30,000 under future EPC C standards).',
  },
  {
    q: 'How long is an EPC valid for?',
    a: 'An EPC is valid for 10 years. You can use the same certificate for multiple lettings within that period as long as it remains on the government register.',
  },
]

const serviceFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: serviceFaq.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Energy Performance Certificate Assessment',
  name: 'Domestic EPC Certificate',
  description:
    'Official Energy Performance Certificate for residential properties, required for selling or renting in England and Wales.',
  provider: { '@id': `${site.url}/#business` },
  url: `${site.url}/services/domestic-epc`,
  areaServed: areaServedLondon,
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'EPC Pricing',
    itemListElement: pricing.map((p) => ({
      '@type': 'Offer',
      name: `${p.label} EPC`,
      priceSpecification: {
        '@type': 'PriceSpecification',
        minPrice: p.epc,
        priceCurrency: 'GBP',
      },
    })),
  },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
    { '@type': 'ListItem', position: 2, name: 'Domestic EPC', item: `${site.url}/services/domestic-epc` },
  ],
}

export default function DomesticEpcPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([serviceSchema, serviceFaqSchema, breadcrumbSchema]) }}
      />

      <BreadcrumbNav items={breadcrumbs} />

      <PageHero
        eyebrow="Domestic EPC Certificates"
        heading="Domestic EPC Certificates in London"
        subheading={`Official Energy Performance Certificates for selling or renting your home. Elmhurst accredited. Guide prices from £${priceFrom.epc}, with your exact quote confirmed before booking. Lodged on the official GOV.UK EPC Register.`}
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ service: 'epc', sourcePage: 'domestic-epc', ctaId: 'hero' }) }}
      />

      {/* What is a Domestic EPC */}
      <Section variant="default" id="what-is-epc">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
            <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
            What Is It?
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            What is a Domestic EPC?
          </h2>
          <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
            A Domestic Energy Performance Certificate (EPC) is an official UK government document that rates a residential property&rsquo;s energy efficiency on a scale from A (most efficient) to G (least efficient). It shows the property&rsquo;s current and potential energy efficiency, estimated energy costs, and recommendations for improvement.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Card>
            <h3 className="text-xl font-semibold text-secondary-900">Your EPC includes</h3>
            <ul className="mt-4 space-y-2.5">
              {epcContents.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-secondary-700">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <h3 className="text-xl font-semibold text-secondary-900">EPCs are legally required when</h3>
            <ul className="mt-4 space-y-2.5">
              {whenRequired.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-secondary-700">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      {/* Who Needs an EPC */}
      <Section variant="muted" id="who-needs-epc">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
            <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
            Who Is It For?
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            Who Needs a Domestic EPC?
          </h2>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {personas.map((p) => (
            <div key={p.title} className="flex sm:flex-col items-start gap-4 sm:gap-0 rounded-2xl bg-canvas ring-1 ring-secondary-900/5 p-5 md:p-6 shadow-sm">
              <div className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary-50 ring-1 ring-primary-100 text-primary-700">
                <p.Icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="sm:mt-4">
                <h3 className="text-base md:text-lg font-semibold text-secondary-900">{p.title}</h3>
                <p className="mt-1.5 text-sm text-secondary-700 leading-relaxed">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-secondary-700">
          Estate or letting agent instructing on behalf of clients?{' '}
          <Link href="/estate-agents" className="text-primary-700 underline underline-offset-2 hover:text-primary-800 font-medium">
            See our dedicated EPC service for agents
          </Link>
          , with volume rates and fast turnaround on new instructions.
        </p>
      </Section>

      {/* Process */}
      <Section variant="default" id="epc-process">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
              <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
              The Process
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
              Our EPC Process
            </h2>
            <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
              From booking to your certificate live on the GOV.UK register, usually within 72 hours.
            </p>
            <StepList steps={process} className="mt-8" />
          </div>

          <div>
            <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
              <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
              What We Record
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
              What We Assess
            </h2>
            <p className="mt-5 text-secondary-700 leading-relaxed">
              Our DEA records the following during the on-site visit. No preparation is needed, just normal access to all rooms.
            </p>
            <ul className="mt-6 space-y-2">
              {assessed.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-secondary-700">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Pricing sourcePage="domestic-epc" />

      {/* Service-specific FAQ */}
      <Section variant="muted" id="epc-faq">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
            <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
            Common Questions
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            Domestic EPC Questions
          </h2>
          <div className="mt-8">
            <Accordion items={serviceFaq} />
          </div>
        </div>
      </Section>

      <Faq />

      <CtaStrip
        heading="Ready for your EPC quote?"
        body="Fast, transparent-priced EPC certificates across London. We'll arrange your assessment at a time that suits you."
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ service: 'epc', sourcePage: 'domestic-epc', ctaId: 'bottom' }) }}
      />
    </>
  )
}
