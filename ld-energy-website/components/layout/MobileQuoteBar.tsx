'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { quoteHref, quoteContextForPath } from '@/lib/quote-context'

export function MobileQuoteBar() {
  const pathname = usePathname()
  const [heroVisible, setHeroVisible] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const target = document.querySelector('#home-quote, main section a[href*="booking-form"], main section a[href="#contact"]')
    const observer = new IntersectionObserver((entries) => setHeroVisible(entries[0].isIntersecting), { rootMargin: '-96px 0px 0px 0px' })
    if (target) observer.observe(target)
    else setHeroVisible(false)

    const menu = document.querySelector('[aria-controls="mobile-nav-panel"]')
    const syncMenu = () => setMenuOpen(menu?.getAttribute('aria-expanded') === 'true')
    syncMenu()
    const mutation = new MutationObserver(syncMenu)
    if (menu) mutation.observe(menu, { attributes: true, attributeFilter: ['aria-expanded'] })

    return () => {
      observer.disconnect()
      mutation.disconnect()
    }
  }, [pathname])

  if (pathname === '/contact' || pathname === '/privacy-policy' || heroVisible || menuOpen) return null
  const href = pathname.startsWith('/areas/') ? '#contact' : quoteHref({ ...quoteContextForPath(pathname), ctaId: 'mobile-bar' })

  return (
    <div data-mobile-quote className="fixed inset-x-0 bottom-0 z-40 border-t border-secondary-200 bg-white/95 px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-lg backdrop-blur-sm md:hidden">
      <Link prefetch={false} href={href} className="flex min-h-12 items-center justify-center rounded-xl bg-[#386B59] px-4 py-3 text-base font-semibold text-white hover:bg-[#2F5749]">
        Get my exact quote
      </Link>
    </div>
  )
}
