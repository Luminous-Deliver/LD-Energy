import { quoteHref } from '@/lib/quote-context'
import Link from 'next/link'
import { Phone } from 'lucide-react'
import { site, priceFrom } from '@/lib/site'

interface CTABannerProps {
  heading?: string
  body?: string
  variant?: 'inline' | 'final'
}

export function CTABanner({
  heading = 'Need an EPC in London?',
  body = `Elmhurst-accredited assessor. Guide prices from £${priceFrom.epc}. Lodged within 72 hours.`,
  variant = 'inline',
}: CTABannerProps) {
  const isFinal = variant === 'final'
  return (
    <div
      className={`not-prose rounded-lg p-5 md:p-8 ${
        isFinal ? 'my-12 bg-secondary-900 text-white' : 'my-12 bg-primary-600 text-white'
      }`}
    >
      <h3 className="text-xl md:text-2xl font-bold mb-2">{heading}</h3>
      <p className={`mb-5 ${isFinal ? 'text-secondary-200' : 'text-primary-50'}`}>{body}</p>
      <div className="flex flex-wrap gap-3">
        <Link
          href={quoteHref()}
          className="inline-flex items-center justify-center bg-white text-primary-700 hover:bg-primary-50 font-semibold px-5 py-2.5 rounded-md"
        >
          Book Online
        </Link>
        <a
          href={site.phoneHref}
          className="inline-flex items-center justify-center gap-2 border border-white/40 hover:bg-white/10 font-semibold px-5 py-2.5 rounded-md"
        >
          <Phone className="w-4 h-4" aria-hidden="true" />
          {site.phone}
        </a>
      </div>
    </div>
  )
}
