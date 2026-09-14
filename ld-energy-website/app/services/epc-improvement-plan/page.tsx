import { quoteHref } from '@/lib/quote-context'
import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Leaf, PoundSterling, ListOrdered, ShieldAlert } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { PageHero } from '@/components/sections/PageHero'
import { CtaStrip } from '@/components/sections/CtaStrip'
import { AssessorCard } from '@/components/ui/AssessorCard'
import { site } from '@/lib/site'
import { areaServedLondon } from '@/lib/boroughs'

const PLAN_PRICE = `£${site.addOns.improvementPlan}`

export const metadata: Metadata = {
  title: `EPC Improvement Plan London | ${PLAN_PRICE}`,
  description:
    `Abdul's personalised plan explaining what is holding your EPC rating back and which improvements to consider first, supported by the full Elmhurst Energy Report. ${PLAN_PRICE} extra.`,
  alternates: { canonical: `${site.url}/services/epc-improvement-plan` },
  openGraph: {
    title: `EPC Improvement Plan London | ${PLAN_PRICE} | L&D Energy`,
    description:
      `A personalised written plan and the full Elmhurst Energy Report for ${PLAN_PRICE} extra. Standard EPC recommendations are included either way.`,
    url: `${site.url}/services/epc-improvement-plan`,
  },
  twitter: {
    title: `EPC Improvement Plan London | ${PLAN_PRICE}`,
    description: `Personalised EPC improvement priorities supported by the full Elmhurst Energy Report. ${PLAN_PRICE} extra, with no guaranteed rating or savings.`,
  },
}

const breadcrumbs = [
  { href: '/', label: 'Home' },
  { href: '/services/epc-improvement-plan', label: 'Improvement Plan' },
]

const covered = [
  'What is holding the rating back, based on the assessment data',
  'Indicative installation costs and modelled savings, with their limitations',
  'Estimated energy-cost distribution for heating, hot water and lighting under standard occupancy assumptions',
  'Which improvements to consider first and which need further investigation',
  'How the EPC recommendations relate to current MEES requirements, where applicable',
  'What is realistic for the property type — solid wall, flat, period conversion',
  'Which measures may be unsuitable or need specialist advice, and why',
]

const audience = [
  {
    Icon: ShieldAlert,
    title: 'Landlords facing MEES',
    body: 'For rentals covered by MEES, the current minimum is E unless a valid exemption is registered. The confirmed higher standard for 1 October 2030 still needs legislation. The plan helps you consider property-specific options.',
  },
  {
    Icon: PoundSterling,
    title: 'Owners planning works',
    body: 'Considering insulation, heating or glazing work? A personalised plan helps you consider priorities before seeking installation advice and quotes.',
  },
  {
    Icon: ListOrdered,
    title: 'Buyers and sellers',
    body: 'Understand the assessed property and possible improvements before making decisions about a sale or purchase.',
  },
]

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${site.url}/services/epc-improvement-plan#service`,
  name: 'EPC Improvement Plan',
  serviceType: 'Energy efficiency improvement report',
  description:
    'An additional personalised written plan from Abdul Motaleb Taher explaining what is holding the EPC rating back and which improvements to consider first, supported by the full Elmhurst Energy Report. Standard EPC recommendations are included independently of this add-on. No rating or savings are guaranteed.',
  provider: { '@id': `${site.url}/#organization` },
  areaServed: areaServedLondon,
  offers: {
    '@type': 'Offer',
    price: site.addOns.improvementPlan,
    priceCurrency: 'GBP',
    description: 'Added to any EPC assessment',
    availability: 'https://schema.org/InStock',
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
      name: 'EPC Improvement Plan',
      item: `${site.url}/services/epc-improvement-plan`,
    },
  ],
}

