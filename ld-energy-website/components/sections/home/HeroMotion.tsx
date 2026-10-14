'use client'

import { useScrollLoop } from '@/lib/useScrollLoop'

/**
 * Hero depth: the city drifts at 0.31 of scroll (OmniRated's far-plane rate,
 * measured 14/10/2026) while the river moves with the page, so the city sinks
 * behind the water. Over the first 640px of scroll the dusk layer deepens to
 * its full opacity. Renders nothing; it only drives [data-rate] and .lh-dusk.
 */
export function HeroMotion() {
  useScrollLoop(() => {
    const hero = document.getElementById('home-hero')
    if (!hero) return null
    const layers = [...hero.querySelectorAll<HTMLElement>('[data-rate]')].map((el) => ({ el, rate: Number(el.dataset.rate) }))
    const dusk = hero.querySelector<HTMLElement>('.lh-dusk')
    let y = 0
    let visible = true
    let last = -1
    return {
      read() { y = window.scrollY; visible = hero.getBoundingClientRect().bottom > 0 },
      write() {
        if (!visible || y === last) return
        last = y
        for (const { el, rate } of layers) el.style.transform = rate ? `translate3d(0, ${(y * rate).toFixed(1)}px, 0)` : ''
        if (dusk) dusk.style.opacity = Math.min(1, y / 640).toFixed(3)
      },
    }
  }, [])
  return null
}
