'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Building2, Check, HelpCircle, House, KeyRound, Signpost, Star, type LucideIcon } from 'lucide-react'
import { areaBands, type AreaChoice } from '@/lib/floor-area'
import { EXPRESS_SURCHARGE, bundleSaving, formatPrice, maxBundleSaving, priceFrom, pricing, site } from '@/lib/site'
import { guideEstimate } from '@/lib/pricing-estimate'
import { quoteHref, quoteServices } from '@/lib/quote-context'
import { useHomeQuote, type HomeRoute, type HomeService } from './HomeQuoteContext'

const priceKey = { epc: 'epc', bundle: 'bundle', 'floor-plan': 'floorPlan' } as const
const tabs: { service: HomeService; label: string }[] = [
  { service: 'epc', label: 'Domestic EPC' },
  { service: 'bundle', label: 'EPC + Floor Plan' },
  { service: 'floor-plan', label: 'Floor Plan' },
]
const routes: { route: Exclude<HomeRoute, null>; service: HomeService; title: string; body: string; Icon: LucideIcon }[] = [
  { route: 'landlord', service: 'epc', title: "I'm a landlord", body: 'Check the rating before a tenancy, and plan ahead for 2030.', Icon: KeyRound },
  { route: 'agent', service: 'epc', title: 'Letting or managing agent', body: 'One property or a list of them, with one contact.', Icon: Building2 },
  { route: 'seller', service: 'bundle', title: 'Selling a property', body: 'An EPC and a portal-ready floor plan in one visit.', Icon: Signpost },
  { route: 'home', service: 'epc', title: 'For my own home', body: 'Understand your rating and what could improve it.', Icon: House },
]

/** A short, true pointer that makes the visitor's choice change what they see next. */
function RouteHint({ route }: { route: HomeRoute }) {
  if (route === 'landlord') return <p>Letting? E is the minimum rating today, and C is planned from October 2030. <a href="#landlords" className="font-semibold text-[#386B59] underline underline-offset-4">What it means for you ↓</a></p>
  if (route === 'agent') return <p>Several properties? <Link prefetch={false} href={quoteHref({ service: 'bulk', sourcePage: 'home', ctaId: 'estimator' })} className="font-semibold text-[#386B59] underline underline-offset-4">Send the list for a portfolio quote →</Link></p>
  if (route === 'seller') return <p>Buyers see the EPC and a measured floor plan on the listing. Both come from the same visit.</p>
  if (route === 'home') return <p>Want your likely score before anything is lodged? <Link prefetch={false} href="/services/epc-pre-assessment" className="font-semibold text-[#386B59] underline underline-offset-4">EPC Pre-Assessment →</Link></p>
  return null
}

