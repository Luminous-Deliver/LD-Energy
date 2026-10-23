'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { jumpTo, useScrollSpy } from '@/components/inner/useScrollSpy'

export type PageSection = { id: string; label: string; heading: string }

/**
 * Area pages' On this page (Abdul 23/10: the titles should follow the reader). The numbered list in the hero marks the
 * section being read; once that list has scrolled away, a slim bar under the header names the section and opens the
 * same list. Each label is the section's H2 text; `heading` is that H2's id, which is what the spy watches and where a
 * jump lands.
 */
export function OnThisPage({ sections }: { sections: PageSection[] }) {
  const active = useScrollSpy(sections.map((s) => s.heading))
  const nav = useRef<HTMLElement>(null)
  const [past, setPast] = useState(false)
  const [open, setOpen] = useState(false)
  // past = the hero list has scrolled above the top edge; one read per frame (an observer misses a jump that carries
  // the list from below the screen to above it in one go)
  useEffect(() => {
    const el = nav.current
    if (!el) return
    let frame = 0
    const read = () => { frame = 0; setPast(el.getBoundingClientRect().bottom < 0) }
    const queue = () => { if (!frame) frame = requestAnimationFrame(read) }
    read()
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue, { passive: true })
    return () => { window.removeEventListener('scroll', queue); window.removeEventListener('resize', queue); if (frame) cancelAnimationFrame(frame) }
  }, [])
  useEffect(() => { if (!past) setOpen(false) }, [past])
  useEffect(() => {
    if (!open) return
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open])
  const cur = sections.find((s) => s.heading === active)
  const list = (onPick?: () => void) => (
    <ol>
      {sections.map((s) => {
        const on = s.heading === active
        return (
          <li key={s.id} className={on ? 'is-on' : undefined}>
            <a href={`#${s.id}`} aria-current={on ? 'location' : undefined} onClick={(e) => { jumpTo(s.heading, e); onPick?.() }}>{s.label}</a>
          </li>
        )
      })}
    </ol>
  )
  const shown = past && !!cur
  return (
    <>
      <nav ref={nav} className="in-otp" aria-label="On this page">
        <p className="in-eyebrow">On this page</p>
        {list()}
      </nav>
      <div className="in-secbar" data-on={shown ? 'true' : 'false'} aria-hidden={shown ? undefined : true}>
        <div className="in-secbar__in">
          <button type="button" className="in-secbar__btn" aria-expanded={open} aria-controls="in-secbar-list" tabIndex={shown ? 0 : -1} onClick={() => setOpen((o) => !o)}>
            <span className="in-secbar__lbl">On this page</span>
            <span className="in-secbar__cur">{cur?.label}</span>
            <ChevronDown className="in-secbar__chev" width={18} height={18} aria-hidden="true" />
          </button>
          <nav id="in-secbar-list" className="in-secbar__list" aria-label="Sections" hidden={!open}>
            {list(() => setOpen(false))}
          </nav>
        </div>
      </div>
    </>
  )
}
