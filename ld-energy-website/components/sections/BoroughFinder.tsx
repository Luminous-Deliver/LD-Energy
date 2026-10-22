'use client'

import { quoteHref } from '@/lib/quote-context'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'

export interface FinderRow {
  slug: string
  name: string
  /** Town centres and neighbourhoods. */
  places: string[]
  /** Postcode districts (outward codes). */
  districts: string[]
  /** Share rated A to C, formatted. */
  atoC: string
  /** A neighbourhood page inside this borough (Stratford in Newham). */
  child?: { slug: string; name: string; districts: string[] }
}

export interface FinderRegion {
  id: string
  name: string
  rows: FinderRow[]
}

function matches(row: FinderRow, q: string): boolean {
  if (!q) return true
  const hay = [row.name, ...row.places, row.child?.name ?? ''].join(' | ').toLowerCase()
  if (hay.includes(q)) return true
  const pc = q.replace(/\s+/g, '').toUpperCase()
  return [...row.districts, ...(row.child?.districts ?? [])].some((d) => d.startsWith(pc) && pc.length >= 2)
}

/** "Find your area": search by borough, town or postcode district, results grouped by sub-region. */
export function BoroughFinder({ regions }: { regions: FinderRegion[] }) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()

  const filtered = useMemo(
    () => regions.map((r) => ({ ...r, rows: r.rows.filter((row) => matches(row, q)) })).filter((r) => r.rows.length > 0),
    [regions, q],
  )
  const total = filtered.reduce((n, r) => n + r.rows.length, 0)

  return (
    <div>
      <div className="mt-8 relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Borough, town or postcode, e.g. E15"
          aria-label="Search by borough, town or postcode district"
          className="block w-full min-h-[44px] rounded-lg border border-secondary-300 bg-white pl-10 pr-4 py-2.5 text-base text-secondary-900 placeholder:text-secondary-500 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
        />
      </div>
      <p className="sr-only" aria-live="polite">{q ? `${total} ${total === 1 ? 'area matches' : 'areas match'}` : ''}</p>

      {filtered.length === 0 ? (
        <p className="mt-8 text-secondary-700">
          No area matches &ldquo;{query}&rdquo;. We still cover all of London and nearby areas,{' '}
          <Link href={quoteHref({ sourcePage: 'areas', ctaId: 'inline' })} className="text-primary-700 underline underline-offset-2 hover:text-primary-800">
            contact us to confirm coverage for your postcode
          </Link>
          .
        </p>
      ) : (
        <div className="mt-8 space-y-10">
          {filtered.map((region) => (
            <section key={region.id} id={`region-${region.id}`} aria-labelledby={`region-${region.id}-h`}>
              <h3 id={`region-${region.id}-h`} className="text-xl font-bold text-secondary-900">
                {region.name} <span className="ml-1 font-sans text-sm font-medium text-secondary-500">{region.rows.length} {region.rows.length === 1 ? 'area' : 'areas'}</span>
              </h3>
              <ul className="mt-4 divide-y divide-secondary-200 border-y border-secondary-200">
                {region.rows.map((row) => (
                  <li key={row.slug} className="grid gap-x-6 gap-y-1 py-4 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto] md:items-baseline">
                    <Link href={`/areas/${row.slug}`} className="group block py-2.5 font-semibold text-primary-700 hover:text-primary-800 md:py-0">
                      EPC in {row.name}
                      <ArrowRight className="ml-1.5 inline w-3.5 h-3.5 align-[-1px] text-secondary-400 group-hover:text-primary-500" aria-hidden="true" />
                    </Link>
                    <div className="min-w-0 text-sm text-secondary-700">
                      {row.places.length > 0 && <p>{row.places.join(', ')}</p>}
                      <p className="mt-1 text-xs tracking-wide text-secondary-600">{row.districts.join(' · ')}</p>
                      {row.child && (
                        <p className="mt-2">
                          <Link href={`/areas/${row.child.slug}`} className="font-semibold text-primary-700 underline-offset-2 hover:underline">EPC in {row.child.name}</Link>
                          <span className="text-xs text-secondary-600"> ({row.child.districts.join(', ')}), where we are based</span>
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-secondary-700 md:whitespace-nowrap md:text-right">
                      <span className="font-semibold tabular-nums text-secondary-900">{row.atoC}</span> rated A to C
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
