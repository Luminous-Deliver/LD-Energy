'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { Menu, X, Phone, MessageCircle } from 'lucide-react'
import { servicesMenu, topNav, site } from '@/lib/site'
import { cn } from '@/lib/cn'

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden inline-flex items-center justify-center w-12 h-12 rounded-md text-secondary-800 hover:bg-secondary-100"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
      >
        <Menu className="w-6 h-6" aria-hidden="true" />
      </button>

      {mounted && createPortal(
        <div
          className={cn('fixed inset-0 z-50 lg:hidden', !open && 'pointer-events-none')}
          aria-hidden={open ? undefined : true}
          inert={!open}
        >
        {/* Backdrop */}
        <div
          className={cn(
            'absolute inset-0 bg-secondary-900/60 transition-opacity duration-200',
            open ? 'opacity-100' : 'opacity-0',
          )}
          onClick={close}
          aria-hidden="true"
        />

        {/* Panel */}
        <div
          id="mobile-nav-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          style={{ backgroundColor: '#ffffff' }}
          className={cn(
            'absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-200',
            open ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-14 border-b border-secondary-100 shrink-0 bg-white">
            <span className="font-display font-bold text-secondary-900">{site.name}</span>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              className="inline-flex items-center justify-center w-12 h-12 rounded-md text-secondary-500 hover:bg-secondary-100"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>



          {/* Nav */}
          <nav aria-label="Mobile" className="flex-1 min-h-0 overflow-y-auto px-3 py-2 bg-white">
            {servicesMenu.map((group) => (
              <div key={group.heading}>
                <p className="px-3 pt-3 pb-1 text-xs font-bold uppercase tracking-widest text-secondary-600">
                  {group.heading}
                </p>
                <ul className="flex flex-col mb-1">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={close}
                        tabIndex={open ? undefined : -1}
                        className="flex min-h-[44px] flex-col justify-center w-full px-3 py-2.5 rounded-lg hover:bg-primary-50 transition-colors group"
                      >
                        <span className="text-[15px] font-semibold text-secondary-800 group-hover:text-primary-700">{link.label}</span>
                        <span className="text-xs text-secondary-600">{link.desc}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="my-2 border-t border-secondary-100" />

            {/* Other links */}
            <ul className="flex flex-col">
              {[...topNav, { href: '/about', label: 'About' }].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={close}
                    tabIndex={open ? undefined : -1}
                    className="flex min-h-[44px] items-center w-full px-3 py-2.5 rounded-lg text-[15px] font-semibold text-secondary-800 hover:bg-secondary-50 hover:text-primary-700 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact + CTA Footer */}
          <div className="shrink-0 border-t border-secondary-100 bg-secondary-50/50 p-4 flex flex-col gap-3">
            <Link
              href="/contact"
              onClick={close}
              tabIndex={open ? undefined : -1}
              className="flex items-center justify-center w-full bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-bold px-4 py-3.5 rounded-xl shadow-md text-[15px]"
            >
              Book an EPC
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={site.phoneHref}
                tabIndex={open ? undefined : -1}
                className="flex min-h-[44px] items-center justify-center gap-1.5 bg-white border border-secondary-200 hover:bg-secondary-100 text-secondary-800 text-sm font-semibold px-3 py-2.5 rounded-lg transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
                Call Us
              </a>
              <a
                href={site.whatsappHref}
                tabIndex={open ? undefined : -1}
                className="flex min-h-[44px] items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-semibold px-3 py-2.5 rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>, document.body)}
    </>
  )
}
