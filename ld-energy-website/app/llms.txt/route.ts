import { site, pricing, priceFrom, formatPrice, bundleSaving, maxBundleSaving, EXPRESS_SURCHARGE } from '@/lib/site'
import { boroughMeta } from '@/lib/boroughs'

export const runtime = 'edge'
export const dynamic = 'force-static'

/**
 * llms.txt, generated rather than hand-written.
 *
 * The previous static public/llms.txt drifted an entire price revision behind
 * the site: it quoted five of six bands wrong and claimed we email a PDF
 * certificate, which we do not. Because robots.txt explicitly invites GPTBot,
 * ClaudeBot, PerplexityBot and others, that file was the most confidently wrong
 * thing we published — assistants quoted it as fact.
 *
 * Building it from lib/site.ts makes that class of drift impossible: if the
 * pricing table changes, this changes with it.
 */
const areaNames = Object.values(boroughMeta).map((b) => b.name)

function priceTable(): string {
  const rows = pricing.map((p) => {
    const saving = bundleSaving(p)
    return `| ${p.areaLabel.padEnd(11)} | ${p.typicalLabel.padEnd(44)} | £${formatPrice(p.epc)} | £${formatPrice(p.floorPlan)} | £${formatPrice(p.bundle)} (saves £${formatPrice(saving)}) |`
  })
  return [
    '| Internal floor area | Typical property                             | EPC | Floor plan | EPC + floor plan |',
    '|---------------------|----------------------------------------------|-----|------------|------------------|',
    ...rows,
  ].join('\n')
}

function body(): string {
  return `# L&D Energy — EPC Certificates London

## What we do
L&D Energy is the EPC trading brand of ${site.parentBrand}. We are an Elmhurst-accredited Domestic Energy Assessor (DEA) providing official Energy Performance Certificates (EPCs) and professional laser-measured floor plans for residential properties across all 32 London boroughs plus the City of London.

## Key facts
- Accreditation: ${site.assessor.scheme} (${site.assessor.accreditationNumber})
- Assessor: ${site.assessor.name}, ${site.assessor.qualification}
- Coverage: All London boroughs, from ${site.address.locality} (our base) to Hillingdon, Enfield and Croydon
- Base location: ${site.address.locality}, ${site.address.region}, ${site.address.postalCode}
- Contact: ${site.phone} | ${site.email}
- Hours: ${site.hours}

## Services and guide pricing
All figures below are GUIDE prices and act as starting prices. They are not fixed quotes. The exact
quote is confirmed before the booking is accepted, never afterwards.

Internal floor area (m²) is the main pricing factor. Bedroom counts are shown only as a familiar
reference for customers who do not know their floor area. Extensions, loft conversions, unusual
layouts, multiple floors and travel outside the normal service area can affect the final quote.

${priceTable()}

- Next-day (express) service: add £${EXPRESS_SURCHARGE} to the EPC price above.
- Booking an EPC and floor plan together saves up to £${formatPrice(maxBundleSaving)} against booking them separately, because both are completed in a single property visit.
- Properties over 121 m² vary considerably; that band is a starting point and an exact quote is always required.
- EPC Improvement Plan add-on: £${site.addOns.improvementPlan}. Abdul’s personalised written plan explaining what is holding the rating back and which improvements to consider first, supported by the full Elmhurst Energy Report. Prepared after the visit. Energy costs and savings use standard occupancy assumptions; they are not actual household bills or guaranteed outcomes.
- Standard EPCs include the software-generated recommendation report at no extra charge, unless there is no reasonable potential for improvement. Legitimate omissions follow assessment rules, not the customer’s choice of add-on.
- EPC Pre-Assessment: a full RdSAP survey that is deliberately NOT lodged, so no certificate is published on the GOV.UK register. Priced on the same floor-area bands as an EPC (from £${priceFrom.epc}) because it is the same visit and the same measuring; only the lodgement is saved. The Energy Report and the written Improvement Plan are included, not an extra. Lodging the same survey afterwards costs £${site.addOns.lodgeLater} with no second visit, provided nothing at the property has changed and the survey remains valid for lodgement under the applicable rules. It is NOT a substitute for an EPC where one is legally required — marketing a property for sale or rent, or MEES compliance.
- There is no call-out or mileage charge within the normal service area.

Estate and letting agents: we act as an EPC and floor plan supplier for London agencies, with volume
rates and fast turnaround on new instructions. We are currently taking on new agency clients.
Details: ${site.url}/estate-agents

## EPC delivery — important
- Standard: lodged on the official GOV.UK EPC Register within 72 hours of the assessment.
- Express (next-day): lodged within 24 hours of the assessment.
- We do NOT email the EPC certificate as a PDF. The certificate is lodged on the official GOV.UK EPC
  Register, and the customer is sent the link to their certificate on that register once it is live.
- Floor plans ARE supplied as real files: high-resolution JPG and PDF. They are illustrative marketing plans with approximate dimensions, not architectural or legal plans. Their floor area may differ from EPC floor area because EPC conventions differ.

## What is an EPC?
An Energy Performance Certificate (EPC) rates a property's energy efficiency from A (most efficient)
to G (least efficient). An EPC generally needs to be commissioned before marketing a home for sale or rent in England and Wales; exemptions and time limits apply. EPCs are normally valid for 10 years unless replaced.

## Legal requirement
For domestic rentals covered by MEES in England and Wales, the current minimum is EPC E unless a valid exemption is registered. Government has confirmed a higher standard equivalent to C for 1 October 2030, using reformed EPC metrics, but implementing legislation is still required. There is one compliance date for tenancies in scope, not an earlier new-tenancy phase.
New dwellings normally need an on-construction EPC, which uses a different assessment method. Our service is domestic assessment of existing homes.

## Request an exact quote
Use ${site.url}/contact#booking-form. Call ${site.phone} or WhatsApp for support. We confirm your exact
quote before booking.

## Website structure
- Homepage: ${site.url}/
- Domestic EPC service: ${site.url}/services/domestic-epc
- Floor plans service: ${site.url}/services/floor-plans
- EPC Improvement Plan: ${site.url}/services/epc-improvement-plan
- EPC Pre-Assessment (not lodged): ${site.url}/services/epc-pre-assessment
- Energy assessor (London): ${site.url}/domestic-energy-assessor-london
- For landlords: ${site.url}/landlords
- For sellers: ${site.url}/sellers
- For estate & letting agents: ${site.url}/estate-agents
- Pricing: ${site.url}/pricing
- London areas: ${site.url}/areas
- Preparing for your EPC: ${site.url}/preparing-for-your-epc
- FAQ: ${site.url}/faq
- Blog and guides: ${site.url}/blog
- About: ${site.url}/about
- Enquiry form: ${site.url}/contact

## Area pages
We have dedicated pages for every London borough we cover: ${areaNames.join(', ')}.
Each area page: ${site.url}/areas/[borough-slug]

## Company details
- Trading name: ${site.name}
- Trading name: ${site.name}, a brand of ${site.parentBrand}
- Accreditation: ${site.assessor.scheme}
- All EPCs lodged on the official UK Government EPC Register (https://www.gov.uk/find-energy-certificate)
- Verify an assessor: ${site.assessor.verifyUrl}
`
}

export function GET() {
  return new Response(body(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  })
}
