import { ContactSection } from '@/components/sections/ContactSection'
import { ReadNext, type NextStep } from '@/components/inner/ReadNext'
import { InnerEnding } from '@/components/inner/InnerEnding'
import { boroughMeta } from '@/lib/boroughs'
import { areaLocal } from '@/lib/area-local'
import { getPostBySlug } from '@/lib/blog'
import type { AreaSummary } from '@/lib/borough-stats-types'
import type { FaqItem } from '@/lib/faq'
import { site, pricing, priceFrom, SAME_DAY_LODGEMENT_SURCHARGE, NEXT_DAY_VISIT_SURCHARGE } from '@/lib/site'
import { london, pct, salesLed, statsSource, summaryFor } from '@/lib/area-page'
import { DATA_PAGE_PATH } from '@/lib/borough-ratings'
import {
  AreaFaq, AreaHeroD, CouncilRulesSection, CoverageSection, JobNote, LettingSection, RatingMixSection, StockSection,
} from './AreaBlocks'

/**
 * Approved job notes, by area slug (Abdul 22/10/2026). A note is a real job matched to its lodged certificate
 * (month, home type, size, postcode district, rating, what drove it), never a name, street or number.
 */
const approvedJobNotes: Record<string, { heading: string; paragraphs: string[] }> = {
  stratford: {
    heading: 'A recent job in Stratford',
    paragraphs: [
      'June 2026, Stratford E15. A three-bedroom mid-terrace house of 87 m², rated C (71). The certificate records the cavity walls as built, with no insulation, which is what the method uses when there is no evidence that the cavity was filled later. The loft was recorded as insulated, the windows as double glazed, and the heating as a gas boiler with a programmer, room thermostat and radiator valves.',
      'The first recommendation was cavity wall insulation. With every recommendation carried out, the potential rating was C (78).',
    ],
  },
  newham: {
    heading: 'A recent job in Newham',
    paragraphs: [
      'July 2026, E16. A top-floor maisonette of 68 m², booked with a floor plan, rated D (67). The walls, roof and glazing were all recorded as insulated or double glazed. Heating and hot water come from a community scheme with flat-rate charging and radiator valves.',
      'The only recommendation was hot water cylinder insulation, and with it carried out the potential rating was D (68).',
    ],
  },
  croydon: {
    heading: 'A recent job in Croydon',
    paragraphs: [
      'August 2026, Croydon CR0. A three-bedroom mid-terrace house of 90 m², rated D (67). The main walls are solid brick with no added insulation and an extension is timber-framed. The loft had 100 mm of insulation; a flat roof section had none recorded. Heating is a gas boiler with a programmer and radiator valves but no room thermostat.',
      'The recommendations started with internal wall insulation, then floor insulation and a room thermostat. With all of them carried out, including solar panels, the potential rating was C (78).',
    ],
  },
  // Abdul 29/10/2026: further notes from Ledger and his lodged certificates, shipped on judgement.
  'waltham-forest': {
    heading: 'A recent job in Waltham Forest',
    paragraphs: [
      'July 2026, Leyton E10. A four-bedroom semi-detached house of 121 m² with a room in the roof, booked with a floor plan, rated D (56). The main walls are solid brick with no added insulation. The loft had 225 mm of insulation, but a flat roof section and the room in the roof had none recorded. Heating is a gas boiler with a programmer and room thermostat.',
      'The recommendations started with flat roof insulation, then internal wall insulation, floor insulation and radiator valves. With all of them carried out, including solar panels, the potential rating was C (74).',
    ],
  },
  southwark: {
    heading: 'A recent job in Southwark',
    paragraphs: [
      'July 2026, Surrey Docks SE16. A top-floor flat of 50 m², rated D (64). The cavity walls and roof were recorded as insulated and the windows are fully double glazed. Heating is electric room heaters, with hot water from an off-peak electric immersion.',
      'The only recommendation was high heat retention storage heaters with a dual immersion cylinder and a dual rate meter. With that carried out, the potential rating was C (76).',
    ],
  },
}

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

/**
 * Read next (option A cards, C's quote card last): the guide this area's certificates point to, why ratings differ,
 * the borough comparison, then the ready-to-book card. Guide titles and descriptions come from the posts.
 */
