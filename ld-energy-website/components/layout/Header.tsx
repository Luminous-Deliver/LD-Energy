'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { MobileNav } from './MobileNav'
import { quoteTargetFor } from '@/lib/quote-target'
import { WhatsAppIcon } from '@/components/ui/BrandIcons'

/**
 * The redesign header decided 19/10/2026: Landlords · Agents · Pricing · About + Get a quote, no dropdowns
 * ("dont waste the nav"). Areas, Guides, FAQ, Contact and the service pages are in the phone menu and in the
 * footer on every page (plan PLAN-AREAS-GUIDES-2026-10-22 "Navigation").
 */
export const headerNav = [
  { href: '/landlords', label: 'Landlords' },
  { href: '/estate-agents', label: 'Agents' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
] as const

/** Logo A, locked 21/10/2026: his traced house at full weight beside the two lines of the master lockup in live text. */
export function LogoLockup() {
  return (
    <Link prefetch={false} href="/" className="lg">
      {/* eslint-disable-next-line @next/next/no-img-element -- a 16 KB vector; next/image would add nothing */}
      <img className="lg__mark" src="/brand/ld-energy-mark-nav.svg" alt="" width={72} height={38} fetchPriority="high" />
      {/* the footer's reversed colours, his traced geometry unchanged; display:none elsewhere, so it only loads on dark */}
      {/* eslint-disable-next-line @next/next/no-img-element -- as above */}
      <img className="lg__mark lg__mark--rev" src="/brand/ld-energy-mark-nav-reversed.svg" alt="" width={72} height={38} loading="lazy" />
      <span className="lg__words">
        <span className="lg__name">L&amp;D Energy</span>
        <span className="lg__tag">EPC · Floor plans</span>
      </span>
    </Link>
  )
}

/** `waHref` is built on the server (lib/area-page.ts whatsappQuoteHref) so the borough data stays out of the client bundle. */
export function Header({ waHref }: { waHref: string }) {
  const pathname = usePathname()
  const [solid, setSolid] = useState(false)

  // The bar takes the paper ground and the hairline once the page moves; one state change per crossing.
  useEffect(() => {
    const update = () => setSolid(window.scrollY > 0)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  // the homepage's dusk hero sits under the bar: it goes light-on-dark until the page moves (data-dark)
  return (
    <header className="sh" data-solid={solid} data-dark={pathname === '/' && !solid}>
      <Container className="sh__in">
        <LogoLockup />
        <nav aria-label="Primary" className="sh__nav">
          <ul>
            {headerNav.map((link) => (
              <li key={link.href}>
                <Link prefetch={false} href={link.href} aria-current={pathname === link.href ? 'page' : undefined}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {/* WhatsApp before the phone (Abdul 22/10), prefilled with the approved wording */}
        <a className="sh__wa" href={waHref} target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon />
          WhatsApp
        </a>
        {/* Outline, not filled: each page's hero and form hold the one filled action in their view. */}
        <Link prefetch={false} className="ld-btn ld-btn--line ld-btn--sm sh__quote" href={quoteTargetFor(pathname, 'header')}>
          <span className="lbl-l">Get my exact quote</span>
          <span className="lbl-s">Get a quote</span>
        </Link>
        <MobileNav waHref={waHref} />
      </Container>
    </header>
  )
}
