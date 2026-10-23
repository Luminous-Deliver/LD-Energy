import Link from 'next/link'
import { ChevronDown, ShieldCheck } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Ico } from '@/components/sections/home/HomeIcon'
import { FiguresDrawer } from '@/components/inner/FiguresDrawer'
import { OnThisPage, type PageSection } from '@/components/inner/OnThisPage'
import { TERRACE_SVG } from '@/components/inner/terrace-svg'
import { boroughMeta } from '@/lib/boroughs'
import type { AreaSummary, RatingGroup } from '@/lib/borough-stats-types'
import type { AreaLocal, CouncilSection } from '@/lib/area-local'
import type { FaqItem } from '@/lib/faq'
import { pricing, priceFrom, site, SAME_DAY_LODGEMENT_SURCHARGE, NEXT_DAY_VISIT_SURCHARGE } from '@/lib/site'
import { quoteHref } from '@/lib/quote-context'
import type { AreaChoice } from '@/lib/floor-area'
import {
  bandEpcPrice, bandIndex, bandPhrase, fmt, london, oneIn, pct, rankLabel, statsSource, ukDate, whatsappQuoteHref,
} from '@/lib/area-page'
import '@/app/inner.css'

export const OGL = 'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/'

export const GROUPS: { key: RatingGroup; label: string; swatch: string; colour: string }[] = [
  { key: 'AtoC', label: 'A to C', swatch: 'bg-[#19B459]', colour: '#19B459' },
  { key: 'D', label: 'D', swatch: 'bg-[#FFD500]', colour: '#FFD500' },
  { key: 'E', label: 'E', swatch: 'bg-[#FCAA65]', colour: '#FCAA65' },
  { key: 'FtoG', label: 'F or G', swatch: 'bg-[#E9153B]', colour: '#E9153B' },
]

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="in-eyebrow">{children}</p>
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return <h2 id={id} className="in-h2" style={{ marginTop: 10 }}>{children}</h2>
}

