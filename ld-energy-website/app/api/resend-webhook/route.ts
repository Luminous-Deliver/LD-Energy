import { NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { BOUNCE_TTL_SECONDS, CONFIRMATION_SUBJECT, fetchResendEmail, referenceIn, RESEND_ID_RE, type BounceStore } from '@/lib/email-delivery'

export const runtime = 'edge'

// Resend delivery events only — this endpoint gives epc visibility into
// bounces/complaints it currently has none of (unlike the digital site's
// webhook, which already subscribes to the same three). Configure the
// Resend dashboard webhook to send exactly these events here.
const RELEVANT_EVENTS = new Set(['email.delivered', 'email.bounced', 'email.complained'])

const MAX_BODY_BYTES = 50_000
// Svix's own recommended window — rejects both stale replays and
// clock-skewed/forged future timestamps.
const TIMESTAMP_TOLERANCE_SECONDS = 300

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

/**
 * Verifies a Svix-format webhook signature (the scheme Resend uses).
 * Secret is "whsec_<base64>"; signed content is "<id>.<timestamp>.<body>";
 * svix-signature may carry multiple space-separated "v1,<base64-hmac>" values.
 * Comparison is constant-time to avoid leaking the valid signature byte-by-byte.
 */
async function verifySignature(
  body: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  secret: string,
): Promise<boolean> {
  const secretBytes = Uint8Array.from(atob(secret.replace(/^whsec_/, '')), (c) => c.charCodeAt(0))
  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signedContent = `${svixId}.${svixTimestamp}.${body}`
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedContent))
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)))

  return svixSignature
    .split(' ')
    .map((part) => part.split(',')[1])
    .filter(Boolean)
    .some((candidate) => constantTimeEqual(candidate, expected))
}

const NOTIFY_TO = 'contact@luminousanddeliver.co.uk'
const FROM_DEFAULT = 'L&D Energy <bookings@luminousanddeliver.co.uk>'
const BOUNCE_SUBJECT = 'Bounced:'

/**
 * Abdul 29/10/2026: a mistyped address means the customer never hears back. Every bounce (the form's copy, a quote,
 * an invoice) is forwarded to the business inbox with the reference, so he can phone or WhatsApp instead. The address
 * goes only into that email, never into the logs. An alert that itself bounces is not alerted again.
 */
/** What Resend puts in the bounce event itself: enough for the alert without reading the email back. */
type BouncePayload = { email_id?: string; to?: string[] | string; subject?: string; tags?: Record<string, string> | Array<{ name: string; value: string }>; bounce?: { message?: string } }

function tagValue(tags: BouncePayload['tags'], name: string): string | undefined {
  if (Array.isArray(tags)) return tags.find((t) => t?.name === name)?.value
  return tags?.[name]
}

async function alertBounce(data: BouncePayload & { email_id: string }, svixId: string, cfEnv: Record<string, string>): Promise<boolean> {
  const apiKey = cfEnv.RESEND_API_KEY || process.env.RESEND_API_KEY
  if (!apiKey) return false
  // The site's key may be sending-only (it is in production, 29/10/2026), so reading the email back is a bonus, never
  // a requirement: the event already carries the address and subject, and the form tags its copy with the reference.
  const email = data.to && data.subject ? null : await fetchResendEmail(data.email_id, apiKey)
  const subject = data.subject ?? email?.subject
  if (subject?.startsWith(BOUNCE_SUBJECT)) return true
  const emailId = data.email_id
  const reason = data.bounce?.message
  const to = [data.to ?? email?.to ?? []].flat().join(', ') || 'unknown address'
  const reference = tagValue(data.tags, 'reference') ?? referenceIn(email?.text)
  const what = subject === CONFIRMATION_SUBJECT ? 'the form’s automatic copy' : `“${subject ?? 'an email'}”`
  const text = [
    `${what} to ${to} bounced${reason ? `: ${reason}` : '.'}`,
    '',
    'The address is probably mistyped or no longer used, so they will not get email from us.',
    reference ? `Find their phone number in the booking email: search the inbox for ${reference}.` : 'Find their phone number in the booking or thread, then call or WhatsApp them.',
    '',
    `Resend id: ${emailId}`,
  ].join('\n')
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `bounce-${svixId}` },
      body: JSON.stringify({
        from: (cfEnv.RESEND_FROM || process.env.RESEND_FROM || FROM_DEFAULT).replace('@epc.luminousanddeliver.co.uk', '@luminousanddeliver.co.uk'),
        to: cfEnv.RESEND_TO || process.env.RESEND_TO || NOTIFY_TO,
        subject: `${BOUNCE_SUBJECT} ${reference ?? 'email'} to ${to} did not deliver`,
        text,
      }),
    })
    if (!res.ok) console.error('[resend-webhook] bounce alert failed', res.status)
    return res.ok
  } catch (err) {
    console.error('[resend-webhook] bounce alert fetch failed', err)
    return false
  }
}

