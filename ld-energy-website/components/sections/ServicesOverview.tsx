import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { ArrowRight, FileText, Ruler, PackageCheck, Leaf, CheckCircle2, Sparkles, Camera } from 'lucide-react'
import { priceFrom, formatPrice, site } from '@/lib/site'

// Three core services today; the grid flexes to fit future additions
// (property photography, gas & electric boiler work, …) without redesign.
const services = [
  {
    Icon: FileText,
    title: 'Domestic EPC Certificate',
    href: '/services/domestic-epc',
    description:
      'Required by law when selling or letting in England and Wales. Lodged on the official GOV.UK EPC register, valid for ten years.',
    bullets: [
      `Guide prices from £${priceFrom.epc}`,
      '72-hour standard delivery',
    ],
    highlighted: false,
  },
  {
    Icon: Ruler,
    title: 'Property Floor Plans',
    href: '/services/floor-plans',
    description:
      'Laser-measured 2D plans drawn to Rightmove and Zoopla specification, supplied as JPG and PDF files.',
    bullets: [
      `Guide prices from £${priceFrom.floorPlan}`,
      'Perfect for estate agent listings',
    ],
    highlighted: false,
  },
  {
    Icon: PackageCheck,
    title: 'EPC & Floor Plan Bundle',
    href: '/pricing',
    description:
      'Both services for the same property in one visit, at a lower combined guide price than booking them separately.',
    bullets: [
      `Bundle guide prices from £${formatPrice(priceFrom.bundle)}`,
      'Lower combined price than booking separately',
    ],
    highlighted: true,
  },
  {
    Icon: Leaf,
    title: 'Retrofit Consultation',
    href: '/services/retrofit-consultation',
    description:
      'A 10-minute walk-through on the day: what would realistically lift this property’s rating — often the next band up, sometimes further — roughly what it costs, and in what order.',
    bullets: [
      `Just £${site.addOns.retrofitConsult} added to your EPC`,
      'Plain-English route to a better rating',
    ],
    highlighted: false,
  },
]

export function ServicesOverview() {
  return (
    <Section variant="muted" tier="secondary" id="services" className="scroll-mt-20 md:scroll-mt-24">
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
          <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
          Services
        </div>
        <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-secondary-900">
          Our Services
        </h2>
        <p className="mt-4 text-lg text-secondary-600 leading-relaxed">
          Everything you need to sell or let your property, from one accredited local assessor.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <Card
            key={service.title}
            interactive
            className={
              service.highlighted
                ? 'group relative flex flex-col rounded-2xl ring-2 ring-accent-500 bg-accent-50/60 transition-all duration-200 hover:-translate-y-1 hover:shadow-premium'
                : 'group flex flex-col rounded-2xl ring-1 ring-secondary-900/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-premium'
            }
          >
            {service.highlighted && (
              <span className="absolute -top-3 left-5 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-accent-600 to-accent-700 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                Bundle Discount
              </span>
            )}
            {/* Mobile: icon left + title right; md+: stacked */}
            <div className="flex items-center gap-4 md:block">
              <span
                className={
                  service.highlighted
                    ? 'shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 text-white ring-1 ring-accent-700/10'
                    : 'shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white ring-1 ring-primary-700/10'
                }
              >
                <service.Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <h3 className="text-lg font-semibold text-secondary-900 md:mt-3">{service.title}</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-secondary-600">{service.description}</p>
            <ul className="mt-4 space-y-1.5">
              {service.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-secondary-700 text-sm">
                  <CheckCircle2
                    className={
                      service.highlighted
                        ? 'w-5 h-5 text-accent-600 shrink-0 mt-0.5'
                        : 'w-5 h-5 text-primary-600 shrink-0 mt-0.5'
                    }
                    aria-hidden="true"
                  />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Link
              href={service.href}
              className={
                service.highlighted
                  ? 'mt-auto pt-4 inline-flex min-h-[44px] items-center gap-1.5 text-accent-700 font-semibold hover:text-accent-800'
                  : 'mt-auto pt-4 inline-flex min-h-[44px] items-center gap-1.5 text-primary-700 font-semibold hover:text-primary-800'
              }
            >
              {service.highlighted ? 'See bundle pricing' : 'Learn more'}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </Card>
        ))}
      </div>

      {/*
        Deliberately outside the services grid and with no link, price or CTA.
        Photography is not bookable yet, so it must not sit alongside services
        that are, and it is intentionally absent from the OfferCatalog schema —
        that markup describes services actually offered.
      */}
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-dashed border-secondary-300 bg-secondary-50/60 p-4 sm:p-5">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary-200 text-secondary-600">
          <Camera className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="flex flex-wrap items-center gap-2 text-base font-semibold text-secondary-900">
            Property Photography
            <span className="rounded-full bg-secondary-200 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-secondary-700">
              Coming soon
            </span>
          </p>
          <p className="mt-1 text-sm leading-relaxed text-secondary-600">
            Professional property photography for listings on Rightmove, Zoopla and other property
            portals. Intended for landlords, estate agents and property managers who may eventually
            want EPCs, floor plans and listing-ready photography handled in one visit.
          </p>
        </div>
      </div>
    </Section>
  )
}
