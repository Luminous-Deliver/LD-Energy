import { quoteHref, quoteContextForPath } from '@/lib/quote-context'
import type { CtaId } from '@/lib/enquiry-attribution'

/**
 * Where "Get my exact quote" goes from a page: the page's own form when it has one (contact, home, the area
 * pages' shared form), otherwise /contact carrying the page's context.
 */
export function quoteTargetFor(pathname: string, ctaId: CtaId): string {
  if (pathname === '/contact') return '#booking-form'
  if (pathname === '/') return '#pricing'
  if (pathname.startsWith('/areas/') && ctaId === 'mobile-bar') return '#contact'
  return quoteHref({ ...quoteContextForPath(pathname), ctaId })
}
