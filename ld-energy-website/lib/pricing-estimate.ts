import { pricing, site, EXPRESS_SURCHARGE, type PricingBand } from '@/lib/site'
import { propertyTypes, PRE_ASSESSMENT } from '@/lib/validators'

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
  const wantsPreAssessment = opts.services.includes(PRE_ASSESSMENT)
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

  // A Pre-Assessment is the same survey at the same band price. It is
  // single-select in the form, so it never combines with the EPC or the bundle.
  const preAssessment = wantsPreAssessment ? band.epc : 0
  total += preAssessment

  // Express is a LODGEMENT surcharge, not a general turnaround fee. Only an
  // EPC is lodged: a Pre-Assessment deliberately is not, and a floor plan
  // never was. Gating on `isLodged` rather than "not a Pre-Assessment" fixes
  // floor-plan-only too, which had the same defect before Pre-Assessment
  // existed and was missed when that case was handled.
  const isLodged = wantsEpc
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
    total,
  }
}

/**
 * The priced lines of an estimate, as label/value pairs.
 *
 * Derived here rather than assembled in a component so the mobile price bar
 * and any other summary read the same breakdown the arithmetic produced. The
 * desktop sidebar keeps its own richer layout (it also shows non-priced
 * context like who is booking), but every FIGURE in both comes from
 * `guideEstimate`.
 */
export function guideEstimateRows(e: GuideEstimate): Array<[string, string]> {
  if (e.isBulk || e.total <= 0) return []
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
  if (e.total <= 0) return 'No priceable service selected'
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
