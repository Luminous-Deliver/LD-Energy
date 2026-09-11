import { quoteHref } from '@/lib/quote-context'
import type { Metadata } from 'next'
import { CheckCircle2, Sparkles } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { StepList } from '@/components/ui/StepList'
import { PageHero } from '@/components/sections/PageHero'
import { CtaStrip } from '@/components/sections/CtaStrip'
import { pricing, formatPrice, bundleSaving, maxBundleSaving, priceFrom } from '@/lib/site'
import { site } from '@/lib/site'
import { areaServedLondon } from '@/lib/boroughs'

export const metadata: Metadata = {
  title: `Property Floor Plans London | From £${priceFrom.floorPlan}`,
  description: `Professional property floor plans across London. Laser-measured, high-resolution files for estate agents. Guide prices from £${priceFrom.floorPlan}, better value when booked alongside an EPC.`,
  alternates: { canonical: `${site.url}/services/floor-plans` },
  openGraph: {
    title: `Property Floor Plans London | From £${priceFrom.floorPlan} | L&D Energy`,
    description: `Professional property floor plans across London. Laser-measured, high-resolution files for estate agents and property marketing. Better value when booked alongside an EPC.`,
    url: `${site.url}/services/floor-plans`,
  },
  twitter: {
    title: `Property Floor Plans London | From £${priceFrom.floorPlan}`,
    description:
      'Professional property floor plans across London. High-resolution files for estate agents. Better value bundled with an EPC.',
  },
}

const breadcrumbs = [
  { href: '/', label: 'Home' },
  { href: '/services/floor-plans', label: 'Floor Plans' },
]

const included = [
  'Accurate measurements using laser distance tools',
  'Individual room dimensions',
  'Total floor area (gross internal area)',
  'Room labels and layout',
  'High-resolution image file',
  'Multiple format options (JPEG, PDF)',
  'Suitable for portals (Rightmove, Zoopla, OnTheMarket)',
  'Suitable for printed brochures',
]

const process = [
  {
    title: 'Request a quote',
    body: 'Contact us by phone, WhatsApp, email, or use our online form. Tell us your property address and preferred time.',
  },
  {
    title: 'We visit and measure',
    body: 'Our assessor visits at your chosen time and measures every room using laser distance tools.',
  },
  {
    title: 'Floor plan drawn',
    body: 'Measurements are drafted into a clean, professional floor plan using specialist software.',
  },
  {
    title: 'Delivered to your inbox',
    body: 'High-resolution JPEG and PDF files emailed to you within 72 hours of the assessment.',
  },
]

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Property Floor Plan',
  name: 'Professional Property Floor Plans',
  description:
    'Accurate, professionally measured floor plans for property marketing across London.',
  provider: { '@id': `${site.url}/#business` },
  url: `${site.url}/services/floor-plans`,
  areaServed: areaServedLondon,
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Floor Plan Pricing',
    itemListElement: pricing.map((p) => ({
      '@type': 'Offer',
      name: `Floor plan, ${p.areaLabel} (${p.typicalLabel})`,
      priceSpecification: {
        '@type': 'PriceSpecification',
        minPrice: p.floorPlan,
        priceCurrency: 'GBP',
      },
    })),
  },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
    { '@type': 'ListItem', position: 2, name: 'Floor Plans', item: `${site.url}/services/floor-plans` },
  ],
}

export default function FloorPlansPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([serviceSchema, breadcrumbSchema]) }}
      />

      <BreadcrumbNav items={breadcrumbs} />

      <PageHero
        eyebrow="Floor Plans"
        heading="Professional Property Floor Plans"
        subheading={`Laser-measured floor plans for property marketing. Guide prices from £${priceFrom.floorPlan} — save up to £${maxBundleSaving} when booked together with an EPC in the same visit.`}
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ service: 'floor-plan', sourcePage: 'floor-plans', ctaId: 'hero' }) }}
      />

      {/* Why Floor Plans */}
      <Section variant="default" id="why-floor-plans">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
            <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
            Why They Matter
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            Why Floor Plans?
          </h2>
          <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
            Floor plans help buyers and tenants visualise property layout before viewing. Properties marketed with floor plans receive significantly more enquiries than those without. Estate agents widely consider floor plans essential for serious listings. A professional floor plan shows room dimensions, layout flow, total floor area, and key features, helping potential buyers make faster decisions.
          </p>
        </div>
      </Section>

      {/* What's Included */}
      <Section variant="muted" id="included">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-start">
          <div>
            <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
              <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
              The Deliverable
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
              What&rsquo;s Included
            </h2>
            <p className="mt-5 text-secondary-700 leading-relaxed">
              Every floor plan we produce is measured on-site with laser tools and drawn in professional software.
            </p>
            <ul className="mt-6 space-y-2.5">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-secondary-700">
                  <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
              <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
              The Process
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
              How It Works
            </h2>
            <StepList steps={process} className="mt-8" />
          </div>
        </div>
      </Section>

      {/* Pricing Table */}
      <Section variant="default" id="pricing">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
            <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
            Pricing
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">
            Floor Plan Pricing
          </h2>
          <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
            Guide prices only — your exact quote is confirmed before booking. Booking a floor plan alongside an EPC costs less than booking them separately, because we measure the property during the assessment anyway.
          </p>
        </div>

        <div className="mt-10 overflow-x-auto rounded-lg border border-secondary-200">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-secondary-50 border-b border-secondary-200">
                <th className="px-4 py-3 text-left font-semibold text-secondary-700">Internal floor area</th>
                <th className="px-4 py-3 text-right font-semibold text-secondary-700">EPC guide</th>
                <th className="px-4 py-3 text-right font-semibold text-secondary-700">Floor plan guide</th>
                <th className="px-4 py-3 text-right font-semibold text-primary-800 bg-primary-50">Bundle guide</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {pricing.map((row) => (
                <tr key={row.type} className="bg-white hover:bg-secondary-50">
                  <td className="px-4 py-3">
                    <span className="block font-bold text-secondary-900">{row.areaLabel}</span>
                    <span className="mt-0.5 block text-xs text-secondary-600">{row.typicalLabel}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-secondary-700 whitespace-nowrap">From {`£${row.epc}`}</td>
                  <td className="px-4 py-3 text-right text-secondary-700 whitespace-nowrap">From {`£${row.floorPlan}`}</td>
                  <td className="px-4 py-3 text-right bg-primary-50 whitespace-nowrap">
                    <span className="font-bold text-primary-800">
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
          </table>
        </div>

        <div className="mt-8 rounded-xl bg-primary-50 border border-primary-200 p-6 flex items-start gap-4">
          <Sparkles className="w-6 h-6 text-primary-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold text-primary-900">Better value together</p>
            <p className="mt-1 text-primary-900 leading-relaxed">
              Book both services in one visit and save up to {`£${formatPrice(maxBundleSaving)}`} — one appointment, both services completed together.
            </p>
          </div>
        </div>
      </Section>

      <CtaStrip
        heading="Ready for your floor plan quote?"
        body="Request your exact quote online or call us. We'll arrange a visit at a time that suits you."
        primaryCta={{ label: 'Get my exact quote', href: quoteHref({ service: 'floor-plan', sourcePage: 'floor-plans', ctaId: 'bottom' }) }}
      />
    </>
  )
}
