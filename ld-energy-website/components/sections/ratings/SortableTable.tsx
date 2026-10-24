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
    <div className="in-tscroll st">
      <table className="in-table st__t">
        <caption className="sr-only">{caption}. Column headers are buttons that sort the table.</caption>
        <thead>
          <tr>
            <th scope="col" aria-sort={ariaSort('name')}>
              <button type="button" className="st__b" onClick={() => toggle('name')}>
                Borough <span aria-hidden="true">{arrow('name')}</span>
              </button>
            </th>
            {columns.map((c) => (
              <th key={c.key} scope="col" aria-sort={ariaSort(c.key)} className={c.numeric ? 'r' : undefined}>
                <button type="button" className="st__b" onClick={() => toggle(c.key, c.numeric)}>
                  {c.label} <span aria-hidden="true">{arrow(c.key)}</span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="num">
          {sorted.map((r) => (
            <tr key={r.slug} id={`row-${r.slug}`}>
              <th scope="row"><Link href={r.href} className="in-link">{r.name}</Link></th>
              {columns.map((c) => (
                <td key={c.key} className={c.numeric ? 'r' : undefined}>{r.cells[c.key].text}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
