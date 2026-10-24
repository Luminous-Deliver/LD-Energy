import { quoteHref } from '@/lib/quote-context'
import type { Metadata } from 'next'
import { OurPromise } from '@/components/sections/OurPromise'
import { CheckCircle2, XCircle, Sparkles, Ruler, Info } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { PageHero } from '@/components/sections/PageHero'
import { CtaStrip } from '@/components/sections/CtaStrip'
import { Accordion } from '@/components/ui/Accordion'
import { GuidePriceNote } from '@/components/ui/GuidePriceNote'
import { pricing,
  site,
  formatPrice,
  bundleSaving,
  maxBundleSaving,
  priceFrom,
  standardBands,
  topBand,
  SAME_DAY_LODGEMENT_SURCHARGE, NEXT_DAY_VISIT_SURCHARGE, defaultOgImage } from '@/lib/site'
import type { FaqItem } from '@/lib/faq'

export const metadata: Metadata = {
  title: `EPC Prices London | From £${priceFrom.epc}`,
  description: `Guide prices for EPC and floor plan services in London, from £${priceFrom.epc}. Priced mainly on internal floor area (m²). Your exact quote is confirmed before booking.`,
  alternates: { canonical: `${site.url}/pricing` },
  openGraph: {
    images: [defaultOgImage],
    title: `EPC Prices London | From £${priceFrom.epc} | Transparent Guide Pricing | L&D Energy`,
    description: `Guide prices for EPC and floor plan services in London, from £${priceFrom.epc}. Priced mainly on internal floor area (m²). Exact quote confirmed before booking.`,
    url: `${site.url}/pricing`,
  },
  twitter: {
    images: [defaultOgImage.url],
    title: `EPC Prices London | From £${priceFrom.epc} | Transparent Guide Pricing`,
    description: `Guide prices from £${priceFrom.epc}, based mainly on internal floor area (m²). Exact quote confirmed before booking.`,
  },
}

const breadcrumbs = [
  { href: '/', label: 'Home' },
  { href: '/pricing', label: 'Pricing' },
]

const included = [
  'On-site assessment by an Elmhurst and Quidos accredited DEA',
  'Official lodgement on the UK Government EPC Register',
  'Certificate link sent once lodged on the government register',
  'Standard software-generated EPC recommendation report, where applicable',
  'No travel or call-out charges',
]

const notIncluded = [
  `Optional personalised EPC Improvement Plan and full Elmhurst Energy Report — £${site.addOns.improvementPlan} extra`,
  'Re-visits due to access issues, charged at £25 per visit',
]

/**
 * Modifiers to a quote, not price bands — hence a separate, smaller table.
 * Only the speed extras are fixed figures, and they come from the canonical
 * source so it can never drift from the estimator or the booking form.
 */
const additionalCharges: Array<{ label: string; guide: string }> = [
  { label: 'Same-day lodgement (lodged on the day of the visit)', guide: `+£${SAME_DAY_LODGEMENT_SURCHARGE}` },
  { label: 'Next-day visit and lodgement', guide: `+£${NEXT_DAY_VISIT_SURCHARGE}` },
  { label: 'EPC Improvement Plan', guide: `+£${site.addOns.improvementPlan}` },
  { label: 'EPC Pre-Assessment (not lodged), improvement plan included', guide: `From £${priceFrom.preAssessment}` },
  { label: 'Lodging a held Pre-Assessment later', guide: `+£${site.addOns.lodgeLater}` },
  { label: 'Extensions, loft conversions or unusual layouts', guide: 'Exact quote' },
  { label: 'Multiple floors or additional measurement complexity', guide: 'Exact quote' },
  { label: 'Large or unusually complex properties', guide: 'Exact quote' },
]

