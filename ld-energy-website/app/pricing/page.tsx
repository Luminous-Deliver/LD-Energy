import { quoteHref } from '@/lib/quote-context'
import type { Metadata } from 'next'
import { CheckCircle2, XCircle, Sparkles, Ruler, Info } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { PageHero } from '@/components/sections/PageHero'
import { CtaStrip } from '@/components/sections/CtaStrip'
import { Accordion } from '@/components/ui/Accordion'
import {
  pricing,
  site,
  formatPrice,
  bundleSaving,
  maxBundleSaving,
  priceFrom,
  EXPRESS_SURCHARGE,
} from '@/lib/site'
import type { FaqItem } from '@/lib/faq'

export const metadata: Metadata = {
  title: `EPC Prices London | From £${priceFrom.epc}`,
  description: `Guide prices for EPC and floor plan services in London, from £${priceFrom.epc}. Priced mainly on internal floor area (m²). Your exact quote is confirmed before booking.`,
  alternates: { canonical: `${site.url}/pricing` },
  openGraph: {
    title: `EPC Prices London | From £${priceFrom.epc} | Transparent Guide Pricing | L&D Energy`,
    description: `Guide prices for EPC and floor plan services in London, from £${priceFrom.epc}. Priced mainly on internal floor area (m²). Exact quote confirmed before booking.`,
    url: `${site.url}/pricing`,
  },
  twitter: {
    title: `EPC Prices London | From £${priceFrom.epc} | Transparent Guide Pricing`,
    description: `Guide prices from £${priceFrom.epc}, based mainly on internal floor area (m²). Exact quote confirmed before booking.`,
  },
}

const breadcrumbs = [
  { href: '/', label: 'Home' },
  { href: '/pricing', label: 'Pricing' },
]

const included = [
  'On-site assessment by an Elmhurst-accredited DEA',
  'Official lodgement on the UK Government EPC Register',
  'Certificate link sent once lodged on the government register',
  'Full data report',
  'No call-out or mileage charge within our normal service area',
]

const notIncluded = [
  `Energy improvement recommendations — available with the £${site.addOns.improvementPlan} EPC Improvement Plan`,
  'Re-visits due to access issues, charged at £25 per visit',
  'Properties outside our normal service area (contact for a quote)',
]

/**
 * Modifiers to a quote, not price bands — hence a separate, smaller table.
 * Only the express surcharge is a fixed figure, and it comes from the canonical
 * source so it can never drift from the estimator or the booking form.
 */
const additionalCharges: Array<{ label: string; guide: string }> = [
  { label: 'Next-day service', guide: `+£${EXPRESS_SURCHARGE}` },
  { label: 'EPC Improvement Plan', guide: `+£${site.addOns.improvementPlan}` },
  { label: 'EPC Pre-Assessment (not lodged)', guide: 'Same as the EPC band' },
  { label: 'Lodging a held Pre-Assessment later', guide: `+£${site.addOns.lodgeLater}` },
  { label: 'Extensions, loft conversions or unusual layouts', guide: 'Exact quote' },
  { label: 'Multiple floors or additional measurement complexity', guide: 'Exact quote' },
  { label: 'Travel outside the normal service area', guide: 'Exact quote' },
  { label: 'Large or unusually complex properties', guide: 'Exact quote' },
]

