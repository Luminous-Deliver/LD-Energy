import { quoteHref } from '@/lib/quote-context'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { AreasMap, type MapBorough } from '@/components/sections/AreasMap'
import type { FinderRegion } from '@/components/sections/BoroughFinder'
import { Ico } from '@/components/sections/home/HomeIcon'
import { InnerEnding } from '@/components/inner/InnerEnding'
import { boroughList, boroughMeta } from '@/lib/boroughs'
import { boroughStats } from '@/lib/borough-stats'
import { fmt, pct, statsSource, ukDate } from '@/lib/area-page'
import { DATA_PAGE_PATH, extremes, londonBoroughs, placesFor, ratingsFinding } from '@/lib/borough-ratings'
import { regions } from '@/lib/london-regions'
import { site, priceFrom, defaultOgImage, SAME_DAY_LODGEMENT_SURCHARGE } from '@/lib/site'
import '../inner.css'
import './areas.css'

export const metadata: Metadata = {
  title: 'Areas We Cover | EPC Assessor Across London',
  description:
    `Domestic EPC certificates across all 32 London boroughs. Elmhurst and Quidos accredited, guide prices from £${priceFrom.epc}, lodged within 72 hours. Find your borough.`,
  alternates: { canonical: `${site.url}/areas` },
  openGraph: {
    images: [defaultOgImage],
    title: 'EPC London, All Areas Covered | L&D Energy',
    description:
      `Domestic EPC certificates across all London boroughs and surrounding areas. Elmhurst and Quidos accredited, guide prices from £${priceFrom.epc}, lodged within 72 hours.`,
    url: `${site.url}/areas`,
  },
  twitter: {
    images: [defaultOgImage.url],
    title: 'EPC London, All Areas Covered',
    description:
      `Domestic EPC certificates across all London boroughs. Elmhurst and Quidos accredited, guide prices from £${priceFrom.epc}.`,
  },
}

/** Neighbourhood pages listed under their borough's row rather than as rows of their own. */
const children = boroughList.filter((b) => b.kind === 'neighbourhood' && b.partOf)

