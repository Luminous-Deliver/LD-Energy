import { quoteHref } from '@/lib/quote-context'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { priceFrom } from '@/lib/site'
import { whatsappQuoteHref } from '@/lib/area-page'
import { fillPrices } from '@/lib/guide-prices'

interface CTABannerProps {
  heading?: string
  /** May carry {price:key} tokens (lib/guide-prices.ts). */
  body?: string
  variant?: 'inline' | 'final'
}

/**
 * The booking card inside a guide (was a blue banner; Abdul 23/10/2026: "not really well designed and colour").
 * A white card on the paper ground with a sage top rule and the two actions, quote first.
 * Guides carry no phone link; the phone stays in the header and footer.
 */
export function CTABanner({
  heading = 'Need an EPC in London?',
  body = `Elmhurst and Quidos accredited assessor. Guide prices from £${priceFrom.epc}. Exact quote before booking.`,
  variant = 'inline',
}: CTABannerProps) {
  return (
    <aside className="gd-book" aria-label={fillPrices(heading)}>
      <div>
        <p className="gd-eyebrow">Book an assessment</p>
        <h3 className="gd-book__h">{fillPrices(heading)}</h3>
        <p className="gd-book__p">{fillPrices(body)}</p>
      </div>
      <div className="gd-book__acts">
        <Link
          href={quoteHref({ sourcePage: 'blog', ctaId: variant === 'final' ? 'bottom' : 'inline' })}
          className="ld-btn ld-btn--primary"
        >
          Get my exact quote
        </Link>
        <a href={whatsappQuoteHref()} target="_blank" rel="noopener noreferrer" className="ld-btn ld-btn--line">
          <MessageCircle width={18} height={18} aria-hidden="true" />
          WhatsApp a quote request
        </a>
      </div>
    </aside>
  )
}
