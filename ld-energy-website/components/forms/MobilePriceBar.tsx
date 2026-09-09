'use client'

import { useState } from 'react'
import { ChevronUp, BadgePoundSterling } from 'lucide-react'
import { cn } from '@/lib/cn'
import { guideEstimateRows, type GuideEstimate } from '@/lib/pricing-estimate'

/**
 * Running guide total, pinned to the bottom of the viewport on mobile only.
 *
 * The desktop layout puts the estimate in a sticky sidebar beside the form.
 * Below `lg` that sidebar is a normal block *after* the whole three-step form,
 * so on a phone the number was off-screen during every decision it exists to
 * inform. This restores it without reordering the page or costing flow space.
 *
 * Figures come from `guideEstimateRows`, so the bar cannot disagree with the
 * sidebar or with the booking email — all three read one `GuideEstimate`.
 */
export function MobilePriceBar({ estimate }: { estimate: GuideEstimate }) {
  const [open, setOpen] = useState(false)
  const rows = guideEstimateRows(estimate)

  // Nothing useful to show: a bulk enquiry is quoted individually, and a
  // zero total means no priceable service is selected yet.
  if (estimate.isBulk || estimate.total <= 0) return null

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
      // Keeps the bar clear of the iOS home indicator.
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="border-t border-secondary-200 bg-white/95 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] backdrop-blur">
        {open && (
          <div className="border-b border-secondary-100 px-4 py-3">
            <ul className="space-y-1.5 text-xs text-secondary-700">
              {rows.map(([label, value]) => (
                <li key={label} className="flex justify-between gap-3">
                  <span>{label}</span>
                  <span className="font-semibold text-secondary-900">{value}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] leading-snug text-secondary-500">
              A guide estimate based on the size you picked. We confirm your exact quote before
              anything is booked.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-h-[56px] w-full items-center justify-between gap-3 px-4 py-2.5 text-left"
        >
          <span className="flex items-center gap-2">
            <BadgePoundSterling className="h-4 w-4 shrink-0 text-primary-600" aria-hidden="true" />
            <span>
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-secondary-500">
                Guide estimate
              </span>
              <span className="block text-[11px] text-secondary-500">
                {open ? 'Tap to hide the breakdown' : 'Tap to see the breakdown'}
              </span>
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-xl font-black text-primary-700">{`£${estimate.total}`}</span>
            <ChevronUp
              className={cn(
                'h-4 w-4 text-secondary-500 transition-transform',
                open && 'rotate-180',
              )}
              aria-hidden="true"
            />
          </span>
        </button>
      </div>
    </div>
  )
}
