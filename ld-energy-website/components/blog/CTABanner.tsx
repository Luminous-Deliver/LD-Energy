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
 * Quote and WhatsApp side by side, as on the rebuilt area pages (plan §4.2, §8.2). Guides carry no
 * phone link; the phone stays in the header and footer.
 */
export function CTABanner({
  heading = 'Need an EPC in London?',
  body = `Elmhurst and Quidos accredited assessor. Guide prices from £${priceFrom.epc}. Exact quote before booking.`,
  variant = 'inline',
}: CTABannerProps) {
  const isFinal = variant === 'final'
  return (
    <div
      className={`not-prose rounded-lg p-5 md:p-8 ${
        isFinal ? 'my-12 bg-secondary-900 text-white' : 'my-12 bg-primary-600 text-white'
      }`}
    >
      <h3 className="text-xl md:text-2xl font-bold !text-white mb-2">{fillPrices(heading)}</h3>
      <p className={`mb-5 ${isFinal ? 'text-secondary-200' : 'text-primary-50'}`}>{fillPrices(body)}</p>
      <div className="flex flex-wrap gap-3">
        <Link
          href={quoteHref({ sourcePage: 'blog', ctaId: isFinal ? 'bottom' : 'inline' })}
          className="inline-flex items-center justify-center bg-white text-primary-700 hover:bg-primary-50 font-semibold px-5 py-2.5 rounded-md"
        >
          Get my exact quote
        </Link>
        <a
          href={whatsappQuoteHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 border border-white/40 hover:bg-white/10 font-semibold px-5 py-2.5 rounded-md"
        >
          <MessageCircle className="w-4 h-4" aria-hidden="true" />
          WhatsApp a quote request
        </a>
      </div>
    </div>
  )
}
