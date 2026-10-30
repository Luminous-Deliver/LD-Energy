import { NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { contactSchema, enquirySchema } from '@/lib/validators'
import { areaLabel, legacyArea } from '@/lib/floor-area'
import { boroughMeta } from '@/lib/boroughs'
import { bookingReference, buildBusinessEmail, buildCustomerEmail, buildEnquiryEmail, type BookingEmailInput } from '@/lib/booking-emails'
import { checkPostcode } from '@/lib/postcode-check'
import { emailDomainCanReceive, EMAIL_UNREACHABLE_MESSAGE } from '@/lib/email-check'
import { CONFIRMATION_SUBJECT } from '@/lib/email-delivery'
import { deviceLabel } from '@/lib/device'

export const runtime = 'edge'

const NOTIFY_TO = 'contact@luminousanddeliver.co.uk'
// Resend has only the root domain verified — sending from the epc.
// subdomain is rejected with 403 "domain is not verified".
const FROM_DEFAULT = 'L&D Energy <bookings@luminousanddeliver.co.uk>'
/** Checked before Turnstile, so the visitor's security tick survives fixing a typo. */
const emailRefused = () => NextResponse.json({ error: EMAIL_UNREACHABLE_MESSAGE, code: 'email' }, { status: 400 })

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

/**
 * A general enquiry from /contact: the same checks as a quote request (size, origin, schema, honeypot, Turnstile) and
 * the same Resend sender, but its own subject, prefixed with the enquiry type. Never "EPC booking:", which the
 * booking follow-up scripts match on.
 */
async function handleEnquiry(req: Request, payload: unknown) {
  const parsed = enquirySchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.flatten() }, { status: 400 })
  }
  if (parsed.data.website) return NextResponse.json({ ok: true })
  if (!(await emailDomainCanReceive(parsed.data.email))) return emailRefused()

  let cfEnv: Record<string, string> = {}
  try { cfEnv = getRequestContext().env as Record<string, string> } catch { /* process.env when running locally */ }

  const turnstileSecret = cfEnv.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY
  if (!turnstileSecret && process.env.NODE_ENV === 'production') {
    console.error('[contact] TURNSTILE_SECRET_KEY is not configured in production.')
    return NextResponse.json({ error: 'Messages are temporarily unavailable. Please call or WhatsApp us instead.' }, { status: 503 })
  }
  if (turnstileSecret) {
    const clientIP = req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() || ''
    if (!(await verifyTurnstile(parsed.data.turnstileToken, turnstileSecret, clientIP))) {
      return NextResponse.json({ error: 'Security verification failed. Please refresh and try again.', code: 'security' }, { status: 400 })
    }
  }

  const apiKey = cfEnv.RESEND_API_KEY || process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY is not configured.')
    return NextResponse.json({ error: 'Messages are temporarily unavailable. Please call or WhatsApp us instead.' }, { status: 503 })
  }
  const from = (cfEnv.RESEND_FROM || process.env.RESEND_FROM || FROM_DEFAULT).replace('@epc.luminousanddeliver.co.uk', '@luminousanddeliver.co.uk')
  const to = cfEnv.RESEND_TO || process.env.RESEND_TO || NOTIFY_TO
  const { text, html } = buildEnquiryEmail(parsed.data, { received: new Date(), turnstilePassed: !!turnstileSecret })
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, reply_to: parsed.data.email, subject: `${parsed.data.enquiryType}: website enquiry from ${parsed.data.name}`, text, html }),
    })
    if (!res.ok) {
      console.error('[contact] Resend error (enquiry)', res.status, await res.text())
      return NextResponse.json({ error: 'We could not send your message right now. Please call us on 07492 575 396.' }, { status: 502 })
    }
  } catch (err) {
    console.error('[contact] Resend fetch failed (enquiry)', err)
    return NextResponse.json({ error: 'Network error. Please try again or call us on 07492 575 396.' }, { status: 502 })
  }
  return NextResponse.json({ ok: true, delivered: true })
}

