'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, FileText, Layers, LayoutPanelLeft, type LucideIcon } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { areaBands, areaChoices, areaLabel, type AreaChoice } from '@/lib/floor-area'
import { maxBundleSaving, priceFrom, pricing, site } from '@/lib/site'
import { guideEstimate } from '@/lib/pricing-estimate'
import { quoteHref, quoteServices, type QuoteService } from '@/lib/quote-context'

// Points are product facts only: no turnaround, hours or travel-charge promises.
const products: { service: QuoteService; title: string; from: number; description: string; points: string[]; detail: string; detailLabel: string; Icon: LucideIcon }[] = [
  { service: 'epc', title: 'Domestic EPC', from: priceFrom.epc, description: 'On-site energy assessment, lodged certificate and standard recommendation report where applicable.', points: ['Accredited Domestic Energy Assessor', 'Lodged on the GOV.UK EPC Register', 'Valid for 10 years', `Optional £${site.addOns.improvementPlan} Improvement Plan`], detail: '/services/domestic-epc', detailLabel: 'Domestic EPC details', Icon: FileText },
  { service: 'bundle', title: 'EPC + Floor Plan', from: priceFrom.bundle, description: 'Your EPC and a measured marketing floor plan, completed in one property visit.', points: ['Everything in the Domestic EPC', 'Floor plan supplied as JPG and PDF', 'One visit for both services'], detail: '/pricing', detailLabel: 'EPC and floor plan pricing', Icon: Layers },
  { service: 'floor-plan', title: 'Floor Plan', from: priceFrom.floorPlan, description: 'A measured marketing plan with approximate room dimensions, supplied as JPG and PDF.', points: ['Measured on site', 'Layout and approximate room sizes', 'JPG and PDF files', 'For homes with a valid EPC already'], detail: '/services/floor-plans', detailLabel: 'Floor plan details', Icon: LayoutPanelLeft },
]

const pill = 'lg:min-h-11 lg:rounded-full lg:border lg:border-secondary-300 lg:bg-white lg:px-4 lg:no-underline lg:transition-colors lg:hover:border-[#47846E]'

