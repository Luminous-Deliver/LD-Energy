import { areaChoices } from '@/lib/floor-area'
import { quoteServices, type QuoteService } from '@/lib/quote-context'

type FunnelEvent = 'form_start' | 'form_step_complete' | 'enquiry_submitted' | 'service_selection' | 'estimator_use' | 'guide_feedback'
interface EventContext { service?: QuoteService; area?: string; step?: number; guide?: string; answer?: 'yes' | 'no' }

/** Collector-independent boundary. No network, storage, identifiers or customer data.
 * A future consent-aware adapter may subscribe; no analytics platform is installed. */
export function conversionEvent(name: FunnelEvent, context: EventContext = {}) {
  if (typeof window === 'undefined') return
  const detail: Record<string, string | number> = { name }
  if (context.service && Object.hasOwn(quoteServices, context.service)) detail.service = context.service
  if (context.area && areaChoices.includes(context.area as (typeof areaChoices)[number])) detail.area = context.area
  if (context.step === 1 || context.step === 2) detail.step = context.step
  // guide feedback (23/10): the guide's slug and the answer, nothing about the reader
  if (context.guide && /^[a-z0-9-]{1,100}$/.test(context.guide)) detail.guide = context.guide
  if (context.answer === 'yes' || context.answer === 'no') detail.answer = context.answer
  window.dispatchEvent(new CustomEvent('ld-energy:conversion', { detail }))
}
