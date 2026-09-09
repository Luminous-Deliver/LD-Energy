import Link from 'next/link'
import { ArrowRight, Check, EyeOff } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatPrice } from '@/lib/site'

/**
 * Service orientation card — deliberately NOT a pricing tier card.
 *
 * Reading order is service → outcome → what you actually get → guide price →
 * enquiry. The price sits *below* the inclusions and inside a sentence rather
 * than above them as an isolated display figure: a large lone number anchors
 * the whole card to "cheapest", which is the wrong customer. Keeping "Guide
 * prices from" in the same line as the figure also means the qualifier cannot
 * be skimmed past, which an adjacent label can be.
 *
 * Styling avoids SaaS plan-card conventions (coloured headers, giant tiers,
 * feature checklists of eight items) — this is a property service, not a
 * subscription.
 */
export interface PricingServiceCardProps {
  title: string
  from: number
  /** Outcome sentence. What the customer ends up with, not an adjective. */
  positioning: string
  inclusions: string[]
  href: string
  ctaLabel?: string
  /** Genuine arithmetic saving, derived from canonical prices. Bundle only. */
  saving?: number
  /** Modest elevation for the combined service. Not a "most popular" claim. */
  emphasis?: boolean
  emphasisLabel?: string
  /**
   * A genuine alternative to this service — a variant someone comparing cards
   * would want to know exists, without giving it a card of its own and diluting
   * the three-way choice.
   *
   * Rendered as a tinted callout INSIDE the card, above the price. It began as
   * small grey text below the CTA and was invisible there: nothing after the
   * button gets read, which is the whole problem with footnote-shaped links to
   * things you actually want people to find.
   */
  alternative?: {
    text: string
    linkLabel: string
    href: string
  }
}

export function PricingServiceCard({
  title,
  from,
  positioning,
  inclusions,
  href,
  ctaLabel = 'Get my exact quote',
  saving,
  emphasis = false,
  emphasisLabel,
  alternative,
}: PricingServiceCardProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border bg-white p-6 transition-all duration-200',
        emphasis
          ? 'border-accent-500 shadow-premium ring-1 ring-accent-500/30'
          : 'border-secondary-200 shadow-sm hover:border-secondary-300 hover:shadow-premium',
      )}
    >
      {emphasis && emphasisLabel && (
        <span className="absolute -top-3 left-6 rounded-full bg-accent-700 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
          {emphasisLabel}
        </span>
      )}

      <h3 className="text-lg font-bold text-secondary-900">{title}</h3>
      <p className="mt-2 text-[15px] font-medium leading-relaxed text-secondary-800">{positioning}</p>

      <ul className="mt-4 flex-1 space-y-2">
        {inclusions.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-secondary-700">
            <Check
              className={cn(
                'mt-0.5 h-4 w-4 shrink-0',
                emphasis ? 'text-accent-600' : 'text-primary-600',
              )}
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {alternative && (
        <div className="mt-5 rounded-xl border border-primary-200 bg-primary-50/70 p-3">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white">
              <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <p className="text-xs leading-relaxed text-secondary-700">
              {alternative.text}{' '}
              <Link
                href={alternative.href}
                className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800"
              >
                {alternative.linkLabel}
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Price supports the decision, it does not lead it — hence below the
          inclusions, and set in a sentence so "from" cannot be skipped. */}
      <div className="mt-5 border-t border-secondary-100 pt-4">
        <p className="text-sm text-secondary-700">
          Guide prices from{' '}
          <span className="text-2xl font-bold tracking-tight text-secondary-900">
            {`£${formatPrice(from)}`}
          </span>
        </p>
        {saving ? (
          <p className="mt-1 text-sm font-semibold text-accent-700">
            Save up to {`£${formatPrice(saving)}`} against booking separately
          </p>
        ) : null}
        <p className="mt-1 text-xs text-secondary-600">Exact price confirmed before booking</p>
      </div>

      <Link
        href={href}
        className={cn(
          'mt-6 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all',
          emphasis
            ? 'bg-gradient-to-r from-accent-600 to-accent-700 text-white shadow-md hover:from-accent-700 hover:to-accent-800'
            : 'border border-secondary-200 text-secondary-900 hover:border-primary-300 hover:bg-primary-50',
        )}
      >
        {ctaLabel}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  )
}
