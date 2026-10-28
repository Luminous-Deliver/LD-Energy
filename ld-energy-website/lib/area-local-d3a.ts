import type { AreaSummary } from './borough-stats-types'
import type { AreaLocal, CouncilSource } from './area-local'
import { boroughCount, fmt, pct, rankLabel } from './area-page'

/**
 * Batch D3a hand-written local content: Kensington & Chelsea, City of London, Enfield, Redbridge,
 * Hammersmith & Fulham, Hillingdon. Council facts come from each council's own pages, read on `CHECKED`;
 * a fact that could not be confirmed there is left out. Figures are never typed here: each sentence that
 * needs one takes it from lib/borough-stats.ts through `s` (this area) and `london`.
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

const kc = {
  hmo: src('Royal Borough of Kensington and Chelsea, houses in multiple occupation', 'https://www.rbkc.gov.uk/housing/information-homeowners-private-rented-tenants-and-landlords/houses-multiple-occupation-hmo'),
  fees: src('Royal Borough of Kensington and Chelsea, HMO licence fees', 'https://www.rbkc.gov.uk/housing/information-homeowners-private-rented-tenants-and-landlords/houses-multiple-occupation-hmo/licence-fees'),
  conservation: src('Royal Borough of Kensington and Chelsea, conservation areas', 'https://www.rbkc.gov.uk/planning-and-building-control/heritage-and-conservation/conservation-areas'),
  article4: src('Royal Borough of Kensington and Chelsea, article 4 directions', 'https://www.rbkc.gov.uk/planning-and-building-control/heritage-and-conservation/article-4-directions'),
  maps: src('Royal Borough of Kensington and Chelsea, conservation area maps', 'https://www.rbkc.gov.uk/planning-and-building-control/heritage-and-conservation/conservation-areas/conservation-area-maps'),
}

const col = {
  prs: src('City of London Corporation, private rented accommodation', 'https://www.cityoflondon.gov.uk/services/environmental-health/housing-standards/private-rented-accommodation'),
  hmo: src('City of London Corporation, houses in multiple occupation', 'https://www.cityoflondon.gov.uk/services/licensing/other-licence-and-business-permit-types/houses-in-multiple-occupation-hmo'),
  conservation: src('City of London Corporation, conservation areas', 'https://www.cityoflondon.gov.uk/services/planning/historic-environment/conservation-areas'),
  barbican: src('City of London Corporation, Barbican Estate listed building management guidelines', 'https://www.cityoflondon.gov.uk/services/planning/historic-environment/listed-buildings/barbican-estate-listed-building-management-guidelines'),
  spd: src('City of London Corporation, Barbican and Golden Lane conservation area SPD', 'https://www.cityoflondon.gov.uk/assets/Services-Environment/barbican-golden-lane-ca-spd.pdf'),
}

const enfield = {
  selective: src('Enfield Council, selective licensing scheme', 'https://www.enfield.gov.uk/services/housing/selective-licensing-scheme'),
  hmo: src('Enfield Council, houses in multiple occupation', 'https://www.enfield.gov.uk/services/housing/houses-in-multiple-occupation'),
  conservation: src('Enfield Council, conservation areas', 'https://www.enfield.gov.uk/services/planning/heritage/conservation-areas'),
  article4: src('Enfield Council, Article 4 Directions in conservation areas', 'https://www.enfield.gov.uk/services/planning/heritage/conservation-areas/article-4-directions-in-conservation-areas'),
}

const redbridge = {
  selective: src('Redbridge Council, selective licensing', 'https://www.redbridge.gov.uk/housing/landlords/selective-licensing/'),
  hmo: src('Redbridge Council, HMO licensing', 'https://www.redbridge.gov.uk/housing/landlords/houses-in-multiple-occupation-licensing/'),
  protected: src('Redbridge Council, protected buildings and conservation areas', 'https://www.redbridge.gov.uk/planning-and-building/planning/protected-buildings-and-conservation-areas/'),
  bungalow: src('Redbridge Council, Bungalow Estate conservation area character appraisal', 'https://www.redbridge.gov.uk/media/414pjbvh/the-bungalow-estate-caca-for-web.pdf'),
}

const hf = {
  licensing: src('Hammersmith & Fulham Council, property licensing', 'https://www.lbhf.gov.uk/housing/private-housing/property-licensing-landlords-and-letting-agents'),
  faq: src('Hammersmith & Fulham Council, HMO, mandatory, additional and selective licensing FAQs', 'https://www.lbhf.gov.uk/housing/private-housing/property-licensing-landlords-and-letting-agents/hmo-mandatory-additional-and-selective-licensing-faqs'),
  schemes: src('Hammersmith & Fulham Council, new discretionary licensing schemes approved', 'https://www.lbhf.gov.uk/housing/private-housing/property-licensing-landlords-and-letting-agents/new-discretionary-licensing-schemes-approved'),
  conservation: src('Hammersmith & Fulham Council, conservation areas', 'https://www.lbhf.gov.uk/planning/urban-design-and-conservation/conservation-areas'),
  article4: src('Hammersmith & Fulham Council, properties affected by Article 4 Directions', 'https://www.lbhf.gov.uk/planning/urban-design-and-conservation/properties-affected-article-4-directions'),
  cleverly: src('Hammersmith & Fulham Council, Cleverly Estate conservation area profile', 'https://www.lbhf.gov.uk/sites/default/files/section_attachments/cleverly_estate_conservation_area_profile.pdf'),
  dorcas: src('Hammersmith & Fulham Council, Dorcas Estate conservation area profile addendum', 'https://www.lbhf.gov.uk/sites/default/files/section_attachments/dorcas_addendum_tcm21-19976.pdf'),
  gunter: src('Hammersmith & Fulham Council, Gunter Estate conservation area', 'https://www.lbhf.gov.uk/planning/urban-design-and-conservation/conservation-areas/gunter-estate'),
}

const hillingdon = {
  scheme: src('Hillingdon Council, additional HMO licence scheme', 'https://pre.hillingdon.gov.uk/hmo/apply-hmo-licence/2'),
  who: src('Hillingdon Council, apply for additional licensing of HMOs', 'https://pre.hillingdon.gov.uk/hmo/apply-hmo-licence/5'),
  fees: src('Hillingdon Council, HMO licence fees', 'https://pre.hillingdon.gov.uk/hmo/apply-hmo-licence/3'),
  news: src('Hillingdon Council, council introduces new HMO licensing scheme', 'https://pre.hillingdon.gov.uk/news/article/259/council-introduces-new-hmo-licensing-scheme'),
  docs: src('Hillingdon Council, apply for an HMO licence form instructions', 'https://www.hillingdon.gov.uk/article/1743/Apply-for-a-HMO-licence'),
  conservation: src('Hillingdon Council, conservation areas', 'https://www.hillingdon.gov.uk/conservation-areas'),
  conservationList: src('Hillingdon Council, conservation areas in Hillingdon', 'https://pre.hillingdon.gov.uk/conservation-heritage-assets/conservation-areas/4'),
  aslc: src('Hillingdon Council, areas of special local character', 'https://www.hillingdon.gov.uk/article/5982/Areas-of-special-local-character'),
}

export const d3aLocal: Record<string, AreaLocal> = {
  'kensington-chelsea': {
    districtNames: {
      W11: 'Notting Hill and Holland Park',
      W10: 'North Kensington and Ladbroke Grove',
      SW3: 'Chelsea',
      SW10: 'West Brompton and World’s End',
      SW5: 'Earl’s Court',
      W8: 'Kensington and Holland Park',
      SW7: 'South Kensington',
      W14: 'Olympia and Holland Road',
      SW1X: 'Knightsbridge',
      W2: 'Bayswater edge',
    },
    neighbours: ['hammersmith-fulham', 'westminster', 'brent'],
    standout: (s, london) => {
      const { top, bottom } = spread(s)
      return `Flats and maisonettes are ${pct(s.pctFlats)} of Kensington & Chelsea’s certificates, against ${pct(london.pctFlats)} across London, and ${pct(s.heating.pct.communal)} record communal heating. The share rated A to C runs from ${pct(bottom.pctAtoC)} in ${bottom.district} to ${pct(top.pctAtoC)} in ${top.district}.`
    },
    stock: [
      'Most of the borough is stucco terraces and garden squares in Kensington, Notting Hill and Chelsea, built as single houses and now mostly divided into flats, often one per floor. Red-brick mansion blocks fill Earl’s Court and South Kensington, and Victorian streets of smaller terraces run through North Kensington and Ladbroke Grove. Post-war towers and estates sit in between.',
      'A flat in a converted townhouse is assessed on its own: which floor it is on, what sits above it, and how it is heated. Mansion flats often share a boiler or a roof. A first-floor flat in a stucco house with original sash windows cannot be treated like a ground-floor flat in a 1930s block, and the assessor records each as it stands.',
    ],
    stockReading: (s, london) =>
      `${pct(s.age.pct.pre1930)} of certificates are for homes built before 1930, against ${pct(london.age.pct.pre1930)} across London, and ${pct(s.walls.pct.solidUninsulated)} record solid walls with no added insulation, against ${pct(london.walls.pct.solidUninsulated)}. Homes from 2012 onwards are only ${pct(s.age.pct.from2012)}. A typical house is ${s.floorArea.houses} m² and a typical flat ${s.floorArea.flats} m².`,
    coverage: 'Kensington, Notting Hill, Holland Park, Chelsea, World’s End, West Brompton, Earl’s Court, South Kensington, Knightsbridge, North Kensington and Ladbroke Grove.',
    council: [
      {
        id: 'kensington-chelsea-licensing',
        heading: 'Letting in Kensington and Chelsea: mandatory and additional HMO licensing',
        paragraphs: [
          'The council requires a licence for every privately rented property occupied by three or more people living as two or more households who share facilities. Mandatory licensing covers five or more occupiers. The additional scheme, in force from 1 June 2023, covers all other HMOs with three or more occupiers, including purpose-built flats in blocks of more than two flats.',
          'The council’s page says a building converted into flats below the 1991 Building Regulations standard is an HMO in law, but in this borough that type does not need a licence. Its HMO pages describe mandatory and additional licensing only.',
          'Both schemes charge the same, in two parts: £1,004 with the online application and £489 once the licence is approved, for up to five units of accommodation, plus £72 for each extra room. A £200 reduction applies to accredited landlords, and £30 off each application where one landlord and agent submit more than three. No discount is given to a landlord whose unlicensed HMO came to the council’s attention first.',
        ],
        sources: [kc.hmo, kc.fees],
      },
      {
        id: 'kensington-chelsea-conservation',
        heading: 'Conservation areas and article 4 directions in Kensington and Chelsea',
        paragraphs: [
          'The council describes nearly three quarters of the borough as protected by 38 separate conservation areas, and offers a planning map to check an address.',
          'Its article 4 page lists one borough-wide direction and several for parts of the borough or named sites. The borough-wide one removes the right to extend a single dwelling house into a basement across the whole borough, in force from 28 April 2016. Another removes the right to change commercial, business and service space to a home in part of the borough; the Secretary of State modified it on 22 July 2022 to a smaller area, from 27 July 2022. Site-specific directions inside conservation areas are listed on a separate page.',
          'The council says to check any article 4 information with its planning team on 020 7361 3012. If an EPC recommendation would change the outside of a house in a conservation area, ask before the work is booked.',
        ],
        sources: [kc.conservation, kc.article4],
      },
      {
        id: 'kensington-chelsea-streets',
        heading: 'What the borough’s conservation area descriptions say about the homes',
        paragraphs: [
          'The council’s conservation area maps give a short description of each area. Avondale holds Victorian terraces laid out and built between 1870 and 1895. Avondale Park Gardens is a post First World War development of artisan cottages around a garden square, originally designed as Homes for Heroes. Colville, known as the Portobello Estate, was mainly developed between 1860 and 1875. Chelsea keeps its residential character with predominantly single family houses showing the styles of development from 1830 to the present day.',
          'The same pages describe Courtfield as formal terraces with mature gardens and generous road widths, surrounded by major roads.',
        ],
        sources: [kc.maps],
      },
    ],
    faqs: (s) => [
      {
        q: 'Do I need a licence to let a shared flat in Kensington and Chelsea?',
        a: 'If three or more people living as two or more households share facilities, yes. Five or more need a mandatory licence. Three or four need an additional licence, which has applied since 1 June 2023 and also covers some purpose-built flats in blocks of more than two flats; check the council’s page for the exceptions.',
        links: [{ label: 'Kensington and Chelsea HMO licensing', href: kc.hmo.url, external: true }],
      },
      {
        q: 'How much is a Kensington and Chelsea HMO licence?',
        a: 'The council’s fee page lists £1,004 when you apply and £489 once the licence is approved, for up to five units, plus £72 per extra room. Accredited landlords get £200 off. The page was last updated on 1 April 2026.',
        links: [{ label: 'Kensington and Chelsea licence fees', href: kc.fees.url, external: true }],
      },
      {
        q: 'Can I add a basement to my Kensington and Chelsea house?',
        a: 'Not without planning permission. The council’s article 4 direction removed permitted development rights for basement extensions to single dwelling houses across the whole borough from 28 April 2016.',
        links: [{ label: 'Kensington and Chelsea article 4 directions', href: kc.article4.url, external: true }],
      },
      {
        q: 'Is my Kensington or Chelsea home in a conservation area?',
        a: 'The council says nearly three quarters of the borough is in one of 38 conservation areas. Its planning map shows whether an address is inside one. It does not change the certificate, but it can limit which recommended works you can carry out.',
        links: [{ label: 'Kensington and Chelsea conservation areas', href: kc.conservation.url, external: true }],
      },
      ...districtFaq(s, 'Kensington & Chelsea'),
    ],
  },

  'city-of-london': {
    districtNames: {
      EC2Y: 'Barbican and Moorgate',
      EC1A: 'St Paul’s and Smithfield',
    },
    neighbours: ['camden', 'islington', 'hackney', 'tower-hamlets', 'southwark', 'westminster'],
    standout: (s, london) =>
      `The City is a small data set, ${fmt(s.certificates)} certificates, and ${pct(s.pctFlats)} of them are flats or maisonettes. Private lettings are ${pct(s.pctLettings)} of certificates and marketed sales ${pct(s.pctSales)}, against ${pct(london.pctLettings)} and ${pct(london.pctSales)} across London.`,
    stock: [
      'There are very few houses in the Square Mile. Homes here are flats: the Barbican Estate and Golden Lane Estate, a scattering of older blocks and conversions of former offices and warehouses, and new residential towers among the commercial buildings. A flat is often a studio or one bedroom.',
      'In a large block the building decides most of the rating, so the details that matter are the communal heating or cooling system, the controls in the flat and the glazing. For a listed estate flat, the original windows and fixtures are part of what the assessor records, and they are not always what a newer flat would have.',
    ],
    stockReading: (s, london) =>
      `${pct(s.walls.pct.systemBuilt)} of certificates record system-built walls, against ${pct(london.walls.pct.systemBuilt)} across London, and ${pct(s.heating.pct.communal)} record communal heating, against ${pct(london.heating.pct.communal)}. Mains gas heats ${pct(s.heating.pct.mainsGas)}, and electric heating ${pct(s.heating.pct.electric)}. Homes from 2012 onwards are ${pct(s.age.pct.from2012)}.`,
    coverage: 'The Barbican, Golden Lane, Moorgate, St Paul’s, Smithfield, Aldgate, Bank and the other residential streets inside the Square Mile.',
    council: [
      {
        id: 'city-of-london-licensing',
        heading: 'Letting in the City of London: HMO licensing',
        paragraphs: [
          'The City of London Corporation’s page for landlords says properties with five or more tenants from two or more households must be licensed. The pages we read describe mandatory licensing only, and say a licence is granted if the holder is fit and proper, the property and tenancy are managed appropriately and the accommodation meets minimum standards.',
          'Running a house in multiple occupation without a licence is a criminal offence, with a fine of up to £20,000 mentioned together with other measures. The council’s HMO page, last updated on 16 February 2023, lists an initial fee of £600 on application and a fee on grant that depends on the number of lettings: £450 for up to five, £600 for six to nine, £750 for ten to fourteen, £900 for fifteen to nineteen and £1,050 for twenty or more. That page is dated, so confirm the current fee with the Environmental Health team.',
        ],
        sources: [col.prs, col.hmo],
      },
      {
        id: 'city-of-london-conservation',
        heading: 'Conservation areas in the City of London',
        paragraphs: [
          'The City has 28 conservation areas. The council’s page says it has also designated a new one, Creechurch. For each area the council has produced, or intends to produce, a Character Summary or a supplementary planning document, and these set out the planning policies that apply.',
          'The Barbican and Golden Lane Conservation Area was designated in October 2018. The council’s document says it is made up of two distinct developments, Golden Lane Estate to the north and Barbican Estate to the south.',
        ],
        sources: [col.conservation, col.spd],
      },
      {
        id: 'city-of-london-barbican',
        heading: 'Barbican and Golden Lane: listed estates',
        paragraphs: [
          'The council describes the Barbican Estate as built between 1963 and 1982 by the City of London Corporation, to designs by Chamberlin, Powell and Bon, with more than 2,000 flats. It was listed Grade II in 2001 and its landscape is Grade II* on the register of parks and gardens, designated in 2003.',
          'The City Corporation announced a competition for Golden Lane Estate in 1951, and the estate was completed in 1962. On completion it had 559 flats and maisonettes. The conservation area document lists Crescent House as Grade II* and the Golden Lane Estate landscape as Grade II.',
          'The Barbican Listed Building Management Guidelines were written to help residents and planning officers judge what work needs listed building consent. For a flat in either estate, check the guidelines before changing windows or fixtures that an EPC suggests.',
        ],
        sources: [col.barbican, col.spd],
      },
    ],
    faqs: (s) => [
      {
        q: 'Does a City of London flat need an HMO licence?',
        a: 'If five or more people from two or more households live there, yes: the council says such properties must be licensed. Its pages we read describe mandatory licensing only. Environmental Health can confirm how it applies to an address.',
        links: [{ label: 'City of London private rented accommodation', href: col.prs.url, external: true }],
      },
      {
        q: 'Can I change the windows of a Barbican flat?',
        a: 'Check first. The Barbican Estate is listed Grade II and sits in the Barbican and Golden Lane conservation area. The council’s Listed Building Management Guidelines are written to help work out what needs listed building consent.',
        links: [{ label: 'Barbican Estate listed building guidelines', href: col.barbican.url, external: true }],
      },
      {
        q: 'How many conservation areas does the City have?',
        a: 'The council’s page says 28, and says it has designated a new one, Creechurch. For each one it has produced, or intends to produce, a Character Summary or supplementary planning document.',
        links: [{ label: 'City of London conservation areas', href: col.conservation.url, external: true }],
      },
      {
        q: 'Can you assess a flat in a managed block in the Square Mile?',
        a: 'Yes. Tell us the entry arrangements when you book, whether there is a concierge or key fob, and which floor the flat is on. The communal heating and the controls in the flat are what the assessment needs.',
      },
      ...districtFaq(s, 'City of London'),
    ],
  },

  enfield: {
    districtNames: {
      EN3: 'Enfield Lock, Ponders End and Brimsdown',
      N9: 'Lower Edmonton',
      EN1: 'Enfield Town and Bush Hill Park',
      N18: 'Upper Edmonton',
      N13: 'Palmers Green',
      EN2: 'Enfield Chase and Crews Hill',
      N14: 'Southgate',
      N21: 'Winchmore Hill',
      N11: 'New Southgate',
      EN4: 'Hadley Wood',
    },
    neighbours: ['barnet', 'haringey', 'waltham-forest'],
    standout: (s) => {
      const t = trend(s)
      const { top, bottom } = spread(s)
      return `Enfield’s share rated A to C moved from ${pct(t.from)} in ${t.first} to ${pct(t.to)} in ${t.last}. ${bottom.district} has the lowest share of any district with enough certificates, at ${pct(bottom.pctAtoC)}, and ${top.district} the highest at ${pct(top.pctAtoC)}.`
    },
    stock: [
      'The borough runs from the old brick terraces of Edmonton and Ponders End in the south and east, through the interwar semis of Palmers Green, Southgate and Winchmore Hill, to the larger detached houses of Hadley Wood and Enfield Chase in the north-west. Along the Lee Valley there are older industrial sites and newer blocks.',
      'On an interwar semi the loft, the cavity and the age of the boiler usually decide the rating. On an Edmonton terrace the walls are often solid. Where insulation was added after the build, an installer certificate or dated photos let it be recorded. Without proof, the assessment uses the walls and roof as they were built.',
    ],
    stockReading: (s, london) =>
      `${pct(s.age.pct.from1930to1966)} of Enfield’s certificates are for homes built between 1930 and 1966, against ${pct(london.age.pct.from1930to1966)} across London. Cavity walls with insulation are ${pct(s.walls.pct.cavityInsulated)} and cavity walls without ${pct(s.walls.pct.cavityUninsulated)}. A mains gas boiler heats ${pct(s.heating.pct.mainsGas)}. Flats and maisonettes are ${pct(s.pctFlats)} of the total.`,
    coverage: 'Enfield Town, Enfield Lock, Ponders End, Brimsdown, Edmonton, Palmers Green, Southgate, Winchmore Hill, New Southgate, Bush Hill Park and Hadley Wood.',
    council: [
      {
        id: 'enfield-licensing',
        heading: 'Letting in Enfield: selective and additional HMO licensing',
        paragraphs: [
          'Enfield’s selective licensing scheme started on 1 September 2026. It covers privately rented homes occupied by one or two people, or one family, in 17 wards. Designation 1 is Bowes, Brimsdown, Bullsmoor, Carterhatch, Edmonton Green, Enfield Lock, Haselbury, Jubilee, Lower Edmonton, Ponders End, Southbury, Upper Edmonton and Whitewebbs. Designation 2 is New Southgate, Palmers Green, Southgate and Town.',
          'A borough-wide additional HMO scheme started on 1 September 2025 for homes occupied by three or four people from more than one household. Mandatory licensing covers five or more. A home licensed as an HMO does not need a selective licence as well.',
          'The selective fee is £750 in two parts: £450 with the application and £300 when the draft licence is issued. A licence is usually for five years. An EPC rating of C or above takes £100 off, an accredited landlord £50, and £100 off for each additional flat where one owner manages several in a building. The council does not give discounts where it has asked twice for documents or sent a warning letter, and they cannot be added after the licence is granted.',
        ],
        sources: [enfield.selective, enfield.hmo],
      },
      {
        id: 'enfield-conservation',
        heading: 'Conservation areas and article 4 directions in Enfield',
        paragraphs: [
          'Enfield has 22 conservation areas, from Abbotshall Avenue and Bush Hill Park to Ponders End Flour Mills, the Lakes Estate and Winchmore Hill. Where the council has made an article 4 direction, a planning application is needed for certain works that would not normally need one.',
          'The council’s list of directions runs from 1982 (Enfield Lock) to 2017. In 2006 article 4(2) directions were made for parts of eleven areas, including Bush Hill Park, Southgate Green and Winchmore Hill. Directions in 2008 cover most of Grange Park, Meadway and The Crescent, and in 2009 they cover Abbotshall Avenue and the extended areas. For Enfield Town, a 2017 article 4(1) direction replaced the 2006 article 4(2) direction and came into effect on 8 January 2018.',
        ],
        sources: [enfield.conservation, enfield.article4],
      },
      {
        id: 'enfield-hmo-planning',
        heading: 'HMOs, planning and the documents Enfield asks for',
        paragraphs: [
          'A borough-wide article 4 direction is in place in Enfield. It removes permitted development rights for changing a single family home to an HMO. The council says it takes the planning status of an HMO into account when licensing, and where use is unauthorised it will usually grant a licence for a shorter term, normally two years.',
          'The selective application asks for room sizes in square metres, the structure of the property, the position of smoke and carbon monoxide detectors, and a gas safety certificate, an electrical installation condition report, an EPC and a tenancy agreement. An HMO application also asks for floor plans and electrical and fire safety documents.',
        ],
        sources: [enfield.hmo, enfield.selective],
      },
    ],
    faqs: (s) => [
      {
        q: 'Which Enfield wards need a selective licence?',
        a: 'Seventeen: Bowes, Brimsdown, Bullsmoor, Carterhatch, Edmonton Green, Enfield Lock, Haselbury, Jubilee, Lower Edmonton, Ponders End, Southbury, Upper Edmonton and Whitewebbs, plus New Southgate, Palmers Green, Southgate and Town. The scheme started on 1 September 2026.',
        links: [{ label: 'Enfield selective licensing', href: enfield.selective.url, external: true }],
      },
      {
        q: 'Does a good EPC lower the Enfield licence fee?',
        a: 'It can. Enfield lists £100 off for an EPC of C or above, on selective and additional HMO licences, with £50 more for an accredited landlord. Discounts are decided on a complete application with up-to-date certificates.',
        links: [{ label: 'Enfield selective licence fee discounts', href: enfield.selective.url, external: true }, { label: 'Enfield HMO licensing', href: enfield.hmo.url, external: true }],
      },
      {
        q: 'Do I need planning permission to turn an Enfield house into an HMO?',
        a: 'Enfield says a borough-wide article 4 direction removes permitted development rights for changing a single family home to an HMO. You need planning consent or proof of established use. This is separate from the licence.',
        links: [{ label: 'Enfield houses in multiple occupation', href: enfield.hmo.url, external: true }],
      },
      {
        q: 'Do you cover Winchmore Hill and Bush Hill Park?',
        a: 'Yes. Both are conservation areas with article 4 directions, which can affect outside work such as windows and roofs, not the assessment. Prices are the same as anywhere else in London.',
        links: [{ label: 'Enfield article 4 directions', href: enfield.article4.url, external: true }],
      },
      ...districtFaq(s, 'Enfield'),
    ],
  },

  redbridge: {
    districtNames: {
      IG1: 'Ilford',
      IG3: 'Seven Kings and Goodmayes',
      IG6: 'Barkingside and Fairlop',
      IG8: 'Woodford Green',
      IG2: 'Gants Hill',
      E18: 'South Woodford',
      E11: 'Wanstead',
      RM6: 'Chadwell Heath',
      IG5: 'Clayhall',
      IG7: 'Hainault',
      IG4: 'Redbridge and Ilford North',
    },
    neighbours: ['barking-dagenham', 'newham', 'waltham-forest', 'havering'],
    standout: (s, london) =>
      `Lettings are ${pct(s.pctLettings)} of Redbridge’s certificates, against ${pct(london.pctLettings)} across London, and there are ${fmt(s.privateRented.n)} for privately rented homes. ${pct(s.potential.pctBelowCCouldReachC)} of the homes rated D to G today have a potential rating of C or better.`,
    stock: [
      'Ilford, Seven Kings and Goodmayes are long streets of Victorian and Edwardian terraces. Gants Hill, Barkingside and Clayhall are largely interwar semis. In the north, Woodford and Wanstead have larger detached and period houses, and Ilford town centre has newer blocks.',
      'On an interwar semi the first questions are whether the cavity has been filled and how deep the loft insulation is. On an Ilford terrace the walls are often solid, and a rear extension added later is assessed on its own construction. For a flat above a shop, say which parts are heated and how.',
    ],
    stockReading: (s, london) =>
      `${pct(s.age.pct.from1930to1966)} of certificates are for homes built between 1930 and 1966, against ${pct(london.age.pct.from1930to1966)} across London, and ${pct(s.walls.pct.cavityInsulated)} record insulated cavity walls. Solid walls with no added insulation are ${pct(s.walls.pct.solidUninsulated)}. A mains gas boiler heats ${pct(s.heating.pct.mainsGas)}, against ${pct(london.heating.pct.mainsGas)}.`,
    coverage: 'Ilford, Seven Kings, Goodmayes, Gants Hill, Barkingside, Clayhall, Hainault, Woodford, South Woodford, Wanstead and Chadwell Heath.',
    council: [
      {
        id: 'redbridge-licensing',
        heading: 'Letting in Redbridge: selective and HMO licensing',
        paragraphs: [
          'Redbridge runs two selective licensing schemes. Scheme 3 covers Valentines and Ilford Town. Scheme 4 covers Aldborough, Barkingside, Chadwell, Churchfields, Clementswood, Cranbrook, Fairlop, Goodmayes, Hainault, Loxford, Mayfield, Newbury, Seven Kings, South Woodford and Wanstead Village. A selective licence is needed for properties occupied by one person, two people or one household.',
          'HMO licences apply across the borough: mandatory for five or more people, additional for three or four people from two or more households. For applications from 1 April 2026 to 31 March 2027, a selective licence is £997.69, paid as £371.05 on application and £626.64 if it is approved, with £35 off the second part for accredited landlords. HMO licences are paid in two stages: £696.14 first, then a second payment set by the number of households, a total from £1,865.34 for two households.',
          'The application list includes an EPC. The council says it will only approve licences for properties graded A to E, so a home rated F or G needs work first or an exemption.',
        ],
        sources: [redbridge.selective, redbridge.hmo],
      },
      {
        id: 'redbridge-floor-plan',
        heading: 'The floor plans a Redbridge licence application asks for',
        paragraphs: [
          'Redbridge’s selective licence application asks for floor plans showing fire exits and the position of smoke alarms and heat detectors. The council says the plan does not need to be done by an architect or surveyor.',
          'The same list asks for a gas safety certificate, an Electrical Installation Condition Report, a portable appliance test certificate and proof of a landlord accreditation course from LLAS or a similar organisation, to be done within 18 months of getting the full licence.',
        ],
        sources: [redbridge.selective],
      },
      {
        id: 'redbridge-conservation',
        heading: 'Conservation areas and article 4 directions in Redbridge',
        paragraphs: [
          'Redbridge has 16 conservation areas, and the council lists guidance for them, including Aldersbrook and Lake House Estate, the Bungalow Estate, Wanstead Village, South Woodford, Snaresbrook and Woodford Green and Wells. The council says an article 4 direction removes some development rights over alterations such as new porches, replacement windows and doors, replacement roof coverings and exterior painting.',
          'Its list of article 4 directions includes the Bungalow Estate and the Aldersbrook and Lake House conservation areas, plus a borough-wide direction on small HMOs (C4 use). Where a direction applies, a planning application is needed for those changes.',
        ],
        sources: [redbridge.protected],
      },
      {
        id: 'redbridge-bungalow-estate',
        heading: 'The Bungalow Estate and the local heritage list',
        paragraphs: [
          'The council’s Bungalow Estate appraisal says the estate is laid out on former farmland in a grid of linked roads. The first bungalow designs were submitted in December 1919. By 1929 the western half was complete, and the last roads, Trenance and Tresco in 1933 and Brownlea and Budoch in 1935, came in the 1930s, where plots were smaller and the bungalow theme gave way to two-storey terraces on Tresco Gardens.',
          'The appraisal notes the council first recognised the estate’s special character in 1974, when it was designated a Residential Precinct. The council now keeps a Local Heritage List of buildings and Local Character Areas, formerly called Residential Precincts, which have no statutory protection but deserve local protection.',
        ],
        sources: [redbridge.bungalow, redbridge.protected],
      },
    ],
    faqs: (s) => [
      {
        q: 'Which Redbridge wards need a selective licence?',
        a: 'Valentines and Ilford Town under Scheme 3, and Aldborough, Barkingside, Chadwell, Churchfields, Clementswood, Cranbrook, Fairlop, Goodmayes, Hainault, Loxford, Mayfield, Newbury, Seven Kings, South Woodford and Wanstead Village under Scheme 4. The council’s map checks an address.',
        links: [{ label: 'Redbridge selective licensing', href: redbridge.selective.url, external: true }],
      },
      {
        q: 'Can a Redbridge rental rated F or G be licensed?',
        a: 'The council says it will only approve licences for properties with an EPC graded A to E. A home rated F or G needs improvements first, or a valid exemption.',
        links: [{ label: 'Redbridge selective licensing: what you need', href: redbridge.selective.url, external: true }],
      },
      {
        q: 'What does a Redbridge licence cost for 2026 to 2027?',
        a: 'A selective licence is £997.69 for applications from 1 April 2026 to 31 March 2027, in two parts of £371.05 and £626.64. A paper application adds £139.23. HMO licences are paid in two stages: £696.14 first, then an amount set by the number of households, a total from £1,865.34 for two households.',
        links: [{ label: 'Redbridge HMO licensing', href: redbridge.hmo.url, external: true }],
      },
      {
        q: 'Do I need permission to replace windows in a Redbridge conservation area?',
        a: 'If an article 4 direction applies to the property, yes. Redbridge says directions can remove rights over replacement windows and doors, roof coverings, porches and exterior painting. The Bungalow Estate and the Aldersbrook and Lake House area both have one.',
        links: [{ label: 'Redbridge conservation areas and article 4', href: redbridge.protected.url, external: true }],
      },
      ...districtFaq(s, 'Redbridge'),
    ],
  },

  'hammersmith-fulham': {
    districtNames: {
      SW6: 'Fulham and Parsons Green',
      W12: 'Shepherd’s Bush',
      W6: 'Hammersmith and Ravenscourt Park',
      W14: 'West Kensington and Brook Green',
      W11: 'Holland Park edge',
    },
    neighbours: ['brent', 'kensington-chelsea', 'ealing', 'hounslow', 'richmond', 'wandsworth'],
    standout: (s, london) => {
      const lead = s.districts[0]
      return `${lead.district} is the biggest district, with ${fmt(lead.n)} of the borough’s ${fmt(s.certificates)} certificates, and ${pct(lead.pctAtoC)} of them are rated A to C. Across the borough the share is ${pct(s.ratings.pct.AtoC)}, against ${pct(london.ratings.pct.AtoC)} for London.`
    },
    stock: [
      'Fulham, Hammersmith and Brook Green are Victorian and Edwardian terraces, nearly all converted into flats, with the occasional unconverted family house close to the river and around Parsons Green. Shepherd’s Bush mixes terraces with mansion blocks along Uxbridge Road, council estates and the towers of the White City development.',
      'In a converted terrace the assessor is looking at the flat, not the building: the floor it is on, the roof above, the windows and the boiler. Many Fulham streets are rows of identical houses, so a neighbour’s rating is a poor guide.',
    ],
    stockReading: (s, london) =>
      `${pct(s.age.pct.pre1930)} of H&F’s certificates are for homes built before 1930, against ${pct(london.age.pct.pre1930)} across London. ${pct(s.walls.pct.solidUninsulated)} record solid walls with no added insulation. A mains gas boiler heats ${pct(s.heating.pct.mainsGas)}, and communal heating ${pct(s.heating.pct.communal)}. Flats and maisonettes are ${pct(s.pctFlats)} of the total.`,
    coverage: 'Fulham, Parsons Green, Hammersmith, Brook Green, Ravenscourt Park, West Kensington, Barons Court, Shepherd’s Bush and White City.',
    council: [
      {
        id: 'hammersmith-fulham-licensing',
        heading: 'Letting in Hammersmith and Fulham: three licences',
        paragraphs: [
          'The council runs three property licensing schemes. A mandatory HMO licence is for homes rented to five or more people from two or more households who share facilities. An additional HMO licence is for three or four people, in houses and flats including purpose-built flats. A selective licence is for a house or flat on one of 24 named streets, among them Askew Road, Fulham Road, Goldhawk Road, King Street, New King’s Road, North End Road, Shepherd’s Bush Road and Uxbridge Road.',
          'The council renewed the selective and additional schemes from 5 June 2022, for five years. Its FAQ says the additional scheme runs until 4 June 2027. Check the council’s page for what follows.',
          'The 2026/27 fee for an additional HMO licence or a selective licence is £755. An £80 discount applies to members of an accredited landlord body, or £50 for signing the landlord rental charter; only one discount applies per licence. The fee is split 50/50 for additional and selective licences. A mandatory licence is £1,656 for a five-bed HMO plus £183 for each extra bedroom.',
        ],
        sources: [hf.licensing, hf.faq, hf.schemes],
      },
      {
        id: 'hammersmith-fulham-conservation',
        heading: 'Conservation areas and article 4 directions in Hammersmith and Fulham',
        paragraphs: [
          'The council has 44 conservation areas, covering about half of the borough, and two more in the north within the Old Oak and Park Royal Development Corporation area, which now manages them.',
          'It lists article 4 directions by name, from Abdale Road and Bishops Park to Walham Grove and Wormholt and Old Oak. They restrict permitted development rights at many properties, especially in conservation areas, so planning permission is needed for works they cover. Since 1 October 2013 significant demolition in a conservation area needs planning permission instead of conservation area consent.',
        ],
        sources: [hf.conservation, hf.article4],
      },
      {
        id: 'hammersmith-fulham-estates',
        heading: 'Peabody blocks, estates and character profiles in Hammersmith and Fulham',
        paragraphs: [
          'The council’s character profile for the Cleverly Estate describes eighteen three-storey blocks of red brick around four open squares, started in 1928, completed in two years for the Peabody Fund to the designs of Victor Wilkins. The main windows are twelve-pane white vertically sliding sashes, and the profile records that some blocks have had them replaced with UPVC windows copying the original design.',
          'The Dorcas Estate conservation area was extended on 2 July 2002 to take in 85 and 87 Hammersmith Road and 2 to 10 North End Road. The council says the Gunter Estate profile is still being produced, and that controls on estate agent boards apply in part of it.',
        ],
        sources: [hf.cleverly, hf.dorcas, hf.gunter],
      },
    ],
    faqs: (s) => [
      {
        q: 'Which Hammersmith and Fulham streets need a selective licence?',
        a: 'Twenty-four named streets, including Askew Road, Fulham Road, Goldhawk Road, Uxbridge Road, North End Road and King Street. The scheme was renewed from 5 June 2022 for five years. Check the council’s list for your street.',
        links: [{ label: 'Hammersmith & Fulham property licensing', href: hf.licensing.url, external: true }],
      },
      {
        q: 'How much is a Hammersmith and Fulham licence?',
        a: 'The 2026/27 fee for an additional HMO licence or a selective licence is £755, with £80 off for an accredited landlord body member or £50 for signing the rental charter. The council says fees cover running the scheme and are not a source of profit.',
        links: [{ label: 'Hammersmith & Fulham licensing FAQs', href: hf.faq.url, external: true }],
      },
      {
        q: 'Can I change the windows in a Fulham or Brook Green flat?',
        a: 'Check first. The council has 44 conservation areas, including Brook Green and Central Fulham, and many properties are covered by article 4 directions that require planning permission for works they restrict.',
        links: [{ label: 'Hammersmith & Fulham article 4 directions', href: hf.article4.url, external: true }],
      },
      {
        q: 'Do you assess flats on the White City or Shepherd’s Bush estates?',
        a: 'Yes. Tell us whether the building has communal heating and how entry works. Each flat gets its own certificate.',
      },
      ...districtFaq(s, 'Hammersmith & Fulham'),
    ],
  },

  hillingdon: {
    districtNames: {
      UB3: 'Hayes and Harlington',
      HA4: 'Ruislip',
      UB7: 'West Drayton and Harmondsworth',
      UB4: 'Yeading and Hayes',
      UB10: 'Hillingdon and Ickenham',
      UB8: 'Uxbridge and Cowley',
      HA6: 'Northwood',
      HA5: 'Eastcote and Pinner border',
      UB9: 'Harefield',
    },
    neighbours: ['harrow', 'ealing', 'hounslow'],
    standout: (s, london) =>
      `Only ${pct(s.pctFlats)} of Hillingdon’s certificates are for flats or maisonettes, against ${pct(london.pctFlats)} across London, and the typical house is ${s.floorArea.houses} m². The share rated A to C is ${pct(s.ratings.pct.AtoC)}, ${rankLabel('hillingdon', (b) => b.ratings.pct.AtoC)} of ${boroughCount} boroughs.`,
    stock: [
      'Hillingdon is outer London: Metroland semis and detached houses in Ruislip, Eastcote and Northwood, interwar and post-war estates in Hayes and Yeading, village centres near Heathrow at Harmondsworth and Harlington, and Uxbridge’s mixed town centre and newer blocks. A good share of the homes are houses with gardens, garages and loft space.',
      'On an interwar semi the evidence of cavity fill or loft insulation counts. Many post-war houses were built with cavity walls that may never have been filled. Extensions and garage conversions are common and assessed on their own construction.',
    ],
    stockReading: (s, london) =>
      `${pct(s.age.pct.pre1930)} of Hillingdon’s certificates are for homes built before 1930, against ${pct(london.age.pct.pre1930)} across London, and ${pct(s.age.pct.from1930to1966)} for 1930 to 1966. Cavity walls with insulation are ${pct(s.walls.pct.cavityInsulated)} and cavity walls without ${pct(s.walls.pct.cavityUninsulated)}. A mains gas boiler heats ${pct(s.heating.pct.mainsGas)}.`,
    coverage: 'Hayes, Harlington, West Drayton, Harmondsworth, Uxbridge, Cowley, Hillingdon, Ickenham, Ruislip, Eastcote, Northwood, Yeading and Harefield.',
    council: [
      {
        id: 'hillingdon-licensing',
        heading: 'Letting in Hillingdon: mandatory and additional HMO licensing',
        paragraphs: [
          'Hillingdon already licensed large HMOs, with five or more unrelated people in two or more households. On 19 February 2026 its Cabinet approved a borough-wide additional licensing scheme for shared homes with three or four residents from two or more households sharing a kitchen or bathroom. It runs for five years, and the pages we read list no selective licensing scheme.',
          'Applications opened on 20 May 2026 and landlords had to apply by 23 August 2026. The council says that since 24 August 2026 HMOs that have not applied, or do not comply, may face enforcement action.',
          'For 1 April 2026 to 31 March 2027 the additional licence is £1,401 in total, with 10% off for accredited landlords or managing agents. A new or renewed mandatory licence is £1,656, paid as £1,104 with the application and £552 if it succeeds.',
        ],
        sources: [hillingdon.scheme, hillingdon.who, hillingdon.fees, hillingdon.news],
      },
      {
        id: 'hillingdon-documents',
        heading: 'The documents a Hillingdon HMO application asks for',
        paragraphs: [
          'The council’s application form asks you to upload, as electronic files, a floor plan of the property including measurements, a valid gas certificate, a valid electric certificate, a fire alarm certificate, an emergency lighting certificate if the home has three or more storeys, a fire risk assessment and a PAT certificate.',
          'The council also warns that an HMO licence is not the same as planning permission. A borough-wide article 4 direction, introduced in December and described in its February 2026 news item, requires planning permission before a family home becomes an HMO.',
        ],
        sources: [hillingdon.docs, hillingdon.news],
      },
      {
        id: 'hillingdon-conservation',
        heading: 'Conservation areas and areas of special local character in Hillingdon',
        paragraphs: [
          'Hillingdon has 31 designated conservation areas, from old village centres to planned residential estates and canal-side buildings, and 15 areas of special local character. The council treats the second group as non-designated local heritage assets: its planning policies seek to preserve or enhance the character of these areas.',
          'The areas of special local character include the Garden City in West Drayton and Central Avenue in Hayes, both designated on 13 November 1989, the Barnhill Estate in Yeading in October 2006 and the Raisins Hill Estate in Eastcote on 19 December 2012. Eastcote Park Estate was upgraded from an area of special local character to a conservation area in 2005.',
        ],
        sources: [hillingdon.conservation, hillingdon.conservationList, hillingdon.aslc],
      },
    ],
    faqs: (s) => [
      {
        q: 'Does my shared Hillingdon house need a licence?',
        a: 'If it has three or more residents from two or more households sharing a kitchen or bathroom, yes. Three or four need the additional licence approved in February 2026; five or more need a mandatory licence. Landlords had to apply by 23 August 2026.',
        links: [{ label: 'Hillingdon additional HMO licence scheme', href: hillingdon.who.url, external: true }],
      },
      {
        q: 'How much is a Hillingdon HMO licence?',
        a: 'For 1 April 2026 to 31 March 2027 the additional licence is £1,401, with 10% off for accredited landlords. A mandatory licence is £1,656, paid in two instalments of £1,104 and £552.',
        links: [{ label: 'Hillingdon HMO licence fees', href: hillingdon.fees.url, external: true }],
      },
      {
        q: 'Do I need planning permission to convert a Hillingdon home to an HMO?',
        a: 'The council’s February 2026 news item says a borough-wide article 4 direction, introduced in December, requires planning permission before a family home is converted. The licence does not replace that.',
        links: [{ label: 'Hillingdon HMO licensing news', href: hillingdon.news.url, external: true }],
      },
      {
        q: 'Can you assess a home near Heathrow?',
        a: 'Yes. Hayes, Harlington, West Drayton and Harmondsworth are covered at the same price as the rest of London. Harmondsworth Village is a conservation area, which affects outside works and not the certificate.',
        links: [{ label: 'Hillingdon conservation areas', href: hillingdon.conservation.url, external: true }],
      },
      ...districtFaq(s, 'Hillingdon'),
    ],
  },
}