export async function POST(req: Request) {
  let cfEnv: Record<string, string> = {}
  try {
    cfEnv = getRequestContext().env as unknown as Record<string, string>
  } catch {
    // fallback to process.env when running locally
  }

  const secret = cfEnv.RESEND_WEBHOOK_SECRET || process.env.RESEND_WEBHOOK_SECRET
  if (!secret) {
    // Fail closed — without a secret we cannot tell a real Resend event
    // from anyone who POSTs to this URL, so we don't trust the body at all.
    console.error('[resend-webhook] RESEND_WEBHOOK_SECRET not set — rejecting.')
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  // Reject oversized requests off the declared length before buffering the
  // body — the read-after-buffer check below is a fallback only (a chunked
  // request can omit Content-Length), not the primary bound.
  const contentLength = Number(req.headers.get('content-length') ?? '0')
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Request too large' }, { status: 413 })
  }

  const svixId = req.headers.get('svix-id')
  const svixTimestamp = req.headers.get('svix-timestamp')
  const svixSignature = req.headers.get('svix-signature')
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing signature headers' }, { status: 400 })
  }

  const timestampSeconds = Number(svixTimestamp)
  const nowSeconds = Math.floor(Date.now() / 1000)
  if (!Number.isFinite(timestampSeconds) || Math.abs(nowSeconds - timestampSeconds) > TIMESTAMP_TOLERANCE_SECONDS) {
    // Outside tolerance — either a replayed old event or a forged timestamp.
    console.error('[resend-webhook] timestamp outside tolerance, rejecting')
    return NextResponse.json({ error: 'Timestamp outside tolerance' }, { status: 400 })
  }

  const raw = await req.text()
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Request too large' }, { status: 413 })
  }

  const valid = await verifySignature(raw, svixId, svixTimestamp, svixSignature, secret)
  if (!valid) {
    console.error('[resend-webhook] signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: { type?: string; data?: BouncePayload }
  try {
    event = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (event.type && RELEVANT_EVENTS.has(event.type)) {
    // Log only, by design — no alert channel wired up yet. If bounce/complaint
    // volume becomes something worth acting on, promote this to a real alert.
    // email_id only, never the recipient address — that's customer PII and
    // the Resend dashboard already has it keyed on the same id if needed.
    const level = event.type === 'email.delivered' ? 'log' : 'warn'
    console[level](`[resend-webhook] ${event.type} — email_id=${event.data?.email_id ?? 'unknown'}`)
  }

  if (event.type === 'email.bounced' && event.data?.email_id) {
    // the thank-you screen reads this to tell the customer while they are still on the page (app/api/contact/delivery)
    const store = (cfEnv as unknown as { BOUNCES?: BounceStore }).BOUNCES
    if (store && RESEND_ID_RE.test(event.data.email_id)) {
      try { await store.put(event.data.email_id, 'bounced', { expirationTtl: BOUNCE_TTL_SECONDS }) } catch (err) { console.error('[resend-webhook] bounce record failed', err) }
    }
    const alerted = await alertBounce({ ...event.data, email_id: event.data.email_id }, svixId, cfEnv)
    // a failed alert returns 500 so Resend retries; the idempotency key stops a second copy once one has gone
    if (!alerted) return NextResponse.json({ error: 'Alert not sent' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
