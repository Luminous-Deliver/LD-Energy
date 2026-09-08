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

const CONSULT_PRICE = `£${site.addOns.retrofitConsult}`

export const metadata: Metadata = {
  title: `Retrofit & Energy Efficiency Consultation London | ${CONSULT_PRICE}`,
  description:
    `A 10-minute retrofit consultation added to your EPC: what would realistically lift your London property's rating — often the next band up, sometimes to band C or further — what each step costs, and the order to do it in. ${CONSULT_PRICE}.`,
  alternates: { canonical: `${site.url}/services/retrofit-consultation` },
  openGraph: {
    title: `Retrofit & Energy Efficiency Consultation London | ${CONSULT_PRICE} | L&D Energy`,
    description:
      `Get a plain-English route to a better EPC rating for your London property — often the next band up, sometimes band C or beyond. A 10-minute verbal consultation with your accredited assessor on the day of your survey, for ${CONSULT_PRICE}.`,
    url: `${site.url}/services/retrofit-consultation`,
  },
  twitter: {
    title: `Retrofit & Energy Efficiency Consultation London | ${CONSULT_PRICE}`,
    description:
      `A 10-minute route-to-a-better-rating consultation added to your EPC assessment. ${CONSULT_PRICE}.`,
  },
}

const breadcrumbs = [
  { href: '/', label: 'Home' },
  { href: '/services/retrofit-consultation', label: 'Retrofit Consultation' },
]

const covered = [
  'Which improvements would actually move your score, based on the survey we just carried out',
  'Roughly what each measure costs to install in London',
  'The order to do them in, so you don’t pay twice',
  'Which measures count toward MEES compliance for rented homes',
  'What is realistic for the property type — solid wall, flat, period conversion',
  'Where grants or schemes may apply, and where they usually don’t',
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
  '@id': `${site.url}/services/retrofit-consultation#service`,
  name: 'Retrofit and Energy Efficiency Consultation',
  serviceType: 'Energy efficiency consultation',
  description:
    'A 10-minute verbal consultation with an accredited Domestic Energy Assessor covering the practical route to a better EPC rating for a residential property, delivered alongside an EPC assessment.',
  provider: { '@id': `${site.url}/#organization` },
  areaServed: areaServedLondon,
  offers: {
    '@type': 'Offer',
    price: site.addOns.retrofitConsult,
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
      name: 'Retrofit Consultation',
      item: `${site.url}/services/retrofit-consultation`,
    },
  ],
}

export default function RetrofitConsultationPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([serviceSchema, breadcrumbSchema]) }}
      />

      <BreadcrumbNav items={breadcrumbs} />

      <PageHero
        eyebrow="Add-on service"
        heading="Retrofit & Energy Efficiency Consultation"
        subheading={`Your EPC tells you the rating. This tells you what to do about it — a 10-minute verbal walk-through with your assessor on the day, for ${CONSULT_PRICE}.`}
        primaryCta={{ label: 'Add it to your booking', href: '/contact' }}
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
              A plain-English route to a better rating
            </h2>
            <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
              Every EPC comes with a standard list of recommendations generated by the software. They
              are generic, sometimes unrealistic, and they never explain what to do first. This
              consultation is the human version.
            </p>
            <p className="mt-4 text-secondary-700 leading-relaxed">
              Because we have just surveyed the property, we can talk through what genuinely applies to
              your building — not a template. It takes about 10 minutes at the end of the visit, and it
              costs <strong className="text-secondary-900">{`£${site.addOns.retrofitConsult}`}</strong> on
              top of your EPC.
            </p>

            <ul className="mt-8 space-y-3">
              {covered.map((c) => (
                <li key={c} className="flex items-start gap-3 text-secondary-700">
                  <CheckCircle2 className="w-5 h-5 text-accent-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl border border-warm-200 bg-warm-50 p-5">
              <p className="text-sm leading-relaxed text-secondary-800">
                <strong className="font-semibold text-secondary-900">Please note:</strong> this is a
                verbal consultation based on professional judgement and your survey data. It is
                guidance to help you plan, not a formal retrofit assessment (PAS 2035), a written
                report, or a guarantee of a future rating. Costs quoted are typical London ranges, not
                fixed quotations.
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
                    Consultation
                  </p>
                  <p className="text-2xl font-bold text-secondary-900">
                    {`£${site.addOns.retrofitConsult}`}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-secondary-700 leading-relaxed">
                Added to any EPC assessment. Just tick the box on the booking form, or mention it when
                you call — you can also decide on the day.
              </p>
              <Link
                href="/contact"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-accent-600 to-accent-700 px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:from-accent-700 hover:to-accent-800"
              >
                Book an EPC with consultation
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
            href="/contact"
            className="font-semibold text-primary-700 hover:text-primary-800 underline underline-offset-2"
          >
            Ask us when you book
          </Link>{' '}
          — if your property already rates B or C, we’ll tell you honestly that you probably don’t need it.
        </p>
      </Section>

      <CtaStrip
        heading="Book an EPC with a retrofit consultation"
        body={`Add the 10-minute consultation to any assessment for ${CONSULT_PRICE}. We'll confirm your slot and exact price before booking.`}
        primaryCta={{ label: 'Book Your EPC', href: '/contact' }}
      />
    </>
  )
}
