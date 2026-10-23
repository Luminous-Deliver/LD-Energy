import { z } from 'zod'
import { sourcePages, ctaIds } from '@/lib/enquiry-attribution'
import { submittedAreaChoices, bandForArea, legacyArea, parseExactArea, FLOOR_AREA_ERROR, TOP_BAND } from '@/lib/floor-area'
import { propertyTypes, dwellingTypes, services, customerTypes, speeds, BULK, ukPostcodeRegex, LEGACY_EXPRESS_SPEED, SAME_DAY_LODGEMENT_SPEED, isPastVisitDate, PAST_DATE_ERROR } from '@/lib/booking-options'
export { propertyTypes, dwellingTypes, services, customerTypes, speeds, BULK, PRE_ASSESSMENT, STANDARD_SPEED, SAME_DAY_LODGEMENT_SPEED, NEXT_DAY_VISIT_SPEED, LEGACY_EXPRESS_SPEED, ukPostcodeRegex } from '@/lib/booking-options'

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
  /** Flat, maisonette, house or bungalow (v7, approved 22/10/2026). Required except on a portfolio: see below. */
  dwellingType: z.union([z.enum(dwellingTypes), z.literal('')]).optional(),
  /** A current band, "unknown", or a band retired on 22/10/2026 that a cached page can still send. */
  areaBand: z.union([z.enum(submittedAreaChoices), z.literal('')]).optional(),
  /** Optional exact figure in m². The band stays the pricing input; this must fall inside it. */
  floorArea: z.string().trim().max(20).optional().or(z.literal('')),
  /** "I don't know the floor area", offered with the open-ended top band instead of a figure. */
  floorAreaUnknown: z.boolean().optional().default(false),
  customerType: z.union([z.enum(customerTypes), z.literal('')]).refine((value): boolean => value !== '', 'Please tell us who you are'),
  sourcePage: z.enum(sourcePages).optional(),
  ctaId: z.enum(ctaIds).optional(),
  // Borough membership is checked against server-owned boroughMeta in the API.
  areaPage: z.string().max(64).optional(),
  services: z
    .array(z.enum(services))
    .min(1, 'Please choose at least one service'),
  /** Additional Energy Report and personalised plan. Standard EPC recommendations
   *  are included whether or not this optional add-on is selected. */
  improvementPlan: z.boolean().optional().default(false),
  /** A Pre-Assessment's optional separate energy report, at no extra charge. Ignored on any other service. */
  energyReport: z.boolean().optional().default(false),
  // A form loaded before 22/10/2026 may still send the old next-day value; it becomes today's £15 option.
  speed: z.preprocess((value) => (value === LEGACY_EXPRESS_SPEED ? SAME_DAY_LODGEMENT_SPEED : value), z.enum(speeds, { required_error: 'Please choose a service speed' })),
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

    // a visit date is optional, but never in the past (London's calendar)
    if (!isBulk && isPastVisitDate(data.preferredDate)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['preferredDate'], message: PAST_DATE_ERROR })
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

    if (!data.dwellingType) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dwellingType'], message: 'Please tell us the property type' })
    }

    const exact = parseExactArea(data.floorArea)
    if (data.floorArea) {
      if (exact === undefined) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['floorArea'], message: FLOOR_AREA_ERROR })
      } else if (data.areaBand !== bandForArea(exact)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['floorArea'], message: 'This figure does not match the size you chose. Check the number or choose the size again.' })
      }
    }
    // The top band has no ceiling, so it asks for an approximate figure, or the customer says they don't know.
    if (data.areaBand === TOP_BAND && exact === undefined && !data.floorAreaUnknown && !data.floorArea) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['floorArea'], message: 'Enter an approximate floor area, or choose “I don’t know the floor area”.' })
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

/**
 * The general enquiry on /contact (Abdul 23/10/2026: "one route for buying a service, another for asking a question").
 * A price request never comes this way: choosing "Quote for a property" on the form sends the visitor to the quote
 * journey instead, so that option is not a value the API accepts.
 */
export const enquiryTypes = ['Existing booking', 'General question', 'Agency or business enquiry'] as const
export const QUOTE_ENQUIRY_TYPE = 'Quote for a property'
export const enquirySchema = z.object({
  kind: z.literal('enquiry'),
  enquiryType: z.enum(enquiryTypes, { errorMap: () => ({ message: 'Please choose what your message is about' }) }),
  name: z.string().trim().min(2, 'Please enter your name').max(120),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address').max(200),
  phone: z.string().trim().max(30).regex(/^[\d\s+()-]*$/, 'Phone number contains invalid characters').optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Please write a little more so we can help').max(3000, 'Please keep your message under 3,000 characters'),
  consent: z.boolean().refine(value => value, 'Please confirm you agree to be contacted'),
  /** Honeypot, must remain empty */
  website: z.string().max(0).optional().or(z.literal('')),
  turnstileToken: z.string().min(1, 'Please complete the security check'),
})
export type EnquiryInput = z.infer<typeof enquirySchema>
