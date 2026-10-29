/**
 * The emails the website forms send (redesign 29/10/2026, from Abdul's competitor examples and his notes):
 * the quote notification to the business inbox, the customer's confirmation, and the /contact enquiry notification.
 *
 * Look: the redesigned site's tokens (shared-parts.css: slate ink, sage for action, stone ground, night footer) and
 * Logo A with the option 2 wordmark (logo/master-2026-10-23). Table-based with inline styles, the only layout Gmail,
 * Outlook and Apple Mail all render. One column at 560 px: most of these are opened on a phone.
 *
 * Parity with what came before: the 22/10 confirmation's what-you-receive, next steps, access checklist and link,
 * tenant notice, promise, call/WhatsApp and receipt-only line are all kept; the old notification's rows (band, exact
 * figure, speed, plan, price status, guide shown, source page, button, area page, preferred date, notes) are all here.
 */
import { site, promise } from '@/lib/site'
import { areaLabel, legacyArea, TOP_BAND } from '@/lib/floor-area'
import { guideEstimate, guidePrice, PLAN_LABEL, ENERGY_REPORT_LABEL, type GuideEstimate } from '@/lib/pricing-estimate'
import { boroughMeta } from '@/lib/boroughs'
import { SAME_DAY_LODGEMENT_SPEED, NEXT_DAY_VISIT_SPEED } from '@/lib/booking-options'
import { deliveredList, formatPreferredDate, hasPrepChecklist, nextSteps, OPENING_HOURS, prepChecklist, PREP_PATH, serviceLabel, TENANT_NOTICE } from '@/lib/booking-copy'
import { referrerLabel, type LandingContext } from '@/lib/landing'
import { postcodeCheckLine, type PostcodeCheck } from '@/lib/postcode-check'
import type { EnquiryAttribution } from '@/lib/enquiry-attribution'
import type { EnquiryInput } from '@/lib/validators'

export interface BookingEmailInput extends EnquiryAttribution, LandingContext {
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

/** What the route knows about the request itself, for the business email. */
export interface BookingMeta {
  reference: string
  received: Date
  /** True when Turnstile was checked and passed; false only in local development without a secret. */
  turnstilePassed: boolean
  /** Absent for a portfolio enquiry, which has no single postcode. */
  postcodeCheck?: PostcodeCheck
}

export const SITE_URL = 'https://epc.luminousanddeliver.co.uk'
const LOGO_URL = `${SITE_URL}/email/logo-energy-560.png`
const PHONE = '07492 575 396'
const PHONE_HREF = 'tel:+447492575396'
const WHATSAPP_HREF = 'https://wa.me/447492575396'

// The site's tokens, as hex (email clients don't support CSS variables). Contrast as on the site: ink 11.2:1 on ground.
const INK = '#33384F'
const INK_QUIET = '#4F546B'
const MUTED = '#6D738D'
const SAGE = '#3A624E'
const SAGE_50 = '#F1F9F5'
const SAGE_100 = '#E7F1EB'
const GROUND = '#FCFBF8'
const BAND = '#F1EFE8'
const NIGHT = '#0B1528'
const ON_NIGHT = '#F1EFE8'
const LINK_NIGHT = '#B7CEC1'
const HAIR = '#DDDEE3'
const FONT = "Jost,'Segoe UI',Arial,Helvetica,sans-serif"
const SERIF = "'Source Serif 4',Georgia,'Times New Roman',serif"
const MONO = 'Consolas,Menlo,monospace'

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

/** The GOV.UK register's postcode search, filled in, so Abdul can find the current certificate in one tap. */
export function epcRegisterHref(postcode: string): string {
  return `https://find-energy-certificate.service.gov.uk/find-a-certificate/search-by-postcode?postcode=${encodeURIComponent(postcode.trim().toUpperCase())}`
}

// ---------------------------------------------------------------- shared parts

/** A value cell: escaped text, or a trusted fragment built in this file. */
type Cell = { html: string }
type Row = [string, Cell]
const text = (value: string): Cell => ({ html: escapeHtml(value).replace(/\n/g, '<br>') })
const link = (href: string, label: string): Cell =>
  ({ html: `<a href="${escapeHtml(href)}" style="color:${SAGE};font-weight:600;text-decoration:underline">${escapeHtml(label)}</a>` })
const flag = (value: string): Cell =>
  ({ html: `<span style="display:inline-block;padding:2px 8px;border-radius:4px;background:#FBEAEA;color:#8A1C1C;font-weight:700">${escapeHtml(value)}</span>` })
const plain = (cell: Cell) => cell.html.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '')
const unescape = (s: string) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')