const MAX_BODY_BYTES = 10_000
const ALLOWED_ORIGINS = [
  'https://epc.luminousanddeliver.co.uk',
  // Production alias of the same deployment and secrets. Visitors who land on it
  // would otherwise fill in the whole form and then be refused at the last step.
  'https://epc-euc.pages.dev',
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

  // a general enquiry from /contact carries kind: 'enquiry'; everything else is a quote request
  if (typeof payload === 'object' && payload !== null && (payload as { kind?: unknown }).kind === 'enquiry') {
    return handleEnquiry(req, payload)
  }

  const parsed = contactSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 400 },
    )
  }

  // This server-owned list is also the source of all 34 area landing pages.
  // Do not import its full local content into client-side validation or trust URL text.
  if (parsed.data.areaPage !== undefined && !Object.hasOwn(boroughMeta, parsed.data.areaPage)) {
    return NextResponse.json({ error: 'Invalid area page' }, { status: 400 })
  }

  // Honeypot triggered — accept silently to avoid signalling bots.
  if (parsed.data.website && parsed.data.website.length > 0) {
    return NextResponse.json({ ok: true })
  }

  // a quote that can never reach them is a lost lead: refuse a domain DNS says takes no mail (lib/email-check.ts)
  if (!(await emailDomainCanReceive(parsed.data.email))) return emailRefused()

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
      { error: 'Quote requests are temporarily unavailable. Please call or WhatsApp us instead.' },
      { status: 503 },
    )
  }

  if (turnstileSecret) {
    const clientIP = req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() || ''
    const verified = await verifyTurnstile(parsed.data.turnstileToken, turnstileSecret, clientIP)
    if (!verified) {
      // `code` lets the form reset the widget and say so, instead of parsing this sentence.
      return NextResponse.json(
        { error: 'Security verification failed. Please refresh and try again.', code: 'security' },
        { status: 400 },
      )
    }
  } else {
    console.warn('[contact] TURNSTILE_SECRET_KEY not set — verification skipped in local development only.')
  }

  const data: BookingEmailInput = {
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email,
    address: parsed.data.address,
    postcode: parsed.data.postcode,
    propertyType: parsed.data.propertyType,
    dwellingType: parsed.data.services.includes('Bulk / Agency Enquiry') ? undefined : parsed.data.dwellingType || undefined,
    areaBand: parsed.data.areaBand || legacyArea(parsed.data.propertyType),
    floorArea: parsed.data.services.includes('Bulk / Agency Enquiry') ? undefined : parsed.data.floorArea || undefined,
    floorAreaUnknown: parsed.data.floorAreaUnknown,
    energyReport: parsed.data.energyReport,
    areaPage: parsed.data.areaPage,
    sourcePage: parsed.data.sourcePage,
    ctaId: parsed.data.ctaId,
    referrerHost: parsed.data.referrerHost,
    landingPage: parsed.data.landingPage,
    sourceTag: parsed.data.sourceTag,
    foundVia: parsed.data.foundVia || undefined,
    propertyCount: parsed.data.propertyCount || undefined,
    customerType: parsed.data.customerType,
    services: parsed.data.services,
    improvementPlan: parsed.data.improvementPlan,
    speed: parsed.data.speed,
    preferredDate: parsed.data.preferredDate || undefined,
    notes: parsed.data.notes || undefined,
  }

  // one reference for both emails, so Abdul and the customer can quote the same thing
  const bulk = data.services.includes('Bulk / Agency Enquiry')
  const meta = {
    reference: bookingReference(),
    received: new Date(),
    turnstilePassed: !!turnstileSecret,
    device: deviceLabel(req.headers.get('user-agent')),
    // informs Abdul only: capped at 2.5 s and never fails the request (lib/postcode-check.ts)
    postcodeCheck: bulk || !data.postcode ? undefined : await checkPostcode(data.postcode),
  }
  const { text, html } = buildBusinessEmail(data, meta)
  // Bulk enquiries have no postcode; keep the "EPC booking:" prefix, booking-followup.py matches it.
  const subject = `EPC booking: ${data.name} — ${data.services.includes('Bulk / Agency Enquiry') ? 'Portfolio' : areaLabel(data.areaBand, data.floorArea)}${data.postcode ? ` (${data.postcode})` : ''}`
  const confirmation = buildCustomerEmail(data, meta)

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
      { error: 'Quote requests are temporarily unavailable. Please call or WhatsApp us instead.' },
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
        { error: 'We could not send your quote request right now. Please call us on 07492 575 396.' },
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
  //    failure here must not fail the request; just log it. The form only tells
  //    the customer a copy is on its way when this actually succeeded.
  let confirmationSent = false
  // the thank-you screen asks /api/contact/delivery whether this copy bounced (lib/email-delivery.ts)
  let confirmationId: string | undefined
  try {
    const res = await sendEmail({
      from,
      to: data.email,
      reply_to: to,
      // Keep this subject exact: scripts/resend-send.py, scripts/booking-followup.py and
      // the /quote-reply skill in the parent repo match on it to thread replies.
      subject: CONFIRMATION_SUBJECT,
      // the bounce alert reads the reference from here: the site's key cannot read an email back (app/api/resend-webhook)
      tags: [{ name: 'reference', value: meta.reference }],
      text: confirmation.text,
      html: confirmation.html,
    })
    confirmationSent = res.ok
    if (res.ok) confirmationId = ((await res.json().catch(() => ({}))) as { id?: string }).id
    if (!res.ok) {
      console.error('[contact] confirmation email failed', res.status, await res.text())
    }
  } catch (err) {
    console.error('[contact] confirmation email fetch failed', err)
  }

  return NextResponse.json({ ok: true, delivered: true, confirmationSent, confirmationId })
}
