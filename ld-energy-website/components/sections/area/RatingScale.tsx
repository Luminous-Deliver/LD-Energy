import { BANDS, bandFor } from '@/lib/area-stats-types'

export interface ScaleRow {
  label: string
  score: number | null
  /** Share rated band C or above, when the table shows it. */
  pct?: number | null
  /** Reference rows (borough, London, England) sit under a rule, in muted ink. */
  reference?: boolean
}

/**
 * A dot plot on the EPC rating scale: one dot per area at its median score, the A to G bands
 * behind it as the axis. Numbers live in aligned columns as text; the track is decoration.
 * The window is zoomed to [MIN, MAX] because every London median falls inside it; the caption
 * says so, so the zoom never reads as the full 1 to 100 scale.
 */
const MIN = 50
const MAX = 96
const at = (score: number) => `${((score - MIN) / (MAX - MIN)) * 100}%`

// Band edges sit half a point outside each band's integer range, so a score of 69 is clearly in C.
const segments = BANDS.map((b) => ({ band: b.band, from: Math.max(MIN, b.min - 0.5), to: Math.min(MAX, b.max + 0.5) }))
  .filter((s) => s.to > s.from)
  .reverse()

export function RatingScale({ rows, caption, nameHeading, showPct = true }: {
  rows: ScaleRow[]; caption: string; nameHeading: string; showPct?: boolean
}) {
  return (
    <figure className="ar-scale" data-pct={showPct || undefined}>
      <div className="ar-scale__head" aria-hidden="true">
        <span className="ar-scale__name">{nameHeading}</span>
        <span className="ar-scale__bands">
          {segments.map((s) => (
            <span key={s.band} className={`ar-band ar-band--${s.band}`} style={{ left: at(s.from), width: `calc(${at(s.to)} - ${at(s.from)})` }}>{s.band}</span>
          ))}
        </span>
        <span className="ar-scale__num">Median score</span>
        {showPct && <span className="ar-scale__num">Rated C or above</span>}
      </div>
      <ol className="ar-scale__rows">
        {rows.map((r) => (
          <li key={r.label} className="ar-row" data-ref={r.reference || undefined}>
            <span className="ar-scale__name">{r.label}</span>
            <span className="ar-scale__track" aria-hidden="true">
              {segments.slice(1).map((s) => <i key={s.band} className="ar-rule" style={{ left: at(s.from) }} />)}
              {r.score != null && <b className="ar-dot" style={{ left: at(r.score) }} />}
            </span>
            <span className="ar-scale__num">
              {r.score != null ? <><span className="sr-only">median score </span>{r.score}<span className={`ar-chip ar-band--${bandFor(r.score)}`}><span className="sr-only">, band </span>{bandFor(r.score)}</span></> : 'Not published'}
            </span>
            {showPct && <span className="ar-scale__num">{r.pct != null ? `${Math.round(r.pct)}%` : 'Not published'}<span className="sr-only"> rated C or above</span></span>}
          </li>
        ))}
      </ol>
      <figcaption className="ar-scale__cap">{caption}</figcaption>
    </figure>
  )
}
