import { quoteHref } from '@/lib/quote-context'
import { ShieldCheck, Clock, MapPin, Star, BadgePoundSterling } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { site, priceFrom, EXPRESS_SURCHARGE } from '@/lib/site'

const GOOGLE_REVIEWS_URL = site.reviews.profileUrl

export function Hero() {
  return (
    <section
      className="relative overflow-hidden -mt-24"
      style={{ background: 'linear-gradient(160deg, #0D1B33 0%, #142644 45%, #091324 100%)' }}
    >
      {/* Bold dark treatment — reuses the exact navy gradient + sage glow
          already established for HowItWorks/Footer elsewhere on this site,
          rather than a new colour scheme, so the homepage's first impression
          reads as confident/premium and still ties to the rest of the page.
          The negative top margin deliberately overdraws the tallest header
          state (84px) so the gradient always reaches the viewport edge behind
          the floating pill nav. The matching container padding preserves the
          content position without leaving a body-coloured seam at any width. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute -top-32 -right-24 h-[560px] w-[560px] rounded-full opacity-[0.22]"
          style={{ background: 'radial-gradient(ellipse, #47846E 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/3 -left-32 h-[420px] w-[420px] rounded-full opacity-[0.16]"
          style={{ background: 'radial-gradient(ellipse, #6C8CBC 0%, transparent 70%)' }}
        />
        <div className="bg-brand-pattern-dark absolute inset-0 [mask-image:radial-gradient(90%_80%_at_78%_20%,black,transparent_70%)]" />
      </div>

      {/* pt- accounts for the floating pill nav's own height now that this
          section sits underneath it via the negative margin above; pb- keeps
          the original bottom spacing. */}
      <Container className="relative pt-32 pb-10 md:pb-14 lg:pt-36 lg:pb-16 grid gap-8 lg:grid-cols-12 lg:gap-12 items-center">
        <div className="lg:col-span-7">
          <p
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wide font-semibold rounded-full px-3 py-1 animate-fade-in"
            style={{ background: 'rgba(71,132,110,0.14)', border: '1px solid rgba(71,132,110,0.32)', color: '#B9D6C8' }}
          >
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            Elmhurst Accredited · All London Boroughs
          </p>
          <h1 className="mt-4 text-[2.1rem] leading-[1.07] sm:text-5xl md:text-6xl font-semibold tracking-tight text-white animate-fade-in-up animate-delay-100">
            Fast, <span className="text-gradient-brand-light">Reliable</span> &amp; Certified EPCs in London
          </h1>
          <p className="mt-5 text-lg md:text-xl leading-relaxed max-w-2xl animate-fade-in-up animate-delay-200" style={{ color: 'rgba(214,225,240,0.75)' }}>
            Domestic EPCs and measured floor plans across all 32 boroughs. Guide prices start at{' '}
            <span className="font-semibold text-white">{`£${priceFrom.epc}`}</span> — we confirm your exact quote before you book.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button href={quoteHref()} variant="accent" size="lg" className="w-full sm:w-auto text-base">
              Get my exact quote
            </Button>
            <Button
              href="#pricing"
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto text-base bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-sm"
            >
              See guide prices
            </Button>
          </div>
          {/* "Same-price guarantee" contradicted the guide-price model it sat
              beside, and "2-hour response" was a service promise we cannot
              evidence. Both replaced with claims that are true by construction. */}
          <p className="mt-3 text-sm" style={{ color: 'rgba(214,225,240,0.55)' }}>
            No call-out fees · Exact quote before booking · 7 days a week, 8am–8pm
          </p>

          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 min-h-[44px] text-sm font-medium text-white/80 hover:text-white"
          >
            <span className="flex items-center gap-0.5" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </span>
            <span className="font-semibold text-white">Rated on Google</span>
            <span className="text-white/40" aria-hidden="true">·</span>
            <span className="underline underline-offset-2 decoration-white/30 hover:decoration-white/60">Read our reviews</span>
          </a>

          <dl className="mt-10 flex max-w-md divide-x divide-white/15">
            {[
              // Deliberately not a price tile. The guide price is stated in the
              // paragraph above; repeating it as a large isolated figure anchors
              // the whole hero to "cheapest", which is the wrong customer.
              { dt: 'Lodged in', dd: '72h' },
              { dt: 'Available', dd: '7 days' },
              { dt: 'Boroughs', dd: '32+' },
            ].map((stat) => (
              <div key={stat.dt} className="flex-1 pl-4 first:pl-0">
                <dt className="text-xs uppercase tracking-wide font-medium" style={{ color: 'rgba(214,225,240,0.55)' }}>{stat.dt}</dt>
                <dd className="mt-1 text-2xl font-bold text-white">{stat.dd}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-5 mt-10 lg:mt-0">
          <div className="rounded-2xl border border-secondary-200 bg-white/95 p-5 shadow-premium-lg backdrop-blur animate-fade-in animate-delay-300">
            <p className="text-xs font-semibold uppercase tracking-widest text-secondary-600">
              Why people book us
            </p>
            <ul className="mt-3 divide-y divide-secondary-100">
              <li className="flex items-start gap-3 py-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-secondary-900">
                    Accredited &amp; publicly verifiable
                  </span>
                  <span className="block text-sm text-secondary-600">
                    {site.assessor.name} · {site.assessor.accreditationNumber}
                  </span>
                  <a
                    href={site.assessor.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800"
                  >
                    Check the government register
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-3 py-3">
                <BadgePoundSterling className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" aria-hidden="true" />
                <span>
                  <span className="block text-sm font-bold text-secondary-900">
                    Exact quote before you book
                  </span>
                  <span className="block text-sm text-secondary-600">
                    Guide prices online, confirmed price in writing first — including urgent jobs.
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3 py-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" aria-hidden="true" />
                <span>
                  <span className="block text-sm font-bold text-secondary-900">
                    72-hour standard, next day for {`£${EXPRESS_SURCHARGE}`}
                  </span>
                  <span className="block text-sm text-secondary-600">
                    Seven days a week, 8am&ndash;8pm, evenings included.
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3 py-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" aria-hidden="true" />
                <span>
                  <span className="block text-sm font-bold text-secondary-900">All 32 London boroughs</span>
                  <span className="block text-sm text-secondary-600">
                    Based in Stratford, no travel or call-out surcharges.
                  </span>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </section>
  )
}