function rows(items: Row[]): string {
  return items.map(([k, v], i) => `<tr>
      <td style="padding:11px 16px;${i ? `border-top:1px solid ${HAIR};` : ''}font-size:13px;line-height:1.45;color:${MUTED};width:34%;vertical-align:top">${escapeHtml(k)}</td>
      <td style="padding:11px 16px;${i ? `border-top:1px solid ${HAIR};` : ''}font-size:14px;line-height:1.5;color:${INK};font-weight:600;vertical-align:top;word-break:break-word">${v.html}</td>
    </tr>`).join('')
}

function card(label: string, inner: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${HAIR};border-radius:10px;border-collapse:separate;overflow:hidden;margin:0 0 14px;background:#ffffff">
    <tr><td style="background:${BAND};padding:9px 16px;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${SAGE};border-bottom:1px solid ${HAIR}">${label}</td></tr>
    <tr><td style="padding:0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${inner}</table></td></tr>
  </table>`
}

/** Inline-block buttons wrap onto a second line on a narrow phone instead of overflowing. */
function buttons(items: Array<[string, string, boolean]>): string {
  return `<div style="margin:0 0 4px;font-size:0">${items.map(([href, label, primary]) =>
    `<a href="${escapeHtml(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:11px 18px;border-radius:6px;font-family:${FONT};font-size:14px;font-weight:600;text-decoration:none;white-space:nowrap;${primary
      ? `background:${SAGE};color:#ffffff;border:1px solid ${SAGE}`
      : `background:#ffffff;color:${INK};border:1px solid #9EA2B4`}">${escapeHtml(label)}</a>`).join('')}</div>`
}

function page(opts: { title: string; preheader: string; body: string }): string {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light"><title>${escapeHtml(opts.title)}</title></head>
<body style="margin:0;padding:0;background:${GROUND};font-family:${FONT};color:${INK};-webkit-text-size-adjust:100%">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(opts.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${GROUND};font-family:${FONT}">
    <tr><td align="center" style="padding:24px 12px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
${opts.body}
      </table>
    </td></tr>
  </table>
</body></html>`
}

const logo = (width: number, align: 'left' | 'center') =>
  `<img src="${LOGO_URL}" width="${width}" alt="L&amp;D Energy, EPC and floor plans" style="display:block;border:0;width:${width}px;max-width:70%;height:auto${align === 'center' ? ';margin:0 auto' : ''}">`

/** The night footer both customer-facing parts share: who, both scheme numbers, the GOV.UK check, contact. */
function footer(): string {
  const [elmhurst, quidos] = site.assessor.accreditations
  return `<tr><td style="background:${NIGHT};border-radius:10px;padding:20px 22px">
      <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:${ON_NIGHT}">L&amp;D Energy</p>
      <p style="margin:0 0 4px;font-size:12px;line-height:1.6;color:${ON_NIGHT}">${escapeHtml(site.assessor.name)}, Domestic Energy Assessor<br>${elmhurst.short} ${elmhurst.number} · ${quidos.short} ${quidos.number} · <a href="${escapeHtml(site.assessor.verifyUrl)}" style="color:${LINK_NIGHT}">check me on GOV.UK</a></p>
      <p style="margin:0;font-size:12px;line-height:1.6;color:${ON_NIGHT}">All 32 London boroughs · <a href="${SITE_URL}" style="color:${LINK_NIGHT};text-decoration:none">epc.luminousanddeliver.co.uk</a> · <a href="${PHONE_HREF}" style="color:${LINK_NIGHT};text-decoration:none">${PHONE}</a></p>
    </td></tr>`
}

/** The service as chosen, with the size: "Domestic EPC, up to 40 m²". */
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

/** The price exactly as the form built it: one line per part. Empty when there is no figure. */
function priceLines(data: BookingEmailInput, e: GuideEstimate): Array<[string, string]> {
  if (e.isBulk || e.state !== 'priced' || e.baseGuide === null) return []
  const lines: Array<[string, string]> = [[serviceLine(data, e), guidePrice(e, e.baseGuide)]]
  if (e.express) lines.push([e.speedName ?? 'Faster lodgement', `+£${e.express}`])
  if (e.improvementPlan) lines.push([PLAN_LABEL, `+£${e.improvementPlan}`])
  if (e.planIncluded) lines.push(['Personalised improvement plan', 'Included'])
  if (e.energyReport) lines.push([ENERGY_REPORT_LABEL, 'Free'])
  return lines
}

function priceStatus(e: GuideEstimate): string {
  if (e.isBulk) return 'Quoted individually: a portfolio, priced home by home'
  if (e.priceStatus === 'starting') return 'Starting price: a large home, quote it from the address'
  if (e.priceStatus === 'to-confirm') return 'To be confirmed: no figure shown, the size is not known'
  return 'Standard guide price'
}

function priceCard(data: BookingEmailInput, e: GuideEstimate, opts: { totalLabel: string; note: string; status?: boolean }): string {
  const lines = priceLines(data, e)
  const total = e.state === 'priced' && e.total !== null ? guidePrice(e, e.total) : null
  const saving = e.saving && e.state === 'priced' ? ` Includes the £${e.saving} saving for booking both together.` : ''
  const status = opts.status ? `<tr><td colspan="2" style="padding:0 16px 14px"><span style="display:inline-block;padding:3px 8px;border-radius:4px;background:${SAGE_100};font-size:12px;font-weight:600;color:${SAGE}">${escapeHtml(priceStatus(e))}</span></td></tr>` : ''
  const inner = lines.length && total
    ? `${lines.map(([k, v], i) => `<tr>
        <td style="padding:${i ? 6 : 12}px 16px 0;font-size:14px;line-height:1.45;color:${INK}">${escapeHtml(k)}</td>
        <td style="padding:${i ? 6 : 12}px 16px 0;font-size:14px;color:${INK};text-align:right;white-space:nowrap;vertical-align:top">${escapeHtml(v)}</td>
      </tr>`).join('')}
      <tr><td colspan="2" style="padding:12px 16px 0"><div style="border-top:1px solid ${HAIR};font-size:0;line-height:0">&nbsp;</div></td></tr>
      <tr>
        <td style="padding:10px 16px 0;font-size:15px;font-weight:600;color:${INK}">${escapeHtml(opts.totalLabel)}</td>
        <td style="padding:8px 16px 0;font-family:${SERIF};font-size:28px;font-weight:600;color:${SAGE};text-align:right;white-space:nowrap">${escapeHtml(total)}</td>
      </tr>
      <tr><td colspan="2" style="padding:6px 16px 12px;font-size:12px;line-height:1.55;color:${MUTED}">${escapeHtml(opts.note + saving)}</td></tr>${status}`
    : `<tr><td style="padding:12px 16px;font-size:14px;line-height:1.55;color:${INK}">${escapeHtml(e.isBulk ? 'Quoted individually, home by home.' : 'To be confirmed from the property details.')}</td></tr>${status}`
  return card('Price', inner)
}

/** "Bing (bing.com), landed on /areas/newham; form on the pricing page, “hero” button". */
function cameFrom(data: EnquiryAttribution & LandingContext & { areaPage?: string }): Row[] {
  const form = [
    data.sourcePage ? `${data.sourcePage} page` : '',
    data.areaPage && boroughMeta[data.areaPage] ? boroughMeta[data.areaPage].name : '',
    data.ctaId ? `“${data.ctaId}” button` : '',
  ].filter(Boolean).join(', ')
  return [
    ['Found us via', text(referrerLabel(data.referrerHost, data.sourceTag))],
    ['First page', text(data.landingPage || 'Not recorded')],
    ['Form used', text(form || 'Not recorded')],
  ]
}

// ---------------------------------------------------------------- quote notification (business)

export function buildBusinessEmail(data: BookingEmailInput, meta: BookingMeta) {
  const e = guideEstimate(data)
  const first = data.name.trim().split(/\s+/)[0] || 'the customer'
  const tel = `tel:${data.phone.replace(/[^\d+]/g, '')}`
  const whatsapp = `https://wa.me/${whatsappDigits(data.phone)}`
  const total = e.state === 'priced' && e.total !== null ? guidePrice(e, e.total) : null
  const pc = meta.postcodeCheck

  const summary = [
    data.services.map(serviceLabel).join(' + '),
    ...(e.isBulk ? [data.propertyCount ? `${data.propertyCount} homes` : 'portfolio'] : [
      data.dwellingType,
      areaLabel(data.areaBand || legacyArea(data.propertyType), data.floorArea),
      pc?.status === 'ok' ? pc.borough : data.postcode,
      e.express ? (e.speedName ?? 'faster lodgement').toLowerCase() : e.isLodged ? 'standard' : '',
      e.improvementPlan ? 'Improvement Plan' : '',
    ]),
    total ? `guide ${total.replace(/^From /, 'from ')}` : e.isBulk ? '' : 'price to confirm',
  ].filter(Boolean).join(' · ')

  const customer: Row[] = [
    ['Name', text(data.name)],
    ['Booking as', text(data.customerType)],
    ['Phone', link(tel, data.phone)],
    ['Email', link(`mailto:${data.email}`, data.email)],
  ]

  const area = data.floorArea
    ? `${areaLabel(data.areaBand, data.floorArea)} (customer's figure), ${areaLabel(data.areaBand)} band`
    : `${areaLabel(data.areaBand || legacyArea(data.propertyType))}${data.areaBand === TOP_BAND && data.floorAreaUnknown ? ', they don’t know the floor area' : ''}`
  const job: Row[] = [
    ['Service', text(data.services.map(serviceLabel).join(' + '))],
    ...(e.isBulk
      ? [['Homes', text(data.propertyCount || 'Not given')] as Row]
      : [['Property type', text(data.dwellingType || 'Not given')] as Row, ['Floor area', text(area)] as Row]),
    ['Turnaround', text(turnaround(data, e))],
    ...(e.canHavePlan ? [['Improvement Plan', text(e.planIncluded ? 'Included' : e.improvementPlan ? `Added (+£${e.improvementPlan})` : 'Not added')] as Row] : []),
    ...(e.productKind === 'preAssessment' ? [[ENERGY_REPORT_LABEL, text(e.energyReport ? 'Requested (no extra charge)' : 'Not requested')] as Row] : []),
    ['Preferred date', text(formatPreferredDate(data.preferredDate) || 'None picked')],
  ]

  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([data.address, data.postcode].filter(Boolean).join(', '))}`
  const home: Row[] = e.isBulk
    ? [['Addresses', text(data.address || 'Not given')]]
    : [
        ['Address', { html: `${escapeHtml(data.address)}<br><a href="${escapeHtml(mapsHref)}" style="color:${SAGE};font-weight:600;font-size:13px">Open in Google Maps</a>` }],
        ['Postcode', { html: `${escapeHtml(data.postcode)}<br><a href="${escapeHtml(epcRegisterHref(data.postcode))}" style="color:${SAGE};font-weight:600;font-size:13px">Check existing EPCs on GOV.UK</a>` }],
        ...(pc ? [['Postcode check', pc.status === 'ok' && pc.inLondon ? text(postcodeCheckLine(pc)) : flag(postcodeCheckLine(pc))] as Row] : []),
      ]
  home.push(['Access notes', text(data.notes || 'None')])

  const details: Row[] = [
    ['Reference', text(meta.reference)],
    ['Received', text(`${londonTime.format(meta.received)}, UK time`)],
    ...cameFrom(data),
    // the form cannot send without the security check or the consent tick, so neither earns a row unless skipped locally
    ...(meta.turnstilePassed ? [] : [['Security check', flag('Skipped (local test only)')] as Row]),
  ]

  const body = `
        <tr><td style="padding:0 2px 18px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="vertical-align:middle">${logo(200, 'left')}</td>
            <td align="right" style="vertical-align:middle"><span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${SAGE_100};font-family:${MONO};font-size:12px;font-weight:700;letter-spacing:.04em;color:${SAGE};white-space:nowrap">${escapeHtml(meta.reference)}</span></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:0 2px 16px">
          <p style="margin:0 0 6px;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${MUTED}">New quote request</p>
          <h1 style="margin:0 0 8px;font-family:${SERIF};font-size:26px;line-height:1.2;color:${INK};font-weight:600">${escapeHtml(data.name)}</h1>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.5;font-weight:600;color:${SAGE}">${escapeHtml(summary)}</p>
          ${buttons([[tel, `Call ${first}`, true], [whatsapp, `WhatsApp ${first}`, false], [`mailto:${data.email}`, `Email ${first}`, false]])}
          <p style="margin:2px 0 0;font-size:13px;color:${MUTED}">Or just press Reply: it goes straight to ${escapeHtml(first)}.</p>
        </td></tr>
        <tr><td>
          ${card('The customer', rows(customer))}
          ${card('The job', rows(job))}
          ${card(e.isBulk ? 'The homes' : 'The home', rows(home))}
          ${priceCard(data, e, { totalLabel: 'Guide price shown', note: 'What the form showed them. Confirm the real price in writing.', status: true })}
          ${card('Details', rows(details))}
        </td></tr>
        <tr><td style="padding:4px 2px 0;font-size:11px;line-height:1.5;color:${MUTED}">Sent by the quote form on epc.luminousanddeliver.co.uk to the business inbox.</td></tr>`

  const txt = unescape([
    `New quote request: ${data.name} (${meta.reference})`,
    summary,
    '',
    ...[...customer, ...job, ...home].map(([k, v]) => `${k}: ${plain(v)}`),
    '',
    ...priceLines(data, e).map(([k, v]) => `${k}: ${v}`),
    total ? `Guide price shown: ${total}` : '',
    `Price status: ${priceStatus(e)}`,
    '',
    ...details.map(([k, v]) => `${k}: ${plain(v)}`),
    '',
    `Call: ${tel}`,
    `Reply by WhatsApp: ${whatsapp}`,
    ...(e.isBulk || !data.postcode ? [] : [`Existing EPCs: ${epcRegisterHref(data.postcode)}`]),
  ].join('\n'))

  return { text: txt, html: page({ title: `New quote request: ${data.name}`, preheader: summary, body }) }
}

// ---------------------------------------------------------------- quote confirmation (customer)

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

  const request: Row[] = [['Service', text(data.services.map(serviceLabel).join(' + '))]]
  if (bulk) {
    request.push(['Homes', text(data.propertyCount || 'To be confirmed')])
    if (data.address) request.push(['Addresses', text(data.address)])
  } else {
    if (data.dwellingType) request.push(['Property type', text(data.dwellingType)])
    request.push(['Floor area', text(areaLabel(data.areaBand || legacyArea(data.propertyType), data.floorArea))])
    request.push(['Address', text(`${data.address}, ${data.postcode}`)])
  }
  request.push(['Turnaround', text(turnaround(data, e))])
  request.push(['Booking as', text(data.customerType)])
  if (e.planIncluded) request.push(['Included', text('Personalised written improvement plan')])
  else if (e.improvementPlan > 0) request.push(['Add-on', text(`${PLAN_LABEL} (+£${e.improvementPlan})`)])
  if (e.energyReport) request.push(['Also included', text(`${ENERGY_REPORT_LABEL}, at no extra charge`)])
  request.push(['Preferred date', text(formatPreferredDate(data.preferredDate) || 'None picked')])
  if (data.notes) request.push(['Your notes', text(data.notes)])
  // their own details, so a mistyped number is caught before Abdul tries to call it
  request.push(['Your phone', text(data.phone)])

  const intro = bulk
    ? `Thanks for your enquiry. Abdul will look at your list and reply during opening hours (${OPENING_HOURS}) with prices for each home.`
    // the timing lives in step 1 below, so the opening line doesn't repeat it
    : 'Thanks for your request. Here is what you asked for, your guide price and what happens next. Nothing is booked until you agree the price and a time.'
  const customerPriceNote = e.isStartingPrice
    ? 'A starting price for a larger home, not the final price. Abdul confirms the exact price in writing before anything is booked.'
    : 'A guide, not the final price. Abdul confirms the exact price in writing before anything is booked.'
  const legal = 'This confirms we received your request. Your visit is confirmed only once you agree the price and time.'

  const label = (t: string) => `<p style="margin:0 0 10px;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${SAGE}">${t}</p>`
  const bullets = (items: string[]) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${items.map((i) => `<tr>
      <td style="width:18px;padding:0 0 8px;vertical-align:top;font-size:14px;line-height:1.55;color:${SAGE};font-weight:700">&#10003;</td>
      <td style="padding:0 0 8px;font-size:14px;line-height:1.55;color:${INK}">${escapeHtml(i)}</td></tr>`).join('')}</table>`
  const stepRows = steps.map((step, i) => `<tr>
      <td style="width:30px;padding:0 10px 12px 0;vertical-align:top"><div style="width:24px;height:24px;border-radius:999px;border:1.5px solid ${SAGE};color:${SAGE};font-size:12px;font-weight:700;line-height:24px;text-align:center">${i + 1}</div></td>
      <td style="padding:3px 0 12px;font-size:14px;line-height:1.55;color:${INK};vertical-align:top">${escapeHtml(step)}</td>
    </tr>`).join('')
  const box = (inner: string, tint = '#ffffff') => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${HAIR};border-radius:10px;border-collapse:separate;background:${tint};margin:0 0 14px"><tr><td style="padding:18px 18px 10px">${inner}</td></tr></table>`

  const body = `
        <tr><td align="center" style="padding:4px 0 22px">${logo(260, 'center')}</td></tr>
        <tr><td style="padding:0 2px 20px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${HAIR};border-radius:10px;border-collapse:separate;background:${SAGE_50}"><tr><td style="padding:22px 20px" align="center">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:36px;height:36px;background:${SAGE};border-radius:999px;text-align:center;vertical-align:middle;font-size:18px;line-height:36px;color:#ffffff;font-weight:700">&#10003;</td></tr></table>
            <h1 style="margin:12px 0 6px;font-family:${SERIF};font-size:26px;line-height:1.2;color:${INK};font-weight:600">Request received</h1>
            <p style="margin:0;font-size:13px;color:${INK_QUIET}">Your reference <span style="font-family:${MONO};font-weight:700;color:${SAGE};letter-spacing:.04em">${escapeHtml(meta.reference)}</span></p>
          </td></tr></table>
        </td></tr>
        <tr><td style="padding:0 2px">
          <p style="margin:0 0 10px;font-size:16px;color:${INK}">Hi ${escapeHtml(first)},</p>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${INK}">${escapeHtml(intro)}</p>
          ${card('Your request', rows(request))}
          ${priceCard(data, e, { totalLabel: 'Guide price', note: customerPriceNote })}
          ${box(`${label('What happens next')}<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${stepRows}</table>`)}
          ${delivered.length ? box(`${label('What you receive')}${bullets(delivered)}`) : ''}
          ${showPrep ? box(`${label('Before your visit')}${bullets(prepChecklist)}<p style="margin:2px 0 8px;font-size:14px"><a href="${prepUrl}" style="font-weight:600;color:${SAGE}">Please read before your visit</a></p>`, SAGE_50) : ''}
          ${tenanted ? box(`<p style="margin:0 0 8px;font-size:14px;line-height:1.55;color:${INK}"><strong>Tenanted property?</strong> ${escapeHtml(TENANT_NOTICE)}</p>`) : ''}
          ${bulk ? '' : box(`${label('When you pay')}<p style="margin:0 0 8px;font-size:14px;line-height:1.55;color:${INK}">After the visit, by cash, bank transfer or card. No VAT to add: we are not VAT registered, so the price is the total.</p>`)}
          ${bulk ? '' : box(`${label('Our promise')}${bullets(promiseLines)}<p style="margin:0 0 8px;font-size:13px"><a href="${SITE_URL}/terms#our-promise" style="color:${SAGE}">How it works</a></p>`)}
          ${box(`${label('Prefer to talk?')}<p style="margin:0 0 12px;font-size:14px;line-height:1.55;color:${INK}">Reply to this email, or:</p>${buttons([[PHONE_HREF, `Call ${PHONE}`, true], [WHATSAPP_HREF, 'WhatsApp us', false]])}`)}
        </td></tr>
        ${footer()}
        <tr><td style="padding:16px 12px 4px" align="center">
          <p style="margin:0;font-size:11px;line-height:1.55;color:${MUTED}">${legal} You're getting this because you asked for a quote on epc.luminousanddeliver.co.uk. <a href="${SITE_URL}/terms" style="color:${MUTED}">Booking terms</a> · <a href="${SITE_URL}/privacy-policy" style="color:${MUTED}">Privacy notice</a></p>
        </td></tr>`

  const lines = priceLines(data, e)
  const [elmhurst, quidos] = site.assessor.accreditations
  const txt =
    `Hi ${first},\n\n${intro}\n\nYour reference: ${meta.reference}\n\nYour request:\n` +
    request.map(([k, v]) => `  ${k}: ${plain(v).replace(/\n/g, ' ')}`).join('\n') +
    (lines.length
      ? `\n\nGuide price:\n${lines.map(([k, v]) => `  ${k}: ${v}`).join('\n')}\n  Total: ${guidePrice(e, e.total ?? 0)}. ${customerPriceNote}`
      : `\n\nGuide price: ${bulk ? 'Quoted individually, home by home.' : 'Price to be confirmed. We’ll confirm the size and price from your property details.'}`) +
    `\n\nWhat happens next:\n${steps.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}` +
    (delivered.length ? `\n\nWhat you receive:\n${delivered.map((d) => `  - ${d}`).join('\n')}` : '') +
    (showPrep ? `\n\nBefore your visit:\n${prepChecklist.map((p) => `  - ${p}`).join('\n')}\n  Please read before your visit: ${prepUrl}` : '') +
    (tenanted ? `\n\nTenanted property? ${TENANT_NOTICE}` : '') +
    (bulk ? '' : `\n\nWhen you pay: after the visit, by cash, bank transfer or card. No VAT to add.`) +
    (bulk ? '' : `\n\nOur promise:\n${promiseLines.map((l) => `  - ${l}`).join('\n')}\n  How it works: ${SITE_URL}/terms#our-promise`) +
    `\n\nPrefer to talk? Reply to this email, call ${PHONE}, or WhatsApp ${WHATSAPP_HREF}\n\n` +
    `L&D Energy · ${site.assessor.name}, Domestic Energy Assessor · ${elmhurst.short} ${elmhurst.number} · ${quidos.short} ${quidos.number}\n` +
    `Check on GOV.UK: ${site.assessor.verifyUrl}\n${SITE_URL}\n\n${legal}`

  return {
    text: unescape(txt),
    html: page({ title: 'Request received', preheader: bulk ? 'Abdul will reply with prices for each home.' : `Your reference ${meta.reference}. Abdul will reply with your exact price and a time.`, body }),
  }
}

// ---------------------------------------------------------------- /contact enquiry notification (business)

/** A general question from /contact: who, what about, the message, where they came from. Replying answers them. */
export function buildEnquiryEmail(data: EnquiryInput, meta: Pick<BookingMeta, 'received' | 'turnstilePassed'>) {
  const first = data.name.trim().split(/\s+/)[0] || 'them'
  const tel = data.phone ? `tel:${data.phone.replace(/[^\d+]/g, '')}` : ''
  const actions: Array<[string, string, boolean]> = [[`mailto:${data.email}`, `Email ${first}`, true]]
  if (data.phone) actions.push([tel, `Call ${first}`, false], [`https://wa.me/${whatsappDigits(data.phone)}`, `WhatsApp ${first}`, false])
  const sender: Row[] = [
    ['Name', text(data.name)],
    ['Email', link(`mailto:${data.email}`, data.email)],
    ['Phone', data.phone ? link(tel, data.phone) : text('Not given')],
  ]
  const details: Row[] = [
    ['Received', text(`${londonTime.format(meta.received)}, UK time`)],
    ['Found us via', text(referrerLabel(data.referrerHost, data.sourceTag))],
    ['First page', text(data.landingPage || 'Not recorded')],
    ...(meta.turnstilePassed ? [] : [['Security check', flag('Skipped (local test only)')] as Row]),
  ]
  const body = `
        <tr><td style="padding:0 2px 18px">${logo(200, 'left')}</td></tr>
        <tr><td style="padding:0 2px 16px">
          <p style="margin:0 0 6px;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${MUTED}">Website enquiry · ${escapeHtml(data.enquiryType)}</p>
          <h1 style="margin:0 0 14px;font-family:${SERIF};font-size:26px;line-height:1.2;color:${INK};font-weight:600">${escapeHtml(data.name)}</h1>
          ${buttons(actions)}
          <p style="margin:2px 0 0;font-size:13px;color:${MUTED}">Or just press Reply: it goes straight to ${escapeHtml(first)}.</p>
        </td></tr>
        <tr><td>
          ${card('Their message', `<tr><td style="padding:14px 16px;font-size:15px;line-height:1.6;color:${INK}">${text(data.message).html}</td></tr>`)}
          ${card('Who', rows(sender))}
          ${card('Details', rows(details))}
        </td></tr>
        <tr><td style="padding:4px 2px 0;font-size:11px;line-height:1.5;color:${MUTED}">Sent by the contact page on epc.luminousanddeliver.co.uk. No confirmation email goes to the sender.</td></tr>`
  const txt = unescape([
    `Website enquiry (${data.enquiryType}) from ${data.name}`,
    '',
    data.message,
    '',
    ...[...sender, ...details].map(([k, v]) => `${k}: ${plain(v)}`),
  ].join('\n'))
  return { text: txt, html: page({ title: `Website enquiry: ${data.name}`, preheader: data.message.slice(0, 120), body }) }
}
