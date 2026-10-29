import Link from 'next/link'
import { ExternalLink, MessageCircle, Phone, Plus } from 'lucide-react'
import { LogoLockup } from '@/components/layout/Header'
import { GoogleRating } from '@/components/ui/GoogleRating'
import { site } from '@/lib/site'
import { boroughMeta } from '@/lib/boroughs'
import londonMap from '@/lib/london-map.json'
import { quoteHref } from '@/lib/quote-context'
import {
  footerAreaCount, footerAreas, footerCompany, footerGuides, footerServices, type FooterLink,
} from '@/lib/footer-links'

/* Footer (Abdul 29/10/2026: option C, light, with the map from option B). Every page carries it, so it holds the
   facts a search engine or an AI answer needs to place the business as visible text (Stratford E15, the area served,
   hours, contact, both accreditation numbers and the register to check them), and a map whose 33 boroughs each link
   to their page. Phones get the contact card and the map open and the link groups folded; the links stay in the HTML. */

const MAP = londonMap as { w: number; h: number; b: { slug: string; d: string; cx: number; cy: number }[] }
const [elmhurst, quidos] = site.assessor.accreditations

function Links({ items, more, cols = 1 }: { items: FooterLink[]; more?: FooterLink; cols?: 1 | 2 }) {
  return (
    <ul className={cols === 2 ? 'grid grid-cols-2 gap-x-6' : undefined}>
      {items.map(([label, href]) => (
        <li key={href}>
          <Link prefetch={false} href={href} className="inline-flex min-h-11 items-center text-[15px] leading-6 text-stone-700 underline-offset-4 hover:text-sage-700 hover:underline lg:min-h-9">{label}</Link>
        </li>
      ))}
      {more && (
        <li className={cols === 2 ? 'col-span-2' : undefined}>
          <Link prefetch={false} href={more[1]} className="inline-flex min-h-11 items-center text-[15px] font-semibold text-sage-700 underline-offset-4 hover:underline lg:min-h-9">{more[0]} →</Link>
        </li>
      )}
    </ul>
  )
}

/** A link group: a heading and list on a desktop, a fold on a phone. */
function Group({ heading, items, more }: { heading: string; items: FooterLink[]; more?: FooterLink }) {
  return (
    <div>
      <details className="group border-b border-stone-300 lg:hidden">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between font-sans text-label font-medium uppercase text-stone-600 [&::-webkit-details-marker]:hidden">
          {heading}
          <Plus aria-hidden="true" className="h-5 w-5 shrink-0 transition-transform group-open:rotate-45" />
        </summary>
        <nav aria-label={`Footer: ${heading}`} className="pb-4"><Links items={items} more={more} /></nav>
      </details>
      <nav aria-label={`Footer: ${heading}`} className="hidden lg:block">
        <h2 className="mb-3 font-sans text-label font-medium uppercase text-stone-500">{heading}</h2>
        <Links items={items} more={more} />
      </nav>
    </div>
  )
}

function LondonMap() {
  const newham = MAP.b.find((b) => b.slug === 'newham')!
  return (
    <svg viewBox={`0 0 ${MAP.w} ${MAP.h}`} className="h-auto w-full" role="group" aria-label={`Map of the ${MAP.b.length} London areas we cover. Each one links to its page.`}>
      {MAP.b.map((b) => {
        const name = boroughMeta[b.slug]?.name ?? b.slug
        return (
          <a key={b.slug} href={`/areas/${b.slug}`} aria-label={`EPC in ${name}`} className="cf-b">
            <title>{name}</title>
            <path d={b.d} className={b.slug === 'newham' ? 'cf-home' : undefined} />
          </a>
        )
      })}
      {/* Stratford, in the north-west of Newham */}
      <g aria-hidden="true" transform={`translate(${newham.cx - 18} ${newham.cy - 26})`}>
        <circle r="26" fill="#3A624E" opacity=".18" className="cf-pulse" />
        <circle r="9" fill="#fff" stroke="#3A624E" strokeWidth="4" />
      </g>
    </svg>
  )
}

