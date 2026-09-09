import { pricing, site, EXPRESS_SURCHARGE, type PricingBand } from '@/lib/site'
import { propertyTypes } from '@/lib/validators'

/**
 * ONE definition of the live guide estimate.
 *
 * The contact form (client) shows this number in "Live Price Estimate"; the
 * contact API route (edge) puts the same number in the internal booking email
 * so Abdul can see what the customer was anchored on before he confirms the
 * real quote. Both call this — there is no second copy of the arithmetic to
 * drift.
 *
 * Every figure is a GUIDE, never a fixed quote. Internal floor area drives the
 * real price; `propertyType` is the proxy the customer can answer.
 */
export interface GuideEstimate {
  band: PricingBand
  /** Bulk / agency enquiries are quoted individually — no estimate applies. */
  isBulk: boolean
  epc: number
  floorPlan: number
  /** Positive when EPC + Floor Plan are bundled. */
  bundleDiscount: number
  express: number
  /** Improvement Plan add-on: recommendations kept on the certificate, plus
   *  the Energy Report and our written plan. Produced after the visit. */
  improvementPlan: number
  /** Guide total the customer sees. 0 when nothing priceable is selected. */
  total: number
}

export function guideEstimate(opts: {
  propertyType: string | undefined
  services: readonly string[]
  speed?: string
  improvementPlan?: boolean
}): GuideEstimate {
  // propertyTypes is index-aligned with the pricing bands by design.
  const i = propertyTypes.indexOf(opts.propertyType as (typeof propertyTypes)[number])
  const band = pricing[i >= 0 ? i : 0]

  const isBulk = opts.services.includes('Bulk / Agency Enquiry')
  const wantsEpc =
    opts.services.includes('EPC Certificate') || opts.services.includes('Both (Bundle)')
  const wantsFloorPlan =
    opts.services.includes('Floor Plan') || opts.services.includes('Both (Bundle)')

  const epc = wantsEpc ? band.epc : 0
  const floorPlan = wantsFloorPlan ? band.floorPlan : 0

  let bundleDiscount = 0
  let total: number
  if (wantsEpc && wantsFloorPlan) {
    total = band.bundle
    bundleDiscount = band.epc + band.floorPlan - band.bundle
  } else {
    total = epc + floorPlan
  }

  const express = opts.speed?.includes('Express') ? EXPRESS_SURCHARGE : 0
  total += express

  const improvementPlan = opts.improvementPlan ? site.addOns.improvementPlan : 0
  total += improvementPlan

  return { band, isBulk, epc, floorPlan, bundleDiscount, express, improvementPlan, total }
}

/** One-line summary of a guide estimate for the internal booking email. */
export function guideEstimateLine(e: GuideEstimate): string {
  if (e.isBulk) return 'Quoted individually — no estimate shown'
  if (e.total <= 0) return 'No priceable service selected'
  const parts: string[] = []
  if (e.epc && e.floorPlan) {
    parts.push(`EPC £${e.epc} + Floor Plan £${e.floorPlan} bundled to £${e.epc + e.floorPlan - e.bundleDiscount}`)
  } else if (e.epc) {
    parts.push(`EPC £${e.epc}`)
  } else if (e.floorPlan) {
    parts.push(`Floor Plan £${e.floorPlan}`)
  }
  if (e.express) parts.push(`express +£${e.express}`)
  if (e.improvementPlan) parts.push(`improvement plan +£${e.improvementPlan}`)
  return `£${e.total} guide (${parts.join(', ')}) — confirm the real quote`
}
