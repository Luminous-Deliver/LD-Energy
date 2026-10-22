import { pricing, priceFrom, site, type PricingBand } from '@/lib/site'
import { PRE_ASSESSMENT, speedSurcharge, speedName } from '@/lib/booking-options'
import { areaBands, isRetiredArea, legacyArea, type AreaBand } from '@/lib/floor-area'

/**
 * The product a booking resolves to. Exhaustive by design — see `productKind`.
 *
 * 'bundle' is kept distinct from 'epc' even though both are lodged: the
 * deliverables differ (a bundle also produces floor plans), and copy that
 * lists what arrives has to say so.
 */
export type ProductKind = 'epc' | 'bundle' | 'floorPlan' | 'preAssessment' | 'bulk' | 'none'

/**
 * What kind of figure a booking carries (Abdul's pricing spec, 22/10/2026, §12):
 * a standard band's guide price, the open-ended top band's starting price, or
 * nothing yet because the size or the portfolio still has to be confirmed.
 */
export type PriceStatus = 'standard' | 'starting' | 'to-confirm'

/** Customer-facing names for the add-ons, shared by the form, the summary and the emails. */
export const PLAN_LABEL = 'Personalised EPC Improvement Plan'
export const ENERGY_REPORT_LABEL = 'Separate energy report'

/**
 * ONE definition of the live guide estimate.
 *
 * The contact form (client) shows this number in its in-flow summary; the
 * contact API route (edge) puts the same number in the internal booking email
 * so Abdul can see what the customer was anchored on before he confirms the
 * real quote. Both call this — there is no second copy of the arithmetic to
 * drift.
 *
 * Every figure is a GUIDE, never a fixed quote. Internal floor area drives the
 * real price; `propertyType` is accepted only for cached-client compatibility.
 * Missing area and unknown area have explicit states and no numeric total. The
 * top band's figures are starting prices: `isStartingPrice` is true and every
 * display of `total` must read "From".
 */
export interface GuideEstimate {
  band: PricingBand | undefined
  state: 'priced' | 'awaiting-area' | 'manual-quote'
  priceStatus: PriceStatus
  /** True for the open-ended top band: `baseGuide` and `total` are starting prices. */
  isStartingPrice: boolean
  /** Bulk / agency enquiries are quoted individually — no estimate applies. */
  isBulk: boolean
  epc: number
  floorPlan: number
  /** Arithmetic difference against booking separately when EPC + Floor Plan are bundled. */
  bundleDiscount: number
  /** The saving shown to the customer: the bundle discount on a standard band, else 0. */
  saving: number
  /** Speed extra: same-day lodgement or a next-day visit and lodgement; 0 for standard. */
  express: number
  /** Name of the paid speed choice, or null. */
  speedName: string | null
  /** Not-lodged full survey on its own price column; includes the personalised plan. */
  preAssessment: number
  /** The selected service's price before any add-on, or null without a band. */
  baseGuide: number | null
  /** Additional personalised plan supported by the full Elmhurst Energy Report.
   *  Standard EPC recommendations are included either way. Produced after the visit.
   *  Zero when it is bundled into a Pre-Assessment — see `planIncluded`. */
  improvementPlan: number
  /** True when the plan comes inside a Pre-Assessment, so it is never sold again. */
  planIncluded: boolean
  /** A Pre-Assessment's optional separate energy report. Free, so it never changes a total. */
  energyReport: boolean
  /**
   * Whether an Improvement Plan is possible at all for this selection.
   *
   * It is written FROM an assessment, so a floor-plan-only or bulk booking
   * cannot have one — there is nothing to write it from. The form gates its
   * checkbox on this rather than re-deriving the rule, so the UI and the
   * arithmetic cannot disagree about what is purchasable.
   */
  canHavePlan: boolean
  /**
   * Whether anything in this selection is lodged on the GOV.UK register.
   *
   * Drives the express surcharge (a lodgement surcharge, so it needs a lodged
   * product) and the delivery-speed copy. Floor-plan-only and Pre-Assessment
   * are both unlodged; only the reasons differ.
   */
  isLodged: boolean
  /**
   * WHICH PRODUCT this booking is, as one exhaustive value.
   *
   * Any copy that describes what the customer ends up with must switch on this
   * rather than nesting `isLodged` / `planIncluded` / `isBulk` ternaries in each
   * component. Four separate defects came from that pattern — the delivery-speed
   * step, the form's "What's included" panel, the homepage pricing card, and
   * bulk being told about floor plans — because two booleans describe four
   * states and a two-branch ternary can only serve two of them, so a third case
   * silently falls through to whichever branch is nearest.
   *
   * With a union, a missing case is a compile error at every `switch` instead of
   * a plausible-looking sentence shown to the wrong customer. Add a product here
   * and TypeScript will point at each place that has to say something about it.
   *
   * `canHavePlan` and `isLodged` stay: they answer narrower questions (what is
   * purchasable, what gets lodged) and remain the right gates for PRICING.
   * This one is for WORDING.
   */
  productKind: ProductKind
  /** Null until a priceable service and known area are selected. */
  total: number | null
  /** Before a size is chosen: the service's lowest price plus any chosen add-on, shown with "From". */
  fromTotal: number | null
}

