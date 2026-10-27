'use client'

import { useEffect, useState } from 'react'
import { Printer, RotateCcw } from 'lucide-react'
import type { PrepGroup } from '@/lib/prep-checklist'

/** Bump the suffix only if the meaning of existing ids changes; new items need new ids, not a new key. */
const KEY = 'ld-prep-checklist-v1'

function load(known: Set<string>): Set<string> {
  try {
    const raw = window.localStorage.getItem(KEY)
    const ids: unknown = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(ids) ? ids.filter((x): x is string => typeof x === 'string' && known.has(x)) : [])
  } catch {
    return new Set()
  }
}

function store(ids: Set<string>) {
  try {
    if (ids.size) window.localStorage.setItem(KEY, JSON.stringify(Array.from(ids)))
    else window.localStorage.removeItem(KEY)
  } catch {
    /* private mode or blocked storage: ticks still work for this visit */
  }
}

/**
 * The visit checklist: native checkboxes (keyboard and screen reader work as normal), ticks remembered on this
 * device only, and a Print button that prints the checklist alone (html[data-print="checklist"], see prep.css).
 * The page renders complete without JavaScript or storage; ticks simply start empty.
 */
export function PrepChecklist({ groups }: { groups: PrepGroup[] }) {
  const [done, setDone] = useState<Set<string>>(() => new Set())
  const total = groups.reduce((n, g) => n + g.items.length, 0)

  useEffect(() => {
    setDone(load(new Set(groups.flatMap((g) => g.items.map((i) => i.id)))))
  }, [groups])

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      store(next)
      return next
    })
  }

  const clear = () => {
    const next = new Set<string>()
    store(next)
    setDone(next)
  }

  const print = () => {
    const html = document.documentElement
    html.dataset.print = 'checklist'
    const reset = () => {
      delete html.dataset.print
      window.removeEventListener('afterprint', reset)
    }
    window.addEventListener('afterprint', reset)
    window.print()
  }

  return (
    <div className="pp-check">
      <div className="pp-check__bar">
        <p className="pp-check__count" aria-live="polite">
          <span>
            <span className="num">{done.size}</span> of <span className="num">{total}</span> ticked
          </span>
          <span className="pp-check__meter" aria-hidden="true">
            <span style={{ transform: `scaleX(${total ? done.size / total : 0})` }} />
          </span>
        </p>
        <div className="pp-check__acts">
          {done.size > 0 && (
            <button type="button" className="pp-check__clear" onClick={clear}>
              <RotateCcw width={16} height={16} aria-hidden="true" />
              Clear ticks
            </button>
          )}
          <button type="button" className="ld-btn ld-btn--line ld-btn--sm" onClick={print}>
            <Printer width={18} height={18} aria-hidden="true" />
            Print checklist
          </button>
        </div>
      </div>

      {groups.map((g) => (
        <fieldset key={g.id} className="pp-grp">
          <legend className="pp-grp__h">{g.title}</legend>
          <ul>
            {g.items.map((item) => {
              const on = done.has(item.id)
              return (
                <li key={item.id}>
                  <label className="pp-item" data-on={on || undefined}>
                    <input type="checkbox" checked={on} onChange={() => toggle(item.id)} />
                    <span className="pp-box" aria-hidden="true">
                      <svg viewBox="0 0 16 16" width="16" height="16">
                        <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="pp-item__t">
                      <b>{item.title}</b>
                      {item.note && <span>{item.note}</span>}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </fieldset>
      ))}
      <p className="pp-check__saved">Your ticks are saved on this phone or computer only.</p>
    </div>
  )
}
