import type { customerTypes } from '@/lib/booking-options'

/** Operational categories only: never referrers, full URLs, identifiers or customer text. */
export const sourcePages = ['home', 'contact', 'area', 'areas', 'landlords', 'sellers', 'estate-agents', 'domestic-epc', 'floor-plans', 'pre-assessment', 'improvement-plan', 'pricing', 'blog', 'about', 'faq', 'assessor', 'preparation', 'other'] as const
export const ctaIds = ['hero', 'pricing', 'bottom', 'header', 'mobile-menu', 'mobile-bar', 'inline', 'estimator', 'embedded', 'direct'] as const
export type SourcePage = typeof sourcePages[number]
export type CtaId = typeof ctaIds[number]
export type CustomerType = typeof customerTypes[number]
export interface EnquiryAttribution { sourcePage?: SourcePage; ctaId?: CtaId }

export function sourcePageForPath(path: string): SourcePage {
  const pages: Record<string, SourcePage> = {
    '/': 'home', '/contact': 'contact', '/areas': 'areas', '/landlords': 'landlords',
    '/sellers': 'sellers', '/estate-agents': 'estate-agents', '/pricing': 'pricing',
    '/about': 'about', '/faq': 'faq', '/domestic-energy-assessor-london': 'assessor',
    '/preparing-for-your-epc': 'preparation', '/services/domestic-epc': 'domestic-epc',
    '/services/floor-plans': 'floor-plans', '/services/epc-pre-assessment': 'pre-assessment',
    '/services/epc-improvement-plan': 'improvement-plan',
  }
  if (path === '/blog' || path.startsWith('/blog/')) return 'blog'
  // Category only; geographic identity always comes from the server page prop.
  if (path.startsWith('/areas/')) return 'area'
  return Object.hasOwn(pages, path) ? pages[path] : 'other'
}

export function customerTypeForSource(source?: SourcePage): CustomerType | '' {
  if (source === 'landlords') return 'Landlord (tenanted)'
  if (source === 'estate-agents') return 'Estate agent'
  return ''
}
