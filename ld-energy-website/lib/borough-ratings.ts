import { boroughStats } from './borough-stats'
import type { AreaSummary } from './borough-stats-types'
import { boroughMeta } from './boroughs'
import { townCentres } from './london-regions'

/**
 * Figures for the borough ratings data page (/epc-ratings-by-borough) and /areas, all read from
 * lib/borough-stats.ts at build time. Nothing here is typed by hand except the tile positions.
 */
export const DATA_PAGE_PATH = '/epc-ratings-by-borough'

export const boroughsAll: AreaSummary[] = Object.values(boroughStats.boroughs)

const byAtoC = (a: AreaSummary, b: AreaSummary) => b.ratings.pct.AtoC - a.ratings.pct.AtoC || a.name.localeCompare(b.name)

/** The 33 boroughs, highest share rated A to C first. */
export const rankedByAtoC: AreaSummary[] = [...boroughsAll].sort(byAtoC)

export const boroughsAtoZ: AreaSummary[] = [...boroughsAll].sort((a, b) => a.name.localeCompare(b.name))

/** The page's headline finding: the boroughs with the highest and lowest share rated A to C. */
export function ratingsFinding() {
  return { top: rankedByAtoC[0], bottom: rankedByAtoC[rankedByAtoC.length - 1] }
}

export function ratingsHeadline(): string {
  const { top, bottom } = ratingsFinding()
  return `${top.name} has London’s highest share of EPCs rated A to C, and ${bottom.name} the lowest`
}

/** The 32 boroughs without the City of London, whose small base (under 2,000 certificates) makes it an outlier on most measures. */
export const londonBoroughs: AreaSummary[] = boroughsAll.filter((b) => b.slug !== 'city-of-london')

/** The borough with the largest and smallest value of a measure. */
export function extremes(measure: (a: AreaSummary) => number, pool: AreaSummary[] = boroughsAll) {
  const sorted = [...pool].sort((a, b) => measure(b) - measure(a) || a.name.localeCompare(b.name))
  return { high: sorted[0], low: sorted[sorted.length - 1] }
}

/** Short labels for the tile map, where a full name won't fit in a square. */
export const tileLabel: Record<string, string> = {
  'barking-dagenham': 'BAR', barnet: 'BRN', bexley: 'BXL', brent: 'BRT', bromley: 'BRM', camden: 'CMD',
  'city-of-london': 'CTY', croydon: 'CRY', ealing: 'EAL', enfield: 'ENF', greenwich: 'GRN', hackney: 'HCK',
  'hammersmith-fulham': 'HMS', haringey: 'HGY', harrow: 'HRW', havering: 'HAV', hillingdon: 'HIL',
  hounslow: 'HNS', islington: 'ISL', 'kensington-chelsea': 'KNS', kingston: 'KNG', lambeth: 'LAM',
  lewisham: 'LEW', merton: 'MRT', newham: 'NWM', redbridge: 'RED', richmond: 'RCH', southwark: 'SWK',
  sutton: 'STN', 'tower-hamlets': 'TOW', 'waltham-forest': 'WTH', wandsworth: 'WNS', westminster: 'WST',
}

/**
 * Tile map: 33 equal squares on an 8 × 7 grid, each placed roughly where the borough sits
 * (the common "London squared" arrangement). [column, row], both from 1.
 */
export const tilePosition: Record<string, [number, number]> = {
  enfield: [5, 1],
  harrow: [3, 2], barnet: [4, 2], haringey: [5, 2], 'waltham-forest': [6, 2],
  hillingdon: [1, 3], ealing: [2, 3], brent: [3, 3], camden: [4, 3], islington: [5, 3], hackney: [6, 3], redbridge: [7, 3], havering: [8, 3],
  hounslow: [1, 4], 'hammersmith-fulham': [2, 4], 'kensington-chelsea': [3, 4], westminster: [4, 4], 'city-of-london': [5, 4], 'tower-hamlets': [6, 4], newham: [7, 4], 'barking-dagenham': [8, 4],
  richmond: [2, 5], wandsworth: [3, 5], lambeth: [4, 5], southwark: [5, 5], lewisham: [6, 5], greenwich: [7, 5], bexley: [8, 5],
  kingston: [3, 6], merton: [4, 6], croydon: [5, 6], bromley: [6, 6],
  sutton: [4, 7],
}

/** Town centres (London Plan) then the neighbourhoods each area page already names, without repeats. */
export function placesFor(slug: string): string[] {
  const list = (boroughMeta[slug]?.areasCovered ?? '').split('including ')[1] ?? ''
  const named = [...list.matchAll(/(?:^|, |and )(?:the )?([A-Z][A-Za-z'’ .-]+?) \([A-Z]{1,2}\d/g)].map((m) => m[1].trim())
  const out: string[] = []
  for (const p of [...(townCentres[slug] ?? []), ...named]) {
    if (!out.some((o) => o.toLowerCase() === p.toLowerCase())) out.push(p)
  }
  return out
}
