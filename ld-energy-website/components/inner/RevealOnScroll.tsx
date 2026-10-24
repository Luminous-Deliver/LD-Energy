'use client'

import { useEffect } from 'react'

/**
 * Section reveals on inner pages (motion proposal 24/10/2026, Considered, §2.1): below-the-fold blocks marked
 * `data-reveal` fade in and rise 12 px once, as they come on screen; children of a `data-reveal="list"` stagger 60 ms,
 * capped at 4 steps. The look is all CSS (app/inner.css); this only decides when. Returns null, like HomeV7Motion.
 *
 * Nothing is ever hidden unless this runs: the hidden state only applies under html[data-motion="on"], set here after
 * everything already on screen or above it has been marked done. Reduced motion, no JavaScript, print and find-in-page
 * all see every block. A jump (an in-page link, a hash change, or a scroll that carries a block from below the screen to
 * above it) never lands beside hidden sections.
 *
 * `blocks` and `lists` mark parts rendered by shared components (Read next, the ending) by selector, so the page
 * only passes a list and those components stay untouched.
 */
export function RevealOnScroll({ blocks = [], lists = [] }: { blocks?: string[]; lists?: string[] }) {
  const key = [...blocks, '|', ...lists].join(',')
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (typeof IntersectionObserver !== 'function') return
    const root = document.documentElement
    for (const sel of blocks) document.querySelectorAll(sel).forEach((el) => { if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', '') })
    for (const sel of lists) document.querySelectorAll(sel).forEach((el) => el.setAttribute('data-reveal', 'list'))
    const all = () => Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])'))
    const done = (el: Element) => { el.setAttribute('data-revealed', 'done'); io.unobserve(el) }

    // the root reaches far above the screen, so a block that a jump carries from below to above still reports in
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting || e.target.hasAttribute('data-revealed')) continue
        if (e.boundingClientRect.bottom <= 0) { done(e.target); continue }
        e.target.setAttribute('data-revealed', 'in')
        io.unobserve(e.target)
      }
    }, { rootMargin: '100000px 0px -10% 0px', threshold: 0 })

    // everything that will be on screen when a jump to `target` lands, or above it, shows at once
    const settleAbove = (target: Element | null) => {
      if (!target) return
      const line = target.getBoundingClientRect().top + window.innerHeight
      for (const el of all()) if (el.getBoundingClientRect().top < line) done(el)
    }
    const byHash = (hash: string) => {
      if (hash.length < 2) return null
      try { return document.getElementById(decodeURIComponent(hash.slice(1))) } catch { return null }
    }
    const onClick = (event: MouseEvent) => {
      const a = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href*="#"]') : null
      if (!a || a.origin !== location.origin || a.pathname !== location.pathname) return
      const target = byHash(a.hash)
      // On this page jumps to the section's heading (useScrollSpy jumpTo); the link names the section
      settleAbove(target?.querySelector('h2[id]') ?? target)
    }
    const onHash = () => settleAbove(byHash(location.hash))

    // 1. on screen now, or above it: done, no animation
    const fold = window.innerHeight
    for (const el of all()) if (el.getBoundingClientRect().top < fold) el.setAttribute('data-revealed', 'done')
    settleAbove(byHash(location.hash))
    // 2. only now may anything be hidden; 3. the rest waits for the observer
    root.setAttribute('data-motion', 'on')
    for (const el of all()) io.observe(el)
    document.addEventListener('click', onClick, true)
    window.addEventListener('hashchange', onHash)
    return () => {
      io.disconnect()
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('hashchange', onHash)
      root.removeAttribute('data-motion')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- selectors are compared by value through `key`
  }, [key])
  return null
}
