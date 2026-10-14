'use client'

import { useEffect, useRef, useState } from 'react'
import { useScrollLoop } from '@/lib/useScrollLoop'

const clamp = (v: number) => Math.min(1, Math.max(0, v))

/**
 * How it works: from 820px on a pointer device, each sticky card scales
 * 1 → 0.95 and its contents fade 1 → 0.55 as the next card slides over it
 * (OmniRated's measured values). Phones get plain stacked cards.
 */
export function StackMotion({ targetId }: { targetId: string }) {
  useScrollLoop(() => {
    const list = document.getElementById(targetId)
    if (!list) return null
    const cards = [...list.children] as HTMLElement[]
    const inners = cards.map((c) => c.querySelector<HTMLElement>('[data-inner]'))
    const wide = window.matchMedia('(min-width: 820px) and (hover: hover)')
    let p: number[] = []
    const last: string[] = []
    return {
      read() {
        if (!wide.matches) { p = cards.map(() => 0); return }
        p = cards.slice(0, -1).map((card, i) => {
          const next = cards[i + 1]
          const stick = parseFloat(getComputedStyle(next).top) || 0
          return clamp(1 - (next.getBoundingClientRect().top - stick) / card.offsetHeight)
        })
      },
      write() {
        p.forEach((v, i) => {
          const key = v.toFixed(4)
          if (last[i] === key) return
          last[i] = key
          cards[i].style.transform = v > 0 ? `scale(${(1 - 0.05 * v).toFixed(4)})` : ''
          const inner = inners[i]
          if (inner) inner.style.opacity = v > 0 ? (1 - 0.45 * v).toFixed(4) : ''
        })
      },
    }
  }, [targetId])
  return null
}

// Unlit words stay at 3.3:1 against the page (WCAG large text needs 3:1).
// OmniRated uses 0.2, which fails contrast.
const DIM = 0.5

/**
 * One paragraph lit word by word as it crosses the screen. Screen readers and
 * reduced-motion visitors get the plain sentence.
 */
export function WordReveal({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [split, setSplit] = useState(false)
  useEffect(() => { if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setSplit(true) }, [])
  useScrollLoop(() => {
    const el = ref.current
    if (!el || !split) return null
    const words = [...el.querySelectorAll<HTMLElement>('[data-w]')]
    let lit = 0
    let last = -1
    return {
      read() {
        const r = el.getBoundingClientRect()
        const vh = window.innerHeight
        lit = clamp((0.85 * vh - r.top) / (r.height + 0.35 * vh)) * words.length
      },
      write() {
        if (lit === last) return
        last = lit
        words.forEach((w, i) => { w.style.opacity = (DIM + (1 - DIM) * clamp(lit - i)).toFixed(3) })
      },
    }
  }, [split])
  if (!split) return <p ref={ref} className={className}>{text}</p>
  return (
    <p ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split(' ').map((w, i) => <span key={i} data-w style={{ opacity: DIM }}>{(i ? ' ' : '') + w}</span>)}
      </span>
    </p>
  )
}

/**
 * Fades sections in once as they enter the viewport. Content is only hidden
 * after this runs, so it is always visible without JavaScript or with reduced motion.
 */
export function RevealOnScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const els = [...document.querySelectorAll<HTMLElement>('[data-reveal]')]
    const vh = window.innerHeight
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) }
    }, { rootMargin: '0px 0px -8% 0px' })
    for (const el of els) {
      if (el.getBoundingClientRect().top < vh) continue // already on screen: leave it alone
      el.classList.add('will-reveal')
      io.observe(el)
    }
    return () => io.disconnect()
  }, [])
  return null
}

/**
 * The closing scene, as omnirated.co.uk closes (measured 14/10/2026):
 * - the heading types itself, 55ms a letter with a cursor, once 60% is on screen;
 * - the line, buttons and contact row rise in behind it, 80ms apart;
 * - the signature is written by a sweeping mask over 1.6s once 70% is on screen;
 * - the London layers settle into place as the scene reaches mid-screen.
 * Nothing is hidden until this runs, and none of it runs under reduced motion.
 */
export function CloseMotion() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const sec = document.getElementById('contact')
    const type = sec?.querySelector<HTMLElement>('[data-close-type]')
    if (!sec || !type) return
    const letters = [...type.querySelectorAll<HTMLElement>('[data-l]')]
    const after = [...sec.querySelectorAll<HTMLElement>('[data-close-after]')]
    const sig = sec.querySelector<HTMLElement>('[data-close-sig]')
    const timers: number[] = []
    type.classList.add('is-armed')
    after.forEach((el) => el.classList.add('will-reveal'))

    const typeIo = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return
      typeIo.disconnect()
      let i = 0
      const next = () => {
        if (i > 0) letters[i - 1].classList.remove('is-cursor')
        if (i === letters.length) { type.classList.add('is-done'); return }
        letters[i].classList.add('is-on', 'is-cursor')
        i += 1
        timers.push(window.setTimeout(next, i === letters.length ? 420 : 55))
      }
      next()
      after.forEach((el, n) => timers.push(window.setTimeout(() => el.classList.add('is-in'), 450 + n * 80)))
    }, { threshold: 0.6 })
    typeIo.observe(type)

    let sigIo: IntersectionObserver | undefined
    if (sig && CSS.supports('mask-image', 'linear-gradient(#000, transparent)')) {
      sig.classList.add('is-armed')
      sigIo = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        sigIo?.disconnect()
        sig.addEventListener('animationend', () => sig.classList.remove('is-armed', 'is-writing'), { once: true })
        sig.classList.add('is-writing')
      }, { threshold: 0.7 })
      sigIo.observe(sig)
    }
    return () => { typeIo.disconnect(); sigIo?.disconnect(); timers.forEach(clearTimeout) }
  }, [])

  useScrollLoop(() => {
    const land = document.querySelector<HTMLElement>('#contact .hc-land')
    if (!land) return null
    const layers = [...land.querySelectorAll<HTMLElement>('[data-rate]')].map((el) => ({ el, rate: Number(el.dataset.rate) }))
    let a = 0
    let on = false
    let last = -1
    return {
      read() {
        const r = land.getBoundingClientRect()
        const vh = window.innerHeight
        on = r.top < vh + 200 && r.bottom > -200
        a = Math.max(0, r.top + r.height / 2 - vh / 2)
      },
      write() {
        if (!on || a === last) return
        last = a
        for (const { el, rate } of layers) el.style.transform = `translate3d(0, ${(a * rate).toFixed(1)}px, 0)`
      },
    }
  }, [])
  return null
}
