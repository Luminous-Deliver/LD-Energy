'use client'

import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react'
import { X } from 'lucide-react'
import { site } from '@/lib/site'
import { parseQuoteContext, QUOTE_PATH, type QuoteContext } from '@/lib/quote-context'
import { conversionEvent } from '@/lib/conversion-events'
import '@/app/quote-dialog.css'

type Body = ComponentType<{ context: QuoteContext }>
let bodyModule: Promise<Body> | null = null
/** The form's code, fetched once: on first hover, focus or touch of a quote link, or on the first click. */
function loadBody(): Promise<Body> {
  bodyModule ??= import('./QuoteDialogBody').then((m) => m.default).catch((error) => { bodyModule = null; throw error })
  return bodyModule
}

/** A same-origin link into the quote journey, from an ordinary click this dialog may take over. */
function quoteLinkFrom(event: Event): { anchor: HTMLAnchorElement; url: URL } | null {
  const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null
  if (!anchor || anchor.closest('dialog') || anchor.hasAttribute('download')) return null
  if (anchor.target && anchor.target !== '_self') return null
  let url: URL
  try { url = new URL(anchor.href, window.location.href) } catch { return null }
  if (url.origin !== window.location.origin || url.pathname !== QUOTE_PATH) return null
  return { anchor, url }
}

/**
 * The quote dialog (Abdul 23/10/2026): "some buttons should have pop up like hompage hero section quote button so then
 * they can cross it off and coninue to scroll and maybe /quote as a back up for if popup is blocked". Every quote CTA
 * is an ordinary link to /quote; with JavaScript running, a plain left click opens this dialog over the page with the
 * same form, started from that link's choices. Anything else (a modifier key, a new tab, no <dialog> support, the
 * form failing to load) leaves the link to do its job. Mounted once in the root layout.
 */
export function QuoteDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const trigger = useRef<HTMLElement | null>(null)
  const pressedOnBackdrop = useRef(false)
  const [Body, setBody] = useState<Body | null>(null)
  // the form stays mounted between opens of the same link, so closing it never loses what was typed
  const [current, setCurrent] = useState<{ href: string; context: QuoteContext } | null>(null)

  const close = useCallback(() => dialogRef.current?.close(), [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || typeof dialog.showModal !== 'function') return

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      if (window.location.pathname === QUOTE_PATH || dialog.open) return
      const link = quoteLinkFrom(event)
      if (!link) return
      // taken over before next/link sees the click (it skips a click whose default was prevented)
      event.preventDefault()
      const href = link.url.pathname + link.url.search
      try {
        const context = parseQuoteContext(link.url.searchParams)
        trigger.current = link.anchor
        setCurrent((previous) => (previous?.href === href ? previous : { href, context }))
        // no layout shift: the scrollbar's width stays as padding while the page is locked
        const gap = window.innerWidth - document.documentElement.clientWidth
        document.documentElement.classList.add('qd-locked')
        if (gap > 0) document.documentElement.style.setProperty('--qd-gap', `${gap}px`)
        dialog.showModal()
        titleRef.current?.focus({ preventScroll: true })
        conversionEvent('quote_dialog_open', context)
        loadBody().then((loaded) => setBody(() => loaded)).catch(() => { dialog.close(); window.location.assign(href) })
      } catch {
        // the backup Abdul asked for: the page itself
        window.location.assign(href)
      }
    }
    const warm = (event: Event) => { if (quoteLinkFrom(event)) void loadBody().catch(() => {}) }
    const onClose = () => {
      document.documentElement.classList.remove('qd-locked')
      document.documentElement.style.removeProperty('--qd-gap')
      const back = trigger.current
      trigger.current = null
      if (back?.isConnected) back.focus({ preventScroll: true })
    }

    document.addEventListener('click', onClick, true)
    document.addEventListener('pointerover', warm, { passive: true })
    document.addEventListener('focusin', warm)
    document.addEventListener('touchstart', warm, { passive: true })
    dialog.addEventListener('close', onClose)
    return () => {
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('pointerover', warm)
      document.removeEventListener('focusin', warm)
      document.removeEventListener('touchstart', warm)
      dialog.removeEventListener('close', onClose)
      onClose()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className="qd"
      aria-labelledby="qd-title"
      // a press that starts and ends on the backdrop closes it; dragging out of a field does not
      onPointerDown={(event) => { pressedOnBackdrop.current = event.target === event.currentTarget }}
      onClick={(event) => { if (pressedOnBackdrop.current && event.target === event.currentTarget) close(); pressedOnBackdrop.current = false }}
    >
      <div className="qd__bar" data-dialog-bar>
        <div className="qd__head">
          <p className="qd__eyebrow">L&amp;D Energy · Quote</p>
          <h2 id="qd-title" ref={titleRef} tabIndex={-1} className="qd__title">Get your exact quote</h2>
        </div>
        <button type="button" className="qd__x" aria-label="Close the quote" onClick={close}>
          <X aria-hidden="true" width={22} height={22} />
        </button>
      </div>
      <div className="qd__body">
        <p className="qd__by">
          {site.assessor.name}, Elmhurst and Quidos accredited.{' '}
          <a href={site.assessor.verifyUrl} target="_blank" rel="noopener noreferrer">Check the GOV.UK register</a>
        </p>
        {current && (Body
          ? <Body key={current.href} context={current.context} />
          : <p className="qd__loading" role="status">Loading the quote form…</p>)}
        {current && <p className="qd__page"><a href={current.href}>Open the quote as a full page</a></p>}
      </div>
    </dialog>
  )
}
