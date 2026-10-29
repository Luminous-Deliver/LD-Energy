'use client'

import { useEffect, useRef } from 'react'

/** Sets data-in="true" the first time the element scrolls into view; CSS runs the animation from that. */
export function Reveal({ className, children, hidden }: { className?: string; children: React.ReactNode; hidden?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.dataset.in = 'true'; io.disconnect() }
    }, { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <div ref={ref} className={className} aria-hidden={hidden || undefined}>{children}</div>
}
