'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowUp, Check, ChevronDown, FileText, Layers, LayoutPanelLeft, type LucideIcon } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { areaBands, areaChoices, areaLabel, type AreaChoice } from '@/lib/floor-area'
import { maxBundleSaving, priceFrom, pricing, site } from '@/lib/site'
import { guideEstimate } from '@/lib/pricing-estimate'
import { quoteHref, quoteServices, type QuoteService } from '@/lib/quote-context'

/** "Up to 37 m²" → "up to 37 m²", for use mid-sentence. */
function inSentence(label: string) {
  return label.charAt(0).toLowerCase() + label.slice(1)
}

// A "from" price is only true for the smallest band. The card names that band so
// visitors do not read £65 as the price for every home.
function cheapestArea(key: keyof typeof priceFrom) {
  return inSentence(pricing.find((band) => band[key] === priceFrom[key])!.areaLabel)
}

// Points are product facts only: no turnaround, hours or travel-charge promises.
const products: { service: QuoteService; title: string; from: number; fromArea: string; description: string; points: string[]; detail: string; detailLabel: string; Icon: LucideIcon }[] = [
  { service: 'epc', title: 'Domestic EPC', from: priceFrom.epc, fromArea: cheapestArea('epc'), description: 'On-site energy assessment, lodged certificate and standard recommendation report where applicable.', points: ['Carried out by an accredited Domestic Energy Assessor', 'Lodged on the official GOV.UK EPC Register', 'Valid for 10 years', 'Certificate link sent once it is live on the register', `Optional £${site.addOns.improvementPlan} Improvement Plan with full Energy Report`], detail: '/services/domestic-epc', detailLabel: 'Domestic EPC details', Icon: FileText },
  { service: 'bundle', title: 'EPC + Floor Plan', from: priceFrom.bundle, fromArea: cheapestArea('bundle'), description: 'Your EPC and a measured marketing floor plan, completed in one property visit.', points: ['Everything in the Domestic EPC', 'Laser-measured floor plan for Rightmove, Zoopla and OnTheMarket', 'Total floor area, approximate room dimensions and labels', 'Supplied as high-resolution JPEG and PDF', 'Both surveys completed in one property visit'], detail: '/pricing', detailLabel: 'EPC and floor plan pricing', Icon: Layers },
  { service: 'floor-plan', title: 'Floor Plan', from: priceFrom.floorPlan, fromArea: cheapestArea('floorPlan'), description: 'A measured marketing plan with approximate room dimensions, supplied as JPG and PDF.', points: ['Laser-measured on site, with approximate dimensions shown', 'Total floor area (gross internal area)', 'Individual room dimensions and room labels', 'High-resolution JPEG and PDF files', 'Suitable for Rightmove, Zoopla and OnTheMarket'], detail: '/services/floor-plans', detailLabel: 'Floor plan details', Icon: LayoutPanelLeft },
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

  // Visitors read "From £65" as the price for every home, so the selector has to look like a
  // choice still waiting to be made. Only one of the two controls is displayed at a time.
  const sweepRef = useRef<HTMLSpanElement>(null)
  const rulerRef = useRef<HTMLDivElement>(null)
  const firstBandRef = useRef<HTMLButtonElement>(null)
  const selectRef = useRef<HTMLSelectElement>(null)
  const hinted = useRef(false)

  // Desktop: one laser-measure pass along the scale. Mobile: a pulse around the select.
  const drawAttention = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    sweepRef.current?.animate(
      [{ left: '0%', opacity: 0 }, { opacity: 1, offset: 0.08 }, { opacity: 1, offset: 0.9 }, { left: '100%', opacity: 0 }],
      { duration: 1400, delay: 200, easing: 'cubic-bezier(0.45, 0, 0.55, 1)' },
    )
    selectRef.current?.animate(
      [{ boxShadow: '0 0 0 0 rgba(71, 132, 110, 0.45)' }, { boxShadow: '0 0 0 10px rgba(71, 132, 110, 0)' }],
      { duration: 1000, delay: 200, iterations: 2, easing: 'ease-out' },
    )
  }, [])

  // Once per visit, when the whole control first comes into view with nothing chosen.
  useEffect(() => {
    if (area || hinted.current) return
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      hinted.current = true
      observer.disconnect()
      drawAttention()
    }, { threshold: 1 })
    for (const target of [rulerRef.current, selectRef.current]) if (target) observer.observe(target)
    return () => observer.disconnect()
  }, [area, drawAttention])

  function pointToSelector() {
    const target = [firstBandRef.current, selectRef.current].find((control) => control?.offsetParent)
    if (!target) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    target.focus({ preventScroll: true })
    window.setTimeout(drawAttention, reduce ? 0 : 450)
  }

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
            <label htmlFor="home-area" className="block text-base font-semibold text-secondary-900">Choose your floor area to see your price</label>
            <div className="relative mt-2">
              <select
                ref={selectRef}
                id="home-area"
                value={area}
                onChange={(e) => setArea(areaChoices.includes(e.target.value as AreaChoice) ? (e.target.value as AreaChoice) : '')}
                className={cn(
                  'min-h-12 w-full cursor-pointer appearance-none rounded-lg border-2 bg-white py-3 pl-3 pr-14 text-base text-secondary-900',
                  area ? 'border-secondary-400' : 'border-[#47846E] font-semibold',
                )}
              >
                <option value="">Choose floor area</option>
                {areaBands.map((band) => <option key={band} value={band}>{areaLabel(band)}</option>)}
                <option value="unknown">Not sure of floor area</option>
              </select>
              <span aria-hidden="true" className="pointer-events-none absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md bg-[#386B59] text-white">
                <ChevronDown className="h-5 w-5" />
              </span>
            </div>
          </div>
        </div>

        {/* Desktop: the same selection as a measured scale. Shares `area` with the select above. */}
        <fieldset data-area-ruler className="mt-8 hidden lg:block">
          <legend className="text-lg font-semibold text-secondary-900">Choose your floor area to see your price</legend>
          <div className="mt-3 grid grid-cols-[minmax(0,6fr)_minmax(0,1.35fr)] gap-3">
            <div ref={rulerRef} className="relative grid grid-cols-6 overflow-hidden rounded-2xl border border-secondary-300 bg-white shadow-sm">
              {areaBands.map((band, i) => {
                const active = area === band
                return (
                  <button
                    key={band}
                    ref={i === 0 ? firstBandRef : undefined}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setArea(band)}
                    className={cn(
                      'group relative flex min-h-[5.75rem] min-w-0 flex-col justify-end border-l border-secondary-200 px-3 pb-5 pt-8 text-left transition-colors first:border-l-0 focus:outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 focus-visible:ring-offset-0 xl:px-4',
                      active ? 'bg-[#0D1B33] text-white' : 'bg-white text-secondary-900 hover:bg-[#F1F6F3]',
                    )}
                  >
                    <Choice active={active} />
                    <span className="font-serif text-lg font-semibold leading-tight tabular-nums">{pricing[i].areaLabel}</span>
                    <span className={cn('mt-0.5 text-sm leading-5', active ? 'text-[#B9D6C8]' : 'text-secondary-600')}>{pricing[i].label}</span>
                    <span aria-hidden="true" className={cn('ruler-ticks absolute inset-x-0 bottom-0 h-2 transition-colors', active ? 'text-white/50' : 'text-secondary-300 group-hover:text-[#47846E]')} />
                  </button>
                )
              })}
              <span ref={sweepRef} aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-24 -translate-x-full border-r-2 border-[#47846E] bg-gradient-to-r from-transparent to-[#47846E]/20 opacity-0" />
            </div>
            <button
              type="button"
              aria-pressed={area === 'unknown'}
              onClick={() => setArea('unknown')}
              className={cn(
                'group relative flex min-w-0 flex-col justify-center rounded-2xl border py-3 pl-4 pr-9 text-left xl:justify-end xl:pb-5 xl:pr-4 xl:pt-8 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                area === 'unknown' ? 'border-[#0D1B33] bg-[#0D1B33] text-white' : 'border-dashed border-secondary-400 bg-transparent text-secondary-900 hover:border-[#47846E] hover:bg-white',
              )}
            >
              <Choice active={area === 'unknown'} />
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
              {area !== 'unknown' && (
                <p className="mt-1 text-sm leading-6 text-secondary-600">
                  {area ? `For ${inSentence(areaLabel(area))}` : <>For {product.fromArea}.{' '}
                    <button type="button" onClick={pointToSelector} className="inline-flex min-h-6 items-center gap-1 font-semibold text-[#386B59] underline underline-offset-4 hover:text-[#0D1B33]">
                      Choose your floor area <ArrowUp aria-hidden="true" className="h-3.5 w-3.5" />
                    </button>
                  </>}
                </p>
              )}
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
                {/* Reassurance at the decision point, as the pre-Stage 3 cards had. */}
                <p className="mb-2 text-sm leading-6 text-secondary-600">Exact price confirmed before booking</p>
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

/** Radio-style ring so each band reads as something to pick, not a table cell. */
function Choice({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors xl:right-3 xl:top-3',
        active ? 'border-white bg-white text-[#0D1B33]' : 'border-secondary-300 bg-white group-hover:border-[#47846E]',
      )}
    >
      {active
        ? <Check className="h-3 w-3" strokeWidth={3.5} />
        : <span className="h-2 w-2 rounded-full bg-[#47846E] opacity-0 transition-opacity group-hover:opacity-100" />}
    </span>
  )
}
