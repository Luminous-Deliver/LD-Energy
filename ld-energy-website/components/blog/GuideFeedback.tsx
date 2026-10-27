'use client'

import { useEffect, useState } from 'react'
import { conversionEvent } from '@/lib/conversion-events'
import { analyticsAllowed } from '@/lib/analytics-preference'

type Answer = 'yes' | 'no'
const key = (slug: string) => `ld-energy-guide-feedback:${slug}`

/**
 * Was this guide useful? Two text buttons at the end of every guide (Abdul 23/10; the line-drawn faces were turned
 * down). The answer goes to the site's conversion-event boundary only when analytics is allowed, and is remembered in
 * this browser so the question is not asked again. A "No" offers WhatsApp and email to say what was missing.
 */
export function GuideFeedback({ slug, waHref, email, emailHref }: { slug: string; waHref: string; email: string; emailHref: string }) {
  const [answer, setAnswer] = useState<Answer | null>(null)
  useEffect(() => {
    try {
      const v = localStorage.getItem(key(slug))
      if (v === 'yes' || v === 'no') setAnswer(v)
    } catch { /* private window or blocked storage: ask as normal */ }
  }, [slug])
  const pick = (a: Answer) => {
    setAnswer(a)
    try { localStorage.setItem(key(slug), a) } catch { /* not remembered, still thanked */ }
    if (analyticsAllowed()) conversionEvent('guide_feedback', { guide: slug, answer: a })
  }
  return (
    <section className="gd-fb" aria-labelledby="gd-fb-h">
      <p id="gd-fb-h" className="gd-fb__h">Was this guide useful?</p>
      {answer === null ? (
        <div className="gd-fb__acts">
          <button type="button" className="gd-fb__btn" onClick={() => pick('yes')}>Yes</button>
          <button type="button" className="gd-fb__btn" onClick={() => pick('no')}>No</button>
        </div>
      ) : null}
      <div aria-live="polite" className="gd-fb__live">
        {answer === 'yes' && <p className="gd-fb__thanks">Thank you. Glad it helped.</p>}
        {answer === 'no' && (
          <div className="gd-fb__no">
            <p className="gd-fb__thanks">Thank you for saying. Tell us what was missing and we will add it.</p>
            <p className="gd-fb__ways">
              <a className="gd-fb__wa" href={waHref} target="_blank" rel="noopener noreferrer">Tell us on WhatsApp</a>
              <span aria-hidden="true">or</span>
              <a className="gd-fb__mail" href={emailHref}>{email}</a>
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
