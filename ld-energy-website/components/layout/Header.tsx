'use client'

import { usePathname } from 'next/navigation'
import { quoteHref, quoteContextForPath, areaPageForPath } from '@/lib/quote-context'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Phone, ChevronDown } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { MobileNav } from './MobileNav'
import { topNav, servicesMenu, site } from '@/lib/site'
import { cn } from '@/lib/cn'
import { useNavStage } from '@/lib/useScrollDirection'

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
        after a click, so /landlords, /sellers, /estate-agents and the service
        pages had no crawlable link in the server-rendered header at all.

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
                        prefetch={false}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="flex flex-col px-4 py-2.5 hover:bg-primary-50 transition-colors group"
                      >
                        <span className="text-sm font-semibold text-secondary-900 group-hover:text-primary-700">{item.label}</span>
                        <span className="text-sm text-secondary-600 mt-0.5">{item.desc}</span>
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

// Draft A v3's reading line: 3px of EPC bands, G to A, filling as the page
// scrolls. It sits outside the header so it stays when the nav leaves.
// Written straight to the style each frame, so scrolling never re-renders.
function ScrollProgress() {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    let ticking = false
    const update = () => {
      const el = ref.current
      if (el) {
        const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
        el.style.transform = `scaleX(${Math.min(Math.max(window.scrollY / max, 0), 1).toFixed(4)})`
      }
      ticking = false
    }
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update)
        ticking = true
      }
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return (
    <span
      ref={ref}
      data-scroll-progress
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] origin-left scale-x-0 will-change-transform"
      style={{ background: 'linear-gradient(90deg,#E9153B 0 14.28%,#EF8023 0 28.57%,#FCAA65 0 42.85%,#FFD500 0 57.14%,#8DCE46 0 71.42%,#19B459 0 85.71%,#008054 0)' }}
    />
  )
}

export function Header() {
  const pathname = usePathname()
  const stage = useNavStage()
  // The look only changes while the nav is out of sight, so the bar never
  // morphs into the pill on screen: it leaves as a bar, returns as a pill.
  const [look, setLook] = useState<'bar' | 'pill'>('bar')
  useEffect(() => { if (stage !== 'away') setLook(stage === 'pill' ? 'pill' : 'bar') }, [stage])
  const pill = look === 'pill'
  return (
    // OmniRated's nav (measured 15/10/2026). At the top: a plain bar that sits
    // in the hero, no box. Scrolling down, it leaves. Past the hero's buttons a
    // small frosted pill drops in (14px down, 48px tall, transform .56s). The
    // spacer keeps the header's old 80px in the flow for every page below it.
    <div className="h-[76px] md:h-[80px]">
      <ScrollProgress />
      <header
        data-nav={stage}
        className={cn(
          'fixed inset-x-0 top-0 z-40 transition-[transform,opacity] duration-[560ms] ease-[cubic-bezier(.23,1,.32,1)] motion-reduce:transition-none',
          'focus-within:translate-y-0 focus-within:opacity-100',
          stage === 'away' ? '-translate-y-[130%] opacity-0' : 'translate-y-0 opacity-100',
        )}
      >
        <Container as="div">
          {/* Keep navigation disclosures and enlarged text outside the rounded background unclipped. */}
          <div
            data-look={look}
            className={cn(
              'mx-auto flex items-center justify-between',
              pill
                ? 'mt-[14px] h-12 w-full gap-3 rounded-full bg-white/75 pl-4 pr-1.5 ring-1 ring-secondary-900/5 backdrop-blur-[16px] backdrop-saturate-[1.3] shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_10px_30px_-12px_rgba(13,27,51,.28)] lg:w-fit lg:gap-6'
                : 'gap-3 pt-3 pb-1 md:pt-4',
            )}
          >
            <span className={cn('inline-flex origin-left', pill && 'scale-[.84]')}>
              <Logo size="sm" priority />
            </span>

            <nav aria-label="Primary" className={cn('hidden lg:flex items-center', pill ? 'gap-5' : 'gap-6')}>
              <ServicesDropdown />
              {topNav.map((link) => (
                <Link
                  prefetch={false}
                  key={link.href}
                  href={link.href}
                  className={cn('inline-flex items-center font-medium text-secondary-700 hover:text-primary-700 transition-colors', pill ? 'min-h-[40px] text-[15px]' : 'min-h-[44px] text-sm')}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 lg:gap-3">
              {/* Phone + CTA appear at lg with the nav links. The pill keeps
                  OmniRated's three-part shape, so the phone stays in the bar. */}
              {!pill && (
                <a
                  href={site.phoneHref}
                  className="hidden lg:inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-secondary-800 hover:text-primary-700 transition-colors"
                  aria-label={`Call ${site.phone}`}
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  {site.phone}
                </a>
              )}
              <Button
                href={pathname === '/contact' ? '#booking-form' : quoteHref({ ...quoteContextForPath(pathname), areaPage: areaPageForPath(pathname), ctaId: 'header' })}
                variant="accent"
                className={cn('hidden lg:inline-flex rounded-full min-h-0', pill ? 'px-4 py-2 text-[14px]' : 'px-5 py-2.5')}
                size="md"
              >
                Get my exact quote
              </Button>
              <MobileNav />
            </div>
          </div>
        </Container>
      </header>
    </div>
  )
}
