'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'

export interface ExplorerTile {
  slug: string
  name: string
  label: string
  col: number
  row: number
  /** Share rated A to C, already formatted ("81.3%"). */
  value: string
  /** 0–4: which shade of the scale the tile takes. */
  step: number
}

// Five steps from light to dark sage; text flips to white on the two darkest. Colours live in the page's ratings.css
// (.bx-t[data-step]), so the tiles take the inner-page palette.
const STEPS = [0, 1, 2, 3, 4]

/**
 * The tile map and borough select. Every panel is server-rendered (crawlable); this only decides which one
 * shows. Without JavaScript, each tile is a link to its panel and CSS :target shows it (see .bx rules in
 * globals.css); the first panel shows by default.
 */
export function BoroughExplorer({ tiles, initial, panels }: { tiles: ExplorerTile[]; initial: string; panels: React.ReactNode }) {
  const [selected, setSelected] = useState(initial)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const fromHash = window.location.hash.replace('#borough-', '')
    if (tiles.some((t) => t.slug === fromHash)) setSelected(fromHash)
    setReady(true)
  }, [tiles])

  function choose(slug: string, reveal = false) {
    setSelected(slug)
    history.replaceState(null, '', `#borough-${slug}`)
    // On a phone the panel sits under the map, so bring it into view after a tap.
    if (reveal && window.matchMedia('(max-width: 1023px)').matches) {
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      requestAnimationFrame(() => document.getElementById(`borough-${slug}`)?.scrollIntoView({ block: 'nearest', behavior: smooth ? 'smooth' : 'auto' }))
    }
  }

  const current = tiles.find((t) => t.slug === selected)

  return (
    <div className={cn('bx', ready && 'bx-js')}>
      {ready && <style>{`.bx.bx-js #borough-${selected}{display:block}`}</style>}
      <div className="bx-grid">
        <div className="bx-map">
          <label htmlFor="borough-select" className="bx-lbl">Choose a borough</label>
          <select id="borough-select" className="bx-select" value={selected} onChange={(e) => choose(e.target.value)}>
            {[...tiles].sort((a, b) => a.name.localeCompare(b.name)).map((t) => (
              <option key={t.slug} value={t.slug}>{t.name}</option>
            ))}
          </select>
          <p className="sr-only" aria-live="polite">{current ? `Showing ${current.name}` : ''}</p>

          <div className="bx-tiles" role="group" aria-label="Map of London boroughs, share of EPCs rated A to C">
            {tiles.map((t) => (
              <a
                key={t.slug}
                href={`#borough-${t.slug}`}
                onClick={(e) => { e.preventDefault(); choose(t.slug, true) }}
                aria-label={`${t.name}, ${t.value} rated A to C`}
                aria-current={t.slug === selected ? 'true' : undefined}
                title={t.name}
                style={{ gridColumn: t.col, gridRow: t.row }}
                className="bx-t"
                data-step={t.step}
              >
                <span className="bx-t__l">{t.label}</span>
                <span className="bx-t__v">{Math.round(parseFloat(t.value))}%</span>
              </a>
            ))}
          </div>
          <div className="bx-key" aria-hidden="true">
            <span>Fewer A to C</span>
            <span className="bx-key__bar">{STEPS.map((s) => <span key={s} data-step={s} />)}</span>
            <span>More</span>
          </div>
        </div>
        <div className="bx-panels">{panels}</div>
      </div>
    </div>
  )
}
