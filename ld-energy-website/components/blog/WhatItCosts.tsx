import Link from 'next/link'
import { pricing, formatPrice } from '@/lib/site'
import { Price } from './Price'

/**
 * Short "What it costs" block on every guide (plan §15 row 5). Every figure comes from lib/site.ts,
 * so it can never drift from /pricing.
 */
export function WhatItCosts() {
  return (
    <section aria-labelledby="what-it-costs" className="not-prose my-12 rounded-lg border border-secondary-200 bg-white p-5 md:p-8">
      <h2 id="what-it-costs" className="text-xl md:text-2xl font-bold text-secondary-900">
        What it costs
      </h2>
      <p className="mt-2 text-secondary-700">
        An EPC is priced by the home&rsquo;s internal floor area. Guide prices:
      </p>
      <ul className="mt-4 divide-y divide-secondary-100 border-y border-secondary-100">
        {pricing.map((band) => (
          <li key={band.id} className="flex items-baseline justify-between gap-4 py-2.5">
            <span>
              <span className="font-medium text-secondary-900">{band.areaLabel}</span>
              <span className="block text-sm text-secondary-500">{band.typicalLabel}</span>
            </span>
            <span className="shrink-0 font-semibold text-secondary-900">
              {band.startingPrice ? 'from ' : ''}£{formatPrice(band.epc)}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-secondary-700">
        A floor plan at the same visit saves up to <Price item="maxBundleSaving" />. Same-day lodgement
        is <Price item="sameDayLodgement" /> extra, and a next-day visit with the EPC lodged that day is{' '}
        <Price item="nextDayVisit" /> extra. Your exact price is confirmed before you book.
      </p>
      <p className="mt-3">
        <Link href="/pricing" className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800">
          See every price
        </Link>
      </p>
    </section>
  )
}
