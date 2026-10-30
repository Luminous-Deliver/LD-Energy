import { NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { CONFIRMATION_SUBJECT, deliveryState, fetchResendEmail, resendTime, RESEND_ID_RE, type BounceStore } from '@/lib/email-delivery'

export const runtime = 'edge'

// The thank-you screen asks for a couple of minutes; nothing older is ever answered.
const MAX_AGE_MS = 30 * 60 * 1000

/**
 * GET /api/contact/delivery?id=<resend id>: whether the customer's copy bounced, was delivered or is still on its way.
 * Answers with that one word only: never the address, the subject or anything else in the account.
 *
 * Production's Resend key is sending-only, so the answer comes from the bounce the webhook recorded (KV BOUNCES); with
 * a key that can read (local runs), Resend's own status is used as well.
 */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id') || ''
  const headers = { 'Cache-Control': 'no-store' }
  if (!RESEND_ID_RE.test(id)) return NextResponse.json({ error: 'Not found' }, { status: 404, headers })
  let cfEnv: Record<string, unknown> = {}
  try { cfEnv = getRequestContext().env as unknown as Record<string, unknown> } catch { /* process.env when running locally */ }

  const store = cfEnv.BOUNCES as BounceStore | undefined
  try {
    if (store && (await store.get(id)) === 'bounced') return NextResponse.json({ state: 'bounced' }, { headers })
  } catch { /* storage hiccup: fall through */ }

  const apiKey = (cfEnv.RESEND_API_KEY as string | undefined) || process.env.RESEND_API_KEY
  const email = apiKey ? await fetchResendEmail(id, apiKey) : null
  if (email) {
    if (email.subject !== CONFIRMATION_SUBJECT || !(Date.now() - resendTime(email.created_at) < MAX_AGE_MS)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404, headers })
    }
    return NextResponse.json({ state: deliveryState(email.last_event) }, { headers })
  }
  // cannot read the email back: no recorded bounce yet means still waiting
  return NextResponse.json({ state: 'pending' }, { headers })
}
