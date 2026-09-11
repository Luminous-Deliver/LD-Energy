import { areaChoices } from '@/lib/floor-area'
import { quoteServices, type QuoteService } from '@/lib/quote-context'

type FunnelEvent = 'form_start' | 'form_step_complete' | 'enquiry_submitted' | 'service_selection' | 'estimator_use'
interface EventContext { service?: QuoteService; area?: string; step?: number }

/** Collector-independent boundary. No network, storage, identifiers or customer data.
 * A future consent-aware adapter may subscribe; no analytics platform is installed. */
export function conversionEvent(name: FunnelEvent, context: EventContext = {}) {
  if (typeof window === 'undefined') return
  const detail: Record<string, string | number> = { name }
  if (context.service && Object.hasOwn(quoteServices, context.service)) detail.service = context.service
  if (context.area && areaChoices.includes(context.area as (typeof areaChoices)[number])) detail.area = context.area
  if (context.step === 1 || context.step === 2) detail.step = context.step
  window.dispatchEvent(new CustomEvent('ld-energy:conversion', { detail }))
}
