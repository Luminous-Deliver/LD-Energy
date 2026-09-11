import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, MapPin } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { PageHero } from '@/components/sections/PageHero'
import { LocalPricingSummary } from '@/components/sections/LocalPricingSummary'
import { CtaStrip } from '@/components/sections/CtaStrip'
import { Accordion } from '@/components/ui/Accordion'
import { ContactSection } from '@/components/sections/ContactSection'
import { boroughMeta, boroughIntent, type BoroughIntent } from '@/lib/boroughs'
import { site, pricing, priceFrom, formatPrice, maxBundleSaving, EXPRESS_SURCHARGE } from '@/lib/site'
import type { FaqItem } from '@/lib/faq'

interface PageProps {
  params: Promise<{ borough: string }>
}

export async function generateStaticParams() {
  return Object.keys(boroughMeta).map((slug) => ({ borough: slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { borough: slug } = await params
  const data = boroughMeta[slug]
  if (!data) return {}
  const intent = boroughIntent[slug] ?? 'service'

  return {
    // Search Console (6 months to Aug 2026) shows these pages ranking 6-19 for
    // "cost of EPC in {area}" — 2,292 impressions across 53 such queries — with
    // ZERO clicks, while the title said "EPC Assessor {Area} | {neighbourhoods}"
    // and never mentioned cost. The title now answers the question that is
    // actually being asked, and the neighbourhood signal moves into the
    // description where it still earns the long tail.
    title: { absolute: boroughTitle(data.name, intent, data.metaTitle) },
    description: boroughDescription(data.name, intent),
    alternates: { canonical: `${site.url}/areas/${slug}` },
    openGraph: {
      title: `EPC in ${data.name} | Cost from £${priceFrom.epc} | L&D Energy`,
      description: `EPC cost in ${data.name}: guide prices from £${priceFrom.epc}, based on internal floor area. Exact quote confirmed before booking.`,
      url: `${site.url}/areas/${slug}`,
    },
    twitter: {
      title: `EPC in ${data.name} | From £${priceFrom.epc} | L&D Energy`,
      description: `Domestic EPC certificate in ${data.name} from £${priceFrom.epc}. Next-day service available.`,
    },
  }
}

/**
 * Title and description shaped by the borough's measured search intent rather
 * than one template for all 34 — see boroughIntent in lib/boroughs.ts.
 *
 * 'cost'     lead with the cost question, which is what these pages are found on
 * 'balanced' EPC + area first, price second
 * 'service'  keep the existing assessor/neighbourhood title, which already
 *            holds equity and matches the queries these pages actually get
 *
 * Titles are capped at 60 characters, dropping the trailing trust phrase rather
 * than letting the price — the part that earns the click — be truncated.
 */
function fit(core: string, suffix: string): string {
  const full = `${core} | ${suffix}`
  return full.length <= 60 ? full : core
}

function boroughTitle(name: string, intent: BoroughIntent, fallback: string): string {
  if (intent === 'cost') return fit(`EPC Cost in ${name} | Prices from £${priceFrom.epc}`, 'L&D Energy')
  if (intent === 'balanced') return fit(`EPC ${name} | Cost from £${priceFrom.epc}`, 'Elmhurst Accredited')
  return fallback
}

function boroughDescription(name: string, intent: BoroughIntent): string {
  if (intent === 'service') {
    return `Elmhurst-accredited EPC assessor covering ${name}. Guide prices from £${priceFrom.epc}, set by internal floor area, with your exact quote confirmed before booking.`
  }
  return `EPC cost in ${name}: guide prices from £${priceFrom.epc}, set by internal floor area. Elmhurst-accredited assessor, exact quote before booking.`
}

function boroughFaq(name: string, postcodeFaq: { q: string; a: string }): FaqItem[] {
  return [
    { q: postcodeFaq.q, a: postcodeFaq.a },
    {
      q: `How much does an EPC cost in ${name}?`,
      a: `Guide EPC prices in ${name} start from £${pricing[0].epc} for properties up to 37 m² and rise with internal floor area, up to £${pricing[5].epc} for homes over 121 m². Internal floor area (m²) is the main factor, alongside extensions, layout and condition, and your exact quote is confirmed before booking. Next-day lodgement is available for £${EXPRESS_SURCHARGE} extra.`,
    },
    {
      q: `How quickly can I get an EPC in ${name}?`,
      a: `Standard lodgement is within 72 hours of the assessment. For urgent requirements, our next-day service lodges your certificate within 24 hours for an additional £${EXPRESS_SURCHARGE}. We offer appointments 7 days a week, including evenings.`,
    },
    {
      q: `Do I need an EPC to let my property in ${name}?`,
      a: `Yes. Under MEES regulations, all rental properties in England and Wales must have a valid EPC rated E or above. Landlords in ${name} who let without a compliant EPC can face fines of up to £5,000 per property.`,
    },
    {
      q: `Do I need an EPC to sell my home in ${name}?`,
      a: `Yes. You're legally required to have an EPC commissioned before marketing your property for sale. Estate agents cannot legally list your ${name} property without one.`,
    },
    {
      q: `Do you also provide floor plans in ${name}?`,
      a: `Yes. We produce laser-measured floor plans for properties in ${name}, ideal for sales listings and lettings marketing. Floor plans have guide prices from £${priceFrom.floorPlan}, and save you up to £${maxBundleSaving} when booked together with an EPC in the same visit.`,
    },
  ]
}

const sellingPoints = [
  'Local assessor with rapid response times',
  'Appointments 7 days a week, including evenings',
  'Transparent guide pricing, with your exact quote confirmed before booking',
  `Lodged within 72 hours, or next day for £${EXPRESS_SURCHARGE} extra`,
]

export default async function BoroughPage({ params }: PageProps) {
  const { borough: slug } = await params
  const data = boroughMeta[slug]

  if (!data) notFound()

  const parentBorough = data.partOf ? boroughMeta[data.partOf] : undefined

  const neighbours = data.neighbours
    .map((s) => boroughMeta[s])
    .filter(Boolean)

  // Postcode districts this page serves, parsed from the Areas Covered copy.
  // Powers the structured geo signal in areaServed below.
  const postcodes = Array.from(
    new Set([...data.areasCovered.matchAll(/\(([A-Z]{1,2}\d{1,2}[A-Z]?)\)/g)].map((m) => m[1])),
  )

  const breadcrumbs = [
    { href: '/', label: 'Home' },
    { href: '/areas', label: 'Areas' },
    { href: `/areas/${slug}`, label: data.name },
  ]

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
      { '@type': 'ListItem', position: 2, name: 'Areas', item: `${site.url}/areas` },
      { '@type': 'ListItem', position: 3, name: data.name, item: `${site.url}/areas/${slug}` },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: boroughFaq(data.name, data.postcodeFaq).map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  /**
   * A borough page is NOT a branch. Emitting a LocalBusiness node per borough
   * asserted 34 separate businesses for a company with one base and a hidden
   * address, which is structured-data doorway signalling and the single
   * biggest schema liability on the site.
   *
   * Modelled instead as Service nodes that reference the one real business as
   * their provider, which is what is actually true: one business, many areas
   * served. Guide prices stay as minPrice, never a fixed price.
   */
  const boroughServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${site.url}/areas/${slug}#service`,
    name: `Domestic EPC and floor plans in ${data.name}`,
    serviceType: 'Energy Performance Certificate',
    description: `Elmhurst-accredited domestic EPC certificates and laser-measured floor plans in ${data.name}, London.`,
    url: `${site.url}/areas/${slug}`,
    provider: { '@id': `${site.url}/#business` },
    areaServed: [
      data.kind === 'neighbourhood' && parentBorough
        ? {
            '@type': 'Place',
            name: data.name,
            containedInPlace: { '@type': 'AdministrativeArea', name: parentBorough.name },
          }
        : { '@type': 'AdministrativeArea', name: data.name },
      ...postcodes.map((pc) => ({
        '@type': 'Place' as const,
        name: pc,
        address: { '@type': 'PostalAddress', postalCode: pc, addressCountry: 'GB' },
      })),
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `EPC and floor plan services in ${data.name}`,
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: `Domestic EPC in ${data.name}` },
          priceSpecification: {
            '@type': 'PriceSpecification',
            minPrice: pricing[0].epc,
            priceCurrency: 'GBP',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: `Property floor plans in ${data.name}` },
          priceSpecification: {
            '@type': 'PriceSpecification',
            minPrice: pricing[0].floorPlan,
            priceCurrency: 'GBP',
          },
        },
      ],
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, faqSchema, boroughServiceSchema]),
        }}
      />

      <BreadcrumbNav items={breadcrumbs} />

      <PageHero
        eyebrow={`EPC Certificates · ${data.name}`}
        heading={`EPC Certificates in ${data.name}`}
        subheading={`Local Elmhurst-accredited Domestic Energy Assessor covering ${data.name} and surrounding areas. Guide prices from £${priceFrom.epc}, with your exact quote confirmed before booking. Lodged within 72 hours.`}
        primaryCta={{ label: 'Get my exact quote', href: '#contact', ctaId: 'hero' }}
        secondaryCta={{ label: `Call ${site.phone}`, href: site.phoneHref }}
      />

      {/* Local intro */}
      <Section variant="default" id="local-intro">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-wide font-semibold text-primary-700">{data.name}, London</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            EPC Service in {data.name}
          </h2>
          <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
            Need an EPC in {data.name}? L&amp;D Energy provides fast, affordable domestic Energy Performance Certificates across {data.name} and all surrounding London areas. As an Elmhurst-accredited Domestic Energy Assessor based in East London, we offer flexible appointment times and rapid turnaround for homeowners, landlords, and{' '}
            <Link href="/estate-agents" className="text-primary-700 underline underline-offset-2 hover:text-primary-800">letting agents</Link>.
          </p>
          {data.kind === 'neighbourhood' && parentBorough && (
            <p className="mt-4 text-secondary-700 leading-relaxed">
              {data.name} is part of the London Borough of{' '}
              <Link href={`/areas/${parentBorough.slug}`} className="text-primary-700 underline underline-offset-2 hover:text-primary-800">{parentBorough.name}</Link>
              , and it is where we are based.
            </p>
          )}
          <p className="mt-4 text-secondary-700 leading-relaxed">{data.blurb}</p>

          <h3 className="mt-8 text-xl font-bold text-secondary-900">
            Property and housing stock in {data.name}
          </h3>
          <p className="mt-3 text-secondary-700 leading-relaxed">{data.housingStock}</p>

          <h3 className="mt-8 text-xl font-bold text-secondary-900">
            Typical EPC results in {data.name}
          </h3>
          <p className="mt-3 text-secondary-700 leading-relaxed">{data.epcIssues}</p>

          <h3 className="mt-8 text-xl font-bold text-secondary-900">
            Getting to your {data.name} property
          </h3>
          <p className="mt-3 text-secondary-700 leading-relaxed">{data.transport}</p>

          <p className="mt-8 text-secondary-700 leading-relaxed">
            Whether you&rsquo;re selling a property in {data.name}, preparing for a new tenancy, or staying compliant with MEES regulations as a landlord, your{' '}
            <Link href="/services/domestic-epc" className="text-primary-700 underline underline-offset-2 hover:text-primary-800">domestic EPC</Link>{' '}
            is lodged on the GOV.UK register within 72 hours, or next day if you need it urgently. Guide prices start at{' '}
            {`£${priceFrom.epc}`} and are based mainly on internal floor area — see the{' '}
            <Link href="/pricing" className="text-primary-700 underline underline-offset-2 hover:text-primary-800">full pricing table</Link>{' '}
            or send us the address for an exact quote.
          </p>
        </div>
      </Section>

      {/* Why choose us locally */}
      <Section variant="muted" id="why-us">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-wide font-semibold text-primary-700">Why Choose Us</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            Why Choose Us for Your {data.name} EPC
          </h2>
        </div>
        <ul className="mt-8 space-y-3 max-w-2xl">
          {sellingPoints.map((point) => (
            <li key={point} className="flex items-start gap-3 text-secondary-700">
              <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </Section>

      <LocalPricingSummary area={data.name} />

      {/* Floor plans cross-sell */}
      <Section variant="default" id="floor-plans">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-wide font-semibold text-primary-700">Floor Plans</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            Floor Plans in {data.name}
          </h2>
          <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
            Selling or letting in {data.name}? We also produce professional, accurately measured floor plans, the same high-resolution plans estate agents use in sales and lettings listings. Floor plans have guide prices from {`£${priceFrom.floorPlan}`}, and <strong className="font-semibold text-secondary-900">save you up to {`£${formatPrice(maxBundleSaving)}`} when booked with an EPC</strong> in the same visit, since we measure your property anyway during the assessment.
          </p>
          <Link
            href="/services/floor-plans"
            className="mt-6 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-primary-700 transition-colors hover:text-primary-800"
          >
            Learn more about our floor plans
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Section>

      {/* Nearby areas */}
      <Section variant="default" id="nearby-areas">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-wide font-semibold text-primary-700">Also Nearby</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            Areas We Cover in {data.name}
          </h2>
          <p className="mt-5 text-secondary-700 leading-relaxed">{data.areasCovered}</p>
          <p className="mt-4 text-secondary-700 leading-relaxed">
            We cover {data.name} and the surrounding {data.kind === 'neighbourhood' ? 'area' : 'boroughs'} with the same transparent guide pricing and turnaround.
          </p>
        </div>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {neighbours.map((n) => (
            <li key={n.slug}>
              <Link
                href={`/areas/${n.slug}`}
                className="group flex items-center gap-2 rounded-lg border border-secondary-200 bg-white px-4 py-3 text-sm font-medium text-secondary-800 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
              >
                <MapPin className="w-3.5 h-3.5 text-secondary-400 group-hover:text-primary-500" aria-hidden="true" />
                EPC in {n.name}
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* Local FAQ */}
      <Section variant="muted" id="faq">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-wide font-semibold text-primary-700">Common Questions</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            EPC Questions for {data.name}
          </h2>
          <div className="mt-8">
            <Accordion items={boroughFaq(data.name, data.postcodeFaq)} />
          </div>
        </div>
      </Section>

      <ContactSection areaPage={data.slug} sourcePage="area" />

      <CtaStrip
        heading={`Get an EPC quote in ${data.name}`}
        body={`Fast, transparent-priced EPC certificates in ${data.name}. Appointments 7 days a week.`}
        primaryCta={{ label: 'Get my exact quote', href: '#contact', ctaId: 'bottom' }}
      />
    </>
  )
}
