'use client'

import { useState } from 'react'
import { Ico } from '@/components/sections/home/HomeIcon'
import { RollingPrice } from '@/components/forms/RollingPrice'
import { pricing, bundleSaving, formatPrice, type PricingBand } from '@/lib/site'
import { quoteHref, type QuoteService } from '@/lib/quote-context'
import type { AreaChoice } from '@/lib/floor-area'

type Col = { id: QuoteService; key: 'epc' | 'floorPlan' | 'bundle' | 'preAssessment'; label: string; sub?: string; tag?: string; tab: string }

const cols: Col[] = [
  { id: 'epc', key: 'epc', label: 'Domestic EPC', sub: 'Lodged on GOV.UK', tab: 'EPC' },
  { id: 'floor-plan', key: 'floorPlan', label: 'Floor plan', sub: 'Drawn to scale', tab: 'Floor plan' },
  { id: 'bundle', key: 'bundle', label: 'EPC + floor plan', sub: 'One visit', tag: 'Best value', tab: 'EPC + plan' },
  { id: 'pre-assessment', key: 'preAssessment', label: 'Pre-Assessment', sub: 'Guidance only, not lodged', tab: 'Pre-Assessment' },
]

const href = (c: Col, b: PricingBand) => quoteHref({ service: c.id, area: b.id as AreaChoice, sourcePage: 'pricing', ctaId: 'pricing' })
const price = (c: Col, b: PricingBand) => `£${formatPrice(b[c.key])}`

/**
 * /pricing's one price table (redesign 24/10/2026, board-v3 pricing: every price shown up front, no chips, no favourite
 * column). Sizes are rows, the four services are columns, and every price opens the quote with that service and size
 * filled in. Phones show one service at a time through the tabs above the table; the price column rolls digit by digit
 * when the tab changes (RollingPrice, as the quote form). The four service cells stay in the table for desktop; on
 * phones CSS swaps them for the single rolling column.
 */
export function PriceMatrix() {
  const [active, setActive] = useState<Col['id']>('epc')
  const cur = cols.find((c) => c.id === active) ?? cols[0]
  return (
    <div className="pm" data-col={active}>
      <div className="pm__tabs" role="radiogroup" aria-label="Show prices for">
        {cols.map((c) => (
          <button key={c.id} type="button" role="radio" aria-checked={c.id === active} aria-controls="pm-table"
            className="pm__tab" onClick={() => setActive(c.id)}><span className="pm__dot" aria-hidden="true" />{c.tab}</button>
        ))}
      </div>
      <p className="pm__sub" aria-live="polite">{cur.label}{cur.sub && <span> · {cur.sub}</span>}{cur.tag && <b className="pm__tag">{cur.tag}</b>}</p>
      <table className="pm__t" id="pm-table">
        <caption className="sr-only">Guide prices by internal floor area for each service</caption>
        <thead>
          <tr>
            <th scope="col" className="pm__area">Internal floor area</th>
            {cols.map((c) => (
              <th key={c.id} scope="col" className="pm__svc" data-s={c.id}>{c.tag && <b className="pm__tag">{c.tag}</b>}{c.label}{c.sub && <small>{c.sub}</small>}</th>
            ))}
            <th scope="col" className="pm__one">{cur.label}</th>
          </tr>
        </thead>
        <tbody>
          {pricing.map((b) => (
            <tr key={b.id}>
              <th scope="row" className="pm__area">
                <span className="num">{b.areaLabel}</span>
                <small>{b.typicalLabel}</small>
              </th>
              {cols.map((c) => (
                <td key={c.id} className="pm__svc" data-s={c.id}>
                  <a href={href(c, b)} aria-label={`${c.label}, ${b.areaLabel}: ${b.startingPrice ? 'from ' : ''}${price(c, b)}. Start my quote`}>
                    {b.startingPrice && <small>from</small>}
                    <span className="pm__p num">{price(c, b)}</span>
                    {c.key === 'bundle' && !b.startingPrice && <small className="pm__save">save £{formatPrice(bundleSaving(b))}</small>}
                  </a>
                </td>
              ))}
              <td className="pm__one">
                <a href={href(cur, b)}>
                  <span className="pm__p num">
                    {b.startingPrice && <small>from</small>}
                    <RollingPrice text={price(cur, b)} />
                  </span>
                  {cur.key === 'bundle' && !b.startingPrice && <small className="pm__save">save £{formatPrice(bundleSaving(b))}</small>}
                  <Ico name="arrow-right" size={16} />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
