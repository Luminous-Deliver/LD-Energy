'use client'

import { usePathname } from 'next/navigation'
import { quoteHref, quoteContextForPath } from '@/lib/quote-context'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Phone, ChevronDown } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { MobileNav } from './MobileNav'
import { topNav, servicesMenu, site } from '@/lib/site'
import { cn } from '@/lib/cn'
import { useScrollDirection } from '@/lib/useScrollDirection'

function ServicesDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Escape closes and returns focus to the trigger; Tab out closes.
  // This is a navigation disclosure containing links, not an ARIA menu, so
  // roving arrow-key focus would be the wrong pattern — Tab is correct here.
  useEffect(() => {
    if (!open) return
    const node = ref.current
    if (!node) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    function onFocusOut(e: FocusEvent) {
      if (node && !node.contains(e.relatedTarget as Node)) setOpen(false)
    }
    node.addEventListener('keydown', onKeyDown)
    node.addEventListener('focusout', onFocusOut)
    return () => {
      node.removeEventListener('keydown', onKeyDown)
      node.removeEventListener('focusout', onFocusOut)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="services-menu"
        className="inline-flex min-h-[44px] items-center gap-1 text-sm font-medium text-secondary-700 hover:text-primary-700 transition-colors"
      >
        Services
        <ChevronDown
          className={`w-3.5 h-3.5 text-secondary-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/*
        Rendered unconditionally and hidden with `visibility`, not unmounted.
        Previously `{open && …}` meant the Services destinations existed only
        after a click, so /landlords, /sellers, /estate-agents,
        /services/floor-plans and /domestic-energy-assessor-london had no
        crawlable link in the server-rendered header at all.

        `invisible` (visibility: hidden) is the right hiding mechanism here: it
        keeps the anchors in the HTML for crawlers while removing them from the
        tab order and the accessibility tree, so keyboard and screen-reader
        behaviour is unchanged. Interaction is identical.
      */}
      <div
        id="services-menu"
        className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 rounded-2xl bg-white shadow-premium-lg ring-1 ring-secondary-900/5 overflow-hidden z-50 transition-opacity duration-150 ${
          open ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <div>
          {/* Arrow pointer */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 ring-1 ring-secondary-900/5" aria-hidden="true" />
          <div className="py-2">
            {servicesMenu.map((group, gi) => (
              <div key={group.heading}>
                {gi > 0 && <div className="my-1 border-t border-secondary-100" aria-hidden="true" />}
                <p className="px-4 pt-2 pb-1 text-xs font-bold uppercase tracking-widest text-secondary-600">
                  {group.heading}
                </p>
                <ul>
                  {group.links.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="flex flex-col px-4 py-2.5 hover:bg-primary-50 transition-colors group"
                      >
                        <span className="text-sm font-semibold text-secondary-900 group-hover:text-primary-700">{item.label}</span>
                        <span className="text-xs text-secondary-500 mt-0.5">{item.desc}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Header() {
  const pathname = usePathname()
  const hidden = useScrollDirection()
  return (
    // Floating island nav: a self-contained pill, not a full-width bar, so it
    // always reads clearly regardless of what's behind it (a photo, the brand
    // pattern, a dark hero) with no scroll-triggered colour flip needed.
    <header
      className={cn(
        'sticky top-0 z-40 pt-3 md:pt-4 transition-transform duration-300 will-change-transform',
        hidden ? '-translate-y-[150%] lg:translate-y-0' : 'translate-y-0',
      )}
    >
      <Container as="div">
        {/* overflow-hidden: a rounded pill has nothing behind it to catch
            overflow the way a full-width bar did -- anything that doesn't
            fit spills visibly onto the hero/page background around it
            instead of just extending an edge-to-edge white strip. The
            lg-everything breakpoints below are the real fix (nothing tries
            to cram in past its available width); this is the safety net. */}
        <div className="flex items-center justify-between gap-3 overflow-hidden rounded-full bg-white/90 ring-1 ring-secondary-900/5 shadow-premium-lg backdrop-blur-md px-4 py-2.5 md:px-5">
          <Logo size="sm" />

          <nav aria-label="Primary" className="hidden lg:flex items-center gap-6">
            <ServicesDropdown />
            {topNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-[44px] items-center text-sm font-medium text-secondary-700 hover:text-primary-700 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 lg:gap-3">
            {/* Phone + CTA now appear at the same breakpoint as the nav
                links (lg), not earlier (md) -- showing them together with
                the hamburger trigger (which stays visible until lg) was
                cramming four elements into one row with nothing giving way. */}
            <a
              href={site.phoneHref}
              className="hidden lg:inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-secondary-800 hover:text-primary-700 transition-colors"
              aria-label={`Call ${site.phone}`}
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              {site.phone}
            </a>
            <Button
              href={pathname === '/contact' ? '#booking-form' : quoteHref(quoteContextForPath(pathname))}
              variant="accent"
              className="hidden lg:inline-flex rounded-full px-5 py-2.5 min-h-0"
              size="md"
            >
              Get my exact quote
            </Button>
            <MobileNav />
          </div>
        </div>
      </Container>
    </header>
  )
}
