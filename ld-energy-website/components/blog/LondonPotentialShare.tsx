import type { AreaSummary } from '@/lib/borough-stats-types'
import { london, pct } from '@/lib/area-page'

type PotentialMeasure = keyof AreaSummary['potential']

/**
 * London's potential-rating figures, from lib/borough-stats.ts:
 * `<LondonPotentialShare measure="pctAtoC" />` renders "96.3%" (share whose potential rating is A to C);
 * `measure="pctBelowCCouldReachC"` is the share of D to G certificates whose potential is A to C.
 */
export function LondonPotentialShare({ measure }: { measure: PotentialMeasure }) {
  const value = london.potential[measure]
  if (value === undefined) throw new Error(`Unknown potential measure "${measure}"`)
  return <span className="whitespace-nowrap">{pct(value)}</span>
}