export function SourceLine({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-xs leading-relaxed text-secondary-600 in-src">{children}</p>
}

export const period = `${ukDate(statsSource.from)} to ${ukDate(statsSource.to)}`
export const dataSource = (
  <>
    Source: MHCLG, <a href={statsSource.url} rel="noopener" className="underline underline-offset-2">Get energy performance of buildings data</a>,
    certificates for existing homes lodged {period} (file of {ukDate(statsSource.fileUpdated)}). {statsSource.attribution}
  </>
)

const linkCls = 'in-link'

/* 1. Hero D: the answer and the quote on the left, the drawn terrace with four numbered notes on the right, the
   title-block price list under the answer, and On this page beside it. Title and H1 are unchanged (frozen until 14/12). */
export function AreaHeroD({ slug, name, s, parent, sections }: {
  slug: string; name: string; s: AreaSummary; parent?: { slug: string; name: string }
  sections: PageSection[]
}) {
  const band = s.commonestBand
  const common = pricing[bandIndex(band.id)]
  const notes = [
    { k: 'Walls', v: pct(s.walls.pct.solidUninsulated), d: 'solid brick, no added insulation' },
    { k: 'Heating', v: pct(s.heating.pct.mainsGas), d: 'mains gas boiler' },
    { k: 'Built', v: pct(s.age.pct.pre1930), d: 'before 1930' },
    { k: 'Floor area', v: s.floorArea.median ? `${s.floorArea.median} m²` : '–', d: s.floorArea.houses ? `median; houses ${s.floorArea.houses} m²` : 'median' },
  ]
  const share = (id: string) => s.sizeBands.find((b) => b.id === id)?.pct
  return (
    <section className="in-hd" aria-labelledby="area-h1">
      <Container className="in-hd__grid">
        <div className="in-hd__copy">
          <nav className="in-crumbs" aria-label="Breadcrumb">
            <ol>
              <li><Link href="/">Home</Link><span className="sep" aria-hidden="true">›</span></li>
              <li><Link href="/areas">Areas</Link><span className="sep" aria-hidden="true">›</span></li>
              <li><span aria-current="page">{name}</span></li>
            </ol>
          </nav>
          <h1 id="area-h1">EPC Certificates in {name}</h1>
          <p className="in-hd__answer">
            <b className="num">{bandEpcPrice(band.id)}</b> for the commonest home in {name}, {bandPhrase(band.id)}: {oneIn(band.pct)} certificates
            here. Studios start at £{priceFrom.epc}. No travel charge from our Stratford base, ready within 72 hours, and your
            exact price is confirmed before booking.
          </p>
          {parent && (
            <p className="in-note">
              {name} is part of the London Borough of <Link href={`/areas/${parent.slug}`} className={linkCls}>{parent.name}</Link>, and it is where we are based.
            </p>
          )}
          {slug === 'newham' && (
            <p className="in-note">
              For our home neighbourhood within Newham, see the <Link href="/areas/stratford" className={linkCls}>Stratford E15 and E20 EPC page</Link>.
            </p>
          )}
          <div className="in-hd__acts">
            <a className="ld-btn ld-btn--primary" href="#contact" data-enquiry-cta="hero">Get my exact quote</a>
            <a className="in-wa" href={whatsappQuoteHref()} target="_blank" rel="noopener noreferrer"><Ico name="message" size={18} /> WhatsApp a quote request</a>
          </div>
          <p className="in-by">
            <ShieldCheck size={18} className="i" aria-hidden="true" />
            <span>
              <Link href="/about"><b>{site.assessor.name}</b></Link>, Elmhurst and Quidos accredited assessor,{' '}
              {site.assessor.accreditations.map((a) => <span key={a.number} className="num">{a.number} </span>)}·{' '}
              <a href={site.assessor.verifyUrl} rel="noopener">Check the GOV.UK register</a>. Figures updated {ukDate(statsSource.generated)}.
            </span>
          </p>
        </div>

        <figure className="in-hd__art">
          <div dangerouslySetInnerHTML={{ __html: TERRACE_SVG }} />
          <figcaption>
            <p className="in-eyebrow" style={{ marginBottom: 10 }}>What <span className="num">{fmt(s.ratings.n)}</span> {name} certificates record</p>
            <ol className="in-tnotes">
              {notes.map((n, i) => (
                <li key={n.k}><span className="in-tn__n" aria-hidden="true">{i + 1}</span><span className="in-tn__k">{n.k}</span><b className="num">{n.v}</b><span className="in-tn__v">{n.d}</span></li>
              ))}
            </ol>
          </figcaption>
        </figure>

        <aside className="in-tb" aria-label={`Domestic EPC guide prices in ${name}`}>
          <div className="in-tb__head">
            <div><span>Service</span><b>Domestic EPC</b></div>
            <div><span>Area</span><b>{name}</b></div>
            <div><span>Status</span><b>Guide price</b></div>
          </div>
          <div className="in-tb__cols" aria-hidden="true"><span>Floor area</span><span>Share</span><span>Price</span><span /></div>
          <ol className="in-tb__rows">
            {pricing.map((b) => {
              const sh = share(b.id)
              return (
                <li key={b.id}>
                  <a className={b.id === band.id ? 'is-common' : undefined} href={quoteHref({ service: 'epc', area: b.id as AreaChoice, sourcePage: 'area', ctaId: 'pricing' })}>
                    <span className="in-tb__s">{b.areaLabel}<small>{b.typicalLabel}</small>{b.id === band.id && <span className="in-tb__tag">Most common in {name}</span>}</span>
                    <span className="in-tb__sh num">{sh !== undefined ? pct(sh) : '–'}</span>
                    <span className="in-tb__p num">{b.startingPrice && <small>from</small>}£{b.epc}</span>
                    <Ico name="arrow-right" size={16} />
                  </a>
                </li>
              )
            })}
            <li>
              <a href={quoteHref({ service: 'epc', area: 'unknown', sourcePage: 'area', ctaId: 'pricing' })}>
                <span className="in-tb__s">Not sure of the size<small>We confirm it from your property details</small></span>
                <span className="in-tb__sh">–</span>
                <span className="in-tb__p in-tb__p--tbc">Confirmed before booking</span>
                <Ico name="arrow-right" size={16} />
              </a>
            </li>
          </ol>
          <div className="in-tb__foot">
            <a className="ld-btn ld-btn--primary ld-btn--block" href="#contact" data-enquiry-cta="pricing">Get my exact quote for {name}</a>
            <p className="in-tb__other">
              For {bandPhrase(band.id)}: floor plan {common.startingPrice ? 'from ' : ''}<b className="num">£{common.floorPlan}</b>, EPC and
              floor plan on one visit {common.startingPrice ? 'from ' : ''}<b className="num">£{common.bundle}</b>. Pre-Assessment from{' '}
              <b className="num">£{priceFrom.preAssessment}</b>. Same-day lodgement £{SAME_DAY_LODGEMENT_SURCHARGE} extra; a next-day
              visit with lodgement that day £{NEXT_DAY_VISIT_SURCHARGE} extra. <Link href="/pricing" className={linkCls}>All sizes and services</Link>
            </p>
          </div>
        </aside>

        <OnThisPage sections={sections} />
      </Container>
    </section>
  )
}

/** The A–C/D/E/F–G bar. `marker` draws a tick at another area's A–C share (the London marker on the data page). */
export function MixBar({ label, s, marker }: { label: string; s: AreaSummary; marker?: { label: string; atoC: number } }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-semibold text-secondary-900">{label}</span>
        <span className="text-secondary-600 tabular-nums">{fmt(s.ratings.n)} certificates</span>
      </div>
      <div className="relative mt-2">
      {marker && (
        <span className="absolute -top-1 -bottom-1 z-10 w-0.5 bg-secondary-900" style={{ left: `${marker.atoC}%` }} aria-hidden="true" />
      )}
      <div className="flex h-7 w-full overflow-hidden rounded-md" aria-hidden="true">
        {GROUPS.map((g) => (
          s.ratings.pct[g.key] > 0 && (
            <span key={g.key} className={`${g.swatch} flex items-center justify-center text-[11px] font-bold text-secondary-900`} style={{ width: `${s.ratings.pct[g.key]}%` }}>
              {s.ratings.pct[g.key] >= 8 ? `${Math.round(s.ratings.pct[g.key])}%` : ''}
            </span>
          )
        ))}
      </div>
      </div>
      {marker && (
        <p className="mt-1.5 text-xs text-secondary-600">Black line: {marker.label}, {pct(marker.atoC)} rated A to C</p>
      )}
    </div>
  )
}

