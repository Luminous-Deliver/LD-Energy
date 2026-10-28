import type { AreaSummary } from './borough-stats-types'
import type { AreaLocal, CouncilSource } from './area-local'
import { boroughCount, fmt, pct, rankLabel } from './area-page'

/**
 * Batch D2a hand-written local content: Ealing, Lewisham, Hounslow, Islington, Barnet, Haringey. Council facts come
 * from each council's own pages, read on `CHECKED`; a fact that could not be confirmed there is left out. Figures are
 * never typed here: each sentence that needs one takes it from lib/borough-stats.ts through `s` (this area) and
 * `london`. Quotes behind every council claim are in
 * projects/ld-energy-redesign-2026-10/research/areas-d2a-sources-2026-10-28.md.
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

const ealing = {
  types: src('Ealing Council, types of property licences', 'https://www.ealing.gov.uk/info/201086/housing/3306/private_rented_properties/8'),
  schedule: src('Ealing Council, private rented property licensing schedule of fees and charges', 'https://www.ealing.gov.uk/download/downloads/id/20113/schedule_of_fees_and_charges.pdf'),
  fees: src('Ealing Council, licensing fees 2026 to 2027', 'https://www.ealing.gov.uk/download/downloads/id/19500/licensing_fees_2025_to_2026.pdf'),
  article4: src('Ealing Council, Article 4 Directions', 'https://www.ealing.gov.uk/info/201158/conservation_areas/343/about_conservation_areas/2'),
  management: src('Ealing Council, management within conservation areas', 'https://www.ealing.gov.uk/info/201158/conservation_areas/343/about_conservation_areas/1'),
  brentham: src('Ealing Council, Brentham Garden Estate conservation area character appraisal, March 2008', 'https://www.ealing.gov.uk/download/downloads/id/2091/brentham_garden_estate_area_appraisal.pdf'),
  hangerHill: src('Ealing Council, Hanger Hill Garden Estate conservation area update, July 2020', 'https://www.ealing.gov.uk/download/downloads/id/17287/hanger_hill_garden_estate_ca_update_addendum_july_2020.pdf'),
  bedfordPark: src('Hounslow Council, Bedford Park conservation area appraisal', 'https://www.hounslow.gov.uk/downloads/file/13323/bedford-park-conservation-area-appraisal'),
}

const lewisham = {
  selective: src('Lewisham Council, selective licensing', 'https://lewisham.gov.uk/selectivelicensing'),
  hmo: src('Lewisham Council, which HMOs need a licence', 'https://lewisham.gov.uk/myservices/housing/private-tenants-and-landlords/landlords/hmo/which-houses-in-multiple-occupation--hmos--need-a-licence'),
  article4: src('Lewisham Council, Article 4 directions in conservation areas', 'https://lewisham.gov.uk/myservices/planning/conservation/article-4-directions'),
  areas: src('Lewisham Council, conservation areas', 'https://lewisham.gov.uk/myservices/planning/conservation/conservation-areas'),
  blackheath: src('Lewisham Council, Blackheath conservation area', 'https://lewisham.gov.uk/myservices/planning/conservation/conservation-areas/blackheath-conservation-area'),
  telegraphHill: src('Lewisham Council, Telegraph Hill conservation area', 'https://lewisham.gov.uk/myservices/planning/conservation/conservation-areas/telegraph-hill-conservation-area'),
  brockley: src('Lewisham Council, Brockley conservation area', 'https://lewisham.gov.uk/myservices/planning/conservation/conservation-areas/brockley-conservation-area'),
}

const hounslow = {
  hmo: src('Hounslow Council, HMO licensing introduction', 'https://www.hounslow.gov.uk/houses-multiple-occupation/hmo-licensing'),
  fees: src('Hounslow Council, HMO licence fees and refunds', 'https://www.hounslow.gov.uk/houses-multiple-occupation/hmo-licensing/2'),
  apply: src('Hounslow Council, apply for an HMO licence', 'https://www.hounslow.gov.uk/houses-multiple-occupation/hmo-licensing/3'),
  areas: src('Hounslow Council, conservation areas', 'https://www.hounslow.gov.uk/planning-building/design-conservation/4'),
  faq: src('Hounslow Council, conservation areas FAQ', 'https://www.hounslow.gov.uk/planning-building/design-conservation/5'),
  article4: src('Hounslow Council, Article 4 Directions', 'https://www.hounslow.gov.uk/planning-policy/article-4-directions'),
  retrofit: src('Hounslow Council, permitted development, conservation areas and listed buildings', 'https://www.hounslow.gov.uk/environment/improving-sustainability-home/14'),
  bedfordPark: src('Hounslow Council, Bedford Park conservation area appraisal', 'https://www.hounslow.gov.uk/downloads/file/13323/bedford-park-conservation-area-appraisal'),
  gunnersbury: src('Hounslow Council, Gunnersbury Park conservation area appraisal', 'https://www.hounslow.gov.uk/downloads/file/13331/gunnersbury-park-conservation-area-appraisal'),
}

const islington = {
  types: src('Islington Council, check what type of property licence you need', 'https://www.islington.gov.uk/housing/private-sector-housing/landlords/property-licensing/check-what-type-of-property-licence-you-need'),
  apply: src('Islington Council, how to apply for a property licence', 'https://www.islington.gov.uk/housing/private-sector-housing/landlords/property-licensing/how-to-apply-for-a-property-licence-in-islington'),
  designation2026: src('Islington Council, designation of an area for selective licensing 2026', 'https://www.islington.gov.uk/~/media/sharepoint-lists/public-records/environmentalprotection/information/guidance/20262027/islington-designation-of-an-area-for-selective-licensing-2026.pdf'),
  notice2024: src('Islington Council, public notice, designation of a selective licensing area 2024', 'https://www.islington.gov.uk/~/media/sharepoint-lists/public-records/environmentalprotection/information/adviceandinformation/20232024/2024-public-notice-selective-licensing.pdf'),
  areas: src('Islington Council, conservation areas', 'https://www.islington.gov.uk/planning/designandconservation/conservationareas'),
  permitted: src('Islington Council, permitted development', 'https://www.islington.gov.uk/planning/permitted-development'),
  netZero: src('Islington Council, permitted development guide for net zero works', 'https://www.islington.gov.uk/-/media/sharepoint-lists/public-records/planningandbuildingcontrol/information/adviceandinformation/20242025/islington-nz-pd-guide.pdf?la=en&hash=1A42CFA4E9C609925F9EF081B1DD22D3DD8FF73B'),
}

const barnet = {
  hmo: src('Barnet Council, what are houses in multiple occupation', 'https://www.barnet.gov.uk/housing/private-housing/property-licensing/what-are-houses-multiple-occupation-hmos'),
  selective: src('Barnet Council, selective licensing', 'https://www.barnet.gov.uk/housing/private-housing/property-licensing/selective-licensing'),
  fees: src('Barnet Council, HMO licensing fees and charges', 'https://www.barnet.gov.uk/housing/private-housing/property-licensing/hmo-licence-application/apply-hmo-licence/houses'),
  news: src('Barnet Council, licensing scheme renewed to improve property standards', 'https://www.barnet.gov.uk/news/councils-licensing-scheme-renewed-improve-property-standards'),
  areas: src('Barnet Council, conservation areas', 'https://www.barnet.gov.uk/planning-and-building-control/conservation-and-heritage/conservation-areas'),
  hgsArticle4: src('Barnet Council, Hampstead Garden Suburb Article 4 directions', 'https://www.barnet.gov.uk/planning-and-building-control/conservation-and-heritage/conservation-areas/hampstead-garden-0'),
  hgs: src('Barnet Council, Hampstead Garden Suburb conservation area', 'https://www.barnet.gov.uk/planning-and-building-control/conservation-and-heritage/conservation-areas/hampstead-garden-1'),
  watling: src('Barnet Council, Watling Estate conservation area', 'https://www.barnet.gov.uk/planning-and-building-control/conservation-and-heritage/conservation-areas/watling-estate'),
  railway: src('Barnet Council, Railway Terraces conservation area', 'https://www.barnet.gov.uk/planning-and-building-control/conservation-and-heritage/conservation-areas/railway-terraces'),
  garden: src('Barnet Council, Finchley Garden Village conservation area', 'https://www.barnet.gov.uk/planning-and-building-control/conservation-and-heritage/conservation-areas/finchley-garden-village'),
  smallHmo: src('Barnet Council, small HMO Article 4 Direction', 'https://www.barnet.gov.uk/planning-and-building-control/planning-policies-and-local-plan/small-houses-multiple-occupation-hmo'),
}

const haringey = {
  selective: src('Haringey Council, selective property licensing', 'https://haringey.gov.uk/housing/private-sector-renting/property-licensing/selective-property-licensing'),
  fees: src('Haringey Council, selective property licensing fees and discounts', 'https://haringey.gov.uk/housing/private-sector-renting/property-licensing/selective-property-licensing/selective-property-licensing-fees-discounts'),
  notice: src('Haringey Council, notice of designation of an area for selective licensing 2022', 'https://haringey.gov.uk/sites/default/files/2023-11/notice_of_selective_licensing_designation_final.pdf'),
  apply: src('Haringey Council, applying for a selective property licence', 'https://haringey.gov.uk/housing/private-sector-renting/property-licensing/selective-property-licensing/applying-a-selective-property-licence'),
  hmo: src('Haringey Council, do I need an HMO licence?', 'https://haringey.gov.uk/housing/private-sector-renting/property-licensing/house-multiple-occupation-hmo-licensing/do-i-need-an-hmo-licence'),
  areas: src('Haringey Council, list of conservation areas', 'https://haringey.gov.uk/planning-building-control/planning/planning-policy/design-conservation/conservation-areas/conservation-areas-haringey/list-conservation-areas-haringey'),
  development: src('Haringey Council, development in conservation areas', 'https://haringey.gov.uk/planning-building-control/planning/planning-policy/design-conservation/conservation-areas/development-conservation-areas'),
  article4: src('Haringey Council, Article 4 Directions in Haringey', 'https://haringey.gov.uk/planning-building-control/planning/planning-policy/article-4-directions/article-4-directions-haringey'),
  landlords: src('Haringey Council, planning permission for landlords', 'https://haringey.gov.uk/housing/private-sector-renting/landlords/planning-permission-landlords'),
  noelPark: src('Haringey Council, Noel Park conservation area appraisal and management plan', 'https://haringey.gov.uk/sites/default/files/appendix_1_noel_park_caamp_finalised_3.compressed_0.pdf'),
  towerGardens: src('Haringey Council, Tower Gardens conservation area appraisal and management plan', 'https://haringey.gov.uk/sites/default/files/appendix_6_-_tower_gardens_caamp_compressed.pdf'),
  peabody: src('Haringey Council, Peabody Cottages conservation area appraisal and management plan', 'https://haringey.gov.uk/sites/default/files/appendix_7_-_peabody_cottages_caamp_compressed.pdf'),
}

export const d2aLocal: Record<string, AreaLocal> = {
  ealing: {
    districtNames: {
      W3: 'Acton and East Acton',
      W5: 'Ealing and Brentham',
      UB6: 'Greenford and Perivale',
      UB5: 'Northolt',
      W13: 'West Ealing and Northfields',
      UB1: 'Southall',
      W7: 'Hanwell',
      UB2: 'Southall and Norwood Green',
      W4: 'South Acton and Acton Green',
      NW10: 'Park Royal',
    },
    neighbours: ['brent', 'harrow', 'hillingdon', 'hounslow', 'hammersmith-fulham'],
    standout: (s) => {
      const { top, bottom } = spread(s)
      return `Ealing’s districts sit well apart: ${top.district} has ${pct(top.pctAtoC)} rated A to C from ${fmt(top.n)} certificates, while ${bottom.district} has ${pct(bottom.pctAtoC)} from ${fmt(bottom.n)}. A typical Ealing house is ${s.floorArea.houses} m² and a typical flat ${s.floorArea.flats} m².`
    },
    stock: [
      'Ealing is a patchwork of planned estates. Brentham and Hanger Hill are garden suburbs from different decades, and Bedford Park crosses the border from Hounslow. Acton and Hanwell have older terraces, Northolt and Greenford grew with interwar semis, and Southall and Park Royal mix housing with works and newer blocks.',
      'A house on a garden estate has a front the planners watch closely, but the loft, floor and boiler are not part of that. A flat over a Southall shop or in a Hanwell conversion is its own dwelling, so the roof above it and the heating in it decide more than the postcode.',
    ],
    stockReading: (s, london) =>
      `${pct(s.age.pct.from1930to1966)} of Ealing’s certificates are for homes built between 1930 and 1966, and a further ${pct(s.age.pct.pre1930)} before 1930. ${pct(s.walls.pct.solidUninsulated)} record solid walls with no added insulation, against ${pct(london.walls.pct.solidUninsulated)} across London, and ${pct(s.walls.pct.cavityInsulated)} record insulated cavity walls. Flats and maisonettes are ${pct(s.pctFlats)} of the total.`,
    coverage: 'Acton, East Acton, Ealing, West Ealing, Northfields, Hanwell, Southall, Greenford, Perivale, Northolt and Park Royal.',
    council: [
      {
        id: 'ealing-licensing',
        heading: 'Letting in Ealing: three licences and a ward list',
        paragraphs: [
          'Ealing licenses three kinds of rented home. Mandatory HMO licensing applies when five or more people who are not one household share facilities. The additional scheme, adopted from 1 April 2022, covers HMOs of three or four unrelated people. Selective licensing covers privately rented single-household homes in named wards.',
          'Selective licensing began on 1 April 2022 in East Acton, Southall Broadway and Southall Green, using the ward boundaries from before May 2022. From 3 January 2023 it added Acton Central, Dormers Wells, Greenford Broadway, Greenford Green, Hanger Hill, Hobbayne, Lady Margaret, North Greenford, Northolt Mandeville, Northolt West End, and Perivale and South Acton. The council’s page does not state an end date for either designation.',
          'Ealing’s 2026 to 2027 fee list shows a selective licence at £750, £675 for a self-contained flat, and an additional HMO licence at £1,300. The council’s schedule of fees splits the selective fee into £250 on application and £500 when the licence is ready to be issued. Its schedule headed “Fees 2024” takes £75 off the second part for an accredited landlord and £50 off for a property with an EPC rating of A to C, with a valid EPC supplied, and 10% off selective licences for two or more flats in one building under one owner. The 2026 to 2027 list shows base fees only, so confirm these discounts are still offered.',
        ],
        sources: [ealing.types, ealing.schedule, ealing.fees],
      },
      {
        id: 'ealing-conservation',
        heading: 'Article 4 directions in Ealing’s conservation areas',
        paragraphs: [
          'Ealing has made Article 4 directions in six conservation areas: Bedford Park, Brentham Garden Estate, Churchfields (Half Acre Road), Ealing Town Centre (The Grove), Hanger Hill Garden Estate and Hanger Hill (Haymills) Estate. In most of them planning permission is needed for residential extensions and minor alterations, porches, exterior painting, means of enclosure, vehicular access and hardstandings.',
          'What each direction covers differs. Brentham and Hanger Hill Garden Estate list the replacement of windows and doors, replacement of roof materials and work to a chimney. The Grove adds rendering or pointing and chemical or abrasive cleaning of stone and brick. Churchfields (Half Acre Road) covers only an addition or alteration to a roof. On the Haymills estate the restrictions apply to parts of the site visible from the public highway and include outbuildings at the rear.',
          'Ealing says this does not mean permission will necessarily be refused, only that the council has more control. If an EPC recommendation touches windows, roofs or the front of a house in one of these areas, read the direction for that area before booking the work.',
        ],
        sources: [ealing.article4, ealing.management],
      },
      {
        id: 'ealing-estates',
        heading: 'Garden estates in Ealing: Brentham, Hanger Hill and Bedford Park',
        paragraphs: [
          'Ealing’s 2008 appraisal calls Brentham a pioneer co-partnership suburb, where each tenant took a share in Ealing Tenants Ltd. It has 650 cottages and houses, starting in 1901 with traditional terraces and moving to a more romantic Arts and Crafts style. Raymond Unwin and Barry Parker, the architects of Letchworth Garden City, became involved after the first phase, and the later streets follow Garden City principles.',
          'Ealing’s update on the estate records that Hanger Hill Garden Estate became a conservation area in 1969, and the Conservation Area Panel describes it as one of the first in Britain. It was built between 1928 and 1936, and its 361 houses and 258 flats are all in the Tudor half-timbered style.',
          'Bedford Park crosses a borough boundary. Hounslow’s appraisal says the west side of Woodstock Road and everything westward, including The Avenue, lies in Ealing. Ealing lists Bedford Park among its six Article 4 areas, and Hounslow does the same for its side, so check which council covers the address.',
        ],
        sources: [ealing.brentham, ealing.hangerHill, ealing.bedfordPark, ealing.article4],
      },
    ],
    faqs: (s) => [
      {
        q: 'Does my Ealing rental need a licence?',
        a: 'If it is let to a single household in one of the selective wards, yes. Those start with East Acton, Southall Broadway and Southall Green and run on to a dozen more, including Acton Central, Greenford Broadway and Northolt West End. Shared homes need an additional licence for three or four unrelated people and a mandatory licence for five or more.',
        links: [{ label: 'Ealing types of property licence', href: ealing.types.url, external: true }],
      },
      {
        q: 'Does a good EPC lower the Ealing licence fee?',
        a: 'Ealing’s schedule of fees lists £50 off the second part of the fee for an EPC rating of A to C, and says a valid certificate must be supplied. That schedule is headed 2024. The 2026 to 2027 fee list shows only the base fees, so confirm the discount is still offered before relying on it.',
        links: [{ label: 'Ealing fees and discounts', href: ealing.schedule.url, external: true }],
      },
      {
        q: 'Can I change the windows of a Brentham or Hanger Hill Garden Estate house?',
        a: 'Both estates are under Article 4 directions that list the replacement of windows and doors, and of roof materials, as development needing planning permission. Ealing says that does not mean it will refuse, only that it decides. Read the direction for your area first.',
        links: [{ label: 'Ealing Article 4 Directions', href: ealing.article4.url, external: true }],
      },
      {
        q: 'Is Bedford Park in Ealing or Hounslow?',
        a: 'Both. Hounslow’s appraisal puts the west side of Woodstock Road, and The Avenue, in Ealing. Each council lists Bedford Park among its Article 4 areas, so the planning team to ask depends on the street.',
        links: [{ label: 'Hounslow Bedford Park appraisal', href: ealing.bedfordPark.url, external: true }],
      },
      ...districtFaq(s, 'Ealing'),
    ],
  },

  lewisham: {
    districtNames: {
      SE13: 'Lewisham and Hither Green',
      SE6: 'Catford and Bellingham',
      SE8: 'Deptford',
      SE23: 'Forest Hill',
      SE14: 'New Cross and Telegraph Hill',
      SE26: 'Sydenham',
      SE4: 'Brockley and Crofton Park',
      SE12: 'Lee and Grove Park',
      BR1: 'Downham',
      SE3: 'Blackheath',
    },
    neighbours: ['greenwich', 'bromley', 'southwark'],
    standout: (s, london) =>
      `Private lettings are ${pct(s.pctLettings)} of Lewisham’s certificates and marketed sales ${pct(s.pctSales)}, against ${pct(london.pctLettings)} and ${pct(london.pctSales)} across London. The typical home is ${s.floorArea.median} m², and ${pct(s.pctFlats)} of certificates are for flats or maisonettes.`,
    stock: [
      'Lewisham runs from Georgian and Victorian terraces around Blackheath and Brockley, through the long streets of New Cross and Telegraph Hill, to interwar estates at Downham and Grove Park and new blocks on the Deptford waterfront. Forest Hill and Sydenham climb the slopes toward Crystal Palace.',
      'Much of the flat stock is in converted houses, where one Brockley terrace may hold several flats, each with its own roof, floor and heating. Hither Green, Catford and Lee have more family houses. Which kind of wall, roof and boiler the home has matters far more than the SE code.',
    ],
    stockReading: (s, london) =>
      `${pct(s.walls.pct.systemBuilt)} of Lewisham’s certificates record system-built walls, against ${pct(london.walls.pct.systemBuilt)} across London, and ${pct(s.age.pct.from1967to1990)} are for homes built from 1967 to 1990, against ${pct(london.age.pct.from1967to1990)}. Solid walls with no added insulation are ${pct(s.walls.pct.solidUninsulated)}, and ${pct(s.heating.pct.mainsGas)} are heated by a mains gas boiler.`,
    coverage: 'Lewisham, Catford, Deptford, New Cross, Brockley, Forest Hill, Sydenham, Blackheath, Hither Green, Lee, Grove Park, Downham and Bellingham.',
    council: [
      {
        id: 'lewisham-licensing',
        heading: 'Letting in Lewisham: selective licensing since July 2024',
        paragraphs: [
          'Lewisham’s selective licensing scheme came into effect on 1 July 2024. The council says it covers around 20,000 properties and nearly all privately rented homes not already under the HMO schemes. It explains the scheme is absent from specific wards, naming Telegraph Hill and parts of Blackheath, and points to an interactive map for a single address.',
          'A selective licence costs £640, in two parts: £160 on application and £480 on grant. The council lists discounts for early applications, accredited landlords and eligible charities, taken off the second payment, and says a licence usually lasts five years.',
          'The application asks for an EPC, an electrical installation condition report and a gas safety certificate, or a declaration of no gas supply. Two HMO schemes sit alongside: mandatory licensing for five or more people in more than one household, and an additional scheme in force since 5 April 2022 for three or four people from separate households, and for purpose-built blocks where three or more people who are not one household share a kitchen or bathroom.',
        ],
        sources: [lewisham.selective, lewisham.hmo],
      },
      {
        id: 'lewisham-conservation',
        heading: 'Conservation areas and Article 4 in Lewisham',
        paragraphs: [
          'Lewisham’s list of conservation areas includes Beckenham Place Park, Belmont, Telegraph Hill and Sydenham Thorpes, with entries for Blackheath, Brockley, Forest Hill, Hatcham, Ladywell, Lee Manor and St Stephen’s among others.',
          'The council applies Article 4 directions to many of them, as separate documents. It says they only apply to houses in use as a single dwelling, and that commercial properties and flats have no permitted development rights. Under a direction, external changes visible from public viewpoints need planning permission, including windows, doors, chimneys, roof alterations, porches, hard surfaces, boundary treatments and painting the outside.',
          'The documents include Brockley, Culverley Green, Forest Hill, Hatcham, Ladywell, Lee Manor, Mercia Grove, Perryfields, St Mary’s, St Stephen’s, Halifax Street, and in Blackheath the Belmont, Collins Street, Lee Terrace and Quentin Road directions. Telegraph Hill has one too. For Blackheath, the council’s page tells you to phone or email planning to check whether a particular street is covered.',
        ],
        sources: [lewisham.areas, lewisham.article4, lewisham.blackheath, lewisham.telegraphHill],
      },
      {
        id: 'lewisham-estates',
        heading: 'Blackheath, Telegraph Hill and Brockley in the council’s words',
        paragraphs: [
          'The council says Blackheath, designated jointly with Greenwich in 1968, was London’s first conservation area and is Lewisham’s largest and most diverse. Most buildings date from around 1790 to 1880, the railway arrived in 1849, and the heath lies in the buffer zone of the Greenwich World Heritage Site.',
          'Telegraph Hill was designated in 1990. Its houses were built from 1871 under the Worshipful Company of Haberdashers, who set strict guidelines. Brockley, designated in 1973, is a speculatively developed Victorian suburb: building began in the 1830s, most houses date from the second half of the 19th century, and the detailing includes stucco capitals, tile paths and terracotta.',
          'Lewisham tells tenants in a licensed home to expect the gas safety certificate, the electrical installation condition report and the EPC from their landlord, so a current certificate is part of the licensing paperwork in every selective area.',
        ],
        sources: [lewisham.blackheath, lewisham.telegraphHill, lewisham.brockley, lewisham.selective],
      },
    ],
    faqs: (s) => [
      {
        q: 'Does my Lewisham rental need a selective licence?',
        a: 'Probably, if it is let to a single household and not already under an HMO licence. The scheme started on 1 July 2024 and covers nearly all private lets in the borough, but not Telegraph Hill or parts of Blackheath. Lewisham’s interactive map checks an address.',
        links: [{ label: 'Lewisham selective licensing', href: lewisham.selective.url, external: true }],
      },
      {
        q: 'What does a Lewisham selective licence application ask for?',
        a: 'An EPC, an electrical installation condition report, and a gas safety certificate or a declaration of no gas supply. The fee is £640, paid as £160 on application and £480 on grant.',
        links: [{ label: 'Lewisham application documents', href: lewisham.selective.url, external: true }],
      },
      {
        q: 'Can I replace the windows of a Brockley or Telegraph Hill house?',
        a: 'Both areas have Article 4 directions, so changes to windows and doors visible from public viewpoints need planning permission. Lewisham says flats have no permitted development rights, so the same applies to any flat. Check with the planning team for your street.',
        links: [{ label: 'Lewisham Article 4 directions', href: lewisham.article4.url, external: true }],
      },
      {
        q: 'Is Telegraph Hill covered by selective licensing?',
        a: 'Lewisham says selective licensing is absent from Telegraph Hill and parts of Blackheath, because it only applies where the council can show it is needed. Landlords there may still need an HMO licence for a shared house.',
        links: [{ label: 'Lewisham selective licensing', href: lewisham.selective.url, external: true }],
      },
      ...districtFaq(s, 'Lewisham'),
    ],
  },

  hounslow: {
    districtNames: {
      TW3: 'Hounslow',
      W4: 'Chiswick',
      TW7: 'Isleworth',
      TW13: 'Feltham and Hanworth',
      TW8: 'Brentford',
      TW14: 'Feltham and Bedfont',
      TW4: 'Hounslow West and Cranford',
      TW5: 'Heston and Cranford',
    },
    neighbours: ['hillingdon', 'ealing', 'hammersmith-fulham', 'richmond'],
    standout: (s) => {
      const t = trend(s)
      return `Hounslow’s share rated A to C rose every year in the data, from ${pct(t.from)} in ${t.first} to ${pct(t.to)} in ${t.last}. Only ${fmt(s.privateRented.nFtoG)} of the ${fmt(s.privateRented.n)} privately rented certificates are F or G.`
    },
    stock: [
      'Hounslow reaches from the river at Chiswick, Brentford and Isleworth to the airport edge at Cranford, Heston and Bedfont. Strand on the Green has period houses by the Thames, and the Hounslow side of Bedford Park has Victorian villas. Hounslow, Feltham and Hanworth are mostly interwar and post-war estates, and the Brentford waterfront has newer flats.',
      'A riverside flat and an interwar semi in Feltham are read differently. For the flat, the floor, the roof above and the heating system count. For the semi, evidence that the cavity was filled or the loft topped up helps, and so does the boiler age. Neither depends on the TW code.',
    ],
    stockReading: (s, london) =>
      `${pct(s.walls.pct.cavityInsulated)} of Hounslow’s certificates record insulated cavity walls, against ${pct(london.walls.pct.cavityInsulated)} across London, and ${pct(s.age.pct.from1991to2011)} are for homes built from 1991 to 2011, against ${pct(london.age.pct.from1991to2011)}. Only ${pct(s.age.pct.pre1930)} date from before 1930, and ${pct(s.walls.pct.solidUninsulated)} record solid walls with no added insulation.`,
    coverage: 'Chiswick, Brentford, Isleworth, Hounslow, Hounslow West, Cranford, Heston, Feltham, Hanworth and Bedfont.',
    council: [
      {
        id: 'hounslow-licensing',
        heading: 'Letting in Hounslow: mandatory and additional HMO licensing',
        paragraphs: [
          'Hounslow runs two HMO schemes. Mandatory licensing covers HMOs of five or more people in two or more households sharing facilities. Additional licensing was designated on 11 September 2025 and applies borough-wide from 11 December 2025. It covers HMOs occupied by three or more people in two or more households, and converted-building HMOs where the building and its dwellings are in the same ownership or effectively the same control.',
          'A licence lasts five years, but the council may issue a shorter one, normally one year, if it has concerns about management or the condition of the property or has found deliberate avoidance of licensing. It says a licence is not planning permission, which an HMO may also need.',
          'The fee for a new or renewal licence is a base fee of £1,608, or £1,509 for an accredited landlord, plus £25 for each household in the HMO. The council charges extra for help with measuring rooms and drawing the sketch plan. The discount on that page is for accredited landlords.',
        ],
        sources: [hounslow.hmo, hounslow.fees],
      },
      {
        id: 'hounslow-application',
        heading: 'The sketch plan a Hounslow HMO application asks for',
        paragraphs: [
          'Hounslow’s application asks you to upload tenancy agreements, management contracts, a sketch plan of the property, a current electrical installation report, a gas safety record, fire detection and emergency lighting test reports, certification of fire protection and building regulation completion certificates.',
          'We draw laser-measured floor plans and can measure on the same visit as the EPC. If the plan is for a Hounslow HMO application, say so when you book.',
        ],
        sources: [hounslow.apply, hounslow.fees],
      },
      {
        id: 'hounslow-conservation',
        heading: 'Conservation areas, Article 4 and retrofit in Hounslow',
        paragraphs: [
          'Hounslow’s page says there are currently 29 conservation areas, and that Article 4 directions currently apply to Gunnersbury and Bedford Park. The council’s FAQ adds that permitted development rights do not apply to flats, or to houses converted to flats, so external changes to those need planning permission.',
          'In those two areas the directions cover work on a home that fronts a highway, open space or waterway: alterations to a dwelling, porches, hardstanding, walls, gates and fences, painting the exterior and chimney stacks. Bedford Park’s appraisal records an Article 4(2) direction made on 24 July 2001, and says the original first-phase buildings that remain are listed, mostly Grade II. Gunnersbury Park Estate is described as a complete example of a 1920s garden suburb, with its first houses built in Gunnersbury Lane in 1926.',
          'Hounslow’s retrofit guidance says that in a conservation area, building-mounted solar equipment stays permitted development if it is not on a wall fronting a highway, and so does an air source heat pump if it is not on a wall or roof fronting a highway or nearer the highway than the main building, unless an Article 4 direction or condition has removed the right. For a listed building it names draught-proofing, secondary glazing and underfloor insulation as less invasive measures.',
        ],
        sources: [hounslow.areas, hounslow.faq, hounslow.article4, hounslow.retrofit, hounslow.bedfordPark, hounslow.gunnersbury],
      },
    ],
    faqs: (s) => [
      {
        q: 'Does my Hounslow shared house need a licence?',
        a: 'If three or more people from two or more households live in it, yes. Since 11 December 2025 the additional scheme covers those homes borough-wide, and five or more people need a mandatory licence.',
        links: [{ label: 'Hounslow HMO licensing', href: hounslow.hmo.url, external: true }],
      },
      {
        q: 'What does a Hounslow HMO licence cost?',
        a: 'A base fee of £1,608, or £1,509 for an accredited landlord, plus £25 for each household in the HMO. Help with measuring rooms and a sketch plan costs extra. Tell us at booking if the floor plan is for an application.',
        links: [{ label: 'Hounslow HMO fees', href: hounslow.fees.url, external: true }, { label: 'Our floor plans', href: '/services/floor-plans' }],
      },
      {
        q: 'Can I fit a heat pump or solar panels on a Hounslow house in a conservation area?',
        a: 'Often yes, if the equipment is not on a wall or roof fronting a highway, or for a heat pump nearer the highway than the main building. Gunnersbury and Bedford Park have Article 4 directions that can remove those rights, so ask the planning team first.',
        links: [{ label: 'Hounslow retrofit and planning', href: hounslow.retrofit.url, external: true }],
      },
      {
        q: 'Do I need planning permission to turn a Hounslow house into a small HMO?',
        a: 'Hounslow’s borough-wide Article 4 direction has applied since 4 September 2023 to a change from a dwelling (C3) to a small HMO (C4), with exceptions for open land, industrial areas, Chiswick Business Park, Bedfont Lakes Business Park and the Mogden Sewage Works. A licence is separate.',
        links: [{ label: 'Hounslow Article 4 Directions', href: hounslow.article4.url, external: true }],
      },
      ...districtFaq(s, 'Hounslow'),
    ],
  },

  islington: {
    districtNames: {
      N1: 'Islington, Barnsbury and Angel',
      N7: 'Holloway and Caledonian Road',
      N19: 'Archway and Upper Holloway',
      N5: 'Highbury',
      EC1V: 'Clerkenwell and Finsbury',
      N4: 'Finsbury Park',
      EC1R: 'Clerkenwell',
      WC1X: 'Pentonville',
      N16: 'Newington Green',
      EC1Y: 'Bunhill',
    },
    neighbours: ['camden', 'haringey', 'hackney', 'city-of-london'],
    standout: (s, london) =>
      `${pct(s.pctFlats)} of Islington’s certificates are for flats or maisonettes, the ${rankLabel('islington', (b) => b.pctFlats)} highest share of ${boroughCount} boroughs. The typical home is ${s.floorArea.median} m², against ${london.floorArea.median} m² across London, and a typical house ${s.floorArea.houses} m².`,
    stock: [
      'Islington is mostly flats in Georgian and Victorian terraces. Canonbury, Barnsbury and Highbury have large houses split into homes of every size, Holloway and Finsbury Park have long Victorian streets, and around King’s Cross and Clerkenwell converted warehouses and new blocks sit beside the old terraces. Post-war estates run through Bunhill, Holloway and Finsbury.',
      'In a converted terrace the flat’s own floor, the roof above it and its heating are what carry the rating. The front of the building is often tightly controlled, but internal work is a different question, and the council’s own guide on it is set out below.',
    ],
    stockReading: (s, london) =>
      `${pct(s.walls.pct.solidUninsulated)} of certificates record solid walls with no added insulation, against ${pct(london.walls.pct.solidUninsulated)} across London, and ${pct(s.age.pct.pre1930)} are for homes built before 1930, against ${pct(london.age.pct.pre1930)}. ${pct(s.walls.pct.systemBuilt)} record system-built walls, and ${pct(s.heating.pct.communal)} communal heating, against ${pct(london.heating.pct.communal)}.`,
    coverage: 'Angel, Barnsbury, Canonbury, Highbury, Holloway, Archway, Finsbury Park, Clerkenwell, Finsbury, Pentonville, Newington Green and Tufnell Park.',
    council: [
      {
        id: 'islington-licensing',
        heading: 'Letting in Islington: selective licensing grows to seven more wards',
        paragraphs: [
          'Islington has three kinds of licence. Mandatory HMO licensing covers five or more people in two or more households sharing facilities, and additional HMO licensing covers three or four. Selective licensing covers privately rented homes occupied by one or two people, or by a single household.',
          'Selective licensing is already in place in Finsbury Park, Hillrise and Tollington. That scheme was designated on 19 February 2024, came into force on 20 May 2024 and ceases on 19 May 2029. A second designation, made on 21 August 2026, covers Barnsbury, Caledonian, Highbury, Junction, Laycock, Mildmay and Tufnell Park. It comes into force on 23 November 2026, ceases on 22 November 2031, and online applications opened from 7 September 2026. The council tells landlords in those wards to apply by 23 November 2026.',
          'Islington’s fees page lists a selective licence at £850 for the whole property and a mandatory or additional HMO licence at £900 plus £100 for each bedroom. The fee is paid in two parts: Part A when you apply and Part B if the licence is granted. Discounts come off Part B: £50 for an EPC rating of A, B or C, £75 for an accredited landlord and £25 for renewing without a gap, and they add together. The application asks for room sizes, floor plans and an EPC among its documents.',
        ],
        sources: [islington.types, islington.apply, islington.designation2026, islington.notice2024],
      },
      {
        id: 'islington-conservation',
        heading: 'Conservation areas and Article 4 in Islington',
        paragraphs: [
          'Islington has 42 conservation areas, and the council has removed permitted development rights in 40 of them with an Article 4 direction. Its page says you may need planning permission for minor alterations or home improvements such as changing external doors and windows or painting brickwork. The council also wants six weeks’ written notice before pruning or felling a tree in a conservation area.',
          'The council’s net zero guide lists the conservation areas where the right to replace front windows is removed: Aberdeen Park, Arlington Square, Barnsbury, Calabria Road, Canonbury, Cross Street, Duncan Terrace/Colebrooke Row, East Canonbury, Highbury New Park, Hillmarton, Keystone Crescent, Mercers Road/Tavistock Terrace, New River, Sotheby Road, St John’s Grove, St Mary Magdalene, Tollington Park, Tufnell Park and Whitehall Park. At Keystone Crescent the right is also removed for the rear. The guide is an older document, so check a street on the council’s interactive map.',
        ],
        sources: [islington.areas, islington.permitted, islington.netZero],
      },
      {
        id: 'islington-retrofit',
        heading: 'What Islington says about windows, insulation and solar',
        paragraphs: [
          'The net zero guide says replacing windows in a flat, maisonette or block of flats is not permitted development and needs planning permission. For a house it treats swapping single glazing for double or triple glazing as permitted development if the conditions are met, and says a composite window may replace a timber one if it looks similar.',
          'On insulation, the guide says internal wall insulation is not considered development and needs no planning permission for a residential building, though a listed building needs listed building consent. External insulation is likelier to need permission, because many Islington homes are brick and the guide considers it unlikely an external system could match the original.',
          'For solar, the council prefers panels that cannot be seen from public views, particularly in conservation areas, and says panels on a wall fronting a highway in a conservation area need planning permission.',
        ],
        sources: [islington.netZero],
      },
    ],
    faqs: (s) => [
      {
        q: 'Which Islington wards need a selective licence?',
        a: 'Finsbury Park, Hillrise and Tollington now, and from 23 November 2026 also Barnsbury, Caledonian, Highbury, Junction, Laycock, Mildmay and Tufnell Park. It covers rented homes with one or two occupants or a single household. HMOs have their own licences.',
        links: [{ label: 'Islington property licence types', href: islington.types.url, external: true }],
      },
      {
        q: 'Does a better EPC cut the Islington licence fee?',
        a: 'Islington takes £50 off the second payment for an EPC rating of A, B or C. An accredited landlord gets £75 off and a no-gap renewal £25 off, and the discounts add together.',
        links: [{ label: 'Islington licence fees and discounts', href: islington.apply.url, external: true }],
      },
      {
        q: 'Can I replace the windows of my Islington flat?',
        a: 'Islington says replacing windows in a flat, maisonette or block of flats is not permitted development, so it needs planning permission. For a house, the right to replace front windows is also removed in many conservation areas.',
        links: [{ label: 'Islington net zero permitted development guide', href: islington.netZero.url, external: true }],
      },
      {
        q: 'Can I insulate the inside walls of a Victorian house in Islington?',
        a: 'The council’s guide says internal wall insulation is not considered development and needs no planning permission for a residential building. A listed building would need listed building consent, and external insulation will probably need planning permission.',
        links: [{ label: 'Islington net zero permitted development guide', href: islington.netZero.url, external: true }],
      },
      ...districtFaq(s, 'Islington'),
    ],
  },

  barnet: {
    districtNames: {
      HA8: 'Edgware and Burnt Oak',
      NW9: 'Colindale and Kingsbury',
      EN5: 'Barnet and New Barnet',
      NW4: 'Hendon',
      NW11: 'Golders Green and Hampstead Garden Suburb',
      N12: 'North Finchley',
      N3: 'Finchley Central',
      NW2: 'Cricklewood and Childs Hill',
      NW7: 'Mill Hill',
      N2: 'East Finchley',
      EN4: 'East Barnet and Hadley Wood',
      N20: 'Whetstone and Totteridge',
      N11: 'New Southgate and Friern Barnet',
    },
    neighbours: ['harrow', 'brent', 'camden', 'haringey', 'enfield'],
    standout: (s, london) =>
      `A typical Barnet house is ${s.floorArea.houses} m², against ${london.floorArea.houses} m² across London. Barnet has the ${rankLabel('barnet', (b) => b.privateRented.n)} most privately rented certificates of ${boroughCount} boroughs, ${fmt(s.privateRented.n)}, and ${pct(s.potential.pctBelowCCouldReachC)} of its D to G homes have a potential rating of C or better.`,
    stock: [
      'Barnet is the large outer borough in the north: the formal plan of Hampstead Garden Suburb and the big plots of Totteridge, 1930s semis across Finchley, Hendon, Mill Hill and Edgware, and the Watling Estate at Burnt Oak. Colindale and Hendon have newer blocks, and Golders Green and Cricklewood mix older terraces with mansion flats.',
      'A 1930s semi often has a cavity wall and a roof space that takes insulation, so evidence of earlier work is worth having to hand. A Hampstead Garden Suburb house is a different case, because the council’s planning controls there reach as far as solar panels and ground and water source heat pumps.',
    ],
    stockReading: (s, london) =>
      `${pct(s.age.pct.from1930to1966)} of Barnet’s certificates are for homes built between 1930 and 1966, against ${pct(london.age.pct.from1930to1966)} across London, and ${pct(s.walls.pct.cavityInsulated)} record insulated cavity walls, against ${pct(london.walls.pct.cavityInsulated)}. ${pct(s.walls.pct.solidUninsulated)} record solid walls with no added insulation, and flats and maisonettes are ${pct(s.pctFlats)} of the total.`,
    coverage: 'Edgware, Burnt Oak, Colindale, Hendon, Golders Green, Hampstead Garden Suburb, Mill Hill, Finchley, Whetstone, Totteridge, Barnet, New Southgate and Cricklewood.',
    council: [
      {
        id: 'barnet-licensing',
        heading: 'Letting in Barnet: HMO licensing and a selective licensing consultation',
        paragraphs: [
          'Barnet runs mandatory HMO licensing for five or more people in two or more households, and a borough-wide additional scheme for HMOs of three or more people in two or more households. The additional scheme began on 27 October 2022 and a council news item says it runs for five years. It also covers a building converted into flats that does not meet the 1991 Building Regulations, where the building has three or more storeys and at least three flats, all privately rented and under one ownership or control.',
          'From 1 January 2026 the fee for an HMO licence for up to five units of accommodation for five years is £1,872 for a new application: £1,061 with the application and £811 after the first inspection. Accredited landlords and charities get 10% off the first part, and each unit over five costs £37 more.',
          'Barnet’s selective licensing page says the council is consulting on proposals for selective licensing in 10 wards. That is a proposal, not a scheme in force. The fee table already lists a selective licence at £774 “following designation”, so check the page for the outcome before letting a non-HMO home.',
        ],
        sources: [barnet.hmo, barnet.fees, barnet.news, barnet.selective],
      },
      {
        id: 'barnet-conservation',
        heading: 'Conservation areas and Article 4 in Barnet',
        paragraphs: [
          'Barnet’s conservation area list includes College Farm, Finchley Church End, Finchley Garden Village, Glenhill Close, Golders Green, Hampstead Garden Suburb, Hampstead Village (Heath Passage), Hendon Church End, Hendon The Burroughs, Mill Hill, Monken Hadley, Moss Hall Crescent, Railway Terraces, Totteridge, Watling Estate and Wood Street. The council says 10 conservation areas are covered by or have Article 4 directions in force.',
          'Hampstead Garden Suburb has two directions. Area 1 takes away permitted development rights for extensions and alterations, roof alterations, porches, outbuildings, hard surfaces, gates, fences and walls, painting the exterior, solar PV and solar thermal equipment and ground and water source heat pumps. Area 2, Spaniards End, covers only gates, fences, walls and other enclosures.',
          'Separately, planning permission has been needed anywhere in Barnet since 29 May 2016 to turn a home into a small HMO where between 3 and 6 unrelated people share basic amenities.',
        ],
        sources: [barnet.areas, barnet.hgsArticle4, barnet.smallHmo],
      },
      {
        id: 'barnet-estates',
        heading: 'Garden suburb, Watling Estate and Railway Terraces in Barnet',
        paragraphs: [
          'The council’s page says Hampstead Garden Suburb was developed between 1907 and 1938 on a greenfield site to a formal plan. It covers 1009 acres, including about 136 acres of open space, and was designated in 1968. The Hampstead Garden Suburb Trust’s Scheme of Management does not cover exactly the same land as the conservation area.',
          'The Watling Estate at Burnt Oak is a conservation area of 158 hectares with approximately 4,000 homes, around 3,600 houses and 400 flats, built at 10.7 homes per acre. Railway Terraces in Cricklewood has approximately 180 houses and 52 flats, and the council says some properties, particularly in Gratton Terrace, have been converted to HMO use, in several cases without planning permission. Finchley Garden Village is tightly drawn: 51 properties on about 9 acres.',
        ],
        sources: [barnet.hgs, barnet.watling, barnet.railway, barnet.garden],
      },
    ],
    faqs: (s) => [
      {
        q: 'Does my Barnet shared house need a licence?',
        a: 'If three or more people from two or more households live in it, yes. The additional scheme has been borough-wide since 27 October 2022, and five or more people need a mandatory licence. Barnet’s decision chart helps check.',
        links: [{ label: 'Barnet HMO licensing', href: barnet.hmo.url, external: true }],
      },
      {
        q: 'What does a Barnet HMO licence cost?',
        a: 'From 1 January 2026, a new application is £1,872 for five years for up to five units of accommodation: £1,061 with the application and £811 after the first inspection. Accredited landlords and charities get 10% off the first part.',
        links: [{ label: 'Barnet HMO fees', href: barnet.fees.url, external: true }],
      },
      {
        q: 'Can I fit solar panels on a Hampstead Garden Suburb house?',
        a: 'The Area 1 Article 4 direction takes away permitted development rights for solar PV and solar thermal equipment on a dwelling and for stand-alone solar in the garden, so planning permission is needed. Spaniards End is different: its direction covers only gates, fences and walls.',
        links: [{ label: 'Barnet Hampstead Garden Suburb Article 4 directions', href: barnet.hgsArticle4.url, external: true }],
      },
      {
        q: 'Do I need planning permission to turn a Barnet house into a small HMO?',
        a: 'Yes. Barnet’s Article 4 direction has required it since 29 May 2016 where between 3 and 6 unrelated people share basic amenities. A small HMO that already existed before that date does not need it. The licence is separate.',
        links: [{ label: 'Barnet small HMO Article 4 Direction', href: barnet.smallHmo.url, external: true }],
      },
      ...districtFaq(s, 'Barnet'),
    ],
  },

  haringey: {
    districtNames: {
      N17: 'Tottenham',
      N15: 'South Tottenham and Harringay',
      N22: 'Wood Green',
      N8: 'Hornsey and Crouch End',
      N4: 'Finsbury Park and Stroud Green',
      N10: 'Muswell Hill',
      N6: 'Highgate',
      N11: 'Bounds Green',
      N2: 'Fortis Green',
    },
    neighbours: ['barnet', 'enfield', 'waltham-forest', 'hackney', 'islington', 'camden'],
    standout: (s) =>
      `${pct(s.walls.pct.solidUninsulated)} of Haringey’s certificates record solid walls with no added insulation, the ${rankLabel('haringey', (b) => b.walls.pct.solidUninsulated)} highest share of ${boroughCount} boroughs, and ${pct(s.age.pct.pre1930)} are for homes built before 1930. Of the homes rated D to G today, ${pct(s.potential.pctBelowCCouldReachC)} have a potential rating of C or better.`,
    stock: [
      'Haringey is split by the railway and the hill. Hornsey, Crouch End, Muswell Hill and Highgate have large Victorian and Edwardian houses and flats, Wood Green and Harringay have long terraces, and Tottenham has the planned estates and high road buildings its conservation areas protect, with newer blocks around Tottenham Hale.',
      'The Noel Park, Tower Gardens and Peabody Cottages estates are covered below. For a house on one of them the front is controlled, but the loft, floor and boiler are not. For a converted flat in Stroud Green or Crouch End, the roof above and the heating in the flat itself carry more of the rating.',
    ],
    stockReading: (s, london) =>
      `${pct(s.age.pct.from1930to1966)} of Haringey’s certificates are for homes built between 1930 and 1966, against ${pct(london.age.pct.from1930to1966)} across London, and ${pct(s.walls.pct.cavityInsulated)} record insulated cavity walls, against ${pct(london.walls.pct.cavityInsulated)}. Flats and maisonettes are ${pct(s.pctFlats)} of the total, and private lettings ${pct(s.pctLettings)}, against ${pct(london.pctLettings)}.`,
    coverage: 'Tottenham, Tottenham Hale, Seven Sisters, Wood Green, Bounds Green, Harringay, Hornsey, Crouch End, Muswell Hill, Highgate, Stroud Green and Fortis Green.',
    council: [
      {
        id: 'haringey-licensing',
        heading: 'Letting in Haringey: selective licensing to November 2027',
        paragraphs: [
          'Haringey’s selective licensing scheme came into force on 17 November 2022 and ceases on 17 November 2027 unless the council revokes it earlier. It covers privately rented homes let to one person, two people or a single household in these wards: Bounds Green, Bruce Castle, Harringay, Hermitage & Gardens, Noel Park, Northumberland Park, Seven Sisters, South Tottenham, St Ann’s, Tottenham Central, Tottenham Hale, West Green, White Hart Lane and Woodside. Its additional HMO scheme covers every HMO in the borough, including section 257 HMOs.',
          'The standard selective fee is £705.84 for the five-year scheme: £411.57 on application and £294.27 once the application is approved. The council takes £50 off Part B for an EPC rating of C or above and another £50 for an accredited landlord, and the discounts can be combined. Owners of three or more rented flats in one block get £75 off Part A for the second and later flats.',
          'Every selective application needs an EPC. Haringey says an application without a valid EPC has its licence cut to one year, and its table of reasons for shortening a licence lists a failed EPC, worth a reduction of up to four years. The application also asks for an electrical installation condition report and, where there is gas, a gas safety certificate.',
        ],
        sources: [haringey.selective, haringey.notice, haringey.fees, haringey.apply, haringey.hmo],
      },
      {
        id: 'haringey-conservation',
        heading: 'Conservation areas and Article 4 in Haringey',
        paragraphs: [
          'Haringey’s list of conservation areas includes Alexandra Palace and Park, Bowes Park, Bruce Castle and All Hallows, Clyde Circus, Crouch End, Highgate, Muswell Hill, Noel Park, Peabody Cottages, Rookfield, St Ann’s and Stroud Green, and the five areas of the Tottenham High Road Historic Corridor: North Tottenham, Scotland Green, Bruce Grove, Tottenham Green and Seven Sisters/Page Green.',
          'The council currently uses Article 4 directions in four of them: Noel Park, Peabody Cottages, Rookfield Estate and Tower Gardens. Its page says they restrict permitted development rights such as alterations to windows and doors. New directions for Noel Park, Peabody Cottages and Tower Gardens took effect on 21 December 2020, and the council chose not to confirm a new direction for Rookfield Estate, so the existing one stays in effect.',
          'A separate Article 4 direction removes permitted development rights to convert a house (C3) into an HMO (C4) across most of the east of the borough. The council says a licence does not give planning approval.',
        ],
        sources: [haringey.areas, haringey.development, haringey.article4, haringey.landlords],
      },
      {
        id: 'haringey-estates',
        heading: 'Noel Park, Tower Gardens and Peabody Cottages',
        paragraphs: [
          'Noel Park in Wood Green is a planned estate of approximately 2000 terraced properties, developed by the Artizans, Labourers and General Dwellings Company from around 1881 to 1913. Its appraisal says the windows throughout are double-hung wooden sashes.',
          'The management plan says the thermal performance of sash windows can be improved with draught excluders and discreet secondary glazing, and that replacement windows should be wooden sashes matching the original. It says roof insulation will usually be possible, external wall insulation should not be used on the solid brick walls, and solar panels on facades or roof slopes visible from the street are not appropriate.',
          'Tower Gardens was built by the London County Council at the start of the 20th century, and when construction stopped in spring 1915, 963 homes had been built on about 40 acres. The Peabody Cottages estate was completed in 1907 and, the appraisal says, is the only Peabody estate made up entirely of cottages.',
        ],
        sources: [haringey.noelPark, haringey.towerGardens, haringey.peabody],
      },
    ],
    faqs: (s) => [
      {
        q: 'Does my Haringey rental need a selective licence?',
        a: 'If it is let to one person, two people or a single household in one of the selective wards, which run alphabetically from Bounds Green to Woodside, yes. The scheme runs from 17 November 2022 to 17 November 2027. A shared house comes under the additional HMO scheme instead.',
        links: [{ label: 'Haringey selective property licensing', href: haringey.selective.url, external: true }],
      },
      {
        q: 'Does a good EPC lower the Haringey licence fee?',
        a: 'Yes. Haringey takes £50 off the second payment, Part B, for an EPC rating of C or above, and another £50 for an accredited landlord. The standard fee is £705.84 before discounts.',
        links: [{ label: 'Haringey licence fees and discounts', href: haringey.fees.url, external: true }],
      },
      {
        q: 'What if my Haringey licence application has no valid EPC?',
        a: 'Haringey says an application without a valid EPC has its licence reduced to one year. Every selective application needs to be supported by an EPC, so a current certificate comes first.',
        links: [{ label: 'Haringey licence fees and discounts', href: haringey.fees.url, external: true }],
      },
      {
        q: 'Can I replace the windows of a Noel Park house?',
        a: 'Noel Park has an Article 4 direction, so alterations to windows and doors on the front need planning permission. The estate’s management plan asks for wooden sashes matching the original and suggests draught excluders and secondary glazing.',
        links: [{ label: 'Haringey development in conservation areas', href: haringey.development.url, external: true }],
      },
      ...districtFaq(s, 'Haringey'),
    ],
  },
}
