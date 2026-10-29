/**
 * The two emails a quote request sends (redesign 29/10/2026, from Abdul's competitor examples):
 * the business notification (to contact@) and the customer confirmation.
 *
 * Both share one reference number, one card style and one price breakdown, so what Abdul reads is exactly what the
 * customer was shown. Table-based with inline styles: the only layout Gmail, Outlook and Apple Mail all render.
 * Single column at 560 px, because most of these are opened on a phone.
 *
 * Kept from the approved 22/10 confirmation (port parity): what you receive, next steps, the access checklist and its
 * link, the tenant notice, our promise, call and WhatsApp buttons, the receipt-only legal line.
 * Added: the reference, the price breakdown, when you pay, both scheme numbers with the GOV.UK check, terms and privacy.
 */
import { site, promise } from '@/lib/site'
import { areaLabel, legacyArea, TOP_BAND } from '@/lib/floor-area'
import { guideEstimate, guidePrice, PLAN_LABEL, ENERGY_REPORT_LABEL, type GuideEstimate } from '@/lib/pricing-estimate'
import { boroughMeta } from '@/lib/boroughs'
import { SAME_DAY_LODGEMENT_SPEED, NEXT_DAY_VISIT_SPEED } from '@/lib/booking-options'
import { deliveredList, formatPreferredDate, hasPrepChecklist, nextSteps, OPENING_HOURS, prepChecklist, PREP_PATH, serviceLabel, TENANT_NOTICE } from '@/lib/booking-copy'
import type { EnquiryAttribution } from '@/lib/enquiry-attribution'

export interface BookingEmailInput extends EnquiryAttribution {
  name: string
  phone: string
  email: string
  address: string
  postcode: string
  propertyType?: string
  /** Flat, maisonette, house or bungalow (v7). Never set on a bulk enquiry. */
  dwellingType?: string
  areaBand?: string
  /** Customer-typed m², already checked against the band. Never set on a bulk enquiry. */
  floorArea?: string
  /** "I don't know the floor area", on the open-ended top band. */
  floorAreaUnknown?: boolean
  areaPage?: string
  customerType: string
  services: string[]
  /** Bulk enquiries only: roughly how many properties. */
  propertyCount?: string
  improvementPlan?: boolean
  /** Pre-Assessment only: the free separate energy report. */
  energyReport?: boolean
  speed: string
  preferredDate?: string
  notes?: string
}

/** What the route knows about the request itself, shown in the business email's Details card. */
export interface BookingMeta {
  reference: string
  received: Date
  /** True when Turnstile was checked and passed; false only in local development without a secret. */
  turnstilePassed: boolean
}

export const SITE_URL = 'https://epc.luminousanddeliver.co.uk'
const LOGO_URL = `${SITE_URL}/logo-email.png`
const PHONE = '07492 575 396'
const PHONE_HREF = 'tel:+447492575396'
const WHATSAPP_HREF = 'https://wa.me/447492575396'

// Brand palette (inline hex: email clients don't support CSS variables)
const NAVY = '#182848'
const NAVY_DEEP = '#0D1729'
const SAGE = '#47846E'
const SAGE_TINT = '#EEF4F1'
const INK = '#1E293B'
const MUTED = '#64748B'
const LINE = '#E2E8F0'
const HEAD = '#F6F8FA'
const CANVAS = '#F1F3F6'
const FONT = 'Inter,Arial,Helvetica,sans-serif'
const SERIF = "Georgia,'Times New Roman',serif"

/** Short, readable on the phone, no 0/O or 1/I. Shared by both emails so either side can quote it. */
export function bookingReference(random: (n: number) => Uint8Array = (n) => crypto.getRandomValues(new Uint8Array(n))): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  return 'LD-' + Array.from(random(6), (b) => alphabet[b % alphabet.length]).join('')
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** International digits for wa.me. UK numbers arrive as 07…; the schema allows only digits, spaces, +, ( ) and -. */
export function whatsappDigits(phone: string): string {
  const compact = phone.replace(/[^\d+]/g, '')
  if (compact.startsWith('+')) return compact.slice(1).replace(/\D/g, '')
  if (compact.startsWith('00')) return compact.slice(2)
  if (compact.startsWith('0')) return `44${compact.slice(1)}`
  return compact
}

const londonTime = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
})

// ---------------------------------------------------------------- shared parts