function InMix({ label, s }: { label: string; s: AreaSummary }) {
  return (
    <div className="in-mix__row">
      <div className="in-mix__lbl"><b>{label}</b><span className="num">{fmt(s.ratings.n)} certificates</span></div>
      <div className="in-mix__bar" aria-hidden="true">
        {GROUPS.map((g) => s.ratings.pct[g.key] > 0 && (
          <span key={g.key} style={{ width: `${s.ratings.pct[g.key]}%`, background: g.colour }}>
            {s.ratings.pct[g.key] >= 8 ? `${Math.round(s.ratings.pct[g.key])}%` : ''}
          </span>
        ))}
      </div>
    </div>
  )
}

/** The method behind every figure, shown in the drawer (was the collapsed "About these figures" at the page end). */
function FiguresMethod() {
  return (
    <>
      <dl className="in-srcdl">
        <div><dt>Source</dt><dd>{statsSource.publisher}, <a href={statsSource.url} rel="noopener">{statsSource.title}</a></dd></div>
        <div><dt>Period</dt><dd>RdSAP certificates for existing homes lodged {period}, from the file of {ukDate(statsSource.fileUpdated)}. We recalculate them when the file is updated.</dd></div>
        <div><dt>Licence</dt><dd><a href={OGL} rel="noopener">{statsSource.licence}</a>. MHCLG does not endorse L&amp;D Energy.</dd></div>
      </dl>
      <p>
        &ldquo;Rated A to C&rdquo; is the share of certificates with a current rating of A, B or C. Typical size is the median total
        floor area. Private rentals are certificates whose tenure is recorded as rented (private).
      </p>
      <p className="in-eyebrow">Read these figures with care</p>
      <ul className="in-caveats">{statsSource.caveats.map((c) => <li key={c}>{c}</li>)}</ul>
    </>
  )
}

