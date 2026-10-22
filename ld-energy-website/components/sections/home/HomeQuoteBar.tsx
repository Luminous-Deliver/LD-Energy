'use client'

import { useEffect, useState } from 'react'

/**
 * The prototype's phone quote bar (v7.2): "EPC from £65 · Ready within 72 hours · Get a quote", fixed at the bottom of
 * phone screens. On the homepage it stands in for the shared dock. It shows once the page has moved and only while no
 * other quote button, service button or the form is on screen; hidden, it is inert.
 */
export function HomeQuoteBar({ epcFrom }: { epcFrom: number }) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const phone = window.matchMedia('(max-width: 759px)')
    const watched = Array.from(document.querySelectorAll('#hero-quote, #close-quote, #pricing form, #pricing .bf__sent, [data-pick]'))
    const seen = new Set<Element>()
    const sync = () => setOn(phone.matches && seen.size === 0 && window.scrollY > 200)
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)))
      sync()
    })
    watched.forEach((el) => io.observe(el))
    window.addEventListener('scroll', sync, { passive: true })
    phone.addEventListener('change', sync)
    sync()
    return () => { io.disconnect(); window.removeEventListener('scroll', sync); phone.removeEventListener('change', sync) }
  }, [])
  return (
    <div className="hp-quotebar" data-quotebar data-on={on} aria-hidden={on ? undefined : true} inert={!on}>
      <p><b>EPC from £{epcFrom}</b>Ready within 72 hours</p>
      <a className="btn btn-primary" href="#prices">Get a quote</a>
    </div>
  )
}
