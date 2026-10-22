import {
  NEXT_DAY_VISIT_SURCHARGE,
  SAME_DAY_LODGEMENT_SURCHARGE,
  formatPrice,
  maxBundleSaving,
  priceFrom,
  site,
} from './site'

/**
 * Every L&D price a guide can mention, read from lib/site.ts (plan PLAN-AREAS-GUIDES-2026-10-22 §8.2).
 *
 * Guides never type a price. In MDX body text use `<Price item="epcFrom" />`; in frontmatter strings
 * (FAQs, takeaways, the answer) and in component props such as CTABanner's `body`, write the token
 * `{price:epcFrom}`, which `fillPrices` swaps for "£65". tests/guide-prices.test.cjs fails the build
 * check if a typed "£" figure for an L&D price appears anywhere in content/blog.
 */
export const guidePrices = {
  /** Lowest EPC guide price. */
  epcFrom: priceFrom.epc,
  /** Lowest floor plan guide price. */
  floorPlanFrom: priceFrom.floorPlan,
  /** Lowest EPC plus floor plan bundle price. */
  bundleFrom: priceFrom.bundle,
  /** Lowest Pre-Assessment price. */
  preAssessmentFrom: priceFrom.preAssessment,
  /** The optional personalised Improvement Plan. */
  improvementPlan: site.addOns.improvementPlan,
  /** EPC lodged on the day of the visit. */
  sameDayLodgement: SAME_DAY_LODGEMENT_SURCHARGE,
  /** Visit the next day, EPC lodged that day. */
  nextDayVisit: NEXT_DAY_VISIT_SURCHARGE,
  /** Largest saving from booking the EPC and floor plan together. */
  maxBundleSaving,
} as const

export type GuidePriceKey = keyof typeof guidePrices

export function isGuidePriceKey(key: string): key is GuidePriceKey {
  return Object.prototype.hasOwnProperty.call(guidePrices, key)
}

/** "£65" for a price key. */
export function priceText(key: GuidePriceKey): string {
  return `£${formatPrice(guidePrices[key])}`
}

const TOKEN = /\{price:([A-Za-z]+)\}/g

/** Replace every `{price:key}` token with its price. An unknown key throws, so a typo fails the build. */
export function fillPrices(text: string): string {
  return text.replace(TOKEN, (_, key: string) => {
    if (!isGuidePriceKey(key)) throw new Error(`Unknown guide price token {price:${key}}`)
    return priceText(key)
  })
}

/** Every token used in a piece of text, for the content test. */
export function priceTokens(text: string): string[] {
  return [...text.matchAll(TOKEN)].map((m) => m[1])
}
