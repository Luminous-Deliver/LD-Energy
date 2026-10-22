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
export interface QuoteContext extends EnquiryAttribution { service?: QuoteService; area?: AreaChoice; speed?: QuoteSpeed; plan?: boolean }

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
  return `/contact${params.size ? `?${params}` : ''}#booking-form`
}

export function quoteContextFromForm(values: Pick<ContactInput, 'services' | 'areaBand' | 'speed' | 'improvementPlan' | 'sourcePage' | 'ctaId'>): QuoteContext {
  const service = (Object.entries(quoteServices).find(([, label]) => values.services.includes(label))?.[0] || 'epc') as QuoteService
  const area = areaChoices.includes(values.areaBand as AreaChoice) ? values.areaBand as AreaChoice : undefined
  return { service, area, speed: values.speed === NEXT_DAY_VISIT_SPEED ? 'next-day' : values.speed === SAME_DAY_LODGEMENT_SPEED ? 'same-day' : 'standard', plan: values.improvementPlan, sourcePage: values.sourcePage, ctaId: values.ctaId }
}

/** Default intent for persistent/shared service-page quote actions. */
export function quoteContextForPath(path: string): QuoteContext {
  const sourcePage = sourcePageForPath(path)
  if (sourcePage === 'improvement-plan') return { service: 'epc', plan: true, sourcePage }
  if (sourcePage === 'pre-assessment') return { service: 'pre-assessment', sourcePage }
  if (sourcePage === 'floor-plans') return { service: 'floor-plan', sourcePage }
  if (sourcePage === 'estate-agents') return { service: 'bulk', sourcePage }
  return { service: 'epc', sourcePage }
}
