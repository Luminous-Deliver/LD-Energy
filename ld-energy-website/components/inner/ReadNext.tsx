import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Ico } from '@/components/sections/home/HomeIcon'
import { guideImages } from '@/lib/guide-images'
import '@/app/inner.css'

/**
 * Read next, as Abdul picked it on the inner-page options board (23/10/2026, corrected the same day): option A's image
 * cards (picture, topic label, title, one line, reading time), then option C's last card only, the ready-to-book
 * quote card (`go`), with no picture. Used by area pages and guides.
 */
export type NextStep = { kicker?: string; title: string; text: string; href: string; img?: string; meta?: string; go?: boolean; cta?: string }

function linkLabel(s: NextStep): string {
  if (s.cta) return s.cta
  if (s.meta) return s.meta
  if (s.href.startsWith('/blog')) return 'Read the guide'
  if (s.href.startsWith('/epc-ratings-by-borough')) return 'See the figures'
  return 'Find out more'
}

function Card({ s }: { s: NextStep }) {
  if (s.go) {
    return (
      <>
        <span className="in-ncard__b">
          {s.kicker && <span className="in-ncard__k">{s.kicker}</span>}
          <b>{s.title}</b>
          <span className="in-ncard__t">{s.text}</span>
          <span className="in-ncard__l">{s.cta ?? 'Get my exact quote'} <Ico name="arrow-right" size={18} /></span>
        </span>
      </>
    )
  }
  return (
    <>
      {s.img && (
        <span className="in-ncard__img">
          {/* eslint-disable-next-line @next/next/no-img-element -- small decorative SVG/WebP; next/image is unoptimised on Pages */}
          <img src={s.img} alt="" width={640} height={360} loading="lazy" decoding="async" />
        </span>
      )}
      <span className="in-ncard__b">
        {s.kicker && <span className="in-ncard__k">{s.kicker}</span>}
        <b>{s.title}</b>
        <span className="in-ncard__t">{s.text}</span>
        <span className="in-ncard__l">{linkLabel(s)} <Ico name="arrow-right" size={18} /></span>
      </span>
    </>
  )
}

export function ReadNext({ title = 'Read next', intro, steps }: { title?: string; intro?: string; steps: NextStep[] }) {
  if (steps.length === 0) return null
  // every card but the quote card gets a picture, and no picture twice in one row (lib/guide-images.ts, 24/10)
  const used = new Set<string>()
  const cards = steps.map((s) => {
    if (s.go) return s
    const img = [...guideImages(s.href), ...(s.img ? [s.img] : [])].find((x) => !used.has(x))
    if (img) used.add(img)
    return { ...s, img }
  })
  return (
    <section className="in in-sec in-rn" aria-labelledby="in-rn-h">
      <Container>
        <h2 id="in-rn-h">{title}</h2>
        {intro && <p className="in-rn__intro">{intro}</p>}
        <ul className="in-ncards">
          {cards.map((s) => {
            const cls = `in-ncard${s.go ? ' in-ncard--go' : ''}`
            return (
              <li key={s.href + s.title}>
                {s.href.startsWith('#') ? <a className={cls} href={s.href}><Card s={s} /></a> : <Link prefetch={false} className={cls} href={s.href}><Card s={s} /></Link>}
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
