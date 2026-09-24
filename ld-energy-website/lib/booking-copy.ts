import type { ProductKind } from '@/lib/pricing-estimate'
import { BULK, PRE_ASSESSMENT, EXPRESS_SPEED, type customerTypes } from '@/lib/booking-options'
import { areaLabel } from '@/lib/floor-area'

export type BadgeTone = 'green' | 'navy'

/**
 * Service choices, shared by the quote form and its desktop summary so labels cannot drift.
 * Badges show at every width; each radio keeps `label` as its accessible name. Green marks
 * the saving, navy marks a different kind of service (private survey, agency work).
 * `fullRow` spans the grid row from two columns up, so the odd option never leaves an empty cell.
 * "Better value" holds for every band: the bundle is below EPC plus floor plan.
 */
export const serviceChoices: { value: string; label: string; description: string; badge?: string; badgeTone?: BadgeTone; fullRow?: boolean }[] = [
  { value: 'EPC Certificate', label: 'Domestic EPC', description: 'On-site assessment and an EPC lodged on the government register.' },
  { value: 'Both (Bundle)', label: 'EPC + Floor Plan', description: 'Both services for the same property in one visit, with the bundle price.', badge: 'Better value', badgeTone: 'green' },
  { value: 'Floor Plan', label: 'Floor Plan', description: 'Laser-measured drawing showing layout and room sizes.' },
  { value: PRE_ASSESSMENT, label: 'EPC Pre-Assessment', description: 'Find out your score privately. Nothing is lodged.', badge: 'Private', badgeTone: 'navy' },
  { value: BULK, label: 'Agency / portfolio enquiry', description: 'Multiple properties or ongoing instructions, quoted individually.', badge: 'Agencies', badgeTone: 'navy', fullRow: true },
]

export function serviceLabel(value?: string): string {
  return serviceChoices.find(choice => choice.value === value)?.label || value || 'Not selected'
}

type CustomerType = (typeof customerTypes)[number]

/**
 * A portfolio is never one home someone lives in, so Homeowner is not offered on a bulk
 * enquiry. A landlord with several rented properties is the typical bulk customer and stays.
 */
export function customerTypeChoices(isBulk: boolean): { value: CustomerType; label: string; description: string; fullRow?: boolean }[] {
  return isBulk ? [
    { value: 'Landlord (tenanted)', label: 'Landlord (tenanted)', description: 'I own several rented properties' },
    { value: 'Estate agent', label: 'Estate agent', description: 'Instructing on behalf of sellers' },
    { value: 'Letting agent / firm', label: 'Letting agent / firm', description: 'Managing lettings or a portfolio', fullRow: true },
  ] : [
    { value: 'Homeowner', label: 'Homeowner', description: 'I live in or own the property' },
    { value: 'Landlord (tenanted)', label: 'Landlord (tenanted)', description: 'It’s rented out and tenants live there' },
    { value: 'Estate agent', label: 'Estate agent', description: 'Instructing on behalf of a seller' },
    { value: 'Letting agent / firm', label: 'Letting agent / firm', description: 'Managing lettings or a portfolio' },
  ]
}

export const OPENING_HOURS = 'Mon–Sun, 8am–8pm'

/**
 * "What happens next", shown after a successful request and repeated in the customer's
 * confirmation email so the two never disagree. Turnaround wording matches the published
 * service pages; visit length is left out because it varies with floor area.
 */
export function nextSteps(kind: ProductKind, speed?: string): string[] {
  if (kind === 'bulk') return [
    `Abdul reviews your portfolio and replies with volume rates during opening hours (${OPENING_HOURS}).`,
    'Once you agree the rates, visits are arranged property by property, around your tenants.',
  ]
  const hours = speed === EXPRESS_SPEED ? 24 : 72
  const steps = [
    `Abdul checks your details and replies with your exact price and available times during opening hours (${OPENING_HOURS}).`,
    'You pick a time. Your visit is confirmed once you agree the price and time.',
  ]
  switch (kind) {
    case 'epc':
      return [...steps, `After the visit, your EPC is lodged on the GOV.UK register within ${hours} hours and we send you the certificate link.`]
    case 'bundle':
      return [...steps, `After the visit, your EPC is lodged on the GOV.UK register within ${hours} hours and we send you the certificate link. Your floor plans are sent as JPG and PDF within 72 hours.`]
    case 'floorPlan':
      return [...steps, 'After the visit, your floor plans are sent as JPG and PDF within 72 hours.']
    case 'preAssessment':
      return [...steps, 'After the visit, your Energy Report and written plan are sent within 72 hours. Nothing is lodged on the public register.']
    case 'none':
      return steps
    default:
      return assertNever(kind)
  }
}

/** Only an EPC-type survey has the access checklist on /preparing-for-your-epc. */
export function hasPrepChecklist(kind: ProductKind): boolean {
  return kind === 'epc' || kind === 'bundle' || kind === 'preAssessment'
}

export const PREP_PATH = '/preparing-for-your-epc#what-to-have-ready'

