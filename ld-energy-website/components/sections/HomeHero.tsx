import { Check } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { HomeQuoteCard } from '@/components/sections/home/HomeQuoteCard'
import { HeroMotion } from '@/components/sections/home/HeroMotion'

/** Process promises Abdul controls (14/10/2026). Never a rating or outcome. */
export const promises = ['Same working-day reply', 'No surprise charges', 'Free rearrange if we reschedule']

/**
 * Three depth planes cut from "Canary Wharf from Blackheath (2)" by The wub
 * (CC BY-SA 4.0, credited in the closing section; picked by Abdul 15/10/2026).
 * Back to front: Canary Wharf and the tree line, mid hedge, then the quote card,
 * then the near hedge, which covers the card's foot and rises with the page.
 * Phones show the land as a band between the words and the card.
 */
function Land() {
  // Class names are written out in full so Tailwind keeps them.
  const layer = (name: 'far' | 'mid' | 'near', cls: string, rate: number, h2400: number, priority?: boolean) => (
    <picture>
      <source media="(max-width: 760px)" srcSet={`/hero/blackheath-${name}-1440.webp`} />
      {/* eslint-disable-next-line @next/next/no-img-element -- next/image is unoptimised on Pages; layers need <picture> */}
      <img
        className={cls}
        data-rate={rate}
        src={`/hero/blackheath-${name}-2400.webp`}
        width={2400}
        height={h2400}
        alt=""
        {...(priority ? { fetchPriority: 'high' as const } : {})}
      />
    </picture>
  )
  return (
    <div aria-hidden="true" className="lh-land">
      {layer('far', 'lh-land__far', 0.31, 511, true)}
      {layer('mid', 'lh-land__mid', 0.17, 305)}
      {layer('near', 'lh-land__near', 0, 272)}
    </div>
  )
}

export function HomeHero() {
  return (
    <section id="home-hero" aria-labelledby="home-h1" className="lh -mt-24">
      <div aria-hidden="true" className="lh-sky" />
      <Container className="lh-words">
        <p className="lh-pill lh-rise" style={{ ['--n' as string]: 0 }}>Elmhurst-accredited assessor · Stratford E15</p>
        <h1 id="home-h1" className="lh-rise" style={{ ['--n' as string]: 1 }}>Domestic EPCs in London</h1>
        <p className="lh-line lh-rise" style={{ ['--n' as string]: 2 }}>
          For landlords, agents and property professionals. Know where a property stands, plan the next step and book every assessment with one accredited assessor. Homeowners and sellers welcome too.
        </p>
        <div className="lh-actions lh-rise" style={{ ['--n' as string]: 3 }}>
          <Button href="#services" variant="accent" className="rounded-full px-7">Explore our services</Button>
          <Button id="home-quote" href="#pricing" variant="secondary" className="rounded-full border-[#0D1B33]/70 bg-transparent px-7 text-[#0D1B33] hover:bg-white/50">
            Get my exact quote
          </Button>
        </div>
        <ul aria-label="Our booking promises" className="lh-promise lh-rise" style={{ ['--n' as string]: 4 }}>
          {promises.map((p) => (
            <li key={p}><span aria-hidden="true"><Check className="h-2.5 w-2.5" strokeWidth={4} /></span>{p}</li>
          ))}
        </ul>
      </Container>
      <Land />
      <div aria-hidden="true" className="lh-floor" />
      <div id="pricing" className="lh-card scroll-mt-28">
        <HomeQuoteCard />
      </div>
      <HeroMotion />
    </section>
  )
}
