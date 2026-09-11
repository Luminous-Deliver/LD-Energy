import { pricing, site, EXPRESS_SURCHARGE, type PricingBand } from '@/lib/site'
import { PRE_ASSESSMENT } from '@/lib/booking-options'
import { areaBands, legacyArea, type AreaBand } from '@/lib/floor-area'

/**
 * The product a booking resolves to. Exhaustive by design — see `productKind`.
 *
 * 'bundle' is kept distinct from 'epc' even though both are lodged: the
 * deliverables differ (a bundle also produces floor plans), and copy that
 * lists what arrives has to say so.
 */
export type ProductKind = 'epc' | 'bundle' | 'floorPlan' | 'preAssessment' | 'bulk' | 'none'

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
 * Missing area and unknown area have explicit states and no numeric total.
 */
export interface GuideEstimate {
  band: PricingBand | undefined
  state: 'priced' | 'awaiting-area' | 'manual-quote'
  /** Bulk / agency enquiries are quoted individually — no estimate applies. */
  isBulk: boolean
  epc: number
  floorPlan: number
  /** Positive when EPC + Floor Plan are bundled. */
  bundleDiscount: number
  express: number
  /** Not-lodged full survey. Same visit and measuring as an EPC, so the same
   *  band price; only the ~£9 lodgement is saved. */
  preAssessment: number
  /** Improvement Plan add-on: recommendations kept on the certificate, plus
   *  the Energy Report and our written plan. Produced after the visit.
   *  Zero when it is bundled into a Pre-Assessment — see `planIncluded`. */
  improvementPlan: number
  /** True when the plan comes free inside a Pre-Assessment. Without a
   *  certificate the customer would otherwise receive nothing actionable, so
   *  it is always included rather than sold again. */
  planIncluded: boolean
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
}

export function guideEstimate(opts: {
  propertyType?: string
  areaBand?: string
  services: readonly string[]
  speed?: string
  improvementPlan?: boolean
}): GuideEstimate {
  const area = opts.areaBand || legacyArea(opts.propertyType)
  const i = areaBands.indexOf(area as AreaBand)
  const band = i >= 0 ? pricing[i] : undefined

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

  // A Pre-Assessment is the same survey at the same band price. It is
  // single-select in the form, so it never combines with the EPC or the bundle.
  const preAssessment = wantsPreAssessment ? (band?.epc ?? 0) : 0
  total += preAssessment

  // Express is a LODGEMENT surcharge, not a general turnaround fee. Only an
  // EPC is lodged: a Pre-Assessment deliberately is not, and a floor plan
  // never was. Gating on `isLodged` rather than "not a Pre-Assessment" fixes
  // floor-plan-only too, which had the same defect before Pre-Assessment
  // existed and was missed when that case was handled.
  const isLodged = !isBulk && wantsEpc
  const express = isLodged && opts.speed?.includes('Express') ? EXPRESS_SURCHARGE : 0
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

  return {
    band,
    state: isBulk || area === 'unknown' ? 'manual-quote' : !band || productKind === 'none' ? 'awaiting-area' : 'priced',
    isBulk,
    epc,
    floorPlan,
    bundleDiscount,
    express,
    preAssessment,
    improvementPlan,
    planIncluded,
    canHavePlan,
    isLodged,
    productKind,
    total: isBulk || !band || productKind === 'none' ? null : total,
  }
}

/**
 * The priced lines of an estimate, as label/value pairs.
 *
 * The in-flow form summary reads the same breakdown as the shared arithmetic.
 * Unknown area and portfolio enquiries never acquire a numeric estimate.
 */
export function guideEstimateRows(e: GuideEstimate): Array<[string, string]> {
  if (e.state !== 'priced' || e.total === null) return []
  const rows: Array<[string, string]> = []

  if (e.preAssessment) {
    rows.push(['EPC Pre-Assessment (not lodged)', `£${e.preAssessment}`])
  } else if (e.epc && e.floorPlan) {
    rows.push(['EPC + Floor Plan bundle', `£${e.epc + e.floorPlan - e.bundleDiscount}`])
  } else if (e.epc) {
    rows.push(['Domestic EPC', `£${e.epc}`])
  } else if (e.floorPlan) {
    rows.push(['Floor plan', `£${e.floorPlan}`])
  }

  if (e.bundleDiscount) rows.push(['Bundle saving', `−£${e.bundleDiscount}`])
  if (e.express) rows.push(['Next-day lodgement', `+£${e.express}`])
  if (e.improvementPlan) rows.push(['Improvement Plan', `+£${e.improvementPlan}`])
  if (e.planIncluded) rows.push(['Improvement Plan', 'Included'])

  return rows
}

/** One-line summary of a guide estimate for the internal booking email. */
export function guideEstimateLine(e: GuideEstimate): string {
  if (e.isBulk) return 'Quoted individually — no estimate shown'
  if (e.state === 'manual-quote') return 'Floor area unknown — exact quote after reviewing property details'
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
  if (e.express) parts.push(`express +£${e.express}`)
  if (e.improvementPlan) parts.push(`improvement plan +£${e.improvementPlan}`)
  return `£${e.total} guide (${parts.join(', ')}) — confirm the real quote`
}