/** Condensed from the "What to have ready" section of /preparing-for-your-epc. */
export const prepChecklist = [
  'Access to every room, including the loft hatch, outbuildings and any locked or storage rooms.',
  'Your boiler, cylinder and heating controls, plus the manual or model number if you have it.',
  'Clear access to windows, radiators, light fittings and the electricity meter.',
]

/** For the confirmation email, after the notes field has already been sent. */
export const TENANT_NOTICE = 'Please let your tenants know about the visit. If access needs arranging with them, just reply to this email.'

/** `<input type="date">` sends yyyy-mm-dd; customers read dd/MM/yyyy. Anything else is shown as sent. */
export function formatPreferredDate(value?: string): string {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value || ''
}

export interface EnquirySummaryInput {
  name: string; phone: string; email: string; address: string; postcode: string
  services: string[]; areaBand?: string; customerType: string; speed: string
  improvementPlan?: boolean; propertyCount?: string; preferredDate?: string; notes?: string
}

/**
 * Plain-text copy of a request, for the WhatsApp and email fallbacks when the form cannot
 * send. It only pre-fills the customer's own app; nothing here leaves the page by itself.
 */
export function enquirySummaryText(data: EnquirySummaryInput): string {
  const isBulk = data.services.includes(BULK)
  const lines = [
    'Hi, my quote request on your website did not go through, so I am sending it here.',
    '',
    `Service: ${data.services.map(serviceLabel).join(' + ')}`,
    isBulk ? `Properties: ${data.propertyCount || 'To confirm'}` : `Floor area: ${areaLabel(data.areaBand)}`,
    `I am: ${data.customerType || 'Not selected'}`,
    ...(!isBulk && data.speed === EXPRESS_SPEED ? ['Lodgement: next day'] : []),
    ...(data.improvementPlan ? ['Add-on: EPC Improvement Plan'] : []),
    ...(isBulk ? (data.address ? [`Properties and postcodes: ${data.address}`] : []) : [`Address: ${[data.address, data.postcode].filter(Boolean).join(', ')}`]),
    ...(data.preferredDate ? [`Preferred date: ${formatPreferredDate(data.preferredDate)}`] : []),
    ...(data.notes ? [`Notes: ${data.notes}`] : []),
    '',
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    `Email: ${data.email}`,
  ]
  return lines.join('\n')
}

function assertNever(kind: never): never {
  throw new Error(`Unhandled product kind: ${String(kind)}`)
}

/** Shown in place of the speed choice when nothing is lodged. */
export function turnaroundCopy(kind: ProductKind): string {
  switch (kind) {
    case 'bulk':
      return 'Turnaround and visit dates are agreed per property once we have quoted your volume rate, so there is nothing to choose here yet.'
    case 'preAssessment':
      return 'Nothing is lodged on the government register, so there is no certificate to expedite and no next-day option. Your Energy Report and written plan are sent within 72 hours of the visit.'
    case 'floorPlan':
      return 'Floor plans are not lodged on the government register, so there is no next-day lodgement option. Your plans are supplied as JPG and PDF within 72 hours of the visit.'
    case 'none':
      return 'Choose a service on the previous step and we will show the turnaround options that apply to it.'
    case 'epc':
    case 'bundle':
      // Lodged, so the speed cards are shown instead and this is unreachable.
      return 'Standard lodgement is within 72 hours of the visit.'
    default:
      return assertNever(kind)
  }
}

/** The sidebar's "What's included" list — must describe THIS product, not another. */
export function includedList(kind: ProductKind): string[] {
  switch (kind) {
    case 'epc':
    case 'bundle':
      return [
        'Elmhurst Lodgement Fee',
        'Official Government Register Listing',
        'No Travel/Call-out Surcharges',
        'Certificate link sent once lodged',
      ]
    case 'preAssessment':
      return [
        'Full survey by an accredited assessor',
        'Nothing lodged — no entry on the public register',
        'Energy Report + written Improvement Plan',
        'No Travel/Call-out Surcharges',
      ]
    case 'floorPlan':
      return [
        'Laser-measured on site by your assessor',
        'Drawn to Rightmove and Zoopla specification',
        'High-resolution JPG and PDF supplied',
        'No Travel/Call-out Surcharges',
      ]
    case 'bulk':
      return [
        'Volume rates across the whole portfolio',
        'One point of contact for every property',
        'Scheduling arranged around your tenants',
        'No Travel/Call-out Surcharges',
      ]
    case 'none':
      return ['No Travel/Call-out Surcharges']
    default:
      return assertNever(kind)
  }
}

/** Sub-heading on step 3, which must not promise a certificate that isn't coming. */
export function contactStepIntro(kind: ProductKind): string {
  switch (kind) {
    case 'bulk':
      return 'Tell us where to send the quote, and list the properties you need covered.'
    case 'preAssessment':
      return 'Provide the property details and where we should send your report. Nothing is lodged on the public register.'
    case 'floorPlan':
      return 'Provide the property details and where we should send the invoice and your floor plans.'
    case 'epc':
    case 'bundle':
      return 'Provide the property details and where we should send the invoice and certificate.'
    case 'none':
      return 'Provide the property details and where we should send the invoice.'
    default:
      return assertNever(kind)
  }
}
