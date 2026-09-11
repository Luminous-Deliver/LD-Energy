import { areaChoices, type AreaChoice } from '@/lib/floor-area'
import { BULK, PRE_ASSESSMENT, EXPRESS_SPEED } from '@/lib/booking-options'
import type { ContactInput } from '@/lib/validators'

export const quoteServices = {
  epc: 'EPC Certificate', bundle: 'Both (Bundle)', 'floor-plan': 'Floor Plan',
  'pre-assessment': PRE_ASSESSMENT, bulk: BULK,
} as const
export type QuoteService = keyof typeof quoteServices
export interface QuoteContext { service?: QuoteService; area?: AreaChoice; speed?: 'standard' | 'express'; plan?: boolean }

export function parseQuoteContext(params: URLSearchParams): QuoteContext {
  const serviceValue = params.get('service')
  const service: QuoteService = serviceValue && Object.hasOwn(quoteServices, serviceValue) ? serviceValue as QuoteService : 'epc'
  const areaValue = params.get('area')
  const lodged = service === 'epc' || service === 'bundle'
  return {
    service,
    area: areaChoices.includes(areaValue as AreaChoice) ? areaValue as AreaChoice : undefined,
    speed: lodged && params.get('speed') === 'express' ? 'express' : 'standard',
    plan: lodged && params.get('plan') === '1',
  }
}

/** Only controlled selections enter URLs. Never pass an enquiry payload here. */
export function quoteHref(context: QuoteContext = {}): string {
  const params = new URLSearchParams()
  if (context.service && Object.hasOwn(quoteServices, context.service)) params.set('service', context.service)
  if (context.area && areaChoices.includes(context.area)) params.set('area', context.area)
  const lodged = !context.service || context.service === 'epc' || context.service === 'bundle'
  if (lodged && context.speed === 'express') params.set('speed', 'express')
  if (lodged && context.plan) params.set('plan', '1')
  return `/contact${params.size ? `?${params}` : ''}#booking-form`
}

export function quoteContextFromForm(values: Pick<ContactInput, 'services' | 'areaBand' | 'speed' | 'improvementPlan'>): QuoteContext {
  const service = (Object.entries(quoteServices).find(([, label]) => values.services.includes(label))?.[0] || 'epc') as QuoteService
  return { service, area: values.areaBand || undefined, speed: values.speed === EXPRESS_SPEED ? 'express' : 'standard', plan: values.improvementPlan }
}

/** Default intent for persistent/shared service-page quote actions. */
export function quoteContextForPath(path: string): QuoteContext {
  if (path.includes('epc-improvement-plan')) return { service: 'epc', plan: true }
  if (path.includes('pre-assessment')) return { service: 'pre-assessment' }
  if (path.includes('floor-plan')) return { service: 'floor-plan' }
  if (path.includes('estate-agents')) return { service: 'bulk' }
  return { service: 'epc' }
}
