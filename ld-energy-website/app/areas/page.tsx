import { quoteHref } from '@/lib/quote-context'
import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { BoroughFinder } from '@/components/sections/BoroughFinder'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { PageHero } from '@/components/sections/PageHero'
import { CtaStrip } from '@/components/sections/CtaStrip'
import { boroughList } from '@/lib/boroughs'
import { site, priceFrom } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Areas We Cover | EPC Assessor Across London',
  description:
    `Domestic EPC certificates across all 32 London boroughs. Elmhurst accredited, guide prices from £${priceFrom.epc}, lodged within 72 hours. Find your borough.`,
  alternates: { canonical: `${site.url}/areas` },
  openGraph: {
    title: 'EPC London, All Areas Covered | L&D Energy',
    description:
      `Domestic EPC certificates across all London boroughs and surrounding areas. Elmhurst accredited, guide prices from £${priceFrom.epc}, lodged within 72 hours.`,
    url: `${site.url}/areas`,
  },
  twitter: {
    title: 'EPC London, All Areas Covered',
    description:
      `Domestic EPC certificates across all London boroughs. Elmhurst accredited, guide prices from £${priceFrom.epc}.`,
  },
}

const breadcrumbs = [
  { href: '/', label: 'Home' },
  { href: '/areas', label: 'Areas' },
]

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
    { '@type': 'ListItem', position: 2, name: 'Areas', item: `${site.url}/areas` },
  ],
}

export default function AreasPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <BreadcrumbNav items={breadcrumbs} />

      <PageHero
        eyebrow="Coverage"
        heading="EPC Certificates Across London"
        subheading="Based in Stratford in the London Borough of Newham, we cover all 32 London boroughs and the City of London. The same guide pricing everywhere, 7-day availability, and your exact quote confirmed before booking."
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ service: 'epc', sourcePage: 'areas', ctaId: 'hero' }) }}
      />

      <Section variant="default" id="all-areas">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
            <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
            All Coverage Areas
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            All London Boroughs
          </h2>
          <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
            Select your borough to see local pricing, availability, and nearby areas we cover.
          </p>
        </div>

        <BoroughFinder boroughs={boroughList.map(({ slug, name }) => ({ slug, name }))} />
      </Section>

      <Section variant="muted" id="coverage-info">
        <div className="max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            Our Coverage Area
          </h2>
          <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
            We&apos;re based in Stratford (E15), in the London Borough of Newham, and cover all 32 London boroughs plus the City of London. We also serve surrounding areas within a 1.5-hour radius, including parts of Essex, Kent, Hertfordshire and Surrey.
          </p>
          <p className="mt-4 text-secondary-700 leading-relaxed">
            There is no call-out or mileage charge for any property within our normal service area. For properties outside it, travel time is included in the quote you receive before booking, so it is never added afterwards.
          </p>
        </div>
      </Section>

      <CtaStrip
        heading="Can't Find Your Area?"
        body="Send your postcode and we'll confirm coverage."
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ service: 'epc', sourcePage: 'areas', ctaId: 'bottom' }) }}
      />
    </>
  )
}
