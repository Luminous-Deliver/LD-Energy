import { z } from 'zod'
import { areaChoices, legacyArea } from '@/lib/floor-area'
import { propertyTypes, services, customerTypes, speeds, BULK, ukPostcodeRegex } from '@/lib/booking-options'
export { propertyTypes, services, customerTypes, speeds, BULK, PRE_ASSESSMENT, EXPRESS_SPEED, ukPostcodeRegex } from '@/lib/booking-options'

export const contactSchema = z
  .object({
  name: z.string().trim().min(2, 'Please enter your full name').max(120),
  phone: z
    .string()
    .trim()
    .min(7, 'Please enter a valid phone number')
    .max(30)
    .regex(/^[\d\s+()-]+$/, 'Phone number contains invalid characters'),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address').max(200),
  /**
   * Doubles as the properties-and-postcodes list on a bulk enquiry, which is
   * why there is no `min` here — the requirement is applied conditionally in
   * the `superRefine` below, where `services` is visible.
   */
  address: z.string().trim().max(2000),
  /** Not asked for on a bulk enquiry — see the `superRefine` below. */
  postcode: z.string().trim().toUpperCase().max(12),
  propertyType: z.enum(propertyTypes).optional(),
  areaBand: z.union([z.enum(areaChoices), z.literal('')]).optional(),
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
  /**
   * Roughly how many properties a bulk enquiry covers. A string, not a number:
   * the real answers are "about 12" and "20+", and forcing an exact integer
   * would make people guess precisely rather than usefully.
   */
  propertyCount: z.string().trim().max(60).optional().or(z.literal('')),
  consent: z.boolean().refine(value => value, 'Please confirm you agree to be contacted'),
  /** Honeypot, must remain empty */
  website: z.string().max(0).optional().or(z.literal('')),
  turnstileToken: z.string().min(1, 'Please complete the security check'),
  })
  /**
   * Requirements that depend on WHICH service was chosen, so they cannot be
   * expressed per-field: a bulk enquiry covers many properties and has no
   * single address or postcode, while every other booking has exactly one and
   * needs both.
   */
  .superRefine((data, ctx) => {
    const isBulk = data.services.includes(BULK)
    const legacy = legacyArea(data.propertyType)
    if (data.areaBand && legacy && data.areaBand !== legacy) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['areaBand'], message: 'Conflicting property size selections. Please choose your floor area again.' })
    }
    const combinedLegacy = data.services.length === 2 && data.services.includes('EPC Certificate') && data.services.includes('Floor Plan')
    if (data.services.length !== 1 && !combinedLegacy) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['services'], message: 'Please choose one service or the EPC and floor plan bundle.' })
    }
    if (!isBulk && !data.areaBand && !legacy) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['areaBand'], message: 'Choose a floor area band or Not sure of floor area.' })
    }

    if (isBulk) {
      if (!data.propertyCount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['propertyCount'],
          message: 'Please tell us roughly how many properties',
        })
      }
      return
    }

    if (data.address.length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['address'],
        message: 'Please enter the property address',
      })
    }
    if (!ukPostcodeRegex.test(data.postcode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['postcode'],
        message: 'Please enter a valid UK postcode',
      })
    }
  })

export type ContactInput = z.infer<typeof contactSchema>