/** A value cell's HTML: escaped text, or a trusted fragment built here. */
type Cell = { html: string }
const text = (value: string): Cell => ({ html: escapeHtml(value).replace(/\n/g, '<br>') })
const link = (href: string, label: string): Cell =>
  ({ html: `<a href="${escapeHtml(href)}" style="color:${NAVY};font-weight:600">${escapeHtml(label)}</a>` })

function rows(items: Array<[string, Cell]>): string {
  return items.map(([k, v], i) => `<tr>
      <td style="padding:11px 16px;${i ? `border-top:1px solid ${LINE};` : ''}font-size:13px;color:${MUTED};width:36%;vertical-align:top">${escapeHtml(k)}</td>
      <td style="padding:11px 16px;${i ? `border-top:1px solid ${LINE};` : ''}font-size:14px;line-height:1.5;color:${INK};font-weight:600;vertical-align:top">${v.html}</td>
    </tr>`).join('')
}

function card(label: string, inner: string, gap = 16): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${LINE};border-radius:12px;border-collapse:separate;overflow:hidden;margin:0 0 ${gap}px;background:#ffffff">
    <tr><td style="background:${HEAD};padding:10px 16px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${SAGE};border-bottom:1px solid ${LINE}">${label}</td></tr>
    <tr><td style="padding:0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${inner}</table></td></tr>
  </table>`
}

function button(href: string, label: string, primary: boolean): string {
  return `<td style="border-radius:10px;${primary ? `background:${NAVY};` : `border:1px solid #CBD5E1;background:#ffffff;`}">
      <a href="${escapeHtml(href)}" style="display:inline-block;padding:11px 18px;font-size:14px;font-weight:700;color:${primary ? '#ffffff' : NAVY};text-decoration:none;white-space:nowrap">${escapeHtml(label)}</a>
    </td>`
}

function buttonRow(buttons: string[]): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 8px"><tr>${buttons.join('<td style="width:8px">&nbsp;</td>')}</tr></table>`
}

