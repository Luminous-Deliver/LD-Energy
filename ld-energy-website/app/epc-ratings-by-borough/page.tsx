import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Ico } from '@/components/sections/home/HomeIcon'
import { OurPromise } from '@/components/sections/OurPromise'
import { FiguresDrawer } from '@/components/inner/FiguresDrawer'
import { OnThisPage, type PageSection } from '@/components/inner/OnThisPage'
import { RevealOnScroll } from '@/components/inner/RevealOnScroll'
import { innerReveals } from '@/components/inner/innerReveals'
import { ReadNext, type NextStep } from '@/components/inner/ReadNext'
import { InnerEnding } from '@/components/inner/InnerEnding'
import { GROUPS, OGL, dataSource, period } from '@/components/sections/area/AreaBlocks'
import { BoroughExplorer, type ExplorerTile } from '@/components/sections/ratings/BoroughExplorer'
import { SortableTable, type SortColumn, type SortRow } from '@/components/sections/ratings/SortableTable'
import type { AreaSummary } from '@/lib/borough-stats-types'
import { bandEpcPrice, bandPhrase, boroughCount, fmt, london, pct, rankLabel, statsSource, ukDate } from '@/lib/area-page'
import { DATA_PAGE_PATH, boroughsAtoZ, rankedByAtoC, ratingsFinding, ratingsHeadline, tileLabel, tilePosition } from '@/lib/borough-ratings'
import { defaultOgImage, site } from '@/lib/site'
import '@/app/inner.css'
import './ratings.css'

/*
 * /epc-ratings-by-borough, the borough ratings data page (areas plan §6, slice C), redesigned 24/10/2026 on the
 * inner-page parts: About these figures C in the hero (three London numbers, a source chip opens the method drawer),
 * the tile map and its 33 crawlable panels, the London trend, the A to Z table (in-table) and ending B, the price list
 * (Abdul 23/10, see components/inner/InnerEnding.tsx). Every figure still comes from lib/borough-stats via
 * lib/area-page and lib/borough-ratings; tests/ratings-pages.cjs checks them against the built HTML. Metadata frozen
 * until 14/12.
 */
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

/** The borough's rating mix against the London line: the inner-page bar (in-mix), with London marked. */
function PanelMix({ s }: { s: AreaSummary }) {
  return (
    <div className="rb-mix">
      <div className="in-mix__lbl"><b>Ratings</b><span className="num">{fmt(s.ratings.n)} certificates</span></div>
      <div className="rb-mix__wrap">
        <span className="rb-mix__mark" style={{ left: `${atoC(london)}%` }} aria-hidden="true" />
        <div className="in-mix__bar" aria-hidden="true">
          {GROUPS.map((g) => s.ratings.pct[g.key] > 0 && (
            <span key={g.key} style={{ width: `${s.ratings.pct[g.key]}%`, background: g.colour }}>
              {s.ratings.pct[g.key] >= 8 ? `${Math.round(s.ratings.pct[g.key])}%` : ''}
            </span>
          ))}
        </div>
      </div>
      <p className="rb-mix__note">Black line: London, {pct(atoC(london))} rated A to C</p>
    </div>
  )
}

function Panel({ s }: { s: AreaSummary }) {
  const prs = s.privateRented
  const rank = rankLabel(s.slug, atoC)
  return (
    <article id={`borough-${s.slug}`} className="bx-panel rb-panel" data-default={s.slug === top.slug ? '' : undefined} aria-labelledby={`h-${s.slug}`}>
      <p className="in-eyebrow">{rank} of {boroughCount} for the share rated A to C</p>
      <h3 id={`h-${s.slug}`} className="in-h3">{s.name}</h3>
      <p className="rb-panel__lead">
        <b className="num">{pct(atoC(s))}</b> of {fmt(s.ratings.n)} certificates rated A to C, against {pct(atoC(london))} across London.
      </p>
      <PanelMix s={s} />
      <dl className="rb-panel__dl">
        <div><dt>Private rentals rated below C</dt><dd className="num">{pct(prs.pctBelowC)} of {fmt(prs.n)}</dd></div>
        <div><dt>Private rentals rated F or G</dt><dd className="num">{fmt(prs.nFtoG)}</dd></div>
        <div><dt>Typical floor area</dt><dd className="num">{s.floorArea.median} m²</dd></div>
        <div><dt>Commonest size and EPC guide price</dt><dd className="num">{bandPhrase(s.commonestBand.id)}, {bandEpcPrice(s.commonestBand.id)}</dd></div>
      </dl>
      {s.slug === 'city-of-london' && (
        <p className="in-note rb-panel__note">Small base: the City has far fewer certificates than any borough, so its shares move a lot from year to year.</p>
      )}
      <Link href={`/areas/${s.slug}`} className="in-link in-arrow rb-panel__go">
        EPCs in {s.name}: prices, postcodes and local rules <Ico name="arrow-right" size={16} />
      </Link>
    </article>
  )
}

