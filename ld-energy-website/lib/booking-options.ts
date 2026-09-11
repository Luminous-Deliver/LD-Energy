import { EXPRESS_SURCHARGE } from '@/lib/site'
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

/** Who is booking — drives access arrangements and how we word the reply. */
export const customerTypes = [
  'Homeowner',
  'Landlord (tenanted)',
  'Estate agent',
  'Letting agent / firm',
] as const

/**
 * Derived from the canonical surcharge so the stored enquiry value, the form
 * label and the pricing page can never disagree about the express price.
 * EXPRESS_SURCHARGE is a literal type, so this keeps a literal string type too.
 */
export const EXPRESS_SPEED = `Express (Next day, +£${EXPRESS_SURCHARGE})` as const
export const speeds = ['Standard (72 hours)', EXPRESS_SPEED] as const

export const ukPostcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i

/** The one service value that means "many properties, quoted individually". */
export const BULK = 'Bulk / Agency Enquiry' as const
