import { customerTypes } from '@/lib/booking-options'
import type { CustomerType } from '@/lib/enquiry-attribution'

export const CUSTOMER_TYPE_HISTORY_KEY = 'ldEnergyQuoteForm'

/** Restore this entry on Back/Forward or refresh; unrelated new visits start fresh. */
export function restoredCustomerType(state: unknown): CustomerType | '' | undefined {
  if (!state || typeof state !== 'object') return undefined
  const saved = (state as Record<string, unknown>)[CUSTOMER_TYPE_HISTORY_KEY]
  if (!saved || typeof saved !== 'object') return undefined
  const value = (saved as Record<string, unknown>).customerType
  return value === '' || customerTypes.includes(value as CustomerType) ? value as CustomerType | '' : undefined
}

/** Call only after a manual selection or explicit reset. Never store the form payload. */
export function rememberCustomerType(value: CustomerType | '', history: Pick<History, 'state' | 'replaceState'>) {
  if (value !== '' && !customerTypes.includes(value)) return
  history.replaceState({ ...history.state, [CUSTOMER_TYPE_HISTORY_KEY]: { customerType: value } }, '')
}
