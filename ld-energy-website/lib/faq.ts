import { pricing, priceFrom, topBand, site, SAME_DAY_LODGEMENT_SURCHARGE, NEXT_DAY_VISIT_SURCHARGE } from '@/lib/site'

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
    a: 'Generally, an EPC must be commissioned before marketing a home for sale in England and Wales. Reasonable efforts must be made to obtain it within seven days; a further 21 days is allowed if those efforts do not succeed. Exemptions apply. Provide it to prospective buyers as required.',
  },
  {
    q: 'Do I need an EPC to rent out my property?',
    a: 'For domestic rentals within MEES scope in England and Wales, the minimum is EPC E unless a valid exemption is registered. Current MEES financial penalties are capped at £5,000 per property in total. EPC provision duties and their penalties are separate.',
  },
  {
    q: 'How much does an EPC cost in London?',
    a: `Guide EPC prices in London start at £${pricing[0].epc} for properties ${pricing[0].areaLabel.toLowerCase()} and rise with internal floor area; homes ${topBand.areaLabel.toLowerCase()} start from £${topBand.epc}. Internal floor area (m²) is the main pricing factor — bedroom count is only a familiar reference. Same-day lodgement is £${SAME_DAY_LODGEMENT_SURCHARGE} extra and a next-day visit and lodgement £${NEXT_DAY_VISIT_SURCHARGE} extra, and your exact quote is confirmed before booking.`,
  },
  {
    q: 'How long does an EPC assessment take?',
    a: 'Most assessments take 45–60 minutes for a flat or standard house, rising to around 2 hours for a large 5+ bedroom property. It goes fastest when every room, the loft hatch (if there is one), the boiler and the meters are accessible. We’ll give you an accurate time estimate when you book.',
  },
  {
    q: 'How quickly will I receive my EPC certificate?',
    a: `Standard lodgement is within 72 hours of the assessment. Same-day lodgement puts your certificate on the register on the day of the visit for an additional £${SAME_DAY_LODGEMENT_SURCHARGE}.`,
  },
  {
    q: 'What does the assessor check during an EPC?',
    a: 'Our assessor measures the property, then records construction details, insulation, heating systems, hot water, lighting, windows, and ventilation. No preparation is needed from you, just normal access to all rooms.',
  },
  {
    q: 'Can I improve my EPC rating?',
    a: 'Yes. The standard EPC includes software-generated recommendations where applicable, without buying an add-on. Their suitability, costs and modelled savings depend on the assessed property.',
  },
  {
    q: 'What are MEES regulations?',
    a: 'For domestic rentals covered by MEES in England and Wales, the current minimum is EPC E unless a valid exemption is registered. Government has confirmed a higher standard equivalent to C for 1 October 2030, using reformed EPC metrics, but implementing legislation is still required. There is one compliance date for tenancies in scope, not an earlier new-tenancy phase.',
  },
  {
    q: 'Can I get a same-day or next-day EPC in London?',
    a: `Yes. We can visit the next day and lodge your EPC that day for £${NEXT_DAY_VISIT_SURCHARGE} extra, or lodge on the day of any visit for £${SAME_DAY_LODGEMENT_SURCHARGE} extra. Tell us your deadline in your enquiry and we confirm the slot before booking.`,
  },
  {
    q: 'When is an EPC legally required?',
    a: 'EPC requirements generally apply when a home is constructed, sold or let in England and Wales. Commission an EPC before marketing where required; exemptions and time limits apply. A private pre-assessment does not replace that duty.',
  },
  {
    q: 'How do I get my property to EPC band C?',
    a: `Your standard EPC includes its software-generated recommendation report at no extra charge, unless there is no reasonable potential for improvements. The optional £${site.addOns.improvementPlan} Improvement Plan adds Abdul’s personalised interpretation and priorities, supported by the full Elmhurst Energy Report. Costs and savings are modelled estimates, not guarantees.`,
  },
  {
    q: 'Can I find out my rating without it going on the public register?',
    a: `Yes — that is an EPC Pre-Assessment. We carry out the full survey exactly as we would for a real EPC, but we do not lodge it, so no certificate is published and nothing appears on the GOV.UK register. You get the score, a breakdown of what is holding it back, and a written improvement plan. It is priced on the same floor-area bands as an EPC, from £${priceFrom.preAssessment}, with the written improvement plan included; a separate energy report is available at no extra charge. If you decide you want the certificate afterwards, we can usually lodge the same survey for £${site.addOns.lodgeLater} without a second visit, as long as nothing at the property has changed and the survey data remains valid for lodgement under the applicable rules. It is not a substitute for an EPC where one is legally required, such as marketing a property for sale or rent.`,
  },
  {
    q: 'How do I check my assessor is genuinely accredited?',
    a: 'Every UK domestic energy assessor appears on the official government register. Our assessor is Abdul Motaleb Taher, accredited with Elmhurst Energy (EES/036265) and Quidos (QUID202220) — you can look both up yourself on the government’s find-an-assessor service before you book.',
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
      { href: '/quote?source=faq&cta=inline', label: 'Get an exact quote for your property' },
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

/**
 * The questions customers ask once their rating comes back (Abdul's real messages, 24/10/2026). Shared by the FAQ page
 * and the prep page (#rating-questions), each with an id so one answer can be linked on its own.
 * Sources: rdsap-conventions.md 3.04 (joist over rafter), 9.02 (evidence), RdSAP 10 from 15 June 2025.
 */
export const ratingQuestions: (FaqItem & { id: string })[] = [
  {
    id: 'old-epc-was-better',
    q: 'My old EPC had a better rating. Why has it gone down?',
    a: 'Older EPCs were done under earlier versions of the method, some well over a decade ago. Standards and assumptions have moved on since, so some things that used to score well don’t carry the same weight now. Since June 2025, existing homes are assessed under RdSAP 10, which is more detailed. A new EPC isn’t a like-for-like comparison with an old one, even if the home hasn’t changed.',
    links: [{ label: 'The method changed in June 2025', href: '/preparing-for-your-epc#rdsap-10' }],
  },
  {
    id: 'similar-homes-got-a-b',
    q: 'Similar homes nearby got a B. Why didn’t mine?',
    a: 'Their EPCs may have been done before June 2025 under the older method, or may have expired. Homes that look alike can also differ in floor area, how many outside walls they have (an end or mid terrace), insulation, heating, and the paperwork that was available on the day. Compare the property details on each certificate, not just the letter.',
    links: [{ label: 'Why your EPC may differ', href: '/preparing-for-your-epc#why-your-epc-may-differ' }],
  },
  {
    id: 'work-not-counted',
    q: 'I’ve done a lot of work. Why hasn’t the rating moved more?',
    a: 'An EPC counts specific things: insulation, windows and doors, heating and hot water, heating controls, lighting and renewables such as solar panels. Changes like dividing a room with partitions or curtains, decorating or new flooring don’t count. Some upgrades count for less than people expect, and going from C to B usually needs solar panels.',
    links: [{ label: 'What counts towards your rating', href: '/preparing-for-your-epc#what-counts' }],
  },
  {
    id: 'loft-insulation-not-counted',
    q: 'My loft has 300 mm of insulation. Why wasn’t it counted?',
    a: 'Insulation can only be recorded if your assessor can see and measure it, or if you have paperwork that shows it’s for your home and states the thickness. If the loft couldn’t be reached, or the insulation was covered, the method has to use a default instead. Send us the paperwork with the thickness before your EPC is lodged and we’ll check whether it can be recorded.',
    links: [{ label: 'Documents that may help', href: '/preparing-for-your-epc#documents-and-evidence' }],
  },
  {
    id: 'wall-insulation-evidence',
    q: 'I sent photos and documents. Why can’t they be used for my wall insulation?',
    a: 'Insulation inside a wall can’t be seen, so it’s recorded from evidence that clearly relates to your home, to those walls, and to the work being done, and that shows how thick the insulation is. Documents about other work, such as the loft or the windows, can’t be used for the walls, and a photo with no measurement can’t show the thickness. An extension is recorded separately from the main building, so it needs its own evidence too. What helps: a Building Control completion certificate, the installer’s guarantee or specification stating the thickness, or photos taken during the work showing the insulation with a tape measure against it. Your assessor has to be able to rely on it, so we’ll tell you if something can’t be used.',
    links: [{ label: 'Documents that may help', href: '/preparing-for-your-epc#documents-and-evidence' }],
  },
  {
    id: 'joist-and-rafter-insulation',
    q: 'I have insulation at the loft floor and in the roof slope. Why does only one count?',
    a: 'Where a loft is insulated at both the joists (the loft floor) and the rafters (the roof slope), the method counts the joist insulation only. We can photograph and note what we see, but the rafter insulation won’t change the rating.',
  },
  {
    id: 'a-point-or-two-off',
    q: 'It’s only a point or two off the next band. Can you adjust it?',
    a: 'No. The rating is worked out by approved software from what was recorded and evidenced, and we can’t move it, even by a point. That stays true if the home isn’t being sold or let, or the EPC is for your own records. If you have paperwork for something we couldn’t see, send it before the EPC is lodged and we’ll check whether it can be recorded.',
    links: [{ label: 'How your EPC rating is calculated', href: '/preparing-for-your-epc#how-your-epc-rating-is-calculated' }],
  },
  {
    id: 'is-c-a-good-rating',
    q: 'Is a C a good rating?',
    a: 'Yes, it’s a strong result for an existing home. The current legal minimum for letting a home is E. The government has confirmed a C target for rented homes from 1 October 2030, but that still needs legislation.',
  },
]

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
        a: 'None are compulsory, but where they exist they can help: window and door installation certificates, loft, wall or floor insulation certificates or guarantees (with their certificate or guarantee number), building-control paperwork for extensions, boiler and hot-water cylinder details, heat-pump commissioning documents, and solar or MCS documentation. They matter because an improvement that cannot be seen or evidenced may have to be recorded using a default assumption instead.',
        links: [{ label: 'Documents and evidence that may help', href: '/preparing-for-your-epc#documents-and-evidence' }],
      },
      {
        q: 'What happens if my insulation cannot be seen?',
        a: 'Where an improvement cannot be inspected and there is no evidence the assessor can accept, the methodology may require a default assumption based on the age and type of property, which can be less favourable than what is actually installed. Supporting paperwork changes what can legitimately be recorded — it does not guarantee a particular rating.',
        links: [{ label: 'Documents and evidence that may help', href: '/preparing-for-your-epc#documents-and-evidence' }],
      },
      {
        q: 'Do I need my solar or heat-pump documents?',
        a: 'They are useful where you have them, but they are not mandatory. MCS paperwork, commissioning documents or system specifications are examples of evidence an assessor may be able to accept to confirm what is installed, rather than estimating it. The assessor decides what can be accepted under the methodology.',
        links: [{ label: 'Documents and evidence that may help', href: '/preparing-for-your-epc#documents-and-evidence' }],
      },
      {
        q: 'What if my property is larger than the details used for my quote?',
        a: 'Our quote is based on the property information supplied before the appointment. If the property is materially larger or more complex than described — a significant undisclosed extension, an unmentioned loft conversion, or an unusually complex layout — we explain any adjustment and confirm it with you before the assessment begins, never afterwards. In practice this is rare.',
        links: [{ label: 'See guide pricing', href: '/pricing' }],
      },

      {
        q: 'What is an EPC?',
        a: 'An Energy Performance Certificate (EPC) is an official UK government document that rates a property’s energy efficiency from A (most efficient) to G (least efficient). It shows current and potential energy efficiency, estimated annual energy costs, CO₂ emissions, and recommendations for improvement.',
        links: [{ label: 'EPC ratings explained', href: '/blog/epc-ratings-explained' }, { label: 'Domestic EPC service', href: '/services/domestic-epc' }],
      },
      {
        q: 'How long is an EPC valid?',
        a: 'An EPC is valid for 10 years from the date of issue. After 10 years, you’ll need a new EPC if you’re selling or letting the property.',
        links: [{ label: 'How long an EPC lasts', href: '/blog/how-long-does-epc-last' }],
      },
      {
        q: 'What information is on an EPC?',
        a: 'Your EPC shows the current rating (A–G), the potential rating after recommended improvements, estimated annual energy costs, CO₂ emissions, and a list of specific improvement recommendations with estimated costs and savings.',
        links: [{ label: 'EPC ratings explained', href: '/blog/epc-ratings-explained' }],
      },
      {
        q: 'Who can issue an EPC?',
        a: 'Only an accredited Domestic Energy Assessor (DEA) registered with a government-approved scheme can issue a domestic EPC. We are accredited with two government-approved schemes, Elmhurst Energy and Quidos. Every EPC we produce is lodged on the official UK Government EPC Register.',
        links: [{ label: 'Your accredited assessor', href: '/about' }, { label: 'Domestic energy assessor in London', href: '/domestic-energy-assessor-london' }],
      },
      {
        q: 'How is the EPC rating calculated?',
        a: 'The rating is calculated using the Reduced data Standard Assessment Procedure (RdSAP), currently RdSAP 10. The assessor records construction details, insulation, heating, hot water, lighting, windows, and ventilation. The software calculates a Standard Assessment Procedure (SAP) score from 1–100, which maps to a band from A to G.',
        links: [{ label: 'How your EPC rating is calculated', href: '/preparing-for-your-epc#how-your-epc-rating-is-calculated' }, { label: 'RdSAP 10: what changed in 2025', href: '/blog/rdsap-10-what-changed-2025' }],
      },
    ],
  },
  {
    id: 'legal-requirements',
    title: 'Legal Requirements',
    items: [
      {
        q: 'Do I need an EPC to sell my home?',
        a: 'Generally, an EPC must be commissioned before marketing a home for sale in England and Wales. Reasonable efforts must be made to obtain it within seven days; a further 21 days is allowed if those efforts do not succeed. Exemptions apply. Provide it to prospective buyers as required.',
        links: [{ label: 'EPCs for sellers', href: '/sellers' }, { label: 'EPC guide for selling a house', href: '/blog/epc-for-selling-house' }],
      },
      {
        q: 'Do I need an EPC to rent out my property?',
        a: 'For domestic rentals within MEES scope in England and Wales, the minimum is EPC E unless a valid exemption is registered. Current MEES financial penalties are capped at £5,000 per property in total. EPC provision duties and their penalties are separate.',
        links: [{ label: 'EPCs for landlords', href: '/landlords' }, { label: 'EPC guide for landlords', href: '/blog/epc-for-landlords-2026' }],
      },
      {
        q: 'What are MEES regulations?',
        a: 'For domestic rentals covered by MEES in England and Wales, the current minimum is EPC E unless a valid exemption is registered. Government has confirmed a higher standard equivalent to C for 1 October 2030, using reformed EPC metrics, but implementing legislation is still required. There is one compliance date for tenancies in scope, not an earlier new-tenancy phase.',
        links: [{ label: 'MEES regulations explained', href: '/blog/mees-regulations-2026' }, { label: 'MEES timeline to 2030', href: '/blog/mees-timeline-2026-2030' }],
      },
      {
        q: 'What if my property is below an E rating?',
        a: 'If the property is covered by domestic MEES, you must improve it to E or register a valid exemption before letting or continuing to let it. Your standard recommendation report helps identify relevant measures.',
        links: [{ label: 'How to improve your EPC rating', href: '/blog/how-to-improve-epc-rating' }, { label: 'EPC Improvement Plan', href: '/services/epc-improvement-plan' }, { label: 'EPC Pre-Assessment', href: '/services/epc-pre-assessment' }],
      },
      {
        q: 'Are there any exemptions?',
        a: 'Yes, limited exemptions exist (for example, all relevant improvements completed but rating still below E, third-party consent refused, or wall insulation that would damage the fabric of the property). MEES exemptions require evidence and registration on the PRS Exemptions Register; most last five years, but duration depends on the exemption.',
        links: [{ label: 'MEES exemptions and registration', href: '/blog/mees-regulations-2026#exemptions-evidence-and-registration' }],
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
        links: [{ label: 'Get your exact quote', href: '/quote?source=faq&cta=inline' }],
      },
      {
        q: 'How long does the assessment take?',
        a: 'Typically 45 minutes for a studio and up to 2 hours for a 5+ bedroom property. We’ll provide an accurate time estimate when you book.',
        links: [{ label: 'What happens during an EPC assessment', href: '/blog/what-happens-during-epc-assessment' }],
      },
      {
        q: 'What do I need to prepare?',
        a: 'Mostly access. Every room, the loft hatch (if there is one), the boiler, hot water cylinder, heating controls and meters need to be reachable, and someone needs to be there to let the assessor in. Paperwork is not compulsory, but hidden insulation can only be recorded from documents: have the insulation certificate or guarantee ready, with its certificate or guarantee number. Without evidence, the method uses the default for the age of the home. A heating system that is fitted but cannot be inspected, with no paperwork for it, means the EPC cannot be finished until access is given.',
        links: [{ label: 'What to prepare', href: '/preparing-for-your-epc#what-to-prepare' }, { label: 'What to have ready', href: '/preparing-for-your-epc#what-to-have-ready' }],
      },
      {
        q: 'How quickly will I get my certificate?',
        a: `Standard lodgement is within 72 hours of the assessment. Same-day lodgement puts your certificate on the register on the day of the visit for an additional £${SAME_DAY_LODGEMENT_SURCHARGE}.`,
        links: [{ label: 'The Domestic EPC process', href: '/services/domestic-epc#epc-process' }],
      },
      {
        q: 'Can I see the assessor’s credentials?',
        a: 'Yes. We’re happy to share our Elmhurst Energy and Quidos accreditation details on request. You can also verify any Domestic Energy Assessor on the EPC Register at gov.uk.',
        links: [{ label: 'Assessor credentials', href: '/about#credentials' }],
      },
    ],
  },
  {
    id: 'pricing',
    title: 'Pricing',
    items: [
      {
        q: 'How much does an EPC cost?',
        a: `Guide EPC prices in London start at £${pricing[0].epc} for properties ${pricing[0].areaLabel.toLowerCase()} and rise with internal floor area; homes ${topBand.areaLabel.toLowerCase()} start from £${topBand.epc}. Internal floor area (m²) is the main pricing factor — bedroom count is only a familiar reference. Same-day lodgement is £${SAME_DAY_LODGEMENT_SURCHARGE} extra and a next-day visit and lodgement £${NEXT_DAY_VISIT_SURCHARGE} extra, and your exact quote is confirmed before booking.`,
        links: [{ label: 'Guide prices by floor area', href: '/pricing#pricing-table' }],
      },
      {
        q: 'Are there hidden fees?',
        a: 'No. The price we quote is the price you pay. Quotes are personalised based on property size and condition, so there are no surprise add-ons, call-out charges or travel charges.',
        links: [{ label: 'What the price includes', href: '/pricing#whats-included' }],
      },
      {
        q: 'Do you charge for travel?',
        a: 'No. There are no travel or call-out charges. We cover all 32 London boroughs and the City of London, plus areas within 1.5 hours of Stratford.',
        links: [{ label: 'London areas we cover', href: '/areas' }],
      },
      {
        q: 'Can I get a discount for multiple properties?',
        a: 'Yes. We offer portfolio rates for landlords and letting agents with multiple properties. Contact us directly for a quote.',
        links: [{ label: 'Landlords with several homes', href: '/landlords#portfolio' }, { label: 'Agents', href: '/estate-agents' }],
      },
      {
        q: 'What are the faster options?',
        a: `Same-day lodgement (£${SAME_DAY_LODGEMENT_SURCHARGE} extra) puts your EPC on the register on the day of the visit rather than within the standard 72 hours. A next-day visit and lodgement (£${NEXT_DAY_VISIT_SURCHARGE} extra) means we visit the next day and lodge the certificate that day. Both apply to visits in our standard hours, and availability is confirmed before booking.`,
        links: [{ label: 'Pricing questions', href: '/pricing#pricing-faq' }],
      },
    ],
  },
  {
    id: 'your-rating',
    title: 'When your rating comes back',
    items: ratingQuestions,
  },
  {
    id: 'improvements',
    title: 'Improvements',
    items: [
      {
        q: 'How can I improve my EPC rating?',
        a: 'Your standard EPC includes its software-generated recommendation report where applicable. Insulation, heating, lighting and other measures may be suggested depending on the property. Seek appropriate installation advice before proceeding; a particular rating or saving is not guaranteed.',
        links: [{ label: 'How to improve your EPC rating', href: '/blog/how-to-improve-epc-rating' }, { label: 'EPC Improvement Plan', href: '/services/epc-improvement-plan' }],
      },
      {
        q: 'Which improvements give the best return?',
        a: 'For most London properties, the highest-return upgrades are LED lighting (low cost, immediate impact), loft insulation, a modern condensing boiler with proper controls, and cavity wall insulation where applicable. Solar PV and heat pumps deliver bigger rating jumps but require larger investment.',
        links: [{ label: 'EPC improvements by budget', href: '/blog/epc-improvements-by-budget' }, { label: 'Cheapest ways to improve an EPC', href: '/blog/cheapest-ways-improve-epc' }],
      },
      {
        q: 'Will I need a new EPC after improvements?',
        a: 'Your current EPC remains valid for 10 years regardless of improvements. However, if you want the new, higher rating to appear on the EPC Register (for example to prove MEES compliance or support a sale), you’ll need a fresh assessment.',
        links: [{ label: 'When a new EPC may be worth getting', href: '/blog/how-long-does-epc-last#when-you-might-want-a-new-epc-without-being-legally-required' }],
      },
    ],
  },
]
