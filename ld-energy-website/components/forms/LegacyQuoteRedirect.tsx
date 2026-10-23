'use client'

import { useEffect } from 'react'
import { isLegacyQuoteLink, QUOTE_PATH } from '@/lib/quote-context'

/**
 * Old quote links pointed at /contact (`/contact?service=epc…#booking-form`), and some still sit in sent emails, blog
 * posts and other sites. Pages' _redirects cannot match a query string or a fragment, so this sends them on to /quote
 * with the same choices. A plain /contact visit stays on the contact page.
 */
export function LegacyQuoteRedirect() {
  useEffect(() => {
    const { search, hash } = window.location
    if (isLegacyQuoteLink(search, hash)) window.location.replace(`${QUOTE_PATH}${search}`)
  }, [])
  return null
}
