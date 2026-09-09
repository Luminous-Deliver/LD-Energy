import { pricing, site, EXPRESS_SURCHARGE } from '@/lib/site'

export interface FaqItem {
  q: string
  /**
   * Canonical plain-text answer. Consumed verbatim by both the rendered
   * accordion and the FAQPage JSON-LD, so the two can never drift.
   */
  a: string
  /**
   * Optional contextual links rendered beneath the answer text. Deliberately
   * separate from `a` rather than embedded as JSX: schema needs plain text,
   * and inlining markup would force a second, drift-prone copy of the answer.
   */
  links?: Array<{ href: string; label: string; external?: boolean }>
}

export const homepageFaq: FaqItem[] = [
  {
    q: 'How long is an EPC valid for?',
    a: 'An EPC is valid for 10 years from the date of issue. After 10 years, you’ll need a new EPC if you’re selling or letting the property.',
  },
  {
    q: 'Do I need an EPC to sell my house in London?',
    a: 'Yes. You’re legally required to have a valid EPC before marketing your property for sale in England and Wales. Estate agents cannot legally list your property without one.',
  },
  {
    q: 'Do I need an EPC to rent out my property?',
    a: 'Yes. Under MEES regulations, landlords must have a valid EPC rated E or above to legally let a property in England and Wales. Letting without one can result in fines up to £5,000 per property.',
  },
  {
    q: 'How much does an EPC cost in London?',
    a: `Guide EPC prices in London start at £${pricing[0].epc} for properties up to 37 m² and rise with internal floor area, up to £${pricing[5].epc} for homes over 121 m². Internal floor area (m²) is the main pricing factor — bedroom count is only a familiar reference. Next-day lodgement is available for £${EXPRESS_SURCHARGE} extra, and your exact quote is confirmed before booking.`,
  },
  {
    q: 'How long does an EPC assessment take?',
    a: 'Most assessments take 45–60 minutes for a flat or standard house, rising to around 2 hours for a large 5+ bedroom property. It goes fastest when every room, the loft hatch, the boiler and the meters are accessible. We’ll give you an accurate time estimate when you book.',
  },
  {
    q: 'How quickly will I receive my EPC certificate?',
    a: `Standard lodgement is within 72 hours of the assessment. Our next-day service lodges your certificate within 24 hours for an additional £${EXPRESS_SURCHARGE}.`,
  },
  {
    q: 'What does the assessor check during an EPC?',
    a: 'Our assessor measures the property, then records construction details, insulation, heating systems, hot water, lighting, windows, and ventilation. No preparation is needed from you, just normal access to all rooms.',
  },
  {
    q: 'Can I improve my EPC rating?',
    a: 'Yes. Your EPC includes specific improvement recommendations. Common cost-effective upgrades include loft insulation, LED lighting, cavity wall insulation, and modern condensing boilers.',
  },
  {
    q: 'What are MEES regulations?',
    a: 'Minimum Energy Efficiency Standards (MEES) require all rental properties in England and Wales to have an EPC rating of E or above. Government has set out an aim of raising this to band C for privately rented homes by 2030, on a phased basis. That is not yet law.',
  },
  {
    q: 'Can I get a same-day or next-day EPC in London?',
    a: `Often, yes. Next-day lodgement is available for £${EXPRESS_SURCHARGE} extra, and same-day slots are regularly available across London when you book early in the day. Call or WhatsApp ${site.phone} and we’ll tell you straight away what’s free.`,
  },
  {
    q: 'When is an EPC legally required?',
    a: 'Whenever a property is marketed for sale or rent in England and Wales, and at the start of a new tenancy. It must be commissioned before marketing begins, so it’s best to book as soon as you decide to sell or let.',
  },
  {
    q: 'How do I get my property to EPC band C?',
    a: `It depends on the building — for most London homes it’s a combination of insulation, heating controls, and lighting, done in the right order. Our £${site.addOns.improvementPlan} EPC Improvement Plan is written up after your assessment and covers exactly that: what would realistically lift your rating, what each measure costs to install, where your energy money currently goes, and what to do first.`,
  },
  {
    q: 'Can I find out my rating without it going on the public register?',
    a: `Yes — that is an EPC Pre-Assessment. We carry out the full survey exactly as we would for a real EPC, but we do not lodge it, so no certificate is published and nothing appears on the GOV.UK register. You get the score, a breakdown of what is holding it back, and a written improvement plan. It is priced on the same floor-area bands as an EPC because it is the same visit and the same measuring. If you decide you want the certificate afterwards, we can usually lodge the same survey for £${site.addOns.lodgeLater} without a second visit, as long as nothing at the property has changed. It is not a substitute for an EPC where one is legally required, such as marketing a property for sale or rent.`,
  },
  {
    q: 'How do I check my assessor is genuinely accredited?',
    a: 'Every UK domestic energy assessor appears on the official government register. Our assessor is Abdul Motaleb Taher, accreditation number EES/036265, accredited through Elmhurst Energy — you can look this up yourself on the government’s find-an-assessor service before you book.',
  },
  {
    q: 'Which areas of London do you cover?',
    a: 'We cover all 32 London boroughs and the City of London, plus surrounding areas within a 1.5-hour radius of Stratford, East London.',
  },
]

