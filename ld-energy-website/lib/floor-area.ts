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

export function areaLabel(area?: string): string {
  if (area === 'unknown') return 'Not sure of floor area'
  const index = areaBands.indexOf(area as AreaBand)
  return index < 0 ? 'Floor area not selected' : pricing[index].areaLabel
}
