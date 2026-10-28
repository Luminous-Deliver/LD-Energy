import type { AreaSummary } from './borough-stats-types'
import type { AreaLocal, CouncilSource } from './area-local'
import { boroughCount, fmt, pct, rankLabel } from './area-page'

/**
 * Batch D3b hand-written local content: Bexley, Merton, Harrow, Bromley, Kingston. Council facts come from each
 * council's own pages, read on `CHECKED`; a fact that could not be confirmed there is left out. Figures are never
 * typed here: each sentence that needs one takes it from lib/borough-stats.ts through `s` (this area) and `london`.
 * The fact-source table is projects/ld-energy-redesign-2026-10/research/areas-d3b-sources-2026-10-28.md.
 */

const CHECKED = '2026-10-28'

const src = (label: string, url: string): CouncilSource => ({ label, url, checked: CHECKED })

function spread(s: AreaSummary) {
  const ranked = [...s.districts].sort((a, b) => b.pctAtoC - a.pctAtoC)
  return { top: ranked[0], bottom: ranked[ranked.length - 1] }
}

/** The first and last year in the byYear series, for "from X in 2023 to Y in 2026" sentences. */
function trend(s: AreaSummary) {
  const years = Object.keys(s.byYear).sort()
  const first = years[0]
  const last = years[years.length - 1]
  return { first, last, from: s.byYear[first].pct.AtoC, to: s.byYear[last].pct.AtoC }
}

/** The "which districts rate highest and lowest" question every borough answers from its own table. */
function districtFaq(s: AreaSummary, name: string, extra = '') {
  const { top, bottom } = spread(s)
  if (!top || !bottom || top === bottom) return []
  return [{
    q: `Which ${name} postcodes rate lowest?`,
    a: `Of the districts with enough certificates to compare, ${bottom.district} has the lowest share rated A to C at ${pct(bottom.pctAtoC)}, from ${fmt(bottom.n)} certificates, and ${top.district} the highest at ${pct(top.pctAtoC)}.${extra} The table above has every district.`,
  }]
}

/* ---------- sources ---------- */

const bexley = {
  schemes: src('Bexley Council, property licensing schemes', 'https://www.bexley.gov.uk/services/housing/property-licensing/property-licensing-schemes'),
  guide: src('Bexley Council, guide to property licensing', 'https://www.bexley.gov.uk/services/housing/property-licensing/property-licensing-schemes/guide-to-property-licensing'),
  heritage: src('Bexley Council, conservation and heritage', 'https://www.bexley.gov.uk/services/planning-and-building-control/planning-policy-and-guidance/conservation-and-heritage'),
  article4: src('Bexley Council, Article 4 Directions', 'https://www.bexley.gov.uk/services/planning-and-building-control/planning-policy-and-guidance/article-4-directions'),
  oldForge: src('Bexley Council, Old Forge Way Article 4(2) Direction', 'https://www.bexley.gov.uk/sites/default/files/2020-05/Old-Forge-Way-Conservation-Area-Article-4-2-Direction.pdf'),
  brook: src('Bexley Council, Brook Street conservation area appraisal', 'https://www.bexley.gov.uk/sites/default/files/2020-05/Brook-Street-Conservation-Area-Appraisal-and-Management-Plan.pdf'),
  oldBexley: src('Bexley Council, Old Bexley conservation area appraisal', 'https://www.bexley.gov.uk/sites/default/files/2021-01/Old-Bexley-Conservation-Area-Appraisal-and-Management-Plan.pdf'),
  redHouse: src('Bexley Council, Red House Lane conservation area appraisal', 'https://www.bexley.gov.uk/sites/default/files/2020-05/Red-House-Lane-Conservation-Area-Appraisal-and-Management-Plan.pdf'),
}

const merton = {
  licensing: src('Merton Council, property licensing for landlords and letting agents', 'https://www.merton.gov.uk/council-tax-benefits-and-housing/private-housing/licensing'),
  fees: src('Merton Council, licence fees', 'https://www.merton.gov.uk/council-tax-benefits-and-housing/private-housing/licensing/fees'),
  selective: src('Merton Council, public notice of selective licensing designation 2023', 'https://www.merton.gov.uk/system/files/2023.06.19_selective_licensing_public_notice_final-web.pdf'),
  additional: src('Merton Council, public notice of additional licensing designation 2023', 'https://www.merton.gov.uk/system/files/2023.06.19_additional_licensing_public_notice_final-web.pdf'),
  article4: src('Merton Council, Article 4 directions removing permitted development rights', 'https://www.merton.gov.uk/planning-and-buildings/planning/permitted-development-and-prior-approval/article-4'),
  conservation: src('Merton Council, list of conservation areas', 'https://www.merton.gov.uk/planning-and-buildings/design-conservation/conservation-areas/list'),
  johnInnes: src('Merton Council, John Innes: Merton Park and Wilton Crescent design guide', 'https://www.merton.gov.uk/system/files?file=0177_john_innes_design_guide.pdf'),
}