const pricingFaq: FaqItem[] = [
  {
    q: 'How much does an EPC cost in London?',
    a: `Guide prices start at £${pricing[0].epc} for properties ${pricing[0].areaLabel.toLowerCase()} and rise with internal floor area. Homes ${topBand.areaLabel.toLowerCase()} start from £${topBand.epc}. These are guide prices, not fixed quotes — the final price depends on the internal floor area (m²), any extensions or loft conversions, layout and condition. Your exact quote is confirmed before you book.`,
  },
  {
    q: 'Are there any hidden fees?',
    a: 'No. The price we confirm before booking is the price you pay. Quotes are worked out from your property size and condition, so there are no surprise add-ons or call-out charges. Anything that could change the figure, like extensions or an unusual layout, is priced into the quote up front. There are no travel or call-out charges.',
  },
  {
    q: 'Does my EPC include improvement recommendations?',
    a: `Yes. Your standard EPC includes its software-generated recommendation report at no extra charge, unless there is no reasonable potential for improvements. The optional £${site.addOns.improvementPlan} EPC Improvement Plan adds Abdul's personalised interpretation and priorities, supported by the full Elmhurst Energy Report. It explains what is holding the rating back and which improvements to consider first. It does not guarantee a rating or savings.`,
  },
  {
    q: 'How much is an EPC Pre-Assessment?',
    a: `From £${priceFrom.preAssessment}, on the same floor-area bands as the EPC. It is the same visit, the same measuring and the same evidence gathering; only the lodgement is skipped, and your personalised written improvement plan is included in the price. A separate energy report is available at no extra charge if you ask for it. If you later decide you want the certificate after all, we can usually lodge the same survey for £${site.addOns.lodgeLater} with no second visit, provided nothing at the property has changed and the survey remains valid for lodgement under applicable rules. It is not a substitute for an EPC where one is legally required.`,
  },
  {
    q: 'Do you charge for travel?',
    a: 'No. There are no travel or call-out charges.',
  },
  {
    q: 'Can I get a discount for multiple properties?',
    a: 'Yes. We offer portfolio rates for landlords and letting agents with multiple properties. Send us the postcodes and we will quote the whole set together.',
  },
  {
    q: 'What are the faster options?',
    a: `Same-day lodgement (£${SAME_DAY_LODGEMENT_SURCHARGE} extra per EPC) puts your certificate on the register on the day of the visit rather than within the standard 72 hours. A next-day visit and lodgement (£${NEXT_DAY_VISIT_SURCHARGE} extra per EPC) means we visit the next day and lodge the certificate that day. Both apply to visits in our standard hours (Mon–Sun, 8am–8pm), and availability is confirmed before booking.`,
  },
  {
    q: 'How much does a floor plan cost?',
    a: `Floor plans have guide prices from £${priceFrom.floorPlan}, priced on the same internal floor-area bands as the EPC. Booking an EPC and floor plan together costs less than booking them separately — up to £${formatPrice(maxBundleSaving)} less — because we measure the property during the assessment anyway, so it is one visit rather than two. Your exact quote is confirmed before booking.`,
  },
  {
    q: `What if my property is larger than ${standardBands[standardBands.length - 1].areaMax} m²?`,
    a: `Guide prices for homes ${topBand.areaLabel.toLowerCase()} start from £${topBand.epc} for the EPC, £${topBand.floorPlan} for a floor plan and £${topBand.bundle} for both together. Large properties vary a great deal in layout and complexity, so this band is a starting point rather than a typical figure — send us the address and we will confirm the exact quote before you book.`,
  },
]

