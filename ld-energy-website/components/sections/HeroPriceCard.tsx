import { ArrowRight, ExternalLink, ShieldCheck, Star } from 'lucide-react'
import { pricing, site, type PricingBand } from '@/lib/site'
import { areaBands } from '@/lib/floor-area'
import { quoteHref, type QuoteService, type AreaPage } from '@/lib/quote-context'
import type { SourcePage } from '@/lib/enquiry-attribution'
import { cn } from '@/lib/cn'

type CardService = 'epc' | 'floor-plan' | 'pre-assessment'
interface Column { label: string; service: QuoteService; price: (band: PricingBand) => number }

const columns: Record<CardService, { title: string; cols: Column[] }> = {
  epc: { title: 'Domestic EPC', cols: [
    { label: 'EPC', service: 'epc', price: (b) => b.epc },
    { label: 'With floor plan', service: 'bundle', price: (b) => b.bundle },
  ] },
  'floor-plan': { title: 'Floor plans', cols: [
    { label: 'Floor plan', service: 'floor-plan', price: (b) => b.floorPlan },
    { label: 'With EPC', service: 'bundle', price: (b) => b.bundle },
  ] },
  'pre-assessment': { title: 'EPC Pre-Assessment', cols: [
    { label: 'Pre-Assessment', service: 'pre-assessment', price: (b) => b.epc },
  ] },
}

/**
 * The hero card on every money page (Abdul, 16/10/2026 evening): guide prices with no inputs.
 * Each price is a link that opens /contact with the service and size already chosen, so the
 * visitor answers nothing twice. Static, crawlable text; no client JS above the fold.
 */
export function HeroPriceCard({ sourcePage, service = 'epc', plan, areaPage, className }: {
  sourcePage: SourcePage; service?: CardService; plan?: boolean; areaPage?: AreaPage; className?: string
}) {
  const { title, cols } = columns[service]
  const href = (s: QuoteService, area?: (typeof areaBands)[number] | 'unknown') =>
    quoteHref({ service: s, area, plan, areaPage, sourcePage, ctaId: 'hero' })

  return (
    <div className={cn('hpc', className)} data-cols={cols.length}>
      <div className="hpc__head">
        <p className="hpc__title">Guide prices · {title}</p>
        <p className="hpc__sub">By internal floor area. Choose a price to start your quote.</p>
      </div>
      <table className="hpc__table">
        <caption className="sr-only">{title} guide prices by internal floor area</caption>
        <thead>
          <tr>
            <th scope="col">Floor area</th>
            {cols.map((c) => <th key={c.label} scope="col" className="hpc__num">{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {pricing.map((band, i) => (
            <tr key={band.type}>
              <th scope="row">
                <span className="hpc__area">{band.areaLabel}</span>
                <span className="hpc__typ">{band.typicalLabel}</span>
              </th>
              {cols.map((c) => (
                <td key={c.label} className="hpc__num">
                  <a href={href(c.service, areaBands[i])} className="hpc__price">
                    <span className="sr-only">{c.label}, {band.areaLabel}, from </span>£{c.price(band)}
                  </a>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <a href={href(cols[0].service, 'unknown')} className="hpc__unsure">
        <span>Not sure of the size? <b>We&rsquo;ll work it out from the address</b></span>
        <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
      </a>
      <div className="hpc__foot">
        <p className="hpc__note">
          Guide prices. Your exact price is confirmed before you book. No travel charges.
          {plan && ` The Improvement Plan adds £${site.addOns.improvementPlan}.`}
        </p>
        <p className="hpc__who">
          <ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-[#386B59]" />
          <span>Your assessor <b>{site.assessor.name}</b> · <span className="tabular-nums">{site.assessor.accreditationNumber}</span></span>
        </p>
        <p className="hpc__links">
          <a href={site.assessor.verifyUrl} target="_blank" rel="noopener noreferrer">
            Verify on GOV.UK <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
          </a>
          <a href={site.reviews.profileUrl} target="_blank" rel="noopener noreferrer">
            <Star aria-hidden="true" className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {site.reviews.ratingValue.toFixed(1)} on Google ({site.reviews.reviewCount} reviews)
          </a>
        </p>
      </div>
    </div>
  )
}
