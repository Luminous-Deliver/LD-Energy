import { boroughStats } from './borough-stats'
import type { AreaSummary } from './borough-stats-types'
import type { AreaBand } from './floor-area'
import { pricing, site } from './site'

/**
 * Area pages on the rebuilt template (plan PLAN-AREAS-GUIDES-2026-10-22 §4). The pilot is three
 * pages and D1 adds eight; the others keep the current template until their batch. AREA_V2_ALL=1 at build time
 * renders every area page on the new template, which the uniqueness check uses to measure the
 * pilot pages against the shared parts of the template.
 */
export const PILOT_SLUGS = ['stratford', 'newham', 'croydon'] as const
/** Batch D1 (plan §11): the rest of the top ten boroughs by impressions. */
export const D1_SLUGS = ['wandsworth', 'waltham-forest', 'greenwich', 'lambeth', 'brent', 'tower-hamlets', 'camden', 'barking-dagenham'] as const
export const AREA_V2_SLUGS = [...PILOT_SLUGS, ...D1_SLUGS] as const

/**
 * Plan §15 refinement 2, from batch D1: where marketed sales outnumber private lettings in the borough's data,
 * "Why homes here rate" comes before "If you let". Decided by the data at build, never by hand; the pilot keeps its order.
 */
export function salesLed(slug: string): boolean {
  if ((PILOT_SLUGS as readonly string[]).includes(slug)) return false
  const s = summaryFor(slug)
  return !!s && s.pctSales > s.pctLettings
}

export function usesAreaV2(slug: string): boolean {
  return process.env.AREA_V2_ALL === '1' || (AREA_V2_SLUGS as readonly string[]).includes(slug)
}

/** The figures for an area page: a borough, or Stratford's own E15 + E20 summary. */
export function summaryFor(slug: string): AreaSummary | undefined {
  if (slug === 'stratford') return boroughStats.stratford
  return boroughStats.boroughs[slug]
}

export const london = boroughStats.london
export const statsSource = boroughStats.source

export function ukDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function fmt(n: number): string {
  return n.toLocaleString('en-GB')
}

export function pct(n: number): string {
  return `${n.toFixed(1)}%`
}

/** "about 1 in 4", "more than 1 in 4", "nearly 1 in 3", worded from the actual share. */
export function oneIn(share: number): string {
  const n = Math.max(1, Math.round(100 / share))
  const exact = 100 / n
  if (share > exact + 1) return `more than 1 in ${n}`
  if (share < exact - 1) return `nearly 1 in ${n}`
  return `about 1 in ${n}`
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`
}

/** Rank of a borough among the 33 on a measure, 1 = highest. Undefined for Stratford. */
export function rankOf(slug: string, measure: (a: AreaSummary) => number): number | undefined {
  const own = boroughStats.boroughs[slug]
  if (!own) return undefined
  const value = measure(own)
  return Object.values(boroughStats.boroughs).filter((b) => measure(b) > value).length + 1
}

export const boroughCount = Object.keys(boroughStats.boroughs).length

/** "7th" or "joint 7th" among the 33 boroughs on a measure, 1 = highest. */
export function rankLabel(slug: string, measure: (a: AreaSummary) => number): string {
  const own = boroughStats.boroughs[slug]
  const rank = rankOf(slug, measure)
  if (!own || rank === undefined) return ''
  const ties = Object.values(boroughStats.boroughs).filter((b) => measure(b) === measure(own)).length
  return `${ties > 1 ? 'joint ' : ''}${ordinal(rank)}`
}

export function bandIndex(id: AreaBand): number {
  return pricing.findIndex((b) => b.id === id)
}

/** A band as a phrase inside a sentence: "55–75 m²", "up to 40 m²", "over 115 m²". */
export function bandPhrase(id: AreaBand): string {
  const band = pricing[bandIndex(id)]
  if (band.startingPrice) return band.areaLabel.toLowerCase()
  if (band.areaLabel.startsWith('Up to')) return band.areaLabel.replace('Up to', 'up to')
  return band.areaLabel.replace(/^Over /, '')
}

/** The EPC guide price for a band as a phrase: "£85", or "from £120" for the open top band. */
export function bandEpcPrice(id: AreaBand): string {
  const band = pricing[bandIndex(id)]
  return band.startingPrice ? `from £${band.epc}` : `£${band.epc}`
}

/**
 * The opening line names the service the customer chose (Abdul 23/10/2026). Keys are the form's service values
 * (lib/booking-options.ts `services`). Before a service is chosen (header, hero, dock, area pages) it is the EPC.
 */
export const whatsappOpeningLines: Record<string, string> = {
  'EPC Certificate': "Hi, I'd like a quote for an EPC.",
  'Both (Bundle)': "Hi, I'd like a quote for an EPC and floor plan.",
  'Floor Plan': "Hi, I'd like a quote for a floor plan.",
  'EPC Pre-Assessment (not lodged)': "Hi, I'd like a quote for a pre-assessment.",
  'Bulk / Agency Enquiry': "Hi, I'd like a quote for several properties.",
}

/** WhatsApp with a short quote request prefilled for the customer to complete (Abdul 22/10/2026). */
export function whatsappQuoteText(service?: string): string {
  const opening = (service && whatsappOpeningLines[service]) || whatsappOpeningLines['EPC Certificate']
  return [opening, 'Full address:', 'Postcode:'].join('\n')
}

export function whatsappQuoteHref(): string {
  return `${site.whatsappHref}?text=${encodeURIComponent(whatsappQuoteText())}`
}