const pricingFaq: FaqItem[] = [
  {
    q: 'How much does an EPC cost in London?',
    a: `Guide prices start at £${pricing[0].epc} for properties up to 37 m² and rise with internal floor area, up to £${pricing[5].epc} for homes over 121 m². These are starting estimates, not fixed quotes — the final price depends on the internal floor area (m²), any extensions or loft conversions, layout and condition. Your exact quote is confirmed before you book.`,
  },
  {
    q: 'Are there any hidden fees?',
    a: 'No. The price we confirm before booking is the price you pay. Quotes are worked out from your property size and condition, so there are no surprise add-ons or call-out charges. Anything that could change the figure — extensions, unusual layouts, or travel outside our normal service area — is priced into the quote up front.',
  },
  {
    q: 'Does my EPC include improvement recommendations?',
    a: `Not as standard. Your certificate shows the energy rating and a full description of the property — walls, windows, heating, hot water and lighting. Improvement recommendations come with the £${site.addOns.improvementPlan} EPC Improvement Plan, which also includes a full Energy Report and a written plan ranking which measures are worth doing on your building and in what order. You can add it when you book, or decide on the day before we lodge.`,
  },
  {
    q: 'How much is an EPC Pre-Assessment?',
    a: `The same as the EPC for that floor-area band — from £${pricing[0].epc} — because it is the same visit, the same measuring and the same evidence gathering; only the lodgement is skipped. The Energy Report and the written Improvement Plan are included rather than charged on top. If you later decide you want the certificate after all, we can usually lodge the same survey for £${site.addOns.lodgeLater} with no second visit, provided nothing at the property has changed. It is not a substitute for an EPC where one is legally required.`,
  },
  {
    q: 'Do you charge for travel?',
    a: 'There is no call-out or mileage charge within our normal service area across London. For properties outside it, travel time is included in the quote you receive before booking, so it is never added afterwards.',
  },
  {
    q: 'Can I get a discount for multiple properties?',
    a: 'Yes. We offer portfolio rates for landlords and letting agents with multiple properties. Send us the postcodes and we will quote the whole set together.',
  },
  {
    q: 'What is the next-day service?',
    a: `For £${EXPRESS_SURCHARGE} extra per EPC, your certificate is lodged within 24 hours of the assessment rather than the standard 72. This applies to assessments completed during our standard hours (Mon–Sun, 8am–8pm). Book before noon for the best chance of a same-day or next-morning appointment.`,
  },
  {
    q: 'How much does a floor plan cost?',
    a: `Floor plans have guide prices from £${priceFrom.floorPlan}, priced on the same internal floor-area bands as the EPC. Booking an EPC and floor plan together costs less than booking them separately — up to £${formatPrice(maxBundleSaving)} less — because we measure the property during the assessment anyway, so it is one visit rather than two. Your exact quote is confirmed before booking.`,
  },
  {
    q: 'What if my property is larger than 121 m²?',
    a: `Guide prices for homes over 121 m² start at £${pricing[5].epc} for the EPC, £${pricing[5].floorPlan} for a floor plan and £${pricing[5].bundle} for both together. Large properties vary a great deal in layout and complexity, so this band is a starting point rather than a typical figure — send us the address and we will confirm the exact quote before you book.`,
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
      name: `Domestic EPC, ${row.areaLabel} (${row.typicalLabel})`,
      // minPrice, not price: every figure on this page is a starting guide, and
      // marking it as a fixed price would misrepresent visible page content.
      priceSpecification: {
        '@type': 'PriceSpecification',
        minPrice: row.epc,
        priceCurrency: 'GBP',
      },
      availability: 'https://schema.org/InStock',
      url: `${site.url}/contact`,
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
        primaryCta={{ label: 'Request a Quote', href: quoteHref({ sourcePage: 'pricing', ctaId: 'hero' }) }}
      />

      {/* Full pricing table */}
      <Section variant="default" id="pricing-table">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-wide font-semibold text-primary-700">The Numbers</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            Guide Pricing Table
          </h2>
          <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
            Every EPC includes the on-site assessment, official lodgement on the GOV.UK EPC Register, and your certificate link sent once it is live. Next-day lodgement is {`£${EXPRESS_SURCHARGE}`} extra.
          </p>
        </div>

        {/* Two prominent callouts — read at a glance, even if nothing else is */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 max-w-3xl">
          <div className="flex gap-3 rounded-xl border border-warm-200 bg-warm-50 p-4">
            <Info className="w-5 h-5 text-warm-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold text-secondary-900">These are starting prices</p>
              <p className="mt-1 text-sm text-secondary-700 leading-relaxed">
                Every figure below is a guide estimate, not a fixed quote. You get an exact price confirmed before you book.
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

        <div className="mt-8 overflow-hidden rounded-2xl border border-secondary-200 shadow-premium">
          <div className="overflow-x-auto overscroll-x-contain [scrollbar-width:thin]">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="bg-secondary-50 border-b border-secondary-200">
                  <th scope="col" className="px-5 py-3.5 text-left font-semibold text-secondary-700">Internal floor area</th>
                  <th scope="col" className="px-4 py-3.5 text-left font-medium text-secondary-600">Typical property</th>
                  <th scope="col" className="px-4 py-3.5 text-right font-semibold text-secondary-900">EPC</th>
                  <th scope="col" className="px-4 py-3.5 text-right font-semibold text-secondary-900">Floor plan</th>
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
                  <tr key={row.type} className="bg-white hover:bg-secondary-50/70 transition-colors">
                    {/* PRIMARY: floor area drives the guide band */}
                    <th scope="row" className="px-5 py-3.5 text-left">
                      <span className="flex items-center gap-1.5 text-base font-bold text-secondary-900">
                        <Ruler className="w-3.5 h-3.5 shrink-0 text-secondary-500" aria-hidden="true" />
                        {row.areaLabel}
                      </span>
                    </th>
                    {/* SECONDARY: familiar reference only, deliberately muted */}
                    <td className="px-4 py-3.5 text-xs font-normal text-secondary-600">{row.typicalLabel}</td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <span className="text-xs font-medium text-secondary-600">From</span>{' '}
                      <span className="text-base font-bold text-secondary-900">{`£${formatPrice(row.epc)}`}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <span className="text-xs font-medium text-secondary-600">From</span>{' '}
                      <span className="text-base font-bold text-secondary-900">{`£${formatPrice(row.floorPlan)}`}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right bg-primary-50 whitespace-nowrap">
                      <span className="text-base font-bold text-primary-800">
                        {/* Open-ended top band varies far more, so it is the one
                            bundle figure presented as a starting point. */}
                        {row.areaMax === null && (
                          <span className="text-xs font-medium text-primary-700">From </span>
                        )}
                        {`£${formatPrice(row.bundle)}`}
                      </span>
                      <span className="block text-xs font-semibold text-primary-700">
                        Save {`£${formatPrice(bundleSaving(row))}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-secondary-50 border-t border-secondary-200">
                  <td colSpan={5} className="px-5 py-3 text-xs text-secondary-500 leading-relaxed">
                    All figures are guide estimates and act as starting prices. Internal floor area (m²) is the single biggest factor in the final price, alongside extensions, loft conversions, layout and condition. Savings shown are the difference between the two services booked separately and booked together.{' '}
                    <a href={quoteHref({ sourcePage: 'pricing', ctaId: 'inline' })} className="font-medium text-primary-700 underline">Request an exact quote</a>.
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="bg-secondary-50 px-5 pb-3 text-xs font-medium text-secondary-600 sm:hidden" aria-hidden="true">
            Swipe sideways to see every column
          </p>
        </div>

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
        primaryCta={{ label: 'Request a Quote', href: quoteHref({ sourcePage: 'pricing', ctaId: 'bottom' }) }}
      />
    </>
  )
}