export function HomeQuoteCard() {
  const { step, route, service, area, setService, setArea, openCalculator, backToRoutes, cardRef, headingRef } = useHomeQuote()
  const key = priceKey[service]
  const index = areaBands.indexOf(area as (typeof areaBands)[number])
  const band = index >= 0 ? pricing[index] : undefined
  const estimate = guideEstimate({ services: [quoteServices[service]], areaBand: area || undefined })
  const lodged = service !== 'floor-plan'
  // The contact form's own estimator, so the card and the form can never disagree.
  const total = estimate.total ?? (band ? band[key] : 0)
  const bodyRef = useRef<HTMLDivElement>(null)
  const first = useRef(true)

  // Cross-fade between the two steps; skipped on first render and under reduced motion.
  useEffect(() => {
    if (first.current) { first.current = false; return }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    bodyRef.current?.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' })
  }, [step])

  const announcement = step === 'calc' && band
    ? `${tabs.find((t) => t.service === service)!.label}, ${band.areaLabel}: guide price £${formatPrice(total)}.`
    : ''

  return (
    <div ref={cardRef} className="qc scroll-mt-28" data-step={step}>
      <div className="qc__bar">
        {step === 'calc' ? (
          <button type="button" onClick={backToRoutes} className="qc__back">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Change what you need
          </button>
        ) : (
          <span className="qc__title">Start here</span>
        )}
        <span className="qc__who">
          <span>Your assessor <b>{site.assessor.name}</b></span>
          <span className="tabular-nums">{site.assessor.accreditationNumber}</span>
          <a href={site.reviews.profileUrl} target="_blank" rel="noopener noreferrer" className="qc__stars">
            <Star aria-hidden="true" className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {site.reviews.ratingValue.toFixed(1)} on Google
          </a>
          <a href={site.assessor.verifyUrl} target="_blank" rel="noopener noreferrer" className="qc__verify">Verify on GOV.UK</a>
        </span>
      </div>

      <p aria-live="polite" aria-atomic="true" className="sr-only">{announcement}</p>

      <div ref={bodyRef}>
        {step === 'route' ? (
          <div className="qc__route">
            <div>
              <h2 ref={headingRef} tabIndex={-1} className="qc__h">What do you need it for?</h2>
              <p className="qc__hint">Pick the closest one and we&rsquo;ll show you the right service and your guide price.</p>
              <button type="button" onClick={() => openCalculator('epc')} className="qc__skip">Just show me prices <ArrowRight aria-hidden="true" className="h-4 w-4" /></button>
            </div>
            <ul className="qc__routes">
              {routes.map(({ route: r, service: s, title, body, Icon }) => (
                <li key={r}>
                  <button type="button" data-route={r} onClick={() => openCalculator(s, r)} className="qc__tile">
                    <span aria-hidden="true" className="qc__ico"><Icon className="h-5 w-5" /></span>
                    <b>{title}</b>
                    <span className="qc__tile-body">{body}</span>
                    <ArrowRight aria-hidden="true" className="qc__arrow" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="qc__calc">
            <div className="qc__calc-top">
              <div>
                <h2 ref={headingRef} tabIndex={-1} className="qc__h">Your guide price</h2>
                <p className="qc__hint">Tailored by service and floor area. Exact price confirmed before you book.</p>
              </div>
              <div>
                <p id="qc-svc" className="qc__tabs-label">Choose a service</p>
                <div role="group" aria-labelledby="qc-svc" className="qc__tabs">
                  {tabs.map((t) => (
                    <button key={t.service} type="button" data-svc={t.service} aria-pressed={service === t.service} onClick={() => setService(t.service)}>
                      <span aria-hidden="true" className="qc__radio" />
                      {t.label}
                      {t.service === 'bundle' && <span className="qc__save">Save up to £{maxBundleSaving}</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="qc__calc-body">
              <div>
                <p id="qc-size" className="qc__legend">How big is the home?</p>
                <p className="qc__sub">Internal floor area. Bedrooms are only a rough guide.</p>
                <div role="group" aria-labelledby="qc-size" className="qc__sizes">
                  {areaBands.map((b, i) => (
                    <button key={b} type="button" data-band={b} aria-pressed={area === b} onClick={() => setArea(b as AreaChoice)} className="qc__size">
                      <span className="qc__size-top"><b>{pricing[i].areaLabel}</b><span className="tabular-nums">£{formatPrice(pricing[i][key])}</span></span>
                      <span className="qc__size-sub">{pricing[i].typicalLabel}</span>
                    </button>
                  ))}
                  <button type="button" data-band="unknown" aria-pressed={area === 'unknown'} onClick={() => setArea('unknown')} className="qc__notsure">
                    <HelpCircle aria-hidden="true" className="h-5 w-5 shrink-0" />
                    <span><b>Not sure of the size?</b><span className="qc__size-sub">Send your property details and we&rsquo;ll confirm the exact price.</span></span>
                  </button>
                </div>
                {route && <div className="qc__note"><RouteHint route={route} /></div>}
              </div>

              <div className="qc__est" data-estimate>
                <p className="qc__est-label">Estimated guide price</p>
                {band ? (
                  <>
                    <p className="qc__price"><b data-price className="tabular-nums">£{formatPrice(total)}</b><span>{lodged ? 'inc. assessment and GOV.UK lodgement' : 'inc. on-site measuring'}</span></p>
                    <p className="qc__for">{band.areaLabel} · {band.typicalLabel}</p>
                    <dl className="qc__rows">
                      {service === 'epc' && <>
                        <div><dt>On-site energy assessment</dt><dd className="tabular-nums">£{formatPrice(band.epc)}</dd></div>
                        <div><dt>GOV.UK register lodgement</dt><dd>Included</dd></div>
                        <div><dt>Standard recommendation report</dt><dd>Included</dd></div>
                      </>}
                      {service === 'bundle' && <>
                        <div><dt>Domestic EPC</dt><dd className="tabular-nums">£{formatPrice(band.epc)}</dd></div>
                        <div><dt>Measured floor plan</dt><dd className="tabular-nums">£{formatPrice(band.floorPlan)}</dd></div>
                        <div data-save className="qc__row-save"><dt>Booked together, one visit</dt><dd className="tabular-nums">−£{formatPrice(bundleSaving(band))}</dd></div>
                      </>}
                      {service === 'floor-plan' && <>
                        <div><dt>Laser-measured floor plan</dt><dd className="tabular-nums">£{formatPrice(band.floorPlan)}</dd></div>
                        <div><dt>Files supplied</dt><dd>JPEG and PDF</dd></div>
                      </>}
                    </dl>
                    {lodged && <p className="qc__extra">Next-day lodgement +£{EXPRESS_SURCHARGE} when agreed</p>}
                  </>
                ) : area === 'unknown' ? (
                  <>
                    <p className="qc__price"><b data-price>Quote</b></p>
                    <p className="qc__for">Send your property details and we&rsquo;ll confirm the exact price.</p>
                  </>
                ) : (
                  <>
                    <p className="qc__price"><small>From</small><b data-price className="tabular-nums">£{formatPrice(priceFrom[key])}</b></p>
                    <p className="qc__for">For homes up to 37 m². Pick a size for your guide price.</p>
                  </>
                )}
                <Link
                  prefetch={false}
                  data-quote
                  href={quoteHref({ service, area: area || undefined, sourcePage: 'home', ctaId: 'estimator' })}
                  className="qc__book"
                >
                  Book with this guide price
                </Link>
                <p className="qc__fine"><Check aria-hidden="true" className="h-4 w-4 shrink-0 text-[#386B59]" />No upfront payment. You pay once the assessment is done.</p>
                <p className="qc__fine qc__fine--quiet">Exact price and appointment confirmed before booking.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
