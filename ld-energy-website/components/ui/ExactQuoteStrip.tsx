import { quoteHref } from '@/lib/quote-context'
import Link from 'next/link'
import { ArrowRight, BadgeCheck } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Sits directly under the three service cards, between the starting prices and
 * the floor-area estimator.
 *
 * Its only job is to stop a visitor carrying a starting figure forward as if it
 * were their quote. The tone matters as much as the content: listing what can
 * change the price reads as unpredictable if it leads, so the guarantee comes
 * first and the variables follow as the reason it can be given. Compact by
 * design — this is a reassurance line, not another section.
 */
export function ExactQuoteStrip({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'mt-6 rounded-2xl border border-primary-200 bg-primary-50/70 p-5 sm:p-6',
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex items-start gap-3">
          <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary-700" aria-hidden="true" />
          <div>
            <p className="font-semibold text-secondary-900">
              Your exact quote is confirmed before booking
            </p>
            <p className="mt-1 text-sm leading-relaxed text-secondary-700">
              Guide prices are based mainly on internal floor area. Extensions, loft conversions,
              unusual layouts, multiple floors and travel outside the normal service area can affect
              the final figure — so you get the real number first, in writing.
            </p>
          </div>
        </div>

        <Link
          href={quoteHref()}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-primary-800 shadow-sm ring-1 ring-primary-200 transition-all hover:bg-primary-100 hover:ring-primary-300"
        >
          Get my exact quote
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
