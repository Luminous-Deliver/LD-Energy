import type { Metadata } from 'next'
import Link from 'next/link'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { InnerEnding } from '@/components/inner/InnerEnding'
import { MixBar, OGL, SourceLine, dataSource, period } from '@/components/sections/area/AreaBlocks'
import { BoroughExplorer, type ExplorerTile } from '@/components/sections/ratings/BoroughExplorer'
import { SortableTable, type SortColumn, type SortRow } from '@/components/sections/ratings/SortableTable'
import type { AreaSummary } from '@/lib/borough-stats-types'
import { bandEpcPrice, bandPhrase, boroughCount, fmt, london, pct, rankLabel, statsSource, ukDate } from '@/lib/area-page'
import { DATA_PAGE_PATH, boroughsAtoZ, rankedByAtoC, ratingsFinding, ratingsHeadline, tileLabel, tilePosition } from '@/lib/borough-ratings'
import { defaultOgImage, site } from '@/lib/site'

const url = `${site.url}${DATA_PAGE_PATH}`
const { top, bottom } = ratingsFinding()
const firstYear = statsSource.from.slice(0, 4)
const lastYear = statsSource.to.slice(0, 4)
const atoC = (a: AreaSummary) => a.ratings.pct.AtoC
const city = boroughsAtoZ.find((b) => b.slug === 'city-of-london')

export const metadata: Metadata = {
  title: `EPC Ratings by London Borough, ${firstYear}–${lastYear}`,
  description: `How homes in each of London's ${boroughCount} boroughs rate on their EPCs: ${pct(atoC(london))} of ${fmt(london.certificates)} certificates since ${firstYear} are A to C. ${top.name} is highest at ${pct(atoC(top))}, ${bottom.name} lowest at ${pct(atoC(bottom))}.`,
  alternates: { canonical: url },
  openGraph: {
    images: [defaultOgImage],
    title: `EPC ratings by London borough | L&D Energy`,
    description: `${top.name} has the highest share of EPCs rated A to C, ${pct(atoC(top))}; ${bottom.name} the lowest, ${pct(atoC(bottom))}. GOV.UK register figures for all ${boroughCount} boroughs.`,
    url,
  },
}

/** Equal-count steps for the tile shading, so each shade holds about a fifth of the boroughs. */
function stepFor(slug: string): number {
  const i = rankedByAtoC.findIndex((b) => b.slug === slug)
  return 4 - Math.floor((i * 5) / rankedByAtoC.length)
}

function Panel({ s }: { s: AreaSummary }) {
  const prs = s.privateRented
  const rank = rankLabel(s.slug, atoC)
  return (
    <article id={`borough-${s.slug}`} className="bx-panel rounded-xl border border-secondary-200 bg-white p-5 md:p-6" data-default={s.slug === top.slug ? '' : undefined} aria-labelledby={`h-${s.slug}`}>
      <h3 id={`h-${s.slug}`} className="text-2xl font-bold tracking-tight text-secondary-900">{s.name}</h3>
      <p className="mt-1 text-sm text-secondary-600">{rank} of {boroughCount} for the share rated A to C</p>
      <p className="mt-4 text-secondary-700 leading-relaxed">
        <strong className="text-secondary-900">{pct(atoC(s))}</strong> of {fmt(s.ratings.n)} certificates rated A to C, against {pct(atoC(london))} across London.
      </p>
      <div className="mt-4">
        <MixBar label="Ratings" s={s} marker={{ label: 'London', atoC: atoC(london) }} />
      </div>
      <dl className="mt-5 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-secondary-600">Private rentals rated below C</dt>
          <dd className="font-semibold text-secondary-900 tabular-nums">{pct(prs.pctBelowC)} of {fmt(prs.n)}</dd>
        </div>
        <div>
          <dt className="text-secondary-600">Private rentals rated F or G</dt>
          <dd className="font-semibold text-secondary-900 tabular-nums">{fmt(prs.nFtoG)}</dd>
        </div>
        <div>
          <dt className="text-secondary-600">Typical floor area</dt>
          <dd className="font-semibold text-secondary-900 tabular-nums">{s.floorArea.median} m²</dd>
        </div>
        <div>
          <dt className="text-secondary-600">Commonest size and EPC guide price</dt>
          <dd className="font-semibold text-secondary-900 tabular-nums">{bandPhrase(s.commonestBand.id)}, {bandEpcPrice(s.commonestBand.id)}</dd>
        </div>
      </dl>
      {s.slug === 'city-of-london' && (
        <p className="mt-4 text-sm text-secondary-700">Small base: the City has far fewer certificates than any borough, so its shares move a lot from year to year.</p>
      )}
      <Link href={`/areas/${s.slug}`} className="mt-5 inline-flex min-h-[44px] items-center gap-1.5 font-semibold text-primary-700 hover:text-primary-800">
        EPCs in {s.name}: prices, postcodes and local rules <span aria-hidden="true">→</span>
      </Link>
    </article>
  )
}

