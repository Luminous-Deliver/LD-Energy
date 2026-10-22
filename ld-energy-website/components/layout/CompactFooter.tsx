import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { GoogleRating } from '@/components/ui/GoogleRating'
import { WhatsAppIcon, PhoneIcon, MailIcon } from '@/components/ui/BrandIcons'
import { site } from '@/lib/site'
import { priorityBoroughs } from '@/lib/boroughs'
import { whatsappQuoteHref } from '@/lib/area-page'

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

function Links({ items, cols }: { items: FooterLink[]; cols?: boolean }) {
  return (
    <ul className={cols ? 'ft__links ft__links--cols' : 'ft__links'}>
      {items.map(([label, href]) => (
        <li key={href}>
          <Link prefetch={false} href={href}>{label}</Link>
        </li>
      ))}
    </ul>
  )
}

// The prototype v7.2 footer (night ground, the logo and one line, ruled contact rows, hairline legal row), holding
// the live site's three link groups unchanged: their lists and order are data above, shared with the other branches.
export function CompactFooter() {
  return (
    <footer className="ft">
      <Container className="ft__in">
        <div className="cf-grid ft__grid">
          <div className="cf-brand ft__brand">
            <Link prefetch={false} href="/" className="inline-flex min-h-11 items-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- the master compact lockup, reversed; a vector */}
              <img src="/brand/ld-energy-compact-reversed.svg" alt="L&amp;D Energy" width={150} height={25} loading="lazy" decoding="async" />
            </Link>
            <div>
              <p>EPCs and floor plans across London.</p>
              <p className="ft__quiet">{site.name} · Stratford E15, London</p>
            </div>
            {/* WhatsApp before the phone (Abdul 22/10); the number stays here and in the close */}
            <ul className="cf-contact ft__contact">
              <li><a href={whatsappQuoteHref()} target="_blank" rel="noopener noreferrer"><WhatsAppIcon />WhatsApp</a></li>
              <li><a href={site.phoneHref}><PhoneIcon />{site.phone}</a></li>
              <li><a href={site.emailHref}><MailIcon />{site.email}</a></li>
            </ul>
            <div className="cf-proof">
              <GoogleRating className="ft__rating flex flex-wrap items-center gap-x-2 gap-y-1" starClassName="h-4 w-4 fill-[#B7CEC1] text-[#B7CEC1]" />
            </div>
          </div>
          <div className="ft__groups">
            {groups.map(({ heading, items, listClassName }) => (
              <nav key={heading} aria-label={`Footer ${heading}`} className={listClassName ? 'ft__group--wide' : undefined}>
                <h2 className="ft__h">{heading}</h2>
                <Links items={items} cols={!!listClassName} />
              </nav>
            ))}
          </div>
        </div>
        <div className="ft__legal">
          <p>© {new Date().getFullYear()} {site.name}. Part of {site.parentBrand}.</p>
          <a href="/privacy-policy#analytics-choices">Privacy &amp; analytics choices</a>
          <Link prefetch={false} href="/terms">Terms of Service</Link>
          <a href="https://digital.luminousanddeliver.co.uk/" target="_blank" rel="noopener noreferrer" className="push">Made by L&amp;D Digital</a>
        </div>
      </Container>
    </footer>
  )
}
