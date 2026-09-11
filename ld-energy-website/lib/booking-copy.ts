import type { ProductKind } from '@/lib/pricing-estimate'

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
