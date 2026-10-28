import type { AreaSummary } from './borough-stats-types'
import type { AreaLocal, CouncilSource } from './area-local'
import { boroughCount, fmt, pct, rankLabel } from './area-page'

/**
 * Batch D2b hand-written local content: Westminster, Hackney, Southwark, Richmond, Havering, Sutton.
 * Council facts come from each council's own pages, read on `CHECKED`; a fact that could not be confirmed there is
 * left out. Figures are never typed here: each sentence that needs one takes it from lib/borough-stats.ts through
 * `s` (this area) and `london`. Council figures (fees, dates, ward lists) are typed as the council page states them.
 * Fact table with the supporting quotes: projects/ld-energy-redesign-2026-10/research/areas-d2b-sources-2026-10-28.md.
 */

const CHECKED = '2026-10-28'

const src = (label: string, url: string): CouncilSource => ({ label, url, checked: CHECKED })

function spread(s: AreaSummary) {
  const ranked = [...s.districts].sort((a, b) => b.pctAtoC - a.pctAtoC)
  return { top: ranked[0], bottom: ranked[ranked.length - 1] }
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

const westminster = {
  selective: src('Westminster City Council, selective property licensing', 'https://www.westminster.gov.uk/housing/private-sector-housing/selective-property-licensing'),
  need: src('Westminster City Council, do I need a selective licence?', 'https://www.westminster.gov.uk/housing/private-sector-housing/selective-property-licensing/do-i-need-licence'),
  fees: src('Westminster City Council, selective licence fees and discounts', 'https://www.westminster.gov.uk/housing/private-sector-housing/selective-property-licensing/licence-fees-and-discounts'),
  hmoFees: src('Westminster City Council, HMO licence fees and guidance', 'https://www.westminster.gov.uk/housing/private-sector-housing/houses-multiple-occupation-hmo/licence-fees-and-guidance'),
  additional: src('Westminster City Council, renewal of the additional HMO licensing scheme', 'https://www.westminster.gov.uk/news/renewal-additional-hmo-licensing-scheme-westminster'),
  conservation: src('Westminster City Council, conservation areas', 'https://www.westminster.gov.uk/planning-building-control-and-environmental-regulations/design-and-heritage/conservation-areas'),
  article4: src('Westminster City Council, Article 4 Directions in Westminster', 'https://www.westminster.gov.uk/planning-building-control-and-environmental-regulations/planning-applications/make-application/find-out-if-you-need-planning-permission/article-4-directions-westminster'),
  queensPark: src('Westminster City Council, Queen’s Park Estate design guide', 'https://www.westminster.gov.uk/sites/default/files/media/documents/Queen\'s%20Park%20Estate%20design%20guide.pdf'),
}

const hackney = {
  check: src('Hackney Council, check which property licence you need', 'https://www.hackney.gov.uk/housing/private-tenants-and-landlords/private-landlords/check-which-property-licence-you-need'),
  apply: src('Hackney Council, apply for a property licence', 'https://www.hackney.gov.uk/housing/private-tenants-and-landlords/private-landlords/apply-property-licence'),
  news: src('Hackney Council news, Hackney approves plans to introduce property licensing', 'https://news.hackney.gov.uk/news/landlords-in-hackney-to-meet-tighter-rules-as-hackney-approves-plans-to-introduce-property-licensing'),
  conservation: src('Hackney Council, conservation areas', 'https://www.hackney.gov.uk/planning-and-building/conservation-and-urban-design/conservation-areas'),
  deBeauvoir: src('Hackney Council, De Beauvoir conservation area', 'https://www.hackney.gov.uk/planning-and-building/conservation-and-urban-design/conservation-areas/de-beauvoir-conservation-area'),
  beck: src('Hackney Council, Beck Road conservation area', 'https://hackney.gov.uk/beck-road-ca/'),
  brownswood: src('Hackney Council, Brownswood conservation area', 'https://hackney.gov.uk/brownswood-ca/'),
}

const southwark = {
  overview: src('Southwark Council, property licensing', 'https://www.southwark.gov.uk/housing/private-tenants-and-landlords/private-rented-property-licensing/property-licensing'),
  mandatory: src('Southwark Council, mandatory licensing', 'https://www.southwark.gov.uk/housing/private-tenants-and-landlords/private-rented-property-licensing/property-licensing-1'),
  additional: src('Southwark Council, additional licensing', 'https://www.southwark.gov.uk/housing/private-tenants-and-landlords/private-rented-property-licensing/property-licensing-2'),
  selective: src('Southwark Council, selective licensing', 'https://www.southwark.gov.uk/housing/private-tenants-and-landlords/private-rented-property-licensing/property-licensing-3'),
  fees: src('Southwark Council, licence fees', 'https://www.southwark.gov.uk/housing/private-tenants-and-landlords/apply-private-rented-property-licence/licence-fees'),
  conditions: src('Southwark Council, licence conditions', 'https://www.southwark.gov.uk/housing/private-tenants-and-landlords/private-rented-property-licensing/licence-conditions'),
  conservation: src('Southwark Council, conservation areas', 'https://www.southwark.gov.uk/planning-environment-and-building-control/planning/design-and-conservation/conservation-areas'),
  restrictions: src('Southwark Council, restrictions that apply in conservation areas', 'https://www.southwark.gov.uk/planning-environment-and-building-control/planning/design-and-conservation/conservation-areas-0'),
  list: src('Southwark Council, list of conservation areas', 'https://www.southwark.gov.uk/planning-environment-and-building-control/planning/design-and-conservation/conservation-areas/list'),
  article4: src('Southwark Council, Article 4 directions', 'https://www.southwark.gov.uk/planning-environment-and-building-control/planning/planning-policy-and-guidance/article-4'),
}

const richmond = {
  hmo: src('Richmond Council, apply for a HMO licence', 'https://www.richmond.gov.uk/services/housing/private_housing/privately_rented_properties/hmo/apply_for_a_hmo_licence'),
  renters: src('Richmond Council, support for private renters', 'https://www.richmond.gov.uk/services/housing/private_housing/private_renter_support'),
  conservation: src('Richmond Council, about conservation areas', 'https://www.richmond.gov.uk/services/planning/conservation_and_urban_design/conservation_areas/about_conservation_areas'),
  article4: src('Richmond Council, Article 4 Directions, conservation areas', 'https://www.richmond.gov.uk/services/planning/conservation_and_urban_design/conservation_areas/article_4_directions/article_4_directions_conservation_area'),
  faq: src('Richmond Council, conservation areas frequently asked questions', 'https://www.richmond.gov.uk/conservation_areas_faq'),
}

const havering = {
  licensing: src('Havering Council, apply for a property licence', 'https://www.havering.gov.uk/information-landlords/private-rented-property-licensing'),
  launch: src('Havering Council, new property licensing schemes launched', 'https://www.havering.gov.uk/news/article/1737/new-property-licensing-schemes-launched'),
  conservation: src('Havering Council, Havering’s 11 conservation areas', 'https://www.havering.gov.uk/planning-3/heritage/2'),
  heritage: src('Havering Council, conservation areas', 'https://www.havering.gov.uk/planning-3/heritage'),
  gidea: src('Havering Council, Article 4 Direction for Gidea Park', 'https://www.havering.gov.uk/planning-3/article-4-directions/3'),
  gideaOwners: src('Havering Council, information for owners in Gidea Park, June 2016', 'https://www.havering.gov.uk/downloads/file/154/information_for_owner_occupiers_-_gidea_park'),
}

const sutton = {
  hmo: src('Sutton Council, houses in multiple occupation', 'https://www.sutton.gov.uk/businesses-and-licensing/licensing/houses-multiple-occupation/houses-multiple-occupation-hmo'),
  apply: src('Sutton Council, apply for, vary or renew your HMO licence', 'https://www.sutton.gov.uk/w/houses-in-multiple-occupation-apply-for-vary-or-renew-your-hmo-licence'),
  article4: src('Sutton Council, Article 4 Directions', 'https://www.sutton.gov.uk/w/article-4-directions'),
  gardenSuburb: src('Sutton Council, Sutton Garden Suburb conservation area character appraisal, June 2006', 'https://www.sutton.gov.uk/sites/default/files/2026-04/Sutton%20Garden%20Suburb%20CA%20Appraisal%20(2006).pdf'),
}

export const d2bLocal: Record<string, AreaLocal> = {
  westminster: {
    districtNames: {
      W2: 'Paddington and Bayswater',
      W9: 'Maida Vale and Warwick Avenue',
      NW8: 'St John’s Wood and Lisson Grove',
      SW1V: 'Pimlico',
      SW1P: 'Westminster and Millbank',
      W10: 'Queen’s Park',
      NW1: 'Regent’s Park',
      W1H: 'Marylebone',
      SW1W: 'Belgravia',
      W1U: 'Marylebone',
      W1K: 'Mayfair',
      W1W: 'Fitzrovia',
      W1F: 'Soho',
      SW7: 'the Knightsbridge edge',
      W1G: 'Marylebone and Harley Street',
      SW1X: 'Belgravia and Knightsbridge',
      W1D: 'Soho',
      W1J: 'Mayfair and Piccadilly',
      WC2H: 'Covent Garden and Leicester Square',
      WC2E: 'Covent Garden',
      W1T: 'Fitzrovia',
      SW1E: 'Victoria',
    },
    neighbours: ['camden', 'city-of-london', 'kensington-chelsea', 'brent', 'lambeth'],
    standout: (s) => {
      const { top, bottom } = spread(s)
      return `Flats and maisonettes are ${pct(s.pctFlats)} of Westminster’s certificates, the ${rankLabel('westminster', (b) => b.pctFlats)} highest share of ${boroughCount} boroughs. ${top.district} has the largest share rated A to C at ${pct(top.pctAtoC)}, and ${bottom.district} the smallest at ${pct(bottom.pctAtoC)}.`
    },
    stock: [
      'Westminster runs from the stuccoed terraces of Pimlico and Belgravia, through the mansion blocks of Maida Vale and the villas of St John’s Wood, to the offices, hotels and flats above shops of the West End. In the north-west corner, the Queen’s Park Estate is a cottage estate designed in 1873, which the council’s guide calls the only estate of its type in Westminster.',
      'Most homes here are flats, so the questions are about the building as much as the flat: how it is heated, whether there is a communal boiler or one in each flat, and which parts of the roof and walls belong to the freehold. For a flat in a managed block, the managing agent often holds that information, and asking for it before the visit saves time.',
    ],
    stockReading: (s, london) =>
      `${pct(s.walls.pct.solidUninsulated)} of Westminster’s certificates record solid walls with no added insulation, against ${pct(london.walls.pct.solidUninsulated)} across London. Communal heating is recorded on ${pct(s.heating.pct.communal)}, against ${pct(london.heating.pct.communal)}, and ${pct(s.age.pct.pre1930)} of certificates are for homes built before 1930, against ${pct(london.age.pct.pre1930)}.`,
    coverage: 'Pimlico, Victoria, Westminster and Millbank, Belgravia, Knightsbridge, Mayfair, Marylebone, Soho, Covent Garden, Fitzrovia, Paddington, Bayswater, Maida Vale, St John’s Wood, Regent’s Park and Queen’s Park.',
    council: [
      {
        id: 'westminster-licensing',
        heading: 'Letting in Westminster: selective, additional and mandatory licences',
        paragraphs: [
          'Westminster’s selective licensing scheme came into effect on 24 November 2025. It applies to privately rented homes let to a single household, a single tenant or two people sharing, in 15 of the city’s 18 wards. HMOs already covered by the mandatory or additional schemes are left out. Pimlico South, St James’s and Vincent Square are the three wards outside the scheme.',
          'Additional HMO licensing covers shared houses and flats where three or more people from two or more households share a kitchen or bathroom, across the whole city. The council’s notice gave 31 August 2026 as the start of the renewed scheme, which runs for five years.',
          'A selective licence costs £995, paid as £543 on application and £452 when the licence is granted. The council’s fees page takes the EPC into account: 20% off the second payment, £90.40, for a rating of B or above, and 10%, £45.20, for a C. Its HMO fee page, at £1,540 for up to five bedrooms, lists the same two bands at 20% and 10% off the second payment.',
        ],
        list: {
          intro: 'The 15 wards in the selective scheme, in two designations:',
          items: ['Abbey Road', 'Church Street', 'Harrow Road', 'Knightsbridge and Belgravia', 'Little Venice', 'Maida Vale', 'Queen’s Park', 'Westbourne', 'Bayswater', 'Hyde Park', 'Lancaster Gate', 'Marylebone', 'Pimlico North', 'Regent’s Park', 'West End'],
        },
        sources: [westminster.selective, westminster.need, westminster.fees, westminster.hmoFees, westminster.additional],
      },
      {
        id: 'westminster-conservation',
        heading: 'Conservation areas and Article 4 in Westminster',
        paragraphs: [
          'The council counts 56 conservation areas in Westminster. In them you need planning permission for demolition and for some alterations or extensions that do not need it outside a conservation area.',
          'On top of that, the council has removed permitted development rights for minor alterations on named streets and estates: Abbey Gardens, Bridstow Place, Bristol Gardens, Moncorvo Close, Queen’s Park Estate, Relton Mews and Sussex Gardens. Its Article 4 page links a document for each. A separate direction has covered basement development across the whole city since 31 July 2016.',
        ],
        sources: [westminster.conservation, westminster.article4],
      },
      {
        id: 'westminster-queens-park',
        heading: 'Queen’s Park Estate: windows on a Victorian cottage estate',
        paragraphs: [
          'The council’s design guide says the Queen’s Park Estate was designed in 1873 for the Artizans, Labourers and General Dwellings Company, first by Robert Austin and later by Roland Plumbe. It calls the estate a remarkably complete example of a cottage estate, and gives 1978 as the year it became a conservation area.',
          'On windows, the guide asks for original sashes to be repaired rather than replaced, and says secondary glazing can be installed behind the traditional windows for insulation. It rejects uPVC and aluminium units. The guide is an older document that refers to Unitary Development Plan policy, and it advises checking the current position with the council before any work.',
        ],
        sources: [westminster.queensPark],
      },
    ],
    faqs: (s) => [
      {
        q: 'Does a better EPC lower the Westminster licence fee?',
        a: 'Yes, on the second payment. For a selective licence the council lists 20% off Part B, £90.40, for a rating of B or above and 10%, £45.20, for a C. Its HMO fee page shows the same two bands. The same table lists a separate 10% off for accredited landlords.',
        links: [{ label: 'Westminster selective licence fees', href: westminster.fees.url, external: true }],
      },
      {
        q: 'Which Westminster wards are outside selective licensing?',
        a: 'Pimlico South, St James’s and Vincent Square. The other 15 wards are covered. A shared property in those three wards can still need an HMO licence, and the council has a ward finder for an address.',
        links: [{ label: 'Westminster: do I need a licence?', href: westminster.need.url, external: true }],
      },
      {
        q: 'Does a flat share in Westminster need an HMO licence?',
        a: 'If three or more people from two or more households share a kitchen or bathroom, the additional licensing scheme applies across the city. The council’s notice gave 31 August 2026 as the start of the renewed scheme, which runs for five years.',
        links: [{ label: 'Westminster additional HMO licensing', href: westminster.additional.url, external: true }],
      },
      {
        q: 'What does the council say about replacing windows on the Queen’s Park Estate?',
        a: 'Its design guide asks for original sash windows to be repaired where possible, suggests secondary glazing behind them for insulation, and rules out uPVC and aluminium replacements. The guide is dated, so confirm with the council before ordering anything.',
        links: [{ label: 'Queen’s Park Estate design guide (PDF)', href: westminster.queensPark.url, external: true }],
      },
      ...districtFaq(s, 'Westminster'),
    ],
  },

  hackney: {
    districtNames: {
      N16: 'Stoke Newington',
      E8: 'Dalston, London Fields and Haggerston',
      E5: 'Clapton',
      N1: 'Hoxton and De Beauvoir',
      E9: 'Homerton, Hackney Wick and Victoria Park',
      N4: 'Brownswood and Woodberry Down',
      E2: 'Haggerston and Hoxton',
      EC2A: 'Shoreditch',
      EC1V: 'Old Street',
    },
    neighbours: ['islington', 'haringey', 'waltham-forest', 'newham', 'tower-hamlets', 'city-of-london'],
    standout: (s, london) =>
      `${pct(s.ratings.pct.AtoC)} of Hackney’s certificates are rated A to C, against ${pct(london.ratings.pct.AtoC)} across London, the ${rankLabel('hackney', (b) => b.ratings.pct.AtoC)} highest share of ${boroughCount} boroughs. Among privately rented homes, ${pct(s.privateRented.pctBelowC)} are rated below C, against ${pct(london.privateRented.pctBelowC)}.`,
    stock: [
      'Hackney is mostly Victorian terraces now split into flats, Georgian squares such as Clapton Square, and ex-council estates from the 1930s onwards, with newer blocks around Hackney Wick, Dalston and Shoreditch. The council describes De Beauvoir Town as the first large-scale housing development in Hackney built to a formal plan, from the 1830s.',
      'In a terrace divided into a flat per floor, two flats in the same building can have different roofs, floors and boilers, so the upper and lower flats can differ. Receipts and photos for a new boiler, glazing or loft insulation are worth finding. In the estates and newer blocks, ask the managing agent whether heating is communal.',
    ],
    stockReading: (s, london) =>
      `${pct(s.age.pct.pre1930)} of Hackney’s certificates are for homes built before 1930, against ${pct(london.age.pct.pre1930)} across London, and ${pct(s.age.pct.from1991to2011)} date from 1991 to 2011, against ${pct(london.age.pct.from1991to2011)}. Mains gas heats ${pct(s.heating.pct.mainsGas)}, below the London figure of ${pct(london.heating.pct.mainsGas)}, and ${pct(s.walls.pct.solidUninsulated)} record solid walls with no added insulation.`,
    coverage: 'Stoke Newington, Dalston, Clapton, Homerton, Hackney Central, Hackney Wick, London Fields, Haggerston, Hoxton, Shoreditch, De Beauvoir and Brownswood.',
    council: [
      {
        id: 'hackney-licensing',
        heading: 'Letting in Hackney: the licences from May 2026',
        paragraphs: [
          'Hackney has three licence types. A selective licence is needed for a home let to one household, one tenant or two sharers, in 17 wards. An additional HMO licence covers shared homes of three or four people from two or more households who share a kitchen or bathroom, and a mandatory HMO licence covers five or more. A home outside the 17 wards can still need an HMO licence.',
          'The council lists a selective licence at £925, paid as £555 on application and £370 once the licence is approved. Additional and mandatory HMO licences are £1,400, as £840 and £560. Its discounts include £100 off Part B for an EPC of B or above and £50 off Part B for a C. The council’s page gave 1 May 2026 as the date it would start processing selective and additional HMO applications.',
          'The application asks for a gas safety certificate. Floor plans of the whole property, an electrical report and the tenancy agreement are listed as ways to avoid delays.',
        ],
        list: {
          intro: 'The 17 wards where a selective licence is needed:',
          items: ['Brownswood', 'Cazenove', 'Clissold', 'Dalston', 'De Beauvoir', 'Hackney Central', 'Hackney Downs', 'Hackney Wick', 'Homerton', 'King’s Park', 'Lea Bridge', 'London Fields', 'Shacklewell', 'Springfield', 'Stamford Hill West', 'Stoke Newington', 'Victoria'],
        },
        sources: [hackney.check, hackney.apply, hackney.news],
      },
      {
        id: 'hackney-conservation',
        heading: 'Conservation areas and Article 4 in Hackney',
        paragraphs: [
          'Hackney’s conservation area list runs from Albion Square to Well Street, and takes in Victoria Park, Clapton Square, Stoke Newington and the Regent’s Canal. Not every area carries extra controls, so the answer depends on the street.',
          'De Beauvoir has an Article 4 Direction, made on 7 July 2008 and approved by the Secretary of State on 27 November 2008. It brings under planning control changes to windows, front doors, railings, plasterwork and doorcases, painting the outside, gates, walls and fences, roof alterations including chimneys, porches, hard surfaces and satellite dishes. The council says not every property in De Beauvoir is affected and points owners to its Article 4 property database.',
          'Its list also flags Article 4 Directions for St Mark’s, Beck Road and Brownswood. For the last two the council says it has made non-immediate directions, to protect features such as original windows and doors.',
        ],
        sources: [hackney.conservation, hackney.deBeauvoir, hackney.beck, hackney.brownswood],
      },
      {
        id: 'hackney-streets',
        heading: 'How Hackney describes its older streets',
        paragraphs: [
          'The council’s conservation area pages give a picture of the older stock. Beck Road, designated on 19 July 2021, is a well-preserved street of late Victorian terraces that are largely uniform. Brownswood, designated on 24 February 2020, is a late Victorian suburb with a clear hierarchy of housing types set out from the 1860s.',
          'Elsewhere the list describes the semi-detached villas of Albion Square, the heritage of Clapton Square, mid-Victorian terraced houses in Queensbridge Road and a late-Victorian residential estate in Northwold and Cazenove. If an EPC recommendation would change the front windows, doors or roof on one of these streets, the council’s planning duty desk is the contact listed on those pages.',
        ],
        sources: [hackney.conservation, hackney.beck, hackney.brownswood],
      },
    ],
    faqs: (s) => [
      {
        q: 'Does my Hackney rental need a selective licence?',
        a: 'If it is in one of 17 listed wards, from Brownswood and Cazenove to Victoria, and let to one household, one tenant or two sharers, yes. Outside those wards you do not need a selective licence, but a shared home of three or more can need an additional or mandatory HMO licence.',
        links: [{ label: 'Hackney: which licence you need', href: hackney.check.url, external: true }],
      },
      {
        q: 'Does a good EPC lower the Hackney licence fee?',
        a: 'The council lists £100 off Part B for an EPC of B or above and £50 off Part B for a C. Selective licences are £925 in total and HMO licences £1,400, before discounts. The council’s full fee schedule has the conditions.',
        links: [{ label: 'Hackney: apply for a property licence', href: hackney.apply.url, external: true }],
      },
      {
        q: 'Do I need a floor plan to apply for a Hackney licence?',
        a: 'It is not on the list of required items, but the council says floor plans of the entire property help you avoid delays. Its required items include a gas safety certificate. An electrical report, an emergency lighting certificate for mandatory HMOs and the tenancy agreement sit in the same list as floor plans, as things that help avoid delays.',
        links: [{ label: 'Hackney: what the application needs', href: hackney.apply.url, external: true }, { label: 'Our floor plans', href: '/services/floor-plans' }],
      },
      {
        q: 'Can I change the windows in De Beauvoir?',
        a: 'Not without planning permission, for the properties the direction covers. The De Beauvoir Article 4 Direction brings changes to windows, front doors, railings and similar features under planning control, though not every property in the area is affected. The council’s Article 4 property database confirms an address.',
        links: [{ label: 'Hackney: De Beauvoir conservation area', href: hackney.deBeauvoir.url, external: true }],
      },
      ...districtFaq(s, 'Hackney'),
    ],
  },

  southwark: {
    districtNames: {
      SE1: 'Bankside, Borough and Bermondsey',
      SE15: 'Peckham and Nunhead',
      SE16: 'Rotherhithe and Surrey Quays',
      SE5: 'Camberwell',
      SE22: 'East Dulwich',
      SE17: 'Walworth and Elephant and Castle',
      SE21: 'Dulwich',
      SE24: 'Herne Hill',
      SE19: 'Crystal Palace and Upper Norwood',
    },
    neighbours: ['city-of-london', 'lambeth', 'lewisham', 'bromley', 'tower-hamlets'],
    standout: (s) => {
      const { top, bottom } = spread(s)
      const gap = Math.round(top.pctAtoC - bottom.pctAtoC)
      return `Southwark’s districts sit far apart: ${top.district} has ${pct(top.pctAtoC)} rated A to C from ${fmt(top.n)} certificates, and ${bottom.district} has ${pct(bottom.pctAtoC)} from ${fmt(bottom.n)}, a gap of about ${gap} percentage points.`
    },
    stock: [
      'The north of Southwark is riverside warehouses turned into flats and a run of newer towers at Bankside, London Bridge and Rotherhithe. Walworth, the Old Kent Road and Peckham have post-war estates beside Victorian terraces, while East Dulwich, Dulwich and Herne Hill have larger Victorian and Edwardian houses. Southwark’s own conservation area list picks out social housing from the 1890s, tenement blocks with workshops behind them, and a small garden suburb from the 1920s.',
      'A tenement flat, a cottage and a riverside tower sit in the same borough and are assessed on different things. In estates and towers, the heating system and who controls it often count for more than the walls. For a house in the south of the borough, loft depth, glazing and any extension carry more weight, and receipts or photos for each are worth finding.',
    ],
    stockReading: (s, london) =>
      `${pct(s.age.pct.from1991to2011)} of Southwark’s certificates are for homes built from 1991 to 2011, against ${pct(london.age.pct.from1991to2011)} across London, and ${pct(s.walls.pct.systemBuilt)} record system-built walls, against ${pct(london.walls.pct.systemBuilt)}. Insulated cavity walls are recorded on ${pct(s.walls.pct.cavityInsulated)}, above the London figure of ${pct(london.walls.pct.cavityInsulated)}.`,
    coverage: 'Bankside, Borough, Bermondsey, London Bridge, Rotherhithe, Surrey Quays, Walworth, Elephant and Castle, Camberwell, Peckham, Nunhead, East Dulwich, Dulwich, Herne Hill and Upper Norwood.',
    council: [
      {
        id: 'southwark-licensing',
        heading: 'Letting in Southwark: mandatory, additional and selective licences',
        paragraphs: [
          'Southwark runs all three types. Mandatory licensing covers HMOs of five or more tenants forming more than one household. Additional licensing covers HMOs let to a maximum of four people with shared bathrooms or kitchens, section 257 HMOs, and flats in multiple occupation in a purpose-built block of three or more flats. Selective licensing covers other privately rented properties in the council’s selective licensing wards.',
          'The selective wards are set out in four designations. Licences usually last five years, and the council gives only one or three years where there is evidence of poor management or other housing problems.',
          'From 1 April 2026 the council’s fees page lists a selective licence at £945, paid as £661.50 and £283.50. An additional licence is £1,433 and a mandatory licence £1,653.50 for the first five lettings, plus £110 for each letting above five. The page lists a 50% discount on the second payment for Gold Standard Charter landlords.',
          'The licence conditions list minimum energy efficiency standards among the rules a licence holder must comply with.',
        ],
        list: {
          intro: 'The wards in the four selective licensing designations:',
          items: ['Champion Hill', 'Newington', 'Faraday', 'Goose Green', 'St Giles', 'North Walworth', 'Nunhead and Queens Road', 'Old Kent Road', 'Peckham', 'Camberwell Green', 'Chaucer', 'Dulwich Hill', 'Dulwich Wood', 'London Bridge and West Bermondsey', 'Peckham Rye', 'Rotherhithe', 'Rye Lane', 'South Bermondsey', 'Surrey Docks'],
        },
        sources: [southwark.overview, southwark.mandatory, southwark.additional, southwark.selective, southwark.fees, southwark.conditions],
      },
      {
        id: 'southwark-conservation',
        heading: 'Conservation areas and Article 4 in Southwark',
        paragraphs: [
          'Southwark has 48 conservation areas. The council says you need planning permission there to make minor roof alterations, change windows or install satellite dishes, and that you must give six weeks’ written notice before tree work.',
          'An Article 4 direction covers several of the conservation areas, so alterations that would otherwise be permitted need planning permission. The council’s list says the Sunray Estate direction was confirmed by the Secretary of State on 13 November 1987, and its Cobourg Road entry links a draft Article 4 direction.',
          'A property licence is not planning permission. The council says you need planning permission to let a property as an HMO to seven or more people, or to use it as an HMO at all if it is in an Article 4 direction area.',
        ],
        sources: [southwark.conservation, southwark.restrictions, southwark.list, southwark.article4, southwark.mandatory],
      },
      {
        id: 'southwark-estates',
        heading: 'Estates and cottages: Liverpool Grove, Pullens and Sunray',
        paragraphs: [
          'Three of the council’s conservation area entries describe estate housing. The Liverpool Grove area began in the 1890s as social housing, with two-storey terraced cottages and three-storey tenements. The Pullens Estate is late 19th-century four-storey tenement buildings with two-storey workshops attached at the back.',
          'The Sunray Estate on Denmark Hill, built between 1920 and 1922, is cottage housing in a uniform layout that the council calls a good example of a small garden suburb. Dulwich Wood, by contrast, has 20th-century estates built where most of the Victorian houses were demolished, and the council says some of them date from the 1960s or 1970s.',
        ],
        sources: [southwark.list, southwark.article4],
      },
    ],
    faqs: (s) => [
      {
        q: 'Which Southwark wards need a selective licence?',
        a: 'The council names its wards across four designations, among them Peckham, Camberwell Green, Rotherhithe, Dulwich Hill and Old Kent Road. Properties already covered by mandatory or additional licensing do not need a selective licence as well. Southwark has an interactive map to check an address.',
        links: [{ label: 'Southwark selective licensing', href: southwark.selective.url, external: true }],
      },
      {
        q: 'How much is a Southwark licence?',
        a: 'From 1 April 2026 the council lists £945 for selective and £1,433 for additional, with mandatory at £1,653.50 for the first five lettings. Each is paid in two parts, one on application and one on approval. Gold Standard Charter landlords get 50% off the second part.',
        links: [{ label: 'Southwark licence fees', href: southwark.fees.url, external: true }],
      },
      {
        q: 'Do Southwark licence conditions mention energy efficiency?',
        a: 'Yes. The council lists minimum energy efficiency standards among the rules the licence holder must comply with, alongside electrical safety, PAT testing and fire safety. The conditions differ by licence type and, for selective licences, by designation.',
        links: [{ label: 'Southwark licence conditions', href: southwark.conditions.url, external: true }],
      },
      {
        q: 'Do I need planning permission to change windows in a Southwark conservation area?',
        a: 'Yes. Southwark lists changing windows, minor roof alterations and satellite dishes as needing planning permission in a conservation area. Some areas also have an Article 4 direction, so check the address before ordering work.',
        links: [{ label: 'Southwark conservation area restrictions', href: southwark.restrictions.url, external: true }],
      },
      ...districtFaq(s, 'Southwark'),
    ],
  },

  richmond: {
    districtNames: {
      TW1: 'Twickenham and St Margarets',
      TW2: 'Twickenham, Whitton and Strawberry Hill',
      TW9: 'Richmond and Kew',
      TW11: 'Teddington',
      TW12: 'Hampton and Hampton Hill',
      TW10: 'Ham and Petersham',
      SW14: 'Mortlake and East Sheen',
      SW13: 'Barnes',
    },
    neighbours: ['hounslow', 'hammersmith-fulham', 'wandsworth', 'merton', 'kingston'],
    standout: (s, london) => {
      const big = s.sizeBands.find((b) => b.id === 'over-115')?.pct ?? 0
      return `The typical Richmond home is ${s.floorArea.median} m², against ${london.floorArea.median} m² across London, and ${pct(big)} of its certificates are for homes over 115 m². Flats and maisonettes are ${pct(s.pctFlats)} of the total, against ${pct(london.pctFlats)} across London.`
    },
    stock: [
      'Richmond is a chain of riverside villages. Georgian and Victorian terraces cluster around Richmond, Kew and Twickenham, Edwardian and interwar houses fill Teddington, Hampton and East Sheen, and large detached houses sit near the Park and the Common. Flats are mostly in converted villas and above town-centre shops.',
      'Big old houses collect alterations: loft conversions, rear extensions and windows from several decades. Receipts, installer certificates or photos for glazing, loft insulation and a boiler change are worth finding before a visit, because they give the visit something to record.',
    ],
    stockReading: (s, london) =>
      `Mains gas heats ${pct(s.heating.pct.mainsGas)} of Richmond’s certificates, against ${pct(london.heating.pct.mainsGas)} across London, and communal heating appears on only ${pct(s.heating.pct.communal)}, against ${pct(london.heating.pct.communal)}. Uninsulated cavity walls are recorded on ${pct(s.walls.pct.cavityUninsulated)}, above the London figure of ${pct(london.walls.pct.cavityUninsulated)}.`,
    coverage: 'Richmond, Kew, Ham, Petersham, Twickenham, St Margarets, Whitton, Strawberry Hill, Teddington, Hampton, Hampton Hill, Barnes, Mortlake and East Sheen.',
    council: [
      {
        id: 'richmond-licensing',
        heading: 'Letting in Richmond: HMO licensing',
        paragraphs: [
          'The licensing pages we read describe mandatory HMO licensing. It applies where five or more occupiers form two or more households, in a house or self-contained flat that is not in a purpose-built block of three or more flats, with shared amenities, rent paid by at least one occupier and the home being their main residence. Operating a licensable HMO without a licence is an offence.',
          'The council’s fee table runs from £1,711 for a three-bedroom HMO to £2,117 for ten or more, split into a fee on application and a £675 fee on grant. The page says the fee structure was introduced on 3 July 2017. Planning permission is separately required for HMOs occupied by seven or more people.',
          'After you apply, you may operate the HMO as if you had a licence until the council decides. Pre-application advice for 90 minutes costs £180 including VAT. Check the council’s licensing pages before letting, since schemes change.',
        ],
        sources: [richmond.hmo, richmond.renters],
      },
      {
        id: 'richmond-conservation',
        heading: 'Conservation areas and Article 4 in Richmond',
        paragraphs: [
          'The council counts 85 conservation areas in the borough, from former villages such as Hampton to town centres and Richmond Park. Each has a conservation area statement, and many have an appraisal.',
          'The council’s register lists Article 4 Directions street by street, among them Cambridge Cottages in Kew, First Cross Road, The Crescent in Barnes and East Sheen Avenue. Where one applies, you must apply for planning permission for extensions, new doors and windows, painting and rendering brickwork, removing chimneys, replacing front gardens and replacing boundary walls with hard surfaces. The council adds that any home in the borough can be subject to one.',
        ],
        sources: [richmond.conservation, richmond.article4],
      },
      {
        id: 'richmond-windows',
        heading: 'Windows, secondary glazing and trickle vents',
        paragraphs: [
          'Richmond’s guidance answers the questions an EPC recommendation raises. It says most conservation areas have traditional timber sash or original crittal windows, and it encourages owners to keep and repair them. It encourages secondary glazing as an unobtrusive way to improve efficiency, and says double or triple glazing can be fitted into timber frames in a way that is unlikely to need planning permission.',
          'Flats and houses converted into flats do not have permitted development rights, so planning permission is always needed to change their doors and windows. The council also notes that trickle vents became mandatory for complete replacement windows from 15 June 2022, with exceptions for listed buildings and conservation areas, and says surface-mounted vents are unlikely to be approved.',
        ],
        sources: [richmond.faq],
      },
    ],
    faqs: (s) => [
      {
        q: 'Does my Richmond HMO need a licence?',
        a: 'Mandatory licensing applies from five occupiers forming two or more households, in a house or a self-contained flat that is not in a purpose-built block of three or more flats, where amenities are shared. The licence fee depends on the number of bedrooms. The council’s page also lists exemptions.',
        links: [{ label: 'Richmond: apply for a HMO licence', href: richmond.hmo.url, external: true }],
      },
      {
        q: 'Can I add secondary glazing in a Richmond conservation area?',
        a: 'The council encourages it. Its guidance calls secondary glazing an unobtrusive option that increases efficiency without replacing original windows. It also says secondary glazing is exempt from the trickle vent rules. Flats have no permitted development rights for windows, so they need planning permission either way.',
        links: [{ label: 'Richmond conservation areas FAQ', href: richmond.faq.url, external: true }],
      },
      {
        q: 'Which Richmond streets have an Article 4 Direction?',
        a: 'The council publishes a register and a list by street, each with its conservation area number. Where a direction applies you must apply for planning permission for work such as new doors and windows or painting brickwork.',
        links: [{ label: 'Richmond Article 4 Directions', href: richmond.article4.url, external: true }],
      },
      {
        q: 'Do I need planning permission for an HMO in Richmond?',
        a: 'The council says planning permission is required for HMOs occupied by seven or more people. A licence is a separate application with its own fee.',
        links: [{ label: 'Richmond: apply for a HMO licence', href: richmond.hmo.url, external: true }],
      },
      ...districtFaq(s, 'Richmond'),
    ],
  },

  havering: {
    districtNames: {
      RM3: 'Harold Hill and Harold Wood',
      RM12: 'Hornchurch and Elm Park',
      RM13: 'Rainham',
      RM7: 'Romford, Rush Green and Mawneys',
      RM11: 'Hornchurch and Emerson Park',
      RM1: 'Romford town centre',
      RM14: 'Upminster',
      RM5: 'Collier Row',
      RM2: 'Gidea Park',
    },
    neighbours: ['barking-dagenham', 'redbridge'],
    standout: (s) =>
      `${pct(s.potential.pctBelowCCouldReachC)} of Havering’s D to G certificates have a potential rating of C or better, the ${rankLabel('havering', (b) => b.potential.pctBelowCCouldReachC)} highest share of ${boroughCount} boroughs. Today ${pct(s.ratings.pct.AtoC)} of its certificates are rated A to C.`,
    stock: [
      'Havering is an outer-London suburb. Romford has a town-centre cluster of flats, but most of the borough is interwar and post-war semis and terraces in Hornchurch, Collier Row, Elm Park and Harold Hill, with larger detached houses in Upminster and around Emerson Park. Newer flats are going up at Rainham and Beam Park.',
      'For a 1930s to 1960s semi, the wall type, whether the cavity has been filled and how deep the loft insulation is come first. An installer’s certificate or dated photos are the evidence worth finding. Many of these houses have also gained a rear extension or a loft room, so say what was added and when.',
    ],
    stockReading: (s, london) =>
      `${pct(s.age.pct.from1930to1966)} of Havering’s certificates are for homes built between 1930 and 1966, against ${pct(london.age.pct.from1930to1966)} across London, and ${pct(s.walls.pct.cavityInsulated)} record insulated cavity walls, against ${pct(london.walls.pct.cavityInsulated)}. Flats and maisonettes are only ${pct(s.pctFlats)} of the total, against ${pct(london.pctFlats)}.`,
    coverage: 'Romford, Gidea Park, Collier Row, Harold Hill, Harold Wood, Hornchurch, Elm Park, Emerson Park, Upminster, Cranham and Rainham.',
    council: [
      {
        id: 'havering-licensing',
        heading: 'Letting in Havering: licensing schemes from 18 March 2026',
        paragraphs: [
          'Two schemes took effect on 18 March 2026 and run to 17 March 2031. Selective licensing covers privately rented homes let to single families or up to two unrelated tenants, in seven of Havering’s 20 wards. Additional HMO licensing covers homes rented to three or four unrelated people who share cooking or washing facilities, in every ward. Mandatory licensing applies to five or more people from two or more households.',
          'The council lists a selective licence at £950, paid as £570 and £380, and an additional licence at £1,400, as £840 and £560. Licences are usually valid for five years. Both carry the same discounts on the second payment: £100 for accredited landlords and £75 for a property with an EPC of C or above.',
          'The EPC discount is only available if all the required supporting documents are provided with the application. The council says it makes two attempts to obtain them before the discount becomes void, and discounts do not apply where a warning letter has been served for failure to license.',
        ],
        list: {
          intro: 'The seven wards in the selective scheme:',
          items: ['Beam Park', 'Harold Wood', 'Rainham and Wennington', 'Rush Green and Crowlands', 'Squirrels Heath', 'St Albans', 'St Edwards'],
        },
        sources: [havering.licensing, havering.launch],
      },
      {
        id: 'havering-conservation',
        heading: 'Conservation areas and Article 4 in Havering',
        paragraphs: [
          'Havering has 11 conservation areas: Corbets Tey, Cranham, Gidea Park, Havering-atte-Bower, Langtons, North Ockendon, RAF Hornchurch, Rainham, Romford, St Andrews and St Leonards.',
          'Three have an Article 4 Direction in place. These are Gidea Park, Havering-atte-Bower and Cranham. At Havering-atte-Bower the council lists planning permission for satellite dishes, and at Cranham for gates, walls, fences and other enclosures.',
        ],
        sources: [havering.conservation, havering.heritage],
      },
      {
        id: 'havering-gidea-park',
        heading: 'Gidea Park: a garden suburb with its own controls',
        paragraphs: [
          'The council says Gidea Park was designated in 1970 and extended in 1989 to include the railway station. Its character comes from Sir Herbert Raphael’s early 20th-century garden suburb, with a variety of houses by well-known architects of the day, and a smaller modern-style development from the interwar years.',
          'On 31 December 2015 the council cancelled five earlier Article 4 Directions and made a single immediate one, confirmed on 24 June 2016. It applies two levels of control, and level 2 is the stronger, so the works that need planning permission depend on which level a house falls in. The council says a planning fee is now payable for applications the direction requires, since 17 January 2018.',
        ],
        sources: [havering.conservation, havering.gidea, havering.gideaOwners],
      },
    ],
    faqs: (s) => [
      {
        q: 'Which Havering wards need a selective licence?',
        a: 'Seven: Beam Park, Harold Wood, Rainham and Wennington, Rush Green and Crowlands, Squirrels Heath, St Albans and St Edwards. It runs from 18 March 2026 to 17 March 2031. Shared homes of three or four people need an additional licence in every ward.',
        links: [{ label: 'Havering: apply for a property licence', href: havering.licensing.url, external: true }],
      },
      {
        q: 'Does an EPC lower the Havering licence fee?',
        a: 'Yes, by £75 off the second payment, for a property rated C or above. It only applies if all required documents come with the application. The full fees are £950 for selective and £1,400 for additional.',
        links: [{ label: 'Havering licence fees and discounts', href: havering.licensing.url, external: true }],
      },
      {
        q: 'What is different about Gidea Park?',
        a: 'It has a single Article 4 Direction, made in December 2015 and confirmed in June 2016, with two levels of control. Planning permission is needed for certain works that would not normally need it. A fee is now charged for those applications.',
        links: [{ label: 'Havering: Article 4 Direction for Gidea Park', href: havering.gidea.url, external: true }],
      },
      {
        q: 'Do Cranham and Havering-atte-Bower have planning controls?',
        a: 'Both have a limited Article 4 Direction. At Cranham the council lists planning permission for gates, walls, fences and other means of enclosure, and at Havering-atte-Bower for satellite dishes.',
        links: [{ label: 'Havering conservation areas', href: havering.heritage.url, external: true }],
      },
      ...districtFaq(s, 'Havering'),
    ],
  },

  sutton: {
    districtNames: {
      SM1: 'Sutton town centre',
      SM5: 'Carshalton',
      SM6: 'Wallington',
      SM2: 'Sutton and Cheam',
      SM3: 'Cheam and North Cheam',
      KT4: 'Worcester Park',
      CR0: 'Beddington',
    },
    neighbours: ['croydon', 'merton', 'kingston'],
    standout: (s) => {
      const ratio = s.pctLettings > 0 ? (s.pctSales / s.pctLettings).toFixed(1) : null
      return `Sutton is a sales-led borough: ${pct(s.pctSales)} of its certificates are for marketed sales and ${pct(s.pctLettings)} for lettings${ratio ? `, so sales outnumber lettings by about ${ratio} to 1` : ''}. ${fmt(s.privateRented.n)} certificates were lodged for privately rented homes.`
    },
    stock: [
      'Sutton is mostly interwar and post-war suburb: semis and short terraces in Cheam, Carshalton and Wallington, the London County Council’s St Helier Estate in the north, and blocks around Sutton town centre. Hackbridge has the BedZED development. The Sutton Garden Suburb, north of the town centre, dates from the 1910s.',
      'With so many cavity-wall semis, evidence matters. A certificate for a filled cavity, a dated invoice for loft insulation or photos of the work let those improvements be recorded, and give the visit something to record. Many houses have also been extended, so say what was added.',
    ],
    stockReading: (s, london) =>
      `${pct(s.walls.pct.cavityInsulated)} of Sutton’s certificates record insulated cavity walls, against ${pct(london.walls.pct.cavityInsulated)} across London, and only ${pct(s.walls.pct.solidUninsulated)} record solid walls with no added insulation, against ${pct(london.walls.pct.solidUninsulated)}. Homes built between 1930 and 1966 are ${pct(s.age.pct.from1930to1966)}, against ${pct(london.age.pct.from1930to1966)}.`,
    coverage: 'Sutton, Cheam, North Cheam, Carshalton, Wallington, Beddington, Hackbridge, St Helier and Worcester Park.',
    council: [
      {
        id: 'sutton-licensing',
        heading: 'Letting in Sutton: mandatory and additional HMO licences',
        paragraphs: [
          'Sutton says it runs two licensing schemes. Mandatory licensing applies to any property with five or more unrelated occupiers forming more than one household and sharing amenities. Additional licensing is now fully live and covers the whole borough, so an HMO below that five-person line also needs a licence.',
          'The council’s fee is £319.40 per let for both schemes, and licences are issued for up to five years. A £300 penalty fee applies where no application was made and the property is later discovered, and one may be charged if a complete application is not provided within 28 days.',
          'For each HMO the licence holder must produce a gas safety certificate, proof the electrical installation and appliances are safe, working smoke alarms, a written statement of terms for each occupier, a fire risk assessment, a current floor plan and accurate measurements for all rooms.',
        ],
        sources: [sutton.hmo, sutton.apply],
      },
      {
        id: 'sutton-article4',
        heading: 'Article 4 Directions in Sutton',
        paragraphs: [
          'The council says it has three Article 4 Directions in place, plus a borough-wide one for HMOs. Converting an existing dwelling to an HMO, of any size, now needs planning permission. That direction was made on 22 February 2024 and confirmed on 26 November 2024.',
          'The others cover offices converting to homes in Sutton town centre, confirmed in 2014, and roof alterations on a number of properties, confirmed in 1984. For those roof properties a planning application is needed for extensions, dormer windows and other roof alterations. One more covers certain houses in the Sutton Garden Suburb.',
        ],
        sources: [sutton.article4],
      },
      {
        id: 'sutton-garden-suburb',
        heading: 'Sutton Garden Suburb: windows and original features',
        paragraphs: [
          'The Garden Suburb conservation area was designated in 1989 and covers 8.4 hectares. The council’s Article 4 Direction applies to houses on Meadow Close, Woodend, Hawthorne Close, Horse Shoe Green, Oaks Close and Greenhill, and was confirmed in 2007. The 2006 appraisal says seventy-nine houses had been started on site between 1912 and 1914 to Cavendish Pearson’s plans, and that the government stopped house building in 1915.',
          'On windows, the appraisal says the originals are painted softwood timber, that many have been replaced, and that maintenance and insulation issues make timber windows less appealing to owners. It suggests insulation strips and internal glazing as ways to insulate timber windows. The appraisal is from 2006, so confirm the current position with the council.',
        ],
        sources: [sutton.gardenSuburb, sutton.article4],
      },
    ],
    faqs: (s) => [
      {
        q: 'Does a house share of three or four people in Sutton need a licence?',
        a: 'Yes. Sutton’s additional licensing scheme is fully live and covers the whole borough, so an HMO below the five-person mandatory threshold needs a licence. The fee is £319.40 per let for both schemes.',
        links: [{ label: 'Sutton: houses in multiple occupation', href: sutton.hmo.url, external: true }],
      },
      {
        q: 'What does a Sutton HMO licence application need?',
        a: 'A gas safety certificate, proof the electrics and appliances are safe, working smoke alarms, a written statement of terms for each occupier, a fire risk assessment, a current floor plan and accurate measurements for all rooms.',
        links: [{ label: 'Sutton: apply for an HMO licence', href: sutton.apply.url, external: true }, { label: 'Our floor plans', href: '/services/floor-plans' }],
      },
      {
        q: 'Do I need planning permission to turn a Sutton house into an HMO?',
        a: 'Yes. Sutton’s borough-wide Article 4 Direction, confirmed on 26 November 2024, means converting an existing dwelling to an HMO needs planning permission, regardless of size. A licence is a separate application.',
        links: [{ label: 'Sutton Article 4 Directions', href: sutton.article4.url, external: true }],
      },
      {
        q: 'Can I replace windows in the Sutton Garden Suburb?',
        a: 'On the named roads, probably not without permission. The Article 4 Direction withdraws permitted development rights for certain alterations to houses on Meadow Close, Woodend, Hawthorne Close, Horse Shoe Green, Oaks Close and Greenhill. The 2006 appraisal lists window replacement among the removed rights.',
        links: [{ label: 'Sutton Article 4 Directions', href: sutton.article4.url, external: true }],
      },
      ...districtFaq(s, 'Sutton'),
    ],
  },
}