export function HomeServices() {
  const [area, setArea] = useState<AreaChoice | ''>('')
  const totals = products.map((product) => guideEstimate({ services: [quoteServices[product.service]], areaBand: area }).total)
  const bundle = guideEstimate({ services: [quoteServices.bundle], areaBand: area })
  const saving = bundle.state === 'priced' ? `Saves £${bundle.bundleDiscount} on this floor area` : `Save up to £${maxBundleSaving} against booking separately`
  const announcement = !area
    ? ''
    : area === 'unknown'
      ? 'Exact quote after reviewing your property details.'
      : `${areaLabel(area)}. ${products.map((p, i) => `${p.title}: guide estimate £${totals[i]}`).join('. ')}.`

  return (
    <section id="pricing" className="home-section scroll-mt-28 bg-[#F1F6F3] lg:pt-20">
      <Container>
        <span id="services" className="scroll-mt-28" aria-hidden="true" />
        <div className="grid gap-5 lg:grid-cols-1">
          <div>
            <h2 className="home-heading">Services and guide pricing</h2>
            <p className="mt-3 max-w-2xl text-base leading-6">Internal floor area is the main pricing factor. Bedroom counts are only a rough reference.</p>
          </div>
          <div className="lg:hidden">
            <label htmlFor="home-area" className="block text-base font-semibold text-secondary-900">Internal floor area</label>
            <select
              id="home-area"
              value={area}
              onChange={(e) => setArea(areaChoices.includes(e.target.value as AreaChoice) ? (e.target.value as AreaChoice) : '')}
              className="mt-2 min-h-12 w-full rounded-lg border border-secondary-400 bg-white px-3 py-3 text-base text-secondary-900"
            >
              <option value="">Select floor area</option>
              {areaBands.map((band) => <option key={band} value={band}>{areaLabel(band)}</option>)}
              <option value="unknown">Not sure of floor area</option>
            </select>
          </div>
        </div>

        {/* Desktop: the same selection as a measured scale. Shares `area` with the select above. */}
        <fieldset data-area-ruler className="mt-8 hidden lg:block">
          <legend className="text-base font-semibold text-secondary-900">Internal floor area</legend>
          <div className="mt-3 grid grid-cols-[minmax(0,6fr)_minmax(0,1.35fr)] gap-3">
            <div className="grid grid-cols-6 overflow-hidden rounded-2xl border border-secondary-300 bg-white">
              {areaBands.map((band, i) => {
                const active = area === band
                return (
                  <button
                    key={band}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setArea(band)}
                    className={cn(
                      'relative flex min-h-[5.75rem] min-w-0 flex-col justify-center border-l border-secondary-200 px-3 pb-5 pt-3 text-left transition-colors first:border-l-0 focus:outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 focus-visible:ring-offset-0 xl:px-4',
                      active ? 'bg-[#0D1B33] text-white' : 'bg-white text-secondary-900 hover:bg-[#F1F6F3]',
                    )}
                  >
                    <span className="font-serif text-lg font-semibold leading-tight tabular-nums">{pricing[i].areaLabel}</span>
                    <span className={cn('mt-0.5 text-sm leading-5', active ? 'text-[#B9D6C8]' : 'text-secondary-600')}>{pricing[i].label}</span>
                    <span aria-hidden="true" className={cn('ruler-ticks absolute inset-x-0 bottom-0 h-2', active ? 'text-white/50' : 'text-secondary-300')} />
                  </button>
                )
              })}
            </div>
            <button
              type="button"
              aria-pressed={area === 'unknown'}
              onClick={() => setArea('unknown')}
              className={cn(
                'flex min-w-0 flex-col justify-center rounded-2xl border px-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                area === 'unknown' ? 'border-[#0D1B33] bg-[#0D1B33] text-white' : 'border-dashed border-secondary-400 bg-transparent text-secondary-900 hover:bg-white',
              )}
            >
              <span className="text-base font-semibold leading-tight">Not sure of floor area</span>
              <span className={cn('mt-0.5 text-sm leading-5', area === 'unknown' ? 'text-[#B9D6C8]' : 'text-secondary-600')}>Send your property details</span>
            </button>
          </div>
        </fieldset>

        <p aria-live="polite" aria-atomic="true" className="sr-only">{announcement}</p>
        <div className="mt-6 grid gap-4 lg:mt-8 lg:grid-cols-3 lg:gap-6">
          {products.map((product, i) => (
            <article key={product.service} className={cn('relative flex min-w-0 flex-col rounded-xl border bg-white p-5 lg:rounded-2xl lg:p-7 lg:shadow-premium', product.service === 'bundle' ? 'border-[#47846E] ring-1 ring-[#47846E]' : 'border-secondary-200')}>
              {product.service === 'bundle' && (
                <span className="absolute right-4 top-4 rounded-full bg-[#386B59] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white lg:right-6 lg:top-6">Better value</span>
              )}
              <span aria-hidden="true" className={cn('mb-5 hidden h-12 w-12 items-center justify-center rounded-2xl lg:flex', i === 0 ? 'bg-[#386B59] text-white' : 'bg-primary-50 text-primary-700')}>
                <product.Icon className="h-6 w-6" />
              </span>
              <h3 className={cn('text-2xl font-semibold', product.service === 'bundle' && 'pr-28 lg:pr-0')}>{product.title}</h3>
              <p data-home-estimate={product.service} className="mt-2 text-lg font-semibold text-primary-800 lg:mt-3 lg:font-serif lg:text-2xl lg:leading-tight lg:tabular-nums">
                {!area ? `From £${product.from}` : area === 'unknown' ? 'Quote after reviewing your details' : `Guide estimate: £${totals[i]}`}
              </p>
              {product.service === 'bundle' && area !== 'unknown' && <p className="mt-1 text-sm font-semibold text-[#386B59]">{saving}</p>}
              <p className="mt-3 text-base leading-6 text-secondary-700">{product.description}</p>
              <ul className="mt-4 space-y-2 border-t border-secondary-100 pt-4">
                {product.points.map((point) => (
                  <li key={point} className="flex gap-2.5 text-sm leading-6 text-secondary-800">
                    <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-[#386B59]" />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-1 flex-col justify-end lg:mt-6">
                <Button
                  href={quoteHref({ service: product.service, area: area || undefined, sourcePage: 'home', ctaId: area ? 'estimator' : 'pricing' })}
                  variant={i === 0 ? 'accent' : 'secondary'}
                  aria-label={`Get my exact quote for ${product.title}`}
                  className="w-full"
                >
                  Get my exact quote
                </Button>
                <Link prefetch={false} href={product.detail} className="home-link mt-1 lg:mt-2">
                  {product.detailLabel} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-4 text-base leading-6 lg:mt-6">
          {area === 'unknown'
            ? 'You can continue without a floor-area band. We will confirm your exact quote after reviewing the property details.'
            : 'Guide price ≠ final quote. We confirm your exact price and available appointment before you book.'}
        </p>
        <details id="good-to-know" className="mt-3 scroll-mt-28 border-y border-secondary-300">
          <summary className="cursor-pointer py-3 text-base font-semibold text-secondary-900">How guide pricing works</summary>
          <div className="pb-4 text-base leading-6">
            <p>Starting prices apply to properties up to 37 m². Size, layout, extensions and access inform the final quote. Any travel or urgent-service charge is confirmed before you agree to a visit.</p>
            <Link prefetch={false} href="/pricing" className="home-link">See all six floor-area price bands →</Link>
          </div>
        </details>
        <div className="mt-3 flex flex-wrap gap-x-6 lg:mt-6 lg:gap-3">
          <Link prefetch={false} href="/services/epc-pre-assessment" className={cn('home-link', pill)}>Private EPC Pre-Assessment →</Link>
          <Link prefetch={false} href="/services/epc-improvement-plan" className={cn('home-link', pill)}>Additional £{site.addOns.improvementPlan} Improvement Plan →</Link>
          <Link prefetch={false} href={quoteHref({ service: 'bulk', sourcePage: 'home', ctaId: 'inline' })} className={cn('home-link', pill)}>Agency / portfolio enquiry →</Link>
        </div>
      </Container>
    </section>
  )
}