/**
 * The six questions shown on the homepage. Kept as a derived slice so the
 * rendered accordion and the FAQPage JSON-LD are generated from one array —
 * a mismatch between them is a structured-data violation.
 */
export const homepageFaqFeatured: FaqItem[] = [
  {
    ...homepageFaq.find((f) => f.q.startsWith('How much does an EPC cost'))!,
    links: [
      { href: '/pricing', label: 'See full guide pricing by floor area' },
      { href: '/services/domestic-epc', label: 'What a domestic EPC includes' },
    ],
  },
  {
    q: 'Are the prices on your website fixed?',
    a: 'No — the figures shown are guide prices, based mainly on internal floor area (m²). Extensions, loft conversions, layout and access can change the final figure, so we confirm your exact quote before you book. That applies to urgent and same-day jobs too: we confirm availability and any surcharge before accepting the booking.',
    links: [
      { href: '/pricing', label: 'How our guide pricing works' },
      { href: '/contact', label: 'Get an exact quote for your property' },
    ],
  },
  {
    ...homepageFaq.find((f) => f.q.startsWith('How long does an EPC assessment'))!,
    links: [{ href: '/preparing-for-your-epc', label: 'What to have ready before the visit' }],
  },
  {
    ...homepageFaq.find((f) => f.q.startsWith('How quickly will I receive'))!,
    links: [
      {
        href: 'https://www.gov.uk/find-energy-certificate',
        label: 'Find an energy certificate on GOV.UK',
        external: true,
      },
    ],
  },
  {
    ...homepageFaq.find((f) => f.q.startsWith('How long is an EPC valid'))!,
    links: [{ href: '/landlords', label: 'MEES rules for rented homes' }],
  },
  {
    ...homepageFaq.find((f) => f.q.startsWith('Can I get a same-day'))!,
    links: [{ href: '/areas', label: 'Check we cover your London borough' }],
  },
]

export interface FaqCategory {
  id: string
  title: string
  items: FaqItem[]
}

