import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { site, priceFrom } from '@/lib/site'
import { quoteHref } from '@/lib/quote-context'

export function HomeHero() {
  return (
    <section id="home-hero" className="relative -mt-24 overflow-hidden bg-[#0D1B33] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(71,132,110,0.28),transparent_65%)]" />
      <div aria-hidden="true" className="bg-brand-pattern-dark pointer-events-none absolute inset-0 opacity-40" />
      <Container className="relative pb-8 pt-28 lg:py-32 lg:pt-40">
        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-x-20">
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-6 text-[#B9D6C8]">Elmhurst Accredited · {site.assessor.accreditationNumber}</p>
            <a href={site.assessor.verifyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm text-white underline underline-offset-4">Verify on GOV.UK <span aria-hidden="true" className="ml-1">↗</span></a>
            <h1 className="mt-2 max-w-xl text-[2.35rem] font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[4rem]">Domestic EPCs <span className="text-[#B9D6C8]">in London</span></h1>
            <p className="mt-4 max-w-lg text-base leading-6 text-[#D6E1F0] lg:text-lg lg:leading-7">Energy Performance Certificates for homeowners, sellers and landlords.</p>
          </div>
          <div className="min-w-0 lg:self-end lg:border-l lg:border-white/20 lg:pl-10">
            <p className="text-xl font-semibold text-white lg:text-2xl">Guide prices from £{priceFrom.epc}</p>
            <p className="mt-1 text-sm leading-6 text-[#D6E1F0]">For properties up to 37 m²</p>
            <Button id="home-quote" href={quoteHref({ sourcePage:'home', ctaId:'hero' })} variant="accent" className="mt-4 w-full lg:w-auto">Get my exact quote</Button>
            <p className="mt-2 text-sm leading-6 text-[#D6E1F0]">Exact quote confirmed before booking</p>
            <a href="#pricing" className="inline-flex min-h-11 items-center text-base text-white underline underline-offset-4">See guide prices <span aria-hidden="true" className="ml-2">↓</span></a>
          </div>
          <p className="text-sm leading-6 text-[#D6E1F0] lg:col-span-2">Based in Stratford E15 · London-wide coverage</p>
        </div>
      </Container>
    </section>
  )
}
