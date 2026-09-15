'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { areaBands, areaChoices, areaLabel, type AreaChoice } from '@/lib/floor-area'
import { priceFrom, site } from '@/lib/site'
import { guideEstimate } from '@/lib/pricing-estimate'
import { quoteHref, quoteServices, type QuoteService } from '@/lib/quote-context'

const products: { service:QuoteService; title:string; from:number; description:string; detail:string; detailLabel:string }[] = [
  {service:'epc',title:'Domestic EPC',from:priceFrom.epc,description:'On-site energy assessment, lodged certificate and standard recommendation report where applicable.',detail:'/services/domestic-epc',detailLabel:'Domestic EPC details'},
  {service:'bundle',title:'EPC + Floor Plan',from:priceFrom.bundle,description:'Your EPC and a measured marketing floor plan, completed in one property visit.',detail:'/pricing',detailLabel:'EPC and floor plan pricing'},
  {service:'floor-plan',title:'Floor Plan',from:priceFrom.floorPlan,description:'A measured marketing plan with approximate room dimensions, supplied as JPG and PDF.',detail:'/services/floor-plans',detailLabel:'Floor plan details'},
]

export function HomeServices() {
  const [area, setArea] = useState<AreaChoice | ''>('')
  const totals = products.map(product => guideEstimate({services:[quoteServices[product.service]],areaBand:area}).total)
  const announcement = !area ? '' : area === 'unknown' ? 'Exact quote after reviewing your property details.' : `${areaLabel(area)}. ${products.map((p,i)=>`${p.title}: guide estimate £${totals[i]}`).join('. ')}.`

  return (
    <section id="pricing" className="home-section scroll-mt-28 bg-[#F1F6F3]">
      <Container>
        <span id="services" className="scroll-mt-28" aria-hidden="true" />
        <div className="grid gap-5 lg:grid-cols-[1fr_22rem] lg:items-end">
          <div><h2 className="home-heading">Services and guide pricing</h2><p className="mt-3 max-w-2xl text-base leading-6">Internal floor area is the main pricing factor. Bedroom counts are only a rough reference.</p></div>
          <div>
            <label htmlFor="home-area" className="block text-base font-semibold text-secondary-900">Internal floor area</label>
            <select id="home-area" value={area} onChange={e=>setArea(areaChoices.includes(e.target.value as AreaChoice)?e.target.value as AreaChoice:'')} className="mt-2 min-h-12 w-full rounded-lg border border-secondary-400 bg-white px-3 py-3 text-base text-secondary-900">
              <option value="">Select floor area</option>
              {areaBands.map(band=><option key={band} value={band}>{areaLabel(band)}</option>)}
              <option value="unknown">Not sure of floor area</option>
            </select>
          </div>
        </div>
        <p aria-live="polite" aria-atomic="true" className="sr-only">{announcement}</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {products.map((product,i)=><article key={product.service} className="flex min-w-0 flex-col rounded-xl border border-secondary-200 bg-white p-5 lg:p-6">
            <h3 className="text-2xl font-semibold">{product.title}</h3>
            <p data-home-estimate={product.service} className="mt-2 text-lg font-semibold text-primary-800">{!area ? `From £${product.from}` : area==='unknown' ? 'Quote after reviewing your details' : `Guide estimate: £${totals[i]}`}</p>
            <p className="mt-3 text-base leading-6 text-secondary-700">{product.description}</p>
            <div className="mt-4 flex flex-1 flex-col justify-end">
              <Button href={quoteHref({service:product.service,area:area||undefined,sourcePage:'home',ctaId:area?'estimator':'pricing'})} variant={i===0?'accent':'secondary'} aria-label={`Get my exact quote for ${product.title}`} className="w-full">Get my exact quote</Button>
              <Link prefetch={false} href={product.detail} className="home-link mt-1">{product.detailLabel} <span aria-hidden="true">→</span></Link>
            </div>
          </article>)}
        </div>
        <p className="mt-4 text-base leading-6">{area==='unknown' ? 'You can continue without a floor-area band. We will confirm your exact quote after reviewing the property details.' : 'Guide price ≠ final quote. We confirm your exact price and available appointment before you book.'}</p>
        <details id="good-to-know" className="mt-3 scroll-mt-28 border-y border-secondary-300">
          <summary className="cursor-pointer py-3 text-base font-semibold text-secondary-900">How guide pricing works</summary>
          <div className="pb-4 text-base leading-6"><p>Starting prices apply to properties up to 37 m². Size, layout, extensions and access inform the final quote. Any travel or urgent-service charge is confirmed before you agree to a visit.</p><Link prefetch={false} href="/pricing" className="home-link">See all six floor-area price bands →</Link></div>
        </details>
        <div className="mt-3 flex flex-wrap gap-x-6">
          <Link prefetch={false} href="/services/epc-pre-assessment" className="home-link">Private EPC Pre-Assessment →</Link>
          <Link prefetch={false} href="/services/epc-improvement-plan" className="home-link">Additional £{site.addOns.improvementPlan} Improvement Plan →</Link>
          <Link prefetch={false} href={quoteHref({service:'bulk',sourcePage:'home',ctaId:'inline'})} className="home-link">Agency / portfolio enquiry →</Link>
        </div>
      </Container>
    </section>
  )
}