export function CompactFooter() {
  return (
    <footer className="border-t border-stone-200 bg-stone-100 text-stone-700 [overflow-wrap:anywhere]">
      <div className="mx-auto max-w-[1216px] px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-10 sm:px-6 md:pb-8 lg:px-8 lg:pt-14">
        <div className="grid gap-6 rounded-[28px] bg-sage-700 p-6 text-white sm:p-8 lg:grid-cols-[minmax(0,1.2fr)_auto] lg:items-center lg:p-10">
          <div>
            <p className="font-serif text-[1.7rem] leading-[1.15] lg:text-[2.2rem]">Questions before you book?</p>
            <p className="mt-2 max-w-[48ch] text-[15px] leading-6 text-white/85">Call or message Abdul, the assessor who does the visit. Every day, 8am to 8pm.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <a href={site.phoneHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-[15px] font-semibold text-sage-800 hover:bg-stone-100"><Phone aria-hidden="true" className="h-4 w-4" /> {site.phone}</a>
            <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sage-800 px-5 text-[15px] font-semibold text-white hover:bg-[#233B2F]"><MessageCircle aria-hidden="true" className="h-4 w-4" /> WhatsApp</a>
            <Link prefetch={false} href={quoteHref()} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/60 px-5 text-[15px] font-semibold text-white hover:bg-white/10">Get a quote</Link>
          </div>
        </div>

        {/* Where we work: the map beside the busiest areas as text links. */}
        <div className="grid gap-8 border-b border-stone-300 py-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center lg:gap-14">
          <LondonMap />
          <div>
            <p className="font-sans text-label font-medium uppercase text-stone-500">Where we work</p>
            <p className="mt-3 max-w-[22ch] font-serif text-[1.75rem] leading-[1.15] text-stone-900 lg:text-[2.1rem]">Every London borough, from Stratford, E15.</p>
            <p className="mt-3 max-w-[46ch] text-[15px] leading-6 text-stone-700">Domestic EPCs and floor plans in all 32 London boroughs and the City of London. One price in every borough, with no travel charges.</p>
            <nav aria-label="Footer: busiest areas" className="mt-6">
              <h2 className="mb-3 font-sans text-label font-medium uppercase text-stone-500">Busiest areas</h2>
              <Links items={footerAreas} more={[`All ${footerAreaCount} London areas`, '/areas']} cols={2} />
            </nav>
          </div>
        </div>

        <div className="grid gap-x-10 pt-10 lg:grid-cols-[1.3fr_1fr_1.2fr_1fr] lg:pt-12">
          <div className="pb-8 lg:pb-0">
            <LogoLockup />
            <p className="mt-4 max-w-[34ch] text-[15px] leading-6 text-stone-700">Domestic EPCs and floor plans in all 32 London boroughs and the City of London. Based in Stratford, London E15.</p>
            <a href={site.emailHref} className="mt-3 inline-flex min-h-11 items-center whitespace-nowrap text-[14px] text-sage-700 underline underline-offset-4">{site.email}</a>
            <GoogleRating className="mt-2 flex max-w-[16rem] flex-wrap items-center gap-x-2 gap-y-1 text-sm text-stone-700 hover:text-sage-700" />
          </div>
          <Group heading="Services" items={footerServices} />
          <Group heading="Guides" items={footerGuides} more={['All guides', '/blog']} />
          <Group heading="Company" items={footerCompany} />
        </div>

        {/* Accreditation: both scheme numbers as text, and the public register to check them. */}
        <div className="mt-10 flex flex-wrap items-center gap-2.5 border-t border-stone-300 pt-6 lg:mt-12">
          {[elmhurst, quidos].map((x) => (
            <span key={x.number} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-stone-300 bg-white px-3.5 text-[13.5px] text-stone-800">
              <span className="font-semibold">{x.short}</span><span className="opacity-75">{x.number}</span>
            </span>
          ))}
          <a href={site.assessor.verifyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1 text-[13.5px] text-sage-700 underline underline-offset-4 hover:text-sage-800">
            Check the GOV.UK register <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="mt-4 flex flex-col gap-1 text-[13.5px] text-stone-600 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
          <p className="leading-6">© {new Date().getFullYear()} {site.name}. Part of {site.parentBrand}.</p>
          <a href="/privacy-policy#analytics-choices" className="inline-flex min-h-11 items-center underline-offset-4 hover:text-sage-700 hover:underline">Privacy &amp; analytics choices</a>
          <Link prefetch={false} href="/terms" className="inline-flex min-h-11 items-center underline-offset-4 hover:text-sage-700 hover:underline">Terms of Service</Link>
          <a href="https://digital.luminousanddeliver.co.uk/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline-offset-4 hover:text-sage-700 hover:underline sm:ml-auto">Made by L&amp;D Digital</a>
        </div>
      </div>
    </footer>
  )
}
