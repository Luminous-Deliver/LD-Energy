import { NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { contactSchema } from '@/lib/validators'
import { site } from '@/lib/site'
import { guideEstimate, guideEstimateLine } from '@/lib/pricing-estimate'

export const runtime = 'edge'

const NOTIFY_TO = 'contact@luminousanddeliver.co.uk'
// Resend has only the root domain verified — sending from the epc.
// subdomain is rejected with 403 "domain is not verified".
const FROM_DEFAULT = 'L&D Energy <bookings@luminousanddeliver.co.uk>'
const SITE_URL = 'https://epc.luminousanddeliver.co.uk'
const LOGO_URL = `${SITE_URL}/logo-email.png`
const PHONE = '07492 575 396'
const PHONE_HREF = 'tel:+447492575396'
const WHATSAPP_HREF = 'https://wa.me/447492575396'

// Brand palette (inline hex — email clients don't support CSS variables)
const NAVY = '#182848'
const NAVY_DEEP = '#0D1729'
const SAGE = '#47846E'
const INK = '#1E293B'
const MUTED = '#64748B'
const LINE = '#E2E8F0'
const CANVAS = '#F1F3F6'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

interface ParsedInput {
  name: string
  phone: string
  email: string
  address: string
  postcode: string
  propertyType: string
  customerType: string
  services: string[]
  /** Bulk enquiries only — roughly how many properties. */
  propertyCount?: string
  improvementPlan?: boolean
  speed: string
  preferredDate?: string
  notes?: string
}

async function verifyTurnstile(token: string, secret: string, remoteip: string): Promise<boolean> {
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip }),
    })
    const result = (await res.json()) as { success: boolean }
    return result.success
  } catch (err) {
    console.error('[contact] Turnstile verification request failed', err)
    return false
  }
}

function buildEmail(data: ParsedInput) {
  const estimate = guideEstimate({
    propertyType: data.propertyType,
    services: data.services,
    speed: data.speed,
    improvementPlan: data.improvementPlan,
  })

  const rows: Array<[string, string]> = [
    ['Name', data.name],
    ['Phone', data.phone],
    ['Email', data.email],
    [estimate.isBulk ? 'Properties & postcodes' : 'Property Address', data.address || '—'],
    ...(estimate.isBulk
      ? ([['Property count', data.propertyCount || '—']] as Array<[string, string]>)
      : ([['Postcode', data.postcode]] as Array<[string, string]>)),
    // The form hides property size on a bulk enquiry, so the schema default
    // ('2 Bedroom') would otherwise be reported as if the customer picked it.
    ['Property Type', estimate.isBulk ? 'Not applicable — bulk enquiry' : data.propertyType],
    ['Booking as', data.customerType],
    ['Service(s)', data.services.join(', ')],
    [
      'Improvement Plan',
      estimate.planIncluded
        ? 'Included in Pre-Assessment'
        : estimate.improvementPlan > 0
          ? `Yes (+£${site.addOns.improvementPlan})`
          : 'No',
    ],
    [
      'Speed',
      estimate.isBulk
        ? 'Agreed per property once quoted'
        : estimate.isLodged
          ? data.speed
          : 'Within 72 hours — nothing lodged',
    ],
    ['Guide shown to customer', guideEstimateLine(estimate)],
    ['Preferred Date', data.preferredDate || '—'],
    ['Notes', data.notes || '—'],
  ]

  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n')

  const html = `<!doctype html><html><body style="font-family:Inter,Arial,sans-serif;color:#1E293B;line-height:1.5">
<h2 style="margin:0 0 16px;font-family:'Plus Jakarta Sans',Inter,Arial,sans-serif;color:#0F172A">New EPC booking request</h2>
<table cellpadding="8" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:560px">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="background:#F8FAFC;border:1px solid #E2E8F0;font-weight:600;width:32%">${escapeHtml(k)}</td><td style="border:1px solid #E2E8F0">${escapeHtml(v).replace(/\n/g, '<br>')}</td></tr>`,
  )
  .join('')}
