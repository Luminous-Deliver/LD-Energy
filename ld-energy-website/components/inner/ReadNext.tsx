import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Ico } from '@/components/sections/home/HomeIcon'
import '@/app/inner.css'

/**
 * Read next, option C on the inner-page options board (Abdul 23/10/2026): the next step by intent, each card a
 * question the reader may be asking, with the ready-to-book step last (`go`). Carries option A's images and its
 * information (kicker, title, a one-line description). Used by area pages and guides.
 */
export type NextStep = { kicker: string; title: string; text: string; href: string; img?: string; go?: boolean }

function linkLabel(s: NextStep): string {
  if (s.go) return 'Get my exact quote'
  if (s.href.startsWith('/blog')) return 'Read the guide'
  if (s.href.startsWith('/epc-ratings-by-borough')) return 'See the figures'
  return 'Find out more'
}

export function ReadNext({ title = 'Where next?', intro, steps }: { title?: string; intro?: string; steps: NextStep[] }) {
  if (steps.length === 0) return null
  return (
    <section className="in in-sec in-rn" aria-labelledby="in-rn-h">
      <Container>
        <h2 id="in-rn-h">{title}</h2>
        {intro && <p className="in-rn__intro">{intro}</p>}
        <ul className="in-ncards">
          {steps.map((s) => {
            const inner = (
              <>
                {s.img && (
                  <span className="in-ncard__img">
                    {/* eslint-disable-next-line @next/next/no-img-element -- small decorative SVG/WebP; next/image is unoptimised on Pages */}
                    <img src={s.img} alt="" width={640} height={360} loading="lazy" decoding="async" />
                  </span>
                )}
                <span className="in-ncard__b">
                  <span className="in-ncard__k">{s.kicker}</span>
                  <b>{s.title}</b>
                  <span className="in-ncard__t">{s.text}</span>
                  <span className="in-ncard__l">{linkLabel(s)} <Ico name="arrow-right" size={18} /></span>
                </span>
              </>
            )
            const cls = `in-ncard${s.go ? ' in-ncard--go' : ''}`
            return (
              <li key={s.href + s.title}>
                {s.href.startsWith('#') ? <a className={cls} href={s.href}>{inner}</a> : <Link prefetch={false} className={cls} href={s.href}>{inner}</Link>}
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
