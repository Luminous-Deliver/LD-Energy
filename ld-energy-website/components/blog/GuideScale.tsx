/** The A to G scale with each band's SAP range (SAP 10.2 Table 14), as in epc-ratings-explained. */
const SCALE = [
  { band: 'A', range: '92+', bg: '#008054', ink: '#fff', w: 34 },
  { band: 'B', range: '81–91', bg: '#19B459', ink: '#fff', w: 44 },
  { band: 'C', range: '69–80', bg: '#8DCE46', ink: '#1E2A12', w: 54 },
  { band: 'D', range: '55–68', bg: '#FFD500', ink: '#33384F', w: 64 },
  { band: 'E', range: '39–54', bg: '#FCAA65', ink: '#33384F', w: 74 },
  { band: 'F', range: '21–38', bg: '#EF8023', ink: '#fff', w: 84 },
  { band: 'G', range: '1–20', bg: '#E9153B', ink: '#fff', w: 94 },
] as const

interface GuideScaleProps {
  /** Draw the letting minimum under band E. */
  minimum?: boolean
  /** Small version for a card. */
  art?: boolean
  caption?: boolean
}

export function GuideScale({ minimum = true, art = false, caption = true }: GuideScaleProps) {
  const list = (
    <ol aria-label="EPC bands A to G with SAP score ranges">
      {SCALE.map((s) => (
        <li key={s.band} style={{ display: 'contents' }}>
          <span className="gd-scale__bar" style={{ width: `${s.w}%`, background: s.bg, color: s.ink }}>
            <b>{s.band}</b>
            <span className="num">{s.range}</span>
          </span>
          {minimum && s.band === 'E' && (
            <span className="gd-scale__line">
              <span>Letting minimum: band E or above</span>
            </span>
          )}
        </li>
      ))}
    </ol>
  )
  if (art) return <div className="gd-scale gd-scale--art">{list}</div>
  return (
    <figure className="gd-scale">
      {caption && (
        <figcaption>
          <span className="gd-eyebrow">SAP score for each band</span>
          <span className="gd-scale__note">Most efficient at the top</span>
        </figcaption>
      )}
      {list}
    </figure>
  )
}
