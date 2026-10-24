'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import londonMap from '@/lib/london-map.json'

/* /areas map index (prototype approved by Abdul 23/10/2026, projects/ld-energy-redesign-2026-10/scrollcraft/builds/
   areas-map-proto). Each borough is a real link, so the map works without JS and from the keyboard; JS adds the side
   card, region chips and search. Geometry: lib/london-map.json (viewBox units, label centre per borough). */

export interface MapBorough {
  slug: string
  name: string
  region: string
  regionName: string
  /** Town centres and neighbourhoods. */
  places: string[]
  /** Postcode districts (outward codes). */
  districts: string[]
  /** Share rated A to C, formatted. */
  atoC: string
}

type Shape = { slug: string; d: string; cx: number; cy: number }
const MAP = londonMap as { w: number; h: number; b: Shape[] }

/* Shorter labels where the full name would spill past the shape; '' leaves the City unlabelled (too small). */
const SHORT: Record<string, string> = {
  'barking-dagenham': 'Barking & Dag.', 'kensington-chelsea': 'Kensington', 'hammersmith-fulham': 'Hammersmith',
  kingston: 'Kingston', richmond: 'Richmond', 'city-of-london': '', 'waltham-forest': 'Waltham F.', 'tower-hamlets': 'Tower H.',
}

/* Stratford base, in map units. */
const PIN = { x: 603.8, y: 283.2 }

function matches(b: MapBorough, v: string): boolean {
  if (b.name.toLowerCase().includes(v) || b.places.some((p) => p.toLowerCase().includes(v))) return true
  const pc = v.toUpperCase().replace(/\s.*/, '')
  return b.districts.some((d) => d === pc || (pc.length >= 2 && /\d/.test(pc) && d.startsWith(pc)))
}

