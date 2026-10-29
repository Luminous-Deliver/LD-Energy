import Link from 'next/link'
import { ExternalLink, MapPin, MessageCircle, Phone } from 'lucide-react'
import { LogoLockup } from '@/components/layout/Header'
import { GoogleRating } from '@/components/ui/GoogleRating'
import { site } from '@/lib/site'
import { boroughMeta } from '@/lib/boroughs'
import londonMap from '@/lib/london-map.json'
import { quoteHref } from '@/lib/quote-context'
import {
  footerAreaCount, footerAreas, footerCompany, footerGuides, footerServices, type FooterLink,
} from '@/lib/footer-links'

/* Three footer options for Abdul's pick (29/10/2026), shown on /footer-options on the footer-v2 preview only.
   Each one replaces the skyline drawing above the footer. References measured: Monzo (rounded panel, oversized
   wordmark), Pimlico Plumbers (phone first, accreditation row), Linear and Stripe (quiet columns). */

const MAP = londonMap as { w: number; h: number; b: { slug: string; d: string; cx: number; cy: number }[] }
const [elmhurst, quidos] = site.assessor.accreditations

function Group({ heading, items, more, tone = 'dark', cols = 1 }: {
  heading: string; items: FooterLink[]; more?: FooterLink; tone?: 'dark' | 'light'; cols?: 1 | 2
}) {
  const a = tone === 'dark'
    ? 'text-stone-300 hover:text-night-link'
    : 'text-stone-700 hover:text-sage-700'
  return (
    <nav aria-label={`Footer: ${heading}`}>
      <h2 className={`mb-3 font-sans text-label font-medium uppercase ${tone === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>{heading}</h2>
      <ul className={cols === 2 ? 'grid grid-cols-2 gap-x-6' : undefined}>
        {items.map(([label, href]) => (
          <li key={href}>
            <Link prefetch={false} href={href} className={`inline-flex min-h-11 items-center text-[15px] leading-6 underline-offset-4 hover:underline lg:min-h-9 ${a}`}>{label}</Link>
          </li>
        ))}
        {more && (
          <li className={cols === 2 ? 'col-span-2' : undefined}>
            <Link prefetch={false} href={more[1]} className={`inline-flex min-h-11 items-center text-[15px] font-semibold underline-offset-4 hover:underline lg:min-h-9 ${tone === 'dark' ? 'text-night-link' : 'text-sage-700'}`}>{more[0]} →</Link>
          </li>
        )}
      </ul>
    </nav>
  )
}

function Legal({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const c = tone === 'dark' ? 'text-stone-400 hover:text-night-link' : 'text-stone-600 hover:text-sage-700'
  return (
    <div className={`flex flex-col gap-1 text-[13.5px] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 ${tone === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
      <p className="leading-6">© {new Date().getFullYear()} {site.name}. Part of {site.parentBrand}.</p>
      <a href="/privacy-policy#analytics-choices" className={`inline-flex min-h-11 items-center underline-offset-4 hover:underline ${c}`}>Privacy &amp; analytics choices</a>
      <Link prefetch={false} href="/terms" className={`inline-flex min-h-11 items-center underline-offset-4 hover:underline ${c}`}>Terms of Service</Link>
      <a href="https://digital.luminousanddeliver.co.uk/" target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-11 items-center underline-offset-4 hover:underline sm:ml-auto ${c}`}>Made by L&amp;D Digital</a>
    </div>
  )
}

function Accreditation({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const chip = tone === 'dark'
    ? 'border-[rgba(241,239,232,.22)] text-stone-200'
    : 'border-stone-300 text-stone-800 bg-white'
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {[elmhurst, quidos].map((x) => (
        <span key={x.number} className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3.5 text-[13.5px] ${chip}`}>
          <span className="font-semibold">{x.short}</span>
          <span className="opacity-75">{x.number}</span>
        </span>
      ))}
      <a href={site.assessor.verifyUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-9 items-center gap-1 text-[13.5px] underline underline-offset-4 ${tone === 'dark' ? 'text-night-link hover:text-night-ink' : 'text-sage-700 hover:text-sage-800'}`}>
        Check the GOV.UK register <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
      </a>
    </div>
  )
}

/* ─── Option A: rounded panel, phone first, oversized wordmark ─── */
export function FooterA() {
  return (
    <footer className="fo-footer bg-stone-50 pt-6">
      <div className="rounded-t-[28px] bg-night text-stone-400 [overflow-wrap:anywhere] lg:rounded-t-[44px]">
        <div className="mx-auto max-w-[1216px] px-4 pb-8 pt-10 sm:px-6 lg:px-8 lg:pt-16">
          <div className="flex flex-col gap-6 border-b border-[rgba(241,239,232,.14)] pb-10 lg:flex-row lg:items-end lg:justify-between lg:pb-14">
            <div>
              <p className="font-sans text-label font-medium uppercase text-stone-400">Talk to your assessor</p>
              <a href={site.phoneHref} className="mt-3 block font-serif text-[2.6rem] leading-none text-night-ink hover:text-night-link lg:text-[4rem]">{site.phone}</a>
              <p className="mt-3 text-[15px] text-stone-300">Every day, 8am to 8pm · <a href={site.emailHref} className="underline underline-offset-4 hover:text-night-link">{site.email}</a></p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:flex">
              <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-night-link px-6 text-[15px] font-semibold text-night hover:bg-night-ink">
                <MessageCircle aria-hidden="true" className="h-4 w-4" /> WhatsApp
              </a>
              <Link prefetch={false} href={quoteHref()} className="inline-flex min-h-12 items-center justify-center rounded-full border border-[rgba(241,239,232,.4)] px-6 text-[15px] font-semibold text-night-ink hover:border-night-link hover:text-night-link">Get a quote</Link>
            </div>
          </div>

          <div className="grid gap-8 pt-10 sm:grid-cols-2 lg:grid-cols-[1fr_1.25fr_1.5fr_1fr] lg:gap-10 lg:pt-14">
            <Group heading="Services" items={footerServices} />
            <Group heading="Guides" items={footerGuides} more={['All guides', '/blog']} />
            <Group heading="Areas we cover" items={footerAreas} more={[`All ${footerAreaCount} London areas`, '/areas']} cols={2} />
            <Group heading="Company" items={footerCompany} />
          </div>

          <div className="mt-12 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Accreditation />
            <GoogleRating className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-stone-300 hover:text-night-link" />
          </div>
          <p className="mt-6 max-w-[70ch] text-[15px] leading-6 text-stone-300">
            {site.name} produces domestic EPCs and floor plans in all 32 London boroughs and the City of London, from
            Stratford, E15. One price in every borough, with no travel charges.
          </p>
        </div>
        {/* the brand moment: the wordmark (option 2, L&D bold, ENERGY regular) across the full width, quiet on the night ground */}
        <p aria-hidden="true" className="select-none overflow-hidden whitespace-nowrap px-4 pt-6 text-center font-sans uppercase leading-[0.85] tracking-[0.02em] text-[#1A2840] [font-size:clamp(3.4rem,13.2vw,12.5rem)]"><b className="font-bold">L&amp;D</b> Energy</p>
        <div className="mx-auto max-w-[1216px] px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-4 sm:px-6 md:pb-6 lg:px-8">
          <Legal />
        </div>
      </div>
    </footer>
  )
}

/* ─── Option B: the coverage map. Every borough is a link; Stratford is marked. ─── */
export function FooterB() {
  const newham = MAP.b.find((b) => b.slug === 'newham')!
  const pin = { x: newham.cx - 18, y: newham.cy - 26 }
  return (
    <footer className="fo-footer border-t-4 border-sage-700 bg-night text-stone-400 [overflow-wrap:anywhere]">
      <div className="mx-auto max-w-[1216px] px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-10 sm:px-6 md:pb-8 lg:px-8 lg:pt-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <p className="font-sans text-label font-medium uppercase text-stone-400">Where we work</p>
            <p className="mt-3 max-w-[24ch] font-serif text-[1.75rem] leading-[1.15] text-night-ink lg:text-[2.1rem]">
              Every London borough, from Stratford, E15.
            </p>
            <svg viewBox={`0 0 ${MAP.w} ${MAP.h}`} className="mt-6 h-auto w-full" role="group" aria-label={`Map of the ${MAP.b.length} London areas we cover. Each one links to its page.`}>
              {MAP.b.map((b) => {
                const name = boroughMeta[b.slug]?.name ?? b.slug
                return (
                  <a key={b.slug} href={`/areas/${b.slug}`} aria-label={`EPC in ${name}`} className="fo-borough">
                    <title>{name}</title>
                    <path d={b.d} className={b.slug === 'newham' ? 'fo-home' : undefined} />
                  </a>
                )
              })}
              <g aria-hidden="true" transform={`translate(${pin.x} ${pin.y})`}>
                <circle r="26" fill="#B7CEC1" opacity=".22" />
                <circle r="9" fill="#B7CEC1" stroke="#0B1528" strokeWidth="3" />
              </g>
            </svg>
            <p className="mt-3 flex items-center gap-2 text-[15px] text-stone-300">
              <MapPin aria-hidden="true" className="h-4 w-4 text-night-link" /> Based in Stratford, London E15 · one price in every borough
            </p>
            <Link prefetch={false} href="/areas" className="mt-1 inline-flex min-h-11 items-center text-[15px] font-semibold text-night-link underline-offset-4 hover:underline">All {footerAreaCount} London areas →</Link>
          </div>

          <div>
            <address className="not-italic">
              <div className="grid grid-cols-2 gap-3">
                <a href={site.phoneHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[rgba(241,239,232,.3)] px-4 text-[15px] font-semibold text-night-ink hover:border-night-link hover:text-night-link">
                  <Phone aria-hidden="true" className="h-4 w-4" /> {site.phone}
                </a>
                <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-night-link px-4 text-[15px] font-semibold text-night hover:bg-night-ink">
                  <MessageCircle aria-hidden="true" className="h-4 w-4" /> WhatsApp
                </a>
              </div>
              <p className="mt-4 text-[15px] leading-7 text-stone-300">
                <a href={site.emailHref} className="text-night-ink underline-offset-4 hover:underline">{site.email}</a><br />
                Every day, 8am to 8pm
              </p>
            </address>
            <div className="mt-8 grid grid-cols-1 gap-8 border-t border-[rgba(241,239,232,.14)] pt-8 sm:grid-cols-2">
              <Group heading="Services" items={footerServices} />
              <Group heading="Guides" items={footerGuides} more={['All guides', '/blog']} />
              <Group heading="Company" items={footerCompany} />
              <div className="space-y-4">
                <GoogleRating className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-stone-300 hover:text-night-link" />
                <Link prefetch={false} href={quoteHref()} className="ld-btn ld-btn--primary">Get my exact quote</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-[rgba(241,239,232,.14)] pt-6"><Accreditation /></div>
        <div className="mt-6"><Legal /></div>
      </div>
    </footer>
  )
}

/* ─── Option C: light footer on the paper ground, a sage contact card leading it ─── */
export function FooterC() {
  return (
    <footer className="fo-footer border-t border-stone-200 bg-stone-100 text-stone-700 [overflow-wrap:anywhere]">
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

        <div className="grid gap-8 pt-12 sm:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1.2fr_1.5fr_1fr] lg:gap-10">
          <div>
            <LogoLockup />
            <p className="mt-4 text-[15px] leading-6 text-stone-700">Domestic EPCs and floor plans in all 32 London boroughs and the City of London. Based in Stratford, London E15.</p>
            <a href={site.emailHref} className="mt-3 inline-flex min-h-11 items-center whitespace-nowrap text-[14px] text-sage-700 underline underline-offset-4">{site.email}</a>
            <GoogleRating className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-stone-700 hover:text-sage-700" />
          </div>
          <Group tone="light" heading="Services" items={footerServices} />
          <Group tone="light" heading="Guides" items={footerGuides} more={['All guides', '/blog']} />
          <Group tone="light" heading="Areas we cover" items={footerAreas} more={[`All ${footerAreaCount} London areas`, '/areas']} cols={2} />
          <Group tone="light" heading="Company" items={footerCompany} />
        </div>
        <div className="mt-12 border-t border-stone-300 pt-6"><Accreditation tone="light" /></div>
        <div className="mt-4"><Legal tone="light" /></div>
      </div>
    </footer>
  )
}
