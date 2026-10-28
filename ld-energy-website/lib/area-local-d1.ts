import type { AreaSummary } from './borough-stats-types'
import type { AreaLocal, CouncilSource } from './area-local'
import { boroughCount, fmt, pct, rankLabel } from './area-page'

/**
 * Batch D1 hand-written local content (plan PLAN-AREAS-GUIDES-2026-10-22 §11): Wandsworth, Waltham Forest,
 * Greenwich, Lambeth, Brent, Tower Hamlets, Camden, Barking & Dagenham. Council facts come from each council's own
 * pages, read on `CHECKED`; a fact that could not be confirmed there is left out. Figures are never typed here:
 * each sentence that needs one takes it from lib/borough-stats.ts through `s` (this area) and `london`.
 * No job notes yet: none of these boroughs has an approved one.
 */

const CHECKED = '2026-10-24'

const CHECKED_28 = '2026-10-28'

const srcNow = (label: string, url: string): CouncilSource => ({ label, url, checked: CHECKED_28 })

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

const wandsworth = {
  licences: src('Wandsworth Council, check if you need a property licence', 'https://www.wandsworth.gov.uk/housing/private-housing/private-rented-property-licences/property-licence-check/'),
  fees: src('Wandsworth Council, property licence fees and discounts', 'https://www.wandsworth.gov.uk/housing/private-housing/private-rented-property-licences/property-licence-fees-discounts/'),
  conservation: src('Wandsworth Council, conservation areas frequently asked questions', 'https://www.wandsworth.gov.uk/planning/conservation-and-urban-design/conservation-areas/conservation-areas-faq/'),
  article4: src('Wandsworth Council, Article 4 Directions', 'https://www.wandsworth.gov.uk/planning/permitted-development-and-article-4-directions/article-4-directions/'),
}

const walthamForest = {
  selective: src('Waltham Forest Council, selective licensing scheme', 'https://www.walthamforest.gov.uk/housing/private-rented-property-licensing-prpl/choose-type-property-licence-you-need/check-if-you-need-selective-licence-your-property'),
  fees: src('Waltham Forest Council, property licence fees', 'https://www.walthamforest.gov.uk/housing/private-rented-property-licensing-prpl/apply-property-licence-and-licence-fees/check-how-much-property-licence-costs'),
  conservation: src('Waltham Forest Council, conservation areas and listed buildings', 'https://www.walthamforest.gov.uk/planning-and-building-control/design-and-conservation/conservation-areas-and-listed-buildings'),
}

const greenwich = {
  check: src('Royal Greenwich, check if you need a private rented property licence', 'https://www.royalgreenwich.gov.uk/housing/letting-out-your-property/check-if-you-need-private-rented-property-licence'),
  hmo: src('Royal Greenwich, HMO licensing and designations', 'https://www.royalgreenwich.gov.uk/housing/houses-multiple-occupation-hmos/hmo-licensing'),
  conservation: src('Royal Greenwich, conservation areas', 'https://www.royalgreenwich.gov.uk/planning-and-building-control/conservation-and-listed-buildings/protecting-character-local-areas/conservation-areas-Royal-Greenwich'),
}

const lambeth = {
  selective: src('Lambeth Council, Selective Licensing Scheme', 'https://www.lambeth.gov.uk/housing/landlords-licensing/selective-licensing-scheme'),
  conservation: src('Lambeth Council, conservation area profiles', 'https://www.lambeth.gov.uk/planning-and-building-control/conservation-and-listed-buildings/conservation-area-profiles'),
}

const brent = {
  licensing: src('Brent Council, property licensing', 'https://www.brent.gov.uk/housing/landlords/property-licensing'),
  conservation: src('Brent Council, listed buildings and conservation areas', 'https://brent.gov.uk/planning-and-building-control/listed-buildings-and-conservation-areas'),
}

const towerHamlets = {
  selective: src('Tower Hamlets Council, selective licensing', 'https://www.towerhamlets.gov.uk/lgnl/housing/Private-tenants-landlords-and-homeowners/Property-licensing/Licences/Selective-licensing.aspx'),
  additional: src('Tower Hamlets Council, additional licensing', 'https://www.towerhamlets.gov.uk/lgnl/housing/Private-tenants-landlords-and-homeowners/Property-licensing/Licences/Additional-licensing.aspx'),
  apply: src('Tower Hamlets Council, what do I need to make an application', 'https://www.towerhamlets.gov.uk/lgnl/housing/Private-tenants-landlords-and-homeowners/Property-licensing/Licences/What-do-I-need-to-make-an-application.aspx'),
  conservation: src('Tower Hamlets Council, conservation areas', 'https://www.towerhamlets.gov.uk/lgnl/planning_and_building_control/conservation_and_urban_design/conservation_areas.aspx'),
}

const camden = {
  hmo: src('Camden Council, houses in multiple occupation', 'https://www.camden.gov.uk/houses-multiple-occupation'),
  conservation: src('Camden Council, conservation areas', 'https://www.camden.gov.uk/conservation-areas'),
  article4: src('Camden Council, Article 4 Directions', 'https://www.camden.gov.uk/article-4-directions-heritage-and-conservation'),
}

const barking = {
  licensing: src('Barking and Dagenham Council, property licensing', 'https://www.lbbd.gov.uk/private-sector-housing/property-licensing'),
  need: src('Barking and Dagenham Council, do I need a licence?', 'https://www.lbbd.gov.uk/private-sector-housing/property-licensing/do-i-need-licence'),
  notice: src('Barking and Dagenham Council, public notice of selective licensing designation 2025', 'https://www.lbbd.gov.uk/sites/default/files/2025-01/Public%20Notice%20-%20Selective%20Licensing%20Designation.pdf'),
  conservation: src('Barking and Dagenham Council, conservation areas and listed buildings', 'https://www.lbbd.gov.uk/planning-building-control-and-local-land-charges/planning-guidance-and-policies/conservation-areas'),
}

