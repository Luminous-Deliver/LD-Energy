import { z } from 'zod'
import { EXPRESS_SURCHARGE } from '@/lib/site'

/**
 * Familiar bedroom references, in the SAME ORDER as the canonical pricing
 * bands in lib/site.ts. The form maps by index, so the two lists must stay
 * aligned — floor area is the real driver, this is the input customers can
 * answer without measuring anything.
 */

export const propertyTypes = [
  'Studio',
  '1 Bedroom',
  '2 Bedroom',
  '3 Bedroom',
  '4 Bedroom',
  '5+ Bedroom',
] as const

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

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name').max(120),
  phone: z
    .string()
    .trim()
    .min(7, 'Please enter a valid phone number')
    .max(30)
    .regex(/^[\d\s+()-]+$/, 'Phone number contains invalid characters'),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address').max(200),
  address: z.string().trim().min(5, 'Please enter the property address').max(500),
  postcode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(ukPostcodeRegex, 'Please enter a valid UK postcode'),
  propertyType: z.enum(propertyTypes, { required_error: 'Please select a property type' }),
  customerType: z.enum(customerTypes, { required_error: 'Please tell us who you are' }),
  services: z
    .array(z.enum(services))
    .min(1, 'Please choose at least one service'),
  /** Optional add-on (£ from site.addOns.improvementPlan): recommendations kept
   *  on the lodged certificate, plus an Energy Report and a written plan
   *  ranking the measures. Produced after the visit, never on the doorstep. */
  improvementPlan: z.boolean().optional().default(false),
  speed: z.enum(speeds, { required_error: 'Please choose a service speed' }),
  preferredDate: z.string().trim().max(40).optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Please confirm you agree to be contacted' }),
  }),
  /** Honeypot, must remain empty */
  website: z.string().max(0).optional().or(z.literal('')),
  turnstileToken: z.string().min(1, 'Please complete the security check'),
})

export type ContactInput = z.infer<typeof contactSchema>
