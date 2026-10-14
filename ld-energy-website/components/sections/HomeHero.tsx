import { Check } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { quoteHref } from '@/lib/quote-context'
import { HomeQuoteCard } from '@/components/sections/home/HomeQuoteCard'
import { HeroMotion } from '@/components/sections/home/HeroMotion'

/** Process promises Abdul controls (14/10/2026). Never a rating or outcome. */
export const promises = ['Same working-day reply', 'No surprise charges', 'Free rearrange if we reschedule']

/**
 * "London Thames Sunset panorama" by Diliff (CC BY 3.0, credited in the
 * closing section) as one plane: Tower Bridge and the City in a band between
 * the words and the quote card, the photo's sky paling up behind the words and
 * its water fading into the page under the card. It drifts at 0.31 of scroll,
 * so the card slides up over the river. Dusk falls on it as the hero leaves
 * (lh-dusk), so the closing scene, the same view at night, ends the same evening.
 */
function Layer({ name, className, rate, h2400, priority }: { name: 'scene'; className: string; rate: number; h2400: number; priority?: boolean }) {
  return (
    <picture>
      <source media="(max-width: 760px)" srcSet={`/hero/thames-${name}-1440.webp`} />
      {/* eslint-disable-next-line @next/next/no-img-element -- next/image is unoptimised on Pages; layers need <picture> */}
      <img
        className={className}
        data-rate={rate}
        src={`/hero/thames-${name}-2400.webp`}
        width={2400}
        height={h2400}
        alt=""
        {...(priority ? { fetchPriority: 'high' as const } : {})}
      />
    </picture>
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
          <Button id="home-quote" href={quoteHref({ sourcePage: 'home', ctaId: 'hero' })} variant="secondary" className="rounded-full border-[#0D1B33]/70 bg-transparent px-7 text-[#0D1B33] hover:bg-white/50">
            Get my exact quote
          </Button>
        </div>
        <ul aria-label="Our booking promises" className="lh-promise lh-rise" style={{ ['--n' as string]: 4 }}>
          {promises.map((p) => (
            <li key={p}><span aria-hidden="true"><Check className="h-2.5 w-2.5" strokeWidth={4} /></span>{p}</li>
          ))}
        </ul>
      </Container>
      <div aria-hidden="true" className="lh-scene">
        <Layer name="scene" className="lh-city" rate={0.31} h2400={1311} priority />
        <div className="lh-dusk" />
      </div>
      <div id="pricing" className="lh-card scroll-mt-28">
        <HomeQuoteCard />
      </div>
      <HeroMotion />
    </section>
  )
}
