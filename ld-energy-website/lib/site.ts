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
    'L&D Energy is an Elmhurst-accredited Domestic Energy Assessor providing official EPC certificates and laser-measured floor plans for residential properties across all 32 London boroughs. Transparent guide pricing, with your exact quote confirmed before booking.',
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
    qualification: 'Domestic Energy Assessor',
    // Official government register — the authoritative place to verify an assessor.
    // Parameterised so it lands on the record itself rather than a blank form.
    // Last verified 2026-08-13. Fallback entry point if GOV.UK moves the path:
    // https://www.gov.uk/get-new-energy-certificate
    verifyUrl:
      'https://getting-new-energy-certificate.service.gov.uk/find-an-assessor/search-by-name?name=Abdul+Motaleb+Taher',
  },
  /**
   * Add-on services quoted alongside an EPC.
   *
   * `improvementPlan` covers three deliverables, not one: the improvement
   * recommendations left on the lodged certificate, the Elmhurst Energy Report
   * (which costs ~£9 to output and is the only source of the end-use cost
   * split, the CO2 graph and the HTC figure), and our own written plan ranking
   * the measures for that specific building.
   *
   * Priced at £35 rather than £25 as a packaging decision, not a margin one:
   * £25 without the Energy Report nets £25, £35 with it nets £26. For the same
   * income the customer receives materially more, so the Energy Report is
   * always bought. It is a cost of goods, never a separate quote line.
   */
  addOns: {
    improvementPlan: 35,
    /**
     * Lodging a held Pre-Assessment survey as a real EPC afterwards, with no
     * second visit. Set equal to `improvementPlan` deliberately: it makes the
     * two routes to a lodged EPC-plus-advice cost the same (EPC + plan, or
     * Pre-Assessment then lodge), so the Pre-Assessment cannot become a
     * cheaper back door to an ordinary EPC.
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
    ratingValue: 5,
    reviewCount: 3,
    profileUrl: 'https://share.google/ZopGGHvr6wBiGbT4A',
    writeUrl: 'https://g.page/r/CWdJZan0XQzDEAI/review',
  },
} as const

export const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/services/domestic-epc', label: 'Domestic EPC' },
  { href: '/domestic-energy-assessor-london', label: 'Energy Assessor' },
  { href: '/services/floor-plans', label: 'Floor Plans' },
  { href: '/landlords', label: 'For Landlords' },
  { href: '/sellers', label: 'For Sellers' },
  { href: '/estate-agents', label: 'For Agents' },
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
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
] as const

/** Grouped links for the Services menu (desktop dropdown + mobile drawer) */
export const servicesMenu = [
  {
    heading: 'Services',
    links: [
      { href: '/services/domestic-epc', label: 'Domestic EPC', desc: 'Lodged on the GOV.UK register' },
      { href: '/services/floor-plans', label: 'Floor Plans', desc: 'Laser-measured, portal-ready' },
      { href: '/services/epc-pre-assessment', label: 'EPC Pre-Assessment', desc: 'Your score, without lodging it' },
      { href: '/domestic-energy-assessor-london', label: 'Energy Assessor', desc: 'Your accredited London DEA' },
    ],
  },
  {
    heading: 'Who we help',
    links: [
      { href: '/landlords', label: 'For Landlords', desc: 'Stay compliant & avoid fines' },
      { href: '/sellers', label: 'For Sellers', desc: 'Boost your listing appeal' },
      { href: '/estate-agents', label: 'For Agents', desc: 'EPC partner for new instructions' },
    ],
  },
] as const

export type PropertyType = 'studio' | '1-bed' | '2-bed' | '3-bed' | '4-bed' | '5-bed-plus'

/**
 * Fixed surcharge for next-day (express) delivery. This is one of the few
 * genuinely fixed numbers on the site — it is added to the confirmed quote,
 * not to the guide estimate.
 */
export const EXPRESS_SURCHARGE = 15

/**
 * CANONICAL PRICING SOURCE.
 *
 * Every figure here is an explicit GUIDE price, not a fixed quote. Internal
 * floor area (m²) is the real pricing driver; the bedroom label exists only
 * because customers recognise "2 bedroom" more readily than "52–70 m²".
 *
 * Bundle prices are deliberately stored as explicit values rather than being
 * derived from a percentage of the EPC price. They used to be computed as
 * `epc * 1.5` (i.e. "floor plan half price"), which hard-coded a blanket
 * discount promise into the data model. Each band can now be priced
 * independently without that promise leaking back into the copy.
 *
 * `express` is optional per band and falls back to EXPRESS_SURCHARGE.
 */
export interface PricingBand {
  type: PropertyType
  /** Familiar bedroom reference. Secondary to floor area — never lead with this. */
  label: string
  /** Primary pricing driver, e.g. '52–70 m²'. */
  areaLabel: string
  areaMin: number
  /** null = open-ended top band. */
  areaMax: number | null
  /** Muted caption used beneath the area figure. */
  typicalLabel: string
  epc: number
  floorPlan: number
  bundle: number
  duration: string
  express?: number
}

export const pricing: PricingBand[] = [
  { type: 'studio',     label: 'Studio',        areaLabel: 'Up to 37 m²', areaMin: 0,   areaMax: 37,   typicalLabel: 'Studio and compact flats',                     epc: 65,  floorPlan: 55,  bundle: 105, duration: '45 minutes' },
  { type: '1-bed',      label: '1 bedroom',     areaLabel: '38–52 m²',    areaMin: 38,  areaMax: 52,   typicalLabel: '1-bedroom flats',                              epc: 75,  floorPlan: 65,  bundle: 120, duration: '45–60 minutes' },
  { type: '2-bed',      label: '2 bedroom',     areaLabel: '53–70 m²',    areaMin: 53,  areaMax: 70,   typicalLabel: '2-bedroom flats and small homes',              epc: 85,  floorPlan: 75,  bundle: 135, duration: '45–60 minutes' },
  { type: '3-bed',      label: '2–3 bedroom',   areaLabel: '71–95 m²',    areaMin: 71,  areaMax: 95,   typicalLabel: '2–3-bedroom homes',                            epc: 95,  floorPlan: 90,  bundle: 155, duration: '1–1.5 hours' },
  { type: '4-bed',      label: '3–4 bedroom',   areaLabel: '96–120 m²',   areaMin: 96,  areaMax: 120,  typicalLabel: '3-bedroom houses and compact 4-bedroom homes', epc: 105, floorPlan: 105, bundle: 175, duration: '1.5–2 hours' },
  { type: '5-bed-plus', label: '4–5+ bedroom',  areaLabel: '121 m²+',     areaMin: 121, areaMax: null, typicalLabel: 'Large homes and 4–5+ bedrooms',                epc: 125, floorPlan: 125, bundle: 215, duration: '1.5–2 hours' },
]

/**
 * Largest genuine bundle saving across all bands. Derived, so the marketing
 * line ("save up to £X") can never drift from the table it summarises.
 */
export const maxBundleSaving = Math.max(...pricing.map((p) => p.epc + p.floorPlan - p.bundle))

/** Express fee for a band — per-band override, else the standard surcharge. */
export function expressFee(band: PricingBand): number {
  return band.express ?? EXPRESS_SURCHARGE
}

/** Guide price for an EPC delivered next day. Derived, never stored. */
export function nextDayGuide(band: PricingBand): number {
  return band.epc + expressFee(band)
}

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
  /** Date RdSAP 10 became the approved methodology for existing dwellings. */
  rdsap10EffectiveFrom: '15 June 2025',
} as const