export default function EpcImprovementPlanPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([serviceSchema, breadcrumbSchema]) }}
      />

      <BreadcrumbNav items={breadcrumbs} />

      <PageHero
        eyebrow="Add-on service"
        heading="EPC Improvement Plan"
        subheading={`Abdul's personalised plan explains what is holding your rating back and which improvements to consider first. Written after your assessment, with the full Elmhurst Energy Report as supporting evidence. ${PLAN_PRICE} extra.`}
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ service: 'epc', plan: true, sourcePage: 'improvement-plan', ctaId: 'hero' }) }}
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
              Personalised advice, supported by your assessment
            </h2>
            <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
              Your standard EPC already includes its software-generated recommendation report,
              where applicable. The optional Improvement Plan adds Abdul&apos;s interpretation
              of the assessment and priorities for your property.
            </p>

            <ol className="mt-6 space-y-4">
              <li className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-600 text-sm font-bold text-white">
                  1
                </span>
                <span className="text-secondary-700 leading-relaxed">
                  <strong className="font-semibold text-secondary-900">
                    A personalised written plan.
                  </strong>{' '}
                  Abdul explains what is holding the rating back and which improvements to
                  consider first, based on the property assessed.
                </span>
              </li>
              <li className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-600 text-sm font-bold text-white">
                  2
                </span>
                <span className="text-secondary-700 leading-relaxed">
                  <strong className="font-semibold text-secondary-900">The full Elmhurst Energy Report.</strong>{' '}
                  Supporting assessment evidence, including modelled energy use and costs.
                  These estimates use standard occupancy assumptions, not your household bills.
                </span>
              </li>
              <li className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-600 text-sm font-bold text-white">
                  3
                </span>
                <span className="text-secondary-700 leading-relaxed">
                  <strong className="font-semibold text-secondary-900">
                    Priorities and practical limitations.
                  </strong>{' '}
                  What to investigate first, how measures relate to each other, and where
                  installer or other specialist advice is needed before proceeding.
                </span>
              </li>
            </ol>

            <p className="mt-6 text-secondary-700 leading-relaxed">
              Standard recommendations come from the assessment software. Abdul&apos;s additional
              plan puts them in context for your property and explains the priorities in writing.
              It costs <strong className="text-secondary-900">{PLAN_PRICE}</strong> on top of
              your EPC and is already included in an EPC Pre-Assessment.
            </p>

            <h3 className="mt-10 text-xl font-bold text-secondary-900">What it covers</h3>
            <ul className="mt-4 space-y-3">
              {covered.map((c) => (
                <li key={c} className="flex items-start gap-3 text-secondary-700">
                  <CheckCircle2
                    className="w-5 h-5 text-accent-600 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{c}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl border border-warm-200 bg-warm-50 p-5">
              <p className="text-sm leading-relaxed text-secondary-800">
                <strong className="font-semibold text-secondary-900">Standard recommendations are included either way.</strong>{' '}
                A recommendation report may be omitted where there is no reasonable potential
                for improvement; any legitimate omission follows assessment rules, not your add-on
                choice. The plan is not a PAS 2035 retrofit assessment or an installation design.
                Costs and savings are estimates, not quotes or guarantees. No particular rating
                or improvement is guaranteed.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <Card className="rounded-2xl ring-1 ring-secondary-900/5">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 text-white ring-1 ring-accent-700/10 shrink-0">
                  <Leaf className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide font-semibold text-secondary-500">
                    Improvement Plan
                  </p>
                  <p className="text-2xl font-bold text-secondary-900">{PLAN_PRICE}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-secondary-700 leading-relaxed">
                Added to any EPC assessment. Tick the box on the enquiry form, or mention it when you
                call — you can also decide on the day, before we lodge.
              </p>
              <Link
                href={quoteHref({ service: 'epc', plan: true, sourcePage: 'improvement-plan', ctaId: 'inline' })}
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-accent-600 to-accent-700 px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:from-accent-700 hover:to-accent-800"
              >
                Get my exact quote
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
            Most useful if you’re in one of these positions
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
          Not sure whether it’s worth it?{' '}
          <Link
            href={quoteHref({ service: 'epc', plan: true, sourcePage: 'improvement-plan', ctaId: 'inline' })}
            className="font-semibold text-primary-700 hover:text-primary-800 underline underline-offset-2"
          >
            Ask us in your enquiry
          </Link>{' '}
          — tell us what you want to understand and we can explain whether the plan fits that need.
        </p>
      </Section>

      <CtaStrip
        heading="Get a quote for an EPC with the Improvement Plan"
        body={`Add it to any assessment for ${PLAN_PRICE}. We'll confirm your slot and exact price before booking.`}
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ service: 'epc', plan: true, sourcePage: 'improvement-plan', ctaId: 'bottom' }) }}
      />
    </>
  )
}