/* 2. How homes here rate: three numbers with their source (option C), the mix against London, and by year. */
export function RatingMixSection({ slug, name, s, standout }: { slug: string; name: string; s: AreaSummary; standout: string }) {
  const years = Object.keys(s.byYear).sort()
  const lastYear = years[years.length - 1]
  const prsRank = rankLabel(slug, (a) => a.privateRented.n)
  const chip = `MHCLG · ${fmt(s.ratings.n)} EPCs`
  return (
    <section className="in-sec" id="ratings" aria-labelledby="ratings-h">
      <Container>
        <Eyebrow>Ratings in {name}</Eyebrow>
        <H2 id="ratings-h">How do homes in {name} rate?</H2>
        <p className="in-lede">
          {pct(s.ratings.pct.AtoC)} of the {fmt(s.ratings.n)} EPCs lodged for existing homes in {name} since January 2023
          are rated A to C, against {pct(london.ratings.pct.AtoC)} across London.
        </p>
        {standout && <p className="in-prose" style={{ marginTop: 14 }}>{standout}</p>}

        <FiguresDrawer title="How we got these numbers" stats={[
          { value: pct(s.ratings.pct.AtoC), label: `of ${name} EPCs rated C or above, ${pct(london.ratings.pct.AtoC)} across London`, chip },
          { value: fmt(s.privateRented.n), label: `EPCs for privately rented homes${prsRank ? `, ${prsRank} of 33 London councils` : ''}`, chip },
          { value: s.floorArea.median ? `${s.floorArea.median} m²` : '–', label: `median floor area of a ${name} home`, chip },
        ]}>
          <FiguresMethod />
        </FiguresDrawer>

        <figure style={{ marginTop: 40 }}>
          <div className="in-mix">
            <InMix label={name} s={s} />
            <InMix label="All London" s={london} />
            <ul className="in-mix__legend" aria-hidden="true">
              {GROUPS.map((g) => <li key={g.key}><i style={{ background: g.colour }} />{g.label}</li>)}
            </ul>
          </div>
          <div className="sr-only">
            <table>
              <caption>EPC ratings of existing homes, {name} and London, certificates lodged {period}</caption>
              <thead><tr><th scope="col">Area</th>{GROUPS.map((g) => <th key={g.key} scope="col">{g.label}</th>)}<th scope="col">Certificates</th></tr></thead>
              <tbody>
                {[{ label: name, x: s }, { label: 'All London', x: london }].map(({ label, x }) => (
                  <tr key={label}><th scope="row">{label}</th>{GROUPS.map((g) => <td key={g.key}>{pct(x.ratings.pct[g.key])} ({fmt(x.ratings.counts[g.key])})</td>)}<td>{fmt(x.ratings.n)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <figcaption><p className="in-src">{dataSource}</p></figcaption>
        </figure>

        <div style={{ marginTop: 40, maxWidth: 760 }}>
          <h3 className="in-h3">Share rated A to C, by year lodged</h3>
          <div className="in-tscroll" style={{ marginTop: 14 }}>
            <table className="in-table">
              <thead><tr><th scope="col">Year</th><th scope="col" className="r">{name}</th><th scope="col" className="r">London</th></tr></thead>
              <tbody className="num">
                {years.map((y) => (
                  <tr key={y}>
                    <th scope="row">{y === lastYear ? `${y} (to ${ukDate(statsSource.to).slice(0, 5)})` : y}</th>
                    <td className="r">{pct(s.byYear[y].pct.AtoC)} <span style={{ color: 'var(--ink-quiet)' }}>of {fmt(s.byYear[y].n)}</span></td>
                    <td className="r q">{pct(london.byYear[y].pct.AtoC)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="in-note" style={{ marginTop: 12 }}>
            The assessment method changed during these years and different homes are assessed each year, so a rise is not
            proof that homes improved.
          </p>
        </div>
      </Container>
    </section>
  )
}

function CouncilBlock({ section }: { section: CouncilSection }) {
  return (
    <div className="in-council in-prose" id={section.id} style={{ marginTop: 36 }}>
      <h3 className="in-h3">{section.heading}</h3>
      {section.paragraphs.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
      {section.list && (
        <>
          <p>{section.list.intro}</p>
          <ul>{section.list.items.map((i) => <li key={i}>{i}</li>)}</ul>
        </>
      )}
      <p className="in-src">
        {section.sources.map((src, i) => (
          <span key={src.url}>{i > 0 && '. '}<a href={src.url} rel="noopener">{src.label}</a>, checked {ukDate(src.checked)}</span>
        ))}.
      </p>
    </div>
  )
}

/* 3. If you let here: the rental figures, then the council's own licensing rules. */
export function LettingSection({ name, s, council }: { name: string; s: AreaSummary; council: CouncilSection[] }) {
  const prs = s.privateRented
  return (
    <section className="in-sec in-sec--band" id="letting" aria-labelledby="letting-h">
      <Container>
        <div className="in-prose">
          <Eyebrow>Landlords</Eyebrow>
          <H2 id="letting-h">If you let in {name}</H2>
          <p className="in-lede">
            {fmt(prs.n)} of the certificates in {name} were for privately rented homes. {pct(prs.pctBelowC)} of those were
            rated below C, against {pct(london.privateRented.pctBelowC)} across London, and {fmt(prs.nFtoG)} were rated F or G.
          </p>
          <p>
            A rental needs an E or better today unless a valid exemption is registered. Government has confirmed a higher standard equivalent to C for 1 October 2030, but the legislation for it is
            still to be passed.
          </p>
          <p>
            Read <Link href="/blog/epc-for-landlords-2026">the rules for landlords today</Link>,{' '}
            <Link href="/blog/epc-c-by-2030">what the 2030 standard means</Link>, or{' '}
            <Link href="/landlords">how we work with landlords</Link>.
          </p>
        </div>
        {council.map((c) => <CouncilBlock key={c.id} section={c} />)}
      </Container>
    </section>
  )
}

/* 4. Why homes here rate as they do: age, walls and heating, then the local notes. */
export function StockSection({ name, s, local, reading }: { name: string; s: AreaSummary; local: string[]; reading: string }) {
  const rows: { label: string; own: number; ldn: number }[] = [
    { label: 'Built before 1930', own: s.age.pct.pre1930, ldn: london.age.pct.pre1930 },
    { label: 'Solid walls, no added insulation', own: s.walls.pct.solidUninsulated, ldn: london.walls.pct.solidUninsulated },
    { label: 'Cavity walls, insulated', own: s.walls.pct.cavityInsulated, ldn: london.walls.pct.cavityInsulated },
    { label: 'Mains gas boiler', own: s.heating.pct.mainsGas, ldn: london.heating.pct.mainsGas },
    { label: 'Communal heating', own: s.heating.pct.communal, ldn: london.heating.pct.communal },
    { label: 'Electric heating', own: s.heating.pct.electric, ldn: london.heating.pct.electric },
  ]
  return (
    <section className="in-sec" id="homes" aria-labelledby="homes-h">
      <Container>
        <div className="in-prose">
          <Eyebrow>Homes in {name}</Eyebrow>
          <H2 id="homes-h">Why homes in {name} rate as they do</H2>
          {local.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
          {reading && <p>{reading}</p>}
          <div className="in-tscroll">
            <table className="in-table">
              <caption className="sr-only">What the certificates record in {name} and across London</caption>
              <thead><tr><th scope="col">Recorded on the certificate</th><th scope="col" className="r">{name}</th><th scope="col" className="r">London</th></tr></thead>
              <tbody className="num">
                {rows.map((r) => (
                  <tr key={r.label}><th scope="row">{r.label}</th><td className="r">{pct(r.own)}</td><td className="r q">{pct(r.ldn)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            On {pct(s.potential.pctBelowCCouldReachC)} of the certificates rated D or lower, the potential rating (every
            recommendation carried out) is C or better.
          </p>
          <p className="in-src">{dataSource}</p>
        </div>
      </Container>
    </section>
  )
}

/* 5. Areas and postcodes covered, with each district's figures, and neighbours by real borders. */
export function CoverageSection({ name, slug, s, local }: { name: string; slug: string; s: AreaSummary; local?: AreaLocal }) {
  const meta = boroughMeta[slug]
  const neighbours = (local?.neighbours ?? meta.neighbours).map((n) => boroughMeta[n]).filter(Boolean)
  const crossBorder = 'localAuthorities' in s ? (s as AreaSummary & { localAuthorities: Record<string, number> }).localAuthorities : undefined
  const outside = crossBorder ? Object.entries(crossBorder).filter(([k]) => k !== 'newham') : []
  return (
    <section className="in-sec in-sec--band" id="coverage" aria-labelledby="coverage-h">
      <Container>
        <div className="in-prose">
          <Eyebrow>Coverage</Eyebrow>
          <H2 id="coverage-h">Areas and postcodes we cover in {name}</H2>
          <p>{local?.coverage ?? meta.areasCovered}</p>
          {Object.values(boroughMeta).filter((b) => b.partOf === slug).map((child) => (
            <p key={child.slug}>
              {child.name} has its own page, with its own figures:{' '}
              <Link href={`/areas/${child.slug}`}>EPCs in {child.name}</Link>.
            </p>
          ))}
          {s.districts.length > 0 && (
            <div className="in-tscroll">
              <table className="in-table">
                <caption className="sr-only">EPCs lodged for existing homes in {name} by postcode district, {period}</caption>
                <thead><tr><th scope="col">District</th><th scope="col" className="r">EPCs</th><th scope="col" className="r">A to C</th><th scope="col" className="r">Typical size</th></tr></thead>
                <tbody className="num">
                  {s.districts.map((d) => (
                    <tr key={d.district}>
                      <th scope="row">{d.district}{local?.districtNames[d.district] && <small>{local.districtNames[d.district]}</small>}</th>
                      <td className="r">{fmt(d.n)}</td>
                      <td className="r">{pct(d.pctAtoC)}</td>
                      <td className="r">{d.medianArea} m²</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="in-note">
            {crossBorder
              ? `${name} here means the ${(s as AreaSummary & { definedBy: string[] }).definedBy.join(' and ')} postcode districts. ${outside.map(([k, n]) => `${fmt(n)} of these certificates are for homes on the ${boroughMeta[k]?.name ?? k} side of E15`).join('; ')}.`
              : `Only certificates for homes inside ${name} are counted, so a district that crosses the borough boundary shows its ${name} part.`}
            {' '}Districts with fewer than 200 certificates are not listed{s.otherDistricts.n > 0 ? ` (${fmt(s.otherDistricts.n)} certificates in ${s.otherDistricts.districts} other ${s.otherDistricts.districts === 1 ? 'district' : 'districts'})` : ''}.
          </p>
        </div>
        {neighbours.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h3 className="in-h3">Next to {name}</h3>
            <ul className="in-chips" style={{ marginTop: 14 }}>
              {neighbours.map((n) => (
                <li key={n.slug}><Link href={`/areas/${n.slug}`} className="in-chip">EPC in {n.name}</Link></li>
              ))}
            </ul>
          </div>
        )}
      </Container>
    </section>
  )
}

/* 6. A recent job, matched to its lodged certificate. */
export function JobNote({ heading, paragraphs }: { heading: string; paragraphs: string[] }) {
  return (
    <section className="in-sec" id="recent-job" aria-labelledby="job-h">
      <Container>
        <div className="in-prose in-job">
          <h2 id="job-h" className="in-h2">{heading}</h2>
          {paragraphs.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
        </div>
      </Container>
    </section>
  )
}

/* 7. Other council rules (conservation areas and the like). */
export function CouncilRulesSection({ name, council }: { name: string; council: CouncilSection[] }) {
  if (council.length === 0) return null
  return (
    <section className="in-sec in-sec--band" id="council" aria-labelledby="council-h">
      <Container>
        <Eyebrow>Local rules</Eyebrow>
        <H2 id="council-h">Council rules that affect improvement work in {name}</H2>
        {council.map((c) => <CouncilBlock key={c.id} section={c} />)}
      </Container>
    </section>
  )
}

/* 8. Questions: native details, answers and links exactly as in the FAQPage schema. */
export function AreaFaq({ name, faqs }: { name: string; faqs: FaqItem[] }) {
  return (
    <section className="in-sec" id="faq" aria-labelledby="faq-h">
      <Container>
        <Eyebrow>Questions</Eyebrow>
        <H2 id="faq-h">EPC questions for {name}</H2>
        <div className="in-faq">
          {faqs.map((f) => (
            <details key={f.q}>
              <summary><span>{f.q}</span><ChevronDown size={20} className="i" aria-hidden="true" /></summary>
              <div className="in-faq__a">
                <p>{f.a}</p>
                {f.links && f.links.length > 0 && (
                  <p>{f.links.map((l, i) => (
                    <span key={l.href}>{i > 0 && ' · '}<a href={l.href} {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{l.label}</a></span>
                  ))}</p>
                )}
              </div>
            </details>
          ))}
        </div>
      </Container>
    </section>
  )
}
