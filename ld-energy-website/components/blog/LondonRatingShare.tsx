import type { RatingGroup } from '@/lib/borough-stats-types'
import { london, pct } from '@/lib/area-page'

/** London's share of EPCs in a rating group, from lib/borough-stats.ts: `<LondonRatingShare group="D" />` renders "32.8%". */
export function LondonRatingShare({ group }: { group: RatingGroup }) {
  const value = london.ratings.pct[group]
  if (value === undefined) throw new Error(`Unknown rating group "${group}"`)
  return <span className="whitespace-nowrap">{pct(value)}</span>
}
