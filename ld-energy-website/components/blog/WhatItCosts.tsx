import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { pricing, formatPrice } from '@/lib/site'
import { Price } from './Price'

/**
 * Short "What it costs" block on every guide (plan §15 row 5). Every figure comes from lib/site.ts,
 * so it can never drift from /pricing.
 */
export function WhatItCosts() {
  return (
    <section aria-labelledby="what-it-costs" className="gd-cost">
      <h2 id="what-it-costs">What it costs</h2>
      <p className="gd-cost__lede">An EPC is priced by the home&rsquo;s internal floor area. Guide prices:</p>
      <ul>
        {pricing.map((band) => (
          <li key={band.id}>
            <b>{band.areaLabel}</b>
            <small>{band.typicalLabel}</small>
            <span className="p num">
              {band.startingPrice && <small>from</small>}£{formatPrice(band.epc)}
            </span>
          </li>
        ))}
      </ul>
      <p className="gd-cost__fine">
        A floor plan at the same visit saves up to <Price item="maxBundleSaving" />. Same-day lodgement is{' '}
        <Price item="sameDayLodgement" /> extra, and a next-day visit with the EPC lodged that day is{' '}
        <Price item="nextDayVisit" /> extra. Your exact price is confirmed before you book.
      </p>
      <Link href="/pricing" className="gd-link gd-cost__more">
        See every price <ArrowRight className="gd-arrow" width={16} height={16} aria-hidden="true" />
      </Link>
    </section>
  )
}
