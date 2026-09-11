'use client'

import { quoteHref } from '@/lib/quote-context'


import { useMemo, useState } from 'react'
import Link from 'next/link'
import { MapPin, ArrowRight, Search } from 'lucide-react'

interface Borough {
  slug: string
  name: string
}

interface BoroughFinderProps {
  boroughs: Borough[]
}

export function BoroughFinder({ boroughs }: BoroughFinderProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return boroughs
    return boroughs.filter((b) => b.name.toLowerCase().includes(q))
  }, [query, boroughs])

  return (
    <div>
      <div className="mt-8 relative max-w-md">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Start typing your borough…"
          aria-label="Search for your borough"
          className="block w-full min-h-[44px] rounded-lg border border-secondary-300 bg-white pl-10 pr-4 py-2.5 text-base text-secondary-900 placeholder:text-secondary-500 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-secondary-700">
          No borough matches &ldquo;{query}&rdquo;. We still cover all of London and nearby areas,{' '}
          <Link href={quoteHref({ sourcePage: 'areas', ctaId: 'inline' })} className="text-primary-700 underline underline-offset-2 hover:text-primary-800">
            contact us to confirm coverage for your postcode
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((borough) => (
            <li key={borough.slug}>
              <Link
                href={`/areas/${borough.slug}`}
                className="group flex items-center justify-between gap-2 rounded-lg border border-secondary-200 bg-white px-4 py-3 text-sm font-medium text-secondary-800 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-secondary-400 group-hover:text-primary-500" aria-hidden="true" />
                  {borough.name}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-secondary-400 group-hover:text-primary-500" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
