'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

const STORAGE_KEY = 'cookie-consent'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
    } catch {
      // Browser storage restrictions must not crash the enquiry page.
      setVisible(true)
    }
  }, [])

  function accept() {
    try { localStorage.setItem(STORAGE_KEY, 'accepted') } catch { /* Choice lasts for this mounted visit. */ }
    setVisible(false)
  }

  function decline() {
    try { localStorage.setItem(STORAGE_KEY, 'declined') } catch { /* Choice lasts for this mounted visit. */ }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-[45] bg-secondary-900 text-white shadow-2xl border-t border-secondary-700"
    >
      <div className="max-w-screen-xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="flex-1 text-sm text-secondary-300 leading-relaxed">
          We use analytics cookies to understand how visitors use our site and improve your experience.{' '}
          <Link href="/privacy-policy" className="underline text-primary-300 hover:text-primary-200">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={accept}
            className="inline-flex items-center justify-center px-4 min-h-[44px] bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Accept
          </button>
          <button
            onClick={decline}
            className="inline-flex items-center justify-center px-4 min-h-[44px] bg-transparent hover:bg-secondary-700 text-secondary-300 hover:text-white text-sm font-medium rounded-xl transition-colors border border-secondary-700"
          >
            Decline
          </button>
          <button
            onClick={decline}
            className="inline-flex items-center justify-center w-11 h-11 shrink-0 text-secondary-400 hover:text-white rounded-lg transition-colors"
            aria-label="Dismiss cookie banner"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
