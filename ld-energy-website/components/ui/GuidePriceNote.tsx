import { Info } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * The single source of guide-price wording. Customers were reading the pricing
 * table as a final price list, so this note exists to be repeated verbatim
 * wherever a figure appears — one wording, one place to change it.
 *
 * `variant="inline"` is a one-liner for tight spots; `"panel"` is the fuller
 * explanation used once per pricing surface.
 */
export function GuidePriceNote({
  variant = 'panel',
  className,
}: {
  variant?: 'panel' | 'inline'
  className?: string
}) {
  if (variant === 'inline') {
    return (
      <p className={cn('text-sm text-secondary-600', className)}>
        Guide price — we confirm your exact quote before booking.
      </p>
    )
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border border-primary-200 bg-primary-50/70 p-4',
        className,
      )}
    >
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary-700" aria-hidden="true" />
      <p className="text-sm leading-relaxed text-secondary-800">
        {/* Abdul's wording, 22/10/2026 pricing spec §11 */}
        <strong className="font-semibold text-secondary-900">Guide prices for standard domestic properties.</strong>{' '}
        Larger or unusually complex properties are quoted individually. Your exact price is confirmed
        before booking.
      </p>
    </div>
  )
}