const harrow = {
  selective: src('Harrow Council, extension of the selective licensing scheme from 2026', 'https://www.harrow.gov.uk/licences/selective-licensing/6'),
  fees: src('Harrow Council, selective licence fees', 'https://www.harrow.gov.uk/licences/selective-licensing/2'),
  need: src('Harrow Council, do you need a property licence?', 'https://www.harrow.gov.uk/housing-property/preparing-renters-rights-act'),
  hmo: src('Harrow Council, licences for houses in multiple occupation', 'https://www.harrow.gov.uk/licences/licences-houses-multiple-occupation-hmos'),
  selectivePage: src('Harrow Council, selective licence', 'https://www.harrow.gov.uk/licences/selective-licensing'),
  hmoNews: src('Harrow Council, new planning rules come into force for smaller HMOs', 'https://www.harrow.gov.uk/news/article/11514/new-planning-rules-come-into-force-for-smaller-hmos'),
  conservation: src('Harrow Council, conservation areas and Article 4', 'https://www.harrow.gov.uk/planning-developments/biodiversity-conservation'),
  hill: src('Harrow Council, Harrow on-the-Hill conservation areas', 'https://www.harrow.gov.uk/planning-developments/biodiversity-conservation/3'),
  pinner: src('Harrow Council, Pinner conservation areas', 'https://www.harrow.gov.uk/planning-developments/biodiversity-conservation/5'),
  pinnerwood: src('Harrow Council, Pinnerwood Park Estate conservation area and Article 4 guidance note', 'https://www.harrow.gov.uk/downloads/file/30320/Pinnerwood_Park_Conservation_Area.pdf'),
}

const bromley = {
  apply: src('Bromley Council, apply for an HMO licence', 'https://www.bromley.gov.uk/housing-advice-options/apply-hmo-licence'),
  landlords: src('Bromley Council, HMO advice for landlords', 'https://www.bromley.gov.uk/housing-advice-options/houses-multiple-occupation-hmo-advice-landlords'),
  article4: src('Bromley Council, Article 4 Direction areas', 'https://www.bromley.gov.uk/downloads/download/72/article-4-direction-areas'),
  chislehurst: src('Bromley Council, Chislehurst Road conservation area appraisal and management plan', 'https://www.bromley.gov.uk/downloads/file/3733/chislehurst-road-ca-appraisal-and-management-plan-june-2025-'),
}

const kingston = {
  hmo: src('Kingston Council, houses in multiple occupation', 'https://www.kingston.gov.uk/housing/landlords-and-private-sector/houses-multiple-occupation-hmo'),
  apply: src('Kingston Council, apply for, vary or renew your HMO licence', 'https://www.kingston.gov.uk/apply-hmo'),
  conservation: src('Kingston Council, conservation areas in Kingston upon Thames', 'https://www.kingston.gov.uk/planning-and-building-control/heritage-and-conservation/conservation-areas/list'),
  article4: src('Kingston Council, Article 4 Directions', 'https://www.kingston.gov.uk/planning-and-building-control/planning-policy/article-4-directions'),
  guidance: src('Kingston Council, conservation area general guidance', 'https://www.kingston.gov.uk/sites/default/files/2025-10/RBK%20Conservation%20Area%20General%20Guidance.pdf'),
}