export const d1Local: Record<string, AreaLocal> = {
  wandsworth: {
    districtNames: {
      SW11: 'Battersea and Clapham Junction',
      SW18: 'Wandsworth Town, Earlsfield and Southfields',
      SW17: 'Tooting and Furzedown',
      SW15: 'Putney and Roehampton',
      SW12: 'Balham',
      SW19: 'Southfields and Wimbledon Park',
      SW8: 'Nine Elms and Battersea',
    },
    neighbours: ['lambeth', 'merton', 'richmond', 'hammersmith-fulham'],
    standout: (s) => {
      const t = trend(s)
      return `Wandsworth ranks ${rankLabel('wandsworth', (b) => b.ratings.pct.AtoC)} of ${boroughCount} boroughs for the share rated A to C, and the share has risen every year, from ${pct(t.from)} in ${t.first} to ${pct(t.to)} in ${t.last}. Only ${fmt(s.privateRented.nFtoG)} of the ${fmt(s.privateRented.n)} privately rented certificates are F or G.`
    },
    stock: [
      'The Victorian terraces around Tooting, Balham and Earlsfield, built tight and tall, make up much of the older stock. Putney and Wandsworth Common have larger period houses, and many of the big ones are now flats. Battersea and Nine Elms are mostly towers and blocks from the last twenty years.',
      'For a converted Victorian flat, the loft, the floor below and the heating controls usually decide the rating. For a riverside block, details of the communal heating help the assessment. The rating comes from what is recorded at the visit, not from the postcode.',
    ],
    stockReading: (s, london) =>
      `${pct(s.age.pct.pre1930)} of Wandsworth’s certificates are for homes built before 1930, against ${pct(london.age.pct.pre1930)} across London, and ${pct(s.walls.pct.solidUninsulated)} record solid walls with no added insulation, against ${pct(london.walls.pct.solidUninsulated)}. Flats and maisonettes are ${pct(s.pctFlats)} of the total, so most of that older stock is converted.`,
    coverage: 'Battersea, Clapham Junction, Nine Elms, Wandsworth Town, Earlsfield, Southfields, Putney, Roehampton, Balham, Tooting and Furzedown.',
    council: [
      {
        id: 'wandsworth-licensing',
        heading: 'Letting in Wandsworth: selective and additional licensing',
        paragraphs: [
          'Wandsworth introduced selective and additional licensing on 1 July 2025. Additional licensing covers smaller shared houses and flats in multiple occupation in purpose-built blocks of three or more flats. Selective licensing covers other private rentals in the wards the council has designated.',
          'The first designation, from July 2025, covers Furzedown, Tooting Bec, Tooting Broadway and South Balham. A second, from April 2026, adds East Putney, West Putney and Northcote.',
          'The council’s fees page lists a selective licence at £885 (£529 when you apply, £356 when it is granted) and an additional licence at £1,507. It also lists a discount that depends on the certificate: £104 off the second payment for an EPC rating of B or above, and £52 off for a C.',
        ],
        sources: [wandsworth.licences, wandsworth.fees],
      },
      {
        id: 'wandsworth-conservation',
        heading: 'Conservation areas in Wandsworth',
        paragraphs: [
          'Wandsworth has 46 conservation areas, from Battersea Square to the Alton Estate. Eight of them are under an Article 4(2) Direction, which means some work on the outside of a house needs planning permission that would normally not be required: Dover House Estate, Heaver Estate, Latchmere Estate, Putney Lower Common, Roehampton Village, Shaftesbury Park Estate, Totterdown Fields Estate and Wandsworth Common.',
          'Wandsworth’s guidance adds that flats, and houses converted into flats, have no permitted development rights. Planning permission is always needed to change doors and windows on those, in a conservation area or not. If an EPC recommendation touches the outside of a converted Victorian flat, check with the planning team first.',
        ],
        sources: [wandsworth.conservation, wandsworth.article4],
      },
      {
        id: 'wandsworth-estates',
        heading: 'Estates, windows and retrofit in Wandsworth',
        paragraphs: [
          'Wandsworth’s conservation area appraisals describe whole estates. Shaftesbury Park in Battersea is about 1,200 mainly two-storey terraced houses, completed between 1873 and 1877. Totterdown Fields in Tooting has 1,261 cottages, and some are a separate ground-floor and first-floor flat. The Latchmere Estate, completed in 1903, was the first municipal housing estate in the country built with a council’s own workforce.',
          'On Shaftesbury Park, the Article 4 Direction puts replacement windows and doors, and re-roofing in a different material, under planning control. The Dover House Estate appraisal, for a 1920s London County Council cottage estate, suggests draught-proofing or secondary glazing as an alternative to replacing original windows, and says repair work does not need planning permission.',
          'Wandsworth’s licence conditions say the EPC rating must meet the current minimum energy efficiency standard at the time of letting, unless exempt. A licence can be granted for up to five years. The council’s retrofit pages say most buildings can be retrofitted under permitted development rights, but a conservation area or listed building may need planning permission.',
        ],
        sources: [srcNow('Wandsworth Council, Shaftesbury Park Estate appraisal', 'https://www.wandsworth.gov.uk/media/1681/shaftesbury_caaandms.pdf'), srcNow('Wandsworth Council, Totterdown Fields Estate appraisal', 'https://www.wandsworth.gov.uk/media/djnpu24q/totterdown.pdf'), srcNow('Wandsworth Council, Latchmere Estate appraisal', 'https://www.wandsworth.gov.uk/media/1604/latchmereplusappraisalplusms.pdf'), srcNow('Wandsworth Council, Shaftesbury Park Article 4 Direction', 'https://www.wandsworth.gov.uk/planning/permitted-development-and-article-4-directions/article-4-directions/shaftesbury-park-estate-conservation-area/'), srcNow('Wandsworth Council, Dover House Estate appraisal', 'https://www.wandsworth.gov.uk/media/1595/dover_house_final.pdf'), srcNow('Wandsworth Council, selective licensing conditions', 'https://www.wandsworth.gov.uk/media/nrjp3c0m/selective_licensing_conditions.pdf'), srcNow('Wandsworth Council, retrofit planning and regulation', 'https://www.wandsworth.gov.uk/environment/climate-change/retrofit-advice/retrofit-planning-and-regulation/')],
      },
    ],
    faqs: (s) => [
      {
        q: 'Which Wandsworth wards need a selective licence?',
        a: 'Furzedown, Tooting Bec, Tooting Broadway and South Balham since July 2025, and East Putney, West Putney and Northcote from April 2026. Smaller shared houses come under additional licensing instead. Wandsworth’s interactive map checks a postcode.',
        links: [{ label: 'Wandsworth property licence check', href: wandsworth.licences.url, external: true }],
      },
      {
        q: 'Does a better EPC rating cut the Wandsworth licence fee?',
        a: 'Wandsworth’s fees page lists £104 off the second payment for an EPC rating of B or above, and £52 off for a C, on both selective and additional licences. The discount is worked out once the full application and documents are in.',
        links: [{ label: 'Wandsworth licence fees and discounts', href: wandsworth.fees.url, external: true }],
      },
      {
        q: 'Can I change the windows of my Wandsworth flat in a conservation area?',
        a: 'Wandsworth says flats, and houses converted into flats, do not have permitted development rights, so planning permission is always needed to change doors and windows. That applies to many Putney and Balham conversions.',
        links: [{ label: 'Wandsworth conservation areas FAQ', href: wandsworth.conservation.url, external: true }],
      },
      {
        q: 'Do Wandsworth’s licence conditions mention the EPC?',
        a: 'Yes. The selective licensing conditions say the EPC rating must meet the current minimum energy efficiency standard at the time of letting, unless the property is exempt. The additional licensing conditions say the same.',
        links: [{ label: 'Wandsworth selective licensing conditions', href: 'https://www.wandsworth.gov.uk/media/nrjp3c0m/selective_licensing_conditions.pdf', external: true }],
      },
      ...districtFaq(s, 'Wandsworth'),
    ],
  },

  'waltham-forest': {
    districtNames: {
      E17: 'Walthamstow',
      E4: 'Chingford and Highams Park',
      E10: 'Leyton',
      E11: 'Leytonstone',
      IG8: 'Woodford Green',
    },
    neighbours: ['hackney', 'haringey', 'enfield', 'newham', 'redbridge'],
    standout: (s, london) => {
      const { top, bottom } = spread(s)
      return `${pct(s.privateRented.pctBelowC)} of Waltham Forest’s privately rented certificates are rated below C, against ${pct(london.privateRented.pctBelowC)} across London. ${top.district} has the highest share rated A to C in the borough at ${pct(top.pctAtoC)} and ${bottom.district} the lowest at ${pct(bottom.pctAtoC)}.`
    },
    stock: [
      'Walthamstow and Leyton are streets of two-storey Victorian and Edwardian terraces, many of them cut into upstairs and downstairs flats. Chingford and Highams Park lean to 1930s semis. Along the Lea side and around the Victoria line stations, newer blocks sit between the old streets.',
      'On a terrace, the first questions are the walls, the loft and any extension. Receipts or photos of insulation added later can be recorded. On a conversion, ask the freeholder or the previous owner what was done to the roof and floor.',
    ],
    stockReading: (s, london) =>
      `${pct(s.age.pct.pre1930)} of certificates are for homes built before 1930, against ${pct(london.age.pct.pre1930)} across London, and ${pct(s.age.pct.from1930to1966)} for 1930 to 1966. ${pct(s.heating.pct.mainsGas)} are heated by a mains gas boiler, against ${pct(london.heating.pct.mainsGas)}. Only ${pct(s.age.pct.from2012)} date from 2012 or later.`,
    coverage: 'Walthamstow, Leyton, Leytonstone, Chingford, Highams Park, Woodford Green and the streets either side of Lea Bridge Road.',
    council: [
      {
        id: 'walthamforest-licensing',
        heading: 'Letting in Waltham Forest: selective licensing to April 2030',
        paragraphs: [
          'Waltham Forest’s selective licensing scheme started in May 2025 and runs until 30 April 2030. It covers privately rented homes let to one person, a single family or two unrelated sharers, in every ward except Hatch Lane, Highams Park North and Endlebury. In those three wards, a home let to three or more unrelated tenants needs an HMO licence.',
          'The selective licence is £895, taken in two parts: £300 on application and £595 when it is granted. Licences can run up to five years.',
          'The rating can change the fee. The council’s fees page lists £800 for a selective licence on a home with an EPC of C, and £600 for A or B. It says the discount is not paid where the council has had to investigate a failure to license, and that it may refuse it if it thinks the EPC is not a true reflection of the home.',
        ],
        sources: [walthamForest.selective, walthamForest.fees],
      },
      {
        id: 'walthamforest-conservation',
        heading: 'Conservation areas in Waltham Forest',
        paragraphs: [
          'Waltham Forest lists 15 conservation areas, among them Walthamstow Village, Orford Road, Leytonstone, Chingford Green and Woodford Green. Article 4 directions apply in most of them and remove some permitted development rights from single dwellings.',
          'The council says commercial properties and flats do not have permitted development rights, so Article 4 directions do not cover them. For solar panels, it says roof panels can often go in without planning permission, but panels on a wall facing a road in a conservation area generally need it.',
        ],
        sources: [walthamForest.conservation],
      },
      {
        id: 'walthamforest-estates',
        heading: 'Streets, estates and standards in Waltham Forest',
        paragraphs: [
          'The council’s conservation area appraisals show how varied the older homes are. Leucha Road in Walthamstow is 1895 two-storey maisonettes, called half houses, all originally built to rent. By 1901 the Warner company had 2,184 weekly tenants in the terraces around Lloyd Park. Thornhill Road in Leyton runs from small cottages to large villas. The Ropers Field Estate in Chingford was developed for housing from 1946.',
          'The council’s standards for private rented property say homes should be improved over time towards an EPC band C, and call that an aspiration. The same standards expect effective loft insulation of at least 200mm or equivalent.',
          'Planning permission is generally needed for solar panels on a wall that fronts a highway in a conservation area.',
        ],
        sources: [srcNow('Waltham Forest Council, Leucha Road appraisal', 'https://www.walthamforest.gov.uk/sites/default/files/2021-10/CA%20APPRAISAL%20MANAGEMENT%20PLAN%20-%20LEUCHA%20ROAD.pdf'), srcNow('Waltham Forest Council, Lloyd Park appraisal', 'https://www.walthamforest.gov.uk/sites/default/files/2021-10/CA%20APPRAISAL%20MANAGEMENT%20PLAN%20-%20LLOYD%20PARK.pdf'), srcNow('Waltham Forest Council, Thornhill Road appraisal', 'https://www.walthamforest.gov.uk/sites/default/files/2021-10/CA%20APPRAISAL%20MANAGEMENT%20PLAN%20-%20THORNHILL%20ROAD.pdf'), srcNow('Waltham Forest Council, Ropers Field appraisal', 'https://www.walthamforest.gov.uk/sites/default/files/2021-10/CA%20APPRAISAL%20MANAGEMENT%20PLAN%20-%20ROPERS%20FIELD.pdf'), srcNow('Waltham Forest Council, standards for private rented property', 'https://www.walthamforest.gov.uk/sites/default/files/2021-10/Standards%20for%20Private%20Rented%20Property.pdf'), srcNow('Waltham Forest Council, conservation areas and listed buildings', 'https://www.walthamforest.gov.uk/planning-and-building-control/design-and-conservation/conservation-areas-and-listed-buildings')],
      },
    ],
    faqs: (s) => [
      {
        q: 'Does my Waltham Forest rental need a selective licence?',
        a: 'If it is let to one person, a single family or two unrelated sharers, yes, in every ward except Hatch Lane, Highams Park North and Endlebury. The scheme runs from May 2025 to 30 April 2030. In those three wards, a home let to three or more unrelated tenants needs an HMO licence.',
        links: [{ label: 'Waltham Forest selective licensing', href: walthamForest.selective.url, external: true }],
      },
      {
        q: 'Does a good EPC lower the Waltham Forest licence fee?',
        a: 'It can. The council lists £800 for a selective licence on a home rated C and £600 for A or B, against the full £895. The discount is not paid where the council has had to investigate a failure to license.',
        links: [{ label: 'Waltham Forest licence fees', href: walthamForest.fees.url, external: true }],
      },
      {
        q: 'Do you cover Walthamstow Village and Chingford?',
        a: 'Yes. Walthamstow Village is a conservation area, so tell us if you plan outside work such as new windows, as the planning rules are stricter there. Chingford, Highams Park and Woodford Green are covered at the same price as the rest of London.',
      },
      {
        q: 'Does Waltham Forest expect rented homes to reach EPC C?',
        a: 'The council’s standards for private rented property call band C an aspirational minimum, to be reached over time, and say the council will work with landlords on advice and grant funding. It is not a licence condition. The legal minimum today is E.',
        links: [{ label: 'Waltham Forest standards for private rented property', href: 'https://www.walthamforest.gov.uk/sites/default/files/2021-10/Standards%20for%20Private%20Rented%20Property.pdf', external: true }],
      },
      ...districtFaq(s, 'Waltham Forest'),
    ],
  },

  greenwich: {
    districtNames: {
      SE18: 'Woolwich and Plumstead',
      SE9: 'Eltham and Mottingham',
      SE10: 'Greenwich and the Peninsula',
      SE3: 'Blackheath and Westcombe Park',
      SE7: 'Charlton',
      SE28: 'Thamesmead',
      SE2: 'Abbey Wood',
    },
    neighbours: ['lewisham', 'bexley', 'bromley', 'newham', 'tower-hamlets'],
    standout: (s) => {
      const { top, bottom } = spread(s)
      return `Greenwich’s districts rate very differently. ${bottom.district} has ${pct(bottom.pctAtoC)} rated A to C from ${fmt(bottom.n)} certificates, while ${top.district} has ${pct(top.pctAtoC)} from ${fmt(top.n)}.`
    },
    stock: [
      'Georgian and early Victorian terraces sit around Greenwich town centre and Blackheath, with grander villas on Westcombe Park. Charlton and Eltham are mostly interwar semis. Further east, Thamesmead and the Peninsula are concrete estates and new towers.',
      'In a Blackheath or West Greenwich terrace, solid walls and original sash windows are the usual limits. On the Peninsula or at Woolwich, details of the communal heating system matter more than the fabric. For an interwar semi, evidence of a filled cavity or a loft top-up can be recorded.',
    ],
    stockReading: (s, london) =>
      `${pct(s.walls.pct.cavityInsulated)} of certificates record insulated cavity walls, against ${pct(london.walls.pct.cavityInsulated)} across London, and ${pct(s.heating.pct.communal)} record communal heating, against ${pct(london.heating.pct.communal)}. Homes from 2012 onwards are ${pct(s.age.pct.from2012)}, about ${(s.age.pct.from2012 / london.age.pct.from2012).toFixed(1)} times the London share.`,
    coverage: 'Greenwich, Blackheath, Westcombe Park, Charlton, Woolwich, Plumstead, Eltham, Thamesmead, Abbey Wood and the Greenwich Peninsula.',
    council: [
      {
        id: 'greenwich-licensing',
        heading: 'Letting in Greenwich: HMO and selective licensing',
        paragraphs: [
          'Royal Greenwich runs mandatory and additional HMO licensing across the whole borough. Additional licensing covers smaller HMOs, with three or four people from two or more households.',
          'Selective licensing, for a home let to one household or two individuals, applies in five wards: Woolwich Riverside, Woolwich Common, Shooters Hill, Plumstead Common and Plumstead Glyndon. A home with an HMO licence does not need a selective licence as well.',
          'The council consulted from 21 July to 12 October 2026 on widening selective licensing to up to 18 wards. When we read its pages on 28/10/2026 they still described the proposal and showed no decision, so check the council’s page before relying on the five-ward list.',
        ],
        sources: [greenwich.check, greenwich.hmo],
      },
      {
        id: 'greenwich-conservation',
        heading: 'Conservation areas in Greenwich',
        paragraphs: [
          'Royal Greenwich has 23 conservation areas, including Blackheath, Greenwich Park, West Greenwich, East Greenwich, Charlton Village and Royal Arsenal Woolwich. The council marks Ashburnham Triangle, Progress Estate, Rectory Field and Shrewsbury Park Estate as under an Article 4 direction, with two directions each in East Greenwich and West Greenwich.',
          'An Article 4 direction takes away some permitted development rights, so outside work that would not normally need it may need planning permission. If an EPC recommendation involves the outside of a home in one of these areas, check with the council before booking the work.',
        ],
        sources: [greenwich.conservation],
      },
      {
        id: 'greenwich-estates',
        heading: 'Estates and heritage areas in Greenwich',
        paragraphs: [
          'The Progress Estate at Well Hall in Eltham was built in 1915 to house munitions workers, and nearly the whole estate of 1,200 housing units survives. The Ashburnham Triangle in West Greenwich is Georgian and mid-Victorian terraces in yellow London stock brick under slate roofs, with 26 statutorily listed buildings and 210 on the local list. Plumstead Common is mainly late 19th century two-storey terraces facing the Common.',
          'The 2007 Progress Estate appraisal says its Article 4 Direction almost entirely removes householder permitted development rights for single-family houses. The 2008 Ashburnham Triangle appraisal says replacing a window needs planning permission if it alters the building’s appearance. Both are older documents, so check the current position with the council. Buildings on the local list need no listed building consent, but alterations may still need planning permission.',
          'The January 2026 HMO licence conditions require the holder to keep a valid EPC. The selective licence conditions require the holder to give the tenant a copy of the EPC.',
        ],
        sources: [srcNow('Royal Greenwich, Progress Estate appraisal', 'https://www.royalgreenwich.gov.uk/sites/default/files/2025-07/Progress_Estate_CAA_adopted_Dec_2007.pdf'), srcNow('Royal Greenwich, Ashburnham Triangle appraisal', 'https://www.royalgreenwich.gov.uk/sites/default/files/2025-07/Ashburnham_Triangle_CAA_adopted_Dec_2008%20%281%29_0.pdf'), srcNow('Royal Greenwich, Plumstead Common appraisal', 'https://www.royalgreenwich.gov.uk/sites/default/files/2025-07/Plumstead_Common_CAA_adopted_Mar_2010.pdf'), srcNow('Royal Greenwich, locally listed buildings', 'https://www.royalgreenwich.gov.uk/planning-and-building-control/conservation-and-listed-buildings/listed-buildings-information/local'), srcNow('Royal Greenwich, HMO licence conditions January 2026', 'https://www.royalgreenwich.gov.uk/sites/default/files/2026-01/HMO-licence-conditions-january-2026.pdf'), srcNow('Royal Greenwich, selective licence conditions January 2026', 'https://www.royalgreenwich.gov.uk/sites/default/files/2026-01/selective-licence-conditions-january-2026.pdf')],
      },
    ],
    faqs: (s) => [
      {
        q: 'Do I need a licence to let my Greenwich flat?',
        a: 'Probably, if it is in Woolwich Riverside, Woolwich Common, Shooters Hill, Plumstead Common or Plumstead Glyndon and let to one household or two individuals: those five wards are in the selective scheme. A shared house with three or four people needs an additional HMO licence anywhere in the borough.',
        links: [{ label: 'Greenwich: check if you need a licence', href: greenwich.check.url, external: true }],
      },
      {
        q: 'Is Greenwich widening selective licensing?',
        a: 'It has proposed it. The council consulted from 21 July to 12 October 2026 on covering up to 18 wards, and its pages showed no decision when we read them on 28/10/2026. Check its licensing page before you let.',
        links: [{ label: 'Greenwich HMO and licensing pages', href: greenwich.hmo.url, external: true }],
      },
      {
        q: 'Can you assess a Blackheath or West Greenwich home?',
        a: 'Yes. Both are conservation areas, and West Greenwich has two Article 4 directions. They affect outside work, not the assessment. We record the walls, windows and heating as they are on the visit.',
        links: [{ label: 'Greenwich conservation areas', href: greenwich.conservation.url, external: true }],
      },
      {
        q: 'Do Greenwich’s licence conditions mention the EPC?',
        a: 'Yes. The HMO licence conditions say the licence holder must make sure the flat or house has a valid EPC. The selective licence conditions say the holder must provide the tenant with a copy of the EPC for the property.',
        links: [{ label: 'Greenwich selective licence conditions', href: 'https://www.royalgreenwich.gov.uk/sites/default/files/2026-01/selective-licence-conditions-january-2026.pdf', external: true }],
      },
      ...districtFaq(s, 'Greenwich'),
    ],
  },

  lambeth: {
    districtNames: {
      SW2: 'Brixton and Streatham Hill',
      SW9: 'Stockwell and Brixton',
      SW16: 'Streatham and Norbury',
      SW4: 'Clapham',
      SW8: 'Vauxhall and South Lambeth',
      SE27: 'West Norwood',
      SE11: 'Kennington',
      SE24: 'Herne Hill',
      SE1: 'Waterloo and Lambeth North',
      SE21: 'West Dulwich',
      SE19: 'Gipsy Hill and Upper Norwood',
      SW12: 'Clapham Park',
    },
    neighbours: ['southwark', 'wandsworth', 'merton', 'croydon', 'lewisham', 'westminster'],
    standout: (s, london) =>
      `Flats and maisonettes make up ${pct(s.pctFlats)} of Lambeth’s certificates, against ${pct(london.pctFlats)} across London, and the typical home is ${s.floorArea.median} m². The commonest size band is 55 to 75 m², at ${pct(s.commonestBand.pct)} of certificates.`,
    stock: [
      'Lambeth is a long, thin borough. Clapham and Brixton are Victorian terraces, mostly divided into flats. Stockwell and Vauxhall have large estates from the 1930s to the 1960s and, along the Albert Embankment, new towers. Streatham and Norwood have bigger villas and interwar houses.',
      'A conversion is assessed as its own flat, so the rating depends on which floor you are on, the roof above you and the heating in your flat. On an estate flat, details of any communal or district heating are the useful part. For a villa, say which rooms were added or converted.',
    ],
    stockReading: (s, london) =>
      `${pct(s.walls.pct.solidUninsulated)} of certificates record solid walls with no added insulation, against ${pct(london.walls.pct.solidUninsulated)} across London. Only ${pct(s.age.pct.from2012)} are for homes built from 2012, against ${pct(london.age.pct.from2012)}, and ${pct(s.heating.pct.electric)} record electric heating, against ${pct(london.heating.pct.electric)}.`,
    coverage: 'Brixton, Clapham, Stockwell, Vauxhall, Kennington, Herne Hill, Streatham, Norbury, West Norwood, Gipsy Hill, Upper Norwood and Waterloo.',
    council: [
      {
        id: 'lambeth-licensing',
        heading: 'Letting in Lambeth: selective licensing',
        paragraphs: [
          'Lambeth’s selective licensing scheme covers privately rented homes let to a single household or to no more than two unrelated sharers. It applies in every ward except Vauxhall and Waterloo & South Bank. Phase 1 started on 2 September 2024 in Knights Hill, Streatham Common and Vale, Streatham Hill East and Streatham St Leonard’s. Phase 2 started on 1 September 2025 in the other 19 wards.',
          'Lambeth’s fee from 1 April 2026 is £1,025 (£717.50 for the application and £307.50 once it is approved). The council takes £50 off the second payment for an EPC of C or better, and £75 for an accredited landlord. It says the discount is applied after the draft licence, not at the time of application.',
        ],
        sources: [lambeth.selective],
      },
      {
        id: 'lambeth-floor-plan',
        heading: 'The documents a Lambeth licence application asks for',
        paragraphs: [
          'The council lists an annotated floor plan among the documents requested for a selective licence, along with a gas safety certificate, an Electrical Installation Condition Report, the tenancy or management agreement and, if you want the discount, the EPC.',
          'We draw laser-measured floor plans and can measure on the same visit as the EPC. If the plan is for a Lambeth licence application, say so when you book so we can check what the council asks it to show.',
        ],
        sources: [lambeth.selective],
      },
      {
        id: 'lambeth-conservation',
        heading: 'Conservation areas in Lambeth',
        paragraphs: [
          'Lambeth has 62 conservation areas, covering about 30% of the borough. The council says you can check whether a property is in one by searching its planning application database and opening the constraints tab. If the home is in one, check with the council before changing the outside, such as the windows.',
        ],
        sources: [lambeth.conservation],
      },
      {
        id: 'lambeth-estates',
        heading: 'Estates, listings and heat networks in Lambeth',
        paragraphs: [
          'Lambeth’s conservation area profiles name its planned estates. The Leigham Court Estate in Streatham was developed between 1889 and 1928 by the Artizans, Labourers and General Dwellings Company. Hyde Farm has a marked Edwardian character, built between 1896 and 1916 by Emmanuel College Cambridge. The Peabody Estate on Rosendale Road is 20 acres of social housing from 1901, in flats and terraced houses. Roupell Street has uniform terraced houses with corner shops and a pub.',
          'The profiles for Albert Square, Lansdowne Gardens, Leigham Court Estate, Park Hall Road, St Marks, Stockwell Park, Streatham Lodge and Vauxhall each say an Article 4 Direction applies, and Hyde Farm’s profile says so too. Lambeth has over 2,000 statutorily listed buildings. Local heritage listing adds no extra planning controls, but it is a material consideration.',
          'The council runs heat networks supplying 117 buildings with more than 4,118 dwellings, which matters when a flat is on communal heating.',
        ],
        sources: [srcNow('Lambeth Council, Leigham Court Estate profile', 'https://www.lambeth.gov.uk/planning-and-building-control/conservation-and-listed-buildings/conservation-area-profiles/leigham-court-estate-ca31'), srcNow('Lambeth Council, Hyde Farm profile', 'https://www.lambeth.gov.uk/planning-and-building-control/conservation-and-listed-buildings/conservation-area-profiles/hyde-farm-ca48'), srcNow('Lambeth Council, Peabody Estate Rosendale Road profile', 'https://www.lambeth.gov.uk/planning-and-building-control/conservation-and-listed-buildings/conservation-area-profiles/peabody-estate-rosendale-road-ca53'), srcNow('Lambeth Council, statutory listed buildings', 'https://www.lambeth.gov.uk/planning-and-building-control/conservation-and-listed-buildings/statutory-listed-buildings'), srcNow('Lambeth Council, locally listed buildings', 'https://www.lambeth.gov.uk/planning-and-building-control/conservation-and-listed-buildings/locally-listed-buildings'), srcNow('Lambeth Council, heat networks', 'https://www.lambeth.gov.uk/housing/heat-networks')],
      },
    ],
    faqs: (s) => [
      {
        q: 'Does my Lambeth rental need a selective licence?',
        a: 'If it is let to one household or no more than two unrelated sharers, yes, in every Lambeth ward except Vauxhall and Waterloo & South Bank. The scheme started in four Streatham wards on 2 September 2024 and in the other 19 on 1 September 2025.',
        links: [{ label: 'Lambeth Selective Licensing Scheme', href: lambeth.selective.url, external: true }],
      },
      {
        q: 'What does a Lambeth licence application ask for?',
        a: 'Among other things, an annotated floor plan, a gas safety certificate, an Electrical Installation Condition Report and the tenancy or management agreement. The EPC is requested if you are applying for the discount for a C or better.',
        links: [{ label: 'Lambeth licence documents', href: lambeth.selective.url, external: true }, { label: 'Our floor plans', href: '/services/floor-plans' }],
      },
      {
        q: 'Do you assess flats in converted Brixton and Clapham houses?',
        a: 'Yes. Each self-contained flat gets its own EPC. Tell us which floor it is on and how its heating works, and whether the roof above is shared.',
      },
      {
        q: 'Can I see my Lambeth building’s EPC on a council map?',
        a: 'Lambeth’s heat decarbonisation study has an interactive map with information about every building in the borough. Buildings are colour-coded by the heating energy they need, and each shows details such as the EPC, building age and insulation levels.',
        links: [{ label: 'Lambeth heat decarbonisation study', href: 'https://www.lambeth.gov.uk/environmental-services/climate-change-sustainability/buildings-energy/heat-decarbonisation-study', external: true }],
      },
      ...districtFaq(s, 'Lambeth'),
    ],
  },

  brent: {
    districtNames: {
      NW10: 'Willesden, Harlesden and Kensal Green',
      NW2: 'Cricklewood and Dollis Hill',
      HA9: 'Wembley Park and Wembley',
      HA0: 'Wembley Central and Alperton',
      NW6: 'Kilburn and Queen’s Park',
      NW9: 'Kingsbury',
      HA3: 'Kenton',
      HA8: 'Queensbury',
    },
    neighbours: ['harrow', 'barnet', 'camden', 'westminster', 'kensington-chelsea', 'ealing', 'hammersmith-fulham'],
    standout: (s) => {
      const ratio = s.pctSales > 0 ? (s.pctLettings / s.pctSales).toFixed(1) : null
      return `Brent has the ${rankLabel('brent', (b) => b.privateRented.n)} most privately rented certificates of ${boroughCount} boroughs: ${fmt(s.privateRented.n)}.${ratio ? ` Lettings outnumber marketed sales by about ${ratio} to 1.` : ''}`
    },
    stock: [
      'Kilburn, Willesden and Harlesden are Victorian and Edwardian terraces, many split into flats or let by the room. Kingsbury, Kenton and Queensbury are interwar semis. Wembley Park has been rebuilt as a cluster of towers over the last decade.',
      'For a terrace or a converted house, the walls, the loft and the heating system are what the assessor records. For a Wembley Park apartment, the communal system and the metering matter more than the fabric. A rental needs the certificate before it can be licensed, so book ahead of the application.',
    ],
    stockReading: (s, london) =>
      `${pct(s.age.pct.from1930to1966)} of Brent’s certificates are for homes built between 1930 and 1966, against ${pct(london.age.pct.from1930to1966)} across London, and ${pct(s.walls.pct.solidUninsulated)} record solid walls with no added insulation, against ${pct(london.walls.pct.solidUninsulated)}. Flats and maisonettes are ${pct(s.pctFlats)} of the total.`,
    coverage: 'Wembley, Wembley Park, Alperton, Willesden, Harlesden, Kensal Green, Kilburn, Queen’s Park, Cricklewood, Dollis Hill, Kingsbury, Kenton and Queensbury.',
    council: [
      {
        id: 'brent-licensing',
        heading: 'Letting in Brent: selective and additional licensing',
        paragraphs: [
          'Brent’s selective licensing covers privately rented homes occupied by a single household or no more than two unrelated people. The first designation started on 1 August 2023 in Harlesden & Kensal Green, Dollis Hill and Willesden Green. The second started on 1 April 2024 and covers the other 18 wards except Wembley Park. Each lasts five years.',
          'An additional licence, for homes occupied by three or four people from two or more households, started on 2 February 2026. A selective licence costs £640: £340 on application and £300 on grant.',
        ],
        sources: [brent.licensing],
      },
      {
        id: 'brent-floor-plan',
        heading: 'The EPC and room sizes a Brent licence application asks for',
        paragraphs: [
          'Brent’s application asks you to upload the current Energy Performance Certificate with a rating between A and E, unless a valid exemption is in place, as well as a gas safety certificate.',
          'For a mandatory or additional licence it also asks for the size of every room in square metres and the location and description of the rooms. We draw laser-measured floor plans and can measure on the same visit as the EPC, so say if the work is for an HMO application.',
        ],
        sources: [brent.licensing],
      },
      {
        id: 'brent-conservation',
        heading: 'Conservation areas in Brent',
        paragraphs: [
          'Brent has 22 conservation areas. Its page lists Article 4 directions for areas including Barn Hill, Brondesbury, Buck Lane, Homestead Park and Kensal Green. Where one applies, some outside work on a house may need planning permission, so check with the council first.',
        ],
        sources: [brent.conservation],
      },
      {
        id: 'brent-estates',
        heading: 'Metroland, listings and planning in Brent',
        paragraphs: [
          'Brent’s heritage page says the railways enabled suburban Metroland development, boosted by the British Empire Exhibition at Wembley Park. The conservation area appraisals show the spread. Queen’s Park is rows of two and three-storey Victorian and Edwardian terraces. Kilburn is wholly Victorian, mostly three-storey terraces. Sudbury Court was laid out from 1925 to Garden Suburb principles. Roe Green Village is a garden-city style estate planned in 1916, with construction from 1918.',
          'All of Brent’s residential conservation areas are covered by Article 4 directions, and exterior cladding needs planning permission in a conservation area. Brent has one Grade I, nine Grade II* and around 200 Grade II listed buildings. A separate direction, in effect since 1 November 2022, requires planning permission to change a dwelling to a small house in multiple occupation.',
          'Brent’s HMO licence conditions list the EPCs carried out for new tenancies among the records the licence holder must be able to produce.',
        ],
        sources: [srcNow('Brent Council, listed buildings and conservation areas', 'https://www.brent.gov.uk/planning-and-building-control/listed-buildings-and-conservation-areas'), srcNow('Brent Council, Queen’s Park conservation area appraisal', 'https://www.brent.gov.uk/-/media/files/resident-documents/planning-and-bc-documents/queens-park-conservation-area-appraisal.pdf'), srcNow('Brent Council, Kilburn conservation area appraisal', 'https://www.brent.gov.uk/-/media/files/resident-documents/planning-and-bc-documents/kilburn-conservation-area-appraisal.pdf'), srcNow('Brent Council, Sudbury Court conservation area appraisal', 'https://www.brent.gov.uk/-/media/files/resident-documents/planning-and-bc-documents/sudbury-court-conservation-area-appraisal.pdf'), srcNow('Brent Council, Roe Green conservation area appraisal', 'https://www.brent.gov.uk/-/media/files/resident-documents/planning-and-bc-documents/roe-green-conservation-area-appraisal.pdf'), srcNow('Brent Council, Article 4 directions', 'https://www.brent.gov.uk/planning-and-building-control/planning-policy-and-guidance/article-4-directions'), srcNow('Brent Council, HMO licence conditions', 'https://www.brent.gov.uk/-/media/files/resident-documents/housing/final--conditions-for-the-mandatory--additional-hmo-property-licensing-scheme-approved-october-13-20.pdf')],
      },
    ],
    faqs: (s) => [
      {
        q: 'Does my Brent rental need a licence?',
        a: 'If it is let to one household or no more than two unrelated people, yes, in every ward except Wembley Park. Homes with three or four people from two or more households need an additional licence, which started on 2 February 2026. Five or more need a mandatory HMO licence.',
        links: [{ label: 'Brent property licensing', href: brent.licensing.url, external: true }],
      },
      {
        q: 'Do I need an EPC for a Brent licence?',
        a: 'Yes. The application asks you to upload a current EPC with a rating between A and E, unless a valid exemption is in place. A rating of F or G needs work first, or an exemption.',
        links: [{ label: 'Brent: what you need to apply', href: brent.licensing.url, external: true }],
      },
      {
        q: 'Do you cover Wembley Park and the towers?',
        a: 'Yes, at the same price as the rest of London. For a flat in a managed block, tell us the concierge or entry arrangements when you book. Wembley Park is the one ward outside Brent’s selective licensing.',
      },
      {
        q: 'Do I need planning permission to turn a Brent house into a small HMO?',
        a: 'Brent’s Article 4 page says a direction in effect since 1 November 2022 requires planning permission for a change of use from a dwelling (Class C3) to a small house in multiple occupation (Class C4). That is separate from the licence.',
        links: [{ label: 'Brent Article 4 directions', href: 'https://www.brent.gov.uk/planning-and-building-control/planning-policy-and-guidance/article-4-directions', external: true }],
      },
      ...districtFaq(s, 'Brent'),
    ],
  },

  'tower-hamlets': {
    districtNames: {
      E14: 'Canary Wharf, Poplar and the Isle of Dogs',
      E1: 'Whitechapel, Stepney and Spitalfields',
      E3: 'Bow',
      E2: 'Bethnal Green',
      E1W: 'Wapping',
    },
    neighbours: ['hackney', 'newham', 'city-of-london', 'southwark', 'greenwich'],
    standout: (s, london) =>
      `Tower Hamlets has the highest share rated A to C of any London borough: ${pct(s.ratings.pct.AtoC)}, against ${pct(london.ratings.pct.AtoC)} across London. ${pct(s.privateRented.pctBelowC)} of its privately rented certificates are rated below C, the lowest share of the ${boroughCount} boroughs.`,
    stock: [
      'The borough is two kinds of housing side by side. The Isle of Dogs, Canary Wharf and the Wapping and Bow riverside are recent towers and blocks, many with communal heating. Stepney, Bethnal Green and Bow also have Georgian and Victorian terraces and, scattered through them, large post-war estates.',
      'For a tower flat, the building decides most of the rating and you cannot change it, so details of the communal heating and any heating controls inside the flat are the useful part. For a Georgian or Victorian house, the walls and windows are the limit.',
    ],
    stockReading: (s, london) =>
      `${pct(s.walls.pct.systemBuilt)} of certificates record system-built walls, against ${pct(london.walls.pct.systemBuilt)} across London, and ${pct(s.heating.pct.communal)} record communal heating, against ${pct(london.heating.pct.communal)}. Solid walls with no added insulation are ${pct(s.walls.pct.solidUninsulated)}, against ${pct(london.walls.pct.solidUninsulated)}. Flats and maisonettes are ${pct(s.pctFlats)} of the total.`,
    coverage: 'Canary Wharf, the Isle of Dogs, Poplar, Limehouse, Wapping, Whitechapel, Stepney, Spitalfields, Bethnal Green and Bow.',
    council: [
      {
        id: 'towerhamlets-licensing',
        heading: 'Letting in Tower Hamlets: additional licensing, and the end of selective',
        paragraphs: [
          'Tower Hamlets designated the whole borough for additional licensing from 1 April 2024 to 31 March 2029. It covers properties let to three or more people from two or more households, whatever the number of storeys, including flats. Mandatory HMO licensing still applies to five or more.',
          'The older selective scheme, in Weavers, Whitechapel and Banglatown & Spitalfields, ran from 1 October 2021 to 30 September 2026. The council says new selective applications closed after that date, and that existing licences carry on to their expiry.',
        ],
        sources: [towerHamlets.additional, towerHamlets.selective],
      },
      {
        id: 'towerhamlets-floor-plan',
        heading: 'The floor plan a Tower Hamlets licence application asks for',
        paragraphs: [
          'Tower Hamlets’ guidance on what you need to apply lists floor plans of the property with room sizes, alongside a gas safety certificate and, for flats and HMOs, an electrical safety certificate. It also asks you to know the layout, including where fire detection and sounders are.',
          'We draw laser-measured floor plans and can measure on the same visit as the EPC. If the plan is for a licence application, say so when you book.',
        ],
        sources: [towerHamlets.apply],
      },
      {
        id: 'towerhamlets-conservation',
        heading: 'Conservation areas in Tower Hamlets',
        paragraphs: [
          'Tower Hamlets has 58 conservation areas, each with an adopted character appraisal and management guidelines. The council says Fish Island and White Post Lane, and Three Mills, are managed by the London Legacy Development Corporation. If a recommendation touches the outside of a home in one, check with the right planning team first.',
        ],
        sources: [towerHamlets.conservation],
      },
      {
        id: 'towerhamlets-estates',
        heading: 'Terraces, estates and energy schemes in Tower Hamlets',
        paragraphs: [
          'Tower Hamlets’ conservation area appraisals cover very different homes. Tredegar Square is early Georgian terraced houses. At Wapping Pierhead, two terraces were designed by Daniel Alexander in 1811, and former warehouses have been converted to homes. The Boundary Estate is 20 blocks of five-storey flats built around a central circus. The Balfron Tower area is two residential blocks designed by Ernő Goldfinger for the London County Council in the 1960s.',
          'The Tredegar Square appraisal says external insulation through rendering or other methods will not be supported, and that any extra insulation should go on the inside. It says original windows should be retained and repaired, with draught-proofing and, if necessary, internal secondary glazing. The borough has 13 Grade I and around 2,000 Grade II listed buildings.',
          'An additional licence is valid for five years, assuming no significant change to the property or its ownership. The council’s Residential Energy Efficiency Programme offers free home energy upgrades to owner-occupiers, and at least one owner must live in the property, so it is not a landlord scheme.',
        ],
        sources: [srcNow('Tower Hamlets Council, Tredegar Square appraisal', 'https://www.towerhamlets.gov.uk/Documents/Planning-and-building-control/Development-control/Conservation-areas/Tredegar-Square-Camp.pdf'), srcNow('Tower Hamlets Council, Wapping Pierhead appraisal', 'https://www.towerhamlets.gov.uk/Documents/Planning-and-building-control/Development-control/Conservation-areas/Wapping-PierheadV2.pdf'), srcNow('Tower Hamlets Council, Boundary Estate appraisal', 'https://www.towerhamlets.gov.uk/Documents/Planning-and-building-control/Development-control/Conservation-areas/Boundary-EstateV1.pdf'), srcNow('Tower Hamlets Council, Balfron Tower appraisal', 'https://www.towerhamlets.gov.uk/Documents/Planning-and-building-control/Development-control/Conservation-areas/Balfron-TowerV1.pdf'), srcNow('Tower Hamlets Council, listed buildings', 'https://www.towerhamlets.gov.uk/lgnl/planning_and_building_control/conservation_and_urban_design/listed_buildings.aspx'), srcNow('Tower Hamlets Council, Residential Energy Efficiency Programme', 'https://www.towerhamlets.gov.uk/lgnl/environment_and_waste/Sustainability/Tower_Hamlets_Energy/Residential-Energy-Efficiency-Programme.aspx')],
      },
    ],
    faqs: (s) => [
      {
        q: 'Does my Tower Hamlets flat need a property licence?',
        a: 'If three or more people from two or more households live in it, it needs an additional licence, anywhere in the borough, until 31 March 2029. Five or more need a mandatory HMO licence. The selective scheme in Weavers, Whitechapel and Banglatown & Spitalfields closed to new applications after 30 September 2026.',
        links: [{ label: 'Tower Hamlets additional licensing', href: towerHamlets.additional.url, external: true }],
      },
      {
        q: 'What floor plan does a Tower Hamlets licence need?',
        a: 'Tower Hamlets lists floor plans of the property with room sizes among the documents to have ready when you apply. Tell us it is for a licence application when you book a floor plan.',
        links: [{ label: 'Tower Hamlets: what you need to apply', href: towerHamlets.apply.url, external: true }, { label: 'Our floor plans', href: '/services/floor-plans' }],
      },
      {
        q: 'Can you assess a Canary Wharf apartment?',
        a: 'Yes, at the same price as the rest of London. Tell us about the concierge or entry arrangements when you book. Details of the communal heating system and the controls in the flat help the assessment.',
      },
      {
        q: 'Does Tower Hamlets fund energy upgrades for homeowners?',
        a: 'Its Residential Energy Efficiency Programme offers free home energy upgrades to owner-occupiers, and at least one owner must live in the property. The council also funds a Home Energy Advice Programme with the Bromley by Bow Centre and SHINE. Neither is for landlords.',
        links: [{ label: 'Tower Hamlets Residential Energy Efficiency Programme', href: 'https://www.towerhamlets.gov.uk/lgnl/environment_and_waste/Sustainability/Tower_Hamlets_Energy/Residential-Energy-Efficiency-Programme.aspx', external: true }],
      },
      ...districtFaq(s, 'Tower Hamlets'),
    ],
  },

  camden: {
    districtNames: {
      NW3: 'Hampstead and Belsize Park',
      NW1: 'Camden Town and Regent’s Park',
      NW6: 'Kilburn and South Hampstead',
      NW5: 'Kentish Town and Gospel Oak',
      WC1H: 'Bloomsbury and Euston',
      WC1N: 'Bloomsbury',
      WC1X: 'King’s Cross',
      NW8: 'St John’s Wood',
      W1T: 'Fitzrovia',
      WC2H: 'Covent Garden and Seven Dials',
      N1C: 'King’s Cross Central',
      EC1N: 'Hatton Garden',
      N6: 'Highgate',
      WC1E: 'Bloomsbury and Euston',
    },
    neighbours: ['barnet', 'haringey', 'islington', 'city-of-london', 'westminster', 'brent'],
    standout: (s, london) => {
      const t = trend(s)
      return `Camden’s share rated A to C has not climbed the way London’s has: ${pct(t.from)} in ${t.first} and ${pct(t.to)} in ${t.last}, while London went from ${pct(london.byYear[t.first].pct.AtoC)} to ${pct(london.byYear[t.last].pct.AtoC)}. The latest year is a part year.`
    },
    stock: [
      'Camden mixes the large stuccoed and brick houses of Hampstead, Belsize Park and Primrose Hill, mansion blocks in Bloomsbury and St John’s Wood, and Victorian terraces cut into flats in Kentish Town and Kilburn. Estates from the 1960s and 1970s sit among them, and new blocks have gone up around King’s Cross.',
      'About half the borough is conservation area, so the outside of many homes cannot easily change. That does not alter the assessment: the certificate records the walls, glazing and heating as they stand. For mansion flats and estate flats, the heating controls and any communal system are what to have ready.',
    ],
    stockReading: (s, london) =>
      `${pct(s.age.pct.pre1930)} of Camden’s certificates are for homes built before 1930, against ${pct(london.age.pct.pre1930)} across London, and ${pct(s.walls.pct.solidUninsulated)} record solid walls with no added insulation, against ${pct(london.walls.pct.solidUninsulated)}. Fewer use a mains gas boiler (${pct(s.heating.pct.mainsGas)} against ${pct(london.heating.pct.mainsGas)}) and more have communal heating (${pct(s.heating.pct.communal)} against ${pct(london.heating.pct.communal)}).`,
    coverage: 'Camden Town, Regent’s Park, Hampstead, Belsize Park, Primrose Hill, Kentish Town, Gospel Oak, Kilburn, South Hampstead, Bloomsbury, King’s Cross, Fitzrovia and Highgate.',
    council: [
      {
        id: 'camden-licensing',
        heading: 'Letting in Camden: HMO licensing',
        paragraphs: [
          'Camden requires a mandatory licence for most properties occupied by five or more people from two or more households, whatever the number of storeys. Its additional HMO licensing scheme, the third borough-wide, started on 8 December 2025 and replaced the one that ran from December 2020 for five years.',
          'Additional licensing applies to any property occupied by three or more people from two or more households. It also covers buildings converted into flats that do not meet the 1991 Building Regulations, where less than half the flats are owner-occupied. Purpose-built blocks of three or more flats are outside mandatory licensing, but the council says every such flat must be licensed under the additional scheme.',
          'Camden says a failure to hold an HMO licence can bring a fixed penalty of up to £40,000, or an unlimited fine on prosecution.',
        ],
        sources: [camden.hmo],
      },
      {
        id: 'camden-conservation',
        heading: 'Conservation areas and Article 4 in Camden',
        paragraphs: [
          'Camden has 40 conservation areas, covering about half of the borough. To change a property in one, you will usually need planning permission and a heritage statement with the application. The council says it supports the sensitive retrofit of buildings in conservation areas and offers pre-application advice.',
          'Article 4 Directions remove some permitted development rights from houses and flats in Belsize, Fitzjohns Netherhall, Hampstead (including Frognal Way), Primrose Hill, South Hampstead (formerly Swiss Cottage), South Hill Park Estate, Dartmouth Park and Redington and Frognal. The council shows adoption dates from 1977 to 9 June 2026, so check which direction covers your street.',
        ],
        sources: [camden.conservation, camden.article4],
      },
      {
        id: 'camden-estates',
        heading: 'Listed homes, Belsize rules and landlord grants in Camden',
        paragraphs: [
          'Camden has more than 5,600 listed buildings, including the 1970s Alexandra Road Estate. Every part of a listed building is protected, inside as well as out. Belsize is mid-19th century Italianate villas, planned in pairs of three or four storeys plus a basement, with late 19th century red-brick streets in an Arts and Crafts style. Kentish Town is mainly terraced houses. The Holly Lodge Estate in Highgate follows a 1923 masterplan based on garden suburb principles.',
          'In Belsize, replacing front windows or doors with matching double-glazed ones needs planning permission under the Article 4 Direction, and the council charges no fee for those applications. The council’s design guides say draught-proofing, secondary glazing and roof insulation need no planning permission.',
          'Camden’s minimum energy efficiency standards support grant matches a landlord’s contribution up to £10,000 per building. The works must come from a valid EPC, ideally no more than 24 months old, and the grant asks for a certificate of future occupation, for renting for five years.',
        ],
        sources: [srcNow('Camden Council, listed buildings', 'https://www.camden.gov.uk/listed-buildings'), srcNow('Camden Council, Belsize area design guide, June 2026', 'https://www.camden.gov.uk/documents/d/guest/belsize-area-design-guide-june-2026'), srcNow('Camden Council, Belsize fact sheet, June 2026', 'https://www.camden.gov.uk/documents/d/guest/belsize-fact-sheet-june-2026'), srcNow('Camden Council, Holly Lodge Estate appraisal', 'https://www.camden.gov.uk/documents/20142/7616115/HollyLodgeAppraisal_Adopted+Dec+2012.pdf/088d6b35-acc9-eada-c373-198483f3e2c1'), srcNow('Camden Council, minimum energy efficiency standards support grant', 'https://www.camden.gov.uk/minimum-energy-efficiency-standards-support-grant')],
      },
    ],
    faqs: (s) => [
      {
        q: 'Do I need an HMO licence in Camden?',
        a: 'If three or more people from two or more households live in the property, yes: an additional licence for three or four, a mandatory licence for five or more. The additional scheme is borough-wide and started on 8 December 2025.',
        links: [{ label: 'Camden HMO licensing', href: camden.hmo.url, external: true }],
      },
      {
        q: 'Can I add insulation to a Camden home in a conservation area?',
        a: 'Often with consent. Camden says changes to a property in a conservation area usually need planning permission and a heritage statement, and that it supports sensitive retrofit. Article 4 Directions in places like Belsize and Hampstead take away more permitted development rights.',
        links: [{ label: 'Camden conservation areas', href: camden.conservation.url, external: true }, { label: 'Camden Article 4 Directions', href: camden.article4.url, external: true }],
      },
      {
        q: 'Do you assess mansion flats in Bloomsbury and St John’s Wood?',
        a: 'Yes. Have the heating controls, the boiler or communal system details and any evidence of glazing work ready. Each self-contained flat gets its own EPC.',
      },
      {
        q: 'Does Camden help landlords pay for energy improvements?',
        a: 'Camden’s minimum energy efficiency standards support grant matches a landlord’s contribution up to £10,000 per building. The works must be recommended by a valid EPC, ideally no more than 24 months old, so a current certificate comes first.',
        links: [{ label: 'Camden minimum energy efficiency standards support grant', href: 'https://www.camden.gov.uk/minimum-energy-efficiency-standards-support-grant', external: true }],
      },
      ...districtFaq(s, 'Camden', ' Some Camden districts are small, so read their figures with the certificate count beside them.'),
    ],
  },

  'barking-dagenham': {
    districtNames: {
      IG11: 'Barking and Barking Riverside',
      RM8: 'Dagenham Heathway and Chadwell Heath',
      RM10: 'Dagenham',
      RM9: 'Becontree',
      RM6: 'Chadwell Heath',
      RM7: 'Rush Green',
    },
    neighbours: ['newham', 'redbridge', 'havering'],
    standout: (s, london) =>
      `Barking & Dagenham ranks ${rankLabel('barking-dagenham', (b) => b.ratings.pct.AtoC)} of ${boroughCount} boroughs for the share rated A to C (${pct(s.ratings.pct.AtoC)} against ${pct(london.ratings.pct.AtoC)}). Its A to C share is lowest in ${spread(s).bottom.district}, at ${pct(spread(s).bottom.pctAtoC)}.`,
    stock: [
      'The Becontree estate, built from the 1920s as cottage-style council housing, shapes the borough: rows of houses with gardens, many now owned or let privately. Barking town centre has older terraces and flats, and Barking Riverside is new build on the old power station land.',
      'Becontree houses often have solid or early cavity walls. If the cavity has been filled or the loft topped up, receipts and installer certificates let the assessment record it. Without evidence, the method uses the walls and roof as they were built.',
    ],
    stockReading: (s, london) =>
      `${pct(s.age.pct.from1930to1966)} of Barking & Dagenham’s certificates are for homes built between 1930 and 1966, against ${pct(london.age.pct.from1930to1966)} across London. Flats and maisonettes are just ${pct(s.pctFlats)}, against ${pct(london.pctFlats)}. ${pct(s.walls.pct.cavityUninsulated)} record cavity walls with no insulation, against ${pct(london.walls.pct.cavityUninsulated)}.`,
    coverage: 'Barking, Barking Riverside, Dagenham, Dagenham Heathway, the Becontree estate, Chadwell Heath and Rush Green.',
    council: [
      {
        id: 'barkingdagenham-licensing',
        heading: 'Letting in Barking & Dagenham: three licences',
        paragraphs: [
          'Barking & Dagenham has three property licences. Mandatory HMO licensing covers five or more people from two or more households. Additional licensing, from 9 January 2025, covers three or four people from two or more households. Selective licensing, from 6 April 2025 to 5 April 2030, covers privately rented homes occupied by a single household in three designated areas.',
          'The council says selective licensing covers most privately rented properties across the three areas, and the designation notice names wards including Becontree, Barking Riverside, Chadwell Heath and Abbey. Ask the council’s licensing team to confirm your address.',
          'Improving the energy performance of licensed rented homes is one of the council’s stated scheme objectives. It aims at measurable improvements in EPC ratings of D or below.',
        ],
        sources: [barking.licensing, barking.need, barking.notice],
      },
      {
        id: 'barkingdagenham-conservation',
        heading: 'Conservation areas in Barking & Dagenham',
        paragraphs: [
          'The council lists four conservation areas: Abbey and Barking Town Centre, Abbey Road Riverside, Dagenham Village and Chadwell Heath Anti-aircraft Gun Site. The Becontree estate is not one of them.',
        ],
        sources: [barking.conservation],
      },
      {
        id: 'barkingdagenham-estates',
        heading: 'The Becontree estate, listings and landlord expectations in Barking & Dagenham',
        paragraphs: [
          'The council describes the Becontree estate as uniform terraces and cottages, mostly two to three storeys with pitched roofs. Common features are red brick or rendered facades, tall brick chimneys and tiled pitched roofs. It says there are about 29,000 homes on the estate. Becontree is not a conservation area: the council’s Local Plan treats it as a non-designated heritage asset.',
          'The council says new Article 4 Directions will be introduced in November 2026. One removes permitted development rights for porches across the Becontree estate, and another covers side and roof alterations on corner blocks. The council puts the application cost for a porch at £528 for a householder application, against £264 for a lawful development certificate today. The directions were not yet confirmed when we checked, so ask the planning team before starting work.',
          'Elsewhere, the borough has 45 statutory listed buildings and a local list of 123. In a conservation area, changing the profile of a roof, such as adding a dormer, and cladding in a different material need the council’s consent. Barking Town Centre is mainly shops with flats above, in red and brown brick. A separate Article 4 Direction has applied across the borough since 22 February 2022 to additional storeys on homes.',
          'The council tells landlords the property must be at EPC band E or better unless an exemption applies, and an EPC is one of the documents a licence application needs. Its Housing Strategy 2026 to 2031 says licensing and targeted inspections will be used to require minimum energy-efficiency expectations, with part-grant funding for landlords who need support.',
        ],
        sources: [srcNow('Barking and Dagenham Council, Article 4 Directions', 'https://www.lbbd.gov.uk/planning-building-control-and-local-land-charges/planning-guidance-and-policies/article-4'), srcNow('Barking and Dagenham Council, draft Becontree Estate design code consultation', 'https://www.lbbd.gov.uk/sites/default/files/2025-11/Draft%20Becontree%20Estate%20Supplementary%20Planning%20Document%20and%20Design%20Code%20Public%20Consultation.pdf'), srcNow('Barking and Dagenham Council, housing standards', 'https://www.lbbd.gov.uk/private-sector-housing/housing-standards'), srcNow('Barking and Dagenham Council, licence application process', 'https://www.lbbd.gov.uk/private-sector-housing/property-licensing/application-process'), srcNow('Barking and Dagenham Council, Housing Strategy 2026 to 2031', 'https://www.lbbd.gov.uk/sites/default/files/2026-03/Barking%20and%20Dagenham%20Housing%20Strategy%202026-2031.pdf')],
      },
    ],
    faqs: (s) => [
      {
        q: 'Does my Barking or Dagenham rental need a selective licence?',
        a: 'If it is let to a single household and sits in one of the three designated areas, yes. The scheme runs from 6 April 2025 to 5 April 2030. Its notice names wards across Becontree, Barking Riverside, Chadwell Heath and Abbey. The council’s licensing team can confirm an address.',
        links: [{ label: 'Barking and Dagenham: do I need a licence?', href: barking.need.url, external: true }],
      },
      {
        q: 'What is the additional HMO licence in Barking & Dagenham?',
        a: 'It covers shared homes with three or four people from two or more households, and has applied since 9 January 2025. Five or more need a mandatory HMO licence.',
        links: [{ label: 'Barking and Dagenham property licensing', href: barking.licensing.url, external: true }],
      },
      {
        q: 'Do you assess Becontree estate houses?',
        a: 'Yes, at the same price as the rest of London. If the cavity or loft has been insulated, keep the receipts or installer certificate to show on the visit. Without evidence, the method treats the walls and roof as originally built.',
      },
      {
        q: 'Will the Becontree porch rule affect my home?',
        a: 'If the council confirms it, planning permission will be needed to add a porch to any Becontree estate house, instead of the lawful development certificate used today. The council expects the directions in November 2026. Ask the planning team to confirm the status before you start work.',
        links: [{ label: 'Barking and Dagenham Article 4 Directions', href: 'https://www.lbbd.gov.uk/planning-building-control-and-local-land-charges/planning-guidance-and-policies/article-4', external: true }],
      },
      {
        q: 'Does the council need an EPC with a Barking and Dagenham licence application?',
        a: 'Yes. The council’s application process lists a valid, up-to-date EPC among the documents to have ready, with the tenancy agreement and the electrical installation condition report.',
        links: [{ label: 'Barking and Dagenham licence application process', href: 'https://www.lbbd.gov.uk/private-sector-housing/property-licensing/application-process', external: true }],
      },
      ...districtFaq(s, 'Barking & Dagenham'),
    ],
  },
}
