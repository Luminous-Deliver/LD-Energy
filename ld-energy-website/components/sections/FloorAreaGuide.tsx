'use client'

import type { SourcePage } from '@/lib/enquiry-attribution'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Ruler } from 'lucide-react'
import { cn } from '@/lib/cn'
import { GuidePriceNote } from '@/components/ui/GuidePriceNote'
import { Disclosure } from '@/components/ui/Disclosure'
import { areaBands } from '@/lib/floor-area'
import { quoteHref } from '@/lib/quote-context'
import { conversionEvent } from '@/lib/conversion-events'
import { guideEstimate } from '@/lib/pricing-estimate'
import { EXPRESS_SPEED } from '@/lib/booking-options'
import {
  pricing,
  formatPrice,
  type PricingBand,
  type PropertyType,
} from '@/lib/site'

/**
 * Floor-area guide estimator.
 *
 * The information hierarchy is the whole point: floor area is the real pricing
 * driver, so m² is the dominant element in every band and the bedroom
 * description is a muted caption. Reversing those two is what led customers to
 * believe bedroom count *was* the pricing rule and the number was final.
 *
 * A banded selector rather than a slider (which would imply precision guide
 * pricing doesn't have) or a six-column table (which cannot survive 390px).
 *
 * On mobile the bands and result sit behind a native <details> disclosure —
 * they are the tallest part of the section — while the heading, the m²
 * explanation and the guide-price caveat stay visible. BandPicker and
 * ResultPanel are shared by both states so the markup never diverges.
 */
function BandPicker({
  selected,
  onSelect,
  sourcePage,
}: {
  sourcePage: SourcePage
  selected: PropertyType | 'unknown' | undefined
  onSelect: (t: PropertyType | 'unknown') => void
}) {
  return (
    <fieldset>
      <legend className="sr-only">Choose an internal floor area range</legend>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {pricing.map((p) => {
          const active = p.type === selected
          return (
            <button
              key={p.type}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(p.type)}
              className={cn(
                'flex min-h-[44px] flex-col rounded-xl border p-3.5 text-left transition-all duration-200',
                active
                  ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500'
                  : 'border-secondary-200 bg-white hover:border-secondary-300 hover:bg-secondary-50',
              )}
            >
              {/* PRIMARY: floor area */}
              <span className="text-xl font-bold tracking-tight text-secondary-900">{p.areaLabel}</span>
              {/* SECONDARY: familiar reference, deliberately muted */}
              <span className="mt-0.5 text-sm text-secondary-600">{p.typicalLabel}</span>
            </button>
          )
        })}
        <button type="button" aria-pressed={selected === 'unknown'} onClick={() => onSelect('unknown')}
          className={cn('min-h-[48px] rounded-xl border p-3.5 text-left text-base text-secondary-900', selected === 'unknown' ? 'border-primary-700 bg-primary-50 ring-1 ring-primary-700' : 'border-secondary-300')}>
          Not sure of floor area
        </button>
      </div>

      <p className="mt-3.5 text-sm text-secondary-600">
        Not sure of your floor area? You can{' '}
        <Link
          href={quoteHref({ area: 'unknown', sourcePage, ctaId: 'estimator' })}
          className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800"
        >
          send us the address
        </Link>{' '}
        and we&rsquo;ll work it out for you.
      </p>
    </fieldset>
  )
}

