import { quoteHref } from '@/lib/quote-context'
import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, EyeOff, Hammer, Scale, ShieldAlert } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { PageHero } from '@/components/sections/PageHero'
import { CtaStrip } from '@/components/sections/CtaStrip'
import { AssessorCard } from '@/components/ui/AssessorCard'
import { site, priceFrom } from '@/lib/site'
import { areaServedLondon } from '@/lib/boroughs'

const LODGE_LATER = `£${site.addOns.lodgeLater}`
const FROM_PRICE = `£${priceFrom.epc}`

export const metadata: Metadata = {
  title: `EPC Pre-Assessment London | Your Score Without Lodging It | From ${FROM_PRICE}`,
  description:
    `Find out what your London property would score before anything goes on the public register. A full survey by an accredited assessor, deliberately not lodged, with a written improvement plan included. From ${FROM_PRICE}.`,
  alternates: { canonical: `${site.url}/services/epc-pre-assessment` },
  openGraph: {
    title: `EPC Pre-Assessment London | From ${FROM_PRICE} | L&D Energy`,
    description:
      `A full EPC survey that is never lodged, so no certificate is published. Your score, what is holding it back, and a written plan to improve it. From ${FROM_PRICE}.`,
    url: `${site.url}/services/epc-pre-assessment`,
  },
  twitter: {
    title: `EPC Pre-Assessment London | From ${FROM_PRICE}`,
    description: `Know your rating before it becomes public. Nothing is lodged. From ${FROM_PRICE}.`,
  },
}

const breadcrumbs = [
  { href: '/', label: 'Home' },
  { href: '/services/epc-pre-assessment', label: 'EPC Pre-Assessment' },
]

const included = [
  'A full survey of the property by an Elmhurst-accredited assessor — the same visit and the same measuring as a real EPC',
  'The rating and score the property would receive today',
  'A full breakdown of what is helping and what is holding the score back',
  'A written Improvement Plan: which measures are worth doing on your building, what they cost, and the order to do them in',
  'Nothing lodged, nothing published — no entry appears on the GOV.UK register',
]

const audience = [
  {
    Icon: Hammer,
    title: 'Planning works first',
    body: 'You intend to insulate, reglaze or change the heating before you sell or let. Find out where you stand now, do the work, and lodge a certificate that reflects the finished property.',
  },
  {
    Icon: ShieldAlert,
    title: 'Landlords checking MEES',
    body: 'You suspect the property is below band E and want to know before anything is on the public record. A pre-assessment tells you the gap and what closes it.',
  },
  {
    Icon: Scale,
    title: 'Buyers weighing a purchase',
    body: 'Considering a property with no valid EPC, or an old one. Understand the real running costs and the cost of improvement before you commit.',
  },
]

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${site.url}/services/epc-pre-assessment#service`,
  name: 'EPC Pre-Assessment',
  serviceType: 'Domestic energy assessment (not lodged)',
  description:
    'A full RdSAP survey of a residential property carried out by an accredited Domestic Energy Assessor and deliberately not lodged on the GOV.UK EPC Register, so no certificate is published. Includes an Energy Report and a written improvement plan. Not a substitute for an Energy Performance Certificate where one is legally required.',
  provider: { '@id': `${site.url}/#organization` },
  areaServed: areaServedLondon,
  offers: {
    '@type': 'Offer',
    priceSpecification: {
      '@type': 'PriceSpecification',
      minPrice: priceFrom.epc,
      priceCurrency: 'GBP',
    },
    availability: 'https://schema.org/InStock',
    url: `${site.url}/contact`,
  },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'EPC Pre-Assessment',
      item: `${site.url}/services/epc-pre-assessment`,
    },
  ],
}

