'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'

export interface GuideListGroup {
  id: string
  heading: string
  intro: string
  guides: { slug: string; title: string; summary: string; minutes: number }[]
}

/**
 * Every guide, grouped by what the reader is doing (board option B, Abdul 23/10/2026): topic chips filter the
 * groups, and each group keeps its reading order, numbered, start-here first (option C's ease of use). Without
 * JavaScript every group shows, so nothing is ever hidden from a crawler or a reader.
 */
export function GuideList({ groups }: { groups: GuideListGroup[] }) {
  const [on, setOn] = useState<string>('all')
  const total = groups.reduce((n, g) => n + g.guides.length, 0)
  const shown = on === 'all' ? total : groups.find((g) => g.id === on)?.guides.length ?? 0

  return (
    <>
      <div className="gd-chips" role="group" aria-label="Show guides by topic">
        <button type="button" className="gd-chip" aria-pressed={on === 'all'} onClick={() => setOn('all')}>
          All <span className="num">{total}</span>
        </button>
        {groups.map((g) => (
          <button key={g.id} type="button" className="gd-chip" aria-pressed={on === g.id} onClick={() => setOn(g.id)}>
            {g.heading} <span className="num">{g.guides.length}</span>
          </button>
        ))}
      </div>
      <p className="gd-count" aria-live="polite">
        Showing <span className="num">{shown}</span> of <span className="num">{total}</span> guides
      </p>
      {groups.map((g) => (
        <section key={g.id} id={g.id} className="gd-grp" aria-labelledby={`${g.id}-h`} hidden={on !== 'all' && on !== g.id}>
          <header className="gd-grp__h">
            <p className="gd-eyebrow">
              <span className="num">{g.guides.length}</span> {g.guides.length === 1 ? 'guide' : 'guides'}
            </p>
            <h3 id={`${g.id}-h`}>{g.heading}</h3>
            <p>{g.intro}</p>
          </header>
          <ol className="gd-list">
            {g.guides.map((guide, i) => (
              <li key={guide.slug}>
                <Link href={`/blog/${guide.slug}`} className="gd-row">
                  <span className="gd-row__n num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <span className="gd-row__b">
                    {i === 0 && (
                      <span className="gd-tagline">
                        <span className="gd-start">Start here</span>
                      </span>
                    )}
                    <b>{guide.title}</b>
                    <span className="gd-row__d">{guide.summary}</span>
                  </span>
                  <span className="gd-row__m">
                    <Clock width={14} height={14} aria-hidden="true" />
                    <span>
                      <span className="num">{guide.minutes}</span> min
                    </span>
                  </span>
                  <ArrowRight className="gd-arrow" width={18} height={18} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </>
  )
}
