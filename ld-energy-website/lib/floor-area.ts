import { pricing } from '@/lib/site'

/** Stable area identifiers. Bedroom labels remain a cached-client compatibility input only. */
export const areaBands = ['up-to-37', '38-52', '53-70', '71-95', '96-120', '121-plus'] as const
export const areaChoices = [...areaBands, 'unknown'] as const
export type AreaBand = (typeof areaBands)[number]
export type AreaChoice = (typeof areaChoices)[number]
export const legacyPropertyTypes = ['Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom', '4 Bedroom', '5+ Bedroom'] as const

export function legacyArea(propertyType?: string): AreaBand | undefined {
  const index = legacyPropertyTypes.indexOf(propertyType as (typeof legacyPropertyTypes)[number])
  return index < 0 ? undefined : areaBands[index]
}

/** Sanity limits for a floor area the customer types, in m². */
export const EXACT_AREA_MIN = 10
export const EXACT_AREA_MAX = 2000

/** A typed floor area in m², or undefined when blank or unusable. Accepts "85", "74.3" and "85 m2". */
export function parseExactArea(value?: string): number | undefined {
  const match = value?.trim().match(/^(\d{1,4}(?:\.\d{0,2})?)\s*(?:m2|m²|sq ?m)?$/i)
  const m2 = match ? Number(match[1]) : NaN
  return m2 >= EXACT_AREA_MIN && m2 <= EXACT_AREA_MAX ? m2 : undefined
}

/** The price band a known floor area falls in. "Up to 37 m²" means 37 or less, so 37.5 is in 38–52. */
export function bandForArea(m2: number): AreaBand {
  return areaBands[pricing.findIndex(band => band.areaMax === null || m2 <= band.areaMax)]
}

/** The customer's own figure when they gave one, otherwise the band they chose. */
export function areaLabel(area?: string, exact?: string): string {
  const m2 = parseExactArea(exact)
  if (m2 !== undefined && area !== 'unknown') return `${m2} m²`
  if (area === 'unknown') return 'Not sure of floor area'
  const index = areaBands.indexOf(area as AreaBand)
  return index < 0 ? 'Floor area not selected' : pricing[index].areaLabel
}