export function AreasMap({ boroughs, regions, initial }: {
  boroughs: MapBorough[]
  regions: { id: string; name: string }[]
  initial: string
}) {
  const bySlug = useMemo(() => Object.fromEntries(boroughs.map((b) => [b.slug, b])), [boroughs])
  const [selected, setSelected] = useState(initial)
  const [shown, setShown] = useState(initial)
  const [region, setRegion] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  /* The last pointer press: a focus that follows a press is not keyboard focus. */
  const press = useRef({ touch: false, at: 0 })
  const card = useRef<HTMLDivElement>(null)

  const v = query.trim().toLowerCase()
  const hits = useMemo(() => {
    if (v) return boroughs.filter((b) => matches(b, v)).map((b) => b.slug)
    if (region) return boroughs.filter((b) => b.region === region).map((b) => b.slug)
    return null
  }, [boroughs, v, region])

  const select = (slug: string) => { setSelected(slug); setShown(slug) }
  /* Phones (Abdul 24/10, "selecting from the map is not really user friendly"): the card sits below the map, out of
     sight, so a pick brings it into view; on a wide screen it is already beside the map. */
  const reveal = () => {
    if (!window.matchMedia('(max-width: 959px)').matches) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    requestAnimationFrame(() => card.current?.scrollIntoView({ block: 'center', behavior: reduce ? 'instant' : 'smooth' }))
  }
  const inRegion = region ? boroughs.filter((x) => x.region === region).sort((a, z) => a.name.localeCompare(z.name)) : []
  const b = bySlug[shown]

  return (
    <div className="in-amap">
      <div className="in-amap__box">
        <svg
          className={`in-amap__svg${hits ? ' is-dim' : ''}`}
          viewBox={`0 0 ${MAP.w} ${MAP.h}`}
          role="group"
          aria-label="Map of the 33 London boroughs. Each borough links to its own page."
        >
          {MAP.b.map((s) => {
            const m = bySlug[s.slug]
            return (
              <a
                key={s.slug}
                href={`/areas/${s.slug}`}
                aria-label={`EPC in ${m.name}: ${m.atoC} rated A to C`}
                className={`in-amap__b${s.slug === selected ? ' is-on' : ''}${hits?.includes(s.slug) ? ' is-hit' : ''}`}
                data-region={m.region}
                onPointerDown={(e) => { press.current = { touch: e.pointerType !== 'mouse', at: Date.now() } }}
                onMouseEnter={() => setShown(s.slug)}
                onMouseLeave={() => setShown(selected)}
                onFocus={() => { if (Date.now() - press.current.at > 600) select(s.slug) }}
                onClick={(e) => {
                  /* On touch, the first tap shows the card; a second tap on the same borough opens its page. */
                  if (press.current.touch && Date.now() - press.current.at < 1500 && selected !== s.slug) { e.preventDefault(); select(s.slug); reveal() }
                }}
              >
                <path d={s.d} />
              </a>
            )
          })}
          <g aria-hidden="true">
            {MAP.b.map((s) => {
              const label = s.slug in SHORT ? SHORT[s.slug] : bySlug[s.slug].name
              if (!label) return null
              return (
                <text key={s.slug} x={s.cx} y={s.cy} className={`in-amap__lb${bySlug[s.slug].region === 'central' ? ' is-light' : ''}`}>{label}</text>
              )
            })}
            <g className="in-amap__pin">
              <circle cx={PIN.x} cy={PIN.y} r="6" />
              <text x={PIN.x + 10.2} y={PIN.y - 15.2}>Our base, Stratford</text>
            </g>
          </g>
        </svg>
        <div className="in-amap__legend" role="group" aria-label="Highlight a London region">
          {regions.map((r) => (
            <button
              key={r.id}
              type="button"
              className="in-amap__chip"
              aria-pressed={region === r.id}
              onClick={() => { setQuery(''); setRegion(region === r.id ? null : r.id) }}
            >
              <i data-region={r.id} aria-hidden="true" />{r.name}
            </button>
          ))}
        </div>
        {/* a region's boroughs as buttons: the easy way to pick on a phone, where some boroughs are a few pixels wide */}
        {inRegion.length > 0 && (
          <ul className="in-amap__pick" aria-label={`Boroughs in ${regions.find((r) => r.id === region)?.name}`}>
            {inRegion.map((x) => (
              <li key={x.slug}>
                <button type="button" aria-pressed={x.slug === selected} onClick={() => { select(x.slug); reveal() }}>{x.name}</button>
              </li>
            ))}
          </ul>
        )}
        <p className="in-amap__tip">Tap a region to list its boroughs, or tap the map: once to see a borough, twice to open it.</p>
      </div>

      <div className="in-amap__side">
        <div className="in-amap__search">
          <label htmlFor="areas-q">Borough, town or postcode</label>
          <input
            id="areas-q"
            type="search"
            value={query}
            placeholder="e.g. Hackney, Ilford or E15"
            autoComplete="off"
            onChange={(e) => {
              const next = e.target.value
              setQuery(next)
              setRegion(null)
              const t = next.trim().toLowerCase()
              const first = t && boroughs.find((x) => matches(x, t))
              if (first) select(first.slug)
            }}
          />
          <p className="in-amap__hint" aria-live="polite">
            {v && hits && (hits.length === 0
              ? 'Not listed? Every London postcode is covered by its borough.'
              : hits.length === 1 ? bySlug[hits[0]].name : `${hits.length} boroughs match: ${hits.map((h) => bySlug[h].name).join(', ')}`)}
          </p>
        </div>
        <div ref={card} className="in-amap__card" aria-live="polite">
          <p className="in-amap__reg">{b.regionName}</p>
          <h3>{b.name}</h3>
          <p className="in-amap__ac"><b className="num">{b.atoC}</b><span>of EPCs here are rated A to C</span></p>
          {b.places.length > 0 && <p className="in-amap__towns">{b.places.join(', ')}</p>}
          <p className="in-amap__pcs">{b.districts.join(' · ')}</p>
          <Link className="ld-btn ld-btn--primary in-amap__go" href={`/areas/${b.slug}`}>EPCs in {b.name} <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </div>
  )
}