/** How the figures were made: in the drawer behind the source chips and, in full, in About these figures. */
function Method() {
  return (
    <>
      <dl className="in-srcdl">
        <div><dt>Source</dt><dd>{statsSource.publisher}, <a href={statsSource.url} rel="noopener">{statsSource.title}</a></dd></div>
        <div><dt>Period</dt><dd>RdSAP certificates for existing homes lodged {period}, from the file of {ukDate(statsSource.fileUpdated)}.</dd></div>
        <div><dt>Licence</dt><dd><a href={OGL} rel="noopener">{statsSource.licence}</a>. Not endorsed by MHCLG.</dd></div>
      </dl>
      <p>
        &ldquo;Rated A to C&rdquo; is the number of certificates with a current rating of A, B or C, divided by all certificates
        with a rating, for the borough. Typical floor area is the median total floor area. Private rentals are certificates
        whose tenure is recorded as rented (private).
      </p>
    </>
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

const sections: PageSection[] = [
  { id: 'map', heading: 'map-h', label: 'Find your borough' },
  { id: 'trend', heading: 'trend-h', label: 'The London trend, by year' },
  { id: 'table', heading: 'table-h', label: `All ${boroughCount} boroughs, A to Z` },
  { id: 'about-figures', heading: 'about-h', label: 'About these figures' },
  { id: 'prices', heading: 'in-end-h', label: 'EPC prices in London' },
]

const readNext: NextStep[] = [
  { kicker: 'Ratings', title: 'EPC ratings explained', href: '/blog/epc-ratings-explained',
    text: 'What each band means, and how the score behind it is worked out.' },
  { kicker: 'Comparing homes', title: 'Why EPC ratings differ between similar homes', href: '/blog/why-is-my-epc-different',
    text: 'Floor area, outside walls, heating and evidence, side by side.' },
  { kicker: 'Letting a home', title: 'EPCs for landlords', href: '/landlords',
    text: 'Where your rental stands against the E minimum, one let or a portfolio.' },
  { kicker: 'What’s coming', title: 'The 2030 standard for rented homes', href: '/blog/epc-c-by-2030',
    text: 'What is settled for rented homes, and what still needs legislation.' },
]

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
  const chip = `MHCLG · ${fmt(london.certificates)} EPCs`

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
    <div className="in rb">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* HERO: the finding, the lead and On this page, then London in three numbers with their source */}
      <section className="in-hd" aria-labelledby="rb-h1">
        <Container>
          <nav className="in-crumbs" aria-label="Breadcrumb">
            <ol>
              <li><Link href="/">Home</Link><span className="sep" aria-hidden="true">›</span></li>
              <li><Link href="/areas">Areas</Link><span className="sep" aria-hidden="true">›</span></li>
              <li><span aria-current="page">EPC ratings by borough</span></li>
            </ol>
          </nav>
          <div className="rb-hd">
            <div className="in-hd__copy">
              <p className="in-eyebrow">EPC ratings by London borough, {firstYear}–{lastYear}</p>
              <h1 id="rb-h1">{ratingsHeadline()}</h1>
              <p className="in-hd__answer">
                {fmt(london.certificates)} EPCs were lodged for existing homes in London from {ukDate(statsSource.from)} to {ukDate(statsSource.to)}.
                {' '}{pct(atoC(london))} were rated A to C. {top.name} is highest at {pct(atoC(top))} and {bottom.name} lowest at {pct(atoC(bottom))}.
              </p>
              <p className="in-by">
                <ShieldCheck size={18} className="i" aria-hidden="true" />
                <span>
                  Figures from the GOV.UK file of {ukDate(statsSource.fileUpdated)}, compiled by{' '}
                  <Link href="/about"><b>{site.assessor.name}</b></Link>, Domestic Energy Assessor
                  ({site.assessor.accreditations.map((a) => `${a.short} ${a.number}`).join(', ')}). Updated {ukDate(statsSource.generated)}.
                </span>
              </p>
            </div>
            <div className="rb-hd__side">
              <OnThisPage sections={sections} />
            </div>
          </div>
          <FiguresDrawer title="How we got these numbers" stats={[
            { value: fmt(london.certificates), label: 'London certificates for existing homes', chip },
            { value: pct(atoC(london)), label: 'Rated A to C', chip },
            { value: pct(london.privateRented.pctBelowC), label: 'Private rentals below C', chip },
          ]}>
            <Method />
            <p className="in-eyebrow">Read these figures with care</p>
            <ul className="in-caveats">{statsSource.caveats.map((c) => <li key={c}>{c}</li>)}</ul>
          </FiguresDrawer>
        </Container>
      </section>

      {/* FIND YOUR BOROUGH */}
      <section className="in-sec in-sec--band" id="map" aria-labelledby="map-h">
        <Container>
          <div className="rb-head">
            <div>
              <p className="in-eyebrow">Every borough</p>
              <h2 className="in-h2" id="map-h">Find your borough</h2>
            </div>
            <p className="in-lede">
              Each square is a borough, placed roughly where it sits, with its share of certificates rated A to C. Darker means
              more homes rated A to C. Pick one to see its figures.
            </p>
          </div>
          <BoroughExplorer tiles={tiles} initial={top.slug} panels={boroughsAtoZ.map((b) => <Panel key={b.slug} s={b} />)} />
          <p className="in-src">{dataSource}</p>
          <p className="rb-also"><Link className="in-link in-arrow" href="/areas">Every London area we cover <Ico name="arrow-right" size={16} /></Link></p>
        </Container>
      </section>

      {/* LONDON TREND */}
      <section className="in-sec" id="trend" aria-labelledby="trend-h">
        <Container className="rb-trend">
          <div>
            <p className="in-eyebrow">London trend</p>
            <h2 className="in-h2" id="trend-h">Share rated A to C in London, by year lodged</h2>
            <p className="in-lede">
              The assessment method changed to RdSAP 10 during these years, and different homes are assessed each year, so the rise
              is not proof that London&rsquo;s homes improved by that much.
            </p>
          </div>
          <div>
            <ul className="rb-years">
              {years.map((y) => {
                const m = london.byYear[y]
                return (
                  <li key={y}>
                    <span className="rb-years__y num">{y === lastYear ? `${y}*` : y}</span>
                    <span className="rb-years__bar" aria-hidden="true"><span style={{ width: `${m.pct.AtoC}%` }} /></span>
                    <span className="rb-years__v num">{pct(m.pct.AtoC)}</span>
                    <span className="rb-years__n num">of {fmt(m.n)} certificates</span>
                  </li>
                )
              })}
            </ul>
            <p className="in-note rb-years__foot">* {lastYear} to {ukDate(statsSource.to)}.</p>
          </div>
        </Container>
      </section>

      {/* A TO Z */}
      <section className="in-sec in-sec--band" id="table" aria-labelledby="table-h">
        <Container>
          <p className="in-eyebrow">The full table</p>
          <h2 className="in-h2" id="table-h">All {boroughCount} boroughs, A to Z</h2>
          <details className="rb-table">
            <summary>
              <span>Show the table</span>
              <span className="rb-table__hint">Sort by any column. Each name opens its area page.</span>
              <Ico name="arrow-right" size={18} />
            </summary>
            <div className="rb-table__in">
              <SortableTable caption={`EPC ratings of existing homes by London borough, certificates lodged ${period}`} columns={columns} rows={rows} />
            </div>
          </details>
        </Container>
      </section>

      {/* ABOUT THESE FIGURES */}
      <section className="in-sec" id="about-figures" aria-labelledby="about-h">
        <Container className="rb-about">
          <div>
            <p className="in-eyebrow">Method and source</p>
            <h2 className="in-h2" id="about-h">About these figures</h2>
            <p className="in-lede">
              Every figure comes from the domestic certificates on the GOV.UK EPC register: RdSAP certificates for existing homes,
              lodged {period}.
            </p>
          </div>
          <div className="rb-about__body">
            <div className="in-drawer__in rb-about__method"><Method /></div>
            <p className="in-eyebrow">Read these figures with care</p>
            <ul className="in-caveats rb-about__caveats">
              {statsSource.caveats.map((c) => <li key={c}>{c}</li>)}
              {city && <li>The City of London has {fmt(city.certificates)} certificates, far fewer than any borough, so treat its shares with care.</li>}
            </ul>
            <p className="in-src">
              Source: {statsSource.publisher}, <a href={statsSource.url} rel="noopener">{statsSource.title}</a>, file
              of {ukDate(statsSource.fileUpdated)}. Licensed under the <a href={OGL} rel="noopener">{statsSource.licence}</a>.
              {' '}{statsSource.attribution} Not endorsed by MHCLG.
            </p>
          </div>
        </Container>
      </section>

      <ReadNext steps={readNext} />

      {/* section reveals (motion, Considered); the price sections are left out on purpose, see innerReveals */}
      <RevealOnScroll {...innerReveals('.rb', { blocks: ['.rb-about__caveats'], ending: 'b' })} />

      {/* Ending B, the price list (Abdul 23/10: the borough ratings page) */}
      <div id="prices">
        <InnerEnding variant="b" source="other"
          heading="Need an EPC in London? Pick your size"
          text="One price list for every borough, no travel charge. Every row opens the quote with that size filled in." />
      </div>

      {/* Our promise under the prices (Abdul 24/10) */}
      <OurPromise />
    </div>
  )
}