// Typical internal floor-area ranges by property size (guide only) — reinforces
// that floor area is the biggest driver of the final price.
const offerCatalog = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'EPC and Floor Plan Pricing',
  itemListElement: pricing.map((row, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'Offer',
      name: `Domestic EPC, ${row.areaLabel}`,
      // minPrice, not price: every figure on this page is a starting guide, and
      // marking it as a fixed price would misrepresent visible page content.
      priceSpecification: {
        '@type': 'PriceSpecification',
        minPrice: row.epc,
        priceCurrency: 'GBP',
      },
      availability: 'https://schema.org/InStock',
      url: `${site.url}/quote`,
      seller: { '@id': `${site.url}/#business` },
    },
  })),
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
    { '@type': 'ListItem', position: 2, name: 'Pricing', item: `${site.url}/pricing` },
  ],
}

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([offerCatalog, breadcrumbSchema]) }}
      />

      <BreadcrumbNav items={breadcrumbs} />

      <PageHero
        eyebrow="Pricing"
        heading="EPC and Floor Plan Pricing"
        subheading="Every figure here is a starting guide, not a fixed quote. Your final cost depends mainly on internal floor area (m²), plus any extensions, loft conversions, layout and condition. We confirm the exact price before you book — never after."
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ sourcePage: 'pricing', ctaId: 'hero' }) }}
      />

      {/* Full pricing table */}
      <Section variant="default" id="pricing-table">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-wide font-semibold text-primary-700">The Numbers</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            Guide Pricing Table
          </h2>
          <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
            Every EPC includes the on-site assessment, official lodgement on the GOV.UK EPC Register, and your certificate link sent once it is live. Same-day lodgement is {`£${SAME_DAY_LODGEMENT_SURCHARGE}`} extra, and a next-day visit and lodgement {`£${NEXT_DAY_VISIT_SURCHARGE}`} extra.
          </p>
        </div>

        {/* Two prominent callouts — read at a glance, even if nothing else is */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 max-w-3xl">
          <div className="flex gap-3 rounded-xl border border-warm-200 bg-warm-50 p-4">
            <Info className="w-5 h-5 text-warm-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold text-secondary-900">These are guide prices</p>
              <p className="mt-1 text-sm text-secondary-700 leading-relaxed">
                Every figure below is a guide estimate, not a fixed quote. The largest band shows starting prices. You get an exact price confirmed before you book.
              </p>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl border border-primary-200 bg-primary-50 p-4">
            <Ruler className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold text-secondary-900">Floor area is the biggest factor</p>
              <p className="mt-1 text-sm text-secondary-700 leading-relaxed">
                Your price is driven mainly by internal floor area (m²). Extensions, loft conversions, layout and condition also count.
              </p>
            </div>
          </div>
        </div>

        {/* Phones: one block per band so every price is visible without sideways scrolling. */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-secondary-200 shadow-premium sm:hidden">
          <ul className="divide-y divide-secondary-100">
            {pricing.map((row) => (
              <li key={row.id} className="bg-white px-4 py-4">
                <p className="flex items-center gap-1.5 text-base font-bold text-secondary-900">
                  <Ruler className="w-3.5 h-3.5 shrink-0 text-secondary-500" aria-hidden="true" />
                  {row.areaLabel}
                </p>
                <p className="mt-0.5 pl-5 text-xs text-secondary-600">{row.typicalLabel}</p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {([['EPC', row.epc], ['Floor plan', row.floorPlan], ['Pre-Assessment (not lodged)', row.preAssessment]] as const).map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs font-medium text-secondary-600">{label}</dt>
                      <dd>
                        {row.startingPrice && <><span className="text-xs font-medium text-secondary-600">From</span>{' '}</>}
                        <span className="text-base font-bold text-secondary-900">{`£${formatPrice(value)}`}</span>
                      </dd>
                    </div>
                  ))}
                  <div className="col-span-2 flex flex-wrap items-baseline justify-between gap-x-3 rounded-lg bg-primary-50 px-3 py-2">
                    <dt className="text-xs font-semibold text-primary-800">EPC + floor plan</dt>
                    <dd className="text-right">
                      <span className="text-base font-bold text-primary-800">
                        {row.startingPrice && (
                          <span className="text-xs font-medium text-primary-700">From </span>
                        )}
                        {`£${formatPrice(row.bundle)}`}
                      </span>{' '}
                      {!row.startingPrice && <span className="text-xs font-semibold text-primary-700">
                        Save {`£${formatPrice(bundleSaving(row))}`}
                      </span>}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
          <p className="bg-secondary-50 border-t border-secondary-200 px-4 py-3 text-xs text-secondary-500 leading-relaxed">
            All figures are guide prices; the largest band shows starting prices. Internal floor area (m²) is the single biggest factor in the final price, alongside extensions, loft conversions, layout and condition; bedrooms are shown only as a rough guide. Savings shown are the difference between the two services booked separately and booked together.{' '}
            <a href={quoteHref({ sourcePage: 'pricing', ctaId: 'inline' })} className="font-medium text-primary-700 underline">Request an exact quote</a>.
          </p>
        </div>

        <div className="mt-8 hidden overflow-hidden rounded-2xl border border-secondary-200 shadow-premium sm:block">
          <div className="overflow-x-auto overscroll-x-contain [scrollbar-width:thin]">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="bg-secondary-50 border-b border-secondary-200">
                  <th scope="col" className="px-5 py-3.5 text-left font-semibold text-secondary-700">Internal floor area</th>
                  <th scope="col" className="px-4 py-3.5 text-right font-semibold text-secondary-900">EPC</th>
                  <th scope="col" className="px-4 py-3.5 text-right font-semibold text-secondary-900">Floor plan</th>
                  <th scope="col" className="px-4 py-3.5 text-right font-semibold text-secondary-900">
                    Pre-Assessment
                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-secondary-500">Not lodged</span>
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-right font-semibold text-primary-800 bg-primary-50">
                    EPC + floor plan
                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-primary-700">
                      Best value
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {pricing.map((row) => (
                  <tr key={row.id} className="bg-white hover:bg-secondary-50/70 transition-colors">
                    {/* PRIMARY: floor area drives the guide band */}
                    <th scope="row" className="px-5 py-3.5 text-left">
                      <span className="flex items-center gap-1.5 text-base font-bold text-secondary-900">
                        <Ruler className="w-3.5 h-3.5 shrink-0 text-secondary-500" aria-hidden="true" />
                        {row.areaLabel}
                      </span>
                      <span className="mt-0.5 block pl-5 text-xs font-normal text-secondary-600">{row.typicalLabel}</span>
                    </th>
                    {/* Standard bands are guide prices; the open-ended top band shows starting prices */}
                    {[row.epc, row.floorPlan, row.preAssessment].map((value, i) => (
                      <td key={i} className="px-4 py-3.5 text-right whitespace-nowrap">
                        {row.startingPrice && <><span className="text-xs font-medium text-secondary-600">From</span>{' '}</>}
                        <span className="text-base font-bold text-secondary-900">{`£${formatPrice(value)}`}</span>
                      </td>
                    ))}
                    <td className="px-4 py-3.5 text-right bg-primary-50 whitespace-nowrap">
                      <span className="text-base font-bold text-primary-800">
                        {/* Open-ended top band varies far more, so it is the one
                            bundle figure presented as a starting point. */}
                        {row.startingPrice && (
                          <span className="text-xs font-medium text-primary-700">From </span>
                        )}
                        {`£${formatPrice(row.bundle)}`}
                      </span>
                      {!row.startingPrice && <span className="block text-xs font-semibold text-primary-700">
                        Save {`£${formatPrice(bundleSaving(row))}`}
                      </span>}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-secondary-50 border-t border-secondary-200">
                  <td colSpan={5} className="px-5 py-3 text-xs text-secondary-500 leading-relaxed">
                    All figures are guide prices; the largest band shows starting prices. Internal floor area (m²) is the single biggest factor in the final price, alongside extensions, loft conversions, layout and condition; bedrooms are shown only as a rough guide. Savings shown are the difference between the two services booked separately and booked together.{' '}
                    <a href={quoteHref({ sourcePage: 'pricing', ctaId: 'inline' })} className="font-medium text-primary-700 underline">Request an exact quote</a>.
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <GuidePriceNote className="mt-6" />

        <div className="mt-6 rounded-xl bg-primary-50 border border-primary-200 p-6 flex items-start gap-4">
          <Sparkles className="w-6 h-6 text-primary-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold text-primary-900">Better value together</p>
            <p className="mt-1 text-primary-900 leading-relaxed">
              Book both services in one visit and save up to {`£${formatPrice(maxBundleSaving)}`} — one appointment, both services completed together.
            </p>
          </div>
        </div>

        {/* Additional charges — deliberately a separate, smaller table. Folding
            these into the main grid would read as six more price bands; they are
            modifiers to a quote, and most of them resolve to "we will tell you". */}
        <div className="mt-10 max-w-3xl">
          <h3 className="text-xl font-bold text-secondary-900">Additional requirements</h3>
          <p className="mt-2 text-secondary-700 leading-relaxed">
            These sit on top of the guide prices above. Anything marked &ldquo;exact quote&rdquo; is confirmed in writing before you book, never added afterwards.
          </p>

          <div className="mt-5 overflow-hidden rounded-2xl border border-secondary-200">
            <table className="w-full text-sm">
              <caption className="sr-only">Additional requirements and their guide charges</caption>
              <thead>
                <tr className="bg-secondary-50 border-b border-secondary-200">
                  <th scope="col" className="px-5 py-3 text-left font-semibold text-secondary-700">Additional requirement</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold text-secondary-700">Guide</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {additionalCharges.map((row) => (
                  <tr key={row.label} className="bg-white">
                    <th scope="row" className="px-5 py-3 text-left font-normal text-secondary-700">{row.label}</th>
                    <td className="px-5 py-3 text-right font-semibold text-secondary-900 whitespace-nowrap">
                      {row.guide}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* Our promise, under the prices (Abdul 24/10) */}
      <OurPromise />

      {/* What's included / not included */}
      <Section variant="muted" id="whats-included">
        <div className="grid gap-5 md:gap-8 md:grid-cols-2">
          <Card className="p-5 md:p-8">
            <h2 className="text-xl font-semibold text-secondary-900">What&rsquo;s included in every EPC</h2>
            <ul className="mt-5 space-y-2.5">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-secondary-700">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5 md:p-8">
            <h2 className="text-xl font-semibold text-secondary-900">What&rsquo;s not included</h2>
            <ul className="mt-5 space-y-2.5">
              {notIncluded.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-secondary-700">
                  <XCircle className="w-5 h-5 text-secondary-400 shrink-0 mt-0.5" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-secondary-600">
              For properties outside our service radius, contact us for a tailored quote.
            </p>
          </Card>
        </div>
      </Section>

      {/* Pricing FAQ */}
      <Section variant="default" id="pricing-faq">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-wide font-semibold text-primary-700">FAQ</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            Pricing Questions
          </h2>
          <div className="mt-8">
            <Accordion items={pricingFaq} />
          </div>
        </div>
      </Section>

      <CtaStrip
        heading="Get a Personalised Quote"
        body="Send us the address and property size, and we'll confirm your exact price before anything is booked."
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ sourcePage: 'pricing', ctaId: 'bottom' }) }}
      />
    </>
  )
}
