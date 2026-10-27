'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { MobileNav } from './MobileNav'
import { quoteTargetFor } from '@/lib/quote-target'
import { MenuIcon, WhatsAppIcon } from '@/components/ui/BrandIcons'

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

/** Logo A, locked 21/10/2026: his traced house at full weight beside the two lines of the master lockup in live text.
 *  Wordmark option 2 (Abdul 23/10/2026): L&D Bold 700, ENERGY Regular 400. */
export function LogoLockup() {
  return (
    <Link prefetch={false} href="/" className="lg">
      {/* eslint-disable-next-line @next/next/no-img-element -- a 16 KB vector; next/image would add nothing */}
      <img className="lg__mark" src="/brand/ld-energy-mark-nav.svg" alt="" width={72} height={38} fetchPriority="high" />
      {/* the footer's reversed colours, his traced geometry unchanged; display:none elsewhere, so it only loads on dark */}
      {/* eslint-disable-next-line @next/next/no-img-element -- as above */}
      <img className="lg__mark lg__mark--rev" src="/brand/ld-energy-mark-nav-reversed.svg" alt="" width={72} height={38} loading="lazy" />
      <span className="lg__words">
        <span className="lg__name"><b>L&amp;D</b> Energy</span>
        <span className="lg__tag">EPC · Floor plans</span>
      </span>
    </Link>
  )
}

/** `waHref` is built on the server (lib/area-page.ts whatsappQuoteHref) so the borough data stays out of the client bundle. */
export function Header({ waHref }: { waHref: string }) {
  const pathname = usePathname()
  const [solid, setSolid] = useState(false)
  const [pill, setPill] = useState(false)
  const line = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)

  // The bar takes the paper ground and the hairline once the page moves, and the pill arrives once the reader is
  // about half a screen in (nateherk.com docks when the hero is 62% gone); one state change per crossing. The line
  // is written straight to the element, once per frame, so scrolling never re-renders the header.
  // Phones too since 24/10 (Abdul: "yes", beside nateherk.com on a phone): the bar scrolls away and a compact pill
  // docks, replacing the morning's hide-on-scroll bar.
  useEffect(() => {
    let raf = 0
    const paint = () => {
      raf = 0
      const y = window.scrollY, room = document.documentElement.scrollHeight - window.innerHeight
      setSolid(y > 0)
      setPill(y > window.innerHeight * 0.45)
      const k = room > 0 ? Math.min(1, y / room) : 0
      if (line.current) line.current.style.transform = `scaleX(${k})`
      track.current?.setAttribute('data-on', String(y > 0))
    }
    const update = () => { if (!raf) raf = requestAnimationFrame(paint) }
    paint()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [])

  // pinned things on phones (the On this page bar, a guide's contents) sit under the pill while it is docked
  useEffect(() => { document.documentElement.dataset.head = pill ? 'pill' : 'none' }, [pill])

  const quoteHref = quoteTargetFor(pathname, 'header')

  // the homepage's dusk hero sits under the bar: it goes light-on-dark until the page moves (data-dark)
  return (
    <>
    {/* Abdul 23/10/2026: "too subtle", make it like the How it works line: a visible track, a solid fill (the marker went 24/10) */}
    <div ref={track} className="sline-track" data-on="false" aria-hidden="true" />
    <div ref={line} className="sline" aria-hidden="true" />
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
        <Link prefetch={false} className="ld-btn ld-btn--line ld-btn--sm sh__quote" href={quoteHref}>
          <span className="lbl-l">Get my exact quote</span>
          <span className="lbl-s">Get a quote</span>
        </Link>
        <MobileNav waHref={waHref} />
      </Container>
    </header>
    {/* the scroll pill (shared-parts.css): hidden, it is out of the tab order and the accessibility tree. On phones it
        carries the mark, Landlords, Pricing and the menu; the dock keeps the quote button */}
    <nav aria-label="Primary, compact" className="pill" data-on={pill}>
      <Link prefetch={false} href="/" className="pill__home" aria-label="L&D Energy home">
        {/* eslint-disable-next-line @next/next/no-img-element -- the header's own mark, already loaded */}
        <img src="/brand/ld-energy-mark-nav.svg" alt="" width={45} height={24} />
        <span><b>L&amp;D</b> Energy</span>
      </Link>
      <ul>
        {headerNav.map((link) => (
          <li key={link.href} data-phone={link.href === '/landlords' || link.href === '/pricing' || undefined}>
            <Link prefetch={false} href={link.href} aria-current={pathname === link.href ? 'page' : undefined}>{link.label}</Link>
          </li>
        ))}
      </ul>
      <Link prefetch={false} className="ld-btn ld-btn--primary" href={quoteHref}>Get a quote</Link>
      <button type="button" className="pill__menu" aria-label="Open menu" aria-controls="mobile-nav-panel"
        onClick={(e) => window.dispatchEvent(new CustomEvent('mnav:open', { detail: e.currentTarget }))}>
        <MenuIcon />
      </button>
    </nav>
    </>
  )
}
