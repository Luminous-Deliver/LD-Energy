'use client'

import { quoteHref, quoteContextForPath } from '@/lib/quote-context'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Phone, MessageCircle, CalendarCheck } from 'lucide-react'
import { site } from '@/lib/site'
import { cn } from '@/lib/cn'
import { useScrollDirection } from '@/lib/useScrollDirection'

export function MobileCallBar() {
  const hidden = useScrollDirection()
  const pathname = usePathname()

  /**
   * Stand down on the contact page.
   *
   * The quote form and its estimate stay in the page flow. Support channels
   * follow the form; no marketing or price overlay competes with the keyboard.
   * The marketing bar's visual redesign belongs to the next approved stage.
   */
  if (pathname === '/contact') return null

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 bg-primary-600 text-white shadow-lg md:hidden transition-transform duration-300 will-change-transform',
        // Slide down out of view when scrolling down, reveal on scroll up.
        hidden ? 'translate-y-full' : 'translate-y-0',
      )}
    >
      <div className="grid grid-cols-3">
        <a
          href={site.phoneHref}
          className="flex items-center justify-center gap-1.5 py-3.5 text-sm font-semibold border-r border-primary-500 active:bg-primary-700"
          aria-label={`Call ${site.phone}`}
        >
          <Phone className="w-4 h-4" aria-hidden="true" />
          Call
        </a>
        <a
          href={site.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-3.5 text-sm font-semibold active:bg-primary-700"
          aria-label="Message us on WhatsApp"
        >
          <MessageCircle className="w-4 h-4" aria-hidden="true" />
          WhatsApp
        </a>
        <Link
          href={pathname === '/contact' ? '#booking-form' : quoteHref(quoteContextForPath(pathname))}
          className="flex items-center justify-center gap-1.5 py-3.5 text-sm font-bold bg-accent-600 text-white active:bg-accent-700"
          aria-label="Book your EPC"
        >
          <CalendarCheck className="w-4 h-4" aria-hidden="true" />
          Book
        </Link>
      </div>
    </div>
  )
}
