import { quoteHref } from '@/lib/quote-context'
import type { Metadata } from 'next'
import Image from 'next/image'
import { Award, MapPin, Clock, BadgeCheck, FileText, Users } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { PageHero } from '@/components/sections/PageHero'
import { CtaStrip } from '@/components/sections/CtaStrip'
import { site, insurance } from '@/lib/site'

export const metadata: Metadata = {
  title: 'London EPC Assessor | Elmhurst Accredited',
  description:
    'Elmhurst-accredited Domestic Energy Assessor based in Stratford, East London. EPC certificates and floor plans across all 32 London boroughs.',
  alternates: { canonical: `${site.url}/about` },
  openGraph: {
    title: 'About L&D Energy | London EPC Assessor | Elmhurst Accredited',
    description:
      'L&D Energy, Elmhurst-accredited Domestic Energy Assessor based in Stratford, East London. Professional EPC certificates and floor plans across all London boroughs.',
    url: `${site.url}/about`,
  },
  twitter: {
    title: 'About L&D Energy | London EPC Assessor',
    description:
      'Elmhurst-accredited Domestic Energy Assessor based in Stratford, East London. EPC certificates across all London boroughs.',
  },
}

const breadcrumbs = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
]

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
    { '@type': 'ListItem', position: 2, name: 'About', item: `${site.url}/about` },
  ],
}

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${site.url}/about#assessor`,
  name: site.assessor.name,
  jobTitle: 'Domestic Energy Assessor (DEA)',
  worksFor: { '@id': `${site.url}/#organization` },
  knowsAbout: [
    'Energy Performance Certificates',
    'Domestic EPC assessment',
    'RdSAP 10 methodology',
    'MEES compliance',
    'Energy efficiency improvements',
  ],
  hasCredential: {
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'Accreditation',
    recognizedBy: { '@type': 'Organization', name: site.assessor.scheme },
    identifier: site.assessor.accreditationNumber,
  },
  url: `${site.url}/about`,
}

const credentials = [
  {
    Icon: BadgeCheck,
    title: 'Elmhurst Energy Accreditation',
    body: 'Accredited Domestic Energy Assessor (DEA) registered with Elmhurst Energy, the UK’s largest energy assessor accreditation scheme. Every certificate is lodged on the UK Government EPC Register.',
  },
  {
    Icon: FileText,
    title: 'Elmhurst SAP Software',
    body: 'We assess using Elmhurst SAP with the current RdSAP 10 methodology (October 2025+), the same official software used by all government-approved UK assessors.',
  },
  {
    Icon: Award,
    title: 'Fully Insured',
    body: insurance.full,
  },
]

