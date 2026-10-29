import Link from 'next/link'
import { ExternalLink, MessageCircle, Phone, Plus } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { GoogleRating } from '@/components/ui/GoogleRating'
import { site } from '@/lib/site'
import { boroughMeta, priorityBoroughs } from '@/lib/boroughs'
import { BOROUGH_DATA_PAGE } from '@/lib/guides'
import { quoteHref } from '@/lib/quote-context'

/* Footer v2 (Abdul 29/10/2026: "redesign the footer ... good layout structure, useful SEO, GEO").
   Every page carries it, so it holds the facts a search engine or an AI answer needs to place the business
   (name, Stratford E15, the area served, hours, contact, both accreditation numbers and the register to check
   them) as visible text, plus links to the pages and guides with the most Search Console impressions
   (90 days to 26/10/2026). Phones get the contact buttons open and the link groups folded. */

type FooterLink = [label: string, href: string]

const services: FooterLink[] = [
  ['Domestic EPC', '/services/domestic-epc'],
  ['Floor plans', '/services/floor-plans'],
  ['EPC Pre-Assessment', '/services/epc-pre-assessment'],
  ['EPC Improvement Plan', '/services/epc-improvement-plan'],
  ['Guide prices', '/pricing'],
  ['For landlords', '/landlords'],
  ['For estate agents', '/estate-agents'],
  ['For sellers', '/sellers'],
]
// Guides by search impressions, plus the new cost guide (booking intent).
const guides: FooterLink[] = [
  ['EPC, floor plan or survey?', '/blog/epc-vs-floor-plan-vs-survey'],
  ['EPC ratings explained', '/blog/epc-ratings-explained'],
  ['What an EPC costs, and who pays', '/blog/epc-cost-who-pays'],
  ['Preparing for the visit', '/blog/prepare-for-epc-assessment'],
  ['Improving your rating', '/blog/how-to-improve-epc-rating'],
  ['Why ratings differ', '/blog/why-is-my-epc-different'],
  ['EPCs for landlords', '/blog/epc-for-landlords-2026'],
]
const company: FooterLink[] = [
  ['About Abdul', '/about'],
  ['Your assessor', '/domestic-energy-assessor-london'],
  ['Before your visit', '/preparing-for-your-epc'],
  ['EPC questions', '/faq'],
  ['Contact us', '/contact'],
  ['Get an exact quote', '/quote'],
]
const areas: FooterLink[] = priorityBoroughs.map((b) => [b.name, `/areas/${b.slug}`])
const areaCount = Object.keys(boroughMeta).length

const groups: { heading: string; items: FooterLink[]; more?: FooterLink; wide?: boolean }[] = [
  { heading: 'Services', items: services },
  { heading: 'Guides', items: guides, more: ['All guides', '/blog'] },
  { heading: 'Areas we cover', items: areas, more: [`All ${areaCount} London areas`, '/areas'], wide: true },
  { heading: 'Company', items: [...company, [BOROUGH_DATA_PAGE.label, BOROUGH_DATA_PAGE.href]] },
]

const link = 'inline-flex min-h-11 items-center text-[15px] leading-6 text-stone-300 underline-offset-4 transition-colors hover:text-night-link hover:underline lg:min-h-9'

function Links({ items, more, wide }: { items: FooterLink[]; more?: FooterLink; wide?: boolean }) {
  return (
    <ul className={wide ? 'grid grid-cols-2 gap-x-6' : undefined}>
      {items.map(([label, href]) => (
        <li key={href}>
          <Link prefetch={false} href={href} className={link}>{label}</Link>
        </li>
      ))}
      {more && (
        <li className={wide ? 'col-span-2' : undefined}>
          <Link prefetch={false} href={more[1]} className={`${link} font-semibold !text-night-link`}>{more[0]} →</Link>
        </li>
      )}
    </ul>
  )
}