</table>
<p style="margin-top:16px;font-size:12px;color:#64748B">Submitted via epc.luminousanddeliver.co.uk</p>
</body></html>`

  return { text, html }
}

/**
 * Branded confirmation email sent to the customer after they submit the form.
 * Table-based, fully inlined styles — the only layout approach that renders
 * consistently across Gmail, Outlook, Apple Mail, and mobile clients.
 */
function buildConfirmation(data: ParsedInput) {
  const firstName = data.name.trim().split(/\s+/)[0] || 'there'
  const estimate = guideEstimate(data)
  const isBulkEnquiry = estimate.productKind === 'bulk'

  // Bulk has no single property and no agreed turnaround yet; an unlodged
  // product has no lodgement to expedite. Both read off productKind so a new
  // product cannot silently inherit the wrong line.
  const summary: Array<[string, string]> = [['Service', data.services.join(' + ')]]

  if (isBulkEnquiry) {
    summary.push(['Properties', data.propertyCount || 'To be confirmed'])
    if (data.address) summary.push(['Addresses supplied', data.address])
    summary.push(['Turnaround', 'Agreed per property once quoted'])
  } else {
    summary.push([
      'Property',
      `${data.propertyType} — ${data.address}, ${data.postcode}`,
    ])
    summary.push(['Turnaround', estimate.isLodged ? data.speed : 'Within 72 hours of the visit'])
  }

  if (estimate.planIncluded) {
    summary.push(['Included', 'Energy Report + written Improvement Plan'])
  } else if (estimate.improvementPlan > 0) {
    summary.push(['Add-on', `Improvement Plan (+£${site.addOns.improvementPlan})`])
  }
  if (data.preferredDate) summary.push(['Preferred date', data.preferredDate])

  const text =
    `Hi ${firstName},\n\n` +
    `Thanks for your booking request with L&D Energy — we've received it and will be in touch during our opening hours (Mon–Sun, 8am–8pm) to confirm your appointment slot and exact price.\n\n` +
    `Your request:\n` +
    summary.map(([k, v]) => `  ${k}: ${v}`).join('\n') +
    `\n\nNeed us sooner? Call or text ${PHONE}, or message us on WhatsApp.\n\n` +
    `L&D Energy — Elmhurst-accredited Domestic Energy Assessor\n` +
    `Covering all 32 London boroughs · ${SITE_URL}\n\n` +
    `This is a confirmation that we received your enquiry — it is not a confirmed booking until we reply.`

  const summaryRows = summary
    .map(
      ([k, v], i) =>
        `<tr>
          <td style="padding:12px 16px;${i > 0 ? `border-top:1px solid ${LINE};` : ''}font-size:12px;font-weight:600;color:${MUTED};text-transform:uppercase;letter-spacing:.04em;white-space:nowrap;vertical-align:top">${escapeHtml(k)}</td>
          <td style="padding:12px 16px;${i > 0 ? `border-top:1px solid ${LINE};` : ''}font-size:14px;color:${INK};font-weight:600">${escapeHtml(v)}</td>
        </tr>`,
    )
    .join('')

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>We've received your request</title></head>
<body style="margin:0;padding:0;background:${CANVAS};-webkit-text-size-adjust:100%">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">We've received your EPC request — we'll confirm your slot and exact price shortly.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CANVAS}">
    <tr><td align="center" style="padding:28px 12px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">

        <!-- Logo -->
        <tr><td align="center" style="padding:8px 0 22px">
          <img src="${LOGO_URL}" width="200" alt="L&amp;D Energy" style="display:block;border:0;width:200px;max-width:60%;height:auto">
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#ffffff;border:1px solid ${LINE};border-radius:16px;overflow:hidden">

          <!-- Header band -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="background:${NAVY};padding:30px 32px" align="center">
              <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                <td style="width:44px;height:44px;background:${SAGE};border-radius:999px;text-align:center;vertical-align:middle;font-size:24px;line-height:44px;color:#ffffff;font-weight:700">&#10003;</td>
              </tr></table>
              <h1 style="margin:16px 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.25;color:#ffffff;font-weight:700">Request received</h1>
              <p style="margin:0;font-size:14px;color:#C4D2E8">We'll confirm your slot and exact price</p>
            </td></tr>
          </table>

          <!-- Body -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:30px 32px 8px">
              <p style="margin:0 0 14px;font-size:16px;color:${INK}">Hi ${escapeHtml(firstName)},</p>
              <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:${INK}">
                Thanks for choosing <strong style="color:${NAVY}">L&amp;D Energy</strong>. We've received your booking request and one of our team will be in touch during our opening hours (Monday–Sunday, 8am–8pm) to confirm your appointment and exact price.
              </p>

              <!-- Summary -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${LINE};border-radius:12px;overflow:hidden;margin:0 0 24px">
                <tr><td style="background:#F8FAFC;padding:10px 16px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${SAGE};border-bottom:1px solid ${LINE}">Your request</td></tr>
                <tr><td style="padding:0">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${summaryRows}</table>
                </td></tr>
              </table>

              <!-- CTA row -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 6px">
                <tr>
                  <td style="border-radius:10px;background:${SAGE}">
                    <a href="${PHONE_HREF}" style="display:inline-block;padding:12px 22px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none">&#128222;&nbsp; Call ${PHONE}</a>
                  </td>
                  <td style="width:10px">&nbsp;</td>
                  <td style="border-radius:10px;border:1px solid ${LINE}">
                    <a href="${WHATSAPP_HREF}" style="display:inline-block;padding:12px 22px;font-size:14px;font-weight:700;color:${NAVY};text-decoration:none">WhatsApp us</a>
                  </td>
                </tr>
              </table>
              <p style="margin:14px 0 4px;font-size:13px;line-height:1.6;color:${MUTED}">
                Need us sooner, or want to change something? Just reply to this email or call the number above.
              </p>
            </td></tr>
          </table>

          <!-- Footer -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="background:${NAVY_DEEP};padding:22px 32px">
              <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#ffffff">L&amp;D Energy</p>
              <p style="margin:0 0 2px;font-size:12px;line-height:1.6;color:#9BB2D4">Elmhurst-accredited Domestic Energy Assessor · Stratford, East London</p>
              <p style="margin:0;font-size:12px;line-height:1.6;color:#9BB2D4">Covering all 32 London boroughs · <a href="${SITE_URL}" style="color:#95BFAD;text-decoration:none">epc.luminousanddeliver.co.uk</a></p>
            </td></tr>
          </table>

        </td></tr>

        <!-- Legal note -->
        <tr><td style="padding:18px 20px 4px" align="center">
          <p style="margin:0;font-size:11px;line-height:1.5;color:${MUTED}">
            This confirms we received your enquiry — it isn't a confirmed booking until we reply.
            You're receiving this because you submitted a request at epc.luminousanddeliver.co.uk.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`

  return { text, html }
}