export function guideEstimate(opts: {
  propertyType?: string
  areaBand?: string
  services: readonly string[]
  speed?: string
  improvementPlan?: boolean
  energyReport?: boolean
}): GuideEstimate {
  const area = opts.areaBand || legacyArea(opts.propertyType)
  const i = areaBands.indexOf(area as AreaBand)
  const band = i >= 0 ? pricing[i] : undefined
  const isStartingPrice = !!band?.startingPrice

  const isBulk = opts.services.includes('Bulk / Agency Enquiry')
  const wantsPreAssessment = opts.services.includes(PRE_ASSESSMENT)
  const wantsEpc =
    opts.services.includes('EPC Certificate') || opts.services.includes('Both (Bundle)')
  const wantsFloorPlan =
    opts.services.includes('Floor Plan') || opts.services.includes('Both (Bundle)')

  const epc = wantsEpc ? (band?.epc ?? 0) : 0
  const floorPlan = wantsFloorPlan ? (band?.floorPlan ?? 0) : 0

  let bundleDiscount = 0
  let total: number
  if (wantsEpc && wantsFloorPlan) {
    total = (band?.bundle ?? 0)
    bundleDiscount = (band?.epc ?? 0) + (band?.floorPlan ?? 0) - (band?.bundle ?? 0)
  } else {
    total = epc + floorPlan
  }

  // Single-select in the form, so a Pre-Assessment never combines with the EPC or the bundle.
  const preAssessment = wantsPreAssessment ? (band?.preAssessment ?? 0) : 0
  total += preAssessment
  const baseGuide = band && !isBulk && total > 0 ? total : null

  // A speed extra is a LODGEMENT surcharge, not a general turnaround fee. Only an
  // EPC is lodged: a Pre-Assessment deliberately is not, and a floor plan
  // never was. Gating on `isLodged` rather than "not a Pre-Assessment" fixes
  // floor-plan-only too, which had the same defect before Pre-Assessment
  // existed and was missed when that case was handled.
  const isLodged = !isBulk && wantsEpc
  const express = isLodged ? speedSurcharge(opts.speed) : 0
  const chosenSpeed = express ? speedName(opts.speed) : null
  total += express

  // Order matters: bulk wins over everything (it is quoted individually and
  // has no single product), and the bundle must be tested before plain EPC
  // because a bundle satisfies `wantsEpc` too.
  const productKind: ProductKind = isBulk
    ? 'bulk'
    : wantsPreAssessment
      ? 'preAssessment'
      : wantsEpc && wantsFloorPlan
        ? 'bundle'
        : wantsEpc
          ? 'epc'
          : wantsFloorPlan
            ? 'floorPlan'
            : 'none'

  // The plan is written FROM an assessment. Without one there is nothing to
  // write it from, so it is not merely unpriced — it is not purchasable.
  const canHavePlan = !isBulk && (wantsEpc || wantsPreAssessment)
  const planIncluded = wantsPreAssessment
  const improvementPlan =
    opts.improvementPlan && canHavePlan && !planIncluded ? site.addOns.improvementPlan : 0
  total += improvementPlan
  const energyReport = wantsPreAssessment && !!opts.energyReport

  const lowest = productKind === 'preAssessment' ? priceFrom.preAssessment : productKind === 'bundle' ? priceFrom.bundle
    : productKind === 'floorPlan' ? priceFrom.floorPlan : productKind === 'epc' ? priceFrom.epc : null
  const state = isBulk || area === 'unknown' || isRetiredArea(area) ? 'manual-quote' : !band || productKind === 'none' ? 'awaiting-area' : 'priced'

  return {
    band,
    state,
    priceStatus: state !== 'priced' ? 'to-confirm' : isStartingPrice ? 'starting' : 'standard',
    isStartingPrice: state === 'priced' && isStartingPrice,
    isBulk,
    epc,
    floorPlan,
    bundleDiscount,
    saving: isStartingPrice ? 0 : bundleDiscount,
    express,
    speedName: chosenSpeed,
    preAssessment,
    baseGuide,
    improvementPlan,
    planIncluded,
    energyReport,
    canHavePlan,
    isLodged,
    productKind,
    total: isBulk || !band || productKind === 'none' ? null : total,
    fromTotal: state === 'awaiting-area' && lowest !== null ? lowest + improvementPlan : null,
  }
}

