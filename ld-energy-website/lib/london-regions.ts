/**
 * London's five sub-regions and each borough's town centres, for grouping /areas (plan
 * PLAN-AREAS-GUIDES-2026-10-22 §7). The grouping helps people find their area; it ranks nothing.
 *
 * Source, read 22/10/2026: Greater London Authority, The London Plan (consolidated with alterations
 * since 2011, March 2016), https://www.london.gov.uk/sites/default/files/the_london_plan_malp_final_for_web_0606_0.pdf
 * - Sub-regions: Policy 2.5, Map 2.1 and the glossary entry "Sub-regions". Para 2.24 states the
 *   boundaries in force since the 2011 Plan (Waltham Forest sits in East, not North).
 * - Town centres: Annex 2, London's town centre network; the International, Metropolitan and Major
 *   centres only. A centre on a borough boundary (West End, Knightsbridge, Kilburn, Queensway) is
 *   listed under both boroughs, as the Annex lists it.
 */
export type RegionId = 'central' | 'east' | 'north' | 'south' | 'west'

export const regions: { id: RegionId; name: string; boroughs: string[] }[] = [
  { id: 'central', name: 'Central London', boroughs: ['camden', 'city-of-london', 'islington', 'kensington-chelsea', 'lambeth', 'southwark', 'westminster'] },
  { id: 'east', name: 'East London', boroughs: ['barking-dagenham', 'bexley', 'greenwich', 'hackney', 'havering', 'lewisham', 'newham', 'redbridge', 'tower-hamlets', 'waltham-forest'] },
  { id: 'north', name: 'North London', boroughs: ['barnet', 'enfield', 'haringey'] },
  { id: 'south', name: 'South London', boroughs: ['bromley', 'croydon', 'kingston', 'merton', 'richmond', 'sutton', 'wandsworth'] },
  { id: 'west', name: 'West London', boroughs: ['brent', 'ealing', 'hammersmith-fulham', 'harrow', 'hillingdon', 'hounslow'] },
]

/** International, Metropolitan and Major town centres by borough (London Plan Annex 2). */
export const townCentres: Record<string, string[]> = {
  'barking-dagenham': ['Barking'],
  barnet: ['Edgware'],
  bexley: ['Bexleyheath'],
  brent: ['Wembley', 'Kilburn'],
  bromley: ['Bromley', 'Orpington'],
  camden: ['West End', 'Camden Town', 'Kilburn'],
  'city-of-london': [],
  croydon: ['Croydon'],
  ealing: ['Ealing', 'Southall'],
  enfield: ['Enfield Town'],
  greenwich: ['Woolwich', 'Eltham'],
  hackney: ['Dalston'],
  'hammersmith-fulham': ["Shepherd's Bush", 'Hammersmith', 'Fulham'],
  haringey: ['Wood Green'],
  harrow: ['Harrow'],
  havering: ['Romford'],
  hillingdon: ['Uxbridge'],
  hounslow: ['Hounslow', 'Chiswick'],
  islington: ['Angel', 'Nags Head'],
  'kensington-chelsea': ['Knightsbridge', 'Kensington High Street', "King's Road", 'Queensway'],
  kingston: ['Kingston'],
  lambeth: ['Brixton', 'Streatham'],
  lewisham: ['Lewisham', 'Catford'],
  merton: ['Wimbledon'],
  newham: ['Stratford', 'East Ham'],
  redbridge: ['Ilford'],
  richmond: ['Richmond'],
  southwark: ['Peckham'],
  sutton: ['Sutton'],
  'tower-hamlets': ['Canary Wharf'],
  'waltham-forest': ['Walthamstow'],
  wandsworth: ['Clapham Junction', 'Putney', 'Tooting', 'Wandsworth'],
  westminster: ['West End', 'Knightsbridge', 'Queensway'],
}

export function regionOf(slug: string): RegionId | undefined {
  return regions.find((r) => r.boroughs.includes(slug))?.id
}
