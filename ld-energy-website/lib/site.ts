export const site = {
  name: 'L&D Energy',
  /**
   * Parent/trading brand. NOT a registered company.
   *
   * The business operates as a SOLE TRADER: "Luminous & Deliver" is the trading
   * name, "L&D Energy" is the EPC brand under it. Every "Ltd", "registered
   * company" and "registered in England & Wales" claim was removed on
   * 2026-08-14 because none of them was true.
   *
   * `legalName` is deliberately absent from this object and from the schema:
   * there is no registered company name to assert, and the operator's personal
   * name belongs only in the legally required places (see `legal` below).
   */
  parentBrand: 'Luminous & Deliver',
  /**
   * Operator identity, confirmed by the owner 2026-08-14.
   *
   * NOT a registered company — never reintroduce "Ltd", "registered company",
   * "registered in England & Wales" or a company number.
   *
   * Equally, the business structure is NOT advertised. "Sole trader" must not
   * appear as a trust badge, tagline, footer label, schema description or
   * marketing statement anywhere. These strings identify the operator only
   * where that is genuinely required — data-controller disclosure, and legal
   * business identification in terms. The customer-facing identity everywhere
   * else is "L&D Energy".
   */
  legal: {
    operatorName: 'Abdul Motaleb Taher',
    /** Operator identification for terms and legal contexts. */
    statement:
      'L&D Energy is a trading name of Luminous & Deliver, operated by Abdul Motaleb Taher.',
    /** UK GDPR controller identification for the privacy policy. */
    dataController:
      'Abdul Motaleb Taher, trading as Luminous & Deliver / L&D Energy',
  },
  url: 'https://epc.luminousanddeliver.co.uk',
  description:
    'L&D Energy is an Elmhurst and Quidos accredited Domestic Energy Assessor providing official EPC certificates and laser-measured floor plans for residential properties across all 32 London boroughs. Transparent guide pricing, with your exact quote confirmed before booking.',
  phone: '07492 575 396',
  phoneIntl: '+447492575396',
  phoneHref: 'tel:+447492575396',
  whatsappHref: 'https://wa.me/447492575396',
  email: 'contact@luminousanddeliver.co.uk',
  emailHref: 'mailto:contact@luminousanddeliver.co.uk',
  hours: 'Monday–Sunday, 8am–8pm',
  address: {
    locality: 'Stratford',
    region: 'London',
    postalCode: 'E15',
    country: 'GB',
  },
  geo: { lat: 51.543, lng: -0.0005 },
  assessor: {
    name: 'Abdul Motaleb Taher',
    accreditationNumber: 'EES/036265',
    scheme: 'Elmhurst Energy Systems Ltd',
    /**
     * Accredited with two schemes (Abdul, 22/10/2026; both on the GOV.UK register).
     * Elmhurst stays first because the ID card, the software and the insurance
     * statements on the site are Elmhurst's.
     */
    accreditations: [
      { scheme: 'Elmhurst Energy Systems Ltd', short: 'Elmhurst', number: 'EES/036265', url: 'https://www.elmhurstenergy.co.uk' },
      { scheme: 'Quidos Limited', short: 'Quidos', number: 'QUID202220', url: 'https://quidos.co.uk' },
    ],
    qualification: 'Domestic Energy Assessor',
    // Official government register — the authoritative place to verify an assessor.
    // Parameterised so it lands on the record itself rather than a blank form.
    // Searching "Abdul Taher" lists both records (Elmhurst under Abdul Motaleb Taher,
    // Quidos under Abdul Taher); the full name finds only the Elmhurst one.
    // Last verified 2026-10-22. Fallback entry point if GOV.UK moves the path:
    // https://www.gov.uk/get-new-energy-certificate
    verifyUrl:
      'https://getting-new-energy-certificate.service.gov.uk/find-an-assessor/search-by-name?name=Abdul+Taher',
  },
  /**
   * Add-on services quoted alongside an EPC.
   *
   * `improvementPlan` is additional personalised interpretation and priorities,
   * supported by the full Elmhurst Energy Report. The standard EPC includes its
   * software-generated recommendation report independently of this add-on.
   * The Energy Report is included in the £35 product, never a separate charge.
   */
  addOns: {
    improvementPlan: 35,
    /**
     * Lodging a held Pre-Assessment survey as a real EPC afterwards, with no
     * second visit. Set equal to `improvementPlan` when Pre-Assessments cost the
     * EPC price, so the two routes to a lodged EPC-plus-advice cost the same.
     * Since the 22/10/2026 prices a Pre-Assessment costs £25 more than the EPC,
     * so Pre-Assessment then lodge costs £25 more than EPC + plan. It is still
     * never a cheaper back door to an ordinary EPC. Left at £35 pending Abdul.
     *
     * Conditional on nothing having changed at the property since the survey.
     * Any works since — extension, glazing, heating, insulation — need a fresh
     * visit with new photographs and measurements, priced as a new EPC.
     */
    lodgeLater: 35,
  },
  /**
   * Google Business Profile. Keep in sync with the live profile.
   *
   * `profileUrl` is still a share.google shortlink, which resolves to a Google
   * search URL rather than a canonical place page — it works for humans but is
   * not a usable `sameAs` entity reference. Replace with the long
   * maps.google.com/?cid=... form when available, and only then wire it into
   * schema. See the sameAs note in app/layout.tsx.
   *
   * The public search result currently displays the profile as
   * "L&D Energy – EPC & Energy Assessor London". That is NOT mirrored into the
   * site's brand or schema: the canonical entity name here stays "L&D Energy".
   * Whether that display name is what is entered in the dashboard, and whether
   * it satisfies Google's real-world-name policy, is a manual review item.
   */
  reviews: {
    // Visible Google Maps listing, checked 19/10/2026: 5.0 from 6 reviews. Update by hand
    // when the count changes; it is shown as text only, never as review markup.
    ratingValue: 5,
    reviewCount: 6,
    // Canonical place link (CID read from the listing 19/10/2026). Not yet wired into schema.
    profileUrl: 'https://maps.google.com/?cid=14054711842511866215',
    writeUrl: 'https://g.page/r/CWdJZan0XQzDEAI/review',
  },
} as const

