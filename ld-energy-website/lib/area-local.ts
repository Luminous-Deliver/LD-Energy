import type { AreaSummary } from './borough-stats-types'
import type { FaqItem } from './faq'
import { boroughCount, fmt, pct, rankLabel, rankOf } from './area-page'
import { d1Local } from './area-local-d1'

/**
 * Hand-written local content for rebuilt area pages: the parts no template can produce.
 * Council facts come from each council's own pages, read on the date in `checked`; a fact that
 * could not be confirmed there is left out. Figures are never typed here: each sentence that
 * needs one takes it from lib/borough-stats.ts through `s` (this area) and `london`.
 */

export interface CouncilSource {
  label: string
  url: string
  /** Date the page was read (YYYY-MM-DD). */
  checked: string
}

export interface CouncilSection {
  id: string
  heading: string
  paragraphs: string[]
  list?: { intro: string; items: string[] }
  sources: CouncilSource[]
}

export interface AreaLocal {
  /** Places by postcode district, for the coverage table. Districts not listed show the code only. */
  districtNames: Record<string, string>
  /** Neighbouring area pages that share a real border. */
  neighbours: string[]
  /** One or two sentences reading this area's figures; written per area, numbers from the data. */
  standout: (s: AreaSummary, london: AreaSummary) => string
  /** What the housing is like and what that means for the assessment. */
  stock: string[]
  /** A reading of this area's age, wall and heating figures against London; written per area, numbers from the data. */
  stockReading: (s: AreaSummary, london: AreaSummary) => string
  coverage: string
  council: CouncilSection[]
  /** Questions with answers specific to this area. */
  faqs: (s: AreaSummary) => FaqItem[]
}

const CHECKED = '2026-10-22'

const newhamLicensingSources: CouncilSource[] = [
  { label: 'Newham Council, selective licensing designation notice 2023', url: 'https://www.newham.gov.uk/downloads/file/5490/lb-public-notice-a4-short-v4', checked: CHECKED },
  { label: 'Newham Council, apply for a property licence', url: 'https://www.newham.gov.uk/landlords-newham/rented-property-licensing', checked: CHECKED },
  { label: 'Newham Council, licence fees and charges', url: 'https://www.newham.gov.uk/landlords-newham/rented-property-licensing/9', checked: CHECKED },
]

const newhamConservation: CouncilSource = {
  label: 'Newham Council, conservation areas and listed buildings',
  url: 'https://www.newham.gov.uk/planning-development-conservation/conservation-areas-listed-buildings-newham',
  checked: CHECKED,
}

const croydonSources = {
  schemes: { label: 'Croydon Council, about our new housing licensing schemes', url: 'https://www.croydon.gov.uk/housing/landlords-and-managing-agents/property-licensing-schemes/about-our-new-housing-licensing-schemes', checked: CHECKED },
  selective: { label: 'Croydon Council, Selective Licensing Scheme 2026', url: 'https://www.croydon.gov.uk/housing/landlords-and-managing-agents/property-licensing-schemes/selective-licensing-scheme-2026', checked: CHECKED },
  guidance: { label: 'Croydon Council, guidance notes for an application for a property licence', url: 'https://www.croydon.gov.uk/housing/landlords/houses-multiple-occupation-hmo/standards-hmos/guidance/guidance-notes-application-property-licence', checked: CHECKED },
}

function district(s: AreaSummary, code: string) {
  return s.districts.find((d) => d.district === code)
}