const columns: SortColumn[] = [
  { key: 'certificates', label: 'Certificates', numeric: true },
  { key: 'atoC', label: 'A to C', numeric: true },
  { key: 'd', label: 'D', numeric: true },
  { key: 'e', label: 'E', numeric: true },
  { key: 'ftoG', label: 'F or G', numeric: true },
  { key: 'prsBelowC', label: 'Rentals below C', numeric: true },
  { key: 'median', label: 'Typical m²', numeric: true },
]

const rows: SortRow[] = boroughsAtoZ.map((b) => ({
  slug: b.slug,
  href: `/areas/${b.slug}`,
  name: b.name,
  cells: {
    certificates: { value: b.certificates, text: fmt(b.certificates) },
    atoC: { value: b.ratings.pct.AtoC, text: pct(b.ratings.pct.AtoC) },
    d: { value: b.ratings.pct.D, text: pct(b.ratings.pct.D) },
    e: { value: b.ratings.pct.E, text: pct(b.ratings.pct.E) },
    ftoG: { value: b.ratings.pct.FtoG, text: pct(b.ratings.pct.FtoG) },
    prsBelowC: { value: b.privateRented.pctBelowC, text: pct(b.privateRented.pctBelowC) },
    median: { value: b.floorArea.median ?? 0, text: String(b.floorArea.median ?? '') },
  },
}))

