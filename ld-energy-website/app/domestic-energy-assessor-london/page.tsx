import { quoteHref } from '@/lib/quote-context'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ClipboardCheck,
  Calculator,
  FileCheck2,
  Lightbulb,
  MapPin,
  Clock,
  UserCheck,
  BadgeCheck,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { Accordion } from '@/components/ui/Accordion'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { PageHero } from '@/components/sections/PageHero'
import { Pricing } from '@/components/sections/Pricing'
import { CtaStrip } from '@/components/sections/CtaStrip'
import { site, pricing, priceFrom, insurance, EXPRESS_SURCHARGE } from '@/lib/site'
import { areaServedLondon } from '@/lib/boroughs'
import type { FaqItem } from '@/lib/faq'

const PATH = '/domestic-energy-assessor-london'

export const metadata: Metadata = {
  title: 'Domestic Energy Assessor in London',
  description:
    `Elmhurst-accredited domestic energy assessor in Stratford, covering all 32 London boroughs. Official EPC certificates from £${priceFrom.epc}, next-day available.`,
  alternates: { canonical: `${site.url}${PATH}` },
  openGraph: {
    title: 'Domestic Energy Assessor London | Elmhurst Accredited | L&D Energy',
    description:
      `Elmhurst-accredited domestic energy assessor covering all 32 London boroughs. Official EPC certificates from £${priceFrom.epc}, next-day service available.`,
    url: `${site.url}${PATH}`,
  },
  twitter: {
    title: 'Domestic Energy Assessor London | Elmhurst Accredited',
    description:
      `Elmhurst-accredited domestic energy assessor covering all 32 London boroughs. EPCs from £${priceFrom.epc}.`,
  },
}

const breadcrumbs = [
  { href: '/', label: 'Home' },
  { href: PATH, label: 'Domestic Energy Assessor' },
]

const duties = [
  {
    Icon: ClipboardCheck,
    title: 'Inspects the property',
    body: 'A non-invasive survey recording construction, insulation, heating, hot water, glazing, lighting and ventilation, room by room.',
  },
  {
    Icon: Calculator,
    title: 'Calculates the rating',
    body: 'Details are entered into government-approved RdSAP 10 software, which produces a SAP score from 1–100 and the matching A–G band.',
  },
  {
    Icon: FileCheck2,
    title: 'Lodges the certificate',
    body: 'The completed EPC is lodged on the official UK Government EPC Register, the only place a domestic EPC is legally valid.',
  },
  {
    Icon: Lightbulb,
    title: 'Recommends improvements',
    body: 'Every certificate lists cost-effective upgrades, ranked by impact, to help you raise the rating and cut running costs.',
  },
]

const whyLocal = [
  {
    Icon: MapPin,
    title: 'Knows London housing stock',
    body: 'Victorian terraces, ex-council blocks, new-build flats, conservation areas, we assess them every week and know what affects each one.',
  },
  {
    Icon: UserCheck,
    title: 'One assessor, start to finish',
    body: 'Abdul personally carries out your assessment. You are not handed to a subcontractor or a faceless call centre.',
  },
  {
    Icon: Clock,
    title: 'Fast and flexible',
    body: `72-hour standard lodgement, or next-day for £${EXPRESS_SURCHARGE}. Appointments 7 days a week, including evenings and weekends.`,
  },
  {
    Icon: ShieldCheck,
    title: 'Accredited and insured',
    body: insurance.full,
  },
]