async function readNextSteps(name: string, s: AreaSummary): Promise<NextStep[]> {
  const guide = async (slug: string, kicker: string, img: string, text: string): Promise<NextStep | null> => {
    const p = await getPostBySlug(slug)
    return p ? { kicker, title: p.title, text, href: `/blog/${slug}`, img, meta: `${p.readingTime} min read` } : null
  }
  const first = s.pctLettings >= s.pctSales
    ? await guide('epc-for-landlords-2026', 'Letting and MEES', '/inner/rn-landlord.svg', 'The rules for letting today.')
    : await guide('epc-for-selling-house', 'Selling and buying', '/inner/rn-seller.svg', 'What buyers and agents look at.')
  const second = await guide('why-is-my-epc-different', 'Understand your EPC', '/inner/rn-two-houses.svg', 'Why similar homes score differently.')
  const steps: (NextStep | null)[] = [
    first,
    second,
    { kicker: 'Borough figures', title: 'EPC ratings in every London borough', href: DATA_PAGE_PATH, img: '/inner/rn-boroughs.svg',
      text: `${name}: ${pct(s.ratings.pct.AtoC)} rated A to C. London: ${pct(london.ratings.pct.AtoC)}.` },
    { title: 'Ready to book?', href: '#contact', go: true,
      text: 'Tell us the address and size. We confirm your exact price before you book.' },
  ]
  return steps.filter((x): x is NextStep => x !== null)
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
  const steps = await readNextSteps(name, s)
  const job = approvedJobNotes[slug]
  const url = `${site.url}/areas/${slug}`
  const salesFirst = salesLed(slug)
  // the two sections alternate band and plain, so whichever comes first after "How do homes rate" is the banded one
  const lettingSection = <LettingSection name={name} s={s} council={lettingCouncil} band={!salesFirst} />
  const stockSection = <StockSection name={name} s={s} local={local?.stock ?? [meta.housingStock, meta.epcIssues]} reading={local?.stockReading(s, london) ?? ''} band={salesFirst} />

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

  const lettingNav = { id: 'letting', heading: 'letting-h', label: `If you let in ${name}` }
  const homesNav = { id: 'homes', heading: 'homes-h', label: `Why homes in ${name} rate as they do` }
  // labels are the sections' H2 text, so the list and the bar name what the reader sees; `heading` is the H2's id
  const sections = [
    { id: 'ratings', heading: 'ratings-h', label: `How do homes in ${name} rate?` },
    ...(salesFirst ? [homesNav, lettingNav] : [lettingNav, homesNav]),
    { id: 'coverage', heading: 'coverage-h', label: `Areas and postcodes we cover in ${name}` },
    ...(otherCouncil.length ? [{ id: 'council', heading: 'council-h', label: `Council rules that affect improvement work in ${name}` }] : []),
    { id: 'faq', heading: 'faq-h', label: `EPC questions for ${name}` },
    { id: 'contact', heading: 'contact-title', label: 'Get my exact quote' },
  ]

  return (
    <div className="in">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <AreaHeroD slug={slug} name={name} s={s} parent={parent ? { slug: parent.slug, name: parent.name } : undefined} sections={sections} />

      <RatingMixSection slug={slug} name={name} s={s} standout={local?.standout(s, london) ?? ''} />
      {salesFirst ? (
        <>
          {stockSection}
          {lettingSection}
        </>
      ) : (
        <>
          {lettingSection}
          {stockSection}
        </>
      )}
      <CoverageSection name={name} slug={slug} s={s} local={local} />
      {job && <JobNote heading={job.heading} paragraphs={job.paragraphs} />}
      <CouncilRulesSection name={name} council={otherCouncil} />
      <AreaFaq name={name} faqs={faqs} />

      <ContactSection areaPage={slug} sourcePage="area" />

      <ReadNext steps={steps} />
      <InnerEnding variant="a" quote="#contact" source="area"
        eyebrow={`${name} · from £${priceFrom.epc}`}
        heading={`Book your ${name} EPC`} />
    </div>
  )
}