const finderRegions: FinderRegion[] = regions.map((r) => ({
  id: r.id,
  name: r.name,
  rows: r.boroughs
    .map((slug) => {
      const s = boroughStats.boroughs[slug]
      const child = children.find((c) => c.partOf === slug)
      return {
        slug,
        name: boroughMeta[slug].name,
        places: placesFor(slug),
        districts: s.districts.map((d) => d.district).sort((a, b) => a.localeCompare(b, 'en', { numeric: true })),
        atoC: pct(s.ratings.pct.AtoC),
        child: child && { slug: child.slug, name: child.name, districts: boroughStats.stratford.definedBy },
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name)),
}))

/** The same rows, flat, with their region, for the map's side card and search. */
const mapBoroughs: MapBorough[] = finderRegions.flatMap((r) =>
  r.rows.map((row) => ({ slug: row.slug, name: row.name, region: r.id, regionName: r.name, places: row.places, districts: row.districts, atoC: row.atoC })),
)

export default function AreasPage() {
  const { top, bottom } = ratingsFinding()
  const size = extremes((b) => b.floorArea.median ?? 0, londonBoroughs)
  const lets = extremes((b) => b.pctLettings, londonBoroughs)

  const checklist = [
    <>One price list for every borough, set by floor area: EPCs from £{priceFrom.epc}. <Link href="/pricing" className="in-link">See all prices</Link>.</>,
    <>No travel or call-out charge, wherever you are in London.</>,
    <>Lodged on the GOV.UK register within 72 hours of the visit, or the same day for £{SAME_DAY_LODGEMENT_SURCHARGE} extra.</>,
    // not "every visit": a trusted colleague covers if Abdul is ill (Abdul 23/10/2026)
    <>Visits by {site.assessor.name}, accredited with {site.assessor.accreditations.map((a) => a.short).join(' and ')}.</>,
  ]

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
        { '@type': 'ListItem', position: 2, name: 'Areas', item: `${site.url}/areas` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'London areas covered by L&D Energy',
      numberOfItems: boroughList.length,
      itemListElement: finderRegions
        .flatMap((r) => r.rows.flatMap((row) => [row.slug, ...(row.child ? [row.child.slug] : [])]))
        .map((slug, i) => ({ '@type': 'ListItem', position: i + 1, name: `EPC in ${boroughMeta[slug].name}`, url: `${site.url}/areas/${slug}` })),
    },
  ]

  return (
    <div className="in">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Hero E from the /areas map prototype (Abdul approved 23/10/2026): copy and facts left, the London illustration right. */}
      <section className="in-hh" aria-labelledby="areas-h1">
        <Container className="in-hh__grid in-ah__grid">
          <div className="in-hh__copy">
            <nav className="in-crumbs" aria-label="Breadcrumb">
              <ol>
                <li><Link href="/">Home</Link><span className="sep" aria-hidden="true">›</span></li>
                <li><span aria-current="page">Areas</span></li>
              </ol>
            </nav>
            <h1 id="areas-h1">EPC Certificates Across London</h1>
            <p className="in-hd__answer">
              All 32 London boroughs and the City of London, one set of prices and no travel charge. We are based in Stratford
              E15, and your exact quote is confirmed before booking.
            </p>
            <div className="in-hd__acts">
              <a className="ld-btn ld-btn--primary" href={quoteHref({ service: 'epc', sourcePage: 'areas', ctaId: 'hero' })} data-enquiry-cta="hero">Get my exact quote</a>
              <a className="in-wa" href="#find">Find your borough</a>
            </div>
            <ul className="in-hh__facts">
              <li><b className="num">33</b><span>London councils, one price list</span></li>
              <li><b className="num">£{priceFrom.epc}</b><span>EPCs from, set by floor area</span></li>
              <li><b className="num">72 h</b><span>to the GOV.UK register</span></li>
            </ul>
          </div>
          <figure className="in-ah__art">
            {/* eslint-disable-next-line @next/next/no-img-element -- single WebP; next/image is unoptimised on Pages */}
            <img
              src="/areas/hero-london.webp"
              width={900}
              height={506}
              fetchPriority="high"
              alt="Illustration of an East London district from above, with streets, parks and the river"
            />
            <figcaption>An AI-generated illustration.</figcaption>
          </figure>
        </Container>
      </section>

      <section className="in-sec" id="find" aria-labelledby="find-h" style={{ paddingTop: 48 }}>
        <Container>
          <div className="in-prose">
            <p className="in-eyebrow">Find your area</p>
            <h2 id="find-h" className="in-h2">Every London borough, on one map</h2>
            <p className="in-note">Each borough has its own page with local ratings, postcode figures and council rules. Shaded by London region.</p>
          </div>
          <AreasMap boroughs={mapBoroughs} regions={regions.map((r) => ({ id: r.id, name: r.name }))} initial="newham" />
        </Container>
      </section>

      <section className="in-sec in-alist" id="all-areas" aria-labelledby="list-h">
        <Container>
          <p className="in-eyebrow">Every area, as a list</p>
          <h2 id="list-h" className="in-h2">All boroughs by region</h2>
          {finderRegions.map((region) => (
            <section key={region.id} id={`region-${region.id}`} aria-labelledby={`region-${region.id}-h`}>
              <h3 id={`region-${region.id}-h`} className="in-alist__h">{region.name}</h3>
              <ul className="in-alist__ul">
                {region.rows.map((row) => (
                  <li key={row.slug}>
                    <Link href={`/areas/${row.slug}`} className="in-alist__a">
                      <span>EPC in {row.name}</span><small className="num">{row.atoC} A to C</small>
                    </Link>
                    {row.places.length > 0 && <p className="in-alist__places">{row.places.join(', ')}</p>}
                    <p className="in-alist__pcs">{row.districts.join(' · ')}</p>
                    {row.child && (
                      <p className="in-alist__child">
                        <Link href={`/areas/${row.child.slug}`} className="in-link">EPC in {row.child.name}</Link> ({row.child.districts.join(', ')}), where we are based
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <p className="in-src" style={{ marginTop: 32 }}>
            Regions follow the London Plan sub-regions; town centres are the Plan&rsquo;s major centres. Postcode districts with at
            least {boroughStats.thresholds.districtMin} certificates are listed. &ldquo;Rated A to C&rdquo; is the share of EPCs for existing
            homes lodged {ukDate(statsSource.from)} to {ukDate(statsSource.to)}, from the GOV.UK register.
          </p>
        </Container>
      </section>

      <section className="in-sec in-sec--band" id="same-price" aria-labelledby="same-h">
        <Container>
          <div className="in-prose">
            <h2 id="same-h" className="in-h2">The same everywhere</h2>
            <ul className="in-ticks">
              {checklist.map((item, i) => (
                <li key={i}><Ico name="check" size={20} /><span>{item}</span></li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="in-sec" id="differences" aria-labelledby="diff-h">
        <Container>
          <div className="in-prose">
            <h2 id="diff-h" className="in-h2">What differs between boroughs</h2>
            <dl className="in-diffs">
              <div><dt>Ratings</dt><dd>{pct(top.ratings.pct.AtoC)} of EPCs in {top.name} are rated A to C, against {pct(bottom.ratings.pct.AtoC)} in {bottom.name}.</dd></div>
              <div><dt>Home sizes</dt><dd>The typical home on a certificate is {size.high.floorArea.median} m² in {size.high.name} and {size.low.floorArea.median} m² in {size.low.name}, and size sets the price.</dd></div>
              <div><dt>Renting</dt><dd>Private lettings are {pct(lets.high.pctLettings)} of certificates in {lets.high.name} and {pct(lets.low.pctLettings)} in {lets.low.name}.</dd></div>
            </dl>
            <p>
              <Link href={DATA_PAGE_PATH} className="in-link in-arrow">EPC ratings in every London borough <Ico name="arrow-right" size={18} /></Link>
            </p>
            <p className="in-note">From {fmt(boroughStats.london.certificates)} certificates on the GOV.UK register (file of {ukDate(statsSource.fileUpdated)}).</p>
          </div>
        </Container>
      </section>

      <section className="in-sec in-sec--band" id="coverage-info" aria-labelledby="outside-h">
        <Container>
          <div className="in-prose">
            <h2 id="outside-h" className="in-h2">Outside London</h2>
            <p className="in-lede">
              We&apos;re based in Stratford (E15), in the London Borough of Newham, and cover all 32 London boroughs plus the City of London. We also serve surrounding areas within a 1.5-hour radius, including parts of Essex, Kent, Hertfordshire and Surrey.
            </p>
            <p>There are no travel or call-out charges.</p>
            <p className="in-by">
              <ShieldCheck size={18} className="i" aria-hidden="true" />
              <span>By <Link href="/about"><b>{site.assessor.name}</b></Link>, Domestic Energy Assessor ({site.assessor.accreditations.map((a) => `${a.short} ${a.number}`).join(', ')}). Figures updated {ukDate(statsSource.generated)}.</span>
            </p>
          </div>
        </Container>
      </section>

      <InnerEnding variant="a" source="areas"
        heading="Can't find your area?"
        text="Send your postcode and we'll confirm coverage, with your exact price and a visit time before you book." />
    </div>
  )
}
