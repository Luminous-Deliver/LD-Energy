import type { FaqItem } from '@/lib/faq'
import { site } from '@/lib/site'
import { quoteHref } from '@/lib/quote-context'

/**
 * Shared by the visible homepage answers and its FAQ JSON-LD, so the schema always matches the page.
 *
 * The questions and answers are prototype v7.2's (approved by Abdul 22/10/2026): the money answers are the live
 * FAQ's own words (lib/faq.ts), the rest written for the prototype. The links are the ones the previous homepage
 * answers and sections carried, kept so no internal destination is lost (the Pre-Assessment, the Improvement Plan,
 * the landlord guide, the agents' page, the areas).
 */
export const homeBookingFaqs: FaqItem[] = [
  { q: 'Are the prices fixed?', a: 'No. They are guide prices, based mainly on internal floor area. Extensions, loft conversions, layout and access can change the final figure, so we confirm your exact quote before you book.', links: [{ href: '/pricing', label: 'Full guide prices' }] },
  { q: 'Are there hidden fees?', a: 'No. The price we quote is the price you pay. Quotes are personalised based on property size and condition, so there are no surprise add-ons, call-out charges or travel charges.' },
  { q: 'When do I pay?', a: 'No upfront payment. You pay once the assessment is done.' },
  { q: 'How long does the visit take?', a: 'Most take 45 to 60 minutes for a flat or standard house, and up to 2 hours for a large home. It goes fastest when every room, the loft hatch (if there is one), the boiler and the meters are easy to reach.', links: [{ href: '/preparing-for-your-epc', label: 'Preparing for your EPC' }] },
  { q: 'What if my rating comes back low?', a: `The rating is worked out from what is recorded at the property, so we cannot promise a particular band. Your EPC includes its recommendations, and the optional £${site.addOns.improvementPlan} improvement plan puts them in order for your property. If you let the property, the current minimum is E.`, links: [{ href: '/services/epc-improvement-plan', label: 'EPC Improvement Plan' }, { href: '/services/epc-pre-assessment', label: 'EPC Pre-Assessment' }, { href: '/landlords', label: 'The landlord guide' }] },
  { q: 'Can I get a discount for multiple properties?', a: 'Yes. We offer portfolio rates for landlords and letting agents with multiple properties. Contact us directly for a quote.', links: [{ href: quoteHref({ service: 'bulk', sourcePage: 'home', ctaId: 'inline' }), label: 'Start a portfolio enquiry' }, { href: '/estate-agents', label: 'Agents' }] },
  { q: 'Do you cover my postcode?', a: 'We are based in Stratford, E15, and cover all 32 London boroughs and the City of London. There are no travel charges.', links: [{ href: '/areas', label: 'See the areas we cover' }] },
]