const deaFaq: FaqItem[] = [
  {
    q: 'What is a domestic energy assessor?',
    a: 'A domestic energy assessor (DEA) is a qualified, accredited professional licensed to assess the energy efficiency of residential properties and produce an Energy Performance Certificate (EPC). Only an accredited DEA registered with a government-approved scheme such as Elmhurst Energy can lodge a domestic EPC on the official UK Government EPC Register.',
  },
  {
    q: 'How do I find a domestic energy assessor in London?',
    a: 'You can search the official Elmhurst or EPC Register find-an-assessor tools, or book directly with a local accredited DEA. L&D Energy is an Elmhurst-accredited domestic energy assessor based in Stratford, East London, covering all 32 London boroughs and surrounding areas within a 1.5-hour radius. Call 07492 575 396 or book online.',
  },
  {
    q: 'How much does a domestic energy assessor charge in London?',
    a: `Guide prices start from £${pricing[0].epc} for properties up to 37 m² and rise with internal floor area, up to £${pricing[5].epc} for homes over 121 m². These are starting estimates — the final price depends on internal floor area (m²), extensions, layout and condition. There is no call-out or mileage charge within our normal service area, and travel beyond it is priced into the quote you receive before booking.`,
  },
  {
    q: 'Do I need an accredited assessor for an EPC?',
    a: 'Yes. A domestic EPC is only legally valid if it is produced by an accredited domestic energy assessor and lodged on the UK Government EPC Register. An EPC from an unaccredited person cannot be used to sell or rent a property. Always check your assessor’s accreditation number, ours is EES/036265 with Elmhurst Energy.',
  },
  {
    q: 'How long does a domestic energy assessment take?',
    a: 'The on-site assessment usually takes 45 minutes to 2 hours depending on the size of the property. Your certificate is then lodged on the GOV.UK EPC Register within 72 hours as standard, or within 24 hours if you choose our next-day service, and we send you the link once it is live.',
  },
  {
    q: 'Is a domestic energy assessor the same as a commercial energy assessor?',
    a: 'No. A domestic energy assessor (DEA) assesses residential homes using RdSAP. Commercial (non-domestic) properties require a non-domestic energy assessor using different methodology. L&D Energy specialises in domestic EPCs for houses and flats.',
  },
]

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
    { '@type': 'ListItem', position: 2, name: 'Domestic Energy Assessor', item: `${site.url}${PATH}` },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: deaFaq.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Domestic Energy Assessment',
  name: 'Domestic Energy Assessor in London',
  description:
    'Elmhurst-accredited domestic energy assessor producing official EPC certificates for residential properties across all 32 London boroughs.',
  areaServed: areaServedLondon,
  provider: { '@id': `${site.url}/#business` },
  url: `${site.url}${PATH}`,
}

