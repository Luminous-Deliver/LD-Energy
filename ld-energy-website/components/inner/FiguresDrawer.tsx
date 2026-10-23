'use client'

import { useRef } from 'react'
import { Info, X } from 'lucide-react'

export type FigureStat = { value: string; label: string; chip: string }

/**
 * About these figures, option C on the inner-page options board (Abdul 23/10/2026): the area in three numbers, each
 * with a source chip; any chip opens one drawer with the source, method and caveats. A native <dialog> (modal), so
 * focus moves in, Esc closes it, and the page behind is inert. Bottom sheet on phones, side panel from 760 px.
 */
export function FiguresDrawer({ title, stats, children }: { title: string; stats: FigureStat[]; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  const open = () => ref.current?.showModal()
  const close = () => ref.current?.close()
  return (
    <>
      <ul className="in-stats">
        {stats.map((s) => (
          <li key={s.label}>
            <b className="num">{s.value}</b>
            <span>{s.label}</span>
            <button type="button" className="in-schip" onClick={open} aria-haspopup="dialog">
              <Info size={14} aria-hidden="true" /> {s.chip}
            </button>
          </li>
        ))}
      </ul>
      <dialog ref={ref} className="in-drawer" aria-labelledby="in-drawer-h"
        onClick={(e) => { if (e.target === e.currentTarget) close() }}>
        <div className="in-drawer__in">
          <div className="in-drawer__h">
            <h2 id="in-drawer-h">{title}</h2>
            <button type="button" className="in-drawer__x" onClick={close} aria-label="Close"><X size={20} aria-hidden="true" /></button>
          </div>
          {children}
        </div>
      </dialog>
    </>
  )
}
