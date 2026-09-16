import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Logo } from '@/components/ui/Logo'
import { cn } from '@/lib/cn'
import { site } from '@/lib/site'
import { priorityBoroughs } from '@/lib/boroughs'

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
  ['About Abdul', '/about'],
  ['Domestic Energy Assessor', '/domestic-energy-assessor-london'],
  ['Before your visit', '/preparing-for-your-epc'],
  ['EPC questions', '/faq'],
  ['Expert guides', '/blog'],
  ['Contact and exact quote', '/contact#booking-form'],
]
// Site-wide links to the commercially prioritised area pages, as the pre-Stage 3 footer had.
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
          <Link prefetch={false} href={href} className="inline-flex min-h-11 items-center text-sm leading-6 text-[#D6E1F0] underline-offset-4 hover:underline">
            {label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function CompactFooter() {
  return (
    <footer className="bg-[#0D1B33] text-[#D6E1F0] [overflow-wrap:anywhere]">
      <Container className="py-6 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-8 lg:py-12">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-10 xl:gap-14">
          <div>
            <Logo variant="light" size="sm" />
            <p className="mt-3 text-sm leading-6">L&amp;D Energy · Stratford E15, London</p>
            <div className="flex flex-wrap gap-x-5">
              <a href={site.phoneHref} className="inline-flex min-h-11 items-center text-base font-semibold text-white">{site.phone}</a>
              <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-base text-white underline underline-offset-4">WhatsApp</a>
            </div>
            <a href={site.emailHref} className="inline-flex min-h-11 items-center text-sm text-white underline underline-offset-4">{site.email}</a>
          </div>
          {groups.map(({ heading, items, listClassName }) => (
            <div key={heading}>
              <details className="border-y border-white/20 lg:hidden">
                <summary className="cursor-pointer py-3 text-base font-semibold text-white">{heading}</summary>
                <nav aria-label={`Footer ${heading}`}>
                  <Links items={items} />
                </nav>
              </details>
              <nav aria-label={`Footer ${heading}`} className="hidden lg:block">
                <h2 className="mb-3 text-lg font-semibold text-white">{heading}</h2>
                <Links items={items} className={cn(listClassName)} />
              </nav>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-white/20 pt-3">
          <div className="flex flex-wrap gap-x-6">
            <a href="/privacy-policy#analytics-choices" className="inline-flex min-h-11 items-center text-sm text-white underline underline-offset-4">Privacy &amp; analytics choices</a>
            <Link prefetch={false} href="/terms" className="inline-flex min-h-11 items-center text-sm text-white underline underline-offset-4">Terms of Service</Link>
          </div>
          <p className="mt-2 text-sm leading-6">© {new Date().getFullYear()} {site.name}. Part of {site.parentBrand}.</p>
          <a href="https://digital.luminousanddeliver.co.uk/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm text-[#D6E1F0] underline underline-offset-4">Made by L&amp;D Digital</a>
        </div>
      </Container>
    </footer>
  )
}