export default function EpcPreAssessmentPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([serviceSchema, breadcrumbSchema]) }}
      />

      <BreadcrumbNav items={breadcrumbs} />

      <PageHero
        eyebrow="Assessment service"
        heading="EPC Pre-Assessment"
        subheading="Find out what your property would score before anything goes on the public register. A full survey, deliberately not lodged — so there is no certificate, and nothing to undo."
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ service: 'pre-assessment', sourcePage: 'pre-assessment', ctaId: 'hero' }) }}
      />

      {/* What it is */}
      <Section variant="default" id="what-it-is">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14 items-start">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
              <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
              What it is
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
              An EPC that never gets published
            </h2>
            <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
              Once an EPC is lodged it is public, and it stays on the register for ten years. That
              is exactly what you want when the property is ready. It is the wrong order if you are
              about to improve it.
            </p>
            <p className="mt-4 text-secondary-700 leading-relaxed">
              A pre-assessment is the same survey by the same accredited assessor, with one
              difference: we do not lodge it. You get the score, the reasons for it, and a plan —
              and no public record.
            </p>

            <h3 className="mt-9 text-xl font-bold text-secondary-900">What you get</h3>
            <ul className="mt-4 space-y-3">
              {included.map((c) => (
                <li key={c} className="flex items-start gap-3 text-secondary-700">
                  <CheckCircle2
                    className="w-5 h-5 text-accent-600 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{c}</span>
                </li>
              ))}
            </ul>

            <h3 className="mt-9 text-xl font-bold text-secondary-900">
              Deciding to lodge it afterwards
            </h3>
            <p className="mt-3 text-secondary-700 leading-relaxed">
              If you decide you want a real certificate after all, we can usually lodge the same
              survey for{' '}
              <strong className="text-secondary-900">{LODGE_LATER}</strong> without coming back —
              provided nothing about the property has changed since the visit, and the survey is
              still current. Ask us and we will confirm what is possible for your timing.
            </p>
            <p className="mt-3 text-secondary-700 leading-relaxed">
              If work <em>has</em> been done — an extension, new windows, new heating, new
              insulation — that is the whole point of having waited, but it needs a fresh visit with
              new photographs and measurements, priced as a new EPC.
            </p>

            <div className="mt-8 rounded-2xl border border-warm-200 bg-warm-50 p-5">
              <p className="text-sm leading-relaxed text-secondary-800">
                <strong className="font-semibold text-secondary-900">Important:</strong> a
                pre-assessment is <strong>not</strong> an Energy Performance Certificate and is not
                a substitute for one where an EPC is legally required — including marketing a
                property for sale or rent, and meeting MEES as a landlord. If you need a valid EPC
                now, book a{' '}
                <Link
                  href="/services/domestic-epc"
                  className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800"
                >
                  domestic EPC
                </Link>{' '}
                instead. A pre-assessment also cannot produce a better rating than the property
                earns — the score comes from government-approved software, and the only way to move
                it is to change the building.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <Card className="rounded-2xl ring-1 ring-secondary-900/5">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white ring-1 ring-primary-700/10 shrink-0">
                  <EyeOff className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide font-semibold text-secondary-500">
                    Pre-Assessment
                  </p>
                  <p className="text-2xl font-bold text-secondary-900">From {FROM_PRICE}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-secondary-700 leading-relaxed">
                Priced on the same floor-area bands as an EPC — it is the same visit and the same
                measuring. The Energy Report and written plan are included, not an extra.
              </p>
              <dl className="mt-4 space-y-2 text-sm border-t border-secondary-100 pt-4">
                <div className="flex justify-between gap-3">
                  <dt className="text-secondary-600">Lodged on the register</dt>
                  <dd className="font-semibold text-secondary-900">No</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-secondary-600">Improvement Plan</dt>
                  <dd className="font-semibold text-accent-700">Included</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-secondary-600">Lodge it later</dt>
                  <dd className="font-semibold text-secondary-900">{LODGE_LATER}</dd>
                </div>
              </dl>
              <Link
                href={quoteHref({ service: 'pre-assessment', sourcePage: 'pre-assessment', ctaId: 'inline' })}
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:from-primary-700 hover:to-primary-800"
              >
                Get my exact quote
              </Link>
              <Link
                href="/pricing"
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-secondary-200 px-4 py-2.5 text-sm font-semibold text-secondary-700 transition-colors hover:bg-secondary-50"
              >
                See the price bands
              </Link>
            </Card>

            <AssessorCard className="mt-5" />
          </div>
        </div>
      </Section>

      {/* Who it helps */}
      <Section variant="muted" id="who-its-for" pattern>
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
            <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
            Who it helps
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            Worth it when the timing is wrong
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {audience.map(({ Icon, title, body }) => (
            <Card key={title} className="rounded-2xl ring-1 ring-secondary-900/5">
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white ring-1 ring-primary-700/10">
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-secondary-900">{title}</h3>
              <p className="mt-2 text-sm text-secondary-700 leading-relaxed">{body}</p>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-secondary-700">
          Not sure which you need?{' '}
          <Link
            href={quoteHref({ service: 'pre-assessment', sourcePage: 'pre-assessment', ctaId: 'inline' })}
            className="font-semibold text-primary-700 hover:text-primary-800 underline underline-offset-2"
          >
            Tell us the situation
          </Link>{' '}
          — if you need a lodged certificate, we will say so rather than sell you this.
        </p>
      </Section>

      <CtaStrip
        heading="Know the score before it is public"
        body={`A full survey with nothing lodged, from ${FROM_PRICE}. We'll confirm your slot and exact price before booking.`}
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ service: 'pre-assessment', sourcePage: 'pre-assessment', ctaId: 'bottom' }) }}
      />
    </>
  )
}
