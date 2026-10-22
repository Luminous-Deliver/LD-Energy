import Link from 'next/link'
import { MessageCircle, ShieldCheck } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { boroughMeta } from '@/lib/boroughs'
import type { AreaSummary, RatingGroup } from '@/lib/borough-stats-types'
import type { AreaLocal, CouncilSection } from '@/lib/area-local'
import { pricing, site, SAME_DAY_LODGEMENT_SURCHARGE, NEXT_DAY_VISIT_SURCHARGE } from '@/lib/site'
import {
  bandEpcPrice, bandIndex, bandPhrase, fmt, london, oneIn, pct, statsSource, ukDate, whatsappQuoteHref,
} from '@/lib/area-page'

const OGL = 'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/'

const GROUPS: { key: RatingGroup; label: string; swatch: string }[] = [
  { key: 'AtoC', label: 'A to C', swatch: 'bg-[#19B459]' },
  { key: 'D', label: 'D', swatch: 'bg-[#FFD500]' },
  { key: 'E', label: 'E', swatch: 'bg-[#FCAA65]' },
  { key: 'FtoG', label: 'F or G', swatch: 'bg-[#E9153B]' },
]

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs uppercase tracking-wide font-semibold text-primary-700">{children}</p>
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return <h2 id={id} className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-secondary-900 text-balance">{children}</h2>
}

function SourceLine({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-xs leading-relaxed text-secondary-600">{children}</p>
}

const period = `${ukDate(statsSource.from)} to ${ukDate(statsSource.to)}`
const dataSource = (
  <>
    Source: MHCLG, <a href={statsSource.url} rel="noopener" className="underline underline-offset-2">Get energy performance of buildings data</a>,
    certificates for existing homes lodged {period} (file of {ukDate(statsSource.fileUpdated)}). {statsSource.attribution}
  </>
)

/* 1. Hero: coverage and price in the first line, then the two ways to ask for a quote. */
export function AreaHeroV2({ name, s }: { name: string; s: AreaSummary }) {
  const band = s.commonestBand
  const verify = site.assessor.verifyUrl
  return (
    <section className="bg-gradient-to-b from-primary-50 via-white to-white border-b border-secondary-100 -mt-24">
      <Container className="pt-32 pb-12 md:pb-16">
        <p className="text-xs uppercase tracking-wide font-semibold text-primary-700 mb-3">EPC Certificates · {name}</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-secondary-900 max-w-3xl">
          EPC Certificates in {name}
        </h1>
        <p className="mt-5 text-lg md:text-xl text-secondary-700 leading-relaxed max-w-2xl">
          The commonest home size in {name} is {bandPhrase(band.id)}, {oneIn(band.pct)} certificates. An EPC for that size
          is {bandEpcPrice(band.id)}, with no travel charge and your exact quote confirmed before booking.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Button href="#contact" data-enquiry-cta="hero" variant="accent" size="lg">Get my exact quote</Button>
          <Button href={whatsappQuoteHref(name)} variant="secondary" size="lg" target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            WhatsApp a quote request
          </Button>
        </div>
        <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-secondary-600">
          <ShieldCheck className="w-4 h-4 text-primary-600" aria-hidden="true" />
          <Link href="/about" className="font-semibold text-secondary-800 underline-offset-2 hover:underline">{site.assessor.name}</Link>
          {site.assessor.accreditations.map((a) => (
            <span key={a.number}>{a.short} {a.number}</span>
          ))}
          <a href={verify} rel="noopener" className="underline underline-offset-2 hover:text-secondary-900">Check the GOV.UK register</a>
          <span>Figures updated {ukDate(statsSource.generated)}</span>
        </p>
      </Container>
    </section>
  )
}

function MixBar({ label, s }: { label: string; s: AreaSummary }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-semibold text-secondary-900">{label}</span>
        <span className="text-secondary-600 tabular-nums">{fmt(s.ratings.n)} certificates</span>
      </div>
      <div className="mt-2 flex h-7 w-full overflow-hidden rounded-md" aria-hidden="true">
        {GROUPS.map((g) => (
          s.ratings.pct[g.key] > 0 && (
            <span key={g.key} className={`${g.swatch} flex items-center justify-center text-[11px] font-bold text-secondary-900`} style={{ width: `${s.ratings.pct[g.key]}%` }}>
              {s.ratings.pct[g.key] >= 8 ? `${Math.round(s.ratings.pct[g.key])}%` : ''}
            </span>
          )
        ))}
      </div>
    </div>
  )
}