function page(opts: { title: string; preheader: string; body: string }): string {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${escapeHtml(opts.title)}</title></head>
<body style="margin:0;padding:0;background:${CANVAS};font-family:${FONT};-webkit-text-size-adjust:100%">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(opts.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CANVAS};font-family:${FONT}">
    <tr><td align="center" style="padding:24px 12px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
${opts.body}
      </table>
    </td></tr>
  </table>
</body></html>`
}

/** The service as the customer chose it, with the size: "Domestic EPC, up to 40 m²". */
function serviceLine(data: BookingEmailInput, e: GuideEstimate): string {
  const service = data.services.map(serviceLabel).join(' + ')
  if (e.isBulk) return service
  const area = areaLabel(data.areaBand || legacyArea(data.propertyType), data.floorArea)
  return `${service}, ${area.charAt(0).toLowerCase()}${area.slice(1)}`
}

function turnaround(data: BookingEmailInput, e: GuideEstimate): string {
  if (e.isBulk) return 'Agreed per property once quoted'
  if (!e.isLodged) return 'Within 72 hours of the visit, nothing lodged'
  if (data.speed === NEXT_DAY_VISIT_SPEED) return 'Next-day visit, lodged on the day of the visit'
  if (data.speed === SAME_DAY_LODGEMENT_SPEED) return 'Same-day lodgement, on the day of the visit'
  return 'Standard lodgement, within 72 hours of the visit'
}

/** The price exactly as the form built it: one line per part, then the guide total. Empty when there is no figure. */
function priceLines(data: BookingEmailInput, e: GuideEstimate): Array<[string, string]> {
  if (e.isBulk || e.state !== 'priced' || e.baseGuide === null) return []
  const lines: Array<[string, string]> = [[serviceLine(data, e), guidePrice(e, e.baseGuide)]]
  if (e.express) lines.push([e.speedName ?? 'Faster lodgement', `+£${e.express}`])
  if (e.improvementPlan) lines.push([PLAN_LABEL, `+£${e.improvementPlan}`])
  if (e.planIncluded) lines.push(['Personalised improvement plan', 'Included'])
  if (e.energyReport) lines.push([ENERGY_REPORT_LABEL, 'Free'])
  return lines
}

function priceCard(data: BookingEmailInput, e: GuideEstimate, totalLabel: string, note: string): string {
  const lines = priceLines(data, e)
  const total = e.state === 'priced' && e.total !== null ? guidePrice(e, e.total) : null
  const saving = e.saving && e.state === 'priced' ? ` Includes the £${e.saving} saving for booking both together.` : ''
  const inner = lines.length && total
    ? `${lines.map(([k, v]) => `<tr>
        <td style="padding:8px 16px 0;font-size:14px;color:${INK}">${escapeHtml(k)}</td>
        <td style="padding:8px 16px 0;font-size:14px;color:${INK};text-align:right;white-space:nowrap">${escapeHtml(v)}</td>
      </tr>`).join('')}
      <tr><td colspan="2" style="padding:12px 16px 0"><div style="border-top:1px solid ${LINE};font-size:0;line-height:0">&nbsp;</div></td></tr>
      <tr>
        <td style="padding:10px 16px 0;font-size:15px;font-weight:700;color:${INK}">${escapeHtml(totalLabel)}</td>
        <td style="padding:10px 16px 0;font-family:${SERIF};font-size:26px;font-weight:700;color:${NAVY};text-align:right;white-space:nowrap">${escapeHtml(total)}</td>
      </tr>
      <tr><td colspan="2" style="padding:6px 16px 14px;font-size:12px;line-height:1.55;color:${MUTED}">${escapeHtml(note + saving)}</td></tr>`
    : `<tr><td style="padding:12px 16px;font-size:14px;line-height:1.55;color:${INK}">${escapeHtml(e.isBulk ? 'Quoted individually, home by home.' : 'To be confirmed from the property details.')}</td></tr>`
  return card('Price', inner)
}

// ---------------------------------------------------------------- business notification

export function buildBusinessEmail(data: BookingEmailInput, meta: BookingMeta) {
  const e = guideEstimate(data)
  const first = data.name.trim().split(/\s+/)[0] || 'the customer'
  const tel = `tel:${data.phone.replace(/[^\d+]/g, '')}`
  const whatsapp = `https://wa.me/${whatsappDigits(data.phone)}`
  const total = e.state === 'priced' && e.total !== null ? guidePrice(e, e.total) : null
  const received = londonTime.format(meta.received)

  const summary = [
    data.services.map(serviceLabel).join(' + '),
    ...(e.isBulk ? [data.propertyCount ? `${data.propertyCount} homes` : 'portfolio'] : [
      data.dwellingType,
      areaLabel(data.areaBand || legacyArea(data.propertyType), data.floorArea),
      e.express ? (e.speedName ?? 'faster lodgement').toLowerCase() : e.isLodged ? 'standard' : '',
      e.improvementPlan ? 'Improvement Plan' : '',
    ]),
    total ? `guide ${total.replace(/^From /, 'from ')}` : e.isBulk ? '' : 'price to confirm',
  ].filter(Boolean).join(' · ')

  const customer: Array<[string, Cell]> = [
    ['Name', text(data.name)],
    ['Booking as', text(data.customerType)],
    ['Phone', link(tel, data.phone)],
    ['Email', link(`mailto:${data.email}`, data.email)],
  ]

  const area = e.isBulk ? '' : data.floorArea
    ? `${areaLabel(data.areaBand, data.floorArea)} (their figure), ${areaLabel(data.areaBand)} band`
    : `${areaLabel(data.areaBand || legacyArea(data.propertyType))}${data.areaBand === TOP_BAND && data.floorAreaUnknown ? ', they don’t know the floor area' : ''}`
  const job: Array<[string, Cell]> = [
    ['Service', text(data.services.map(serviceLabel).join(' + '))],
    ...(e.isBulk
      ? [['Homes', text(data.propertyCount || 'Not given')] as [string, Cell]]
      : [['Property', text(data.dwellingType || 'Not given')] as [string, Cell], ['Floor area', text(area)] as [string, Cell]]),
    ['Turnaround', text(turnaround(data, e))],
    ...(e.canHavePlan ? [['Improvement Plan', text(e.planIncluded ? 'Included' : e.improvementPlan ? `Added (+£${e.improvementPlan})` : 'Not added')] as [string, Cell]] : []),
    ...(e.productKind === 'preAssessment' ? [[ENERGY_REPORT_LABEL, text(e.energyReport ? 'Asked for (free)' : 'Not asked for')] as [string, Cell]] : []),
    ['Preferred date', text(formatPreferredDate(data.preferredDate) || 'None picked')],
  ]

  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([data.address, data.postcode].filter(Boolean).join(', '))}`
  const home: Array<[string, Cell]> = e.isBulk
    ? [['Addresses', text(data.address || 'Not given')]]
    : [
        ['Address', { html: `${escapeHtml(data.address)}<br><a href="${escapeHtml(mapsHref)}" style="color:${NAVY};font-weight:600;font-size:13px">Open in Google Maps</a>` }],
        ['Postcode', text(data.postcode)],
      ]
  home.push(['Notes', text(data.notes || 'None')])

  const cameFrom = [
    data.sourcePage ? `${data.sourcePage} page` : '',
    data.areaPage && boroughMeta[data.areaPage] ? boroughMeta[data.areaPage].name : '',
    data.ctaId ? `“${data.ctaId}” button` : '',
  ].filter(Boolean).join(', ') || 'Not recorded'
  const details: Array<[string, Cell]> = [
    ['Reference', text(meta.reference)],
    ['Received', text(`${received} UK time`)],
    ['Came from', text(cameFrom)],
    ['Security check', text(meta.turnstilePassed ? 'Passed (Cloudflare Turnstile)' : 'Skipped (local test)')],
    ['Consent', text('Ticked: agreed to be contacted about this request')],
  ]

  const body = `
        <tr><td style="padding:4px 4px 18px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="font-size:13px;font-weight:700;color:${NAVY}">L&amp;D Energy <span style="font-weight:400;color:${MUTED}">· bookings</span></td>
            <td align="right"><span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${SAGE_TINT};font-family:Consolas,Menlo,monospace;font-size:12px;font-weight:700;color:${SAGE}">${escapeHtml(meta.reference)}</span></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:0 4px 18px">
          <h1 style="margin:0 0 6px;font-family:${SERIF};font-size:24px;line-height:1.25;color:${INK};font-weight:700">New quote request from ${escapeHtml(first)}</h1>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.5;font-weight:600;color:${SAGE}">${escapeHtml(summary)}</p>
          ${buttonRow([button(tel, `Call ${first}`, true), button(whatsapp, `WhatsApp ${first}`, false), button(`mailto:${data.email}`, `Email ${first}`, false)])}
          <p style="margin:6px 0 0;font-size:13px;color:${MUTED}">Or just press Reply: it goes straight to ${escapeHtml(first)}.</p>
        </td></tr>
        <tr><td>
          ${card('The customer', rows(customer))}
          ${card('The job', rows(job))}
          ${card(e.isBulk ? 'The homes' : 'The home', rows(home))}
          ${priceCard(data, e, 'Guide price shown', 'What the form showed them. Confirm the real price in writing.')}
          ${card('Details', rows(details), 8)}
        </td></tr>
        <tr><td style="padding:10px 4px 0;font-size:11px;color:${MUTED}">Sent by the website form on epc.luminousanddeliver.co.uk to the business inbox.</td></tr>`

  const plain = [
    `New quote request from ${data.name} (${meta.reference})`,
    summary,
    '',
    ...[...customer, ...job, ...home].map(([k, v]) => `${k}: ${v.html.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '')}`),
    '',
    ...priceLines(data, e).map(([k, v]) => `${k}: ${v}`),
    total ? `Guide price shown: ${total}` : '',
    '',
    ...details.map(([k, v]) => `${k}: ${v.html.replace(/<[^>]+>/g, '')}`),
    '',
    `Call: ${tel}`,
    `WhatsApp: ${whatsapp}`,
  ].join('\n').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')

  return { text: plain, html: page({ title: `New quote request from ${first}`, preheader: summary, body }) }
}

// ---------------------------------------------------------------- customer confirmation

export function buildCustomerEmail(data: BookingEmailInput, meta: Pick<BookingMeta, 'reference'>) {
  const first = data.name.trim().split(/\s+/)[0] || 'there'
  const e = guideEstimate(data)
  const bulk = e.productKind === 'bulk'
  const showPrep = hasPrepChecklist(e.productKind)
  // the checklist below already covers access, so the step that repeats it goes
  const steps = nextSteps(e.productKind, data.speed, e.energyReport).filter((s) => !(showPrep && s.startsWith('Before the visit')))
  const tenanted = !bulk && data.customerType === 'Landlord (tenanted)'
  // Our promise (Abdul 24/10/2026): the lodgement line only where an EPC is lodged; terms section 7, #our-promise
  const lodged = e.productKind === 'epc' || e.productKind === 'bundle'
  const promiseLines = [
    ...(lodged ? [`£${promise.lateLodgement} off if your EPC isn't on the GOV.UK register within 72 hours of the visit.`] : []),
    `£${promise.lateChange} off if we move your visit with less than 24 hours' notice.`,
  ]
  const delivered = deliveredList(e.productKind, { improvementPlan: e.improvementPlan > 0, energyReport: e.energyReport })
  const prepUrl = `${SITE_URL}${PREP_PATH}`
  const [elmhurst, quidos] = site.assessor.accreditations

  const request: Array<[string, Cell]> = [['Service', text(data.services.map(serviceLabel).join(' + '))]]
  if (bulk) {
    request.push(['Homes', text(data.propertyCount || 'To be confirmed')])
    if (data.address) request.push(['Addresses', text(data.address)])
  } else {
    if (data.dwellingType) request.push(['Property', text(data.dwellingType)])
    request.push(['Floor area', text(areaLabel(data.areaBand || legacyArea(data.propertyType), data.floorArea))])
    request.push(['Address', text(`${data.address}, ${data.postcode}`)])
  }
  request.push(['Turnaround', text(turnaround(data, e))])
  request.push(['Booking as', text(data.customerType)])
  request.push(['Preferred date', text(formatPreferredDate(data.preferredDate) || 'None picked')])
  if (data.notes) request.push(['Your notes', text(data.notes)])

  const intro = bulk
    ? `Thanks for your enquiry. Abdul will look at your list and reply during opening hours (${OPENING_HOURS}) with prices for each home.`
    : `Thanks for your request. Abdul will check the details and reply the same working day with your exact price and a time for the visit (opening hours ${OPENING_HOURS}). Nothing is booked until you agree to both.`
  const legal = 'This confirms we received your request. Your visit is booked only once you agree the price and time.'

  const label = (t: string) => `<p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${SAGE}">${t}</p>`
  const bullets = (items: string[]) => `<ul style="margin:0;padding:0 0 0 18px;font-size:14px;line-height:1.55;color:${INK}">${items.map((i) => `<li style="margin:0 0 6px">${escapeHtml(i)}</li>`).join('')}</ul>`
  const stepRows = steps.map((step, i) => `<tr>
      <td style="width:28px;padding:0 12px 12px 0;vertical-align:top"><div style="width:24px;height:24px;border-radius:999px;background:${NAVY};color:#ffffff;font-size:12px;font-weight:700;line-height:24px;text-align:center">${i + 1}</div></td>
      <td style="padding:2px 0 12px;font-size:14px;line-height:1.55;color:${INK};vertical-align:top">${escapeHtml(step)}</td>
    </tr>`).join('')
  const box = (inner: string, tint = '#ffffff') => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${LINE};border-radius:12px;border-collapse:separate;background:${tint};margin:0 0 16px"><tr><td style="padding:18px 20px">${inner}</td></tr></table>`

  const body = `
        <tr><td align="center" style="padding:6px 0 20px">
          <img src="${LOGO_URL}" width="180" alt="L&amp;D Energy" style="display:block;border:0;width:180px;max-width:55%;height:auto">
        </td></tr>
        <tr><td style="background:${NAVY};border-radius:16px 16px 0 0;padding:26px 28px" align="center">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:40px;height:40px;background:${SAGE};border-radius:999px;text-align:center;vertical-align:middle;font-size:22px;line-height:40px;color:#ffffff;font-weight:700">&#10003;</td></tr></table>
          <h1 style="margin:14px 0 6px;font-family:${SERIF};font-size:24px;line-height:1.25;color:#ffffff;font-weight:700">Request received</h1>
          <p style="margin:0;font-size:13px;color:#C4D2E8">Your reference <span style="font-family:Consolas,Menlo,monospace;font-weight:700;color:#ffffff;letter-spacing:.04em">${escapeHtml(meta.reference)}</span></p>
        </td></tr>
        <tr><td style="background:${CANVAS};padding:22px 0 0">
          <p style="margin:0 4px 12px;font-size:16px;color:${INK}">Hi ${escapeHtml(first)},</p>
          <p style="margin:0 4px 20px;font-size:15px;line-height:1.6;color:${INK}">${escapeHtml(intro)}</p>
          ${card('Your request', rows(request))}
          ${priceCard(data, e, 'Guide price', 'A guide, not the final price. Abdul confirms the exact price in writing before anything is booked.')}
          ${box(`${label('What happens next')}<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${stepRows}</table>`)}
          ${delivered.length ? box(`${label('What you receive')}${bullets(delivered)}`) : ''}
          ${showPrep ? box(`${label('Before the visit')}${bullets(prepChecklist)}<p style="margin:10px 0 0;font-size:14px"><a href="${prepUrl}" style="font-weight:700;color:${NAVY}">Please read before your visit</a></p>`, SAGE_TINT) : ''}
          ${tenanted ? box(`<p style="margin:0;font-size:14px;line-height:1.55;color:${INK}"><strong>Tenanted property?</strong> ${escapeHtml(TENANT_NOTICE)}</p>`) : ''}
          ${bulk ? '' : box(`${label('When you pay')}<p style="margin:0;font-size:14px;line-height:1.55;color:${INK}">After the visit, by cash, bank transfer or card. No VAT to add: we are not VAT registered, so the price is the total.</p>`)}
          ${bulk ? '' : box(`${label('Our promise')}${bullets(promiseLines)}<p style="margin:8px 0 0;font-size:13px"><a href="${SITE_URL}/terms#our-promise" style="color:${NAVY}">How it works</a></p>`)}
          ${box(`${label('Prefer to talk?')}<p style="margin:0 0 12px;font-size:14px;line-height:1.55;color:${INK}">Reply to this email, or:</p>${buttonRow([button(PHONE_HREF, `Call ${PHONE}`, true), button(WHATSAPP_HREF, 'WhatsApp us', false)])}`)}
        </td></tr>
        <tr><td style="background:${NAVY_DEEP};border-radius:12px;padding:20px 24px">
          <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#ffffff">L&amp;D Energy</p>
          <p style="margin:0 0 2px;font-size:12px;line-height:1.6;color:#9BB2D4">${escapeHtml(site.assessor.name)}, Domestic Energy Assessor · ${elmhurst.short} ${elmhurst.number} · ${quidos.short} ${quidos.number} · <a href="${escapeHtml(site.assessor.verifyUrl)}" style="color:#95BFAD">check me on GOV.UK</a></p>
          <p style="margin:0;font-size:12px;line-height:1.6;color:#9BB2D4">Covering all 32 London boroughs · <a href="${SITE_URL}" style="color:#95BFAD;text-decoration:none">epc.luminousanddeliver.co.uk</a> · <a href="${PHONE_HREF}" style="color:#95BFAD;text-decoration:none">${PHONE}</a></p>
        </td></tr>
        <tr><td style="padding:16px 16px 4px" align="center">
          <p style="margin:0;font-size:11px;line-height:1.55;color:${MUTED}">${legal} You're getting this because you asked for a quote on epc.luminousanddeliver.co.uk. <a href="${SITE_URL}/terms" style="color:${MUTED}">Booking terms</a> · <a href="${SITE_URL}/privacy-policy" style="color:${MUTED}">Privacy notice</a></p>
        </td></tr>`

  const plain =
    `Hi ${first},\n\n${intro}\n\nYour reference: ${meta.reference}\n\nYour request:\n` +
    request.map(([k, v]) => `  ${k}: ${v.html.replace(/<br>/g, ' ').replace(/<[^>]+>/g, '')}`).join('\n') +
    (priceLines(data, e).length ? `\n\nGuide price:\n${priceLines(data, e).map(([k, v]) => `  ${k}: ${v}`).join('\n')}\n  Total: ${guidePrice(e, e.total ?? 0)} (a guide; Abdul confirms the exact price in writing before anything is booked)` : '') +
    `\n\nWhat happens next:\n${steps.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}` +
    (delivered.length ? `\n\nWhat you receive:\n${delivered.map((d) => `  - ${d}`).join('\n')}` : '') +
    (showPrep ? `\n\nBefore the visit:\n${prepChecklist.map((p) => `  - ${p}`).join('\n')}\n  Please read before your visit: ${prepUrl}` : '') +
    (tenanted ? `\n\nTenanted property? ${TENANT_NOTICE}` : '') +
    (bulk ? '' : `\n\nWhen you pay: after the visit, by cash, bank transfer or card. No VAT to add.`) +
    (bulk ? '' : `\n\nOur promise:\n${promiseLines.map((l) => `  - ${l}`).join('\n')}\n  How it works: ${SITE_URL}/terms#our-promise`) +
    `\n\nPrefer to talk? Reply to this email, call ${PHONE}, or WhatsApp ${WHATSAPP_HREF}\n\n` +
    `L&D Energy · ${site.assessor.name}, Domestic Energy Assessor · ${elmhurst.short} ${elmhurst.number} · ${quidos.short} ${quidos.number}\n` +
    `Check on GOV.UK: ${site.assessor.verifyUrl}\n${SITE_URL}\n\n${legal}`

  return {
    text: plain.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
    html: page({ title: 'Request received', preheader: bulk ? 'Abdul will reply with prices for each home.' : `Your reference ${meta.reference}. Abdul will reply with your exact price and a time.`, body }),
  }
}