export function CompactFooter() {
  const [elmhurst, quidos] = site.assessor.accreditations
  return (
    <footer className="bg-night text-stone-400 [overflow-wrap:anywhere]">
      <Container className="pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-8">
        {/* Who, where, how to reach: visible text, read the same by people, search engines and AI answers. */}
        <div className="cf-grid grid gap-8 pt-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16 lg:pt-16">
          <div>
            <Link prefetch={false} href="/" aria-label="L&D Energy, home" className="inline-flex min-h-11 items-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- the master compact lockup, reversed; matches the header logo */}
              <img src="/brand/ld-energy-compact-reversed.svg" alt="" width={151} height={25} loading="lazy" decoding="async" />
            </Link>
            <p className="mt-4 max-w-[30ch] font-serif text-[1.65rem] leading-[1.2] text-night-ink lg:text-[2rem]">
              EPCs and floor plans across London, from an accredited assessor in Stratford.
            </p>
            <p className="mt-4 max-w-[52ch] text-[15px] leading-6 text-stone-300">
              {site.name} covers all 32 London boroughs and the City of London from Stratford, E15. One price in
              every borough, with no travel charges, and your exact quote confirmed before you book.
            </p>
          </div>

          <address className="not-italic">
            <div className="cf-contact grid grid-cols-2 gap-3 sm:max-w-md">
              <a href={site.phoneHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[rgba(241,239,232,.28)] px-4 text-[15px] font-semibold text-night-ink transition-colors hover:border-night-link hover:text-night-link">
                <Phone aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span className="lg:hidden">Call</span>
                <span className="hidden lg:inline">{site.phone}</span>
              </a>
              <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-night-link px-4 text-[15px] font-semibold text-night transition-colors hover:bg-night-ink">
                <MessageCircle aria-hidden="true" className="h-4 w-4 shrink-0" />
                WhatsApp
              </a>
            </div>
            <dl className="mt-6 grid gap-x-8 gap-y-4 text-[15px] leading-6 sm:grid-cols-2">
              {/* the desktop Call button shows the number, so this repeats it on phones only */}
              <div className="cf-contact lg:hidden">
                <dt className="font-sans text-label font-medium uppercase text-stone-400">Phone</dt>
                <dd><a href={site.phoneHref} className="text-night-ink underline-offset-4 hover:underline">{site.phone}</a></dd>
              </div>
              <div className="cf-contact">
                <dt className="font-sans text-label font-medium uppercase text-stone-400">Email</dt>
                <dd><a href={site.emailHref} className="text-night-ink underline-offset-4 hover:underline">{site.email}</a></dd>
              </div>
              <div>
                <dt className="font-sans text-label font-medium uppercase text-stone-400">Based in</dt>
                <dd className="text-night-ink">Stratford, London {site.address.postalCode}</dd>
              </div>
              <div>
                <dt className="font-sans text-label font-medium uppercase text-stone-400">Open</dt>
                <dd className="text-night-ink">Every day, 8am to 8pm</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link prefetch={false} href={quoteHref()} className="ld-btn ld-btn--primary">Get my exact quote</Link>
              <GoogleRating className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-stone-300 hover:text-night-link" />
            </div>
          </address>
        </div>

        {/* Link groups: four columns on a desktop, folded on a phone. The links stay in the HTML either way. */}
        <div className="mt-10 border-t border-[rgba(241,239,232,.16)] lg:mt-14 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-10 lg:border-t-0 lg:pt-0">
          {groups.map(({ heading, items, more, wide }) => (
            <div key={heading}>
              <details className="group border-b border-[rgba(241,239,232,.16)] lg:hidden">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between font-sans text-label font-medium uppercase text-stone-300 [&::-webkit-details-marker]:hidden">
                  {heading}
                  <Plus aria-hidden="true" className="h-5 w-5 shrink-0 transition-transform group-open:rotate-45" />
                </summary>
                <nav aria-label={`Footer: ${heading}`} className="pb-4">
                  <Links items={items} more={more} wide={wide} />
                </nav>
              </details>
              <nav aria-label={`Footer: ${heading}`} className="hidden border-t border-[rgba(241,239,232,.16)] pt-6 lg:block">
                <h2 className="mb-3 font-sans text-label font-medium uppercase leading-none text-stone-400">{heading}</h2>
                <Links items={items} more={more} wide={wide} />
              </nav>
            </div>
          ))}
        </div>

        {/* Accreditation: both scheme numbers as text, and the public register to check them. */}
        <p className="mt-8 text-sm leading-6 text-stone-300 lg:mt-14">
          Domestic Energy Assessor accredited with {elmhurst.short} ({elmhurst.number}) and {quidos.short} ({quidos.number}).{' '}
          <a href={site.assessor.verifyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 whitespace-nowrap text-night-link underline underline-offset-4 hover:text-night-ink">
            Check the GOV.UK register
            <ExternalLink aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          </a>
        </p>

        <div className="mt-6 border-t border-[rgba(241,239,232,.16)] pt-3 text-[13.5px] lg:flex lg:flex-wrap lg:items-center lg:gap-x-8 lg:pt-5">
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
