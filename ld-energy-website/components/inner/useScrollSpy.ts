'use client'

import { useEffect, useState } from 'react'

/**
 * The id of the section being read: the last of `ids` whose heading has reached the place a jump to it lands (its own
 * scroll-margin-top, a few px of slack). Abdul 23/10: "On this page" titles should follow the reader.
 * One passive scroll listener, at most one read per animation frame and a state write only when the section changes;
 * an IntersectionObserver alone misses instant jumps that land without crossing its edges.
 */
export function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState<string | null>(null)
  const key = ids.join('|')
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el)
    if (!els.length) return
    let lines: number[] = []
    const measure = () => { lines = els.map((el) => (parseFloat(getComputedStyle(el).scrollMarginTop) || 0) + 8) }
    let frame = 0
    const pick = () => {
      frame = 0
      let cur: string | null = null
      els.forEach((el, i) => { if (el.getBoundingClientRect().top <= lines[i]) cur = el.id })
      setActive((prev) => (prev === cur ? prev : cur))
    }
    const queue = () => { if (!frame) frame = requestAnimationFrame(pick) }
    const resize = () => { measure(); queue() }
    measure()
    pick()
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', resize, { passive: true })
    return () => {
      window.removeEventListener('scroll', queue)
      window.removeEventListener('resize', resize)
      if (frame) cancelAnimationFrame(frame)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ids are compared by value through `key`
  }, [key])
  return active
}

/** Smooth only when the reader allows motion; the target's scroll-margin keeps it clear of the sticky header. */
export function jumpTo(id: string, e?: { preventDefault: () => void }) {
  const el = document.getElementById(id)
  if (!el) return
  e?.preventDefault()
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  history.replaceState(null, '', `#${id}`)
}
