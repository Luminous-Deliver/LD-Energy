'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { quoteTargetFor } from '@/lib/quote-target'
import { WhatsAppIcon } from '@/components/ui/BrandIcons'
import { site } from '@/lib/site'

// Pages read by customers who have usually already booked: one WhatsApp button, no quote (Abdul 23/10/2026).
const BOOKED_PATHS = ['/preparing-for-your-epc']
const BOOKED_WA = `${site.whatsappHref}?text=${encodeURIComponent('Hi, I have a question about my EPC visit.')}`

// Covered by the dock rules: a booking form (the shared form's card, the contact page's form, any form in main),
// the footer, and a cookie banner if one is ever added (mark it data-cookie-banner).
const COVERS = 'main form, .qc, footer, [data-cookie-banner]'

/** The section holding the page's H1; the H1 itself when that section is taller than a screen and a half. */
function heroOf(main: Element | null): Element | null {
  const h1 = main?.querySelector('h1')
  if (!h1) return main?.firstElementChild ?? null
  const section = h1.closest('section, header, [data-hero]')
  return section && section.getBoundingClientRect().height < window.innerHeight * 1.5 ? section : h1
}

/**
 * The phone dock (below 760 px): WhatsApp and "Get my exact quote" fixed at the bottom of the screen, as AZRated's
 * (research §5; plan §15 row 7). It arrives once the page's hero has scrolled off and steps aside over anything in
 * COVERS and while the menu is open. Hidden, it is inert, so it leaves the tab order and the accessibility tree.
 */
export function PhoneDock({ waHref }: { waHref: string }) {
  const pathname = usePathname()
  const [on, setOn] = useState(false)

  useEffect(() => {
    const phone = window.matchMedia('(max-width: 759px)')
    const hero = heroOf(document.querySelector('main'))
    const covers = Array.from(document.querySelectorAll(COVERS))
    const inView = new Set<Element>()
    let heroOn = !!hero
    let menuOpen = false

    const sync = () => setOn(phone.matches && !heroOn && !menuOpen && inView.size === 0)

    const heroWatch = new IntersectionObserver(([entry]) => { heroOn = entry.isIntersecting; sync() })
    if (hero) heroWatch.observe(hero)
    const coverWatch = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? inView.add(e.target) : inView.delete(e.target)))
      sync()
    })
    covers.forEach((el) => coverWatch.observe(el))

    const menu = document.querySelector('[aria-controls="mobile-nav-panel"]')
    const syncMenu = () => { menuOpen = menu?.getAttribute('aria-expanded') === 'true'; sync() }
    const menuWatch = new MutationObserver(syncMenu)
    if (menu) menuWatch.observe(menu, { attributes: true, attributeFilter: ['aria-expanded'] })

    phone.addEventListener('change', sync)
    sync()
    return () => {
      heroWatch.disconnect()
      coverWatch.disconnect()
      menuWatch.disconnect()
      phone.removeEventListener('change', sync)
    }
  }, [pathname])

  const booked = BOOKED_PATHS.includes(pathname)
  return (
    <div className={booked ? 'dock dock--one' : 'dock'} data-dock data-on={on} role="group" aria-label="Quick contact" aria-hidden={on ? undefined : true} inert={!on}>
      {booked ? (
        <a className="ld-btn ld-btn--primary" href={BOOKED_WA} target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon />
          Message us on WhatsApp
        </a>
      ) : (<>
      <a className="ld-btn ld-btn--line" href={waHref} target="_blank" rel="noopener noreferrer">
        <WhatsAppIcon />
        WhatsApp
      </a>
      <Link prefetch={false} className="ld-btn ld-btn--primary" href={quoteTargetFor(pathname, 'mobile-bar')}>
        Get my exact quote
      </Link>
      </>)}
    </div>
  )
}
