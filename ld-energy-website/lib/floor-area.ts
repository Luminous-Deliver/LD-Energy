import { pricing } from '@/lib/site'

/** Stable area identifiers, one per pricing band, in the same order as `pricing`. */
export const areaBands = ['up-to-40', '40-55', '55-75', '75-95', '95-115', 'over-115'] as const
export const areaChoices = [...areaBands, 'unknown'] as const
export type AreaBand = (typeof areaBands)[number]
export type AreaChoice = (typeof areaChoices)[number]

/** The open-ended top band: a starting price, and the band that asks for an approximate area. */
export const TOP_BAND: AreaBand = 'over-115'

/**
 * Band identifiers used before the 22/10/2026 price change. A page cached before then can still
 * send one, so the server accepts it, names it in the booking email and prices nothing from it.
 */
export const retiredAreaBands = {
  'up-to-37': 'Up to 37 m²', '38-52': '38–52 m²', '53-70': '53–70 m²',
  '71-95': '71–95 m²', '96-120': '96–120 m²', '121-plus': '121 m²+',
} as const
export type RetiredAreaBand = keyof typeof retiredAreaBands
export const submittedAreaChoices = [...areaChoices, ...(Object.keys(retiredAreaBands) as RetiredAreaBand[])] as const

export function isRetiredArea(area?: string): area is RetiredAreaBand {
  return !!area && Object.hasOwn(retiredAreaBands, area)
}

/** Bedroom labels remain a cached-client compatibility input only. */
export const legacyPropertyTypes = ['Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom', '4 Bedroom', '5+ Bedroom'] as const

export function legacyArea(propertyType?: string): AreaBand | undefined {
  const index = legacyPropertyTypes.indexOf(propertyType as (typeof legacyPropertyTypes)[number])
  return index < 0 ? undefined : areaBands[index]
}

/** Shown when a typed floor area is zero, negative or not a number. */
export const FLOOR_AREA_ERROR = 'Enter a floor area greater than 0 m².'

/** A typed floor area in m², or undefined when blank or unusable. Accepts "85", "74.3" and "85 m2". */
export function parseExactArea(value?: string): number | undefined {
  const match = value?.trim().match(/^(\d{1,4}(?:\.\d{0,2})?)\s*(?:m2|m²|sq ?m)?$/i)
  const m2 = match ? Number(match[1]) : NaN
  return m2 > 0 ? m2 : undefined
}

/**
 * The price band a known floor area falls in. Each band includes its ceiling and nothing below
 * the previous one, with no rounding: 40 is "Up to 40 m²", 40.5 is "41–55 m²".
 */
export function bandForArea(m2: number): AreaBand {
  return areaBands[pricing.findIndex(band => band.areaMax === null || m2 <= band.areaMax)]
}

/** The customer's own figure when they gave one, otherwise the band they chose. */
export function areaLabel(area?: string, exact?: string): string {
  const m2 = parseExactArea(exact)
  if (m2 !== undefined && area !== 'unknown') return `${m2} m²`
  if (area === 'unknown') return 'Not sure of floor area'
  if (isRetiredArea(area)) return `${retiredAreaBands[area]} (earlier price list)`
  const index = areaBands.indexOf(area as AreaBand)
  return index < 0 ? 'Floor area not selected' : pricing[index].areaLabel
}