/** "£85", or "From £120" for the open-ended top band. */
export function guidePrice(e: Pick<GuideEstimate, 'isStartingPrice'>, value: number): string {
  return `${e.isStartingPrice ? 'From ' : ''}£${value}`
}

/**
 * The lines of an estimate, as label/value pairs, for the form summary.
 *
 * A known band lists the service's price and each chosen extra. An unknown size
 * keeps no figure for the service, but a chosen extra is still listed on its own.
 * Portfolio enquiries never acquire a line.
 */
export function guideEstimateRows(e: GuideEstimate): Array<[string, string]> {
  if (e.isBulk || e.productKind === 'none') return []
  const rows: Array<[string, string]> = []

  if (e.state === 'priced' && e.baseGuide !== null) {
    const label = e.productKind === 'preAssessment' ? 'EPC Pre-Assessment (not lodged)'
      : e.productKind === 'bundle' ? 'EPC + Floor Plan bundle' : e.productKind === 'epc' ? 'Domestic EPC' : 'Floor plan'
    rows.push([label, guidePrice(e, e.baseGuide)])
  } else if (e.state === 'awaiting-area') {
    return []
  }

  if (e.express) rows.push([e.speedName ?? 'Faster lodgement', `+£${e.express}`])
  if (e.improvementPlan) rows.push([PLAN_LABEL, `+£${e.improvementPlan}`])
  if (e.planIncluded) rows.push(['Personalised improvement plan', 'Included'])
  if (e.energyReport) rows.push([ENERGY_REPORT_LABEL, 'Included at no extra charge'])

  return rows
}

/** "Standard guide", "Starting price" or "To be confirmed". */
export function priceStatusLabel(e: GuideEstimate): string {
  return e.priceStatus === 'standard' ? 'Standard guide' : e.priceStatus === 'starting' ? 'Starting price' : 'To be confirmed'
}

/**
 * The booking's price record for the internal email (spec §12): what figure the
 * customer saw, what kind of figure it was, and each extra they chose.
 */
export function bookingPriceRows(e: GuideEstimate): Array<[string, string]> {
  if (e.isBulk) return [['Price status', 'Quoted individually']]
  const rows: Array<[string, string]> = [['Price status', priceStatusLabel(e)]]
  if (e.state === 'priced' && e.baseGuide !== null) rows.push(['Base guide price', guidePrice(e, e.baseGuide)])
  if (e.express) rows.push([e.speedName ?? 'Faster lodgement', `+£${e.express}`])
  if (e.canHavePlan) rows.push(['Improvement plan', e.planIncluded ? 'Included in the Pre-Assessment' : e.improvementPlan ? `Added (+£${e.improvementPlan})` : 'Not added'])
  if (e.productKind === 'preAssessment') rows.push([ENERGY_REPORT_LABEL, e.energyReport ? 'Requested (no extra charge)' : 'Not requested'])
  if (e.saving && e.state === 'priced') rows.push(['Bundle saving shown', `£${e.saving}`])
  rows.push(['Guide total', e.state === 'priced' && e.total !== null ? guidePrice(e, e.total) : 'To be confirmed'])
  return rows
}

/** One-line summary of a guide estimate for the internal booking email. */
export function guideEstimateLine(e: GuideEstimate): string {
  if (e.isBulk) return 'Quoted individually — no estimate shown'
  if (e.state === 'manual-quote') {
    const extras = [e.improvementPlan ? `improvement plan +£${e.improvementPlan}` : '', e.energyReport ? 'separate energy report (free)' : ''].filter(Boolean)
    return `Floor area to confirm — exact quote after reviewing property details${extras.length ? ` (${extras.join(', ')})` : ''}`
  }
  if (e.state === 'awaiting-area') return 'Choose a floor area band for a guide estimate'
  const parts: string[] = []
  if (e.epc && e.floorPlan) {
    parts.push(`EPC £${e.epc} + Floor Plan £${e.floorPlan} bundled to £${e.epc + e.floorPlan - e.bundleDiscount}`)
  } else if (e.epc) {
    parts.push(`EPC £${e.epc}`)
  } else if (e.floorPlan) {
    parts.push(`Floor Plan £${e.floorPlan}`)
  }
  if (e.preAssessment) parts.push(`Pre-Assessment (not lodged) £${e.preAssessment}, plan included`)
  if (e.express) parts.push(`${(e.speedName ?? 'faster lodgement').toLowerCase()} +£${e.express}`)
  if (e.improvementPlan) parts.push(`improvement plan +£${e.improvementPlan}`)
  if (e.energyReport) parts.push('separate energy report (free)')
  return e.isStartingPrice
    ? `From £${e.total} starting price (${parts.join(', ')}) — large property, confirm the real quote`
    : `£${e.total} guide (${parts.join(', ')}) — confirm the real quote`
}