export const fullFaq: FaqCategory[] = [
  {
    id: 'about-epcs',
    title: 'About EPCs',
    items: [
      {
        q: 'Can an EPC assessor change or improve my rating?',
        a: 'No. The assessor surveys the property, records its measurements, construction, heating, glazing and lighting, and verifies any evidence they can accept. The rating is then calculated from that data by government-approved software. There is no field an assessor can edit to reach a requested result, and doing so would put their accreditation at risk. What an assessor can do is make sure everything genuinely present is recorded and evidenced.',
        links: [{ label: 'Why EPC ratings differ between similar homes', href: '/blog/why-is-my-epc-different' }],
      },
      {
        q: 'Why is my EPC different from my neighbour’s?',
        a: 'EPC ratings are specific to the individual property. Position in the terrace is a common reason — a mid-terrace home has two exposed external walls where an end-terrace or semi has three, which changes heat loss before anything else is considered. Floor area, extensions, insulation, glazing, heating, renewables and the evidence available on the day all vary between neighbouring homes too.',
        links: [{ label: 'Why EPC ratings differ between similar homes', href: '/blog/why-is-my-epc-different' }],
      },
      {
        q: 'Why is my new EPC different from my old one?',
        a: 'Existing dwellings in England and Wales have been assessed under the RdSAP 10 methodology since 15 June 2025, the first substantial change to the calculation in over a decade. A new certificate will not necessarily reproduce an older one even where the property is unchanged. There is no published rule that the update moves ratings up or down — it depends on the property. Previous certificates can also record different assumptions or information.',
        links: [{ label: 'RdSAP 10: what changed in 2025', href: '/blog/rdsap-10-what-changed-2025' }],
      },
      {
        q: 'What is RdSAP 10?',
        a: 'RdSAP is the methodology used to calculate EPCs for existing homes. RdSAP 10 became the approved methodology for existing dwellings in England and Wales on 15 June 2025. It collects more detail about the property and calculates a number of things differently from the version it replaced.',
        links: [{ label: 'RdSAP 10: what changed in 2025', href: '/blog/rdsap-10-what-changed-2025' }],
      },
      {
        q: 'What documents should I have ready for my EPC assessment?',
        a: 'None are compulsory, but where they exist they can help: window and door installation certificates, loft, wall or floor insulation records, building-control paperwork for extensions, boiler and hot-water cylinder details, heat-pump commissioning documents, and solar or MCS documentation. They matter because an improvement that cannot be seen or evidenced may have to be recorded using a default assumption instead.',
        links: [{ label: 'What to have ready', href: '/preparing-for-your-epc' }],
      },
      {
        q: 'What happens if my insulation cannot be seen?',
        a: 'Where an improvement cannot be inspected and there is no evidence the assessor can accept, the methodology may require a default assumption based on the age and type of property, which can be less favourable than what is actually installed. Supporting paperwork changes what can legitimately be recorded — it does not guarantee a particular rating.',
        links: [{ label: 'Documents and evidence that may help', href: '/preparing-for-your-epc#evidence' }],
      },
      {
        q: 'Do I need my solar or heat-pump documents?',
        a: 'They are useful where you have them, but they are not mandatory. MCS paperwork, commissioning documents or system specifications are examples of evidence an assessor may be able to accept to confirm what is installed, rather than estimating it. The assessor decides what can be accepted under the methodology.',
      },
      {
        q: 'What if my property is larger than the details used for my quote?',
        a: 'Our quote is based on the property information supplied before the appointment. If the property is materially larger or more complex than described — a significant undisclosed extension, an unmentioned loft conversion, or an unusually complex layout — we explain any adjustment and confirm it with you before the assessment begins, never afterwards. In practice this is rare.',
        links: [{ label: 'See guide pricing', href: '/pricing' }],
      },

      {
        q: 'What is an EPC?',
        a: 'An Energy Performance Certificate (EPC) is an official UK government document that rates a property’s energy efficiency from A (most efficient) to G (least efficient). It shows current and potential energy efficiency, estimated annual energy costs, CO₂ emissions, and recommendations for improvement.',
      },
      {
        q: 'How long is an EPC valid?',
        a: 'An EPC is valid for 10 years from the date of issue. After 10 years, you’ll need a new EPC if you’re selling or letting the property.',
      },
      {
        q: 'What information is on an EPC?',
        a: 'Your EPC shows the current rating (A–G), the potential rating after recommended improvements, estimated annual energy costs, CO₂ emissions, and a list of specific improvement recommendations with estimated costs and savings.',
      },
      {
        q: 'Who can issue an EPC?',
        a: 'Only an accredited Domestic Energy Assessor (DEA) registered with a government-approved scheme can issue a domestic EPC. We are accredited with Elmhurst Energy, the UK’s largest energy assessor scheme. Every EPC we produce is lodged on the official UK Government EPC Register.',
      },
      {
        q: 'How is the EPC rating calculated?',
        a: 'The rating is calculated using the Reduced data Standard Assessment Procedure (RdSAP), currently RdSAP 10. The assessor records construction details, insulation, heating, hot water, lighting, windows, and ventilation. The software calculates a Standard Assessment Procedure (SAP) score from 1–100, which maps to a band from A to G.',
      },
    ],
  },
  {
    id: 'legal-requirements',
    title: 'Legal Requirements',
    items: [
      {
        q: 'Do I need an EPC to sell my home?',
        a: 'Yes. You’re legally required to have an EPC commissioned before marketing your property for sale in England and Wales. Estate agents cannot legally list your property without one.',
      },
      {
        q: 'Do I need an EPC to rent out my property?',
        a: 'Yes. Under MEES regulations, all rental properties in England and Wales must have a valid EPC rated E or above. Letting without a compliant EPC can result in fines up to £5,000 per property.',
      },
      {
        q: 'What are MEES regulations?',
        a: 'Minimum Energy Efficiency Standards (MEES) require all rental properties to have an EPC rating of E or above. Government has set out an aim of raising this to band C for privately rented homes by 2030, on a phased basis. That is not yet law.',
      },
      {
        q: 'What if my property is below an E rating?',
        a: 'You cannot legally let a property rated F or G unless you have a registered exemption. You’ll need to make improvements to reach at least E. Your EPC report includes specific recommendations to help you do this.',
      },
      {
        q: 'Are there any exemptions?',
        a: 'Yes, limited exemptions exist (for example, all relevant improvements completed but rating still below E, third-party consent refused, or wall insulation that would damage the fabric of the property). Exemptions must be registered on the PRS Exemptions Register and last up to 5 years.',
      },
    ],
  },
  {
    id: 'process',
    title: 'Process',
    items: [
      {
        q: 'How do I book an EPC?',
        a: `Call us on ${site.phone}, send a WhatsApp message, email ${site.email}, or use our online booking form. Phone, WhatsApp and email all reach the assessor directly, and we reply during our opening hours (${site.hours}).`,
      },
      {
        q: 'How long does the assessment take?',
        a: 'Typically 45 minutes for a studio and up to 2 hours for a 5+ bedroom property. We’ll provide an accurate time estimate when you book.',
      },
      {
        q: 'What do I need to prepare?',
        a: 'No specific preparation is required. Just provide normal access to all rooms, loft hatches if accessible, the boiler, hot water cylinder, and any heating controls. Documentation such as boiler service records or insulation guarantees can be helpful but is not required.',
      },
      {
        q: 'How quickly will I get my certificate?',
        a: `Standard lodgement is within 72 hours of the assessment. Our next-day service lodges your certificate within 24 hours for an additional £${EXPRESS_SURCHARGE}.`,
      },
      {
        q: 'Can I see the assessor’s credentials?',
        a: 'Yes. We’re happy to share our Elmhurst Energy accreditation details on request. You can also verify any Domestic Energy Assessor on the EPC Register at gov.uk.',
      },
    ],
  },
  {
    id: 'pricing',
    title: 'Pricing',
    items: [
      {
        q: 'How much does an EPC cost?',
        a: `Guide EPC prices in London start at £${pricing[0].epc} for properties up to 37 m² and rise with internal floor area, up to £${pricing[5].epc} for homes over 121 m². Internal floor area (m²) is the main pricing factor — bedroom count is only a familiar reference. Next-day lodgement is available for £${EXPRESS_SURCHARGE} extra, and your exact quote is confirmed before booking.`,
      },
      {
        q: 'Are there hidden fees?',
        a: 'No. The price we quote is the price you pay. Quotes are personalised based on property size and condition, so there are no surprise add-ons, call-out charges, or travel surcharges within our service area.',
      },
      {
        q: 'Do you charge for travel?',
        a: 'No. Travel is included in the standard price for all properties within our service area (all 32 London boroughs and the City of London, plus a 1.5-hour radius of Stratford). For properties outside this area, contact us for a tailored quote.',
      },
      {
        q: 'Can I get a discount for multiple properties?',
        a: 'Yes. We offer portfolio rates for landlords and letting agents with multiple properties. Contact us directly for a quote.',
      },
      {
        q: 'What is the next-day service?',
        a: `For £${EXPRESS_SURCHARGE} extra, your EPC certificate is lodged within 24 hours of the assessment rather than the standard 72. This applies to assessments completed during our standard hours. Book before noon for the best chance of a same-day or next-morning appointment.`,
      },
    ],
  },
  {
    id: 'improvements',
    title: 'Improvements',
    items: [
      {
        q: 'How can I improve my EPC rating?',
        a: 'Your EPC includes specific improvement recommendations tailored to your property. Common cost-effective upgrades include loft insulation, LED lighting, cavity wall insulation, modern condensing boilers with smart controls, double glazing, and renewable systems like solar PV or heat pumps.',
      },
      {
        q: 'Which improvements give the best return?',
        a: 'For most London properties, the highest-return upgrades are LED lighting (low cost, immediate impact), loft insulation, a modern condensing boiler with proper controls, and cavity wall insulation where applicable. Solar PV and heat pumps deliver bigger rating jumps but require larger investment.',
      },
      {
        q: 'Will I need a new EPC after improvements?',
        a: 'Your current EPC remains valid for 10 years regardless of improvements. However, if you want the new, higher rating to appear on the EPC Register (for example to prove MEES compliance or support a sale), you’ll need a fresh assessment.',
      },
    ],
  },
]