const MAX_BODY_BYTES = 10_000
const ALLOWED_ORIGINS = [
  'https://epc.luminousanddeliver.co.uk',
  'http://localhost:3000',
]

export async function POST(req: Request) {
  // Reject cross-site submissions; browsers always send Origin on POST.
  const origin = req.headers.get('origin')
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let payload: unknown
  try {
    const raw = await req.text()
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 })
    }
    payload = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = contactSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 400 },
    )
  }

  // Honeypot triggered — accept silently to avoid signalling bots.
  if (parsed.data.website && parsed.data.website.length > 0) {
    return NextResponse.json({ ok: true })
  }

  // On Cloudflare Pages, runtime secrets are in the Worker env bindings, not process.env
  let cfEnv: Record<string, string> = {}
  try {
    cfEnv = getRequestContext().env as Record<string, string>
  } catch {
    // fallback to process.env when running locally
  }

  const turnstileSecret = cfEnv.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY
  if (!turnstileSecret && process.env.NODE_ENV === 'production') {
    // A missing production secret must never turn bot protection into a no-op.
    // Return a temporary failure so the visitor can use the phone/WhatsApp
    // fallback while the deployment configuration is repaired.
    console.error('[contact] TURNSTILE_SECRET_KEY is not configured in production.')
    return NextResponse.json(
      { error: 'Booking requests are temporarily unavailable. Please call or WhatsApp us instead.' },
      { status: 503 },
    )
  }

  if (turnstileSecret) {
    const clientIP = req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() || ''
    const verified = await verifyTurnstile(parsed.data.turnstileToken, turnstileSecret, clientIP)
    if (!verified) {
      return NextResponse.json(
        { error: 'Security verification failed. Please refresh and try again.' },
        { status: 400 },
      )
    }
  } else {
    console.warn('[contact] TURNSTILE_SECRET_KEY not set — verification skipped in local development only.')
  }

  const data: ParsedInput = {
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email,
    address: parsed.data.address,
    postcode: parsed.data.postcode,
    propertyType: parsed.data.propertyType,
    propertyCount: parsed.data.propertyCount || undefined,
    customerType: parsed.data.customerType,
    services: parsed.data.services,
    improvementPlan: parsed.data.improvementPlan,
    speed: parsed.data.speed,
    preferredDate: parsed.data.preferredDate || undefined,
    notes: parsed.data.notes || undefined,
  }

  const { text, html } = buildEmail(data)
  const subject = `EPC booking: ${data.name} — ${data.propertyType} (${data.postcode})`
  const confirmation = buildConfirmation(data)

  const apiKey = cfEnv.RESEND_API_KEY || process.env.RESEND_API_KEY
  const configuredFrom = cfEnv.RESEND_FROM || process.env.RESEND_FROM || FROM_DEFAULT
  // Guard against a stale RESEND_FROM env var still pointing at the
  // unverified epc. subdomain — Resend 403s those.
  const from = configuredFrom.replace('@epc.luminousanddeliver.co.uk', '@luminousanddeliver.co.uk')
  const to = cfEnv.RESEND_TO || process.env.RESEND_TO || NOTIFY_TO

  if (!apiKey) {
    // No email means the enquiry has not been captured. Never show success
    // or put the customer's personal details into application logs.
    console.error('[contact] RESEND_API_KEY is not configured.')
    return NextResponse.json(
      { error: 'Booking requests are temporarily unavailable. Please call or WhatsApp us instead.' },
      { status: 503 },
    )
  }

  const sendEmail = (body: Record<string, unknown>) =>
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

  // 1) Internal notification — the critical path. If this fails, the booking
  //    is effectively lost, so surface an error to the customer.
  try {
    const res = await sendEmail({
      from,
      to,
      reply_to: data.email,
      subject,
      text,
      html,
    })

    if (!res.ok) {
      const body = await res.text()
      console.error('[contact] Resend error', res.status, body)
      return NextResponse.json(
        { error: 'We could not send your booking right now. Please call us on 07492 575 396.' },
        { status: 502 },
      )
    }
  } catch (err) {
    console.error('[contact] Resend fetch failed', err)
    return NextResponse.json(
      { error: 'Network error — please try again or call us on 07492 575 396.' },
      { status: 502 },
    )
  }

  // 2) Customer confirmation — best-effort. The lead is already captured, so a
  //    failure here must not fail the request; just log it.
  try {
    const res = await sendEmail({
      from,
      to: data.email,
      reply_to: to,
      subject: 'We’ve received your EPC request — L&D Energy',
      text: confirmation.text,
      html: confirmation.html,
    })
    if (!res.ok) {
      console.error('[contact] confirmation email failed', res.status, await res.text())
    }
  } catch (err) {
    console.error('[contact] confirmation email fetch failed', err)
  }

  return NextResponse.json({ ok: true, delivered: true })
}
