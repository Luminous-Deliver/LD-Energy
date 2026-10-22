import { quoteHref } from '@/lib/quote-context'
import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { BoroughFinder, type FinderRegion } from '@/components/sections/BoroughFinder'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { PageHero } from '@/components/sections/PageHero'
import { CtaStrip } from '@/components/sections/CtaStrip'
import { boroughList, boroughMeta } from '@/lib/boroughs'
import { boroughStats } from '@/lib/borough-stats'
import { fmt, pct, statsSource, ukDate } from '@/lib/area-page'
import { DATA_PAGE_PATH, extremes, londonBoroughs, placesFor, ratingsFinding } from '@/lib/borough-ratings'
import { regions } from '@/lib/london-regions'
import { site, priceFrom, defaultOgImage, SAME_DAY_LODGEMENT_SURCHARGE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Areas We Cover | EPC Assessor Across London',
  description:
    `Domestic EPC certificates across all 32 London boroughs. Elmhurst and Quidos accredited, guide prices from £${priceFrom.epc}, lodged within 72 hours. Find your borough.`,
  alternates: { canonical: `${site.url}/areas` },
  openGraph: {
    images: [defaultOgImage],
    title: 'EPC London, All Areas Covered | L&D Energy',
    description:
      `Domestic EPC certificates across all London boroughs and surrounding areas. Elmhurst and Quidos accredited, guide prices from £${priceFrom.epc}, lodged within 72 hours.`,
    url: `${site.url}/areas`,
  },
  twitter: {
    images: [defaultOgImage.url],
    title: 'EPC London, All Areas Covered',
    description:
      `Domestic EPC certificates across all London boroughs. Elmhurst and Quidos accredited, guide prices from £${priceFrom.epc}.`,
  },
}

const breadcrumbs = [
  { href: '/', label: 'Home' },
  { href: '/areas', label: 'Areas' },
]

/** Neighbourhood pages listed under their borough's row rather than as rows of their own. */
const children = boroughList.filter((b) => b.kind === 'neighbourhood' && b.partOf)