export const d3bLocal: Record<string, AreaLocal> = {
  bexley: {
    districtNames: {
      DA8: 'Erith',
      DA16: 'Welling',
      DA7: 'Bexleyheath and Barnehurst',
      DA14: 'Sidcup',
      DA15: 'Sidcup and Blackfen',
      DA17: 'Belvedere',
      DA1: 'Crayford',
      DA5: 'Bexley and Old Bexley',
      DA6: 'Bexleyheath',
      SE2: 'Abbey Wood',
      SE28: 'Thamesmead',
      DA18: 'Erith and Lessness Heath',
      SE9: 'Falconwood and the Eltham border',
    },
    neighbours: ['greenwich', 'bromley'],
    standout: (s) => {
      const { top, bottom } = spread(s)
      return `Bexley’s districts are far apart. ${top.district} has ${pct(top.pctAtoC)} rated A to C, from ${fmt(top.n)} certificates, while ${bottom.district} has ${pct(bottom.pctAtoC)}. ${pct(s.age.pct.from1930to1966)} of the borough’s certificates are for homes built between 1930 and 1966.`
    },
    stock: [
      'Bexley is mostly suburban. Welling, Sidcup and Bexleyheath are streets of interwar and post-war semis and short terraces, with larger detached houses around Blackfen and Sidcup. Erith and Belvedere carry the older Victorian terraces and the industrial riverside, and Thamesmead is a planned estate of the 1960s and later.',
      'A 1930s semi often has a cavity wall, a hipped roof and a loft that has been topped up at least once, so dated receipts for cavity fill or loft work can change the result. A converted Victorian terrace in Erith or Northumberland Heath is different, because solid brick walls and original sash windows set the limits.',
    ],
    stockReading: (s, london) =>
      `${pct(s.walls.pct.cavityInsulated)} of Bexley’s certificates record insulated cavity walls, against ${pct(london.walls.pct.cavityInsulated)} across London, and ${pct(s.walls.pct.cavityUninsulated)} record cavity walls with no insulation, against ${pct(london.walls.pct.cavityUninsulated)}. Flats and maisonettes are ${pct(s.pctFlats)} of the total, against ${pct(london.pctFlats)}, and ${pct(s.heating.pct.mainsGas)} are heated by a mains gas boiler.`,
    coverage: 'Erith, Belvedere, Welling, Bexleyheath, Barnehurst, Crayford, Old Bexley, Sidcup, Blackfen, Abbey Wood and Thamesmead.',
    council: [
      {
        id: 'bexley-licensing',
        heading: 'Letting in Bexley: one selective ward and borough-wide HMO licensing',
        paragraphs: [
          'Bexley’s selective licensing covers Belvedere ward only. The scheme became operative on 13 January 2025 and ends on 12 January 2030, and a selective licence expires when the scheme ends, whenever it was granted. Elsewhere in the borough a rented home with fewer than five occupants needs no licence at all. A shared house with five or more people needs a mandatory HMO licence wherever it is.',
          'The council’s fee table lists a mandatory HMO licence at £350 plus £330 per letting, and £350 plus £205 per letting to renew. A selective licence is £350 plus £480. It takes £50 off for a landlord or agent who is accredited when they apply. That discount depends on accreditation, not on the EPC rating.',
          'Bexley’s guide lists an Energy Performance Certificate among the documents you can provide with an application, along with a simple plan of the property, an EICR and a gas safety certificate. It says you do not have to provide all of them for the council to process an application.',
        ],
        sources: [bexley.schemes, bexley.guide],
      },
      {
        id: 'bexley-conservation',
        heading: 'Conservation areas and Article 4 directions in Bexley',
        paragraphs: [
          'Bexley has 23 conservation areas, from Brook Street in Northumberland Heath to Woolwich Road in Upper Belvedere. The council lists four conservation area Article 4(2) directions: Brook Street, Old Bexley, Old Forge Way and Red House Lane.',
          'On Old Forge Way in Sidcup, the direction brings alterations to windows, rendering or pebble-dashing and a change of roofing materials under council control for nos. 1, 15 and 16, and gives other house numbers their own lists. So the rules can differ from one house to the next.',
          'Separately, Bexley made a borough-wide Article 4 Direction that came into force on 24 September 2017. It means a change from a dwelling (Class C3) to a small HMO (Class C4) needs planning permission anywhere in the borough.',
        ],
        sources: [bexley.heritage, bexley.article4, bexley.oldForge],
      },
      {
        id: 'bexley-estates',
        heading: 'Brook Street, Old Bexley and Red House Lane',
        paragraphs: [
          'Bexley’s conservation area appraisals describe three very different places. Brook Street, designated on 19 February 1993, is a core of four terraces of 12 uniformly spaced houses, with long terraces dating from 1882 to 1901 and garden plots all the same modest size. The appraisal calls it an early example of council housing.',
          'Old Bexley was designated on 17 February 1971 and extended on 11 November 1987. The appraisal counts 18 listed buildings in it, including a medieval and a Victorian church, and describes a village cut in two by the railway line that opened in 1866.',
          'Red House Lane in Upton was designated on 25 July 1973 and is tightly drawn around Red House, Hogs Hole Cottages and the house between them. The cottages are a row of six. All three are Article 4 areas, so check with the council before changing windows, roofing or the front of a house in any of them.',
        ],
        sources: [bexley.brook, bexley.oldBexley, bexley.redHouse, bexley.heritage],
      },
    ],
    faqs: (s) => [
      {
        q: 'Which Bexley wards need a selective licence?',
        a: 'Only Belvedere. The scheme runs from 13 January 2025 to 12 January 2030, and the council has an online checker for an address. A shared house with five or more people needs a mandatory HMO licence anywhere in the borough.',
        links: [{ label: 'Bexley property licensing schemes', href: bexley.schemes.url, external: true }],
      },
      {
        q: 'Does a good EPC lower a Bexley licence fee?',
        a: 'Not according to the council’s fee table. Its £50 discount is for landlords or agents who are accredited when they apply. The EPC is one of the documents the application guide says you can provide.',
        links: [{ label: 'Bexley guide to property licensing', href: bexley.guide.url, external: true }],
      },
      {
        q: 'Do I need planning permission to turn a Bexley house into a small HMO?',
        a: 'Yes. Bexley’s Article 4 Direction, in force since 24 September 2017, removes the permitted development right to change a dwelling (Class C3) to a small HMO (Class C4) across the whole borough. That is separate from any licence.',
        links: [{ label: 'Bexley Article 4 Directions', href: bexley.article4.url, external: true }],
      },
      {
        q: 'Which Bexley conservation areas have Article 4 directions?',
        a: 'Brook Street, Old Bexley, Old Forge Way and Red House Lane, according to the council’s Article 4 page. Bexley has 23 conservation areas in all, so most are covered by the standard conservation area rules only.',
        links: [{ label: 'Bexley conservation and heritage', href: bexley.heritage.url, external: true }],
      },
      ...districtFaq(s, 'Bexley'),
    ],
  },

  merton: {
    districtNames: {
      SW19: 'Wimbledon, South Wimbledon and Colliers Wood',
      CR4: 'Mitcham',
      SM4: 'Morden',
      SW20: 'Raynes Park and West Wimbledon',
      SW16: 'Pollards Hill',
      KT3: 'West Barnes',
      SW17: 'Colliers Wood and the Tooting border',
    },
    neighbours: ['wandsworth', 'lambeth', 'croydon', 'sutton', 'kingston'],
    standout: (s, london) =>
      `${pct(s.walls.pct.solidUninsulated)} of Merton’s certificates record solid walls with no added insulation, against ${pct(london.walls.pct.solidUninsulated)} across London. ${pct(s.privateRented.pctBelowC)} of its privately rented certificates are rated below C, and Merton ranks ${rankLabel('merton', (b) => b.ratings.pct.AtoC)} of ${boroughCount} boroughs for the share rated A to C.`,
    stock: [
      'Merton runs from the Wimbledon villas and Victorian terraces in the north to the interwar estates of Morden and St Helier in the south. Mitcham has the older cottages around the Cricket Green and a lot of Victorian and Edwardian terraces, and Colliers Wood and South Wimbledon are denser, with flats above shops and converted houses.',
      'Wimbledon and Raynes Park have many converted Victorian and Edwardian houses, where each flat is assessed on its own roof, floor and heating. In Morden and Pollards Hill a typical home is a 1930s or post-war semi, so cavity and loft evidence matters more than the wall type.',
    ],
    stockReading: (s, london) =>
      `${pct(s.age.pct.pre1930)} of Merton’s certificates are for homes built before 1930, against ${pct(london.age.pct.pre1930)} across London, and ${pct(s.walls.pct.cavityInsulated)} record insulated cavity walls, against ${pct(london.walls.pct.cavityInsulated)}. Flats and maisonettes are ${pct(s.pctFlats)} of the total, and the typical home is ${s.floorArea.median} m².`,
    coverage: 'Wimbledon, Wimbledon Park, Raynes Park, South Wimbledon, Colliers Wood, Mitcham, Morden, St Helier, Pollards Hill and Merton Park.',
    council: [
      {
        id: 'merton-licensing',
        heading: 'Letting in Merton: three licence types, set by ward',
        paragraphs: [
          'Merton’s selective licence covers a home occupied by one household in four wards: Figge’s Marsh, Graveney, Longthornton and Pollards Hill. An additional licence covers HMOs with three or four people from two or more households in seven wards: those four plus Colliers Wood, Cricket Green and Lavender Fields. Both designations started on 24 September 2023 and end on 23 September 2028, unless the council revokes them earlier.',
          'The council’s fees page, last updated on 1 April 2026, lists a selective licence at £747.60, paid as £267 at application and £480.60 once approved. An additional licence for a two-bedroom HMO is £1,566, for three bedrooms £1,620 and for four £1,674. A mandatory licence for two units is £1,949.79.',
          'Merton’s discount is £50 for an applicant who is accredited with, or a member of, one of its listed schemes. It applies to additional and selective licences only, not to mandatory ones. The council does not link any fee to an EPC rating.',
        ],
        sources: [merton.licensing, merton.fees, merton.selective, merton.additional],
      },
      {
        id: 'merton-hmo-planning',
        heading: 'Planning permission for HMOs across Merton',
        paragraphs: [
          'Merton’s Article 4 page says permitted development rights for converting a home (Class C3) into a small HMO (Class C4) have been removed across the whole borough, through two immediate directions. The first, dated 17 November 2022, covers seven wards and was confirmed on 19 April 2023, so it is permanent.',
          'The second covers the other 13 wards and is listed on the council’s page as started on 24 March 2026, with comments invited by 19 June 2026. The page does not say whether it has been confirmed, so ask the planning team before relying on it for a particular address.',
          'The same page lists areas where an office cannot become a home without planning permission, among them Wimbledon town centre and the Willow Lane and Garth Road industrial estates. A licence and planning permission are separate, so a home can have one without the other.',
        ],
        sources: [merton.article4],
      },
      {
        id: 'merton-johninnes',
        heading: 'John Innes and Merton’s conservation areas',
        paragraphs: [
          'Merton’s list of conservation areas includes Bathgate Road, Bertram Cottages, Copse Hill, Cricket Green in Mitcham, Drax Avenue, Dennis Park Crescent, Dunmore Road, Durham Road and the two John Innes areas. The two John Innes areas each list four Article 4 directions, dated 1986, 1990 and two in July 2007. Wandle Valley lists a proposed Article 4(2) direction.',
          'The council’s John Innes design guide says the areas were designated in 1968 and 1984. By 1867 John Innes had begun buying land at Lower Merton to create what the guide calls a garden suburb, planting avenues of trees and holly hedges from the start. His architects Henry Goodall Quartermain and John Sydney Brocklesby gave the houses tile hanging, half-timbering and steep pitched roofs.',
          'On windows, the guide asks for timber replacements, painted, and suggests secondary glazing fitted inside the existing windows as an alternative that leaves the outside unchanged. It is an older document, so check the current rules with the planning team before ordering work.',
        ],
        sources: [merton.conservation, merton.johnInnes],
      },
    ],
    faqs: (s) => [
      {
        q: 'Which Merton wards need a selective licence?',
        a: 'Figge’s Marsh, Graveney, Longthornton and Pollards Hill, for a home occupied by a single household. The designation runs from 24 September 2023 to 23 September 2028. Seven wards, those four plus Colliers Wood, Cricket Green and Lavender Fields, have additional licensing for HMOs with three or four people.',
        links: [{ label: 'Merton property licensing', href: merton.licensing.url, external: true }],
      },
      {
        q: 'What does a Merton selective licence cost?',
        a: 'The council’s fees page, last updated on 1 April 2026, lists £747.60 in total: £267 at application and £480.60 once it is approved. A £50 discount is available for accredited applicants. It is not tied to the EPC rating.',
        links: [{ label: 'Merton licence fees', href: merton.fees.url, external: true }],
      },
      {
        q: 'Do I need planning permission for a small HMO in Merton?',
        a: 'Yes in seven wards, where the direction became permanent on 19 April 2023. For the other 13 wards Merton lists a further direction as started on 24 March 2026, but its page does not say it has been confirmed, so ask the planning team about a particular address.',
        links: [{ label: 'Merton Article 4 directions', href: merton.article4.url, external: true }],
      },
      {
        q: 'Are the John Innes areas in Merton Park covered by Article 4?',
        a: 'Yes. The council’s conservation area list shows Article 4 directions for both John Innes: Merton Park and John Innes: Wilton Crescent, dated 1986, 1990 and July 2007. Check which one applies to your house before changing windows, porches or front gardens.',
        links: [{ label: 'Merton conservation areas', href: merton.conservation.url, external: true }],
      },
      ...districtFaq(s, 'Merton'),
    ],
  },

  harrow: {
    districtNames: {
      HA2: 'South Harrow, Rayners Lane and Roxeth',
      HA3: 'Kenton, Wealdstone and Harrow Weald',
      HA1: 'Harrow town centre and Harrow on the Hill',
      HA7: 'Stanmore',
      HA5: 'Pinner and Hatch End',
      HA8: 'Edgware and Queensbury',
    },
    neighbours: ['brent', 'barnet', 'ealing', 'hillingdon'],
    standout: (s) => {
      const t = trend(s)
      return `Harrow has ${fmt(s.privateRented.n)} privately rented certificates, the ${rankLabel('harrow', (b) => b.privateRented.n)} most of ${boroughCount} boroughs, and ${pct(s.privateRented.pctBelowC)} of them are rated below C. The share of all certificates rated A to C went from ${pct(t.from)} in ${t.first} to ${pct(t.to)} in ${t.last}.`
    },
    stock: [
      'Harrow is outer London, built out along the Metropolitan line. Rayners Lane and Pinner have the 1930s Metroland semis and bungalows, Stanmore and Hatch End have larger detached houses, and Wealdstone and Harrow town centre carry the older terraces and the newer blocks.',
      'For a 1930s semi the useful evidence is any cavity fill, loft top-up, new boiler or extension, because those are the changes that move a rating. A flat in a Harrow town centre block depends on the building, and the flat’s own heating and glazing are what can be recorded.',
    ],
    stockReading: (s, london) =>
      `${pct(s.age.pct.from1930to1966)} of Harrow’s certificates are for homes built between 1930 and 1966, against ${pct(london.age.pct.from1930to1966)} across London, and ${pct(s.walls.pct.cavityInsulated)} record insulated cavity walls, against ${pct(london.walls.pct.cavityInsulated)}. ${pct(s.heating.pct.mainsGas)} are heated by a mains gas boiler, and flats and maisonettes are ${pct(s.pctFlats)} of the total.`,
    coverage: 'Harrow, Harrow on the Hill, Wealdstone, Kenton, South Harrow, Rayners Lane, Roxeth, Pinner, Hatch End, Stanmore, Edgware and Queensbury.',
    council: [
      {
        id: 'harrow-licensing',
        heading: 'Letting in Harrow: selective licensing in six wards',
        paragraphs: [
          'Harrow has designated six wards for selective licensing from 2026, each for five years from its start date: Edgware and Roxeth from 2 May 2026, Greenhill and Marlborough from 6 July 2026, and Wealdstone North and Wealdstone South from 1 September 2026. It applies to any privately rented property in those wards unless an exemption applies, for example a licensable HMO.',
          'The selective licence fee is £786: a £686 administration fee and a £100 management and enforcement fee, the same for a new application and a renewal. The fees page lists no discount linked to the EPC rating.',
          'An HMO with five or more people needs a mandatory licence. Harrow’s HMO page says the previous additional licensing scheme, for three or four people, ended on 5 August 2026, and a new one is scheduled to start on 6 January 2027.',
        ],
        sources: [harrow.selective, harrow.fees, harrow.selectivePage, harrow.hmo],
      },
      {
        id: 'harrow-hmo-planning',
        heading: 'Planning permission for HMOs in Harrow',
        paragraphs: [
          'Harrow’s Cabinet approved a new Article 4 Direction on smaller HMOs on 11 June 2026, and it took effect on 12 June. Until then, an HMO with three to six unrelated people did not need planning permission, because the change was automatic under permitted development. The council’s news release says landlords now need planning permission for all HMOs.',
          'Harrow’s licensing page says planning consent status does not affect a licence application, so the two are decided separately. It also says you may need a planning application to change from a dwelling house (Class C3) to a small HMO (Class C4).',
        ],
        sources: [harrow.hmoNews, harrow.need],
      },
      {
        id: 'harrow-conservation',
        heading: 'Harrow on the Hill, Pinner and Pinnerwood Park',
        paragraphs: [
          'Harrow has 30 conservation areas, grouped as Harrow on-the-Hill, Pinner, Stanmore and Edgware, and Harrow Weald. On the Hill, the council’s table shows Article 4 directions in Harrow Park, Harrow on the Hill Village, South Hill Avenue, Mount Park Estate, and Roxborough Park and The Grove. Roxeth Hill, Harrow School and Sudbury Hill have none.',
          'In Pinner the table shows them in Pinner High Street, East End Farm, West Towers, Pinnerwood Park Estate and Pinner Hill Estate, but not in Waxwell Lane, Moss Lane, Rayners Lane, Eastcote Village or Pinner Road.',
          'Pinnerwood Park was designated in 1989. Since 10 June 1991 an Article 4 Direction has controlled satellite dishes across the area and more in a defined core, and a 1996 direction extended similar controls to the outer streets. In the core, the council’s guidance note says alterations and replacement of windows and doors, except on rear elevations, need planning permission, as do dormers, rooflights and front or side porches. The council says its aim is management rather than restriction.',
        ],
        sources: [harrow.conservation, harrow.hill, harrow.pinner, harrow.pinnerwood],
      },
    ],
    faqs: (s) => [
      {
        q: 'Which Harrow wards need a selective licence?',
        a: 'Edgware and Roxeth from 2 May 2026, Greenhill and Marlborough from 6 July 2026, and Wealdstone North and South from 1 September 2026. Each designation lasts five years. A property that already has an HMO licence does not need a selective one.',
        links: [{ label: 'Harrow selective licensing from 2026', href: harrow.selective.url, external: true }],
      },
      {
        q: 'What does a Harrow selective licence cost?',
        a: 'The council lists £786: a £686 administration fee and a £100 management and enforcement fee, the same for new applications and renewals. The page lists no EPC-linked discount.',
        links: [{ label: 'Harrow selective licence fees', href: harrow.fees.url, external: true }],
      },
      {
        q: 'Do I need planning permission for a small HMO in Harrow?',
        a: 'Since 12 June 2026, yes, according to the council’s news release on its new Article 4 Direction. Before that, an HMO with three to six unrelated people did not need it. The licence is decided separately.',
        links: [{ label: 'Harrow HMO planning rules', href: harrow.hmoNews.url, external: true }],
      },
      {
        q: 'Can I replace windows in a Pinnerwood Park house?',
        a: 'The council’s guidance note says that in the core area, alterations or replacement of windows and doors, other than on rear elevations, need planning permission. The outer streets have separate controls, so ask the planning team about your address.',
        links: [{ label: 'Pinnerwood Park Article 4 guidance', href: harrow.pinnerwood.url, external: true }],
      },
      ...districtFaq(s, 'Harrow'),
    ],
  },

  bromley: {
    districtNames: {
      BR3: 'Beckenham',
      BR2: 'Bromley, Shortlands and Hayes',
      BR6: 'Orpington and Farnborough',
      BR1: 'Bromley and Bickley',
      BR5: 'Petts Wood and St Mary Cray',
      SE20: 'Penge and Anerley',
      BR7: 'Chislehurst',
      BR4: 'West Wickham',
      TN16: 'Biggin Hill',
      SE9: 'Mottingham',
      SE26: 'the Sydenham border',
      SE19: 'Crystal Palace and Anerley Hill',
    },
    neighbours: ['lewisham', 'greenwich', 'bexley', 'croydon', 'southwark'],
    standout: (s) => {
      const { top, bottom } = spread(s)
      return `Bromley’s districts split widely. ${top.district} has ${pct(top.pctAtoC)} rated A to C and ${bottom.district} has ${pct(bottom.pctAtoC)}, from ${fmt(bottom.n)} certificates. The typical home is ${s.floorArea.median} m², and ${pct(s.walls.pct.cavityUninsulated)} of certificates record cavity walls with no insulation.`
    },
    stock: [
      'Bromley is the most suburban of the south-east boroughs. Beckenham, Penge and Anerley have Victorian villas and terraces, Bromley town centre has blocks of flats, and Petts Wood, Orpington and Chislehurst are mostly 1930s semis and detached houses on generous plots.',
      'A 1930s house in Petts Wood or Orpington often has had its loft insulated, a rear extension and a replacement boiler, and the paperwork for each is useful. A flat in Penge or Beckenham is simpler: the roof and walls belong to the building, and the flat’s heating and windows are the part that can be recorded.',
    ],
    stockReading: (s, london) =>
      `${pct(s.walls.pct.cavityInsulated)} of Bromley’s certificates record insulated cavity walls, against ${pct(london.walls.pct.cavityInsulated)} across London, and ${pct(s.walls.pct.cavityUninsulated)} record cavity walls with no insulation, against ${pct(london.walls.pct.cavityUninsulated)}. Flats and maisonettes are ${pct(s.pctFlats)}, against ${pct(london.pctFlats)}, and only ${pct(s.age.pct.from2012)} of homes date from 2012 or later.`,
    coverage: 'Bromley, Beckenham, Penge, Anerley, Shortlands, Hayes, West Wickham, Chislehurst, Bickley, Petts Wood, Orpington, Farnborough and Biggin Hill.',
    council: [
      {
        id: 'bromley-licensing',
        heading: 'Letting in Bromley: mandatory HMO licensing only',
        paragraphs: [
          'The council’s application page says Bromley only operates the mandatory HMO licensing scheme. Its landlord guidance says a licence is needed where five or more tenants, or four or more with a live-in landlord, form two or more households and share a kitchen, bathroom or toilet. The page does not list a selective or additional scheme.',
          'The 2026/27 fee is split into two parts. For up to five units, Part 1 is £1,589 and Part 2 is £1,059, and each extra unit adds £318 and £212. Part 1 is due with the application and Part 2 before the licence is granted. A licence lasts five years. The page lists no discount, and none is linked to an EPC.',
          'Bromley’s guidance notes include one on providing a floor plan for an application. The standards also ask for a current EICR, a gas safety record, and annual fire alarm and emergency lighting test certificates.',
        ],
        sources: [bromley.apply, bromley.landlords],
      },
      {
        id: 'bromley-article4',
        heading: 'Article 4 directions in Bromley: character areas and HMOs',
        paragraphs: [
          'Bromley’s list of Article 4 directions includes one for the Chislehurst Road Conservation Area and many for Areas of Special Residential Character, known as ASRCs. The Local Plan describes an ASRC as an area with a well-established, distinctive, coherent and readily identifiable architectural character. The ASRC directions include Bickley, Bromley Common, Park Langley, Chelsfield Park and the Marlings Park Estate, and Petts Wood has several.',
          'Separately, the council’s HMO page says Bromley has had an Article 4 Direction removing permitted development rights for HMOs since 1 September 2022. A licence and planning permission are decided apart from each other.',
        ],
        sources: [bromley.article4, bromley.landlords, bromley.chislehurst],
      },
      {
        id: 'bromley-pettswood',
        heading: 'Petts Wood and the Chislehurst Road conservation area',
        paragraphs: [
          'Bromley adopted an appraisal and management plan for the Chislehurst Road conservation area on 25 June 2025. It describes Petts Wood as a garden suburb laid out in the late 1920s and 1930s by Basil Scruby with his architect Leonard Culliford, with covenants controlling building lines, roof heights and materials.',
          'The plan says the prevailing style is neo-vernacular, with the neo-Tudor houses of dark oak beams on white walls, barge-boarded gables and leaded lights. A large part of Petts Wood is an ASRC, but some areas, Chislehurst Road among them, are also conservation areas.',
          'The plan notes that doors, windows, roofs and boundary treatments are the work most likely to be restricted in a conservation area. The council recommends getting pre-application advice at the earliest opportunity.',
        ],
        sources: [bromley.chislehurst],
      },
    ],
    faqs: (s) => [
      {
        q: 'Does my Bromley rental need a licence?',
        a: 'Only if it is a licensable HMO: five or more tenants, or four or more with a live-in landlord, in two or more households sharing facilities. Bromley says it operates only the mandatory scheme, so an ordinary let to one household needs no licence.',
        links: [{ label: 'Bromley: apply for an HMO licence', href: bromley.apply.url, external: true }],
      },
      {
        q: 'What does a Bromley HMO licence cost?',
        a: 'For 2026/27 the council lists £1,589 (Part 1) plus £1,059 (Part 2) for up to five units, with £318 and £212 for each extra unit. Part 1 is paid with the application and Part 2 before the licence is granted.',
        links: [{ label: 'Bromley HMO licence fees', href: bromley.apply.url, external: true }],
      },
      {
        q: 'Do I need planning permission for a small HMO in Bromley?',
        a: 'Bromley’s HMO page says it has had an Article 4 Direction removing permitted development rights for HMOs since 1 September 2022, so a change of use to a small HMO needs planning permission. The licence is separate.',
        links: [{ label: 'Bromley HMO advice for landlords', href: bromley.landlords.url, external: true }],
      },
      {
        q: 'Do you cover Petts Wood and Chislehurst?',
        a: 'Yes. Bromley is covered at the same prices as the rest of London. Part of Petts Wood is a conservation area and a large part of it an ASRC, which affects outside work and not the assessment itself.',
        links: [{ label: 'Chislehurst Road conservation area plan', href: bromley.chislehurst.url, external: true }],
      },
      ...districtFaq(s, 'Bromley'),
    ],
  },

  kingston: {
    districtNames: {
      KT6: 'Surbiton',
      KT2: 'Kingston Hill, Norbiton and Coombe',
      KT3: 'New Malden and Motspur Park',
      KT1: 'Kingston town centre and Hampton Wick',
      KT5: 'Surbiton and Tolworth',
      KT9: 'Chessington',
      KT4: 'Worcester Park',
      SW15: 'Kingston Vale',
    },
    neighbours: ['merton', 'sutton', 'richmond'],
    standout: (s, london) =>
      `Flats and maisonettes are ${pct(s.pctFlats)} of Kingston’s certificates, against ${pct(london.pctFlats)} across London, and the typical home is ${s.floorArea.median} m². Only ${pct(s.age.pct.from2012)} of its certificates are for homes built from 2012, against ${pct(london.age.pct.from2012)}.`,
    stock: [
      'Kingston is a river town with a ring of villa suburbs. Surbiton has big Victorian houses, Kingston Hill and Coombe have large detached houses, and New Malden, Tolworth and Chessington are mostly 1930s semis. Kingston town centre has a growing number of flats close to the Thames.',
      'Many Surbiton houses are split into flats, so each flat is assessed on its own floor, roof and heating system. In a 1930s semi the evidence worth gathering is the loft, any cavity fill and the boiler. For riverside flats the useful detail is the heating type and any communal system.',
    ],
    stockReading: (s, london) =>
      `${pct(s.age.pct.pre1930)} of Kingston’s certificates are for homes built before 1930, against ${pct(london.age.pct.pre1930)} across London, and ${pct(s.age.pct.from1930to1966)} for 1930 to 1966. ${pct(s.walls.pct.solidUninsulated)} record solid walls with no added insulation, and ${pct(s.heating.pct.communal)} record communal heating.`,
    coverage: 'Kingston upon Thames, Surbiton, Norbiton, Kingston Hill, Coombe, New Malden, Motspur Park, Tolworth, Worcester Park and Chessington.',
    council: [
      {
        id: 'kingston-licensing',
        heading: 'Letting in Kingston: licences for larger HMOs',
        paragraphs: [
          'Kingston’s HMO pages say a property is an HMO if at least three people from two or more households live there and share a toilet, bathroom or kitchen. You only need a licence if five or more people from two or more households live there. They do not describe a selective or additional scheme.',
          'The application fee is based on the number of lettings: £319.40 per letting for a new licence and £250 per letting to renew. A £100 discount applies to new applications from members of an approved accreditation scheme such as UKLAP, and registered charities get 50 per cent off. The page lists no EPC-linked fee. Licences can run up to five years.',
          'The council asks for a current floor plan and accurate measurements for all rooms, along with a gas safety certificate, proof of electrical safety, smoke alarms and a fire risk assessment. An EPC is not on that list. The council recommends applying to renew at least 60 days before the licence expires. A renewal that arrives after expiry pays the full new fee and may add a £300 penalty.',
        ],
        sources: [kingston.hmo, kingston.apply],
      },
      {
        id: 'kingston-conservation',
        heading: 'Conservation areas in Kingston',
        paragraphs: [
          'Kingston has 26 conservation areas, covering about 9.4% of the borough and containing around 10,000 postal addresses. They include Kingston Old Town, Old Malden, Surbiton Hill Park, The Groves, Coombe Hill, Fairfield/Knight’s Park and Riverside South.',
          'The council’s Article 4 page lists three directions: Seething Wells Filter Beds, commercial, business and service use to residential use, and North Lodge and South Lodge. Ask the planning team what applies to a particular address.',
        ],
        sources: [kingston.conservation, kingston.article4],
      },
      {
        id: 'kingston-retrofit',
        heading: 'Retrofit advice for Kingston’s older homes',
        paragraphs: [
          'Kingston’s conservation area general guidance has a section on retrofitting historic buildings. It says the council has built an online retrofit toolkit with advice for people living in conservation areas and in traditional pre-1919 buildings.',
          'On windows, the guidance says original frames should be repaired where possible and that draught-proofing can improve their thermal performance. It describes secondary glazing as an internal window system that sits behind the original and reduces air leakage and heat loss. For replacement windows it says planning permission may be needed.',
          'The guidance also recommends a whole-house approach that looks at fabric, services and occupants together, and suggests a Retrofit Coordinator experienced in traditional buildings.',
        ],
        sources: [kingston.guidance],
      },
    ],
    faqs: (s) => [
      {
        q: 'Does my Kingston rental need a licence?',
        a: 'Only a larger HMO does. Kingston says you need a licence if five or more people from two or more households live there and share facilities. Its pages do not list a selective scheme for ordinary lets.',
        links: [{ label: 'Kingston: houses in multiple occupation', href: kingston.hmo.url, external: true }],
      },
      {
        q: 'What does a Kingston HMO licence cost?',
        a: 'The council lists £319.40 per letting for a new licence and £250 per letting to renew. There is a £100 discount on new applications for accredited landlords, and 50 per cent off for registered charities.',
        links: [{ label: 'Kingston HMO licence fees', href: kingston.apply.url, external: true }],
      },
      {
        q: 'What does a Kingston HMO application need?',
        a: 'Among other things, a current floor plan, accurate measurements for all rooms, a gas safety certificate, proof the electrics and furniture are safe, a fire risk assessment and a signed form. The list does not include an EPC.',
        links: [{ label: 'Kingston: what to include', href: kingston.apply.url, external: true }, { label: 'Our floor plans', href: '/services/floor-plans' }],
      },
      {
        q: 'How many conservation areas does Kingston have?',
        a: 'The council’s list shows 26, covering about 9.4% of the borough. They include Kingston Old Town, Surbiton Hill Park, The Groves and Coombe Hill. If your home is in one, ask before changing windows or the front of the house.',
        links: [{ label: 'Kingston conservation areas', href: kingston.conservation.url, external: true }],
      },
      ...districtFaq(s, 'Kingston'),
    ],
  },
}
