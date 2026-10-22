'use client'

import { useState } from 'react'
import Link from 'next/link'

export interface SortColumn {
  key: string
  label: string
  /** Numbers right-aligned and sorted high to low first. */
  numeric?: boolean
}

export interface SortRow {
  slug: string
  href: string
  name: string
  /** Sort value and display text per column key (the name column uses `name`). */
  cells: Record<string, { value: number; text: string }>
}

/**
 * A–Z table of every borough. Server-rendered in A–Z order, so it reads and crawls without JavaScript;
 * the header buttons re-sort it once the page is interactive.
 */
export function SortableTable({ caption, columns, rows }: { caption: string; columns: SortColumn[]; rows: SortRow[] }) {
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: 'name', dir: 'asc' })

  const sorted = [...rows].sort((a, b) => {
    const d = sort.key === 'name' ? a.name.localeCompare(b.name) : a.cells[sort.key].value - b.cells[sort.key].value
    return sort.dir === 'asc' ? d : -d
  })

  function toggle(key: string, numeric?: boolean) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: numeric ? 'desc' : 'asc' }))
  }

  const ariaSort = (key: string) => (sort.key === key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none')
  const arrow = (key: string) => (sort.key === key ? (sort.dir === 'asc' ? '↑' : '↓') : '↕')

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <caption className="sr-only">{caption}. Column headers are buttons that sort the table.</caption>
        <thead>
          <tr className="border-b border-secondary-200 text-secondary-600">
            <th scope="col" aria-sort={ariaSort('name')} className="py-1 pr-3 font-semibold">
              <button type="button" onClick={() => toggle('name')} className="inline-flex min-h-[44px] items-center gap-1 font-semibold hover:text-secondary-900">
                Borough <span aria-hidden="true">{arrow('name')}</span>
              </button>
            </th>
            {columns.map((c) => (
              <th key={c.key} scope="col" aria-sort={ariaSort(c.key)} className={`py-1 pr-3 font-semibold ${c.numeric ? 'text-right' : ''}`}>
                <button type="button" onClick={() => toggle(c.key, c.numeric)} className="inline-flex min-h-[44px] items-center gap-1 font-semibold hover:text-secondary-900">
                  {c.label} <span aria-hidden="true">{arrow(c.key)}</span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {sorted.map((r) => (
            <tr key={r.slug} id={`row-${r.slug}`} className="border-b border-secondary-100">
              <th scope="row" className="py-2 pr-3 font-medium text-secondary-900">
                <Link href={r.href} className="text-primary-700 underline-offset-2 hover:underline">{r.name}</Link>
              </th>
              {columns.map((c) => (
                <td key={c.key} className={`py-2 pr-3 whitespace-nowrap text-secondary-800 ${c.numeric ? 'text-right' : ''}`}>{r.cells[c.key].text}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