export default function DomesticEnergyAssessorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, faqSchema, serviceSchema]) }}
      />

      <BreadcrumbNav items={breadcrumbs} />

      <PageHero
        eyebrow="Domestic Energy Assessor"
        heading="Your Local Domestic Energy Assessor in London"
        subheading={`L&D Energy is an Elmhurst-accredited Domestic Energy Assessor (DEA) based in Stratford, East London. We produce official EPC certificates for homes across all 32 London boroughs, with guide prices from £${priceFrom.epc} and next-day appointments available.`}
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ service: 'epc', sourcePage: 'assessor', ctaId: 'hero' }) }}
      />

      {/* What is a DEA */}
      <Section variant="default" id="what-is-a-dea">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
            <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
            The Basics
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            What is a domestic energy assessor?
          </h2>
          <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
            A domestic energy assessor (DEA) is a qualified, accredited professional licensed to assess the energy efficiency of residential properties and produce an Energy Performance Certificate (EPC).
          </p>
          <p className="mt-4 text-secondary-700 leading-relaxed">
            Only an accredited DEA, registered with a government-approved scheme such as Elmhurst Energy, can lodge a domestic EPC on the official{' '}
            <span className="font-semibold text-secondary-900">UK Government EPC Register</span>. An EPC from an unaccredited person cannot legally be used to sell or rent a home. The assessment itself is non-invasive: your assessor surveys the property, records its construction and services, and the approved RdSAP software calculates the rating.
          </p>
          <p className="mt-4 text-secondary-700 leading-relaxed">
            Need the certificate itself? See our{' '}
            <Link href="/services/domestic-epc" className="font-semibold text-primary-700 hover:text-primary-800 underline underline-offset-2">
              domestic EPC service
            </Link>{' '}
            or{' '}
            <Link href="/pricing" className="font-semibold text-primary-700 hover:text-primary-800 underline underline-offset-2">
              view pricing
            </Link>
            .
          </p>
        </div>
      </Section>

      {/* What a DEA does */}
      <Section variant="muted" id="what-a-dea-does">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
            <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
            The Role
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            What a domestic energy assessor does
          </h2>
          <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
            Four steps, from first visit to your certificate live on the GOV.UK register.
          </p>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {duties.map((d) => (
            <li key={d.title} className="flex sm:flex-col items-start gap-4 sm:gap-0 rounded-2xl bg-canvas ring-1 ring-secondary-900/5 p-5 md:p-6 shadow-sm">
              <div className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary-50 ring-1 ring-primary-100 text-primary-700">
                <d.Icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="sm:mt-4">
                <h3 className="text-base md:text-lg font-semibold text-secondary-900">{d.title}</h3>
                <p className="mt-1.5 text-sm text-secondary-700 leading-relaxed">{d.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* Accreditation */}
      <Section variant="default" id="accreditation">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-start">
          <div>
            <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
              <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
              Accredited &amp; Qualified
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
              An assessor you can verify
            </h2>
            <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
              Your EPC is only as trustworthy as the assessor behind it. L&D Energy is led by Abdul Motaleb Taher, an Elmhurst-accredited domestic energy assessor whose credentials you can check independently.
            </p>
            <p className="mt-4 text-secondary-700 leading-relaxed">
              Read more about{' '}
              <Link href="/about" className="font-semibold text-primary-700 hover:text-primary-800 underline underline-offset-2">
                your assessor and our story
              </Link>
              , or check the live coverage across{' '}
              <Link href="/areas" className="font-semibold text-primary-700 hover:text-primary-800 underline underline-offset-2">
                all 32 London boroughs
              </Link>
              .
            </p>
          </div>

          {/* Verified credential card */}
          <div className="rounded-2xl border border-primary-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-primary-700">
              <BadgeCheck className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-wide">Elmhurst Energy Approved</span>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-secondary-500">Assessor</dt>
                <dd className="font-semibold text-secondary-900 text-right">{site.assessor.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-secondary-500">Accreditation No.</dt>
                <dd className="font-semibold text-secondary-900 text-right">{site.assessor.accreditationNumber}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-secondary-500">Scheme</dt>
                <dd className="font-semibold text-secondary-900 text-right">{site.assessor.scheme}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-secondary-500">Methodology</dt>
                <dd className="font-semibold text-secondary-900 text-right">RdSAP 10</dd>
              </div>
            </dl>
            <a
              href={site.assessor.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800 underline underline-offset-4"
            >
              Verify on the official register
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </Section>

      {/* Why a local DEA */}
      <Section variant="muted" id="why-local">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
            <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
            Why Local
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            Why use a local London assessor
          </h2>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyLocal.map((w) => (
            <li key={w.title} className="flex sm:flex-col items-start gap-4 sm:gap-0 rounded-2xl bg-canvas ring-1 ring-secondary-900/5 p-5 md:p-6 shadow-sm">
              <div className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary-50 ring-1 ring-primary-100 text-primary-700">
                <w.Icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="sm:mt-4">
                <h3 className="text-base md:text-lg font-semibold text-secondary-900">{w.title}</h3>
                <p className="mt-1.5 text-sm text-secondary-700 leading-relaxed">{w.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Pricing sourcePage="assessor" />

      {/* FAQ */}
      <Section variant="default" id="faq">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
            <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
            FAQ
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            Domestic energy assessor FAQs
          </h2>
        </div>
        <div className="mt-8 max-w-3xl">
          <Accordion
            items={deaFaq}
            defaultOpenIndex={0}
            className="rounded-2xl border-0 ring-1 ring-secondary-900/5 shadow-premium overflow-hidden"
          />
        </div>
      </Section>

      <CtaStrip
        heading="Get a quote from your London Domestic Energy Assessor"
        body={`Elmhurst-accredited, all 32 boroughs, guide prices from £${priceFrom.epc}. Lodged in 72 hours, or next day for £${EXPRESS_SURCHARGE} extra.`}
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ service: 'epc', sourcePage: 'assessor', ctaId: 'bottom' }) }}
      />
    </>
  )
}