/* 2. How homes here rate: the A–C/D/E/F–G mix against London, and by year. */
export function RatingMixSection({ name, s, standout }: { name: string; s: AreaSummary; standout: string }) {
  const years = Object.keys(s.byYear).sort()
  const lastYear = years[years.length - 1]
  return (
    <Section variant="default" id="ratings" aria-labelledby="ratings-h">
      <div className="max-w-3xl">
        <Eyebrow>Ratings in {name}</Eyebrow>
        <H2 id="ratings-h">How do homes in {name} rate?</H2>
        <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
          {pct(s.ratings.pct.AtoC)} of the {fmt(s.ratings.n)} EPCs lodged for existing homes in {name} since January 2023
          are rated A to C, against {pct(london.ratings.pct.AtoC)} across London.
        </p>
        {standout && <p className="mt-4 text-secondary-700 leading-relaxed">{standout}</p>}
      </div>
      <figure className="mt-8 max-w-3xl">
        <div className="space-y-5">
          <MixBar label={name} s={s} />
          <MixBar label="All London" s={london} />
        </div>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-secondary-700" aria-hidden="true">
          {GROUPS.map((g) => (
            <li key={g.key} className="inline-flex items-center gap-2"><span className={`inline-block h-3 w-3 rounded-sm ${g.swatch}`} />{g.label}</li>
          ))}
        </ul>
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
        <figcaption><SourceLine>{dataSource}</SourceLine></figcaption>
      </figure>
      <div className="mt-10 max-w-3xl">
        <h3 className="text-xl font-bold text-secondary-900">Share rated A to C, by year lodged</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-secondary-200 text-secondary-600">
                <th scope="col" className="py-2 pr-4 font-semibold">Year</th>
                <th scope="col" className="py-2 pr-4 font-semibold">{name}</th>
                <th scope="col" className="py-2 pr-4 font-semibold">London</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {years.map((y) => (
                <tr key={y} className="border-b border-secondary-100">
                  <th scope="row" className="py-2 pr-4 font-medium text-secondary-900">{y === lastYear ? `${y} (to ${ukDate(statsSource.to).slice(0, 5)})` : y}</th>
                  <td className="py-2 pr-4 text-secondary-800">{pct(s.byYear[y].pct.AtoC)} <span className="text-secondary-500">of {fmt(s.byYear[y].n)}</span></td>
                  <td className="py-2 pr-4 text-secondary-600">{pct(london.byYear[y].pct.AtoC)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-secondary-600 leading-relaxed">
          The assessment method changed during these years and different homes are assessed each year, so a rise is not
          proof that homes improved.
        </p>
      </div>
    </Section>
  )
}

function CouncilBlock({ section }: { section: CouncilSection }) {
  return (
    <div className="mt-10 max-w-3xl" id={section.id}>
      <h3 className="text-xl font-bold text-secondary-900">{section.heading}</h3>
      {section.paragraphs.map((p) => <p key={p.slice(0, 40)} className="mt-3 text-secondary-700 leading-relaxed">{p}</p>)}
      {section.list && (
        <>
          <p className="mt-3 text-secondary-700">{section.list.intro}</p>
          <ul className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:text-base text-secondary-700 list-disc pl-5">
            {section.list.items.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </>
      )}
      <SourceLine>
        {section.sources.map((src, i) => (
          <span key={src.url}>{i > 0 && '. '}<a href={src.url} rel="noopener" className="underline underline-offset-2">{src.label}</a>, checked {ukDate(src.checked)}</span>
        ))}.
      </SourceLine>
    </div>
  )
}

/* 3. If you let here: the rental figures, then the council's own licensing rules. */
export function LettingSection({ name, s, council }: { name: string; s: AreaSummary; council: CouncilSection[] }) {
  const prs = s.privateRented
  return (
    <Section variant="muted" id="letting" aria-labelledby="letting-h">
      <div className="max-w-3xl">
        <Eyebrow>Landlords</Eyebrow>
        <H2 id="letting-h">If you let in {name}</H2>
        <p className="mt-5 text-lg text-secondary-700 leading-relaxed">
          {fmt(prs.n)} of the certificates in {name} were for privately rented homes. {pct(prs.pctBelowC)} of those were
          rated below C, against {pct(london.privateRented.pctBelowC)} across London, and {fmt(prs.nFtoG)} were rated F or G.
        </p>
        <p className="mt-4 text-secondary-700 leading-relaxed">
          A rental needs an E or better today unless a valid exemption is registered. Government has confirmed a higher standard equivalent to C for 1 October 2030, but the legislation for it is
          still to be passed.
        </p>
        <p className="mt-4 text-secondary-700 leading-relaxed">
          Read <Link href="/blog/epc-for-landlords-2026" className="text-primary-700 underline underline-offset-2">the rules for landlords today</Link>,{' '}
          <Link href="/blog/epc-c-by-2030" className="text-primary-700 underline underline-offset-2">what the 2030 standard means</Link>, or{' '}
          <Link href="/landlords" className="text-primary-700 underline underline-offset-2">how we work with landlords</Link>.
        </p>
      </div>
      {council.map((c) => <CouncilBlock key={c.id} section={c} />)}
    </Section>
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
    <Section variant="default" id="homes" aria-labelledby="homes-h">
      <div className="max-w-3xl">
        <Eyebrow>Homes in {name}</Eyebrow>
        <H2 id="homes-h">Why homes in {name} rate as they do</H2>
        {local.map((p) => <p key={p.slice(0, 40)} className="mt-5 text-secondary-700 leading-relaxed">{p}</p>)}
        {reading && <p className="mt-5 text-secondary-700 leading-relaxed">{reading}</p>}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">What the certificates record in {name} and across London</caption>
            <thead>
              <tr className="border-b border-secondary-200 text-secondary-600">
                <th scope="col" className="py-2 pr-3 font-semibold">Recorded on the certificate</th>
                <th scope="col" className="py-2 pr-3 font-semibold whitespace-nowrap text-right">{name}</th>
                <th scope="col" className="py-2 font-semibold whitespace-nowrap text-right">London</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-secondary-100">
                  <th scope="row" className="py-2 pr-3 font-medium text-secondary-900">{r.label}</th>
                  <td className="py-2 pr-3 text-right text-secondary-800 whitespace-nowrap">{pct(r.own)}</td>
                  <td className="py-2 text-right text-secondary-600 whitespace-nowrap">{pct(r.ldn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-secondary-700 leading-relaxed">
          On {pct(s.potential.pctBelowCCouldReachC)} of the certificates rated D or lower, the potential rating (every
          recommendation carried out) is C or better.
        </p>
        <SourceLine>{dataSource}</SourceLine>
      </div>
    </Section>
  )
}

/* 5. Areas and postcodes covered, with each district's figures, and neighbours by real borders. */
export function CoverageSection({ name, slug, s, local }: { name: string; slug: string; s: AreaSummary; local?: AreaLocal }) {
  const meta = boroughMeta[slug]
  const neighbours = (local?.neighbours ?? meta.neighbours).map((n) => boroughMeta[n]).filter(Boolean)
  const crossBorder = 'localAuthorities' in s ? (s as AreaSummary & { localAuthorities: Record<string, number> }).localAuthorities : undefined
  const outside = crossBorder ? Object.entries(crossBorder).filter(([k]) => k !== 'newham') : []
  return (
    <Section variant="default" id="coverage" aria-labelledby="coverage-h">
      <div className="max-w-3xl">
        <Eyebrow>Coverage</Eyebrow>
        <H2 id="coverage-h">Areas and postcodes we cover in {name}</H2>
        <p className="mt-5 text-secondary-700 leading-relaxed">{local?.coverage ?? meta.areasCovered}</p>
        {Object.values(boroughMeta).filter((b) => b.partOf === slug).map((child) => (
          <p key={child.slug} className="mt-3 text-secondary-700 leading-relaxed">
            {child.name} has its own page, with its own figures:{' '}
            <Link href={`/areas/${child.slug}`} className="text-primary-700 underline underline-offset-2">EPCs in {child.name}</Link>.
          </p>
        ))}
        {s.districts.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">EPCs lodged for existing homes in {name} by postcode district, {period}</caption>
              <thead>
                <tr className="border-b border-secondary-200 text-secondary-600">
                  <th scope="col" className="py-2 pr-3 font-semibold">District</th>
                  <th scope="col" className="py-2 pr-3 font-semibold text-right whitespace-nowrap">EPCs</th>
                  <th scope="col" className="py-2 pr-3 font-semibold text-right whitespace-nowrap">A to C</th>
                  <th scope="col" className="py-2 font-semibold text-right whitespace-nowrap">Typical size</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {s.districts.map((d) => (
                  <tr key={d.district} className="border-b border-secondary-100">
                    <th scope="row" className="py-2 pr-3 font-medium text-secondary-900">
                      {d.district}
                      {local?.districtNames[d.district] && <span className="block text-xs font-normal text-secondary-600">{local.districtNames[d.district]}</span>}
                    </th>
                    <td className="py-2 pr-3 text-right text-secondary-800 whitespace-nowrap">{fmt(d.n)}</td>
                    <td className="py-2 pr-3 text-right text-secondary-800 whitespace-nowrap">{pct(d.pctAtoC)}</td>
                    <td className="py-2 text-right text-secondary-800 whitespace-nowrap">{d.medianArea} m²</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-sm text-secondary-600 leading-relaxed">
          {crossBorder
            ? `${name} here means the ${(s as AreaSummary & { definedBy: string[] }).definedBy.join(' and ')} postcode districts. ${outside.map(([k, n]) => `${fmt(n)} of these certificates are for homes on the ${boroughMeta[k]?.name ?? k} side of E15`).join('; ')}.`
            : `Only certificates for homes inside ${name} are counted, so a district that crosses the borough boundary shows its ${name} part.`}
          {' '}Districts with fewer than 200 certificates are not listed{s.otherDistricts.n > 0 ? ` (${fmt(s.otherDistricts.n)} certificates in ${s.otherDistricts.districts} other ${s.otherDistricts.districts === 1 ? 'district' : 'districts'})` : ''}.
        </p>
      </div>
      {neighbours.length > 0 && (
        <div className="mt-8 max-w-3xl">
          <h3 className="text-xl font-bold text-secondary-900">Next to {name}</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {neighbours.map((n) => (
              <li key={n.slug}>
                <Link href={`/areas/${n.slug}`} className="flex min-h-[44px] items-center rounded-lg border border-secondary-200 bg-white px-4 py-3 text-sm font-medium text-secondary-800 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700">
                  EPC in {n.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  )
}

/* 7. Other council rules (conservation areas and the like). */
export function CouncilRulesSection({ name, council }: { name: string; council: CouncilSection[] }) {
  if (council.length === 0) return null
  return (
    <Section variant="muted" id="council" aria-labelledby="council-h">
      <div className="max-w-3xl">
        <Eyebrow>Local rules</Eyebrow>
        <H2 id="council-h">Council rules that affect improvement work in {name}</H2>
      </div>
      {council.map((c) => <CouncilBlock key={c.id} section={c} />)}
    </Section>
  )
}

/* 8. Prices: one line and a link; the full table lives on /pricing. */
export function PriceLine({ name, s }: { name: string; s: AreaSummary }) {
  const band = pricing[bandIndex(s.commonestBand.id)]
  return (
    <Section variant="default" tier="compact" id="prices" aria-labelledby="prices-h">
      <div className="max-w-3xl">
        <h2 id="prices-h" className="text-2xl md:text-3xl font-bold tracking-tight text-secondary-900">What an EPC costs in {name}</h2>
        <p className="mt-4 text-secondary-700 leading-relaxed">
          One price list for all of London, set by floor area. For {bandPhrase(s.commonestBand.id)}: EPC {bandEpcPrice(s.commonestBand.id)},
          {' '}floor plan {band.startingPrice ? 'from ' : ''}£{band.floorPlan}, both on one visit {band.startingPrice ? 'from ' : ''}£{band.bundle}.
          {' '}Same-day lodgement is £{SAME_DAY_LODGEMENT_SURCHARGE} extra, and a next-day visit with lodgement that day £{NEXT_DAY_VISIT_SURCHARGE} extra.
        </p>
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <Button href="#contact" data-enquiry-cta="pricing" variant="accent" size="md">Get my exact quote for {name}</Button>
          <Link href="/pricing" className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800">
            All sizes and services <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </Section>
  )
}

/* 12. About these figures, collapsed. */
export function AboutFigures() {
  return (
    <Section variant="default" tier="compact" id="about-figures">
      <details className="max-w-3xl rounded-lg border border-secondary-200 bg-white px-5 py-4">
        <summary className="cursor-pointer font-semibold text-secondary-900 min-h-[44px] flex items-center">About these figures</summary>
        <div className="mt-3 space-y-3 text-sm text-secondary-700 leading-relaxed">
          <p>
            Every EPC figure on this page comes from the domestic certificates on the GOV.UK EPC register: RdSAP certificates for
            existing homes, lodged {period}, from the file of {ukDate(statsSource.fileUpdated)}. We recalculate them when the
            file is updated. &ldquo;Rated A to C&rdquo; is the share of certificates with a current rating of A, B or C.
            Typical size is the median total floor area. Private rentals are certificates whose tenure is recorded as rented
            (private).
          </p>
          <ul className="list-disc pl-5 space-y-1">
            {statsSource.caveats.map((c) => <li key={c}>{c}</li>)}
          </ul>
          <p>
            Source: {statsSource.publisher}, <a href={statsSource.url} rel="noopener" className="underline underline-offset-2">{statsSource.title}</a>.
            {' '}Licensed under the <a href={OGL} rel="noopener" className="underline underline-offset-2">{statsSource.licence}</a>.
            {' '}MHCLG does not endorse L&amp;D Energy.
          </p>
        </div>
      </details>
    </Section>
  )
}

/* Closing band: quote form link and WhatsApp; the phone stays in the footer. */
export function AreaCtaBand({ name }: { name: string }) {
  return (
    <Section variant="primary">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="min-w-0">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Get an EPC quote in {name}</h2>
          <p className="mt-3 text-lg text-primary-100">Send the property details and we confirm the price and a visit time.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row shrink-0">
          <Button href="#contact" data-enquiry-cta="bottom" variant="accent" size="lg">Get my exact quote</Button>
          <Button href={whatsappQuoteHref(name)} variant="secondary" size="lg" target="_blank" rel="noopener noreferrer"
            className="bg-transparent border-white text-white hover:bg-primary-700 hover:border-primary-700">
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            WhatsApp
          </Button>
        </div>
      </div>
    </Section>
  )
}
