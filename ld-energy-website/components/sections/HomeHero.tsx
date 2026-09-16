import Link from 'next/link'
import { CalendarCheck, ExternalLink, Landmark, MapPin, Ruler, ShieldCheck, type LucideIcon } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { site, priceFrom, pricing } from '@/lib/site'
import { quoteHref } from '@/lib/quote-context'

// Official EPC rating-scale colours, A to G. Decorative only; no rating is implied.
const ratingScale = ['#008054', '#19B459', '#8DCE46', '#FFD500', '#FCAA65', '#EF8023', '#E9153B']

// Desktop-only fact strip. Product facts, not operational promises.
const facts: { Icon: LucideIcon; label: string; detail: string }[] = [
  { Icon: Landmark, label: 'Lodged on GOV.UK', detail: 'Official EPC Register' },
  { Icon: CalendarCheck, label: 'Valid for 10 years', detail: 'Standard EPC validity' },
  { Icon: Ruler, label: 'Priced by floor area', detail: `${pricing.length} guide-price bands` },
  { Icon: MapPin, label: 'Based in Stratford E15', detail: 'Visits across London' },
]

/**
 * Below 1024px this renders exactly the compact mobile hero. At lg the price
 * block becomes a panel under the headline, and an assessor card and fact
 * strip (both display:none below lg) use the width a phone does not have.
 */
export function HomeHero() {
  return (
    <>
      <section id="home-hero" className="relative -mt-24 overflow-hidden bg-[#0D1B33] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(71,132,110,0.28),transparent_65%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-40 hidden h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(closest-side,rgba(108,140,188,0.16),transparent)] lg:block" />
        <div aria-hidden="true" className="bg-brand-pattern-dark pointer-events-none absolute inset-0 opacity-40" />
        <Container className="relative pb-8 pt-28 lg:pb-20 lg:pt-36">
          <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-x-16 lg:gap-y-0 xl:gap-x-24">
            <div className="min-w-0 lg:col-start-1 lg:row-start-1">
              <p className="text-sm font-semibold leading-6 text-[#B9D6C8] lg:inline-flex lg:items-center lg:gap-2 lg:rounded-full lg:border lg:border-[#47846E]/50 lg:bg-[#47846E]/15 lg:px-3.5 lg:py-1 lg:text-xs lg:uppercase lg:tracking-[0.14em]">
                <ShieldCheck aria-hidden="true" className="hidden h-3.5 w-3.5 lg:block" />
                <span className="lg:hidden">Elmhurst Accredited · {site.assessor.accreditationNumber}</span>
                <span className="hidden lg:inline">Elmhurst accredited assessor</span>
              </p>
              <a href={site.assessor.verifyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm text-white underline underline-offset-4 lg:hidden">
                Verify on GOV.UK <span aria-hidden="true" className="ml-1">↗</span>
              </a>
              <h1 className="mt-2 max-w-xl text-[2.35rem] font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:mt-6 lg:max-w-2xl lg:text-[4rem] lg:leading-[1.02] xl:text-[4.75rem]">
                Domestic EPCs <span className="text-[#B9D6C8]">in London</span>
              </h1>
              <p className="mt-4 max-w-lg text-base leading-6 text-[#D6E1F0] lg:mt-6 lg:text-lg lg:leading-7 xl:text-xl xl:leading-8">
                Energy Performance Certificates for homeowners, sellers and landlords.
              </p>
            </div>

            <div className="min-w-0 lg:col-start-1 lg:row-start-2 lg:mt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-x-8 lg:rounded-2xl lg:border lg:border-white/15 lg:bg-white/[0.05] lg:p-6 xl:p-7">
              <p className="text-xl font-semibold text-white lg:col-start-1 lg:row-start-1 lg:font-serif lg:text-2xl lg:leading-tight xl:text-3xl">
                Guide prices from&nbsp;£{priceFrom.epc}
              </p>
              <p className="mt-1 text-sm leading-6 text-[#D6E1F0] lg:col-start-1 lg:row-start-2">For properties up to 37 m²</p>
              <Button id="home-quote" href={quoteHref({ sourcePage: 'home', ctaId: 'hero' })} variant="accent" className="mt-4 w-full lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:w-auto">
                Get my exact quote
              </Button>
              <span aria-hidden="true" className="hidden lg:col-span-2 lg:row-start-3 lg:mt-5 lg:block lg:h-px lg:bg-white/10" />
              <p className="mt-2 text-sm leading-6 text-[#D6E1F0] lg:col-start-1 lg:row-start-4 lg:mt-3">Exact quote confirmed before booking</p>
              <a href="#pricing" className="inline-flex min-h-11 items-center text-base text-white underline underline-offset-4 lg:col-start-2 lg:row-start-4 lg:mt-3 lg:justify-self-end lg:text-sm">
                See guide prices <span aria-hidden="true" className="ml-2">↓</span>
              </a>
            </div>

            <p className="text-sm leading-6 text-[#D6E1F0] lg:hidden">Based in Stratford E15 · London-wide coverage</p>

            <div className="hidden min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:block">
              <div className="overflow-hidden rounded-3xl bg-white text-secondary-900 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.6)]">
                <div aria-hidden="true" className="flex h-1.5">
                  {ratingScale.map((colour) => <span key={colour} className="flex-1" style={{ backgroundColor: colour }} />)}
                </div>
                <div className="p-7 xl:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary-500">Your assessor</p>
                      <p className="mt-2 font-serif text-2xl font-semibold leading-tight xl:text-[1.75rem]">{site.assessor.name}</p>
                      <p className="mt-1 text-base text-secondary-600">{site.assessor.qualification}</p>
                    </div>
                    <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F1F6F3] text-[#386B59]">
                      <ShieldCheck className="h-6 w-6" />
                    </span>
                  </div>
                  <dl className="mt-6 rounded-2xl bg-primary-50 px-5 py-4 ring-1 ring-primary-100">
                    <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-700">Accreditation number</dt>
                    <dd className="mt-1 font-mono text-2xl font-bold tracking-tight text-secondary-900">{site.assessor.accreditationNumber}</dd>
                    <dd className="mt-0.5 text-sm text-secondary-600">{site.assessor.scheme}</dd>
                  </dl>
                  <a href={site.assessor.verifyUrl} target="_blank" rel="noopener noreferrer" className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#386B59] px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-[#2F5749]">
                    Verify Abdul on GOV.UK <ExternalLink aria-hidden="true" className="h-4 w-4" />
                  </a>
                  <p className="mt-5 border-t border-secondary-200 pt-5 text-base leading-6 text-secondary-700">
                    Speak directly with the person assessing your property.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-6">
                    <a href={site.reviews.profileUrl} target="_blank" rel="noopener noreferrer" className="home-link text-sm">
                      Read customer reviews on Google <span aria-hidden="true">↗</span>
                    </a>
                    <Link prefetch={false} href="/about" className="home-link text-sm">
                      More about your assessor <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <div className="relative hidden bg-[linear-gradient(to_bottom,#0D1B33_50%,#F1F6F3_50%)] lg:block">
        <Container>
          <ul aria-label="About the certificate and service" className="grid grid-cols-4 divide-x divide-secondary-200 rounded-2xl bg-white shadow-premium-lg ring-1 ring-secondary-900/5">
            {facts.map(({ Icon, label, detail }) => (
              <li key={label} className="flex min-w-0 items-center gap-3 px-4 py-5 xl:gap-4 xl:px-7">
                <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-5 text-secondary-900 xl:text-base xl:leading-6">{label}</span>
                  <span className="block text-sm leading-5 text-secondary-600">{detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </>
  )
}
