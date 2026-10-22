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

// Five steps from light to dark brand green; text flips to white on the darkest.
const SHADES = ['bg-accent-50 text-secondary-900', 'bg-accent-100 text-secondary-900', 'bg-accent-200 text-secondary-900', 'bg-accent-400 text-secondary-900', 'bg-accent-700 text-white']

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
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
        <div>
          <label htmlFor="borough-select" className="block text-sm font-semibold text-secondary-900">Choose a borough</label>
          <select
            id="borough-select"
            value={selected}
            onChange={(e) => choose(e.target.value)}
            className="mt-2 block w-full max-w-sm min-h-[44px] rounded-lg border border-secondary-300 bg-white px-3 py-2 text-base text-secondary-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          >
            {[...tiles].sort((a, b) => a.name.localeCompare(b.name)).map((t) => (
              <option key={t.slug} value={t.slug}>{t.name}</option>
            ))}
          </select>
          <p className="sr-only" aria-live="polite">{current ? `Showing ${current.name}` : ''}</p>

          <div className="mt-6 grid grid-cols-8 gap-[3px] max-w-[30rem]" role="group" aria-label="Map of London boroughs, share of EPCs rated A to C">
            {tiles.map((t) => (
              <a
                key={t.slug}
                href={`#borough-${t.slug}`}
                onClick={(e) => { e.preventDefault(); choose(t.slug, true) }}
                aria-label={`${t.name}, ${t.value} rated A to C`}
                aria-current={t.slug === selected ? 'true' : undefined}
                title={t.name}
                style={{ gridColumn: t.col, gridRow: t.row }}
                className={cn(
                  'flex aspect-square flex-col border border-accent-200/80 items-center justify-center rounded-[4px] leading-none transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1',
                  SHADES[t.step],
                  t.slug === selected && 'ring-2 ring-primary-900 ring-offset-1',
                )}
              >
                <span className="text-[10px] font-bold tracking-wide sm:text-xs">{t.label}</span>
                <span className="mt-0.5 text-[9px] tabular-nums sm:text-[11px]">{Math.round(parseFloat(t.value))}%</span>
              </a>
            ))}
          </div>
          <div className="mt-3 flex max-w-[30rem] items-center gap-2 text-xs text-secondary-600" aria-hidden="true">
            <span>Fewer A to C</span>
            <span className="flex flex-1">{SHADES.map((s) => <span key={s} className={cn('h-2.5 flex-1 first:rounded-l-sm last:rounded-r-sm', s.split(' ')[0])} />)}</span>
            <span>More</span>
          </div>
        </div>
        <div className="bx-panels min-w-0">{panels}</div>
      </div>
    </div>
  )
}