export const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/services/domestic-epc', label: 'Domestic EPC' },
  { href: '/domestic-energy-assessor-london', label: 'Energy Assessor' },
  { href: '/services/floor-plans', label: 'Floor Plans' },
  { href: '/landlords', label: 'Landlords' },
  { href: '/estate-agents', label: 'Agents' },
  { href: '/sellers', label: 'Sellers' },
  { href: '/areas', label: 'Areas' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faq', label: 'FAQ' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const

/** Top-level desktop nav items (Services is a dropdown; others are direct links) */
export const topNav = [
  { href: '/areas', label: 'Areas' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faq', label: 'FAQ' },
  // The URL stays /blog for good; "Guides" is the label (plan PLAN-AREAS-GUIDES-2026-10-22 §8.1).
  { href: '/blog', label: 'Guides' },
  { href: '/contact', label: 'Contact' },
] as const

/** Grouped links for the Services menu (desktop dropdown + mobile drawer) */
export const servicesMenu = [
  {
    heading: 'Services',
    links: [
      { href: '/services/domestic-epc', label: 'Domestic EPC', desc: 'Lodged on the GOV.UK register' },
      { href: '/services/floor-plans', label: 'Floor Plans', desc: 'Laser-measured, JPG and PDF' },
      { href: '/services/epc-pre-assessment', label: 'EPC Pre-Assessment', desc: 'Your rating, kept off the register' },
      { href: '/services/epc-improvement-plan', label: 'EPC Improvement Plan', desc: `£${site.addOns.improvementPlan} add-on: what to fix first` },
    ],
  },
  {
    // One name per page, as in the header, in market order (audience-pages board, approved 23/10/2026).
    heading: 'Who it’s for',
    links: [
      { href: '/landlords', label: 'Landlords', desc: 'One let or a portfolio' },
      { href: '/estate-agents', label: 'Agents', desc: 'EPCs and floor plans, one home or a list' },
      { href: '/sellers', label: 'Sellers', desc: 'Ready before you list' },
    ],
  },
] as const

/**
 * Fixed speed extras, two of the few genuinely fixed numbers on the site. Each is
 * added to the confirmed quote, not to the guide estimate, and applies only to a
 * lodged EPC (on its own or in the bundle). Abdul, 22/10/2026:
 * - same-day lodgement: the EPC is lodged on the day of the visit (this £15
 *   option was "next-day lodgement" until then);
 * - next-day visit and lodgement: the visit is the next day and the EPC is
 *   lodged that day.
 */
export const SAME_DAY_LODGEMENT_SURCHARGE = 15

/**
 * Our promise (Abdul 23/10/2026): money off when we miss. lateChange matches the customer's own late-cancellation fee
 * (terms section 7). Conditions are in the terms, #our-promise; shown by components/sections/OurPromise.tsx.
 */
export const promise = { lateLodgement: 20, lateChange: 25 } as const
export const NEXT_DAY_VISIT_SURCHARGE = 35

/**
 * The floor plan disclaimer, shown wherever a floor plan is offered. Abdul's two wordings combined (23/10/2026).
 */
export const floorPlanDisclaimer =
  'Illustrative only and not to scale. Measurements are approximate and for guidance only, following RICS guidance; floor areas are calculated in accordance with RICS Property Measurement Standards. Do not rely on them for valuation, flooring or furnishing.'

/**
 * From this many homes in one enquiry, a landlord's list is quoted as a portfolio: each home priced by its size,
 * visits grouped by area and a lower price per home.
 */
export const portfolioMinHomes = 3

/**
 * Portfolio rates, approved by Abdul 24/10/2026 ("yes") after the research in Abdul-2
 * projects/ld-energy-redesign-2026-10/research/portfolio-rates-2026-10-24.md: off the EPC price only, never stacked,
 * never below the floor. `portfolioRatesText` is his approved wording; it is built from these numbers so the two
 * cannot drift, and the test in tests/portfolio-rates.test.cjs holds it to the approved sentence.
 */
export const portfolioRates = { smallMin: 3, smallMax: 5, smallOff: 5, largeMin: 6, largeOff: 10, sameBuildingOff: 15, floor: 55 } as const
const NUM: Record<number, string> = { 3: 'Three', 5: 'five', 6: 'Six' }
export const portfolioRatesText =
  `${NUM[portfolioRates.smallMin]} to ${NUM[portfolioRates.smallMax]} homes: £${portfolioRates.smallOff} off each EPC. ` +
  `${NUM[portfolioRates.largeMin]} or more: £${portfolioRates.largeOff} off each. ` +
  `Flats in the same building on the same day: £${portfolioRates.sameBuildingOff} off each after the first. ` +
  `That replaces the other discount, it doesn't add to it. Never less than £${portfolioRates.floor} an EPC. ` +
  'Floor plans and faster options stay full price.'

/**
 * CANONICAL PRICING SOURCE.
 *
 * Every figure here is an explicit GUIDE price, not a fixed quote. Internal
 * floor area (m²) is the pricing driver. Each band carries a muted bedroom
 * caption (`typicalLabel`) because customers recognise "2-bedroom flat" more
 * readily than "55–75 m²", but a room count never sets the price: the caption
 * is always secondary to the m² label and never appears on its own (Abdul,
 * 22/10/2026: captions back, kept subtle).
 *
 * The four services share one set of bands. A band runs from just over the
 * previous band's ceiling up to and including its own `areaMax`, so 40 m² is
 * "Up to 40 m²" and 40.5 m² is "Over 40–55 m²".
 *
 * Bundle prices are deliberately stored as explicit values rather than being
 * derived from a percentage of the EPC price. They used to be computed as
 * `epc * 1.5` (i.e. "floor plan half price"), which hard-coded a blanket
 * discount promise into the data model. Each band can now be priced
 * independently without that promise leaking back into the copy.
 *
 * `startingPrice` marks the open-ended top band: its figures are starting
 * prices, always shown with "From", never a fixed total, and they promise no
 * bundle saving.
 */
export interface PricingBand {
  /** Stable identifier, sent with an enquiry. See `areaBands` in lib/floor-area.ts. */
  id: string
  /** Primary pricing driver, e.g. 'Over 55–75 m²'. */
  areaLabel: string
  /** Familiar reference shown as a muted caption under `areaLabel`. Never lead with this. */
  typicalLabel: string
  /** Inclusive ceiling in m². null = open-ended top band. */
  areaMax: number | null
  epc: number
  floorPlan: number
  bundle: number
  /** Private, unlodged survey. Includes the personalised written improvement plan. */
  preAssessment: number
  startingPrice?: true
}

export const pricing: PricingBand[] = [
  { id: 'up-to-40', areaLabel: 'Up to 40 m²',    typicalLabel: 'Studios and compact flats',       areaMax: 40,   epc: 65,  floorPlan: 55,  bundle: 105, preAssessment: 90 },
  { id: '40-55',    areaLabel: 'Over 40–55 m²',  typicalLabel: '1-bedroom flats',                 areaMax: 55,   epc: 75,  floorPlan: 65,  bundle: 120, preAssessment: 100 },
  { id: '55-75',    areaLabel: 'Over 55–75 m²',  typicalLabel: '2-bedroom flats and small homes', areaMax: 75,   epc: 85,  floorPlan: 75,  bundle: 135, preAssessment: 110 },
  { id: '75-95',    areaLabel: 'Over 75–95 m²',  typicalLabel: '2–3-bedroom homes',               areaMax: 95,   epc: 95,  floorPlan: 90,  bundle: 155, preAssessment: 120 },
  { id: '95-115',   areaLabel: 'Over 95–115 m²', typicalLabel: '3–4-bedroom houses',              areaMax: 115,  epc: 105, floorPlan: 105, bundle: 175, preAssessment: 130 },
  { id: 'over-115', areaLabel: 'Over 115 m²',    typicalLabel: 'Large homes, 4+\u00a0bedrooms',  areaMax: null, epc: 120, floorPlan: 125, bundle: 210, preAssessment: 145, startingPrice: true },
]

/** The bands with fixed guide prices, i.e. every band except the open-ended top one. */
export const standardBands = pricing.filter((p) => !p.startingPrice)

/**
 * Largest genuine bundle saving across the standard bands. Derived, so the
 * marketing line ("save up to £X") can never drift from the table it
 * summarises. The top band is left out: its prices are starting points, so it
 * promises no specific saving.
 */
export const maxBundleSaving = Math.max(...standardBands.map((p) => p.epc + p.floorPlan - p.bundle))

/**
 * Genuine arithmetic difference between booking separately and as a bundle.
 * Derived from the explicit prices above, so it can never contradict them.
 * Never store a second savings table — every "Save £X" on the site comes
 * from here, and `maxBundleSaving` backs the "save up to £X" headline.
 */
export function bundleSaving(band: PricingBand): number {
  return band.epc + band.floorPlan - band.bundle
}

/**
 * Format a guide price for display. Whole pounds render bare (£65); anything
 * with pence renders to two places (£73.50, never £73.5).
 */
export function formatPrice(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

/** Lowest guide price across all bands, for "from £X" copy. */
export const priceFrom = {
  epc: Math.min(...pricing.map((p) => p.epc)),
  floorPlan: Math.min(...pricing.map((p) => p.floorPlan)),
  bundle: Math.min(...pricing.map((p) => p.bundle)),
  preAssessment: Math.min(...pricing.map((p) => p.preAssessment)),
}

/** The open-ended top band, whose figures are starting prices. */
export const topBand = pricing[pricing.length - 1]

/**
 * Brand share card from app/opengraph-image.tsx. A page that sets its own
 * openGraph/twitter replaces the layout's whole object, image included, so
 * every such page must pass this explicitly.
 */
export const defaultOgImage = {
  url: `${site.url}/opengraph-image`,
  width: 1200,
  height: 630,
  alt: `L&D Energy, Domestic EPC London from £${priceFrom.epc}`,
}

export const boroughs = [
  'stratford', 'hackney', 'tower-hamlets', 'newham', 'greenwich',
  'islington', 'southwark', 'lewisham', 'barking-dagenham',
  'waltham-forest', 'camden', 'westminster', 'lambeth', 'wandsworth',
  'brent', 'ealing', 'hounslow', 'richmond', 'kingston', 'croydon',
  'enfield', 'haringey', 'redbridge', 'havering', 'bexley', 'bromley',
  'sutton', 'merton', 'hammersmith-fulham', 'kensington-chelsea',
  'city-of-london', 'barnet', 'harrow', 'hillingdon',
] as const

/**
 * CANONICAL INSURANCE WORDING.
 *
 * Cover is arranged through Elmhurst Energy Systems Ltd's accredited-member
 * scheme and underwritten by Hiscox Insurance Company Limited. Elmhurst is NOT
 * the insurer, so never write "insured by Elmhurst" — the scheme is the route,
 * Hiscox carries the risk.
 *
 * Documentary evidence sighted 2026-08: Public & Products Liability £5,000,000
 * each and every claim, Professional Indemnity £5,000,000 any one claim, both
 * for the period 1 July 2026 to 30 June 2027. Re-verify at renewal.
 */
export const insurance = {
  /** Full sentence for body copy and trust panels. */
  full:
    'Professionally insured through Elmhurst’s accredited-member insurance scheme, including £5m Public Liability and £5m Professional Indemnity cover.',
  /** Compact form for badges and trust bars where space is tight. */
  short: 'DBS checked · £5m PI & PL insured',
  /** Neutral phrase for legal/terms context. */
  legal:
    'Professional Indemnity and Public Liability cover, each £5,000,000, is arranged through Elmhurst Energy’s accredited-member insurance scheme and underwritten by Hiscox Insurance Company Limited.',
} as const

/**
 * Authoritative GOV.UK sources cited on the site.
 *
 * Kept here so a superseded notice is corrected once rather than in every file
 * that links it. That has already happened once: the 15 June 2025 notice was
 * superseded by the 24 March 2026 notice, which still approves RdSAP10 for
 * existing dwellings in England and Wales. The 15 June 2025 *date* remains
 * correct as when RdSAP 10 took effect — only the notice to cite changed.
 *
 * Verified 2026-08-14.
 */
export const govUk = {
  /** Current notice of approval for calculation methodologies. */
  methodologyNotice:
    'https://www.gov.uk/government/publications/methodologies-for-expressing-the-energy-performance-of-buildings-in-england-and-wales-notice-of-approval-24-march-2026',
  /** Consumer-facing EPC guidance. */
  epcGuidance: 'https://www.gov.uk/buy-sell-your-home/energy-performance-certificates',
  findCertificate: 'https://www.gov.uk/find-energy-certificate',
  getCertificate: 'https://www.gov.uk/get-new-energy-certificate',
  meesLandlordGuidance:
    'https://www.gov.uk/guidance/domestic-private-rented-property-minimum-energy-efficiency-standard-landlord-guidance',
  /** January 2026 government response: C from 1 October 2030, £10,000 cap, £30,000 maximum fine, all needing legislation. Read 23/10/2026. */
  prsResponse2026:
    'https://www.gov.uk/government/consultations/improving-the-energy-performance-of-privately-rented-homes-2025-update/outcome/improving-the-energy-performance-of-privately-rented-homes-government-response-html',
  /** Date RdSAP 10 became the approved methodology for existing dwellings. */
  rdsap10EffectiveFrom: '15 June 2025',
} as const
