import { boroughStats } from './borough-stats'
import type { RunningCostBand } from './borough-stats-types'
import { fmt, ukDate } from './area-page'

/**
 * Running-cost figures for guides, read from lib/borough-stats.ts (scripts/borough-stats.py, running_costs).
 *
 * Guides never type these figures. Anywhere in a guide, body or frontmatter, write a token:
 * - `{cost:D.median}` → "£1,160"; other band fields: q1, q3, monthly, heating, hotWater, lighting, flats, houses
 *   (all £), perM2 ("£14.80"), n ("9,273"), medianArea ("77 m²"). Bands: B, C, D, E, FtoG.
 * - `{cost:D-C}` → the gap between two bands' medians, "£419".
 * - `{cost:from}`, `{cost:to}` → the lodgement dates pooled ("23/08/2026"); `{cost:total}` → certificates pooled.
 * An unknown token throws, so a typo fails the build.
 */
const costs = boroughStats.runningCosts
const TOKEN = /\{cost:([A-Za-z0-9.-]+)\}/g
const MONEY = ['median', 'q1', 'q3', 'monthly', 'heating', 'hotWater', 'lighting', 'flats', 'houses'] as const

function band(id: string): RunningCostBand {
  const b = costs.bands.find((x) => x.id === id)
  if (!b) throw new Error(`Unknown running-cost band "${id}"`)
  return b
}

const gbp = (n: number) => `£${fmt(n)}`

export function costText(key: string): string {
  if (key === 'from' || key === 'to') return ukDate(costs[key])
  if (key === 'total') return fmt(costs.n)
  const gap = key.match(/^([A-Za-z]+)-([A-Za-z]+)$/)
  if (gap) return gbp(band(gap[1]).median - band(gap[2]).median)
  const [id, field] = key.split('.')
  if (!field) throw new Error(`Unknown running-cost token {cost:${key}}`)
  const b = band(id)
  if ((MONEY as readonly string[]).includes(field)) {
    const v = b[field as (typeof MONEY)[number]]
    if (v === null) throw new Error(`No ${field} figure for band ${id}`)
    return gbp(v)
  }
  if (field === 'perM2') return `£${b.perM2.toFixed(2)}`
  if (field === 'n') return fmt(b.n)
  if (field === 'medianArea' && b.medianArea !== null) return `${b.medianArea} m²`
  throw new Error(`Unknown running-cost token {cost:${key}}`)
}

/** Replace every `{cost:...}` token. */
export function fillCosts(text: string): string {
  return text.replace(TOKEN, (_, key: string) => costText(key))
}
