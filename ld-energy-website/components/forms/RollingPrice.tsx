'use client'

import { useEffect, useState } from 'react'

/**
 * A price whose digits roll to their new value when the visitor changes the size or service (Abdul 24/10/2026: the
 * prototype v7.2 estimate rolled, Designspells; the 22/10 port kept the live form and lost it). Each digit is a column
 * that slides to its value; the glyphs are CSS generated content, so the real price is the only text: screen readers
 * and innerText read "£125", never the columns. No roll on the first paint or with reduced motion.
 */
export function RollingPrice({ text }: { text: string }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    // after the first paint, so the starting value lands without a roll
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [])
  const chars = text.split('')
  return (
    <>
      <span className="sr-only">{text}</span>
      <span className="odo" data-ready={ready} aria-hidden="true">
        {chars.map((c, i) => {
          // keyed from the right, so £95 to £105 keeps the units and tens columns and only adds the hundreds
          const key = chars.length - i
          return /\d/.test(c)
            ? <span key={key} className="odo__c"><span className="odo__s" style={{ transform: `translateY(${-Number(c)}em)` }} /></span>
            : <span key={key} className="odo__g" data-ch={c} />
        })}
      </span>
    </>
  )
}
