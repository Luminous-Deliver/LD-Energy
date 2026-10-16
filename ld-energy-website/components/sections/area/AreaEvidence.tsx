import { Container } from '@/components/ui/Container'
import { areaStats } from '@/lib/area-stats'
import { RatingScale, type ScaleRow } from './RatingScale'

const OGL = 'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/'
const OPL = 'https://www.parliament.uk/site-information/copyright/open-parliament-licence/'

function ukDate(iso?: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

/**
 * Stratford's homes on the EPC scale, from ONS and MHCLG statistics (lib/area-stats.ts).
 * Stratford is a neighbourhood of Newham, not a council, so it is shown as the ONS
 * neighbourhood areas (MSOAs) that cover E15 and E20, with Newham, London and England beneath.
 * `localIssues` is the page's existing, approved local copy.
 */
export function AreaEvidence({ localIssues }: { localIssues: string }) {
  const { stratford, boroughs, london, england, sources } = areaStats
  const newham = boroughs.newham
  const ranked = [...stratford].sort((a, b) => (b.median ?? 0) - (a.median ?? 0) || (b.pctCPlus ?? 0) - (a.pctCPlus ?? 0))
  // The headline compares the share rated C or above, so its two ends are picked on that measure.
  const byShare = [...stratford].sort((a, b) => (b.pctCPlus ?? 0) - (a.pctCPlus ?? 0))
  const top = byShare[0]
  const bottom = byShare[byShare.length - 1]

  const rows: ScaleRow[] = [
    ...ranked.map((n) => ({ label: n.name, score: n.median, pct: n.pctCPlus })),
    { label: 'Newham', score: newham.median, pct: newham.pctCPlus, reference: true },
    { label: 'London', score: london.median, pct: london.pctCPlus, reference: true },
    { label: 'England', score: england.median, pct: england.pctCPlus, reference: true },
  ]
  const age = newham.medianByAge
  const ageRows: ScaleRow[] = [
    { label: 'Pre-1929', score: age.pre1929 },
    { label: '1930 to 1982', score: age.from1930to1982 },
    { label: '1983 to 2011', score: age.from1983to2011 },
    { label: '2012 onwards', score: age.from2012 },
  ]
  const lodged = newham.lodgements
  const dOrBelow = lodged.bands.D + lodged.bands.E + lodged.bands.F + lodged.bands.G
  const fmt = (n: number) => n.toLocaleString('en-GB')

  return (
    <section id="ratings" aria-labelledby="ratings-h" className="hv-band hv-band--white">
      <Container>
        <p className="hv-pill">Stratford&rsquo;s homes on the EPC scale</p>
        <h2 id="ratings-h" className="hv-h2 ar-h2">
          From {Math.round(top.pctCPlus ?? 0)}% rated C or above in {top.name} to {Math.round(bottom.pctCPlus ?? 0)}% in {bottom.name}
        </h2>
        <p className="hv-lede mt-4">
          Each dot is the median score of the latest EPC for homes in that neighbourhood: half score higher, half lower.
        </p>

        <RatingScale
          rows={rows}
          nameHeading="Neighbourhood"
          caption={`Latest EPC for each home, lodged ${sources.ons.coverage}. The scale shows scores 50 to 96; the full EPC scale runs from 1 (band G) to 92 and above (band A).`}
        />

        <div className="ar-split">
          <div>
            <h3 className="ar-h3">Newham&rsquo;s homes by when they were built</h3>
            <RatingScale rows={ageRows} nameHeading="Built" showPct={false}
              caption="Median score of the latest EPC for homes across the London Borough of Newham, by construction date." />
          </div>
          <div className="ar-notes">
            <h3 className="ar-h3">What this means for your home</h3>
            <p>{localIssues}</p>
            <p>
              Between {sources.mhclg.period?.replace(' to ', ' and ')}, {fmt(lodged.total)} EPCs were lodged for existing homes across
              Newham. {fmt(dOrBelow)} of them ({Math.round((dOrBelow / lodged.total) * 100)}%) were rated D or below.
            </p>
          </div>
        </div>

        <p className="ar-source">
          Sources: {sources.ons.publisher}, <a href={sources.ons.url} rel="noopener">{sources.ons.title}</a>, {sources.ons.edition} edition,
          published {ukDate(sources.ons.published)}. {sources.mhclg.publisher},{' '}
          <a href={sources.mhclg.url} rel="noopener">{sources.mhclg.title}</a>, published {ukDate(sources.mhclg.published)}.
          Neighbourhoods are ONS middle layer super output areas, named by the{' '}
          <a href={sources.msoaNames.url} rel="noopener">{sources.msoaNames.publisher}</a>. Contains public sector information licensed
          under the <a href={OGL} rel="noopener">Open Government Licence v3.0</a> and Parliamentary information licensed under
          the <a href={OPL} rel="noopener">Open Parliament Licence v3.0</a>. The ONS, MHCLG and the House of Commons Library do not
          endorse L&amp;D Energy.
        </p>
      </Container>
    </section>
  )
}
