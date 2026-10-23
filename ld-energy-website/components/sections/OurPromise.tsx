import Link from 'next/link'
import { promise } from '@/lib/site'
import './our-promise.css'

/**
 * Our promise (Abdul 23/10/2026): two money-backed promises, shown where people decide to book, so nobody misses them.
 * Each promise goes beyond the customer's legal rights (DMCCA 2024 Sch 20 para 11 bans dressing up legal rights as an
 * offer), and the conditions live in the terms, section 7, #our-promise.
 */
export function OurPromise({ tone = 'paper' }: { tone?: 'paper' | 'night' }) {
  return (
    <aside className="op" data-tone={tone} aria-labelledby="op-h">
      <div className="op__in">
        <p className="op__k">Our promise</p>
        <h2 id="op-h" className="op__h">If we’re late, you pay less.</h2>
        <ul className="op__list">
          <li>
            <b className="op__amt">£{promise.lateLodgement} off</b>
            <span>if your EPC isn’t on the GOV.UK register within 72 hours of the visit.</span>
          </li>
          <li>
            <b className="op__amt">£{promise.lateChange} off</b>
            <span>if we move your visit with less than 24 hours’ notice. It’s the same fee we’d charge you.</span>
          </li>
        </ul>
        <p className="op__small">
          On top of your legal rights. <Link href="/terms#our-promise">How it works</Link>
        </p>
      </div>
    </aside>
  )
}
