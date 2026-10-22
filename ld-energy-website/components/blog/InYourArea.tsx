import Link from 'next/link'
import { MapPin } from 'lucide-react'
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
    <section aria-labelledby="in-your-area" className="not-prose my-12">
      <h2 id="in-your-area" className="text-xl md:text-2xl font-bold text-secondary-900">
        In your area
      </h2>
      <p className="mt-2 text-secondary-700">
        Ratings from EPCs lodged for existing homes, {ukDate(statsSource.from)} to {ukDate(statsSource.to)},
        from the GOV.UK register.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {areas.map(({ meta, stats }) => (
          <li key={meta.slug}>
            <Link
              href={`/areas/${meta.slug}`}
              className="block h-full rounded-lg border border-secondary-200 bg-white p-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
            >
              <span className="flex items-center gap-1.5 font-semibold text-secondary-900">
                <MapPin className="h-4 w-4 text-primary-600" aria-hidden="true" />
                EPCs in {meta.name}
              </span>
              <span className="mt-1 block text-sm text-secondary-700">
                {pct(stats!.ratings.pct.AtoC)} rated A to C, {pct(stats!.ratings.pct.D)} rated D
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <Link href="/areas" className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800">
          All London areas we cover
        </Link>
        {BOROUGH_DATA_PAGE.live && (
          <Link href={BOROUGH_DATA_PAGE.href} className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800">
            {BOROUGH_DATA_PAGE.label}
          </Link>
        )}
      </p>
    </section>
  )
}
