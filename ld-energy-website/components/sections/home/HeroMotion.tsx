'use client'

import { useScrollLoop } from '@/lib/useScrollLoop'

/**
 * Hero depth: the far skyline drifts at 0.31 of scroll and the mid trees at
 * 0.17 (rates measured on omnirated.co.uk, 14/10/2026); the near hedge moves
 * with the page in front of the quote card, so the ground rises over it.
 * Renders nothing; it only drives the layers marked data-rate.
 */
export function HeroMotion() {
  useScrollLoop(() => {
    const hero = document.getElementById('home-hero')
    if (!hero) return null
    const layers = [...hero.querySelectorAll<HTMLElement>('[data-rate]')].map((el) => ({ el, rate: Number(el.dataset.rate) }))
    let y = 0
    let visible = true
    let last = -1
    return {
      read() { y = window.scrollY; visible = hero.getBoundingClientRect().bottom > 0 },
      write() {
        if (!visible || y === last) return
        last = y
        for (const { el, rate } of layers) el.style.transform = rate ? `translate3d(0, ${(y * rate).toFixed(1)}px, 0)` : ''
      },
    }
  }, [])
  return null
}
