import Link from 'next/link'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { Section } from '@/components/ui/Section'
import { Accordion } from '@/components/ui/Accordion'
import { ContactSection } from '@/components/sections/ContactSection'
import { boroughMeta } from '@/lib/boroughs'
import { areaLocal } from '@/lib/area-local'
import { getPostBySlug } from '@/lib/blog'
import type { AreaSummary } from '@/lib/borough-stats-types'
import type { FaqItem } from '@/lib/faq'
import { site, pricing, priceFrom, SAME_DAY_LODGEMENT_SURCHARGE, NEXT_DAY_VISIT_SURCHARGE } from '@/lib/site'
import { london, statsSource, summaryFor } from '@/lib/area-page'
import {
  AboutFigures, AreaCtaBand, AreaHeroV2, CouncilRulesSection, CoverageSection, LettingSection, PriceLine,
  RatingMixSection, StockSection,
} from './AreaBlocks'

/**
 * Approved job notes, by area slug. Empty until Abdul approves a draft: a note is a real job
 * (month, home type, size, neighbourhood, rating, what drove it), never a name, street or number.
 */
const approvedJobNotes: Record<string, { heading: string; paragraphs: string[] }> = {}

/** Two short questions every area page answers the same way; the local ones come first. */
function sharedFaqs(name: string): FaqItem[] {
  return [
    {
      q: `How quickly can I get an EPC in ${name}?`,
      a: `Standard lodgement is within 72 hours of the visit. Same-day lodgement puts the certificate on the register on the day of the visit for £${SAME_DAY_LODGEMENT_SURCHARGE} extra, and a next-day visit with lodgement that day is £${NEXT_DAY_VISIT_SURCHARGE} extra.`,
    },
    {
      q: `Do you also draw floor plans in ${name}?`,
      a: `Yes. Floor plans are laser-measured, from £${priceFrom.floorPlan}, and cost less when booked with the EPC on the same visit.`,
      links: [{ label: 'Floor plans', href: '/services/floor-plans' }],
    },
  ]
}

/** Guides picked by what the area's certificates say about it. */
function readNextSlugs(s: AreaSummary): string[] {
  const picks: string[] = []
  if (s.pctLettings >= 40) picks.push('epc-for-landlords-2026', 'epc-c-by-2030')
  if (s.pctSales >= 40) picks.push('epc-for-selling-house', 'epc-vs-floor-plan-vs-survey')
  if (s.pctFlats < 55) picks.push('how-to-improve-epc-rating')
  picks.push('why-is-my-epc-different', 'epc-ratings-explained')
  return [...new Set(picks)].slice(0, 4)
}

export async function AreaPageV2({ slug }: { slug: string }) {
  const meta = boroughMeta[slug]
  const s = summaryFor(slug)
  if (!s) return null
  const local = areaLocal[slug]
  const name = meta.name
  const parent = meta.partOf ? boroughMeta[meta.partOf] : undefined
  const lettingCouncil = local?.council.filter((c) => /licensing|floor-plan/.test(c.id)) ?? []
  const otherCouncil = local?.council.filter((c) => !/licensing|floor-plan/.test(c.id)) ?? []
  const faqs = local ? local.faqs(s) : [meta.postcodeFaq, ...sharedFaqs(name)]
  const guides = (await Promise.all(readNextSlugs(s).map((g) => getPostBySlug(g)))).filter(Boolean)
  const job = approvedJobNotes[slug]
  const url = `${site.url}/areas/${slug}`

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
        { '@type': 'ListItem', position: 2, name: 'Areas', item: `${site.url}/areas` },
        { '@type': 'ListItem', position: 3, name, item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: `EPC Certificates in ${name}`,
      author: { '@id': `${site.url}/about#assessor` },
      dateModified: statsSource.generated,
      about: { '@id': `${url}#service` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${url}#service`,
      name: `Domestic EPC and floor plans in ${name}`,
      serviceType: 'Energy Performance Certificate',
      url,
      provider: { '@id': `${site.url}/#business` },
      areaServed: [
        meta.kind === 'neighbourhood' && parent
          ? { '@type': 'Place', name, containedInPlace: { '@type': 'AdministrativeArea', name: parent.name } }
          : { '@type': 'AdministrativeArea', name },
        ...s.districts.map((d) => ({
          '@type': 'Place',
          name: d.district,
          address: { '@type': 'PostalAddress', postalCode: d.district, addressCountry: 'GB' },
        })),
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: `EPC and floor plan services in ${name}`,
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: `Domestic EPC in ${name}` }, priceSpecification: { '@type': 'PriceSpecification', minPrice: pricing[0].epc, priceCurrency: 'GBP' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: `Property floor plans in ${name}` }, priceSpecification: { '@type': 'PriceSpecification', minPrice: pricing[0].floorPlan, priceCurrency: 'GBP' } },
        ],
      },
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <BreadcrumbNav items={[{ href: '/', label: 'Home' }, { href: '/areas', label: 'Areas' }, { href: `/areas/${slug}`, label: name }]} />

      <AreaHeroV2 name={name} s={s} />

      {parent && (
        <Section variant="default" tier="compact">
          <p className="max-w-3xl text-secondary-700 leading-relaxed">
            {name} is part of the London Borough of{' '}
            <Link href={`/areas/${parent.slug}`} className="text-primary-700 underline underline-offset-2">{parent.name}</Link>, and it is where we are based.
          </p>
        </Section>
      )}

      <RatingMixSection name={name} s={s} standout={local?.standout(s, london) ?? ''} />
      <LettingSection name={name} s={s} council={lettingCouncil} />
      <StockSection name={name} s={s} local={local?.stock ?? [meta.housingStock, meta.epcIssues]} reading={local?.stockReading(s, london) ?? ''} />
      <CoverageSection name={name} slug={slug} s={s} local={local} />

      {job && (
        <Section variant="muted" id="recent-job" aria-labelledby="job-h">
          <div className="max-w-3xl">
            <h2 id="job-h" className="text-2xl md:text-3xl font-bold tracking-tight text-secondary-900">{job.heading}</h2>
            {job.paragraphs.map((p) => <p key={p.slice(0, 40)} className="mt-4 text-secondary-700 leading-relaxed">{p}</p>)}
          </div>
        </Section>
      )}

      <CouncilRulesSection name={name} council={otherCouncil} />
      <PriceLine name={name} s={s} />

      <Section variant="muted" id="faq" aria-labelledby="faq-h">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-wide font-semibold text-primary-700">Questions</p>
          <h2 id="faq-h" className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">EPC questions for {name}</h2>
          <div className="mt-8"><Accordion items={faqs} /></div>
        </div>
      </Section>

      <ContactSection areaPage={slug} sourcePage="area" />

      <Section variant="default" id="read-next" aria-labelledby="next-h">
        <div className="max-w-3xl">
          <h2 id="next-h" className="text-2xl md:text-3xl font-bold tracking-tight text-secondary-900">Read next</h2>
          <ul className="mt-6 space-y-3">
            {guides.map((g) => g && (
              <li key={g.slug}>
                <Link href={`/blog/${g.slug}`} className="font-semibold text-primary-700 underline-offset-2 hover:underline">{g.title}</Link>
              </li>
            ))}
            <li>
              <Link href="/areas" className="font-semibold text-primary-700 underline-offset-2 hover:underline">Every London area we cover</Link>
            </li>
          </ul>
        </div>
      </Section>

      <AboutFigures />
      <AreaCtaBand name={name} />
    </>
  )
}
