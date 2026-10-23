import { areaChoices, type AreaChoice } from '@/lib/floor-area'
import { BULK, PRE_ASSESSMENT, SAME_DAY_LODGEMENT_SPEED, NEXT_DAY_VISIT_SPEED } from '@/lib/booking-options'
import type { ContactInput } from '@/lib/validators'
import { sourcePages, ctaIds, sourcePageForPath, type EnquiryAttribution, type SourcePage, type CtaId } from '@/lib/enquiry-attribution'

export const quoteServices = {
  epc: 'EPC Certificate', bundle: 'Both (Bundle)', 'floor-plan': 'Floor Plan',
  'pre-assessment': PRE_ASSESSMENT, bulk: BULK,
} as const
export type QuoteService = keyof typeof quoteServices
export type QuoteSpeed = 'standard' | 'same-day' | 'next-day'
export interface QuoteContext extends EnquiryAttribution {
  service?: QuoteService; area?: AreaChoice; speed?: QuoteSpeed; plan?: boolean
  /** The area page a quote started on (its slug). Shape-checked here; the API checks it against boroughMeta. */
  areaPage?: string
}

/** The one quote route (Abdul 23/10/2026): /quote is the reliable page, the dialog an optional shortcut over it. */
export const QUOTE_PATH = '/quote'
const AREA_PAGE_SLUG = /^[a-z][a-z-]{1,63}$/

/** `express` is the old next-day lodgement link (+£15, until 22/10/2026); it opens today's £15 option. */
function parseSpeed(value: string | null): QuoteSpeed {
  return value === 'next-day' ? 'next-day' : value === 'same-day' || value === 'express' ? 'same-day' : 'standard'
}

export function parseQuoteContext(params: URLSearchParams): QuoteContext {
  const serviceValue = params.get('service')
  const service: QuoteService = serviceValue && Object.hasOwn(quoteServices, serviceValue) ? serviceValue as QuoteService : 'epc'
  const areaValue = params.get('area')
  const lodged = service === 'epc' || service === 'bundle'
  return {
    service,
    sourcePage: sourcePages.includes(params.get('source') as SourcePage) ? params.get('source') as SourcePage : undefined,
    ctaId: ctaIds.includes(params.get('cta') as CtaId) ? params.get('cta') as CtaId : undefined,
    area: areaChoices.includes(areaValue as AreaChoice) ? areaValue as AreaChoice : undefined,
    speed: lodged ? parseSpeed(params.get('speed')) : 'standard',
    plan: lodged && params.get('plan') === '1',
    areaPage: AREA_PAGE_SLUG.test(params.get('page') || '') ? params.get('page') as string : undefined,
  }
}

/** Only controlled selections enter URLs. Never pass an enquiry payload here. */
export function quoteHref(context: QuoteContext = {}): string {
  const params = new URLSearchParams()
  if (context.service && Object.hasOwn(quoteServices, context.service)) params.set('service', context.service)
  if (context.area && areaChoices.includes(context.area)) params.set('area', context.area)
  const lodged = !context.service || context.service === 'epc' || context.service === 'bundle'
  if (lodged && (context.speed === 'same-day' || context.speed === 'next-day')) params.set('speed', context.speed)
  if (lodged && context.plan) params.set('plan', '1')
  if (context.sourcePage && sourcePages.includes(context.sourcePage)) params.set('source', context.sourcePage)
  if (context.ctaId && ctaIds.includes(context.ctaId)) params.set('cta', context.ctaId)
  if (context.areaPage && AREA_PAGE_SLUG.test(context.areaPage)) params.set('page', context.areaPage)
  return `${QUOTE_PATH}${params.size ? `?${params}` : ''}`
}

export function quoteContextFromForm(values: Pick<ContactInput, 'services' | 'areaBand' | 'speed' | 'improvementPlan' | 'sourcePage' | 'ctaId'> & { areaPage?: string }): QuoteContext {
  const service = (Object.entries(quoteServices).find(([, label]) => values.services.includes(label))?.[0] || 'epc') as QuoteService
  const area = areaChoices.includes(values.areaBand as AreaChoice) ? values.areaBand as AreaChoice : undefined
  return { service, area, speed: values.speed === NEXT_DAY_VISIT_SPEED ? 'next-day' : values.speed === SAME_DAY_LODGEMENT_SPEED ? 'same-day' : 'standard', plan: values.improvementPlan, sourcePage: values.sourcePage, ctaId: values.ctaId, areaPage: values.areaPage }
}

/** An old /contact quote link (`/contact?service=…` or `/contact#booking-form`), still printed in old emails and pages. */
export function isLegacyQuoteLink(search: string, hash: string): boolean {
  const params = new URLSearchParams(search)
  return hash === '#booking-form' || ['service', 'area', 'speed', 'plan', 'source', 'cta'].some(key => params.has(key))
}

/** Default intent for persistent/shared service-page quote actions. */
export function quoteContextForPath(path: string): QuoteContext {
  const sourcePage = sourcePageForPath(path)
  if (sourcePage === 'improvement-plan') return { service: 'epc', plan: true, sourcePage }
  if (sourcePage === 'pre-assessment') return { service: 'pre-assessment', sourcePage }
  if (sourcePage === 'floor-plans') return { service: 'floor-plan', sourcePage }
  if (sourcePage === 'estate-agents') return { service: 'bulk', sourcePage }
  // an area page names its own slug; the API checks it against the server-owned list
  if (sourcePage === 'area') return { service: 'epc', sourcePage, areaPage: path.slice('/areas/'.length) }
  return { service: 'epc', sourcePage }
}
