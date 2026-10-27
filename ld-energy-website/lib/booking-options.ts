import { SAME_DAY_LODGEMENT_SURCHARGE, NEXT_DAY_VISIT_SURCHARGE } from '@/lib/site'
import { legacyPropertyTypes } from '@/lib/floor-area'

/**
 * Legacy bedroom identifiers, retained for cached form submissions.
 * New forms use explicit floor-area bands or an unknown-area choice.
 */

export const propertyTypes = legacyPropertyTypes

/**
 * A full survey that is deliberately NOT lodged, so no certificate is ever
 * published. Named once here because the form, the Zod schema, the estimator
 * and the booking email all have to agree on the exact string.
 */
export const PRE_ASSESSMENT = 'EPC Pre-Assessment (not lodged)' as const

/**
 * Service options. "Both (Bundle)" is the better-value pairing and only applies
 * when the EPC and floor plan are for the SAME property — selecting EPC and
 * Floor Plan together in the form resolves to this automatically.
 */
export const services = [
  'EPC Certificate',
  'Floor Plan',
  'Both (Bundle)',
  PRE_ASSESSMENT,
  'Bulk / Agency Enquiry',
] as const

/**
 * The kind of home, as RdSAP itself distinguishes it (Abdul 22/10/2026: a maisonette on two floors changes the
 * survey, so the form asks). Not asked on a portfolio enquiry. Not to be confused with `propertyTypes`, the
 * retired bedroom identifiers kept for cached submissions.
 */
export const dwellingTypes = ['Flat', 'Maisonette', 'House', 'Bungalow'] as const
export type DwellingType = (typeof dwellingTypes)[number]

/** Who is booking — drives access arrangements and how we word the reply. */
export const customerTypes = [
  'Homeowner',
  'Landlord (tenanted)',
  'Estate agent',
  'Letting agent / firm',
] as const

/**
 * Speed choices, derived from the canonical surcharges so the stored enquiry
 * value, the form label and the pricing page can never disagree about a price.
 * The surcharges are literal types, so these keep literal string types too.
 */
export const STANDARD_SPEED = 'Standard (72 hours)' as const
export const SAME_DAY_LODGEMENT_SPEED = `Same-day lodgement (+£${SAME_DAY_LODGEMENT_SURCHARGE})` as const
export const NEXT_DAY_VISIT_SPEED = `Next-day visit and lodgement (+£${NEXT_DAY_VISIT_SURCHARGE})` as const
export const speeds = [STANDARD_SPEED, SAME_DAY_LODGEMENT_SPEED, NEXT_DAY_VISIT_SPEED] as const

/**
 * The stored value of the old £15 next-day lodgement option. A form loaded before
 * 22/10/2026 can still send it, so the schema maps it to today's £15 option,
 * same-day lodgement, instead of rejecting the booking.
 */
export const LEGACY_EXPRESS_SPEED = 'Express (Next day, +£15)' as const

/** Extra charged for a speed choice; 0 for standard or anything unrecognised. */
export function speedSurcharge(speed?: string): number {
  return speed === NEXT_DAY_VISIT_SPEED ? NEXT_DAY_VISIT_SURCHARGE : speed === SAME_DAY_LODGEMENT_SPEED ? SAME_DAY_LODGEMENT_SURCHARGE : 0
}

/** Name of a paid speed choice for price rows and summaries; null for standard. */
export function speedName(speed?: string): string | null {
  return speed === NEXT_DAY_VISIT_SPEED ? 'Next-day visit and lodgement' : speed === SAME_DAY_LODGEMENT_SPEED ? 'Same-day lodgement' : null
}

export const ukPostcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i

/** The one service value that means "many properties, quoted individually". */
export const BULK = 'Bulk / Agency Enquiry' as const

/** Today in London as yyyy-mm-dd, offset by whole days: the visit-date rules use the customer's calendar, not UTC. */
export function londonYmd(offsetDays = 0, now: Date = new Date()): string {
  const d = new Date(now.getTime() + offsetDays * 86_400_000)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}

/** A visit date before today (London) cannot be booked. The empty string is "no preference". */
export function isPastVisitDate(value: string | undefined, now: Date = new Date()): boolean {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && value < londonYmd(0, now)
}

export const PAST_DATE_ERROR = 'That date has passed. Choose today or a later date.'
