import type { RunningCostBand } from '@/lib/borough-stats-types'
import { boroughStats } from '@/lib/borough-stats'
import { fmt } from '@/lib/area-page'

const costs = boroughStats.runningCosts

type BandId = RunningCostBand['id']
const LABEL: Record<BandId, string> = { B: 'B', C: 'C', D: 'D', E: 'E', FtoG: 'F and G' }

function gbp(n: number): string {
  return `£${fmt(n)}`
}

/** The bands table, in the same wrapper as the guides' Markdown tables. */
export function RunningCostTable({ view = 'totals' }: { view?: 'totals' | 'types' }) {
  const head =
    view === 'totals'
      ? ['Rating', 'Typical a year', 'A month', 'Middle half of homes', 'Certificates']
      : ['Rating', 'Flats', 'Houses', 'Heating', 'Hot water', 'Lighting']
  return (
    <div className="gd-table">
      <div className="gd-table__scroll">
        <table>
          <thead>
            <tr>
              {head.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {costs.bands.map((b) => (
              <tr key={b.id}>
                <td>{LABEL[b.id]}</td>
                {view === 'totals' ? (
                  <>
                    <td>{gbp(b.median)}</td>
                    <td>{gbp(b.monthly)}</td>
                    <td>
                      {gbp(b.q1)} to {gbp(b.q3)}
                    </td>
                    <td>{fmt(b.n)}</td>
                  </>
                ) : (
                  <>
                    <td>{b.flats === null ? 'too few' : gbp(b.flats)}</td>
                    <td>{b.houses === null ? 'too few' : gbp(b.houses)}</td>
                    <td>{gbp(b.heating)}</td>
                    <td>{gbp(b.hotWater)}</td>
                    <td>{gbp(b.lighting)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="gd-table__hint" aria-hidden="true">
        Swipe sideways to see the full table
      </p>
    </div>
  )
}
