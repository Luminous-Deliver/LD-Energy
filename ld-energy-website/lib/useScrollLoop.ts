'use client'

import { useEffect, type DependencyList } from 'react'

/**
 * One requestAnimationFrame loop for every scroll-linked effect on a page.
 * Each part registers a read() (layout reads only) and a write() (style writes
 * only); every frame runs all reads, then all writes, so no part forces layout
 * after another part has written. Skipped entirely under reduced motion.
 */
export interface ScrollPart { read: () => void; write: () => void }

const parts = new Set<ScrollPart>()
let queued = false
let listening = false

function tick() {
  queued = false
  parts.forEach((part) => part.read())
  parts.forEach((part) => part.write())
}

function queue() {
  if (queued) return
  queued = true
  requestAnimationFrame(tick)
}

export function useScrollLoop(make: () => ScrollPart | null, deps: DependencyList) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const part = make()
    if (!part) return
    parts.add(part)
    if (!listening) {
      listening = true
      window.addEventListener('scroll', queue, { passive: true })
      window.addEventListener('resize', queue)
    }
    queue()
    return () => { parts.delete(part) }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callers pass their own deps
  }, deps)
}