function ResultPanel({ band, unknown, sourcePage }: { band?: PricingBand; unknown?: boolean; sourcePage: SourcePage }) {
  if (!band) return <div className="rounded-2xl border border-secondary-200 bg-white p-5 shadow-premium">
    <p className="text-base text-secondary-800">{unknown ? 'Your exact quote will be confirmed after reviewing the property details.' : 'Choose an internal floor area band to see guide estimates. Your exact quote is confirmed before booking.'}</p>
    <Link href={quoteHref({ area: unknown ? 'unknown' : undefined, sourcePage, ctaId: 'estimator' })} className="mt-4 inline-flex min-h-[48px] items-center rounded-lg bg-primary-700 px-4 py-3 text-base font-semibold text-white">Get my exact quote</Link>
  </div>
  const areaBand = areaBands[pricing.indexOf(band)]
  const epc = guideEstimate({ areaBand, services: ['EPC Certificate'] })
  const floorPlan = guideEstimate({ areaBand, services: ['Floor Plan'] })
  const bundle = guideEstimate({ areaBand, services: ['Both (Bundle)'] })
  const express = guideEstimate({ areaBand, services: ['EPC Certificate'], speed: EXPRESS_SPEED })
  return (
    <div className="rounded-2xl border border-secondary-200 bg-white p-5 shadow-premium">
      <p className="text-xs font-semibold uppercase tracking-widest text-secondary-600">Guide estimate</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-secondary-900">{band.areaLabel}</p>
      <p className="text-sm text-secondary-600">{band.typicalLabel}</p>

      <dl className="mt-4 divide-y divide-secondary-100 border-t border-secondary-100">
        <div className="flex items-baseline justify-between gap-3 py-2.5">
          <dt className="text-sm text-secondary-700">EPC guide</dt>
          <dd className="text-base font-bold text-secondary-900">
            <span className="text-xs font-medium text-secondary-600">from </span>{`£${epc.total}`}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 py-2.5">
          <dt className="text-sm text-secondary-700">Floor plan guide</dt>
          <dd className="text-base font-bold text-secondary-900">
            <span className="text-xs font-medium text-secondary-600">from </span>{`£${floorPlan.total}`}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 bg-accent-50/60 py-2.5">
          <dt className="text-sm font-semibold text-secondary-900">
            Both together
            <span className="block text-xs font-normal text-secondary-600">One visit, both services</span>
          </dt>
          <dd className="text-right">
            <span className="text-base font-bold text-accent-700">
              <span className="text-xs font-medium text-secondary-600">from </span>{`£${bundle.total}`}
            </span>
            <span className="block text-xs font-semibold text-accent-700">
              Save {`£${formatPrice(bundle.bundleDiscount)}`}
            </span>
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 py-2.5">
          <dt className="text-sm text-secondary-700">
            Next-day service
            <span className="block text-xs text-secondary-600">Fixed addition to your quote</span>
          </dt>
          <dd className="text-base font-bold text-secondary-900">+{`£${express.express}`}</dd>
        </div>
      </dl>

      <p className="mt-3 text-xs text-secondary-600">
        Next day works out around {`£${express.total}`} for the EPC on this size of property.
      </p>

      <Link
        href={quoteHref({ service: 'epc', area: areaBand, sourcePage, ctaId: 'estimator' })}
        className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-600 to-accent-700 px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:from-accent-700 hover:to-accent-800"
      >
        Get my exact quote
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  )
}

export function FloorAreaGuide({ sourcePage }: { sourcePage: SourcePage }) {
  const [selected, setSelected] = useState<PropertyType | 'unknown'>()
  const band = pricing.find((p) => p.type === selected)
  const selectBand = (value: PropertyType | 'unknown') => {
    setSelected(value)
    conversionEvent('estimator_use', { area: value === 'unknown' ? 'unknown' : areaBands[pricing.findIndex(p => p.type === value)] })
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2.5">
        <Ruler className="h-5 w-5 shrink-0 text-primary-700" aria-hidden="true" />
        <h3 className="text-lg font-bold text-secondary-900">Guide pricing by floor area</h3>
      </div>
      <p className="mt-2 max-w-2xl text-secondary-700">
        Internal floor area (m²) is the main factor in our pricing. Bedroom count is shown only as a
        rough reference. Select your floor area, or choose “Not sure of floor area”.
      </p>

      {/* Tablet and desktop: always visible */}
      <div className="mt-5 hidden gap-5 md:grid lg:grid-cols-12">
        <div className="lg:col-span-7">
          <BandPicker sourcePage={sourcePage} selected={selected} onSelect={selectBand} />
        </div>
        <div className="lg:col-span-5">
          <ResultPanel sourcePage={sourcePage} band={band} unknown={selected === 'unknown'} />
        </div>
      </div>

      {/* Mobile: the bands and result are the tallest part of the section, so
          they sit behind a native disclosure. Everything that communicates the
          pricing *principle* stays visible above it. */}
      <div className="mt-4 md:hidden">
        <Disclosure summary="View guide prices by floor area">
          <div className="grid gap-5">
            <BandPicker sourcePage={sourcePage} selected={selected} onSelect={selectBand} />
            <ResultPanel sourcePage={sourcePage} band={band} unknown={selected === 'unknown'} />
          </div>
        </Disclosure>
      </div>

      <GuidePriceNote className="mt-5" />
    </div>
  )
}
