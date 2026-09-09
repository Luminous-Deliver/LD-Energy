'use client'

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
   * All three actions are redundant there — Call and WhatsApp already sit in
   * the form's "Prefer to talk?" panel, and "Book an EPC" links to the page
   * the visitor is already on. More importantly the booking form's running
   * price bar occupies the same fixed-bottom slot at the same z-index, and
   * that number is the one doing the work while someone is choosing.
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
          href="/contact"
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
