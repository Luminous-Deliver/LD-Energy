import { ExternalLink, Star } from 'lucide-react'
import { site } from '@/lib/site'

/**
 * Visible Google rating linking to the public listing. Figures come from
 * site.reviews, updated by hand after checking the listing. Text only:
 * self-published review markup is deliberately not emitted.
 */
export function GoogleRating({ className }: { className?: string }) {
  return (
    <a href={site.reviews.profileUrl} target="_blank" rel="noopener noreferrer" className={className}>
      <span aria-hidden="true" className="flex shrink-0">
        {Array.from({ length: 5 }, (_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
      </span>
      {/* The explicit space keeps text and accessible name as "5.0 from N"; flex gap alone joins them. */}
      <span className="whitespace-nowrap font-semibold">{site.reviews.ratingValue.toFixed(1)}</span>{' '}
      {/* Icon inside the unbreakable phrase so it never wraps onto a line by itself. */}
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
        from {site.reviews.reviewCount} Google reviews
        <ExternalLink aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
      </span>
    </a>
  )
}
