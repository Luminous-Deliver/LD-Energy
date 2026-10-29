import { NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { CONFIRMATION_SUBJECT, deliveryState, fetchResendEmail, resendTime } from '@/lib/email-delivery'

export const runtime = 'edge'

// The thank-you screen asks for a minute or so; nothing older is ever answered.
const MAX_AGE_MS = 30 * 60 * 1000

/**
 * GET /api/contact/delivery?id=<resend id>: whether the customer's copy was delivered, bounced or is still on its way.
 * Answers only for a form confirmation sent in the last 30 minutes, and only with that one word: never the address,
 * the subject or any other email in the account.
 */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id') || ''
  let cfEnv: Record<string, string> = {}
  try { cfEnv = getRequestContext().env as Record<string, string> } catch { /* process.env when running locally */ }
  const apiKey = cfEnv.RESEND_API_KEY || process.env.RESEND_API_KEY
  const headers = { 'Cache-Control': 'no-store' }
  if (!apiKey) return NextResponse.json({ state: 'pending' }, { headers })

  const email = await fetchResendEmail(id, apiKey)
  const sent = resendTime(email?.created_at)
  if (!email || email.subject !== CONFIRMATION_SUBJECT || !(Date.now() - sent < MAX_AGE_MS)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404, headers })
  }
  return NextResponse.json({ state: deliveryState(email.last_event) }, { headers })
}