const finderRegions: FinderRegion[] = regions.map((r) => ({
  id: r.id,
  name: r.name,
  rows: r.boroughs
    .map((slug) => {
      const s = boroughStats.boroughs[slug]
      const child = children.find((c) => c.partOf === slug)
      return {
        slug,
        name: boroughMeta[slug].name,
        places: placesFor(slug),
        districts: s.districts.map((d) => d.district).sort((a, b) => a.localeCompare(b, 'en', { numeric: true })),
        atoC: pct(s.ratings.pct.AtoC),
        child: child && { slug: child.slug, name: child.name, districts: boroughStats.stratford.definedBy },
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name)),
}))

export default function AreasPage() {
  const { top, bottom } = ratingsFinding()
  const size = extremes((b) => b.floorArea.median ?? 0, londonBoroughs)
  const lets = extremes((b) => b.pctLettings, londonBoroughs)

  const checklist = [
    <>One price list for every borough, set by floor area: EPCs from £{priceFrom.epc}. <Link href="/pricing" className="text-primary-700 underline underline-offset-2">See all prices</Link>.</>,
    <>No travel or call-out charge, wherever you are in London.</>,
    <>Lodged on the GOV.UK register within 72 hours of the visit, or the same day for £{SAME_DAY_LODGEMENT_SURCHARGE} extra.</>,
    <>Every visit is by {site.assessor.name}, accredited with {site.assessor.accreditations.map((a) => a.short).join(' and ')}.</>,
  ]

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
        { '@type': 'ListItem', position: 2, name: 'Areas', item: `${site.url}/areas` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'London areas covered by L&D Energy',
      numberOfItems: boroughList.length,
      itemListElement: finderRegions
        .flatMap((r) => r.rows.flatMap((row) => [row.slug, ...(row.child ? [row.child.slug] : [])]))
        .map((slug, i) => ({ '@type': 'ListItem', position: i + 1, name: `EPC in ${boroughMeta[slug].name}`, url: `${site.url}/areas/${slug}` })),
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <BreadcrumbNav items={breadcrumbs} />

      <PageHero
        eyebrow="Coverage"
        heading="EPC Certificates Across London"
        subheading="All 32 London boroughs and the City of London, one set of prices and no travel charge. We are based in Stratford E15, and your exact quote is confirmed before booking."
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ service: 'epc', sourcePage: 'areas', ctaId: 'hero' }) }}
      />

      <Section variant="default" id="all-areas" aria-labelledby="find-h">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-wide font-semibold text-primary-700">Find your area</p>
          <h2 id="find-h" className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            Every London borough, by region
          </h2>
          <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
            Search by borough, town or postcode district. Each borough page has its own ratings, postcode figures and local rules.
            A place that isn&rsquo;t listed is still covered by its borough.
          </p>
        </div>

        <BoroughFinder regions={finderRegions} />

        <p className="mt-6 max-w-3xl text-xs leading-relaxed text-secondary-600">
          Regions follow the London Plan sub-regions; town centres are the Plan&rsquo;s major centres. Postcode districts with at
          least {boroughStats.thresholds.districtMin} certificates are listed. &ldquo;Rated A to C&rdquo; is the share of EPCs for existing
          homes lodged {ukDate(statsSource.from)} to {ukDate(statsSource.to)}, from the GOV.UK register.
        </p>
      </Section>

      <Section variant="muted" id="same-price" aria-labelledby="same-h">
        <div className="max-w-3xl">
          <h2 id="same-h" className="text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">The same everywhere</h2>
          <ul className="mt-6 space-y-3">
            {checklist.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-secondary-700 leading-relaxed">
                <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section variant="default" id="differences" aria-labelledby="diff-h">
        <div className="max-w-3xl">
          <h2 id="diff-h" className="text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">What differs between boroughs</h2>
          <ul className="mt-6 space-y-3 text-secondary-700 leading-relaxed list-disc pl-5">
            <li><strong className="text-secondary-900">Ratings.</strong> {pct(top.ratings.pct.AtoC)} of EPCs in {top.name} are rated A to C, against {pct(bottom.ratings.pct.AtoC)} in {bottom.name}.</li>
            <li><strong className="text-secondary-900">Home sizes.</strong> The typical home on a certificate is {size.high.floorArea.median} m² in {size.high.name} and {size.low.floorArea.median} m² in {size.low.name}, and size sets the price.</li>
            <li><strong className="text-secondary-900">Renting.</strong> Private lettings are {pct(lets.high.pctLettings)} of certificates in {lets.high.name} and {pct(lets.low.pctLettings)} in {lets.low.name}.</li>
          </ul>
          <p className="mt-6">
            <Link href={DATA_PAGE_PATH} className="inline-flex min-h-[44px] items-center gap-1.5 font-semibold text-primary-700 hover:text-primary-800">
              EPC ratings in every London borough <span aria-hidden="true">→</span>
            </Link>
          </p>
          <p className="text-sm text-secondary-600">From {fmt(boroughStats.london.certificates)} certificates on the GOV.UK register (file of {ukDate(statsSource.fileUpdated)}).</p>
        </div>
      </Section>

      <Section variant="muted" id="coverage-info" aria-labelledby="outside-h">
        <div className="max-w-3xl">
          <h2 id="outside-h" className="text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            Outside London
          </h2>
          <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
            We&apos;re based in Stratford (E15), in the London Borough of Newham, and cover all 32 London boroughs plus the City of London. We also serve surrounding areas within a 1.5-hour radius, including parts of Essex, Kent, Hertfordshire and Surrey.
          </p>
          <p className="mt-4 text-secondary-700 leading-relaxed">
            There are no travel or call-out charges.
          </p>
          <p className="mt-8 text-sm text-secondary-600">
            By <Link href="/about" className="font-semibold text-secondary-800 underline-offset-2 hover:underline">{site.assessor.name}</Link>,
            {' '}Domestic Energy Assessor ({site.assessor.accreditations.map((a) => `${a.short} ${a.number}`).join(', ')}). Figures updated {ukDate(statsSource.generated)}.
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
