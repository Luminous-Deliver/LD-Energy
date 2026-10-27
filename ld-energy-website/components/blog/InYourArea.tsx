import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { boroughMeta } from '@/lib/boroughs'
import { pct, statsSource, summaryFor, ukDate } from '@/lib/area-page'
import { BOROUGH_DATA_PAGE } from '@/lib/guides'

/**
 * "In your area" on every guide (plan §8.2, §10): 2–3 area pages that fit the topic, /areas, and
 * the borough data page once it is live. Figures come from lib/borough-stats.ts.
 */
export function InYourArea({ slugs }: { slugs: string[] }) {
  const areas = slugs
    .map((slug) => ({ meta: boroughMeta[slug], stats: summaryFor(slug) }))
    .filter((a) => a.meta && a.stats)
  if (areas.length === 0) return null
  return (
    <section aria-labelledby="in-your-area" className="gd-area">
      <h2 id="in-your-area">In your area</h2>
      <p className="gd-area__lede">
        Ratings from EPCs lodged for existing homes, {ukDate(statsSource.from)} to {ukDate(statsSource.to)}, from the
        GOV.UK register.
      </p>
      <ul>
        {areas.map(({ meta, stats }) => (
          <li key={meta.slug}>
            <Link href={`/areas/${meta.slug}`} className="gd-area__row">
              <span>
                <b>EPCs in {meta.name}</b>
                <br />
                <span className="num">{pct(stats!.ratings.pct.D)}</span> rated D
              </span>
              <span className="pc num">
                {pct(stats!.ratings.pct.AtoC)}
                <small>A to C</small>
              </span>
              <ArrowRight className="gd-arrow" width={18} height={18} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
      <p className="gd-area__links">
        <Link href="/areas" className="gd-link">
          All London areas we cover
        </Link>
        {BOROUGH_DATA_PAGE.live && (
          <Link href={BOROUGH_DATA_PAGE.href} className="gd-link">
            {BOROUGH_DATA_PAGE.label}
          </Link>
        )}
      </p>
    </section>
  )
}
