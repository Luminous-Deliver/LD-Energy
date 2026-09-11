import Link from 'next/link'
import { ArrowRight, Ruler } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { priceFrom, maxBundleSaving, formatPrice, EXPRESS_SURCHARGE } from '@/lib/site'

/**
 * Compact pricing block for borough landing pages.
 *
 * The full <Pricing /> section rendered identically on 40 URLs — 632 words,
 * about 35% of every borough page, and the single largest source of sitewide
 * boilerplate. Removing it outright would strip EPC cost relevance from exactly
 * the pages that need it, so this keeps everything that does commercial work
 * (three services, real starting figures, the m² explanation, the bundle
 * saving, exact-quote reassurance) at roughly a fifth of the length, and sends
 * pricing authority to /pricing instead of duplicating it.
 */
export function LocalPricingSummary({ area }: { area: string }) {
  return (
    <Section variant="muted" tier="compact" id="pricing" className="scroll-mt-20 md:scroll-mt-24">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-wide font-semibold text-primary-700">Guide pricing</p>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-secondary-900">
          What an EPC costs in {area}
        </h2>
        <p className="mt-3 flex items-start gap-2.5 text-secondary-700 leading-relaxed">
          <Ruler className="mt-1 h-4 w-4 shrink-0 text-primary-600" aria-hidden="true" />
          <span>
            Pricing depends mainly on <strong className="font-semibold text-secondary-900">internal floor area (m²)</strong>,
            not the number of bedrooms. The same guide prices apply everywhere we cover, with no
            call-out charge inside our normal service area.
          </span>
        </p>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          { t: 'Domestic EPC', p: priceFrom.epc, d: 'Lodged on the GOV.UK register' },
          { t: 'EPC + floor plan', p: priceFrom.bundle, d: `One visit, save up to £${formatPrice(maxBundleSaving)}`, hi: true },
          { t: 'Floor plan only', p: priceFrom.floorPlan, d: 'Laser-measured, portal-ready' },
        ].map((s) => (
          <div
            key={s.t}
            className={
              'rounded-xl border bg-white p-4 ' +
              (s.hi ? 'border-accent-300 ring-1 ring-accent-500/20' : 'border-secondary-200')
            }
          >
            <dt className="text-sm font-bold text-secondary-900">{s.t}</dt>
            <dd>
              <span className="mt-1 block text-sm text-secondary-700">
                Guide prices from{' '}
                <span className="text-xl font-bold tracking-tight text-secondary-900">
                  {`£${formatPrice(s.p)}`}
                </span>
              </span>
              <span
                className={
                  'mt-0.5 block text-xs ' + (s.hi ? 'font-semibold text-accent-700' : 'text-secondary-600')
                }
              >
                {s.d}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-secondary-700">
        These are starting guides, not fixed quotes — your exact price is confirmed before booking,
        never after. Next-day lodgement adds {`£${EXPRESS_SURCHARGE}`}.{' '}
        <Link href="/pricing" className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800">
          See guide prices for every floor-area band
        </Link>{' '}
        or read more about{' '}
        <Link href="/services/domestic-epc" className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800">
          what a domestic EPC includes
        </Link>
        .
      </p>

      <Link
        href="#contact"
        data-enquiry-cta="pricing"
        className="mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-600 to-accent-700 px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:from-accent-700 hover:to-accent-800"
      >
        Get my exact quote for {area}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </Section>
  )
}
