'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { servicesMenu, topNav, site } from '@/lib/site'
import { quoteTargetFor } from '@/lib/quote-target'
import { WhatsAppIcon, PhoneIcon, MenuIcon, CloseIcon } from '@/components/ui/BrandIcons'

/**
 * The phone menu (below 760 px, where the bar has no links). It keeps every destination the old header had:
 * the services and audiences, Areas, Pricing, FAQ, Guides, Contact and About. A modal dialog: focus moves to
 * Close, Tab is trapped, Escape and the scrim close it, and focus returns to the menu button.
 */
export function MobileNav({ waHref }: { waHref: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // A resize past the breakpoint must not leave an invisible modal focus trap active.
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 760px)')
    const closeOnWide = () => { if (wide.matches) setOpen(false) }
    wide.addEventListener('change', closeOnWide)
    return () => wide.removeEventListener('change', closeOnWide)
  }, [])

  // Scroll lock
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  // Escape to close
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus() }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  // Focus close button on open
  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  // Focus trap
  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    if (!panel) return
    const focusable = panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    panel.addEventListener('keydown', trap)
    return () => panel.removeEventListener('keydown', trap)
  }, [open])

  function close() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  const tab = open ? undefined : -1
  const other = [...topNav, { href: '/about', label: 'About' }]

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="sh__menu"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
      >
        <MenuIcon />
      </button>

      {mounted && createPortal(
        <div className="mnav" data-open={open} aria-hidden={open ? undefined : true} inert={!open}>
          <div className="mnav__scrim" onClick={close} aria-hidden="true" />
          <div id="mobile-nav-panel" ref={panelRef} role="dialog" aria-modal="true" aria-label="Navigation menu" className="mnav__panel">
            <div className="mnav__top">
              <span className="lg__name">{site.name}</span>
              <button ref={closeRef} type="button" onClick={close} className="sh__menu" style={{ display: 'inline-flex' }} aria-label="Close menu">
                <CloseIcon />
              </button>
            </div>

            <nav aria-label="Mobile">
              {servicesMenu.map((group) => (
                <div key={group.heading} className="mnav__group">
                  <p className="mnav__h">{group.heading}</p>
                  <ul>
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link prefetch={false} href={link.href} onClick={close} tabIndex={tab}>
                          <span>{link.label}</span>
                          <span>{link.desc}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="mnav__group">
                <ul>
                  {other.map((link) => (
                    <li key={link.href}>
                      <Link prefetch={false} href={link.href} onClick={close} tabIndex={tab}>
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            <div className="mnav__foot">
              <Link prefetch={false} href={quoteTargetFor(pathname, 'mobile-menu')} onClick={close} tabIndex={tab} className="ld-btn ld-btn--primary">
                Get my exact quote
              </Link>
              {/* WhatsApp before the phone (Abdul 22/10) */}
              <div className="pair">
                <a href={waHref} target="_blank" rel="noopener noreferrer" tabIndex={tab} className="ld-btn ld-btn--line">
                  <WhatsAppIcon />
                  WhatsApp
                </a>
                <a href={site.phoneHref} tabIndex={tab} className="ld-btn ld-btn--line">
                  <PhoneIcon />
                  Call
                </a>
              </div>
            </div>
          </div>
        </div>, document.body)}
    </>
  )
}
