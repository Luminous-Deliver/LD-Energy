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
    `A written plan added to your EPC: which improvements would genuinely lift your London property's rating, what each costs to install, where your energy money currently goes, and the order to do them in. ${PLAN_PRICE}.`,
  alternates: { canonical: `${site.url}/services/epc-improvement-plan` },
  openGraph: {
    title: `EPC Improvement Plan London | ${PLAN_PRICE} | L&D Energy`,
    description:
      `Improvement recommendations kept on your certificate, a full Energy Report, and a written plan ranking what is worth doing on your building. ${PLAN_PRICE}, added to any EPC assessment.`,
    url: `${site.url}/services/epc-improvement-plan`,
  },
  twitter: {
    title: `EPC Improvement Plan London | ${PLAN_PRICE}`,
    description: `A written route to a better EPC rating, added to your assessment. ${PLAN_PRICE}.`,
  },
}

const breadcrumbs = [
  { href: '/', label: 'Home' },
  { href: '/services/epc-improvement-plan', label: 'Improvement Plan' },
]

const covered = [
  'Which improvements would actually move your score, based on the survey we just carried out',
  'What each measure typically costs to install, and what it saves per year',
  'Where your energy money currently goes — heating, hot water and lighting, split out',
  'The order to do them in, so you don’t pay twice',
  'Which measures count toward MEES compliance for rented homes',
  'What is realistic for the property type — solid wall, flat, period conversion',
  'What to ignore for this building, and why',
]

const audience = [
  {
    Icon: ShieldAlert,
    title: 'Landlords facing MEES',
    body: 'Rented homes must reach band E today, with band C proposed for future tenancies. If your property scored D or E, this is the fastest way to understand your options.',
  },
  {
    Icon: PoundSterling,
    title: 'Owners planning works',
    body: 'About to replace a boiler, insulate a loft or change windows? Knowing the running order stops you spending money in the wrong sequence.',
  },
  {
    Icon: ListOrdered,
    title: 'Buyers and sellers',
    body: 'A low rating is a negotiating point. Understand what it would genuinely take to improve before you price or purchase.',
  },
]

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${site.url}/services/epc-improvement-plan#service`,
  name: 'EPC Improvement Plan',
  serviceType: 'Energy efficiency improvement report',
  description:
    'A written improvement plan prepared by an accredited Domestic Energy Assessor, covering the practical route to a better EPC rating for a residential property. Includes the improvement recommendations on the lodged certificate and a full Energy Report, and is delivered alongside an EPC assessment.',
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
        subheading={`Your EPC tells you the rating. This tells you what to do about it — written up after your assessment and sent with your certificate, for ${PLAN_PRICE}.`}
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
              Three things, not one
            </h2>
            <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
              A standard EPC gives you a rating and a description of the property. The Improvement
              Plan adds the part that tells you what to do next — and it is written up properly,
              not talked through on the doorstep.
            </p>

            <ol className="mt-6 space-y-4">
              <li className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-600 text-sm font-bold text-white">
                  1
                </span>
                <span className="text-secondary-700 leading-relaxed">
                  <strong className="font-semibold text-secondary-900">
                    Improvement recommendations on your certificate.
                  </strong>{' '}
                  The measures, their installation costs and their yearly savings, published on your
                  official GOV.UK certificate.
                </span>
              </li>
              <li className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-600 text-sm font-bold text-white">
                  2
                </span>
                <span className="text-secondary-700 leading-relaxed">
                  <strong className="font-semibold text-secondary-900">A full Energy Report.</strong>{' '}
                  Where your money actually goes, split between heating, hot water and lighting, with
                  your carbon rating and heat-loss figure. None of this appears on the certificate.
                </span>
              </li>
              <li className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-600 text-sm font-bold text-white">
                  3
                </span>
                <span className="text-secondary-700 leading-relaxed">
                  <strong className="font-semibold text-secondary-900">
                    A written plan from your assessor.
                  </strong>{' '}
                  The judgement part: which of those measures are worth doing on your building, in
                  what order, and which to ignore.
                </span>
              </li>
            </ol>

            <p className="mt-6 text-secondary-700 leading-relaxed">
              The software’s list is generic and never explains what to do first. Because we have
              just surveyed the property, we can rank it against what is actually there — a solid
              wall, a flat with neighbours above and below, a period conversion — rather than a
              template. It costs <strong className="text-secondary-900">{PLAN_PRICE}</strong> on top
              of your EPC.
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
                <strong className="font-semibold text-secondary-900">Please note:</strong> without
                this add-on, your EPC is lodged with the rating and the property description but
                without improvement recommendations. The plan itself is written guidance based on
                professional judgement and your survey data — it is not a formal retrofit assessment
                (PAS 2035) and not a guarantee of a future rating. Installation costs are typical
                national ranges, not fixed quotations.
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
          — if your property already rates B or C, we’ll tell you honestly that you probably don’t
          need it.
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
