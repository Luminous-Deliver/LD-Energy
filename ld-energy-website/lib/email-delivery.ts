/**
 * Did the customer's copy arrive? (Abdul 29/10/2026: a real domain with no such mailbox passes every check before
 * sending; only the bounce tells.) The thank-you screen polls /api/contact/delivery with the id of its own copy, and the
 * Resend webhook forwards every bounce to the business inbox (app/api/resend-webhook).
 */

/** Keep exact: scripts/resend-send.py, scripts/booking-followup.py and the /quote-reply skill match on it too. */
export const CONFIRMATION_SUBJECT = 'We’ve received your EPC request — L&D Energy'

/** Resend ids are UUIDs; anything else never reaches the Resend API. */
export const RESEND_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

export type DeliveryState = 'pending' | 'delivered' | 'bounced'

export interface ResendEmail { id?: string; to?: string[] | string; subject?: string; text?: string; last_event?: string; created_at?: string }

export async function fetchResendEmail(id: string, apiKey: string): Promise<ResendEmail | null> {
  if (!RESEND_ID_RE.test(id)) return null
  try {
    const res = await fetch(`https://api.resend.com/emails/${id}`, { headers: { Authorization: `Bearer ${apiKey}` } })
    return res.ok ? ((await res.json()) as ResendEmail) : null
  } catch {
    return null
  }
}

/** Resend's last event, reduced to what the screen needs. A delay or anything unknown is still pending. */
export function deliveryState(lastEvent?: string): DeliveryState {
  if (lastEvent === 'bounced') return 'bounced'
  if (lastEvent === 'delivered' || lastEvent === 'opened' || lastEvent === 'clicked') return 'delivered'
  return 'pending'
}

/** Resend writes "2026-10-29 22:45:21.164+00", which Date.parse rejects; NaN when unreadable. */
export function resendTime(value?: string): number {
  return value ? Date.parse(value.trim().replace(' ', 'T').replace(/([+-]\d\d)$/, '$1:00')) : NaN
}

/** The form's own reference, LD- and six characters, if the email carries one. */
export function referenceIn(text?: string): string | null {
  return text?.match(/\bLD-[A-HJ-KM-NP-Z2-9]{6}\b/)?.[0] ?? null
}