export const areaLocal: Record<string, AreaLocal> = {
  ...d1Local,
  stratford: {
    districtNames: {
      E15: 'Stratford, Maryland and Forest Lane',
      E20: 'East Village and the Queen Elizabeth Olympic Park',
    },
    neighbours: ['newham', 'hackney', 'tower-hamlets', 'waltham-forest'],
    standout: (s) => {
      const e20 = district(s, 'E20')
      const e15 = district(s, 'E15')
      if (!e20 || !e15) return ''
      const e20Line = e20.pctAtoC === 100
        ? `Every one of the ${fmt(e20.n)} certificates in E20, the Olympic Park side of Stratford, is rated A to C.`
        : `In E20, the Olympic Park side of Stratford, ${pct(e20.pctAtoC)} of ${fmt(e20.n)} certificates are rated A to C.`
      return `${e20Line} Across the older streets of E15 the figure is ${pct(e15.pctAtoC)}, from ${fmt(e15.n)} certificates.`
    },
    stock: [
      'Stratford spans the East Village apartments of the former athletes’ village, 2010s towers around the International Quarter, long Victorian terraces near Maryland and Forest Lane, and post-war ex-local-authority blocks. New E20 stock sits a short walk from much older E15 terraced streets.',
      'For East Village and International Quarter apartments, details of the communal heating and any heating controls you can reach help the assessment. For Maryland terraces, evidence of insulation, extensions and loft conversions can be relevant. The rating comes from the construction and the systems recorded at the visit; an E15 or E20 postcode does not decide it.',
    ],
    stockReading: (s, london) =>
      `${pct(s.walls.pct.systemBuilt)} of Stratford’s certificates record system-built walls, against ${pct(london.walls.pct.systemBuilt)} across London, and ${pct(s.heating.pct.communal)} record communal heating, against ${pct(london.heating.pct.communal)}. Both fit a place where ${pct(s.pctFlats)} of certificates are for flats or maisonettes.`,
    coverage: 'Stratford town centre, Maryland and Forest Lane in E15, and East Village and the Queen Elizabeth Olympic Park in E20. We are based in E15.',
    council: [
      {
        id: 'stratford-licensing',
        heading: 'Letting in Stratford: which Newham licence applies',
        paragraphs: [
          'Stratford is in the London Borough of Newham, and Newham licenses most private rentals. Its selective licensing scheme, for homes let to one household or to two sharers, came into force on 1 June 2023 and runs to 31 May 2028.',
          'The scheme covers 22 of Newham’s 24 wards, including the Stratford and Maryland wards. The Stratford Olympic Park ward is one of the two it leaves out, with Royal Victoria. Shared houses come under Newham’s HMO licensing instead.',
          'Newham’s online application will not let you continue without the property’s certificates: an Energy Performance Certificate, a gas safety certificate and an electrical installation condition report (EICR).',
        ],
        sources: newhamLicensingSources.slice(0, 2),
      },
      {
        id: 'stratford-conservation',
        heading: 'Conservation areas in Stratford',
        paragraphs: [
          'Three of Newham’s nine conservation areas are in Stratford E15: Stratford St John’s, Sugar House Lane and University. In a conservation area Newham says you may need planning permission for work that would not normally need it, such as changing windows or doors.',
          'If an EPC recommendation involves the outside of a home in one of these areas, check with Newham’s planning team before the work is booked. Newham notes that Sugar House Lane was in the area formerly covered by the London Legacy Development Corporation.',
        ],
        sources: [newhamConservation],
      },
    ],
    faqs: (s) => {
      const e20 = district(s, 'E20')
      const e15 = district(s, 'E15')
      return [
        {
          q: 'Does my Stratford rental need a property licence?',
          a: 'If it is in the Stratford or Maryland ward and let to one household or two sharers, Newham’s selective licensing scheme applies until 31 May 2028. The Stratford Olympic Park ward is outside that scheme. Shared houses need an HMO licence instead. Newham’s licensing team can confirm which applies to your address.',
          links: [{ label: 'Newham licensing designation (PDF)', href: newhamLicensingSources[0].url, external: true }],
        },
        ...(e20 && e15 ? [{
          q: 'How do homes in E15 and E20 compare?',
          a: `In E20, ${pct(e20.pctAtoC)} of the ${fmt(e20.n)} certificates lodged since January 2023 are rated A to C, with a typical size of ${e20.medianArea} m². In E15 it is ${pct(e15.pctAtoC)} of ${fmt(e15.n)}, with a typical size of ${e15.medianArea} m². Most E20 homes are recent apartments; E15 mixes Victorian terraces, post-war blocks and newer flats.`,
        }] : []),
        {
          q: 'Do you cover East Village and the Olympic Park?',
          a: 'Yes. E20 is next to our base in E15, and the price is the same as anywhere else in London. For a flat in a managed block, tell us about the concierge or entry arrangements when you book so the visit can be set up.',
        },
        {
          q: 'Do I need planning permission to change windows in a Stratford conservation area?',
          a: 'Possibly. Newham says work that would not normally need planning permission, such as changing windows or doors, may need it in a conservation area. Stratford St John’s, Sugar House Lane and University are the three in E15.',
          links: [{ label: 'Newham conservation areas', href: newhamConservation.url, external: true }],
        },
      ]
    },
  },

  newham: {
    districtNames: {
      E6: 'East Ham and Beckton',
      E7: 'Forest Gate',
      E12: 'Manor Park',
      E13: 'Plaistow',
      E15: 'Stratford and Maryland',
      E16: 'Canning Town, Custom House and the Royal Docks',
      E20: 'Queen Elizabeth Olympic Park',
    },
    neighbours: ['tower-hamlets', 'hackney', 'waltham-forest', 'redbridge', 'barking-dagenham', 'greenwich'],
    standout: (s) => {
      const rank = rankOf('newham', (b) => b.privateRented.n)
      const lead = rank === 1
        ? `More EPCs were lodged for privately rented homes in Newham in this period than in any other London borough: ${fmt(s.privateRented.n)}.`
        : `Newham had ${fmt(s.privateRented.n)} EPCs lodged for privately rented homes in this period, the ${rankLabel('newham', (b) => b.privateRented.n)} most of ${boroughCount} London boroughs.`
      const ratio = s.pctSales > 0 ? (s.pctLettings / s.pctSales).toFixed(1) : null
      return `${lead}${ratio ? ` Lettings outnumber marketed sales by about ${ratio} to 1.` : ''}`
    },
    stock: [
      'Newham is built around long Victorian terraces in Forest Gate, East Ham and Plaistow, the Royal Docks and Royal Wharf developments, and a large stock of ex-local-authority homes and houses converted into flats or HMOs.',
      'The assessment records the actual construction, insulation and heating of each home. For a converted house, say which rooms form the flat and how its heating and access work. For Royal Docks apartments on a communal system, any information you have about the system is useful.',
    ],
    stockReading: (s, london) =>
      `More of Newham’s homes are heated by a mains gas boiler than across London (${pct(s.heating.pct.mainsGas)} against ${pct(london.heating.pct.mainsGas)}), and fewer by electric heating (${pct(s.heating.pct.electric)} against ${pct(london.heating.pct.electric)}). ${pct(s.age.pct.from1930to1966)} were built between 1930 and 1966, compared with ${pct(london.age.pct.from1930to1966)} across London.`,
    coverage: 'Forest Gate, East Ham, Beckton, Plaistow, Manor Park, Canning Town, Custom House, the Royal Docks and Stratford, where we are based.',
    council: [
      {
        id: 'newham-licensing',
        heading: 'Letting in Newham: licences and the EPC',
        paragraphs: [
          'Newham runs selective licensing for homes let to one household or two sharers in 22 of its 24 wards, from 1 June 2023 to 31 May 2028. Royal Victoria and Stratford Olympic Park are the two wards left out. Its additional HMO licensing scheme for shared houses started on 1 January 2023.',
          'To apply online you upload the property’s certificates before you can submit: an Energy Performance Certificate, a gas safety certificate and an EICR.',
          'The rating can change the fee. A selective licence costs £750 for up to five years, and a licence holder who is an accredited landlord with an EPC of C or above can bring the online fee down to £650. The discount needs the certificate uploaded with the application.',
        ],
        sources: newhamLicensingSources,
      },
      {
        id: 'newham-conservation',
        heading: 'Conservation areas in Newham',
        paragraphs: [
          'Newham has nine conservation areas, among them the Woodgrange Estate, Forest Gate Town Centre and Romford Road in E7, East Ham in E6 and Durham Road in Manor Park. Changing windows or doors in one of them may need planning permission that the same work elsewhere would not.',
        ],
        sources: [newhamConservation],
      },
    ],
    faqs: (s) => {
      const ranked = [...s.districts].sort((a, b) => b.pctAtoC - a.pctAtoC)
      const top = ranked[0]
      const bottom = ranked[ranked.length - 1]
      return [
        {
          q: 'Do I need an EPC for a Newham property licence?',
          a: 'Yes. Newham’s online application asks you to upload an Energy Performance Certificate, along with a gas safety certificate and an electrical installation condition report, before you can submit it.',
          links: [{ label: 'Newham: apply for a property licence', href: newhamLicensingSources[1].url, external: true }],
        },
        {
          q: 'Do you assess flats in converted Newham houses?',
          a: 'Yes. For a house split into flats, tell us which rooms belong to the flat being assessed and how its heating and entrance work. Each self-contained flat gets its own EPC.',
        },
        {
          q: 'Does a better EPC rating lower the Newham licence fee?',
          a: 'It can. The selective licence is £750 for up to five years. If the licence holder is an accredited landlord and the home has an EPC of C or above, the online fee comes down to £650. Proof of both is uploaded with the application.',
          links: [{ label: 'Newham licence fees', href: newhamLicensingSources[2].url, external: true }],
        },
        ...(top && bottom && top !== bottom ? [{
          q: 'Which parts of Newham rate highest?',
          a: `Of the postcode districts with enough certificates to compare, ${top.district} has the highest share rated A to C at ${pct(top.pctAtoC)}, and ${bottom.district} the lowest at ${pct(bottom.pctAtoC)}. The table above has every district.`,
        }] : []),
      ]
    },
  },

  croydon: {
    districtNames: {
      CR0: 'central Croydon, Addiscombe and Shirley',
      CR2: 'South Croydon, Sanderstead and Selsdon',
      CR5: 'Coulsdon',
      CR7: 'Thornton Heath',
      CR8: 'Purley and Kenley',
      SE19: 'Upper Norwood',
      SE25: 'South Norwood',
      SW16: 'Norbury',
    },
    neighbours: ['lambeth', 'bromley', 'merton', 'sutton'],
    standout: (s, london) => {
      const below = s.ratings.pct.AtoC < london.ratings.pct.AtoC
      const fgRank = rankLabel('croydon', (b) => b.ratings.pct.FtoG)
      return `${below ? 'That puts Croydon below the London average' : 'That puts Croydon above the London average'}, and ${pct(s.ratings.pct.FtoG)} of its certificates are F or G, the ${fgRank} highest share of ${boroughCount} boroughs.`
    },
    stock: [
      'Croydon spans Victorian and Edwardian terraces in Thornton Heath and South Norwood, 1930s semis across Addiscombe and Shirley, larger houses in Purley and Kenley, and the flats and towers of the town centre.',
      'Where cavity, loft or wall insulation has been added since a house was built, receipts, installer certificates or photos let the assessment record it. Without evidence of insulation added later, the method treats walls and roofs as they were originally built.',
    ],
    stockReading: (s, london) => {
      const big = s.sizeBands.find((b) => b.id === 'over-115')?.pct ?? 0
      const bigLondon = london.sizeBands.find((b) => b.id === 'over-115')?.pct ?? 0
      return `Croydon has more houses than London as a whole: ${pct(s.pctFlats)} of its certificates are for flats or maisonettes, against ${pct(london.pctFlats)} across London, and ${pct(big)} are for homes over 115 m², against ${pct(bigLondon)}. ${pct(s.walls.pct.cavityUninsulated)} record cavity walls with no insulation, above the London share of ${pct(london.walls.pct.cavityUninsulated)}.`
    },
    coverage: 'Central Croydon, Addiscombe, Shirley, Thornton Heath, South Norwood, Upper Norwood, Norbury, South Croydon, Sanderstead, Selsdon, Purley, Kenley and Coulsdon.',
    council: [
      {
        id: 'croydon-licensing',
        heading: 'Letting in Croydon: the licensing schemes from 25 September 2026',
        paragraphs: [
          'Two new licensing schemes came into force in Croydon on 25 September 2026. Selective licensing covers homes let to one household, a single tenant or two sharers in 14 wards. Additional HMO licensing covers shared houses with three or four people, on top of the existing mandatory HMO licence for five or more.',
          'The council says landlords will typically have until 31 December 2026 to apply before it enforces. Croydon also has an Article 4 Direction for smaller HMOs, so turning a house into an HMO may need planning permission as well as a licence.',
        ],
        list: {
          intro: 'The 14 wards in the selective scheme:',
          items: ['Addiscombe East', 'Addiscombe West', 'Bensham Manor', 'Broad Green', 'Fairfield', 'Norbury and Pollards Hill', 'Norbury Park', 'Selhurst', 'South Croydon', 'South Norwood', 'Thornton Heath', 'Waddon', 'West Thornton', 'Woodside'],
        },
        sources: [croydonSources.schemes, croydonSources.selective, croydonSources.guidance],
      },
      {
        id: 'croydon-floor-plan',
        heading: 'The floor plan a Croydon licence application asks for',
        paragraphs: [
          'Croydon’s guidance for property licence applications asks for a floor plan uploaded with the application. It has to show every floor level, room, window, door and staircase, with what each room is used for and its size in square metres.',
          'We draw laser-measured floor plans and can measure on the same visit as the EPC. If the plan is for a Croydon licence application, say so when you book so we can check it shows everything the council lists.',
        ],
        sources: [croydonSources.guidance],
      },
    ],
    faqs: (s) => {
      const ranked = [...s.districts].sort((a, b) => b.pctAtoC - a.pctAtoC)
      const top = ranked[0]
      const bottom = ranked[ranked.length - 1]
      return [
        {
          q: 'Do I need a licence to let my home in Croydon?',
          a: 'Since 25 September 2026, homes let to one household or two sharers in 14 Croydon wards need a selective licence, and shared houses with three or four people need an additional HMO licence. Croydon says landlords will typically have until 31 December 2026 to apply.',
          links: [{ label: 'Croydon Selective Licensing Scheme 2026', href: croydonSources.selective.url, external: true }],
        },
        {
          q: 'Do you cover Purley, Kenley and Coulsdon?',
          a: 'Yes. All of Croydon is covered at the same prices as the rest of London, including Purley and Kenley in CR8 and Coulsdon in CR5, with no travel charge.',
        },
        {
          q: 'What floor plan does a Croydon licence application need?',
          a: 'Croydon asks for a floor plan showing all floor levels, rooms, windows, doors and stairs, with room uses and room sizes in square metres, uploaded with the application. Tell us it is for a licence application when you book a floor plan.',
          links: [{ label: 'Croydon application guidance', href: croydonSources.guidance.url, external: true }, { label: 'Our floor plans', href: '/services/floor-plans' }],
        },
        ...(top && bottom && top !== bottom ? [{
          q: 'Which Croydon postcodes rate lowest?',
          a: `Of the districts with enough certificates to compare, ${bottom.district} has the lowest share rated A to C at ${pct(bottom.pctAtoC)}, with a typical size of ${bottom.medianArea} m². ${top.district} has the highest at ${pct(top.pctAtoC)}. The table above has every district.`,
        }] : []),
      ]
    },
  },
}