const commitments = [
  {
    Icon: Clock,
    title: 'We answer the phone',
    body: 'Sounds simple, but it’s the biggest complaint we hear about other assessors. Phone, WhatsApp and email all reach the assessor directly, and we reply during our opening hours, Mon–Sun 8am–8pm.',
  },
  {
    Icon: BadgeCheck,
    title: 'We turn up on time',
    body: 'Booked slots are kept. If anything changes, we tell you immediately. Your time matters.',
  },
  {
    Icon: FileText,
    title: 'We deliver on schedule',
    body: '72-hour standard lodgement, or 24-hour express if you’ve chosen the next-day service. We lodge directly on the GOV.UK EPC Register and send you the certificate link once it is live.',
  },
  {
    Icon: Users,
    title: 'No surprise fees',
    body: 'Transparent guide prices by property type. No travel surcharges, no call-out charges. The quote we give is the price you pay.',
  },
]

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, personSchema]) }}
      />

      <BreadcrumbNav items={breadcrumbs} />

      <PageHero
        eyebrow="About Us"
        heading="About L&D Energy"
        subheading="Elmhurst-accredited Domestic Energy Assessor based in Stratford, East London. We deliver fast, transparent-priced EPC certificates and floor plans across every London borough."
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ service: 'epc', sourcePage: 'about', ctaId: 'hero' }) }}
      />

      {/* Who we are */}
      <Section variant="default" id="who-we-are">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
            <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
            Who We Are
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            A specialist EPC service for London
          </h2>
          <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
            L&amp;D Energy is the domestic Energy Performance Certificate brand of {site.parentBrand}. We provide official EPC certificates and professional floor plans for residential properties across all 32 London boroughs and the City of London.
          </p>
          <p className="mt-4 text-secondary-700 leading-relaxed">
            We focus on what landlords, homeowners and letting agents actually need: predictable pricing, fast turnaround, and a qualified assessor who answers their phone. That’s it. No upsells, no surprises, no chasing.
          </p>
        </div>
      </Section>

      {/* Our approach */}
      <Section variant="muted" id="approach">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
            <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
            Our Approach
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            How we work
          </h2>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {commitments.map((c) => (
            <li key={c.title} className="flex sm:flex-col items-start gap-4 sm:gap-0 rounded-2xl bg-canvas ring-1 ring-secondary-900/5 p-5 md:p-6 shadow-sm">
              <div className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary-50 ring-1 ring-primary-100 text-primary-700">
                <c.Icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="sm:mt-4">
                <h3 className="text-base md:text-lg font-semibold text-secondary-900">{c.title}</h3>
                <p className="mt-1.5 text-sm text-secondary-700 leading-relaxed">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* Credentials */}
      <Section variant="default" id="credentials">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
            <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
            Credentials
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            Accreditation &amp; Credentials
          </h2>
          <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
            Only an accredited Domestic Energy Assessor (DEA) can produce a domestic EPC that’s recognised by the UK Government EPC Register.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {credentials.map((c) => (
            <div key={c.title} className="flex sm:flex-col items-start gap-4 sm:gap-0 rounded-2xl bg-canvas ring-1 ring-secondary-900/5 p-5 md:p-6 shadow-sm">
              <div className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary-50 ring-1 ring-primary-100 text-primary-700">
                <c.Icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="sm:mt-4">
                <h3 className="text-base md:text-lg font-semibold text-secondary-900">{c.title}</h3>
                <p className="mt-1.5 text-sm text-secondary-700 leading-relaxed">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Founder / Coverage / Parent company */}
      <Section variant="muted" id="founder-coverage">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
              <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
              The Founder
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
              Meet Abdul
            </h2>
            <p className="mt-5 text-secondary-700 leading-relaxed">
              L&amp;D Energy is led by Abdul M Taher, an Elmhurst-accredited Domestic Energy Assessor based in Stratford, East London. Abdul personally carries out assessments, you’re not handed off to a stranger after booking.
            </p>
            <p className="mt-4 text-secondary-700 leading-relaxed">
              The service was set up because too many landlords and sellers told us the same story: unanswered phones, missed appointments, slow certificates, and surprise fees. We do the opposite, transparent pricing, clear timelines, and a real person who picks up.
            </p>

            {/* Verified assessor credential — ID card beside details */}
            <div className="mt-6 flex flex-col sm:flex-row gap-5 rounded-2xl border border-primary-200 bg-white p-5 shadow-sm">
              {/* Elmhurst ID card — true portrait ratio, constrained width */}
              <div className="shrink-0 mx-auto sm:mx-0 w-36 rounded-lg overflow-hidden border border-secondary-200 shadow-sm">
                <Image
                  src="/elmhurst-id.webp"
                  alt="Elmhurst Energy accreditation ID card for Abdul Motaleb Taher, EES/036265"
                  width={360}
                  height={554}
                  className="w-full h-auto"
                />
              </div>
              {/* Credential details */}
              <div className="flex-1">
                <div className="flex items-center gap-2 text-primary-700">
                  <BadgeCheck className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span className="text-xs font-bold uppercase tracking-wide">Elmhurst Energy Approved</span>
                </div>
                <dl className="mt-4 space-y-2.5 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-secondary-500">Assessor</dt>
                    <dd className="font-semibold text-secondary-900 text-right">{site.assessor.name}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-secondary-500">EES Number</dt>
                    <dd className="font-semibold text-secondary-900 text-right">{site.assessor.accreditationNumber}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-secondary-500">Scheme</dt>
                    <dd className="font-semibold text-secondary-900 text-right">{site.assessor.scheme}</dd>
                  </div>
                </dl>
                <a
                  href={site.assessor.verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-sm font-semibold text-primary-700 hover:text-primary-800 underline underline-offset-4"
                >
                  Verify on the official register →
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
              <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
              Coverage &amp; Parent Company
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
              Where we work
            </h2>
            <p className="mt-5 text-secondary-700 leading-relaxed">
              Based in Stratford (E15), we cover all 32 London boroughs, the City of London, and surrounding areas within a 1.5-hour radius, parts of Essex, Kent, Hertfordshire and Surrey included.
            </p>
            <p className="mt-4 text-secondary-700 leading-relaxed">
              {site.legal.statement}
            </p>

            {/* Coverage stats grid */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { value: '32', label: 'London Boroughs' },
                { value: '1.5hr', label: 'Travel radius' },
                { value: '7 days', label: '8am–8pm' },
                { value: '72hr', label: 'Standard delivery' },
              ].map(({ value, label }) => (
                <div key={label} className="rounded-xl bg-canvas ring-1 ring-secondary-900/5 p-4 text-center shadow-sm">
                  <p className="text-2xl font-bold text-secondary-900">{value}</p>
                  <p className="mt-0.5 text-xs text-secondary-500">{label}</p>
                </div>
              ))}
            </div>

            {/* Location + hours */}
            <div className="mt-4 rounded-xl bg-primary-50 ring-1 ring-primary-100 p-5">
              <ul className="space-y-3 text-secondary-700">
                <li className="flex items-center gap-2.5">
                  <MapPin className="w-5 h-5 text-primary-600 shrink-0" aria-hidden="true" />
                  <span>Stratford, East London E15</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-primary-600 shrink-0" aria-hidden="true" />
                  <span>{site.hours}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <CtaStrip
        heading="Ready to Work With Us?"
        body="Request your EPC quote online, or get in touch with any question. We reply during our opening hours, Mon–Sun 8am–8pm."
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ service: 'epc', sourcePage: 'about', ctaId: 'bottom' }) }}
      />
    </>
  )
}
