import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { GoogleRating } from '@/components/ui/GoogleRating'
import { cn } from '@/lib/cn'
import { site } from '@/lib/site'
import { priorityBoroughs } from '@/lib/boroughs'
import { quoteHref } from '@/lib/quote-context'

type FooterLink = [label: string, href: string]

const services: FooterLink[] = [
  ['Domestic EPC', '/services/domestic-epc'],
  ['Floor plans', '/services/floor-plans'],
  ['EPC Pre-Assessment', '/services/epc-pre-assessment'],
  ['EPC Improvement Plan', '/services/epc-improvement-plan'],
  ['Guide prices', '/pricing'],
  ['Landlords', '/landlords'],
  ['Sellers', '/sellers'],
  ['Agencies and portfolios', '/estate-agents'],
]
const useful: FooterLink[] = [
  ['London service areas', '/areas'],
  ['EPC ratings by borough', '/epc-ratings-by-borough'],
  ['About Abdul', '/about'],
  ['Domestic Energy Assessor', '/domestic-energy-assessor-london'],
  ['Before your visit', '/preparing-for-your-epc'],
  ['EPC questions', '/faq'],
  ['Expert guides', '/blog'],
  ['Get an exact quote', '/quote'],
  ['Contact us', '/contact'],
]
// Site-wide links to the area pages with the most search impressions (lib/boroughs.ts).
const popularAreas: FooterLink[] = priorityBoroughs.map((b) => [b.name, `/areas/${b.slug}`])

const groups: { heading: string; items: FooterLink[]; listClassName?: string }[] = [
  { heading: 'Services', items: services },
  { heading: 'Useful links', items: useful },
  { heading: 'Popular areas', items: popularAreas, listClassName: 'lg:grid lg:grid-cols-2 lg:gap-x-6' },
]

function Links({ items, className }: { items: FooterLink[]; className?: string }) {
  return (
    <ul className={className}>
      {items.map(([label, href]) => (
        <li key={href}>
          <Link prefetch={false} href={href} className="inline-flex min-h-11 items-center text-sm leading-6 text-stone-300 underline-offset-4 transition-colors hover:text-night-link hover:underline lg:min-h-8">
            {label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function CompactFooter() {
  return (
    <footer className="bg-night text-stone-400 [overflow-wrap:anywhere]">
      <Container className="pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-8 lg:pb-8">
        <div className="cf-grid grid gap-3 pt-6 lg:gap-10 lg:pt-12 xl:gap-14 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.5fr)]">
          <div className="cf-brand">
            <Link prefetch={false} href="/" aria-label="L&D Energy, home" className="inline-flex min-h-11 items-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- the master compact lockup, reversed; matches the header logo */}
              <img src="/brand/ld-energy-compact-reversed.svg" alt="" width={153} height={25} loading="lazy" decoding="async" />
            </Link>
            <p className="mt-3 text-sm leading-6 text-stone-400">L&amp;D Energy · Stratford E15, London</p>
            <div className="cf-contact flex flex-wrap gap-x-5">
              <a href={site.phoneHref} className="inline-flex min-h-11 items-center text-base font-semibold text-night-ink">{site.phone}</a>
              <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-base text-night-ink underline-offset-4 hover:underline">WhatsApp</a>
            </div>
            <a href={site.emailHref} className="cf-contact inline-flex min-h-11 items-center text-sm text-night-ink underline-offset-4 hover:underline lg:min-h-8">{site.email}</a>
            <div className="cf-proof mt-5 hidden space-y-4 lg:block">
              <GoogleRating className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-stone-300 hover:text-night-link" />
              <Link prefetch={false} href={quoteHref()} className="ld-btn ld-btn--primary">Get my exact quote</Link>
            </div>
          </div>
          {groups.map(({ heading, items, listClassName }) => (
            <div key={heading}>
              <details className="border-b border-[rgba(241,239,232,.16)] lg:hidden">
                <summary className="cursor-pointer py-3 font-sans text-label font-medium uppercase tracking-[.14em] text-stone-400">{heading}</summary>
                <nav aria-label={`Footer ${heading}`}>
                  <Links items={items} />
                </nav>
              </details>
              <nav aria-label={`Footer ${heading}`} className="hidden lg:block">
                <h2 className="mb-3 font-sans text-label font-medium uppercase leading-none tracking-[.14em] text-stone-400">{heading}</h2>
                <Links items={items} className={cn(listClassName)} />
              </nav>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-[rgba(241,239,232,.16)] pt-3 text-[13.5px] lg:mt-12 lg:flex lg:flex-wrap lg:items-center lg:gap-x-8 lg:pt-6">
          <div className="flex flex-wrap gap-x-6 lg:order-2">
            <a href="/privacy-policy#analytics-choices" className="inline-flex min-h-11 items-center text-stone-400 underline-offset-4 hover:text-night-link hover:underline">Privacy &amp; analytics choices</a>
            <Link prefetch={false} href="/terms" className="inline-flex min-h-11 items-center text-stone-400 underline-offset-4 hover:text-night-link hover:underline">Terms of Service</Link>
          </div>
          <p className="mt-2 leading-6 lg:order-1 lg:mt-0">© {new Date().getFullYear()} {site.name}. Part of {site.parentBrand}.</p>
          <a href="https://digital.luminousanddeliver.co.uk/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-stone-400 underline-offset-4 hover:text-night-link hover:underline lg:order-3 lg:ml-auto">Made by L&amp;D Digital</a>
        </div>
      </Container>
    </footer>
  )
}