export default function RatingsByBoroughPage() {
  const tiles: ExplorerTile[] = rankedByAtoC.map((b) => ({
    slug: b.slug,
    name: b.name,
    label: tileLabel[b.slug],
    col: tilePosition[b.slug][0],
    row: tilePosition[b.slug][1],
    value: pct(atoC(b)),
    step: stepFor(b.slug),
  }))
  const years = Object.keys(london.byYear).sort()

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
        { '@type': 'ListItem', position: 2, name: 'Areas', item: `${site.url}/areas` },
        { '@type': 'ListItem', position: 3, name: 'EPC ratings by borough', item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      '@id': `${url}#dataset`,
      name: `EPC ratings of existing homes by London borough, ${firstYear}–${lastYear}`,
      description: `Share of domestic EPCs rated A to C, D, E and F or G, private-rented certificates below C, and typical floor area, for each of London's ${boroughCount} local authorities. Certificates for existing homes (RdSAP) lodged ${period}.`,
      url,
      creator: { '@id': `${site.url}/#business` },
      author: { '@id': `${site.url}/about#assessor` },
      isBasedOn: statsSource.url,
      license: OGL,
      creditText: `${statsSource.publisher}. ${statsSource.attribution}`,
      temporalCoverage: `${statsSource.from}/${statsSource.to}`,
      spatialCoverage: { '@type': 'Place', name: 'Greater London' },
      dateModified: statsSource.generated,
      variableMeasured: ['Share of certificates rated A to C', 'Share rated D', 'Share rated E', 'Share rated F or G', 'Private-rented certificates rated below C', 'Median total floor area'],
      isAccessibleForFree: true,
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <BreadcrumbNav items={[{ href: '/', label: 'Home' }, { href: '/areas', label: 'Areas' }, { href: DATA_PAGE_PATH, label: 'EPC ratings by borough' }]} />

      <section className="bg-gradient-to-b from-primary-50 via-white to-white border-b border-secondary-100 -mt-24">
        <Container className="pt-32 pb-12 md:pb-16">
          <p className="text-xs uppercase tracking-wide font-semibold text-primary-700 mb-3">EPC ratings by London borough, {firstYear}–{lastYear}</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-secondary-900 max-w-4xl text-balance">
            {ratingsHeadline()}
          </h1>
          <p className="mt-5 text-lg md:text-xl text-secondary-700 leading-relaxed max-w-3xl">
            {fmt(london.certificates)} EPCs were lodged for existing homes in London from {ukDate(statsSource.from)} to {ukDate(statsSource.to)}.
            {' '}{pct(atoC(london))} were rated A to C. {top.name} is highest at {pct(atoC(top))} and {bottom.name} lowest at {pct(atoC(bottom))}.
          </p>
          <dl className="mt-8 grid max-w-3xl grid-cols-3 gap-2 sm:gap-4">
            {[
              { k: 'London certificates', v: fmt(london.certificates) },
              { k: 'Rated A to C', v: pct(atoC(london)) },
              { k: 'Private rentals below C', v: pct(london.privateRented.pctBelowC) },
            ].map((x) => (
              <div key={x.k} className="rounded-lg border border-secondary-200 bg-white px-3 py-3 sm:px-4">
                <dt className="text-xs leading-snug text-secondary-600 sm:text-sm">{x.k}</dt>
                <dd className="mt-1 text-lg font-bold tabular-nums text-secondary-900 sm:text-2xl">{x.v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-sm text-secondary-600">
            Figures from the GOV.UK file of {ukDate(statsSource.fileUpdated)}, compiled by{' '}
            <Link href="/about" className="font-semibold text-secondary-800 underline-offset-2 hover:underline">{site.assessor.name}</Link>,
            {' '}Domestic Energy Assessor ({site.assessor.accreditations.map((a) => `${a.short} ${a.number}`).join(', ')}). Updated {ukDate(statsSource.generated)}.
          </p>
        </Container>
      </section>

      <Section variant="default" id="map" aria-labelledby="map-h">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-wide font-semibold text-primary-700">Every borough</p>
          <h2 id="map-h" className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">Find your borough</h2>
          <p className="mt-4 text-secondary-700 leading-relaxed">
            Each square is a borough, placed roughly where it sits, with its share of certificates rated A to C. Darker means more homes rated A to C. Pick one to see its figures.
          </p>
        </div>
        <div className="mt-8">
          <BoroughExplorer tiles={tiles} initial={top.slug} panels={boroughsAtoZ.map((b) => <Panel key={b.slug} s={b} />)} />
        </div>
        <SourceLine>{dataSource}</SourceLine>
      </Section>

      <Section variant="muted" id="trend" aria-labelledby="trend-h">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-wide font-semibold text-primary-700">London trend</p>
          <h2 id="trend-h" className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900">Share rated A to C in London, by year lodged</h2>
          <ul className="mt-8 space-y-4">
            {years.map((y) => {
              const m = london.byYear[y]
              return (
                <li key={y} className="grid grid-cols-[4.5rem_minmax(0,1fr)_4rem] items-center gap-3 text-sm">
                  <span className="font-semibold text-secondary-900">{y === lastYear ? `${y}*` : y}</span>
                  <span className="h-6 rounded bg-secondary-200/70" aria-hidden="true">
                    <span className="block h-6 rounded bg-[#19B459]" style={{ width: `${m.pct.AtoC}%` }} />
                  </span>
                  <span className="text-right font-semibold tabular-nums text-secondary-900">{pct(m.pct.AtoC)}</span>
                  <span className="col-start-2 col-span-2 -mt-2 text-xs text-secondary-600 tabular-nums">of {fmt(m.n)} certificates</span>
                </li>
              )
            })}
          </ul>
          <p className="mt-4 text-sm text-secondary-600">* {lastYear} to {ukDate(statsSource.to)}.</p>
          <p className="mt-4 text-secondary-700 leading-relaxed">
            The assessment method changed to RdSAP 10 during these years, and different homes are assessed each year, so the rise
            is not proof that London&rsquo;s homes improved by that much.
          </p>
        </div>
      </Section>

      <Section variant="default" id="table" aria-labelledby="table-h">
        <div className="max-w-5xl">
          <h2 id="table-h" className="text-2xl md:text-3xl font-bold tracking-tight text-secondary-900">All {boroughCount} boroughs, A to Z</h2>
          <details className="mt-6 rounded-lg border border-secondary-200 bg-white px-4 py-2 md:px-5">
            <summary className="flex min-h-[44px] cursor-pointer items-center font-semibold text-secondary-900">Show the table</summary>
            <div className="mt-2 pb-3">
              <SortableTable caption={`EPC ratings of existing homes by London borough, certificates lodged ${period}`} columns={columns} rows={rows} />
            </div>
          </details>
        </div>
      </Section>

      <Section variant="default" tier="compact" id="about-figures" aria-labelledby="about-h">
        <div className="max-w-3xl">
          <h2 id="about-h" className="text-2xl md:text-3xl font-bold tracking-tight text-secondary-900">About these figures</h2>
          <div className="mt-4 space-y-3 text-secondary-700 leading-relaxed">
            <p>
              Every figure comes from the domestic certificates on the GOV.UK EPC register: RdSAP certificates for existing
              homes, lodged {period}. &ldquo;Rated A to C&rdquo; is the number of certificates with a current rating of A, B or C,
              divided by all certificates with a rating, for the borough. Typical floor area is the median total floor area.
              Private rentals are certificates whose tenure is recorded as rented (private).
            </p>
            <ul className="list-disc space-y-1 pl-5">
              {statsSource.caveats.map((c) => <li key={c}>{c}</li>)}
              {city && <li>The City of London has {fmt(city.certificates)} certificates, far fewer than any borough, so treat its shares with care.</li>}
            </ul>
            <p className="text-sm text-secondary-600">
              Source: {statsSource.publisher}, <a href={statsSource.url} rel="noopener" className="underline underline-offset-2">{statsSource.title}</a>,
              {' '}file of {ukDate(statsSource.fileUpdated)}. Licensed under the <a href={OGL} rel="noopener" className="underline underline-offset-2">{statsSource.licence}</a>.
              {' '}{statsSource.attribution} Not endorsed by MHCLG.
            </p>
          </div>
          <p className="mt-6 text-secondary-700">
            <Link href="/areas" className="font-semibold text-primary-700 underline-offset-2 hover:underline">Every London area we cover</Link>
            {' · '}
            <Link href="/blog/epc-ratings-explained" className="font-semibold text-primary-700 underline-offset-2 hover:underline">EPC ratings explained</Link>
          </p>
        </div>
      </Section>

      <InnerEnding variant="b" source="other"
        heading="Need an EPC in London? Pick your size"
        text="One price list for every borough, no travel charge. Every row opens the quote with that size filled in." />
    </>
  )
}
