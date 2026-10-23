import { quoteHref, quoteContextForPath } from '@/lib/quote-context'
import type { CtaId } from '@/lib/enquiry-attribution'

/**
 * Where the header, menu and phone-dock "Get my exact quote" go: the quote journey carrying the page's context, on
 * every page. Buttons at the top of a page or always on screen open the dialog (the reader keeps their place); only
 * buttons beside a page's own form (home, area pages) scroll to it (Claude 23/10/2026, Abdul's call to make). With JavaScript the quote dialog opens over the page; without it, or if the
 * dialog fails, the link lands on /quote (Abdul 23/10/2026: "/quote as a back up for if popup is blocked").
 */
export function quoteTargetFor(pathname: string, ctaId: CtaId): string {
  return quoteHref({ ...quoteContextForPath(pathname), ctaId })
}
