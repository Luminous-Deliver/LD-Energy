import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { Ico } from '@/components/sections/home/HomeIcon'
import { pricing, type PricingBand } from '@/lib/site'
import { quoteHref, type QuoteService } from '@/lib/quote-context'
import type { SourcePage } from '@/lib/enquiry-attribution'
import type { AreaChoice } from '@/lib/floor-area'

/*
 * The parts the four service pages share (rollout group B, 24/10/2026), built on the inner-page parts in app/inner.css
 * the way /landlords uses them: breadcrumbs, the title-block price list for one service, and the FAQ list. Styles in
 * ./services.css, scoped under .sv.
 */

export type ServiceFaq = { q: string; a: string; body?: React.ReactNode }

export function Crumbs({ label }: { label: string }) {
  return (
    <nav className="in-crumbs" aria-label="Breadcrumb">
      <ol>
        <li><Link href="/">Home</Link><span className="sep" aria-hidden="true">›</span></li>
        <li><span aria-current="page">{label}</span></li>
      </ol>
    </nav>
  )
}

/**
 * One service's column of the price list as a drawing's title block: every size opens the quote with this service and
 * that size filled in, plus a last row for people who don't know their size.
 */
export function PriceBlock({
  id, service, column, sourcePage, head, foot, unknownLabel = 'Not sure of the size', className,
}: {
  id: string
  service: QuoteService
  column: 'epc' | 'floorPlan' | 'preAssessment' | 'bundle'
  sourcePage: SourcePage
  head: Array<{ k: string; v: React.ReactNode }>
  foot: React.ReactNode
  unknownLabel?: string
  className?: string
}) {
  const href = (area: AreaChoice) => quoteHref({ service, area, sourcePage, ctaId: 'pricing' })
  return (
    <aside className={`in-tb sv-tb${className ? ` ${className}` : ''}`} aria-labelledby={id}>
      <div className="in-tb__head">
        {head.map((h, i) => <div key={h.k}><span>{h.k}</span><b id={i === 0 ? id : undefined}>{h.v}</b></div>)}
      </div>
      <div className="in-tb__cols" aria-hidden="true"><span>Floor area</span><span>Price</span><span /></div>
      <ul className="in-tb__rows">
        {pricing.map((b: PricingBand) => (
          <li key={b.id}>
            <a href={href(b.id as AreaChoice)}>
              <span className="in-tb__s">{b.areaLabel}<small>{b.typicalLabel}</small></span>
              <span className="in-tb__p num">{b.startingPrice && <small>from</small>}£{b[column]}</span>
              <Ico name="arrow-right" size={16} />
            </a>
          </li>
        ))}
        <li>
          <a className="is-common" href={href('unknown')}>
            <span className="in-tb__s">{unknownLabel}<small>We confirm it from your property details</small></span>
            {/* not "booking": tests/review-layout.cjs keeps "book" out of every quote link's label */}
            <span className="in-tb__p in-tb__p--tbc">Exact quote</span>
            <Ico name="arrow-right" size={16} />
          </a>
        </li>
      </ul>
      <div className="in-tb__foot">{foot}</div>
    </aside>
  )
}

export function FaqList({ faqs }: { faqs: ServiceFaq[] }) {
  return (
    <div className="in-faq">
      {faqs.map((f, i) => (
        <details key={f.q} open={i === 0}>
          <summary><span>{f.q}</span><ChevronDown size={20} className="i" aria-hidden="true" /></summary>
          <div className="in-faq__a">{f.body ?? <p>{f.a}</p>}</div>
        </details>
      ))}
    </div>
  )
}

export function faqSchema(faqs: ServiceFaq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
}

/** A ticked list in the inner-page style. */
export function Ticks({ items, className }: { items: React.ReactNode[]; className?: string }) {
  return (
    <ul className={`in-ticks${className ? ` ${className}` : ''}`}>
      {items.map((item, i) => <li key={i}><Ico name="check" size={20} /><span>{item}</span></li>)}
    </ul>
  )
}
